#!/usr/bin/env node
// season-reset.js — Trainingsbeteiligung: alte Saison archivieren, Statistik bei null starten
// Verschiebt alle Sessions mit Datum < SEASON_START von /trainingsbeteiligung
// nach /trainingsbeteiligung_archiv_2025_26. Einmalig zum Saisonwechsel ausführen.
// Usage: node season-reset.js [--dry-run]

const https = require('https');

const FIREBASE_DB = 'https://rugby-team-hub-default-rtdb.europe-west1.firebasedatabase.app';
const FIREBASE_API_KEY = 'AIzaSyAuHnKJHDOQ5y9nUbmZQV9UlSKO2LQqbvc';
const SEASON_START = process.env.SEASON_START || '2026-07-22';
const ARCHIVE_PATH = '/trainingsbeteiligung_archiv_2025_26';
const DRY_RUN = process.argv.includes('--dry-run');

let token = null;
function getToken() {
    if (token) return Promise.resolve(token);
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ returnSecureToken: true });
        const req = https.request({
            method: 'POST', hostname: 'identitytoolkit.googleapis.com',
            path: `/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { token = JSON.parse(d).idToken; resolve(token); } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function fb(method, path, data) {
    const t = await getToken();
    return new Promise((resolve, reject) => {
        const url = new URL(path + '.json?auth=' + t, FIREBASE_DB);
        const body = data !== undefined ? JSON.stringify(data) : null;
        const options = {
            method, hostname: url.hostname, path: url.pathname + url.search,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) options.headers['Content-Length'] = Buffer.byteLength(body);
        const req = https.request(options, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(d);
                    if (json && json.error) reject(new Error(json.error));
                    else resolve(json);
                } catch { resolve(d); }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

(async () => {
    console.log(`Saison-Reset: Stichtag ${SEASON_START}${DRY_RUN ? ' (DRY RUN)' : ''}`);
    const all = await fb('GET', '/trainingsbeteiligung');
    if (!all || Object.keys(all).length === 0) {
        console.log('Keine Sessions in /trainingsbeteiligung — nichts zu tun.');
        return;
    }
    const toArchive = {};
    const toDelete = {};
    let keep = 0;
    for (const [key, session] of Object.entries(all)) {
        if (session && session.date && session.date < SEASON_START) {
            toArchive[key] = session;
            toDelete[key] = null;
        } else {
            keep++;
        }
    }
    console.log(`${Object.keys(toArchive).length} Sessions archivieren, ${keep} bleiben (neue Saison).`);
    if (Object.keys(toArchive).length === 0) return;

    if (DRY_RUN) {
        console.log('DRY RUN — Keys:', Object.keys(toArchive).join(', '));
        return;
    }
    // Firebase-Regeln erlauben keine neuen Top-Level-Pfade → Archiv als Datei im Repo (versioniert via Git)
    const fs = require('fs');
    const archiveFile = __dirname + '/trainingsbeteiligung-archiv-2025-26.json';
    const existing = fs.existsSync(archiveFile) ? JSON.parse(fs.readFileSync(archiveFile, 'utf8')) : {};
    fs.writeFileSync(archiveFile, JSON.stringify({ ...existing, ...toArchive }, null, 2));
    console.log(`✓ Archiv geschrieben: ${archiveFile}`);
    // Erst löschen, nachdem das Archiv sicher geschrieben wurde
    await fb('PATCH', '/trainingsbeteiligung', toDelete);
    console.log('✓ Alte Sessions aus /trainingsbeteiligung entfernt — Statistik startet bei null.');
})().catch(e => { console.error('Fehler:', e.message); process.exit(1); });
