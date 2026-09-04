#!/usr/bin/env node
/**
 * Erzeugt den Hash fuer ein neues Team-Passwort (Selbst-Registrierung).
 *
 * Verwendung:
 *   node neues-team-passwort.js 'DeinNeuesPasswort'
 *
 * Danach den ausgegebenen Hash in common.js bei HASH_TEAM_PW eintragen
 * und das Klartext-Passwort NUR in ZUGANGSDATEN.md notieren (gitignored).
 * Das Passwort selbst gehoert niemals in eine Datei, die im Repo landet.
 *
 * Verfahren identisch zu hashPw() in common.js:
 * PBKDF2, Salt 'sgrhn-rugby-2026', 100.000 Iterationen, SHA-256, 256 Bit.
 */
const crypto = require('crypto');

const pw = process.argv[2];
if (!pw) {
    console.error("Aufruf: node neues-team-passwort.js 'DeinNeuesPasswort'");
    process.exit(1);
}

crypto.pbkdf2(pw, 'sgrhn-rugby-2026', 100000, 32, 'sha256', (err, key) => {
    if (err) throw err;
    console.log('\nHash fuer HASH_TEAM_PW in common.js:\n');
    console.log(key.toString('hex'));
    console.log('\nErinnerung: Klartext nur in ZUGANGSDATEN.md, nie im Repo.\n');
});
