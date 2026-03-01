// ===== common.js — Shared utilities for Rugby Team Hub =====

// --- 1. PBKDF2 Hashing (salted, 100k iterations) ---
async function hashPw(pw) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    const salt = enc.encode('sgrhn-rugby-2026');
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
    return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- 2. Firebase Init ---
function initFirebase() {
    firebase.initializeApp({
        apiKey: "AIzaSyAuHnKJHDOQ5y9nUbmZQV9UlSKO2LQqbvc",
        authDomain: "rugby-team-hub.firebaseapp.com",
        databaseURL: "https://rugby-team-hub-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "rugby-team-hub",
        storageBucket: "rugby-team-hub.firebasestorage.app",
        messagingSenderId: "484420740610",
        appId: "1:484420740610:web:65c1dbf3aadb985281e91b"
    });
    return firebase.database();
}

// --- 3. Role System ---
const ROLE_TEAM = 'team';
const ROLE_RAT = 'rat';
const ROLE_TRAINER = 'trainer';
const ROLE_LEVEL = { team: 1, rat: 2, trainer: 3 };

// Team password hash (ScrumHN!2026 — for self-registration verification)
const HASH_TEAM_PW = '33f84f2c5805511205b3326108feae31fbcff92b76a700ede20d94450a30a474';

function getStoredRole() { return localStorage.getItem('sgrhn_role'); }
function getStoredUserName() { return localStorage.getItem('sgrhn_user_name'); }
function getStoredUserId() { return localStorage.getItem('sgrhn_user_id'); }

function hasAccess(minRole) {
    const role = getStoredRole();
    if (!role || !ROLE_LEVEL[role] || !ROLE_LEVEL[minRole]) return false;
    return ROLE_LEVEL[role] >= ROLE_LEVEL[minRole];
}

function isTrainer() { return getStoredRole() === ROLE_TRAINER; }

// --- 4. Session Management ---
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 Tage
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 1000;
let loginAttempts = 0;
let lockedUntil = 0;

function isSessionValid() {
    const role = localStorage.getItem('sgrhn_role');
    const ts = parseInt(localStorage.getItem('sgrhn_session_ts') || '0', 10);
    if (!role) return false;
    if (Date.now() - ts > SESSION_MAX_AGE) {
        clearSession();
        return false;
    }
    return true;
}

function clearSession() {
    localStorage.removeItem('sgrhn_role');
    localStorage.removeItem('sgrhn_user_name');
    localStorage.removeItem('sgrhn_user_id');
    localStorage.removeItem('sgrhn_session_ts');
}

function migrateOldSession() {
    const oldKeys = ['sgrhn_auth', 'sgrhn_auth_ts', 'sgrhn_rat_auth', 'sgrhn_rat_auth_ts',
                     'sgrhn_trainer_auth', 'sgrhn_trainer_auth_ts'];
    const hadOld = oldKeys.some(k => localStorage.getItem(k) !== null);
    if (hadOld) oldKeys.forEach(k => localStorage.removeItem(k));
    return hadOld;
}

// --- 5. Login Gate ---
let usersCache = null;

async function loadUsers(db) {
    if (usersCache) return usersCache;
    try {
        const snapshot = await db.ref('users').once('value');
        const data = snapshot.val();
        if (data) usersCache = data;
    } catch (err) {
        console.warn('Failed to load users from Firebase', err);
    }
    return usersCache || {};
}

