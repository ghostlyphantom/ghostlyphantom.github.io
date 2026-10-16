(() => {
'use strict';
const D = window.CS_DATA, S = window.CS_STORE, C = D.CENTER;
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement, app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n, c = '') => `<svg class="ic ${c}" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${Object.entries(D.ICONS).map(([k, p]) => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</symbol>`).join('')}</defs></svg>`;
document.body.insertAdjacentHTML('afterbegin', sprite);
const badge = (k, key, label) => `<span class="badge badge-${k}-${key}">${esc(label)}</span>`;
const timeAgo = iso => { const d = (Date.now() - new Date(iso)) / 1000; if (d < 60) return 'just now'; if (d < 3600) return Math.floor(d / 60) + ' min ago'; if (d < 86400) return Math.floor(d / 3600) + ' h ago'; if (d < 604800) return Math.floor(d / 86400) + ' d ago'; return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
const fmt = iso => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const clean = (s, n) => String(s || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, n);
const nl2br = s => esc(s).replace(/\n/g, '<br>');
const go = p => { location.hash = '#/' + p; };
const osm = (la, ln, z = 19) => `https://www.openstreetmap.org/?mlat=${la}&mlon=${ln}#map=${z}/${la}/${ln}`;
let cleanup = null, pending = { photo: undefined };

function toast(msg, type = 'success') {
  const box = $('.toasts'), t = document.createElement('div');
  t.className = 'toast toast-' + type; t.setAttribute('role', 'status'); t.textContent = msg; box.appendChild(t);
  setTimeout(() => t.classList.add('is-out'), 4500); setTimeout(() => t.remove(), 5200);
}
const busy = () => { const b = $('#loadbar'); b.classList.add('is-on'); setTimeout(() => b.classList.remove('is-on'), 450); };

/* ---------- images: validate, shrink and store as a data URL ---------- */
function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return reject(new Error('Upload a JPG, PNG or WebP image.'));
    if (file.size > 8 * 1024 * 1024) return reject(new Error('Choose a photo under 8 MB.'));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, 900 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url); resolve(cv.toDataURL('image/jpeg', .75));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not a valid image.')); };
    img.src = url;
  });
}
const safeImg = s => (typeof s === 'string' && s.startsWith('data:image/jpeg;base64,')) ? s : '';

