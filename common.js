// ===== common.js — Shared utilities for Rugby Team Hub =====

// --- 1. SHA-256 Hashing ---
async function hashPw(pw) {
    const data = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- 2. Pre-computed hashes ---
const HASH_RAT   = '0d14c977977df8a9154991206a8cbf1b395b1c40ae5902851619f0a6749b8c9b';
const HASH_SCRUM = '6abd4e9cf71535c17d7ffd07eb6af6bcaebd69885bc0238da35ed17a1842d581';
const HASH_PIN   = '2ac5b691fa275be817b9c8cd1a90d23383ca77c1b20fa4058caf3de6260425d2';

// --- 3. Firebase Init ---
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

// --- 4. Login Gate ---
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 Tage
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 1000; // 30 Sekunden
let loginAttempts = 0;
let lockedUntil = 0;

function setupLogin({ pwHash = HASH_RAT, storageKey = 'sgrhn_rat_auth', onUnlock } = {}) {
    const tsKey = storageKey + '_ts';

    function isSessionValid() {
        const stored = localStorage.getItem(storageKey);
        const ts = parseInt(localStorage.getItem(tsKey) || '0', 10);
        if (!stored || stored !== pwHash) return false;
        if (Date.now() - ts > SESSION_MAX_AGE) {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(tsKey);
            return false;
        }
        return true;
    }

    async function checkLogin() {
        if (isSessionValid()) { onUnlock(); addLogoutButton(storageKey); }
        else { localStorage.removeItem(storageKey); localStorage.removeItem(tsKey); }
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
        const pw = document.getElementById('login-pw').value;
        const hash = await hashPw(pw);
        if (hash === pwHash) {
            loginAttempts = 0;
            localStorage.setItem(storageKey, hash);
            localStorage.setItem(tsKey, String(Date.now()));
            onUnlock();
            addLogoutButton(storageKey);
        } else {
            loginAttempts++;
            if (loginAttempts >= MAX_ATTEMPTS) {
                lockedUntil = Date.now() + LOCKOUT_MS;
                errEl.textContent = `Zu viele Versuche. 30 Sekunden gesperrt.`;
                btn.disabled = true;
                setTimeout(() => { btn.disabled = false; errEl.textContent = 'Falsches Passwort.'; }, LOCKOUT_MS);
            } else {
                errEl.textContent = `Falsches Passwort. (${MAX_ATTEMPTS - loginAttempts} Versuche übrig)`;
            }
            errEl.style.display = 'block';
            document.getElementById('login-pw').value = '';
        }
    }

    document.getElementById('login-btn').addEventListener('click', tryLogin);
    document.getElementById('login-pw').addEventListener('keydown', e => {
        if (e.key === 'Enter') tryLogin();
    });

    checkLogin();
}

function addLogoutButton(storageKey) {
    const nav = document.querySelector('.topnav-inner');
    if (!nav || nav.querySelector('.logout-btn')) return;
    const btn = document.createElement('a');
    btn.href = '#';
    btn.className = 'logout-btn';
    btn.textContent = 'Logout';
    btn.style.cssText = 'margin-left:auto;color:var(--danger);font-size:0.85rem;opacity:0.7;';
    btn.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem(storageKey);
        localStorage.removeItem(storageKey + '_ts');
        localStorage.removeItem('sgrhn_trainer_auth');
        localStorage.removeItem('sgrhn_trainer_auth_ts');
        location.reload();
    });
    nav.appendChild(btn);
}

// --- 5. Trainer PIN ---
let pinAttempts = 0;
let pinLockedUntil = 0;

function setupTrainerPIN({ onEnable } = {}) {
    async function checkTrainerAuth() {
        const stored = localStorage.getItem('sgrhn_trainer_auth');
        const ts = parseInt(localStorage.getItem('sgrhn_trainer_auth_ts') || '0', 10);
        if (stored === HASH_PIN && (Date.now() - ts) < SESSION_MAX_AGE) {
            onEnable();
        } else {
            localStorage.removeItem('sgrhn_trainer_auth');
            localStorage.removeItem('sgrhn_trainer_auth_ts');
        }
    }

    async function promptTrainerPIN() {
        if (Date.now() < pinLockedUntil) {
            const secs = Math.ceil((pinLockedUntil - Date.now()) / 1000);
            alert(`Zu viele Versuche. Bitte ${secs}s warten.`);
            return;
        }
        const pin = prompt('Trainer-PIN eingeben:');
        if (pin === null) return;
        const hash = await hashPw(pin);
        if (hash === HASH_PIN) {
            pinAttempts = 0;
            localStorage.setItem('sgrhn_trainer_auth', hash);
            localStorage.setItem('sgrhn_trainer_auth_ts', String(Date.now()));
            onEnable();
        } else {
            pinAttempts++;
            if (pinAttempts >= MAX_ATTEMPTS) {
                pinLockedUntil = Date.now() + LOCKOUT_MS;
                alert('Zu viele Versuche. 30 Sekunden gesperrt.');
            } else {
                alert(`Falscher PIN. (${MAX_ATTEMPTS - pinAttempts} Versuche übrig)`);
            }
        }
    }

    // Expose globally for onclick="promptTrainerPIN()" in HTML
    window.promptTrainerPIN = promptTrainerPIN;

    return { checkTrainerAuth, promptTrainerPIN };
}

// --- 6. Save Indicator ---
function showSaved(text) {
    const ind = document.getElementById('save-indicator');
    if (!ind) return;
    ind.textContent = text || 'Gespeichert';
    ind.classList.add('show');
    setTimeout(() => ind.classList.remove('show'), 2000);
}