function setupLogin({ db, minRole, onUnlock } = {}) {
    migrateOldSession();

    // Firebase anonymous auth (needed for reading/writing users)
    if (db) {
        firebase.auth().signInAnonymously().catch(err => {
            console.warn('Firebase anonymous auth failed', err);
        });
    }

    function completeLogin(role) {
        if (minRole && !hasAccess(minRole)) {
            showAccessDenied();
            return;
        }
        onUnlock();
        filterNav(role);
        addLogoutButton();
    }

    function checkSession() {
        if (isSessionValid()) {
            completeLogin(getStoredRole());
        }
    }

    async function tryLogin() {
        const errEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');
        if (Date.now() < lockedUntil) {
            const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
            errEl.textContent = `Zu viele Versuche. Bitte ${secs}s warten.`;
            errEl.style.display = 'block';
            return;
        }
        const code = document.getElementById('login-pw').value.trim();
        if (!code) return;

        btn.disabled = true;
        btn.textContent = '...';

        const hash = await hashPw(code);
        const users = await loadUsers(db);

        let matched = null;
        for (const [uid, user] of Object.entries(users)) {
            if (user.active && user.codeHash === hash) {
                matched = { id: uid, ...user };
                break;
            }
        }

        btn.disabled = false;
        btn.textContent = 'Einloggen';

        if (matched) {
            loginAttempts = 0;
            localStorage.setItem('sgrhn_role', matched.role);
            localStorage.setItem('sgrhn_user_name', matched.name);
            localStorage.setItem('sgrhn_user_id', matched.id);
            localStorage.setItem('sgrhn_session_ts', String(Date.now()));
            completeLogin(matched.role);
        } else {
            loginAttempts++;
            if (loginAttempts >= MAX_ATTEMPTS) {
                lockedUntil = Date.now() + LOCKOUT_MS;
                errEl.textContent = 'Zu viele Versuche. 30 Sekunden gesperrt.';
                btn.disabled = true;
                setTimeout(() => { btn.disabled = false; errEl.textContent = 'Falscher Code.'; }, LOCKOUT_MS);
            } else {
                errEl.textContent = `Falscher Code. (${MAX_ATTEMPTS - loginAttempts} Versuche \u00fcbrig)`;
            }
            errEl.style.display = 'block';
            document.getElementById('login-pw').value = '';
        }
    }

    function showAccessDenied() {
        const gate = document.getElementById('login-gate');
        gate.classList.remove('hidden');
        gate.querySelector('.login-box').innerHTML = `
            <h2>Kein Zugang</h2>
            <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem;">
                Diese Seite erfordert eine h&ouml;here Berechtigung.
            </p>
            <a href="index.html" style="color:var(--accent);">&larr; Zur&uuml;ck zum Hub</a>
            <br><br>
            <a href="#" onclick="clearSession();location.reload();return false;" style="color:var(--text-muted);font-size:0.8rem;">Anderen Account verwenden</a>
        `;
    }

    // --- Registration Form ---
    async function showRegisterForm() {
        const loginBox = document.querySelector('.login-box');

        // Load existing users to mark already-registered names
        const users = await loadUsers(db);
        const takenNames = new Set();
        if (users) {
            for (const u of Object.values(users)) {
                if (u.active) takenNames.add(u.name);
            }
        }

        // Build dropdown options
        const options = KADER.map(name => {
            const taken = takenNames.has(name);
            return `<option value="${name}" ${taken ? 'disabled' : ''}>${name}${taken ? ' (bereits registriert)' : ''}</option>`;
        }).join('');

        loginBox.innerHTML = `
            <h2>Registrieren</h2>
            <div class="login-clubs">
                <span class="club-green">Rugby Union Hohen Neuendorf</span>
                <span class="club-x">&times;</span>
                <span class="club-blue">SV Stahl Hennigsdorf</span>
            </div>
            <input type="password" class="login-input" id="reg-team-pw" placeholder="Team-Passwort" autocomplete="off">
            <select class="login-input" id="reg-name" style="text-align:left;cursor:pointer;">
                <option value="">-- Name w\u00e4hlen --</option>
                ${options}
            </select>
            <input type="password" class="login-input" id="reg-code" placeholder="Pers\u00f6nlichen Code w\u00e4hlen (min. 4 Zeichen)" autocomplete="new-password">
            <input type="password" class="login-input" id="reg-code-confirm" placeholder="Code best\u00e4tigen" autocomplete="new-password">
            <button class="login-btn" id="reg-btn">Account erstellen</button>
            <div class="login-error" id="reg-error"></div>
            <div style="margin-top:0.8rem;">
                <a href="#" id="back-to-login" style="color:var(--text-muted);font-size:0.8rem;">Zur\u00fcck zum Login</a>
            </div>
        `;

        document.getElementById('reg-btn').addEventListener('click', doRegister);
        document.getElementById('reg-code-confirm').addEventListener('keydown', e => {
            if (e.key === 'Enter') doRegister();
        });
        document.getElementById('back-to-login').addEventListener('click', e => {
            e.preventDefault();
            location.reload();
        });
    }

    async function doRegister() {
        const errEl = document.getElementById('reg-error');
        const btn = document.getElementById('reg-btn');
        errEl.style.display = 'none';

        const teamPw = document.getElementById('reg-team-pw').value.trim();
        const fullName = document.getElementById('reg-name').value;
        const code = document.getElementById('reg-code').value;
        const codeConfirm = document.getElementById('reg-code-confirm').value;

        if (!teamPw || !fullName || !code || !codeConfirm) {
            errEl.textContent = 'Bitte alle Felder ausf\u00fcllen.';
            errEl.style.display = 'block';
            return;
        }
        if (code.length < 4) {
            errEl.textContent = 'Code muss mindestens 4 Zeichen lang sein.';
            errEl.style.display = 'block';
            return;
        }
        if (code !== codeConfirm) {
            errEl.textContent = 'Codes stimmen nicht \u00fcberein.';
            errEl.style.display = 'block';
            return;
        }

        btn.disabled = true;
        btn.textContent = '...';

        // Verify team password
        const teamHash = await hashPw(teamPw);
        if (teamHash !== HASH_TEAM_PW) {
            errEl.textContent = 'Falsches Team-Passwort.';
            errEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Account erstellen';
            return;
        }

        // Double-check name not taken
        usersCache = null;
        const users = await loadUsers(db);
        for (const [uid, user] of Object.entries(users)) {
            if (user.active && user.name === fullName) {
                errEl.textContent = 'Dieser Name ist bereits registriert. Bitte logge dich mit deinem Code ein.';
                errEl.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Account erstellen';
                return;
            }
        }

        // Create user in Firebase
        const codeHash = await hashPw(code);
        const userId = 'player_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5);

        try {
            await db.ref('users/' + userId).set({
                name: fullName,
                codeHash: codeHash,
                role: ROLE_TEAM,
                active: true
            });
            usersCache = null;

            // Auto-login
            localStorage.setItem('sgrhn_role', ROLE_TEAM);
            localStorage.setItem('sgrhn_user_name', fullName);
            localStorage.setItem('sgrhn_user_id', userId);
            localStorage.setItem('sgrhn_session_ts', String(Date.now()));

            completeLogin(ROLE_TEAM);
        } catch (err) {
            console.error('Registration failed', err);
            errEl.textContent = 'Registrierung fehlgeschlagen. Bitte erneut versuchen.';
            errEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Account erstellen';
        }
    }

    // --- Wire up login form ---
    document.getElementById('login-btn').addEventListener('click', tryLogin);
    document.getElementById('login-pw').addEventListener('keydown', e => {
        if (e.key === 'Enter') tryLogin();
    });

    // Add registration link below login
    const loginBox = document.querySelector('.login-box');
    if (loginBox && !loginBox.querySelector('#show-register')) {
        const regDiv = document.createElement('div');
        regDiv.style.cssText = 'margin-top:1rem;';
        regDiv.innerHTML = '<a href="#" id="show-register" style="color:var(--accent);font-size:0.82rem;">Neu hier? Registrieren</a>';
        loginBox.appendChild(regDiv);
        document.getElementById('show-register').addEventListener('click', e => {
            e.preventDefault();
            showRegisterForm();
        });
    }

    checkSession();
}