/* ---------- auth screens ---------- */
function authView(mode) {
  document.body.className = 'auth-page'; document.title = (mode === 'login' ? 'Log in' : 'Create account') + ' | CampusSafe';
  const login = mode === 'login';
  const field = (label, icon, input) => `<label class="field"><span>${label}</span><div class="input">${ic(icon)}${input}</div></label>`;
  app.innerHTML = `
  <div class="auth-bg" aria-hidden="true"></div><div class="auth-overlay" aria-hidden="true"></div>
  <div class="auth-orbs" aria-hidden="true"><i></i><i></i><i></i></div>
  <button class="icon-btn auth-theme" type="button" data-act="theme" aria-label="Toggle light or dark mode">${ic('moon', 'ic-moon')}${ic('sun', 'ic-sun')}</button>
  <main class="auth-grid" id="main">
    <section class="auth-brand">
      <span class="beacon" aria-hidden="true"><i></i><i></i><b>${ic('shield')}</b></span>
      <h1>CampusSafe</h1><p class="lead">Emergency incident and response guide for ISUFST San Enrique Campus.</p>
      <ul class="points"><li>${ic('filePlus')} Report an incident in under a minute</li><li>${ic('exit')} Find the nearest evacuation area</li><li>${ic('phone')} Call the right contact with one tap</li></ul>
      <p class="fine">Sample data only. Contacts, locations and procedures need official school verification before real-world use.</p>
    </section>
    <section class="auth-card" aria-labelledby="t">
      <div class="tabs"><a class="tab ${login ? 'is-active' : ''}" href="#/login">Log in</a><a class="tab ${login ? '' : 'is-active'}" href="#/register">Create account</a></div>
      <h2 id="t">${login ? 'Log in to CampusSafe' : 'Create your account'}</h2>
      <div class="auth-err" id="authErr" role="alert" hidden></div>
      <form data-form="${mode}" novalidate>
        ${login ? '' : field('Full name', 'user', '<input name="name" autocomplete="name" required maxlength="100">')}
        ${field('Email', 'mail', '<input type="email" name="email" autocomplete="email" required maxlength="150">')}
        ${login ? '' : field('Role on campus', 'users', `<select name="role">${Object.entries(D.ROLES).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>`)}
        <label class="field"><span>Password</span><div class="input">${ic('lock')}<input type="password" name="pass" autocomplete="${login ? 'current-password' : 'new-password'}" required ${login ? '' : 'minlength="8" data-strength'}><button class="peek" type="button" data-act="peek" aria-label="Show password">${ic('eye')}</button></div>${login ? '' : '<div class="meter" aria-hidden="true"><i></i></div>'}</label>
        ${login ? '' : field('Confirm password', 'lock', '<input type="password" name="confirm" autocomplete="new-password" required>')}
        <button class="btn btn-primary btn-block" type="submit"><span class="btn-label">${login ? 'Log in' : 'Create account'}</span><span class="spinner" aria-hidden="true"></span></button>
      </form>
      <p class="switch">${login ? 'New to CampusSafe? <a href="#/register">Create an account</a>' : 'Already registered? <a href="#/login">Log in</a>'}</p>
    </section>
  </main>`;
}
const authErr = msgs => { const b = $('#authErr'); b.hidden = !msgs.length; b.innerHTML = msgs.length ? `<p class="form-error">${ic('alert')} ${msgs.map(esc).join('<br>')}</p>` : ''; };
async function submitAuth(form) {
  const f = new FormData(form), mode = form.dataset.form, btn = $('button[type=submit]', form), email = clean(f.get('email'), 150).toLowerCase(), pass = String(f.get('pass') || '');
  const errs = [];
  if (mode === 'register') {
    const name = clean(f.get('name'), 100), role = String(f.get('role'));
    if (name.length < 3 || !/^\p{L}[\p{L}\s.'-]+$/u.test(name)) errs.push('Enter your full name (letters only, at least 3 characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push('Enter a valid email address.');
    if (!D.ROLES[role]) errs.push('Choose your role on campus.');
    if (pass.length < 8 || !/[A-Za-z]/.test(pass) || !/\d/.test(pass)) errs.push('Use at least 8 characters with a letter and a number.');
    else if (pass.length > 72) errs.push('Use 72 characters or fewer.');
    if (pass !== String(f.get('confirm'))) errs.push('The passwords do not match.');
    authErr(errs); if (errs.length) return;
    btn.classList.add('is-loading'); btn.disabled = true;
    try { await S.auth.register({ name, email, role, pass }); toast('Your account is ready. Welcome to CampusSafe.'); go('dashboard'); }
    catch (e) { authErr([e.message]); } finally { btn.classList.remove('is-loading'); btn.disabled = false; }
  } else {
    if (!email || !pass) return authErr(['Enter your email and password.']);
    btn.classList.add('is-loading'); btn.disabled = true;
    try { await S.auth.login(email, pass); toast('Welcome back.'); go('dashboard'); }
    catch (e) { authErr([e.message]); } finally { btn.classList.remove('is-loading'); btn.disabled = false; }
  }
}

/* ---------- app shell ---------- */
const NAV = [['dashboard', 'Dashboard', 'grid'], ['map', 'Campus map', 'map'], ['report', 'Report incident', 'filePlus'], ['incidents', 'Incident history', 'clock'], ['guides', 'Emergency guides', 'book'], ['evacuation', 'Evacuation areas', 'exit'], ['contacts', 'Emergency contacts', 'phone'], ['notifications', 'Notifications', 'bell']];
function ensureShell(u) {
  document.body.className = 'app';
  if ($('#shell') && $('#shell').dataset.uid == u.id) return;
  app.innerHTML = `<a class="skip" href="#" data-act="skip">Skip to content</a>
  <div class="scrim" data-act="nav-close"></div>
  <aside class="sidebar" id="sidebar" aria-label="Main navigation">
    <a class="brand" href="#/dashboard"><span class="logo">${ic('shield')}</span><span class="label"><b>CampusSafe</b><small>ISUFST San Enrique</small></span></a>
    <nav>${NAV.map(([k, l, i]) => `<a class="nav-link" data-nav="${k}" href="#/${k}" title="${l}">${ic(i)}<span class="label">${l}</span>${k === 'notifications' ? '<span class="count" id="navCount" hidden></span>' : ''}</a>`).join('')}</nav>
    <div class="side-foot">
      <a class="sos" href="tel:911" title="Call 911">${ic('phone')}<span class="label">Call 911</span></a>
      <div class="who"><span class="avatar" aria-hidden="true">${esc(u.name[0].toUpperCase())}</span><span class="label"><b>${esc(u.name)}</b><small>${esc(D.ROLES[u.role])}</small></span></div>
      <button class="nav-link" type="button" data-act="logout" title="Log out">${ic('exit')}<span class="label">Log out</span></button>
      <button class="nav-link collapse-btn" type="button" data-act="collapse" aria-label="Collapse sidebar">${ic('panel')}<span class="label">Collapse</span></button>
    </div>
  </aside>
  <div class="shell" id="shell" data-uid="${u.id}">
    <header class="topbar">
      <button class="icon-btn menu-btn" type="button" data-act="nav-open" aria-label="Open navigation" aria-controls="sidebar">${ic('menu')}</button>
      <h1 class="page-title" id="pageTitle"></h1>
      <div class="top-actions">
        <a class="btn btn-sos btn-sm" href="tel:911" aria-label="Call 911 emergency hotline">${ic('phone')}<span class="hide-sm">911</span></a>
        <a class="icon-btn" id="bell" href="#/notifications" aria-label="Notifications">${ic('bell')}<span class="dot" hidden></span></a>
        <button class="icon-btn" type="button" data-act="theme" aria-label="Toggle light or dark mode">${ic('moon', 'ic-moon')}${ic('sun', 'ic-sun')}</button>
      </div>
    </header>
    <main id="main" tabindex="-1"></main>
  </div>`;
}
const VERIFY = `<p class="verify-note">${ic('info')} Sample data. Contacts, campus locations and procedures marked as samples or placeholders require official school verification before real-world use. Data is stored only in this browser.</p>`;
function show(v, u) {
  ensureShell(u); root.classList.remove('side-open');
  document.title = v.title + ' | CampusSafe'; $('#pageTitle').textContent = v.title;
  $$('[data-nav]').forEach(a => { const on = a.dataset.nav === v.active; a.classList.toggle('is-active', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  const n = S.notes.unread(u.id), cnt = $('#navCount'); cnt.hidden = !n; cnt.textContent = n; $('#bell .dot').hidden = !n;
  $('#bell').setAttribute('aria-label', 'Notifications' + (n ? ', ' + n + ' unread' : ''));
  const m = $('#main'); m.innerHTML = v.html + VERIFY; m.style.animation = 'none'; void m.offsetWidth; m.style.animation = '';
  scrollTo(0, 0); busy(); countUp(); if (v.after) v.after(u);
}
function countUp() {
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count || 0; if (reduce || !end) { el.textContent = end.toLocaleString(); return; }
    const t0 = performance.now(); const tick = t => { const p = Math.min(1, (t - t0) / 900); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString(); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  });
}
const note = (t = 'Sample data.', msg) => `<div class="notice">${ic('info')}<div><b>${t}</b> ${msg}</div></div>`;
const sos = (txt) => `<div class="alert-strip slim"><div><strong>${txt}</strong></div><a class="btn btn-light btn-sm" href="tel:911">${ic('phone')} Call 911</a></div>`;
const views = {};

/* ---------- dashboard ---------- */
views.dashboard = (p, q, u) => {
  const all = S.reports.all(), mine = all.filter(r => r.uid === u.id);
  const stats = [['My reports', mine.length, 'filePlus', '#/incidents?scope=mine'], ['Open on campus', all.filter(r => r.status !== 'resolved').length, 'alert', '#/incidents?status=reported'], ['Resolved', all.filter(r => r.status === 'resolved').length, 'check', '#/incidents?status=resolved'], ['Map markers', S.markers.all(u.id).length, 'pin', '#/map']];
  const cnt = {}; all.forEach(r => cnt[r.category] = (cnt[r.category] || 0) + 1);
  const cats = Object.entries(cnt).sort((a, b) => b[1] - a[1]), max = Math.max(1, ...cats.map(c => c[1]));
  const notes = S.notes.list(u.id).filter(n => n.unread).slice(0, 4);
  return { title: 'Dashboard', active: 'dashboard', html: `
  <section class="alert-strip" aria-label="Emergency hotline"><div><strong>In immediate danger?</strong> Call the national emergency hotline first, then report here.</div>
    <div class="strip-actions"><a class="btn btn-light" href="tel:911">${ic('phone')} Call 911</a><a class="btn btn-outline-light" href="#/contacts">All contacts</a></div></section>
  <h2 class="greet">Hello, ${esc(u.name.split(' ')[0])}.</h2>
  <div class="grid stats">${stats.map(([l, n, i, h]) => `<a class="card stat" href="${h}"><span class="stat-ic">${ic(i)}</span><span class="stat-n" data-count="${n}">0</span><span class="stat-l">${l}</span></a>`).join('')}</div>
  <div class="grid two">
    <section class="card" aria-labelledby="qa"><h2 id="qa">Quick actions</h2><div class="actions-grid">
      <a class="action" href="#/report">${ic('filePlus')}<b>Report an incident</b><small>Add details, location and a photo</small></a>
      <a class="action" href="#/map">${ic('map')}<b>Open campus map</b><small>Markers, exits and hazards</small></a>
      <a class="action" href="#/evacuation">${ic('exit')}<b>Evacuation areas</b><small>Where to go and how</small></a>
      <a class="action" href="#/guides">${ic('book')}<b>Emergency guides</b><small>What to do, step by step</small></a></div></section>
    <section class="card" aria-labelledby="cb"><h2 id="cb">Reports by category</h2>
      ${cats.length ? '' : '<p class="empty">No reports yet. <a href="#/report">File the first report.</a></p>'}
      <ul class="bars">${cats.map(([k, n]) => `<li><span class="bar-l">${ic(D.CATEGORIES[k][1])} ${esc(D.CATEGORIES[k][0])}</span><span class="bar"><i style="--w:${Math.round(n / max * 100)}%"></i></span><b>${n}</b></li>`).join('')}</ul></section>
  </div>
  <div class="grid two">
    <section class="card" aria-labelledby="ri"><div class="card-head"><h2 id="ri">Latest incidents</h2><a href="#/incidents">View all</a></div>
      ${all.length ? '' : '<p class="empty">Nothing reported yet.</p>'}
      <ul class="list">${all.slice(0, 6).map(r => `<li><a href="#/incident/${r.id}"><span class="li-ic">${ic(D.CATEGORIES[r.category][1])}</span><span class="li-main"><b>${esc(r.title)}</b><small>${esc(r.location)} &middot; ${timeAgo(r.created)}</small></span>${badge('sev', r.severity, D.SEVERITIES[r.severity])}</a></li>`).join('')}</ul></section>
    <section class="card" aria-labelledby="nn"><div class="card-head"><h2 id="nn">Unread notifications</h2><a href="#/notifications">View all</a></div>
      ${notes.length ? '' : '<p class="empty">You are all caught up.</p>'}
      <ul class="list">${notes.map(n => `<li class="note note-${n.level}"><div><span class="li-ic">${ic(n.level === 'urgent' ? 'alert' : 'bell')}</span><span class="li-main"><b>${esc(n.title)}</b><small>${esc(n.message)}</small></span></div></li>`).join('')}</ul></section>
  </div>` };
};

/* ---------- report form ---------- */
views.report = (p, q, u) => {
  const id = p[1], row = id ? S.reports.get(id) : null;
  if (id && (!row || row.uid !== u.id || row.status !== 'reported')) { toast('You can only edit your own reports that have not been reviewed.', 'error'); go('incidents?scope=mine'); return { title: 'Report incident', active: 'report', html: '' }; }
  const v = row || { title: '', category: 'other', severity: 'medium', description: '', location: '', lat: '', lng: '', photo: '' };
  pending = { photo: undefined };
  return { title: row ? 'Edit report' : 'Report incident', active: 'report', html: `
  ${sos('Is someone in danger right now? Call 911 before filling in this form.')}
  <div id="formErr" hidden></div>
  <form class="card form-card" data-form="report" data-id="${row ? row.id : ''}" novalidate>
    <div class="form-grid">
      <label class="field span2"><span>Title</span><input name="title" value="${esc(v.title)}" maxlength="120" required placeholder="Short summary, e.g. Smoke near the laboratory"></label>
      <label class="field"><span>Category</span><select name="category">${Object.entries(D.CATEGORIES).map(([k, [l]]) => `<option value="${k}" ${v.category === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
      <fieldset class="field"><legend>Severity</legend><div class="seg">${Object.entries(D.SEVERITIES).map(([k, l]) => `<label class="seg-opt sev-${k}"><input type="radio" name="severity" value="${k}" ${v.severity === k ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></fieldset>
      <label class="field span2"><span>What happened</span><textarea name="description" rows="5" maxlength="2000" required data-counter placeholder="Describe what you saw, who is affected and what has been done so far.">${esc(v.description)}</textarea><small class="hint"><span data-count-out>0</span>/2000</small></label>
      <label class="field span2"><span>Where did it happen</span><input name="location" value="${esc(v.location)}" maxlength="120" required placeholder="Building, room or landmark"></label>
      <div class="field span2"><span>Pin the exact spot (optional)</span><div class="picker"><div id="pickmap" role="application" aria-label="Map to choose the incident location"></div>
        <div class="picker-side"><button type="button" class="btn btn-ghost btn-sm" id="locateBtn">${ic('locate')} Use my location</button><button type="button" class="btn btn-ghost btn-sm" id="clearPin">${ic('x')} Clear pin</button>
          <label class="field"><span>Latitude</span><input name="lat" id="lat" value="${esc(v.lat)}" readonly></label><label class="field"><span>Longitude</span><input name="lng" id="lng" value="${esc(v.lng)}" readonly></label>
          <small class="hint">Tap the map to place the pin. You can drag it to adjust.</small></div></div></div>
      <div class="field span2"><span>Photo (optional, JPG, PNG or WebP)</span>
        <label class="drop" for="photo">${ic('image')}<b>Choose a photo</b><small id="fileName">No file selected</small><input id="photo" type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
        <img id="preview" class="preview" alt="Selected photo preview" ${safeImg(v.photo) ? `src="${safeImg(v.photo)}"` : 'hidden'}>
        ${row && row.photo ? '<label class="check"><input type="checkbox" name="remove_photo" value="1"> Remove current photo</label>' : ''}</div>
    </div>
    <div class="form-actions"><a class="btn btn-ghost" href="${row ? '#/incident/' + row.id : '#/dashboard'}">Cancel</a><button class="btn btn-primary" type="submit"><span class="btn-label">${row ? 'Save changes' : 'Submit report'}</span><span class="spinner" aria-hidden="true"></span></button></div>
  </form>`, after: () => initPicker() };
};
async function submitReport(form, u) {
  const f = new FormData(form), id = form.dataset.id, old = id ? S.reports.get(id) : null, errs = [];
  const r = { title: clean(f.get('title'), 120), category: String(f.get('category')), severity: String(f.get('severity')), description: clean(f.get('description'), 2000), location: clean(f.get('location'), 120) };
  const lat = f.get('lat') === '' ? null : +f.get('lat'), lng = f.get('lng') === '' ? null : +f.get('lng');
  if (r.title.length < 5) errs.push('Give the incident a title of at least 5 characters.');
  if (!D.CATEGORIES[r.category]) errs.push('Choose a category.'); if (!D.SEVERITIES[r.severity]) errs.push('Choose a severity.');
  if (r.description.length < 10) errs.push('Describe what happened in at least 10 characters.');
  if (r.location.length < 2) errs.push('Enter where it happened.');
  if ((lat === null) !== (lng === null) || (lat !== null && (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180))) errs.push('Pick a point on the map or clear both coordinates.');
  const box = $('#formErr'); box.hidden = !errs.length; box.innerHTML = errs.length ? `<div class="form-error" role="alert">${ic('alert')}<ul>${errs.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : '';
  if (errs.length) return scrollTo(0, 0);
  r.lat = lat === null ? null : +lat.toFixed(6); r.lng = lng === null ? null : +lng.toFixed(6);
  r.photo = pending.photo !== undefined ? pending.photo : (old ? old.photo : '');
  if (old && f.get('remove_photo') && pending.photo === undefined) r.photo = '';
  const btn = $('button[type=submit]', form); btn.classList.add('is-loading'); btn.disabled = true;
  try {
    if (old) { S.reports.update(old.id, u.id, r); toast('Report updated.'); return go('incident/' + old.id); }
    const x = S.reports.add(Object.assign({ uid: u.id }, r));
    S.notes.add(u.id, 'Report received', `Your report "${r.title}" was saved.`, 'info', '#/incident/' + x.id);
    if (r.severity === 'high' || r.severity === 'critical') S.notes.add(null, D.SEVERITIES[r.severity] + ' incident reported', `${r.title} at ${r.location}. Follow official instructions.`, r.severity === 'critical' ? 'urgent' : 'warning', '#/incident/' + x.id);
    toast('Report submitted. If anyone is in danger, call 911 now.'); go('incident/' + x.id);
  } catch (e) { toast(e.message, 'error'); btn.classList.remove('is-loading'); btn.disabled = false; }
}

/* ---------- incident detail ---------- */
views.incident = (p, q, u) => {
  const r = S.reports.get(p[1]);
  if (!r) { toast('That incident was not found.', 'error'); go('incidents'); return { title: 'Incident details', active: 'incidents', html: '' }; }
  const mine = r.uid === u.id, hasLoc = r.lat !== null && r.lat !== undefined && r.lat !== '';
  return { title: 'Incident details', active: 'incidents', html: `
  <p><a class="back" href="#/incidents">&larr; Back to history</a></p>
  <article class="card detail">
    <header class="detail-head"><span class="li-ic big">${ic(D.CATEGORIES[r.category][1])}</span><div><h2>${esc(r.title)}</h2>
      <div class="meta">${badge('sev', r.severity, D.SEVERITIES[r.severity])} ${badge('st', r.status, D.STATUSES[r.status])} <span>${esc(D.CATEGORIES[r.category][0])}</span></div></div></header>
    <dl class="facts"><div><dt>Location</dt><dd>${esc(r.location)}</dd></div><div><dt>Reported by</dt><dd>${esc(S.auth.name(r.uid))}</dd></div><div><dt>Reported</dt><dd>${fmt(r.created)}</dd></div><div><dt>Last update</dt><dd>${fmt(r.updated)}</dd></div></dl>
    <h3>Description</h3><p class="prose">${nl2br(r.description)}</p>
    ${safeImg(r.photo) ? `<h3>Photo</h3><img class="photo" src="${safeImg(r.photo)}" alt="Photo attached to the report">` : ''}
    <div class="detail-actions">
      ${hasLoc ? `<a class="btn btn-navy" href="#/map?incident=${r.id}">${ic('map')} View on campus map</a><a class="btn btn-ghost" target="_blank" rel="noopener" href="${osm(r.lat, r.lng, 18)}">${ic('external')} OpenStreetMap</a>` : ''}
      ${mine && r.status === 'reported' ? `<a class="btn btn-ghost" href="#/report/${r.id}">${ic('edit')} Edit</a>` : ''}
      ${mine && r.status !== 'resolved' ? `<button class="btn btn-primary" type="button" data-act="resolve" data-id="${r.id}">${ic('check')} Mark resolved</button>` : ''}
      ${mine && r.status === 'reported' ? `<button class="btn btn-dark" type="button" data-act="delete-report" data-id="${r.id}">${ic('trash')} Delete</button>` : ''}
    </div></article>` };
};

/* ---------- incident history ---------- */
const dayKey = iso => new Date(iso).toLocaleDateString('en-CA');
function filtered(q, u) {
  let r = S.reports.all(); if (q.scope === 'mine') r = r.filter(x => x.uid === u.id);
  const s = (q.q || '').trim().toLowerCase(); if (s) r = r.filter(x => [x.title, x.description, x.location].some(v => String(v).toLowerCase().includes(s)));
  [['category', D.CATEGORIES], ['severity', D.SEVERITIES], ['status', D.STATUSES]].forEach(([k, set]) => { if (q[k] && set[q[k]]) r = r.filter(x => x[k] === q[k]); });
  if (/^\d{4}-\d{2}-\d{2}$/.test(q.from || '')) r = r.filter(x => dayKey(x.created) >= q.from);
  if (/^\d{4}-\d{2}-\d{2}$/.test(q.to || '')) r = r.filter(x => dayKey(x.created) <= q.to);
  return r;
}
views.incidents = (p, q, u) => {
  const rows = filtered(q, u), per = 15, pages = Math.max(1, Math.ceil(rows.length / per)), page = Math.min(pages, Math.max(1, +q.page || 1));
  const keep = ['q', 'category', 'severity', 'status', 'scope', 'from', 'to'], base = {}; keep.forEach(k => { if (q[k]) base[k] = q[k]; });
  const link = pg => '#/incidents?' + new URLSearchParams(Object.assign({}, base, { page: pg })).toString();
  const opt = (set, cur, anyLabel = 'Any') => `<option value="">${anyLabel}</option>` + Object.entries(set).map(([k, v]) => `<option value="${k}" ${cur === k ? 'selected' : ''}>${esc(Array.isArray(v) ? v[0] : v)}</option>`).join('');
  return { title: 'Incident history', active: 'incidents', html: `
  <form class="card filters" data-form="filters" role="search" aria-label="Filter incidents">
    <label class="field grow"><span>Search</span><div class="input">${ic('search')}<input type="search" name="q" value="${esc(q.q || '')}" placeholder="Title, description or location"></div></label>
    <label class="field"><span>Show</span><select name="scope"><option value="all">All campus reports</option><option value="mine" ${q.scope === 'mine' ? 'selected' : ''}>My reports</option></select></label>
    <label class="field"><span>Category</span><select name="category">${opt(D.CATEGORIES, q.category)}</select></label>
    <label class="field"><span>Severity</span><select name="severity">${opt(D.SEVERITIES, q.severity)}</select></label>
    <label class="field"><span>Status</span><select name="status">${opt(D.STATUSES, q.status)}</select></label>
    <label class="field"><span>From</span><input type="date" name="from" value="${esc(q.from || '')}"></label>
    <label class="field"><span>To</span><input type="date" name="to" value="${esc(q.to || '')}"></label>
    <div class="filter-actions"><button class="btn btn-primary" type="submit">${ic('filter')} Apply</button><a class="btn btn-ghost" href="#/incidents">Reset</a></div>
  </form>
  <div class="bar-row"><p class="muted"><b>${rows.length}</b> ${rows.length === 1 ? 'incident' : 'incidents'} found</p><button class="btn btn-navy btn-sm" type="button" data-act="export">${ic('download')} Export CSV</button></div>
  ${rows.length ? `<div class="card table-wrap"><table class="table"><thead><tr><th>Incident</th><th>Category</th><th>Severity</th><th>Status</th><th>Reported</th><th><span class="sr">Actions</span></th></tr></thead><tbody>
    ${rows.slice((page - 1) * per, page * per).map(r => `<tr>
      <td data-label="Incident"><a class="t-title" href="#/incident/${r.id}">${esc(r.title)}</a><small>${esc(r.location)} &middot; ${esc(S.auth.name(r.uid))}</small></td>
      <td data-label="Category">${ic(D.CATEGORIES[r.category][1])} ${esc(D.CATEGORIES[r.category][0])}</td><td data-label="Severity">${badge('sev', r.severity, D.SEVERITIES[r.severity])}</td>
      <td data-label="Status">${badge('st', r.status, D.STATUSES[r.status])}</td><td data-label="Reported">${timeAgo(r.created)}</td><td class="t-act"><a class="btn btn-ghost btn-sm" href="#/incident/${r.id}">Open</a></td></tr>`).join('')}
    </tbody></table></div>
    ${pages > 1 ? `<nav class="pager" aria-label="Pagination">${page > 1 ? `<a class="btn btn-ghost btn-sm" href="${link(page - 1)}">Previous</a>` : ''}<span>Page ${page} of ${pages}</span>${page < pages ? `<a class="btn btn-ghost btn-sm" href="${link(page + 1)}">Next</a>` : ''}</nav>` : ''}`
    : `<div class="card empty-card">${ic('search')}<h2>No incidents match</h2><p>Try different filters, or <a href="#/report">report a new incident</a>.</p></div>`}` };
};
function exportCsv(u) {
  const { q } = parseHash(), rows = filtered(q, u), safe = v => (typeof v === 'string' && /^[=+\-@\t\r]/.test(v)) ? "'" + v : v;
  const cell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const lines = [['ID', 'Title', 'Category', 'Severity', 'Status', 'Location', 'Latitude', 'Longitude', 'Description', 'Reported by', 'Reported at']]
    .concat(rows.map(r => [r.id, safe(r.title), D.CATEGORIES[r.category][0], D.SEVERITIES[r.severity], D.STATUSES[r.status], safe(r.location), r.lat ?? '', r.lng ?? '', safe(r.description.replace(/\s+/g, ' ')), safe(S.auth.name(r.uid)), r.created]));
  const blob = new Blob(['\uFEFF' + lines.map(l => l.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'campussafe-incidents-' + new Date().toISOString().slice(0, 10) + '.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast(rows.length + ' incidents exported.');
}

/* ---------- notifications, guides, evacuation, contacts ---------- */
views.notifications = (p, q, u) => {
  const list = S.notes.list(u.id);
  return { title: 'Notifications', active: 'notifications', html: `
  <div class="bar-row"><p class="muted">Campus alerts and updates about your reports.</p><button class="btn btn-ghost btn-sm" type="button" data-act="mark-read">${ic('check')} Mark all as read</button></div>
  ${list.length ? '' : `<div class="card empty-card">${ic('bell')}<h2>No notifications</h2></div>`}
  <ul class="card list notes">${list.map(n => { const tag = n.link ? 'a' : 'div'; return `<li class="note note-${n.level} ${n.unread ? 'is-unread' : ''}"><${tag} ${n.link ? `href="${esc(n.link)}"` : ''}><span class="li-ic">${ic(n.level === 'urgent' ? 'alert' : 'bell')}</span><span class="li-main"><b>${esc(n.title)}${n.unread ? ' <em class="new">New</em>' : ''}</b><small>${esc(n.message)}</small></span><time>${timeAgo(n.created)}</time></${tag}></li>`; }).join('')}</ul>` };
};
views.guides = () => ({ title: 'Emergency guides', active: 'guides', html: `
  ${note('Sample procedures.', 'These steps are general safety guidance used as placeholders. The school must review and approve its own procedures before real-world use.')}
  <div class="bar-row"><label class="field grow"><span class="sr">Search guides</span><div class="input">${ic('search')}<input type="search" id="guideSearch" placeholder="Search guides, for example earthquake or exit"></div></label><button class="btn btn-ghost btn-sm" type="button" id="toggleAll">Expand all</button></div>
  <div class="guides" id="guideList">${D.GUIDES.map(g => `<details class="card guide"><summary><span class="li-ic">${ic(g.icon)}</span><span class="li-main"><b>${esc(g.title)}</b><small>${esc(g.summary)}</small></span>${ic('chevron', 'chev')}</summary>
    <div class="guide-body"><h3>What to do</h3><ol class="steps">${g.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol><h3>Avoid</h3><ul class="avoid">${g.avoid.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    <div class="guide-cta"><a class="btn btn-sos btn-sm" href="tel:911">${ic('phone')} Call 911</a><a class="btn btn-ghost btn-sm" href="#/contacts">More contacts</a><a class="btn btn-ghost btn-sm" href="#/evacuation">Evacuation areas</a></div></div></details>`).join('')}</div>
  <p class="empty" id="noGuides" hidden>No guides match your search.</p>` });
views.evacuation = (p, q, u) => {
  const areas = S.markers.all(u.id).filter(m => m.type === 'evacuation' || m.type === 'assembly');
  return { title: 'Evacuation areas', active: 'evacuation', html: `
  ${note('Sample locations.', 'Areas marked as samples are placeholders. Walk the real routes and confirm official evacuation areas with the school.')}
  <div class="grid two align-start"><section class="card"><h2>When the alarm sounds</h2><ol class="steps"><li>Stop what you are doing and take only essentials.</li><li>Use the nearest exit. Never use elevators.</li><li>Help classmates who need assistance.</li><li>Go to your evacuation area, then to the assembly point.</li><li>Join your group for roll call and wait for official clearance.</li></ol><a class="btn btn-ghost btn-sm" href="#/guides">${ic('book')} Open emergency guides</a></section>
  <section class="card"><h2>Know your route</h2><ul class="checklist"><li>Find two exits for every room you use.</li><li>Check that corridors and exits stay clear.</li><li>Learn where your group meets for roll call.</li><li>Add missing areas as markers on the <a href="#/map">campus map</a>.</li></ul></section></div>
  <h2 class="section-h">Evacuation and assembly areas</h2>
  ${areas.length ? '' : `<div class="card empty-card">${ic('exit')}<h2>No areas yet</h2><p>Add one from the <a href="#/map">campus map</a>.</p></div>`}
  <div class="grid cards">${areas.map(a => { const t = D.MARKER_TYPES[a.type]; return `<article class="card area">${safeImg(a.photo) ? `<img src="${safeImg(a.photo)}" alt="Photo of ${esc(a.name)}" loading="lazy">` : ''}<div class="area-body"><span class="chip" style="--c:${t[2]}">${ic(t[1])} ${esc(t[0])}</span><h3>${esc(a.name)}</h3><p>${esc(a.description)}</p>
    <div class="area-actions"><a class="btn btn-navy btn-sm" href="#/map?focus=${a.id}">${ic('map')} Show on map</a><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${osm(a.lat, a.lng)}">${ic('external')} OpenStreetMap</a></div></div></article>`; }).join('')}</div>` };
};
const tel = n => 'tel:' + String(n).replace(/[^0-9+]/g, ''), safeUrl = u => (u && /^https?:\/\//i.test(u)) ? u : null;
views.contacts = () => ({ title: 'Emergency contacts', active: 'contacts', html: `
  ${note('Only confirmed numbers can be called.', 'Entries labeled Placeholder have no confirmed number yet. In an emergency, call 911. School staff can add confirmed details in <code>assets/js/data.js</code>.')}
  <div class="grid cards contacts">${D.CONTACTS.map(c => {
    const web = safeUrl(c.website), msg = safeUrl(c.messenger), loc = c.loc ? (c.loc.url ? safeUrl(c.loc.url) : 'https://www.openstreetmap.org/search?query=' + encodeURIComponent(c.loc.q)) : null;
    return `<article class="card contact ${c.hotline ? 'is-hotline' : ''} ${c.verified ? '' : 'is-placeholder'}">
    <header><span class="c-ic">${ic(c.hotline ? 'alert' : 'phone')}</span><div><h2>${esc(c.name)}</h2><p>${esc(c.role)}</p></div></header>
    <div class="c-tags">${c.hotline ? '<span class="tag tag-hot">Emergency hotline</span>' : ''}${c.verified ? `<span class="tag tag-ok">${ic('check')} Verified</span>` : '<span class="tag tag-ph">Placeholder, not verified</span>'}</div>
    <dl class="c-details">${c.phone ? `<div><dt>Phone</dt><dd><a href="${esc(tel(c.phone))}">${esc(c.phone)}</a></dd></div>` : ''}${c.phoneAlt ? `<div><dt>Alternate</dt><dd><a href="${esc(tel(c.phoneAlt))}">${esc(c.phoneAlt)}</a></dd></div>` : ''}
      ${c.email ? `<div><dt>Email</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd></div>` : ''}${web ? `<div><dt>Website</dt><dd><a href="${esc(web)}" target="_blank" rel="noopener">${esc(web.replace(/^https?:\/\//i, ''))}</a></dd></div>` : ''}
      ${!c.phone && !c.email ? '<div><dt>Number</dt><dd class="muted">To be confirmed by the school</dd></div>' : ''}</dl>
    <p class="c-note">${esc(c.note || '')}</p>
    <div class="c-actions">${c.phone ? `<a class="btn ${c.hotline ? 'btn-sos' : 'btn-primary'} btn-call" href="${esc(tel(c.phone))}">${ic('phone')} Call now</a>` : `<span class="btn btn-disabled btn-call" aria-disabled="true">${ic('phone')} Call now</span>`}
      ${c.email ? `<a class="btn btn-navy" href="mailto:${esc(c.email)}?subject=${encodeURIComponent('CampusSafe: ' + c.name)}">${ic('mail')} Send email</a>` : ''}${msg ? `<a class="btn btn-navy" href="${esc(msg)}" target="_blank" rel="noopener">${ic('message')} Messenger</a>` : ''}
      ${web ? `<a class="btn btn-ghost" href="${esc(web)}" target="_blank" rel="noopener">${ic('globe')} Website</a>` : ''}${loc ? `<a class="btn btn-ghost" href="${esc(loc)}" target="_blank" rel="noopener">${ic('pin')} View location</a>` : ''}</div></article>`; }).join('')}</div>` });

/* ---------- maps (Leaflet + OpenStreetMap) ---------- */
const mapsOk = () => typeof window.L !== 'undefined';
function baseMap(el) {
  const map = L.map(el).setView([C.lat, C.lng], C.zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' })
    .on('tileerror', () => { if (!window.__tw) { window.__tw = 1; toast('Map tiles could not load. Check your internet connection.', 'error'); } }).addTo(map);
  return map;
}
const svgIcon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${D.ICONS[n] || ''}</svg>`;
const pinIcon = (color, icon, cls = '') => L.divIcon({ className: 'pin-wrap', html: `<span class="pin ${cls}" style="--c:${color}">${svgIcon(icon)}</span>`, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -30] });
const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; };

function initPicker() {
  const mapEl = $('#pickmap'); if (!mapEl) return;
  if (!mapsOk()) { mapEl.textContent = 'The map could not load. Check your internet connection. You can still submit without a pin.'; return; }
  const map = baseMap(mapEl), lat = $('#lat'), lng = $('#lng'); let pin = null;
  const set = (la, ln, fly) => {
    lat.value = la.toFixed(6); lng.value = ln.toFixed(6);
    if (!pin) { pin = L.marker([la, ln], { draggable: true, keyboard: true, title: 'Incident location' }).addTo(map); pin.on('dragend', () => { const p = pin.getLatLng(); set(p.lat, p.lng); }); } else pin.setLatLng([la, ln]);
    if (fly) map.setView([la, ln], Math.max(map.getZoom(), 18));
  };
  if (lat.value && lng.value) set(+lat.value, +lng.value, true);
  map.on('click', e => set(e.latlng.lat, e.latlng.lng));
  $('#clearPin').onclick = () => { if (pin) { map.removeLayer(pin); pin = null; } lat.value = lng.value = ''; };
  $('#locateBtn').onclick = () => { if (!navigator.geolocation) return toast('Location is not available on this device.', 'error'); navigator.geolocation.getCurrentPosition(p => set(p.coords.latitude, p.coords.longitude, true), () => toast('Allow location access, or tap the map instead.', 'error'), { enableHighAccuracy: true, timeout: 10000 }); };
  cleanup = () => map.remove();
}

views.map = (p, q, u) => ({ title: 'Campus map', active: 'map', html: `
  ${note('Sample markers.', 'The first marker is the exact campus location from the school\'s Google Maps listing. Other positions labeled sample are approximate and need official verification. Add or correct your own markers with Add marker.')}
  <div class="map-wrap">
    <section class="map-box" aria-label="Interactive campus map"><div id="map" role="application" aria-label="OpenStreetMap of the campus"></div>
      <div class="map-loading" id="mapLoading"><span class="spinner big"></span><span>Loading map</span></div>
      <div class="map-tools"><button class="btn btn-primary btn-sm" type="button" id="addBtn" aria-pressed="false">${ic('plus')} <span>Add marker</span></button><button class="btn btn-ghost btn-sm" type="button" id="locBtn">${ic('locate')} <span class="hide-sm">My location</span></button></div>
      <p class="map-hint" id="mapHint" hidden>Tap the map where the marker should go.</p></section>
    <aside class="map-panel card" aria-label="Map layers and places">
      <label class="field"><span class="sr">Search places</span><div class="input">${ic('search')}<input type="search" id="placeSearch" placeholder="Search places"></div></label>
      <div class="chips" id="typeChips" role="group" aria-label="Show marker types">${Object.entries(D.MARKER_TYPES).map(([k, t]) => `<button type="button" class="chip is-on" data-type="${k}" aria-pressed="true" style="--c:${t[2]}">${ic(t[1])} ${esc(t[0])}</button>`).join('')}<button type="button" class="chip is-on" data-layer="incidents" aria-pressed="true" style="--c:#D7263D">${ic('alert')} Incidents</button></div>
      <ul class="place-list" id="placeList"></ul></aside>
  </div>
  <dialog id="markerDialog" aria-labelledby="mdTitle"><form id="markerForm" novalidate>
    <header><h2 id="mdTitle">Add marker</h2><button type="button" class="icon-btn" data-close aria-label="Close">${ic('x')}</button></header>
    <input type="hidden" name="id"><input type="hidden" name="lat"><input type="hidden" name="lng">
    <label class="field"><span>Name</span><input name="name" maxlength="100" required></label>
    <label class="field"><span>Type</span><select name="type">${Object.entries(D.MARKER_TYPES).map(([k, t]) => `<option value="${k}">${esc(t[0])}</option>`).join('')}</select></label>
    <label class="field"><span>Description</span><textarea name="description" rows="3" maxlength="600"></textarea></label>
    <label class="field"><span>Photo (JPG, PNG or WebP)</span><input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
    <label class="check" id="rmPhotoRow" hidden><input type="checkbox" name="remove_photo" value="1"> Remove current photo</label>
    <p class="form-error" id="mdErr" role="alert" hidden></p><p class="hint" id="mdCoords"></p>
    <div class="form-actions"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" type="submit"><span class="btn-label">Save marker</span><span class="spinner" aria-hidden="true"></span></button></div>
  </form></dialog>`, after: u => setupMap(u, q) });

function setupMap(u, q) {
  const box = $('#mapLoading');
  if (!mapsOk()) { box.textContent = 'The map library could not load. Check your internet connection and reload.'; return; }
  const map = baseMap($('#map')), mLayer = L.layerGroup().addTo(map), iLayer = L.layerGroup().addTo(map);
  const shown = new Set(Object.keys(D.MARKER_TYPES)); let showInc = true, adding = false, temp = null, mk = {}, mine = [], incs = [];
  const dlg = $('#markerDialog'), form = $('#markerForm'), F = form.elements, err = $('#mdErr'), addBtn = $('#addBtn'), hint = $('#mapHint');

  function popup(m) {
    const t = D.MARKER_TYPES[m.type], d = el('div', 'pop'), chip = el('span', 'chip', t[0]); chip.style.setProperty('--c', t[2]); d.append(el('h3', '', m.name), chip);
    if (m.sample) d.append(el('p', 'pop-warn', 'Sample location. Needs official verification.'));
    if (m.description) d.append(el('p', '', m.description));
    if (safeImg(m.photo)) { const i = el('img'); i.src = m.photo; i.alt = 'Photo of ' + m.name; d.append(i); }
    const row = el('div', 'pop-actions'), a = el('a', 'btn btn-ghost btn-sm', 'OpenStreetMap'); a.href = osm(m.lat, m.lng); a.target = '_blank'; a.rel = 'noopener'; row.append(a);
    if (m.mine) { const e = el('button', 'btn btn-navy btn-sm', 'Edit'); e.type = 'button'; e.onclick = () => openDialog(m); const x = el('button', 'btn btn-dark btn-sm', 'Delete'); x.type = 'button'; x.onclick = () => del(m); row.append(e, x); }
    d.append(row); return d;
  }
  function incPopup(i) { const d = el('div', 'pop'); d.append(el('h3', '', i.title), el('p', '', `${D.SEVERITIES[i.severity]} severity, ${i.location}`)); const a = el('a', 'btn btn-primary btn-sm', 'Open report'); a.href = '#/incident/' + i.id; d.append(a); return d; }
  function draw() {
    mLayer.clearLayers(); iLayer.clearLayers(); mk = {}; const list = $('#placeList'); list.replaceChildren(); const s = $('#placeSearch').value.trim().toLowerCase();
    mine.forEach(m => {
      if (!shown.has(m.type) || (s && !m.name.toLowerCase().includes(s))) return;
      const t = D.MARKER_TYPES[m.type], marker = L.marker([m.lat, m.lng], { icon: pinIcon(t[2], t[1]), title: m.name, alt: m.name }).bindPopup(() => popup(m), { maxWidth: 260 }).addTo(mLayer); mk[m.id] = marker;
      const li = el('li'), b = el('button', 'place'); b.type = 'button'; const pi = el('span', 'place-ic'); pi.innerHTML = svgIcon(t[1]); pi.style.setProperty('--c', t[2]);
      const tx = el('span', 'place-tx'); tx.append(el('b', '', m.name), el('small', '', t[0] + (m.mine ? ', added by you' : ''))); b.append(pi, tx);
      b.onclick = () => { map.flyTo([m.lat, m.lng], 19, { duration: .6 }); marker.openPopup(); $('#map').scrollIntoView({ block: 'nearest' }); }; li.append(b); list.append(li);
    });
    if (!list.children.length) list.append(el('li', 'empty', 'No places match.'));
    if (showInc) incs.forEach(i => L.marker([i.lat, i.lng], { icon: pinIcon('#D7263D', 'alert', i.severity === 'critical' ? 'pulse' : ''), title: i.title, alt: i.title }).bindPopup(() => incPopup(i)).addTo(iLayer));
  }
  function reload(focus) {
    mine = S.markers.all(u.id);
    incs = S.reports.all().filter(r => r.status !== 'resolved' && r.lat !== null && r.lat !== '' && r.lat !== undefined);
    draw(); box.hidden = true;
    if (focus && mk[focus]) { const m = mine.find(x => x.id === focus); map.setView([m.lat, m.lng], 19); mk[focus].openPopup(); }
    const inc = q.incident && incs.find(x => String(x.id) === q.incident); if (inc) map.setView([inc.lat, inc.lng], 19);
  }
  $$('#typeChips .chip').forEach(c => c.addEventListener('click', () => {
    const on = c.getAttribute('aria-pressed') !== 'true'; c.setAttribute('aria-pressed', on); c.classList.toggle('is-on', on);
    if (c.dataset.layer) showInc = on; else on ? shown.add(c.dataset.type) : shown.delete(c.dataset.type); draw();
  }));
  $('#placeSearch').addEventListener('input', draw);

  function openDialog(m) {
    map.closePopup(); form.reset(); err.hidden = true; const edit = !!m.id; pending.markerPhoto = undefined;
    $('#mdTitle').textContent = edit ? 'Edit marker' : 'Add marker'; F.id.value = edit ? m.id : ''; F.lat.value = (+m.lat).toFixed(6); F.lng.value = (+m.lng).toFixed(6);
    F.name.value = m.name || ''; F.type.value = m.type || 'building'; F.description.value = m.description || '';
    $('#rmPhotoRow').hidden = !(edit && safeImg(m.photo)); $('#mdCoords').textContent = `Position: ${F.lat.value}, ${F.lng.value}`; dlg.showModal(); F.name.focus();
  }
  $$('[data-close]', dlg).forEach(b => b.addEventListener('click', () => { dlg.close(); stopAdd(); }));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  form.addEventListener('submit', async e => {
    e.preventDefault(); const btn = $('button[type=submit]', form), name = clean(F.name.value, 100), type = F.type.value, desc = clean(F.description.value, 600), errs = [];
    if (name.length < 2) errs.push('Enter a name of at least 2 characters.'); if (!D.MARKER_TYPES[type]) errs.push('Choose a marker type.');
    const lat = +F.lat.value, lng = +F.lng.value; if (!F.lat.value || !isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) errs.push('Tap the map to choose a position.');
    if (errs.length) { err.textContent = errs.join(' '); err.hidden = false; return; }
    btn.classList.add('is-loading'); btn.disabled = true;
    try {
      const old = F.id.value ? mine.find(x => x.id === F.id.value) : null; let photo = old ? old.photo || '' : '';
      const file = F.photo.files[0]; if (file) photo = await shrinkImage(file); else if (old && F.remove_photo.checked) photo = '';
      S.markers.save(u.id, { id: F.id.value || undefined, name, type, description: desc, lat: +lat.toFixed(6), lng: +lng.toFixed(6), photo });
      dlg.close(); stopAdd(); toast('Marker saved.'); reload();
    } catch (x) { err.textContent = x.message; err.hidden = false; } finally { btn.classList.remove('is-loading'); btn.disabled = false; }
  });
  function del(m) { if (!confirm(`Delete "${m.name}"? This cannot be undone.`)) return; try { S.markers.remove(m.id, u.id); toast('Marker deleted.'); reload(); } catch (e) { toast(e.message, 'error'); } }
  function stopAdd() { adding = false; addBtn.setAttribute('aria-pressed', 'false'); addBtn.classList.remove('is-active'); hint.hidden = true; map.getContainer().classList.remove('is-adding'); if (temp) { map.removeLayer(temp); temp = null; } }
  addBtn.addEventListener('click', () => { if (adding) return stopAdd(); adding = true; addBtn.setAttribute('aria-pressed', 'true'); addBtn.classList.add('is-active'); hint.hidden = false; map.getContainer().classList.add('is-adding'); });
  map.on('click', e => { if (!adding) return; if (temp) map.removeLayer(temp); temp = L.marker(e.latlng, { icon: pinIcon('#FF7A1A', 'plus') }).addTo(map); openDialog({ lat: e.latlng.lat, lng: e.latlng.lng }); });
  $('#locBtn').addEventListener('click', () => {
    if (!navigator.geolocation) return toast('Location is not available on this device.', 'error');
    navigator.geolocation.getCurrentPosition(p => { map.setView([p.coords.latitude, p.coords.longitude], 18); L.circleMarker([p.coords.latitude, p.coords.longitude], { radius: 8, color: '#fff', weight: 3, fillColor: '#1D4A82', fillOpacity: 1 }).addTo(map).bindTooltip('You are here'); }, () => toast('Allow location access to see where you are.', 'error'), { enableHighAccuracy: true, timeout: 10000 });
  });
  const ro = new ResizeObserver(() => map.invalidateSize()); ro.observe($('#map'));
  cleanup = () => { ro.disconnect(); map.remove(); };
  reload(q.focus);
}

/* ---------- router ---------- */
function parseHash() { const h = location.hash.slice(1) || '/', [path, qs = ''] = h.split('?'); return { parts: path.split('/').filter(Boolean), q: Object.fromEntries(new URLSearchParams(qs)) }; }
function route() {
  if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
  const { parts, q } = parseHash(), u = S.auth.current(), name = parts[0] || '';
  if (!u) return authView(name === 'register' ? 'register' : 'login');
  if (!views[name]) return go('dashboard');
  show(views[name](parts, q, u), u);
}
addEventListener('hashchange', route);

/* ---------- global events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return; const a = t.dataset.act, u = S.auth.current();
  if (a === 'theme') { const th = root.dataset.theme === 'dark' ? 'light' : 'dark'; root.dataset.theme = th; try { localStorage.setItem('cs-theme', th); } catch (x) {} }
  else if (a === 'nav-open') { root.classList.add('side-open'); $('#sidebar .nav-link')?.focus(); }
  else if (a === 'nav-close') root.classList.remove('side-open');
  else if (a === 'collapse') { if (matchMedia('(max-width: 900px)').matches) return root.classList.remove('side-open'); const on = root.classList.toggle('side-collapsed'); try { localStorage.setItem('cs-side', on ? '1' : '0'); } catch (x) {} }
  else if (a === 'skip') { e.preventDefault(); $('#main').focus(); }
  else if (a === 'logout') { S.auth.end(); toast('You have been logged out.', 'info'); go('login'); route(); }
  else if (a === 'peek') { const i = t.parentElement.querySelector('input'), s = i.type === 'password'; i.type = s ? 'text' : 'password'; t.setAttribute('aria-label', s ? 'Hide password' : 'Show password'); }
  else if (a === 'export' && u) exportCsv(u);
  else if (a === 'mark-read' && u) { S.notes.markAllRead(u.id); toast('All notifications marked as read.'); route(); }
  else if (a === 'resolve' && u) { try { S.reports.update(t.dataset.id, u.id, { status: 'resolved' }); toast('Marked as resolved.'); route(); } catch (x) { toast(x.message, 'error'); } }
  else if (a === 'delete-report' && u) { if (!confirm('Delete this report? This cannot be undone.')) return; try { S.reports.remove(t.dataset.id, u.id); toast('Report deleted.'); go('incidents?scope=mine'); } catch (x) { toast(x.message, 'error'); } }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault(); const k = f.dataset.form, u = S.auth.current();
  if (k === 'login' || k === 'register') submitAuth(f);
  else if (k === 'report' && u) submitReport(f, u);
  else if (k === 'filters') { const p = new URLSearchParams(); new FormData(f).forEach((v, n) => { if (v) p.set(n, v); }); go('incidents' + (p.toString() ? '?' + p : '')); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.matches('[data-strength]')) { const v = t.value; let s = 0; if (v.length >= 8) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v) || v.length >= 14) s++; const m = t.closest('.field').querySelector('.meter'); if (m) m.dataset.level = v ? s : 0; }
  if (t.matches('textarea[data-counter]')) t.closest('.field').querySelector('[data-count-out]').textContent = t.value.length;
  if (t.id === 'guideSearch') { const s = t.value.trim().toLowerCase(); let n = 0; $$('#guideList .guide').forEach(g => { const hit = !s || g.textContent.toLowerCase().includes(s); g.hidden = !hit; if (hit) n++; if (s && hit) g.open = true; }); $('#noGuides').hidden = n > 0; }
});
document.addEventListener('change', async e => {
  if (e.target.id !== 'photo') return; const f = e.target.files[0], name = $('#fileName'), prev = $('#preview');
  if (!f) { name.textContent = 'No file selected'; pending.photo = undefined; return; }
  try { pending.photo = await shrinkImage(f); name.textContent = f.name; prev.src = pending.photo; prev.hidden = false; }
  catch (x) { toast(x.message, 'error'); e.target.value = ''; name.textContent = 'No file selected'; pending.photo = undefined; }
});
document.addEventListener('click', e => { const b = e.target.closest('#toggleAll'); if (!b) return; const open = b.dataset.open !== '1'; $$('#guideList .guide').forEach(g => g.open = open); b.dataset.open = open ? '1' : '0'; b.textContent = open ? 'Collapse all' : 'Expand all'; });
addEventListener('keydown', e => { if (e.key === 'Escape') root.classList.remove('side-open'); });
$$('.toast').forEach(t => t.remove());
route();
})();
