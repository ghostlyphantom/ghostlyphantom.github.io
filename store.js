/* CampusSafe storage layer. Everything is saved in this browser (localStorage). No server is involved. */
window.CS_STORE = (() => {
  const D = window.CS_DATA, KEY = 'campussafe.v1', SES = 'campussafe.session', IDLE = 2 * 3600 * 1000;
  const empty = () => ({ users: [], reports: [], markers: [], notes: [], reads: {}, seq: 1 });
  const load = () => { try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && Array.isArray(j.users)) return Object.assign(empty(), j); } catch (e) {} return empty(); };
  let db = load();
  addEventListener('storage', e => { if (e.key === KEY) db = load(); });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { db = load(); throw new Error('Browser storage is full. Delete some photos or old reports and try again.'); } };
  const nextId = () => db.seq++;
  const now = () => new Date().toISOString();

  // ---- password hashing (PBKDF2-SHA256 via Web Crypto) ----
  const toB64 = u8 => btoa(String.fromCharCode(...u8)), fromB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  async function derive(pass, salt) {
    if (!window.crypto || !crypto.subtle) throw new Error('Secure hashing is not available here. Open the site over https or from localhost.');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, key, 256));
  }
  const same = (a, b) => { let d = a.length ^ b.length; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; };

  // ---- session ----
  const auth = {
    current() {
      try {
        const s = JSON.parse(localStorage.getItem(SES) || 'null');
        if (!s || Date.now() - s.last > IDLE) { localStorage.removeItem(SES); return null; }
        const u = db.users.find(x => x.id === s.uid); if (!u) return null;
        if (Date.now() - s.last > 60000) { s.last = Date.now(); localStorage.setItem(SES, JSON.stringify(s)); }
        return { id: u.id, name: u.name, email: u.email, role: u.role };
      } catch (e) { return null; }
    },
    start(uid) { localStorage.setItem(SES, JSON.stringify({ uid, last: Date.now() })); },
    end() { localStorage.removeItem(SES); },
    async register({ name, email, role, pass }) {
      if (db.users.some(u => u.email === email)) throw new Error('An account with this email already exists.');
      const salt = crypto.getRandomValues(new Uint8Array(16)), hash = await derive(pass, salt);
      const u = { id: nextId(), name, email, role, salt: toB64(salt), hash: toB64(hash), created: now() };
      db.users.push(u); save(); auth.start(u.id); return u;
    },
    async login(email, pass) {
      const lock = +sessionStorage.getItem('cs.lock') || 0;
      if (lock > Date.now()) throw new Error('Too many attempts. Try again in ' + Math.ceil((lock - Date.now()) / 1000) + ' seconds.');
      const u = db.users.find(x => x.email === email);
      const salt = u ? fromB64(u.salt) : crypto.getRandomValues(new Uint8Array(16));
      const h = await derive(pass, salt);
      if (u && same(h, fromB64(u.hash))) { sessionStorage.removeItem('cs.fails'); auth.start(u.id); return u; }
      const f = (+sessionStorage.getItem('cs.fails') || 0) + 1;
      if (f >= 5) { sessionStorage.setItem('cs.lock', Date.now() + 60000); sessionStorage.setItem('cs.fails', 0); } else sessionStorage.setItem('cs.fails', f);
      throw new Error('The email or password is incorrect.');
    },
    name: id => (db.users.find(u => u.id === id) || {}).name || 'Unknown user'
  };

  // ---- reports ----
  const reports = {
    all: () => db.reports.slice().sort((a, b) => b.created.localeCompare(a.created) || b.id - a.id),
    get: id => db.reports.find(r => r.id === +id) || null,
    add(r) { const x = Object.assign({ id: nextId(), status: 'reported', created: now(), updated: now() }, r); db.reports.push(x); save(); return x; },
    update(id, uid, patch) { const r = db.reports.find(x => x.id === +id && x.uid === uid); if (!r) throw new Error('You can only change your own reports.'); Object.assign(r, patch, { updated: now() }); save(); return r; },
    remove(id, uid) { const i = db.reports.findIndex(x => x.id === +id && x.uid === uid); if (i < 0) throw new Error('You can only delete your own reports.'); db.reports.splice(i, 1); save(); }
  };

  // ---- map markers (samples are read-only) ----
  const markers = {
    all: uid => D.MARKERS.map(m => Object.assign({}, m, { mine: false }))
      .concat(db.markers.map(m => Object.assign({}, m, { mine: m.uid === uid, sample: false }))),
    save(uid, m) {
      if (m.id) { const x = db.markers.find(k => k.id === m.id && k.uid === uid); if (!x) throw new Error('You can only edit markers you added.'); Object.assign(x, m); }
      else db.markers.push(Object.assign({ id: 'u' + nextId(), uid, created: now() }, m));
      save();
    },
    remove(id, uid) { const i = db.markers.findIndex(k => k.id === id && k.uid === uid); if (i < 0) throw new Error('You can only delete markers you added.'); db.markers.splice(i, 1); save(); }
  };

  // ---- notifications ----
  const notes = {
    list(uid) {
      const read = new Set(db.reads[uid] || []);
      return D.NOTES.concat(db.notes.filter(n => n.uid === null || n.uid === uid))
        .map(n => Object.assign({}, n, { unread: !read.has(n.id) })).sort((a, b) => b.created.localeCompare(a.created));
    },
    unread: uid => notes.list(uid).filter(n => n.unread).length,
    add(uid, title, message, level = 'info', link = null) { db.notes.push({ id: 'x' + nextId(), uid, title, message, level, link, created: now() }); save(); },
    markAllRead(uid) { db.reads[uid] = notes.list(uid).map(n => n.id); save(); }
  };

  return { auth, reports, markers, notes };
})();
