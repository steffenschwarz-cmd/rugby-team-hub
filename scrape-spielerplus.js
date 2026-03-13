#!/usr/bin/env node
// scrape-spielerplus.js — SpielerPlus → Rugby Team Hub Sync
// Scrapes participation data & events from SpielerPlus, pushes to Firebase.
// Usage: node scrape-spielerplus.js [--dry-run] [--events-only] [--participation-only]

const { chromium } = require(process.env.HOME + '/.claude/skills/daily-video-checklist/node_modules/playwright');
const fs = require('fs');
const https = require('https');
const http = require('http');

// --- Config ---
const CREDS_FILE = process.env.HOME + '/.spielerplus-credentials';
const FIREBASE_DB = 'https://rugby-team-hub-default-rtdb.europe-west1.firebasedatabase.app';
const YEAR = 2026; // Current season year for date parsing

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const EVENTS_ONLY = args.includes('--events-only');
const PARTICIPATION_ONLY = args.includes('--participation-only');

// --- SpielerPlus Name → KADER Full Name ---
const NAME_MAP = {
    'Angelo': 'Angelo Galster',
    'Anton': 'Anton Hanetzok',
    'Basti': 'Sebastian Hildebrandt',
    'Ben Johnston': 'Ben Johnston',
    'Bernhard': null, // Admin/Trainer, skip
    'Chris': 'Christopher Bunge',
    'Connor': 'Connor Peise',
    'Connor P.': 'Connor Peise',
    'Daniel': 'Daniel Kainer',
    'Enrico': 'Enrico Marco Stenzel',
    'Enrico Stenzel': 'Enrico Marco Stenzel',
    'Fabian': 'Fabian Wendt',
    'Felix': 'Felix Berg',
    'Felix Berg': 'Felix Berg',
    'Florian': 'Florian Neumann',
    'Florian N': 'Florian Neumann',
    'Fynn': 'Fynn Lauer',
    'Gustav': 'Gustav Palm',
    'Hannes': 'Hannes Bartelt',
    'Jonas': 'Jonas Hinz',
    'Josh': 'Joshua Walker',
    'Joshua': 'Joshua Walker',
    'Julius': 'Julius Laetsch',
    'Kai': 'Kai Friesicke',
    'Keno': 'Keno Filietz',
    'Kevin': 'Kevin Pilz',
    'Kimi': 'Kimi Döpke',
    'Luca': 'Luca Karim Borgwardt',
    'Lucas': 'Lucas Eichler',
    'Lukas Laetsch': 'Lukas Laetsch',
    'Marcel': 'Marcel Grabow',
    'Marcel G.': 'Marcel Grabow',
    'Mateusz G.': 'Mateusz Grzelak', // New player
    'Matti': 'Matti Erik Eschwe',
    'Maurice': 'Maurice Peter Sankeralli',
    'Max H.': 'Maximilian Hildebrandt',
    'Max L.': 'Max Langer',
    'Micha G.': 'Michael Galster',
    'Michael': 'Michael Galster',
    'Moritz': 'Moritz Janosch',
    'Moritz G.': 'Moritz Gollnick',
    'Moritz Gollnick': 'Moritz Gollnick',
    'Norman': 'Norman Guido Kranert',
    'Oli T.': 'Oliver Tschetsch',
    'Oliver T.': 'Oliver Tschetsch',
    'Paul C.': 'Paul Chukwu',
    'Paul Z.': 'Paul Zyparth',
    'Philip': 'Philip Simon',
    'Rico': 'Rico Schomacker',
    'Robert': 'Robert Woelki',
    'Rooney': 'Ronny Sager',
    'Sarvan': 'Sarvan Aziz',
    'Sascha': 'Sascha Kosanke',
    'Sebastian': 'Sebastian Hildebrandt',
    'Shawn': 'Shawn Ahrens',
    'Silas': 'Silas Rathke',
    'Simon': 'Simon Csehan',
    'Simon Reichelt': 'Simon Reichelt',
    'Steffen': 'Steffen Schwarz',
    'Steven': 'Steven Müller',
    'Theo': 'Theo Schmidt',
    'Tim': 'Tim Förster',
    'Timo': 'Timo Schmidt',
    'Tobi': 'Tobias Ehrlich',
    'Tom K.': 'Tom König',
    'Tom L.': 'Tom Lebus',
    'Tristan': 'Tristan Schöntag',
    'Woelki': 'Robert Woelki',
    'Wolfi': 'Wolf-Dietrich Hildebrandt',
    'Xavier': 'Xavier Mbrim A Fiediek',
};

