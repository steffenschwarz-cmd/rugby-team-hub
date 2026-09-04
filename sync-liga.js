#!/usr/bin/env node
// sync-liga.js — Liga-Sync für den Rugby Team Hub
// Holt Spielplan, Ergebnisse und Tabelle der Regionalliga Ost und schreibt data/liga.json.
// Seit der Zusammenlegung von 1. XV und 2. XV hat der Verein nur noch EINE Mannschaft:
// "SG Oberhavel" in der Regionalliga Ost. Die 2. Bundesliga Nord/Ost ist damit raus —
// der frühere rugbydeutschland.org-Parser wurde ersatzlos entfernt.
// Quelle: SportsPress-REST-API auf bits-rugby-ls.de (inoffiziell, aber die einzige
// maschinenlesbare Quelle für die Regionalliga).
// Läuft täglich in GitHub Actions. Nur Node-Builtins, keine npm-Dependencies.
// Usage: node sync-liga.js [--dry-run]

const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const OUT_FILE = path.join(__dirname, 'data', 'liga.json');
const USER_AGENT = 'rugby-team-hub-sync/1.0';

// --- Regionalliga Ost ---
const BITS_API = 'https://bits-rugby-ls.de/wp-json/sportspress/v2';
const BITS_TEAM_SEARCH = 'Oberhavel'; // Team-ID ist aktuell 2539 — NICHT hartkodieren,
                                      // sie kann sich mit einer neuen Saison ändern.

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
    try {
        return { json: JSON.parse(res.body), headers: res.headers };
    } catch (e) {
        throw new Error(`Antwort von ${url} ist kein JSON: ${e.message}`);
    }
}

// ---------------------------------------------------------------- Helfer

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

// ---------------------------------------------------------- Regionalliga Ost

// Wirft bei allem, was auf einen Defekt hindeutet (HTTP, JSON, Team komplett
// unauffindbar) — der Aufrufer macht daraus Exit 1. Ein *leeres, aber plausibles*
// Ergebnis (Saison noch nicht angelegt, Team noch nicht eingetragen, Spielplan
// noch nicht veröffentlicht) kommt dagegen als { hinweis } zurück und ist okay.
async function fetchRegionalliga(seasonFull) {
    const { json: seasons } = await getJson(`${BITS_API}/seasons?per_page=100`);
    const season = (Array.isArray(seasons) ? seasons : []).find(s => s && s.name === seasonFull);
    if (!season) {
        // Normalzustand direkt nach dem Saisonwechsel: der Term existiert noch nicht.
        return { spiele: [], tabelle: [], hinweis: `Saison ${seasonFull} noch nicht angelegt` };
    }

    // League-ID nicht hartkodieren: die Terms sind saisonabhängig. Das Team-Objekt
    // trägt die passende Saison in seasons[] und die Liga in leagues[].
    const { json: teams } = await getJson(
        `${BITS_API}/teams?per_page=100&search=${encodeURIComponent(BITS_TEAM_SEARCH)}`);
    const found = Array.isArray(teams) ? teams.filter(t => t && t.id) : [];
    if (found.length === 0) {
        // Kein einziges Team namens "Oberhavel" — das ist kein Saison-Effekt, sondern
        // ein Bruch (Umbenennung, geänderte Suche, kaputte API). Muss rot werden.
        throw new Error(`Kein Team zu "${BITS_TEAM_SEARCH}" gefunden — Quelle oder Suchbegriff defekt.`);
    }

    const ourTeam = found.find(t =>
        Array.isArray(t.seasons) && t.seasons.map(Number).includes(Number(season.id)) &&
        Array.isArray(t.leagues) && t.leagues.length > 0);
    if (!ourTeam) {
        // Team existiert, ist aber für diese Saison noch nicht in einer Liga eingetragen.
        return { spiele: [], tabelle: [], hinweis: `Team noch nicht in Saison ${seasonFull} eingetragen` };
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

        // main_results leer = Spiel noch nicht gespielt (kein Ergebnis eingetragen).
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

    // Liga sauber aufgelöst, aber (noch) kein Spielplan veröffentlicht: legitim,
    // kein Fehler. Eine leere Tabelle ist vor dem ersten Spieltag ebenfalls normal.
    if (spiele.length === 0) {
        return { spiele, tabelle, hinweis: 'Noch keine Spiele im Spielplan' };
    }
    return { spiele, tabelle };
}

// ---------------------------------------------------------------- Main

(async () => {
    const { full: seasonFull, short: seasonShort } = seasonLabels();
    console.log(`Liga-Sync — Regionalliga Ost, Saison ${seasonShort}${DRY_RUN ? ' (DRY RUN)' : ''}`);

    let rl;
    try {
        rl = await fetchRegionalliga(seasonFull);
    } catch (e) {
        // Netzwerk, HTTP, JSON, Team unauffindbar → rot laufen lassen, statt still
        // leere Daten zu schreiben. data/liga.json bleibt dabei unangetastet.
        console.error('Regionalliga-Abruf fehlgeschlagen:', e.message);
        process.exit(1);
    }

    console.log(`Regionalliga: ${rl.spiele.length} Spiele, ${rl.tabelle.length} Tabellenzeilen`);
    if (rl.hinweis) {
        // Absichtlich stdout und Exit 0: außerhalb der Saison bzw. vor Saison-Anlage
        // liefert die Quelle legitimerweise nichts — der Actions-Lauf bleibt grün.
        console.log(`Hinweis: ${rl.hinweis} — das ist außerhalb der Saison normal.`);
    }

    const out = {
        updatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
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
