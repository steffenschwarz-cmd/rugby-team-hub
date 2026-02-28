// ===== common.js — Shared utilities for Rugby Team Hub =====

// --- 1. SHA-256 Hashing ---
async function hashPw(pw) {
    const data = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- 2. Pre-computed hashes ---
const HASH_RAT   = '0d14c977977df8a9154991206a8cbf1b395b1c40ae5902851619f0a6749b8c9b'; // RatPack#26
const HASH_SCRUM = '6abd4e9cf71535c17d7ffd07eb6af6bcaebd69885bc0238da35ed17a1842d581'; // ScrumHN!2026
const HASH_PIN   = '2ac5b691fa275be817b9c8cd1a90d23383ca77c1b20fa4058caf3de6260425d2'; // 7831

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
function setupLogin({ pwHash = HASH_RAT, storageKey = 'sgrhn_rat_auth', onUnlock } = {}) {
    async function checkLogin() {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return;
        if (stored === pwHash) onUnlock();
        else localStorage.removeItem(storageKey);
    }

    async function tryLogin() {
        const pw = document.getElementById('login-pw').value;
        const hash = await hashPw(pw);
        if (hash === pwHash) {
            localStorage.setItem(storageKey, hash);
            onUnlock();
        } else {
            document.getElementById('login-error').style.display = 'block';
            document.getElementById('login-pw').value = '';
        }
    }

    document.getElementById('login-btn').addEventListener('click', tryLogin);
    document.getElementById('login-pw').addEventListener('keydown', e => {
        if (e.key === 'Enter') tryLogin();
    });

    checkLogin();
}

// --- 5. Trainer PIN ---
function setupTrainerPIN({ onEnable } = {}) {
    async function checkTrainerAuth() {
        const stored = localStorage.getItem('sgrhn_trainer_auth');
        if (stored === HASH_PIN) onEnable();
    }

    async function promptTrainerPIN() {
        const pin = prompt('Trainer-PIN eingeben:');
        if (pin === null) return;
        const hash = await hashPw(pin);
        if (hash === HASH_PIN) {
            localStorage.setItem('sgrhn_trainer_auth', hash);
            onEnable();
        } else {
            alert('Falscher PIN.');
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