function resolveName(spName) {
    if (NAME_MAP.hasOwnProperty(spName)) return NAME_MAP[spName];
    // Try to find partial match
    for (const [key, val] of Object.entries(NAME_MAP)) {
        if (spName.startsWith(key)) return val;
    }
    console.error(`[WARN] Unknown player: "${spName}" — not in NAME_MAP`);
    return spName; // Return as-is, can be mapped later
}

// --- Firebase Auth + REST API ---
const FIREBASE_API_KEY = 'AIzaSyAuHnKJHDOQ5y9nUbmZQV9UlSKO2LQqbvc';
let firebaseAuthToken = null;

async function getFirebaseToken() {
    if (firebaseAuthToken) return firebaseAuthToken;
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ returnSecureToken: true });
        const req = https.request({
            method: 'POST',
            hostname: 'identitytoolkit.googleapis.com',
            path: `/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(d);
                    firebaseAuthToken = json.idToken;
                    resolve(firebaseAuthToken);
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function firebaseRequest(method, path, data) {
    const token = await getFirebaseToken();
    return new Promise((resolve, reject) => {
        const url = new URL(path + '.json?auth=' + token, FIREBASE_DB);
        const body = data ? JSON.stringify(data) : null;
        const options = {
            method,
            hostname: url.hostname,
            path: url.pathname + url.search,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) options.headers['Content-Length'] = Buffer.byteLength(body);

        const req = https.request(options, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(d);
                    if (json && json.error) {
                        console.error('Firebase error:', json.error);
                        reject(new Error(json.error));
                    } else {
                        resolve(json);
                    }
                } catch { resolve(d); }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

// --- Date Helpers ---
function parseDate(ddmm) {
    // "12.03" → "2026-03-12"
    const [day, month] = ddmm.split('.');
    return `${YEAR}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function dateToKey(isoDate, type) {
    // "2026-03-12" → "20260312_training"
    return isoDate.replace(/-/g, '') + '_' + type;
}

// --- Main ---
async function main() {
    // 1. Read credentials
    let creds;
    try {
        creds = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
    } catch (e) {
        console.error('Cannot read credentials from', CREDS_FILE);
        process.exit(1);
    }

    console.log('[1/6] Launching browser...');
    const headless = !args.includes('--visible');
    const browser = await chromium.launch({ channel: 'chrome', headless });
    const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await context.newPage();

    try {
        // 2. Login
        console.log('[2/6] Logging into SpielerPlus...');
        await page.goto('https://www.spielerplus.de/site/login', { waitUntil: 'networkidle' });

        // Accept cookies if dialog appears
        try {
            const cookieBtn = page.locator('button:has-text("Okay - einverstanden")');
            if (await cookieBtn.isVisible({ timeout: 2000 })) {
                await cookieBtn.click();
                await page.waitForTimeout(500);
            }
        } catch {}

        // Wait for page to fully load, then handle cookie consent
        await page.waitForTimeout(2000);
        try {
            const cookieBtn2 = page.locator('text=Okay - einverstanden');
            if (await cookieBtn2.isVisible({ timeout: 3000 })) {
                await cookieBtn2.click();
                await page.waitForTimeout(1000);
            }
        } catch {}

        // Fill login form — target visible inputs (skip hidden CSRF)
        await page.locator('input[type="text"]:visible, input[type="email"]:visible, input:visible').first().fill(creds.email);
        await page.locator('input[type="password"]:visible').first().fill(creds.password);
        await page.click('button:has-text("Einloggen")');
        await page.waitForTimeout(3000);

        // Handle team selection page
        if (page.url().includes('select-team')) {
            console.log('  Team selection page — finding team links...');
            const allLinks = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a[href]')).map(a => ({
                    href: a.href, text: a.textContent.trim().substring(0, 60), visible: a.offsetParent !== null
                })).filter(l => l.text.length > 0);
            });
            console.log('  Links found:', JSON.stringify(allLinks.slice(0, 10)));
            // Navigate directly to dashboard
            await page.goto('https://www.spielerplus.de/dashboard/index', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
        }

        if (!page.url().includes('dashboard')) {
            const errorMsg = await page.locator('.alert, .error, .help-block').first().textContent().catch(() => '');
            if (errorMsg) console.log('  Login error:', errorMsg.trim());
            await page.waitForURL('**/dashboard/**', { timeout: 10000 }).catch(() => {});
            if (!page.url().includes('dashboard')) {
                throw new Error('Login failed — still on ' + page.url());
            }
        }
        console.log('  ✓ Login successful');

        let participationData = null;
        let eventsData = null;

        // 3. Scrape Participation
        if (!EVENTS_ONLY) {
            console.log('[3/6] Scraping participation data...');
            await page.goto('https://www.spielerplus.de/participation', { waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);

            participationData = await page.evaluate(() => {
                const tables = document.querySelectorAll('table');
                // Find the detail table (has "Teilnahme" header)
                let detailTable = null;
                for (const t of tables) {
                    const ths = Array.from(t.querySelectorAll('thead th')).map(th => th.textContent.trim());
                    if (ths.includes('Teilnahme')) { detailTable = t; break; }
                }
                if (!detailTable) return { error: 'Participation table not found' };

                // Headers: Spieler, Teilnahme, date1, date2, ...
                const headers = Array.from(detailTable.querySelectorAll('thead th')).map(th => {
                    const link = th.querySelector('a');
                    return {
                        text: th.textContent.trim(),
                        href: link?.href || null,
                        isTraining: link?.href?.includes('/training/') || false,
                        isGame: link?.href?.includes('/game/') || false,
                    };
                });
                const dates = headers.slice(2); // Skip "Spieler" and "Teilnahme"

                // Rows
                const rows = Array.from(detailTable.querySelectorAll('tbody tr')).map(tr => {
                    const cells = Array.from(tr.querySelectorAll('td'));
                    const name = cells[0]?.textContent?.trim();
                    const teilnahme = cells[1]?.textContent?.trim();
                    const statuses = cells.slice(2).map(td => {
                        const svg = td.querySelector('svg');
                        if (!svg) return 'unknown';
                        const icon = svg.getAttribute('data-icon');
                        if (icon === 'participation-yes') return 'Y';
                        if (icon === 'participation-no') return 'N';
                        if (icon === 'circle') return '-';
                        if (icon === 'participation-maybe') return '?';
                        if (icon === 'exclamation') return '!'; // Late/changed
                        if (icon === 'cross') return 'X'; // Excluded
                        return icon;
                    });
                    return { name, teilnahme, statuses };
                });

                return { dates, players: rows };
            });

            if (participationData.error) {
                console.error('  ✗ ' + participationData.error);
            } else {
                console.log(`  ✓ ${participationData.players.length} players, ${participationData.dates.length} sessions`);
            }
        }

        // 4. Scrape Events
        if (!PARTICIPATION_ONLY) {
            console.log('[4/6] Scraping events...');
            await page.goto('https://www.spielerplus.de/events/index', { waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);

            // Load more events to get the full list
            for (let i = 0; i < 5; i++) {
                const moreBtn = page.locator('button:has-text("Mehr Termine laden"):not([disabled])');
                if (await moreBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await moreBtn.click();
                    await page.waitForTimeout(2000);
                } else break;
            }

            eventsData = await page.evaluate(() => {
                const events = [];
                // Find all event links (game or training)
                const eventLinks = document.querySelectorAll('a[href*="/game/view"], a[href*="/training/view"]');
                const seen = new Set();

                eventLinks.forEach(link => {
                    const href = link.href;
                    if (seen.has(href)) return;
                    seen.add(href);

                    const isGame = href.includes('/game/');

                    // The link's direct children contain the date divs
                    const divs = link.querySelectorAll('div');
                    let dayText = '', dateText = '';
                    if (divs.length >= 2) {
                        dayText = divs[0]?.textContent?.trim() || '';
                        dateText = divs[1]?.textContent?.trim() || '';
                    }

                    // After the link, sibling div has type info (for games)
                    const linkParent = link.parentElement;
                    let type = 'training';
                    let opponent = '';
                    let home = null;

                    if (isGame) {
                        type = 'spiel';
                        // The game type div is a sibling of the link
                        const typeDiv = link.nextElementSibling;
                        if (typeDiv) {
                            const typeDivs = typeDiv.querySelectorAll('div');
                            if (typeDivs.length >= 2) {
                                const typeText = typeDivs[0]?.textContent?.trim();
                                opponent = typeDivs[1]?.textContent?.trim() || '';
                                home = typeText === 'Heimspiel';
                            }
                        }
                    }

                    // Walk up to find the event card container
                    // The card contains: link area, time area, rsvp area
                    let card = linkParent;
                    for (let i = 0; i < 5; i++) {
                        if (!card) break;
                        // A card typically has 3+ child divs and is not the tab-pane
                        if (card.children.length >= 3 && !card.id?.includes('tab')) break;
                        card = card.parentElement;
                    }

                    // Extract times from the card
                    let treffen = '', beginn = '', ende = '';
                    if (card) {
                        const allText = card.innerText;
                        const treffenM = allText.match(/Treffen\s*\n?\s*(\d{1,2}:\d{2}|-:-)/);
                        const beginnM = allText.match(/Beginn\s*\n?\s*(\d{1,2}:\d{2}|-:-)/);
                        const endeM = allText.match(/Ende\s*\n?\s*(\d{1,2}:\d{2}|-:-)/);
                        treffen = treffenM?.[1] || '';
                        beginn = beginnM?.[1] || '';
                        ende = endeM?.[1] || '';
                    }

                    // Extract RSVP counts from buttons with numbers
                    let yes = 0, no = 0, open = 0;
                    if (card) {
                        const numButtons = Array.from(card.querySelectorAll('button'))
                            .filter(b => /^\d+$/.test(b.textContent.trim()));
                        if (numButtons.length >= 3) {
                            yes = parseInt(numButtons[0].textContent.trim()) || 0;
                            no = parseInt(numButtons[1].textContent.trim()) || 0;
                            open = parseInt(numButtons[2].textContent.trim()) || 0;
                        }
                    }

                    events.push({
                        href, type, dateText, dayText, opponent, home,
                        treffen, beginn, ende,
                        rsvp: { yes, no, open }
                    });
                });

                return events;
            });

            console.log(`  ✓ ${eventsData.length} events found`);
        }

        await browser.close();

        // 5. Transform participation data → Firebase format
        if (participationData && !participationData.error) {
            console.log('[5/6] Transforming participation data...');
            const sessions = {};
            const unmapped = new Set();

            for (let i = 0; i < participationData.dates.length; i++) {
                const dateInfo = participationData.dates[i];
                const isoDate = parseDate(dateInfo.text);
                const type = dateInfo.isGame ? 'spiel' : 'training';
                const key = dateToKey(isoDate, type);

                const present = {};
                const absent = {};

                for (const player of participationData.players) {
                    const status = player.statuses[i];
                    const fullName = resolveName(player.name);
                    if (fullName === null) continue; // Skip admin/trainer entries

                    if (status === 'Y' || status === '!') {
                        present[fullName] = true;
                    } else if (status === 'N') {
                        absent[fullName] = '';
                    }
                    // '-' (no response) and '?' (maybe) are ignored
                }

                sessions[key] = { date: isoDate, type, present };
                if (Object.keys(absent).length > 0) {
                    sessions[key].absent = absent;
                }
            }

            // 6. Push to Firebase
            if (DRY_RUN) {
                console.log('[6/6] DRY RUN — writing to /tmp/spielerplus-data.json');
                fs.writeFileSync('/tmp/spielerplus-data.json', JSON.stringify({
                    participation: sessions,
                    events: eventsData
                }, null, 2));
                console.log('  ✓ Data written to /tmp/spielerplus-data.json');
            } else {
                console.log('[6/6] Pushing to Firebase...');

                // Merge with existing Firebase data (preserve manual absent reasons)
                const existing = await firebaseRequest('GET', '/trainingsbeteiligung');
                for (const [key, session] of Object.entries(sessions)) {
                    if (existing && existing[key] && existing[key].absent) {
                        // Preserve existing absent reasons
                        for (const [name, reason] of Object.entries(existing[key].absent)) {
                            if (session.absent && session.absent[name] !== undefined && reason) {
                                session.absent[name] = reason; // Keep manual reason
                            }
                        }
                    }
                }

                await firebaseRequest('PATCH', '/trainingsbeteiligung', sessions);
                console.log(`  ✓ ${Object.keys(sessions).length} sessions pushed to Firebase`);

                // Push events if available
                if (eventsData) {
                    const eventsFormatted = {};
                    for (const ev of eventsData) {
                        if (ev.type !== 'spiel') continue;
                        const isoDate = parseDate(ev.dateText);
                        const key = isoDate.replace(/-/g, '');
                        eventsFormatted[key] = {
                            date: isoDate,
                            time: ev.beginn || '00:00',
                            opponent: ev.opponent,
                            home: ev.home,
                            rsvp: ev.rsvp,
                        };
                    }
                    if (Object.keys(eventsFormatted).length > 0) {
                        await firebaseRequest('PATCH', '/spiele', eventsFormatted);
                        console.log(`  ✓ ${Object.keys(eventsFormatted).length} games pushed to Firebase`);
                    }
                }
            }
        }

        // Output summary
        if (participationData && !participationData.error) {
            console.log('\n--- Participation Summary ---');
            const sorted = [...participationData.players]
                .filter(p => resolveName(p.name) !== null)
                .sort((a, b) => {
                    const pctA = parseInt(a.teilnahme.match(/(\d+)%/)?.[1] || '0');
                    const pctB = parseInt(b.teilnahme.match(/(\d+)%/)?.[1] || '0');
                    return pctB - pctA;
                });
            for (const p of sorted.slice(0, 15)) {
                const fullName = resolveName(p.name);
                console.log(`  ${p.teilnahme.padEnd(15)} ${fullName}`);
            }
        }

        if (eventsData) {
            console.log('\n--- Upcoming Events ---');
            for (const ev of eventsData.slice(0, 8)) {
                const icon = ev.type === 'spiel' ? (ev.home ? '🏠' : '✈️') : '🏉';
                const rsvp = `${ev.rsvp.yes}/${ev.rsvp.no}/${ev.rsvp.open}`;
                console.log(`  ${icon} ${ev.dateText} ${ev.beginn || ''} ${ev.opponent || ev.type} (${rsvp})`);
            }
        }

        console.log('\nDone!');

    } catch (err) {
        console.error('Error:', err.message);
        await browser.close();
        process.exit(1);
    }
}

main();
