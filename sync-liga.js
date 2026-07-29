#!/usr/bin/env node
// sync-liga.js — Liga-Sync für den Rugby Team Hub
// Holt Spielplan, Ergebnisse und Tabelle beider Ligen und schreibt data/liga.json.
//   Liga 1: 2. Bundesliga Nord/Ost (1. XV) — rugbydeutschland.org (Next.js, Flight-Payloads im HTML)
//   Liga 2: Regionalliga Ost (2. XV "SG Oberhavel") — SportsPress-REST-API auf bits-rugby-ls.de
// Läuft täglich in GitHub Actions. Nur Node-Builtins, keine npm-Dependencies.
// Usage: node sync-liga.js [--dry-run]

const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const OUT_FILE = path.join(__dirname, 'data', 'liga.json');
const USER_AGENT = 'rugby-team-hub-sync/1.0';

// --- Liga 1: 2. Bundesliga Nord/Ost ---
const DRV_LEAGUE = 2162;
const DRV_SPIELE_URL = `https://www.rugbydeutschland.org/spiele-81794v4/leagues/${DRV_LEAGUE}`;
const DRV_TABELLE_URL = `https://www.rugbydeutschland.org/tabellen-81792v4/leagues/${DRV_LEAGUE}`;
const DRV_OUR_TEAM_ID = 322278; // SG Rugbyunion Hohen Neuendorf e.V.
const DRV_OUR_TEAM_MATCH = 'hohen neuendorf'; // Fallback, falls sich die ID ändert

// --- Liga 2: Regionalliga Ost ---
const BITS_API = 'https://bits-rugby-ls.de/wp-json/sportspress/v2';
const BITS_TEAM_SEARCH = 'Oberhavel';

// ---------------------------------------------------------------- HTTP

function httpGet(url, redirects = 0) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const req = https.request({
            method: 'GET',
            hostname: u.hostname,
            path: u.pathname + u.search,
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': '*/*',
                'Accept-Language': 'de-DE,de;q=0.9',
            },
        }, res => {
            const loc = res.headers.location;
            if (res.statusCode >= 300 && res.statusCode < 400 && loc) {
                res.resume();
                if (redirects >= 5) return reject(new Error('Zu viele Redirects: ' + url));
                return resolve(httpGet(new URL(loc, url).toString(), redirects + 1));
            }
            const chunks = [];
            let stream = res;
            const enc = (res.headers['content-encoding'] || '').toLowerCase();
            if (enc === 'gzip') stream = res.pipe(zlib.createGunzip());
            else if (enc === 'deflate') stream = res.pipe(zlib.createInflate());
            else if (enc === 'br') stream = res.pipe(zlib.createBrotliDecompress());
            stream.on('data', c => chunks.push(c));
            stream.on('end', () => resolve({
                status: res.statusCode,
                headers: res.headers,
                body: Buffer.concat(chunks).toString('utf8'),
            }));
            stream.on('error', reject);
        });
        req.on('error', reject);
        req.setTimeout(30000, () => req.destroy(new Error('Timeout: ' + url)));
        req.end();
    });
}

async function getJson(url) {
    const res = await httpGet(url);
    if (res.status !== 200) throw new Error(`HTTP ${res.status} bei ${url}`);
    return { json: JSON.parse(res.body), headers: res.headers };
}

// ---------------------------------------------------- Next.js Flight-Payload

// Die Nutzdaten stecken in self.__next_f.push([1,"<JSON-String>"])-Aufrufen.
// Jeder Capture ist ein JSON-String-Literal; dekodiert und konkateniert
// ergeben sie den vollständigen Flight-Stream.
function extractFlightText(html) {
    const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)<\/script>/gs;
    let out = '';
    let m;
    while ((m = re.exec(html)) !== null) {
        try { out += JSON.parse(m[1]); } catch { /* defektes Fragment überspringen */ }
    }
    return out;
}