// --- 6. Navigation ---
function filterNav(role) {
    const nav = document.getElementById('topnav-inner');
    if (!nav) return;
    const level = ROLE_LEVEL[role] || 0;

    nav.querySelectorAll('[data-min-role]').forEach(el => {
        const minLevel = ROLE_LEVEL[el.dataset.minRole] || 0;
        if (level < minLevel) el.style.display = 'none';
    });

    // Hide group labels whose links are all hidden
    nav.querySelectorAll('.nav-group-label').forEach(label => {
        let next = label.nextElementSibling;
        let hasVisible = false;
        while (next && !next.classList.contains('nav-group-label')) {
            if (next.tagName === 'A' && next.style.display !== 'none') {
                hasVisible = true;
                break;
            }
            next = next.nextElementSibling;
        }
        if (!hasVisible) label.style.display = 'none';
    });
}

function toggleNav() {
    const inner = document.getElementById('topnav-inner');
    const overlay = document.getElementById('nav-overlay');
    const hamburger = document.getElementById('hamburger');
    if (!inner) return;
    const open = inner.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open', open);
    if (hamburger) hamburger.textContent = open ? '\u2715' : '\u2630';
}

function addLogoutButton() {
    const nav = document.getElementById('topnav-inner');
    if (!nav || nav.querySelector('.logout-btn')) return;

    const userName = getStoredUserName();
    const wrapper = document.createElement('div');
    wrapper.className = 'nav-user-section';

    if (userName) {
        const nameEl = document.createElement('span');
        nameEl.className = 'nav-user-name';
        nameEl.textContent = userName;
        wrapper.appendChild(nameEl);
    }

    const btn = document.createElement('a');
    btn.href = '#';
    btn.className = 'logout-btn';
    btn.textContent = 'Logout';
    btn.addEventListener('click', e => {
        e.preventDefault();
        clearSession();
        location.reload();
    });
    wrapper.appendChild(btn);
    nav.appendChild(wrapper);
}

