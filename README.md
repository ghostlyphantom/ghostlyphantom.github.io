# CampusSafe (static version)
ISUFST San Enrique Campus. Pure HTML, CSS and JavaScript. No PHP, no MySQL, no XAMPP needed.

## Run it
- Quick test: double-click `index.html`.
- Better: from this folder run `python -m http.server 8000` and open http://localhost:8000
- Publish: upload the whole folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, school web hosting). Use https.
- Internet is needed for the map tiles, the Leaflet library and fonts.

## Where to edit
| What | File |
|---|---|
| Emergency contacts (numbers, email, Messenger, website, verified flag) | `assets/js/data.js`, `CONTACTS` |
| Sample map markers and their positions | `assets/js/data.js`, `MARKERS` |
| Map centre and zoom | `assets/js/data.js`, `CENTER` |
| Emergency guides | `assets/js/data.js`, `GUIDES` |
| Built-in notifications | `assets/js/data.js`, `NOTES` |
| Login background photo | replace `assets/img/campus-bg.jpg` |
| Colors and layout | `assets/css/style.css` (variables at the top) |
| Screens and behavior | `assets/js/app.js` |
| Accounts, reports, storage | `assets/js/store.js` |

The map centre is the exact campus point from the school's Google Maps link (Plus Code 3MG6+823): 11.075763, 122.660047.

## Important limits of a static site
- All accounts, reports, markers and photos are saved in the visitor's own browser (localStorage). Nothing is sent to a server.
- Reports are not shared between devices or people. Another phone sees only its own data.
- Login protects accounts on that browser only. Passwords are hashed (PBKDF2-SHA256) but a determined person with access to the same browser can read its data. Do not rely on it for private information.
- Photos are shrunk to about 900 px and stored in the browser, which holds roughly 5 MB in total. The app warns when storage is full.
- Clearing browser data erases everything.

To share reports across everyone, a server and database are needed. The earlier PHP and MySQL version (`campussafe.zip`) does that.

## Contacts: verified versus placeholder
Verified: 911, Philippine Red Cross 143, ISUFST main office (09176246100, (33) 511 5663, president@isufst.edu.ph) and the San Enrique Campus Administrator email (ca_sec@isufst.edu.ph), taken from isufst.edu.ph. All other entries are placeholders with a disabled Call Now button until the school confirms them. To confirm one, add its details in `data.js` and set `verified: true`.