// Schneidet ab `marker` (endet auf '[') per Klammer-Balance das Array heraus.
// Strings/Escapes werden dabei übersprungen, damit Klammern im Text nicht zählen.
function sliceArrayAt(text, openIdx) {
    let depth = 0, inStr = false, esc = false;
    for (let i = openIdx; i < text.length; i++) {
        const ch = text[i];
        if (inStr) {
            if (esc) esc = false;
            else if (ch === '\\') esc = true;
            else if (ch === '"') inStr = false;
            continue;
        }
        if (ch === '"') inStr = true;
        else if (ch === '[' || ch === '{') depth++;
        else if (ch === ']' || ch === '}') {
            depth--;
            if (depth === 0) return text.slice(openIdx, i + 1);
        }
    }
    return null;
}

// Sucht alle Vorkommen von `"<key>":[` und liefert das längste parsebare Array.
function extractArray(text, key) {
    const marker = `"${key}":[`;
    let best = null;
    let from = 0;
    for (;;) {
        const idx = text.indexOf(marker, from);
        if (idx === -1) break;
        from = idx + marker.length;
        const raw = sliceArrayAt(text, idx + marker.length - 1);
        if (!raw) continue;
        try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr) && (!best || arr.length > best.length)) best = arr;
        } catch { /* Fragment nicht parsebar — nächstes Vorkommen probieren */ }
    }
    return best;
}

// ---------------------------------------------------------------- Liga 1

// name = sauberer Vereinsname; full_name hängt " 1 (Senior M)" an.
function drvTeamName(team) {
    if (!team || typeof team !== 'object') return null;
    return team.name || team.full_name || null;
}

function isOurDrvTeam(team) {
    if (!team || typeof team !== 'object') return false;
    if (Number(team.id) === DRV_OUR_TEAM_ID) return true;
    const name = (drvTeamName(team) || '').toLowerCase();
    return name.includes(DRV_OUR_TEAM_MATCH);
}

async function fetchBundesliga() {
    const spieleHtml = (await httpGet(DRV_SPIELE_URL)).body;
    const games = extractArray(extractFlightText(spieleHtml), 'games') || [];

    const spiele = [];
    for (const g of games) {
        if (!g || typeof g !== 'object') continue; // Referenz-String statt Objekt
        const home = drvTeamName(g.team1);
        const away = drvTeamName(g.team2);
        if (!home || !away || typeof g.start_date !== 'string') continue;

        // Zeitzonen-Falle: der Offset im start_date ist unzuverlässig, der
        // Zeitanteil IST bereits Ortszeit Berlin → nur den String zerlegen.
        const date = g.start_date.slice(0, 10);
        const time = g.start_date.slice(11, 16);
        // "gespielt" = score1 vorhanden; das completed-Flag ist unbrauchbar.
        const played = g.score1 !== undefined && g.score1 !== null;
        const round = Number.parseInt(g.game_day, 10);
        const ourHome = isOurDrvTeam(g.team1);
        const ourAway = isOurDrvTeam(g.team2);

        spiele.push({
            date,
            time,
            round: Number.isFinite(round) ? round : null,
            home,
            away,
            scoreHome: played ? Number(g.score1) : null,
            scoreAway: played ? Number(g.score2) : null,
            ourGame: ourHome || ourAway,
            homeGame: ourHome,
        });
    }
    spiele.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    const tabelleHtml = (await httpGet(DRV_TABELLE_URL)).body;
    const rows = extractArray(extractFlightText(tabelleHtml), 'rows') || [];

    const tabelle = [];
    for (const r of rows) {
        if (!r || typeof r !== 'object') continue;
        const group = r.group;
        const team = drvTeamName(group);
        if (!team) continue;
        // Reihenfolge im Array = Platzierung (die Rows haben kein pos-Feld).
        // Vor Saisonstart fehlen die stat*-Felder komplett.
        tabelle.push({
            pos: tabelle.length + 1,
            team,
            played: Number(r.stat2 ?? 0),
            won: Number(r.stat3 ?? 0),
            drawn: Number(r.stat4 ?? 0),
            lost: Number(r.stat5 ?? 0),
            pf: Number(r.stat6 ?? 0),
            pa: Number(r.stat7 ?? 0),
            diff: Number(r.stat8 ?? 0),
            points: Number(r.stat1 ?? 0),
            our: isOurDrvTeam(group),
        });
    }

    return { spiele, tabelle };
}