// --- 7. Save Indicator ---
function showSaved(text) {
    const ind = document.getElementById('save-indicator');
    if (!ind) return;
    ind.textContent = text || 'Gespeichert';
    ind.classList.add('show');
    setTimeout(() => ind.classList.remove('show'), 2000);
}

// --- 8. Kader (for registration dropdown) ---
const KADER = [
    'Angelo Galster','Anton Hanetzok','Ben Johnston','Christopher Bunge','Connor Peise',
    'Daniel Kainer','Enrico Marco Stenzel','Fabian Wendt','Felix Berg','Florian Neumann',
    'Fynn Lauer','Gustav Palm','Hannes Bartelt','Jonas Hinz','Joshua Walker',
    'Julius Laetsch','Kai Friesicke','Keno Filietz','Kevin Pilz','Kimi D\u00f6pke',
    'Luca Karim Borgwardt','Lucas Eichler','Lukas Laetsch','Marcel Grabow',
    'Matti Erik Eschwe','Maurice Peter Sankeralli','Max Langer','Maximilian Hildebrandt',
    'Michael Galster','Moritz Gollnick','Moritz Janosch','Norman Guido Kranert',
    'Oliver Herrmann','Oliver Tschetsch','Paul Chukwu','Paul Zyparth','Philip Simon',
    'Rico Schomacker','Robert Woelki','Ronny Sager','Sarvan Aziz','Sascha Kosanke',
    'Sebastian Hildebrandt','Shawn Ahrens','Silas Rathke','Simon Csehan','Simon Reichelt',
    'Steffen Schwarz','Steven M\u00fcller','Theo Schmidt','Tim F\u00f6rster','Timo Schmidt',
    'Tobias Ehrlich','Tom K\u00f6nig','Tom Lebus','Tristan Sch\u00f6ntag',
    'Wolf-Dietrich Hildebrandt','Xavier Mbrim A Fiediek'
].sort((a, b) => a.localeCompare(b, 'de'));

// --- 9. Admin Functions (Trainer only) ---
function generateCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    for (const b of arr) code += chars[b % chars.length];
    return code;
}

async function createUser(db, { name, role = ROLE_TEAM }) {
    const code = generateCode();
    const codeHash = await hashPw(code);
    const userId = 'player_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5);
    await db.ref('users/' + userId).set({ name, codeHash, role, active: true });
    usersCache = null;
    return { userId, code, name, role };
}

async function updateUserRole(db, userId, newRole) {
    await db.ref('users/' + userId + '/role').set(newRole);
    usersCache = null;
}

async function deactivateUser(db, userId) {
    await db.ref('users/' + userId + '/active').set(false);
    usersCache = null;
}

async function activateUser(db, userId) {
    await db.ref('users/' + userId + '/active').set(true);
    usersCache = null;
}

async function regenerateCode(db, userId) {
    const code = generateCode();
    const codeHash = await hashPw(code);
    await db.ref('users/' + userId + '/codeHash').set(codeHash);
    usersCache = null;
    return code;
}

async function batchCreateUsers(db, playerNames, role = ROLE_TEAM) {
    const results = [];
    for (const name of playerNames) {
        const result = await createUser(db, { name, role });
        results.push(result);
    }
    return results;
}
