/* CampusSafe static data. EDIT THIS FILE to change contacts, sample map markers, guides and the map centre. */
window.CS_DATA = {
  // Exact campus location, decoded from the school's Google Maps listing (Plus Code 3MG6+823, San Enrique, Iloilo).
  CENTER: { lat: 11.075763, lng: 122.660047, zoom: 18 },
  MAPS_LINK: 'https://maps.app.goo.gl/XPWvJ9FwMBhbCbzy8',
  ICONS: {"eye":"<path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","shield":"<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/>","grid":"<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/>","map":"<path d=\"M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z\"/><path d=\"M9 3v15M15 6v15\"/>","alert":"<path d=\"M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z\"/><path d=\"M12 9v4M12 17h.01\"/>","filePlus":"<path d=\"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z\"/><path d=\"M14 2v6h6M12 18v-6M9 15h6\"/>","clock":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>","book":"<path d=\"M2 4h6a4 4 0 014 4v13a3 3 0 00-3-3H2z\"/><path d=\"M22 4h-6a4 4 0 00-4 4v13a3 3 0 013-3h7z\"/>","exit":"<path d=\"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9\"/>","phone":"<path d=\"M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z\"/>","mail":"<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"/><path d=\"M22 7l-10 6L2 7\"/>","bell":"<path d=\"M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0\"/>","sun":"<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4\"/>","moon":"<path d=\"M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z\"/>","menu":"<path d=\"M3 6h18M3 12h18M3 18h18\"/>","x":"<path d=\"M18 6L6 18M6 6l12 12\"/>","pin":"<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1116 0z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>","download":"<path d=\"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3\"/>","search":"<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"M21 21l-4.3-4.3\"/>","user":"<path d=\"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>","users":"<path d=\"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8\"/>","lock":"<rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\"/><path d=\"M7 11V7a5 5 0 0110 0v4\"/>","globe":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z\"/>","message":"<path d=\"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z\"/>","flame":"<path d=\"M8.5 14.5A2.5 2.5 0 0011 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.2.4-2.4 1-3a2.5 2.5 0 002.5 2.5z\"/>","plus":"<path d=\"M12 5v14M5 12h14\"/>","trash":"<path d=\"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6\"/>","edit":"<path d=\"M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z\"/>","image":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"M21 15l-5-5L5 21\"/>","check":"<path d=\"M20 6L9 17l-5-5\"/>","chevron":"<path d=\"M6 9l6 6 6-6\"/>","locate":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M22 12h-4M6 12H2M12 6V2M12 22v-4\"/>","cross":"<path d=\"M9 3h6v6h6v6h-6v6H9v-6H3V9h6z\"/>","filter":"<path d=\"M22 3H2l8 9.5V19l4 2v-8.5z\"/>","external":"<path d=\"M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3\"/>","panel":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M9 3v18\"/>","droplet":"<path d=\"M12 2.7s7 6.3 7 11.3a7 7 0 11-14 0c0-5 7-11.3 7-11.3z\"/>","zap":"<path d=\"M13 2L3 14h9l-1 8 10-12h-9z\"/>","info":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4M12 8h.01\"/>","building":"<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"/><path d=\"M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01\"/>"},
  CATEGORIES: { fire:['Fire','flame'], medical:['Medical','cross'], earthquake:['Earthquake','alert'], flood:['Flood or typhoon','droplet'], security:['Security','shield'], accident:['Accident','alert'], hazard:['Hazard','zap'], other:['Other','info'] },
  SEVERITIES: { low:'Low', medium:'Medium', high:'High', critical:'Critical' },
  STATUSES: { reported:'Reported', in_review:'In review', resolved:'Resolved' },
  ROLES: { student:'Student', faculty:'Faculty', staff:'Staff' },
  MARKER_TYPES: {
    building:['Building','building','#1D4A82'], evacuation:['Evacuation area','exit','#1F9D63'], assembly:['Assembly point','users','#168A8A'],
    first_aid:['First aid','cross','#2B2F36'], fire_equipment:['Fire equipment','flame','#E2620A'], hazard:['Hazard area','zap','#B8860B'], security:['Security post','shield','#0B2545']
  },

  // Sample map markers (read-only in the app). lat/lng offsets around the verified campus point are APPROXIMATE SAMPLES.
  MARKERS: [
    { id:'s1', name:'ISUFST San Enrique Campus', type:'building', lat:11.075763, lng:122.660047, sample:false, description:"Location taken from the school's Google Maps listing (Plus Code 3MG6+823). Exact building positions still need checking." },
    { id:'s2', name:'Main Gate and Guard Post (sample)', type:'security', lat:11.076363, lng:122.659447, sample:true, description:'Sample position. Confirm the real gate and guard post with campus security.' },
    { id:'s3', name:'Evacuation Area A (sample)', type:'evacuation', lat:11.075163, lng:122.660447, sample:true, description:'Sample evacuation area away from tall structures. Needs official verification.' },
    { id:'s4', name:'Open Area Assembly Point (sample)', type:'assembly', lat:11.075363, lng:122.659447, sample:true, description:'Sample assembly point for roll call after evacuation. Needs official verification.' },
    { id:'s5', name:'First Aid Station (sample)', type:'first_aid', lat:11.075963, lng:122.660447, sample:true, description:'Sample first aid location. Confirm with the school clinic or nurse.' },
    { id:'s6', name:'Fire Extinguisher Station (sample)', type:'fire_equipment', lat:11.075863, lng:122.659747, sample:true, description:'Sample extinguisher location. Check real units and inspection dates with the school.' },
    { id:'s7', name:'Laboratory Chemical Storage (sample)', type:'hazard', lat:11.076163, lng:122.660747, sample:true, description:'Sample hazard marker. Confirm real hazard areas with the laboratory in charge.' }
  ],

  // Emergency contacts. verified:true only for details published by the school or national hotlines.
  // To confirm a placeholder: fill in phone/email/messenger/website and set verified:true.
  // loc: { url } opens that link, { q } searches OpenStreetMap.
  CONTACTS: [
    { name:'National Emergency Hotline 911', role:'Police, fire and medical emergencies nationwide', phone:'911', hotline:true, verified:true, note:'Philippine national emergency hotline.' },
    { name:'Philippine Red Cross Hotline', role:'Emergency medical assistance and disaster response', phone:'143', website:'https://redcross.org.ph', hotline:true, verified:true, note:'Philippine Red Cross national hotline. Confirm availability of the local chapter.' },
    { name:'ISUFST Main Campus (Tiwi)', role:'University main office', phone:'09176246100', phoneAlt:'(33) 511 5663', email:'president@isufst.edu.ph', website:'https://isufst.edu.ph', loc:{ q:'ISUFST Barangay Tiwi, Barotac Nuevo, Iloilo' }, verified:true, note:'Listed on isufst.edu.ph contact information.' },
    { name:'Campus Administrator, San Enrique Campus', role:'Office of the San Enrique Campus Administrator', email:'ca_sec@isufst.edu.ph', website:'https://isufst.edu.ph', loc:{ url:'https://maps.app.goo.gl/XPWvJ9FwMBhbCbzy8' }, verified:true, note:'Email listed on the isufst.edu.ph key officials directory. No phone number published.' },
    { name:'Campus Security / Guard Post', role:'On-campus security', verified:false, note:'PLACEHOLDER. Number not yet confirmed by the school.' },
    { name:'Campus Clinic / Nurse', role:'First aid and medical support', verified:false, note:'PLACEHOLDER. Number not yet confirmed by the school.' },
    { name:'Bureau of Fire Protection, San Enrique', role:'Local fire station', hotline:true, loc:{ q:'BFP San Enrique, Iloilo' }, verified:false, note:'PLACEHOLDER. Local number not yet confirmed. Use 911 meanwhile.' },
    { name:'Philippine National Police, San Enrique', role:'Local police station', hotline:true, loc:{ q:'PNP San Enrique, Iloilo' }, verified:false, note:'PLACEHOLDER. Local number not yet confirmed. Use 911 meanwhile.' },
    { name:'MDRRMO San Enrique', role:'Municipal disaster risk reduction and management office', loc:{ q:'San Enrique Municipal Hall, Iloilo' }, verified:false, note:'PLACEHOLDER. Number not yet confirmed.' },
    { name:'Rural Health Unit, San Enrique', role:'Nearest public health facility', loc:{ q:'Rural Health Unit San Enrique, Iloilo' }, verified:false, note:'PLACEHOLDER. Number not yet confirmed.' }
  ],

  // Sample procedures. The school must review and approve these before real-world use.
  GUIDES: [
    { title:'Fire', icon:'flame', summary:'Sample steps for a fire in a campus building.',
      steps:['Shout "Fire!" and activate the nearest alarm if safe to do so.','Call 911 and the campus security contact.','Leave the building using the nearest marked exit. Close doors behind you.','If there is smoke, stay low and cover your nose and mouth.','Go to the assigned evacuation area and report for roll call.','Only use an extinguisher on a small fire, with your back to an exit (PASS: Pull, Aim, Squeeze, Sweep).'],
      avoid:['Do not use elevators.','Do not go back inside for belongings.','Do not open a door that feels hot.'] },
    { title:'Earthquake', icon:'alert', summary:'Sample steps before, during and after shaking.',
      steps:['Drop, Cover and Hold On under a sturdy desk or table.','Stay away from windows, shelves and hanging objects.','When shaking stops, check yourself and others for injuries.','Evacuate calmly to an open area away from buildings, posts and wires.','Expect aftershocks. Do not re-enter until officials say it is safe.'],
      avoid:['Do not run outside during shaking.','Do not stand in doorways or near glass.','Do not use elevators.'] },
    { title:'Medical Emergency', icon:'cross', summary:'Sample steps while waiting for help.',
      steps:['Check that the area is safe, then check if the person responds.','Call 911 and the campus clinic. Give the exact location.','Send someone to meet responders at the gate.','Control heavy bleeding with firm pressure using a clean cloth.','If trained, give CPR or use an AED if one is available.'],
      avoid:['Do not move a person with a suspected neck or back injury unless in danger.','Do not give food or drink to an unresponsive person.'] },
    { title:'Typhoon and Flood', icon:'droplet', summary:'Sample steps when a storm or flooding is expected.',
      steps:['Follow official class suspension and weather advisories.','Move to the upper floors or a designated safe building if water rises.','Stay away from low areas, canals and downed power lines.','Switch off electrical equipment if safe to do so.','Report trapped or injured people to responders.'],
      avoid:['Do not walk or drive through floodwater.','Do not touch wet electrical equipment.'] },
    { title:'Security Threat or Intruder', icon:'shield', summary:'Sample steps for a suspicious person or violent threat.',
      steps:['Move away from the threat if you can do so safely and alert others.','Call 911 and campus security as soon as it is safe.','If you cannot leave, lock or block the door, silence phones and stay out of sight.','Give responders clear information: location, description, direction of travel.','Follow instructions from responders and keep your hands visible.'],
      avoid:['Do not confront the person.','Do not post rumors online during the incident.'] },
    { title:'Chemical or Laboratory Hazard', icon:'zap', summary:'Sample steps for a spill, gas smell or electrical hazard.',
      steps:['Alert people nearby and leave the area. Keep upwind if outdoors.','Call the laboratory in charge, campus security and 911 if needed.','Remove contaminated clothing and rinse skin or eyes with clean water for several minutes.','Keep others away until trained responders clear the area.'],
      avoid:['Do not try to clean up an unknown spill.','Do not mix or move unlabeled chemicals.'] },
    { title:'General Evacuation', icon:'pin', summary:'Sample steps for any building evacuation.',
      steps:['Stop what you are doing and take only essentials such as your phone.','Walk to the nearest exit. Help those who need assistance.','Go to the assigned evacuation or assembly area.','Join your class or office group for roll call.','Stay until an official tells you it is safe to return.'],
      avoid:['Do not block exits or stairways.','Do not leave the assembly area without checking in.'] }
  ],

  // Built-in campus-wide notifications (shown to everyone).
  NOTES: [
    { id:'n1', title:'Welcome to CampusSafe', message:'Locations, contacts and procedures shown are samples. Verify them with the school before real-world use.', level:'info', link:'#/guides', created:'2026-10-01T08:00:00+08:00' },
    { id:'n2', title:'Sample drill reminder', message:'Review the evacuation areas on the map and note your nearest exit.', level:'warning', link:'#/evacuation', created:'2026-10-02T08:00:00+08:00' }
  ]
};