// ---------------------------------------------------------------- Liga 2

// Saison-Label wie in den SportsPress-Terms: ab Juli beginnt die neue Saison.
// SEASON_START_YEAR überschreibt das nur zum Testen älterer Saisons.
function seasonLabels(now = new Date()) {
    const year = now.getFullYear();
    const override = Number.parseInt(process.env.SEASON_START_YEAR, 10);
    const startYear = Number.isFinite(override)
        ? override
        : (now.getMonth() + 1 >= 7 ? year : year - 1);
    return {
        full: `${startYear}/${startYear + 1}`, // Term-Name, z.B. "2026/2027"
        short: `${startYear}/${String(startYear + 1).slice(-2)}`, // Anzeige, z.B. "2026/27"
    };
}

function num(v) {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

// WordPress liefert Titel HTML-kodiert ("SG Halle/Leipzig &#8211; II").
function decodeEntities(s) {
    return s
        .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;|&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim();
}

async function fetchRegionalliga(seasonFull) {
    const { json: seasons } = await getJson(`${BITS_API}/seasons?per_page=100`);
    const season = (Array.isArray(seasons) ? seasons : []).find(s => s && s.name === seasonFull);
    if (!season) {
        return { spiele: [], tabelle: [], hinweis: 'Saison noch nicht angelegt' };
    }

    // League-ID nicht hartkodieren: die Terms sind saisonabhängig. Das Team-Objekt
    // trägt die passende Saison in seasons[] und die Liga in leagues[].
    const { json: teams } = await getJson(
        `${BITS_API}/teams?per_page=100&search=${encodeURIComponent(BITS_TEAM_SEARCH)}`);
    const ourTeam = (Array.isArray(teams) ? teams : []).find(t =>
        t && Array.isArray(t.seasons) && t.seasons.map(Number).includes(Number(season.id)) &&
        Array.isArray(t.leagues) && t.leagues.length > 0);
    if (!ourTeam) {
        return { spiele: [], tabelle: [], hinweis: 'Saison noch nicht angelegt' };
    }
    const leagueId = Number(ourTeam.leagues[0]);
    const ourTeamId = Number(ourTeam.id);

    // Tabelle zuerst: liefert nebenbei die Team-Namen (id → name) für die Events.
    const { json: tables } = await getJson(
        `${BITS_API}/tables?leagues=${leagueId}&seasons=${season.id}`);
    const table = Array.isArray(tables) ? tables[0] : null;
    const nameCache = new Map();
    const tabelle = [];
    if (table && table.data && typeof table.data === 'object') {
        for (const [id, row] of Object.entries(table.data)) {
            if (!row || typeof row !== 'object') continue;
            if (row.name) nameCache.set(String(id), String(row.name));
            const pos = Number.parseInt(row.pos, 10);
            if (!Number.isFinite(pos)) continue; // Key "0" = Spaltenköpfe
            tabelle.push({
                pos,
                team: String(row.name || id),
                played: num(row.p),
                won: num(row.w),
                drawn: num(row.d),
                lost: num(row.l),
                pf: num(row.pf),
                pa: num(row.pa),
                diff: num(row.pd),
                points: num(row.pts),
                our: Number(id) === ourTeamId,
            });
        }
        tabelle.sort((a, b) => a.pos - b.pos);
    }

    async function teamName(id) {
        const key = String(id);
        if (nameCache.has(key)) return nameCache.get(key);
        let name = key;
        try {
            const { json } = await getJson(`${BITS_API}/teams/${id}`);
            const rendered = json && ((json.title && json.title.rendered) || (json.name && json.name.rendered));
            if (rendered) name = decodeEntities(String(rendered));
        } catch { /* Name bleibt die ID — besser als Abbruch */ }
        nameCache.set(key, name);
        return name;
    }

    // Events: teams=-Filter wird still ignoriert, status= liefert 400 → alles holen.
    const events = [];
    let page = 1;
    let totalPages = 1;
    do {
        const url = `${BITS_API}/events?leagues=${leagueId}&seasons=${season.id}` +
            `&per_page=100&page=${page}&orderby=date&order=asc`;
        const { json, headers } = await getJson(url);
        if (Array.isArray(json)) events.push(...json);
        const tp = Number.parseInt(headers['x-wp-totalpages'], 10);
        if (Number.isFinite(tp)) totalPages = tp;
        page++;
    } while (page <= totalPages && page <= 10);

    const spiele = [];
    for (const e of events) {
        if (!e || typeof e !== 'object') continue;
        const ids = Array.isArray(e.teams) ? e.teams.map(Number) : [];
        if (ids.length < 2 || typeof e.date !== 'string') continue;
        // Der Titel enthält HTML-Entities → Zuordnung ausschließlich über teams[]-IDs.
        if (!ids.includes(ourTeamId)) continue;

        const results = Array.isArray(e.main_results)
            ? e.main_results
            : (e.main_results && typeof e.main_results === 'object' ? Object.values(e.main_results) : []);
        const played = results.length >= 2 && results[0] !== '' && results[0] !== null &&
            results[1] !== '' && results[1] !== null;
        const roundMatch = typeof e.day === 'string' ? e.day.match(/(\d+)/) : null;

        spiele.push({
            date: e.date.slice(0, 10),
            time: e.date.slice(11, 16),
            round: roundMatch ? Number.parseInt(roundMatch[1], 10) : null,
            home: await teamName(ids[0]),
            away: await teamName(ids[1]),
            scoreHome: played ? num(results[0]) : null,
            scoreAway: played ? num(results[1]) : null,
            ourGame: true,
            homeGame: ids[0] === ourTeamId,
        });
    }
    spiele.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    return { spiele, tabelle };
}

// ---------------------------------------------------------------- Main

(async () => {
    const { full: seasonFull, short: seasonShort } = seasonLabels();
    console.log(`Liga-Sync — Saison ${seasonShort}${DRY_RUN ? ' (DRY RUN)' : ''}`);

    const bl = await fetchBundesliga();
    console.log(`2. Bundesliga: ${bl.spiele.length} Spiele, ${bl.tabelle.length} Tabellenzeilen ` +
        `(davon ${bl.spiele.filter(s => s.ourGame).length} eigene)`);
    if (bl.spiele.length < 1) {
        console.error('Fehler: keine Bundesliga-Spiele geparst — Quelle oder Parser defekt.');
        process.exit(1);
    }

    let rl;
    try {
        rl = await fetchRegionalliga(seasonFull);
    } catch (e) {
        console.error('Regionalliga-Abruf fehlgeschlagen:', e.message);
        process.exit(1);
    }
    if (rl.hinweis) console.log(`Regionalliga: ${rl.hinweis}`);
    else console.log(`Regionalliga: ${rl.spiele.length} Spiele, ${rl.tabelle.length} Tabellenzeilen`);

    const out = {
        updatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
        bl: {
            liga: '2. Bundesliga Nord/Ost',
            saison: seasonShort,
            spiele: bl.spiele,
            tabelle: bl.tabelle,
        },
        rl: {
            liga: 'Regionalliga Ost',
            saison: seasonShort,
            spiele: rl.spiele,
            tabelle: rl.tabelle,
        },
    };
    if (rl.hinweis) out.rl.hinweis = rl.hinweis;

    if (DRY_RUN) {
        console.log(JSON.stringify(out, null, 2));
        return;
    }
    // Nur schreiben, wenn sich außer updatedAt etwas geändert hat —
    // sonst committet der Actions-Job täglich einen reinen Zeitstempel-Diff.
    try {
        const prev = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
        const strip = o => JSON.stringify({ ...o, updatedAt: null });
        if (strip(prev) === strip(out)) {
            console.log('Keine inhaltlichen Änderungen — data/liga.json bleibt unverändert.');
            return;
        }
    } catch {}
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
    console.log(`✓ Geschrieben: ${OUT_FILE}`);
})().catch(e => { console.error('Fehler:', e.message); process.exit(1); });
