alert("1: Script loading...");
import { games, getMostPopular } from './config.js';
import { applyCloak } from '../Cloaks/cloak.js';
alert("2: Imports successful!");
document.addEventListener('DOMContentLoaded', () => {
    console.log("Null_X Dashboard Loaded");
alert("3: Site ready!");
    // ====================== 1. PERSISTENCE ======================
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) applyTheme(savedTheme);

    const savedCloak = localStorage.getItem('savedCloak');
    if (savedCloak && savedCloak !== "none") applyCloak(savedCloak);

    let savedShortcut = localStorage.getItem('panicKey') || "";
    let savedLink = localStorage.getItem('panicUrl') || "https://google.com";

    // ====================== 2. THEME LOGIC ======================
    const settingsModal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettings = document.getElementById('closeSettings');
    const themeCards = document.querySelectorAll('.theme-card');

    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'midnight') {
            root.style.setProperty('--accent', '#ffffff');
            root.style.setProperty('--container-bg', '#000000');
            root.style.setProperty('--bg-gradient', '#000000');
            document.body.style.background = "#000000";
        } else {
            root.style.setProperty('--accent', '#8b00ff');
            root.style.setProperty('--container-bg', 'rgba(15, 15, 25, 0.95)');
            root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #0a0a0a, #1a0033)');
            document.body.style.background = "linear-gradient(135deg, #0a0a0a, #1a0033)";
        }
    }

    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            const theme = card.getAttribute('data-theme');
            applyTheme(theme);
            localStorage.setItem('selectedTheme', theme);
        });
    });

    // ====================== 3. TAB CLOAK LOGIC ======================
    const cloakSelector = document.getElementById('cloakSelector');
    if (cloakSelector) {
        if (savedCloak) cloakSelector.value = savedCloak;
        cloakSelector.addEventListener('change', (e) => {
            if (e.target.value === "none") {
                localStorage.removeItem('savedCloak');
                location.reload(); 
            } else {
                applyCloak(e.target.value);
            }
        });
    }

    // ====================== 4. PANIC BUTTON LOGIC ======================
    const panicInput = document.getElementById('panicShortcut');
    const panicLinkInput = document.getElementById('panicLink');
    const savePanicBtn = document.getElementById('savePanic');

    if (panicInput) panicInput.value = savedShortcut;
    if (panicLinkInput) panicLinkInput.value = savedLink;

    if (panicInput) {
        panicInput.addEventListener('keydown', (e) => {
            e.preventDefault();
            panicInput.value = e.key; 
        });
    }

    if (savePanicBtn) {
        savePanicBtn.addEventListener('click', () => {
            localStorage.setItem('panicKey', panicInput.value);
            localStorage.setItem('panicUrl', panicLinkInput.value);
            savedShortcut = panicInput.value;
            savedLink = panicLinkInput.value;
            alert("Panic settings saved!");
        });
    }

    window.addEventListener('keydown', (e) => {
        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isTyping && e.key === savedShortcut && savedShortcut !== "") {
            let url = savedLink.startsWith('http') ? savedLink : 'https://' + savedLink;
            window.location.href = url;
        }
    });

    // ====================== 5. MODAL CONTROL ======================
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'flex';
        });
    }
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }

    // ====================== 6. GAME LAUNCHER ======================
    function launchGame(gameId) {
        window.location.href = `Games/game-player.html?id=${gameId}`;
    }

    // Only define randomBtn ONCE
    const randomBtn = document.getElementById('randomBtn');
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            if (games && games.length > 0) {
                const randomGame = games[Math.floor(Math.random() * games.length)];
                launchGame(randomGame.id);
            } else {
                alert("No games found in config!");
            }
        });
    }

    const playBtn = document.querySelector('.play-btn'); 
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            const popular = getMostPopular();
            if (popular && popular.length > 0) {
                launchGame(popular[0].id);
            }
        });
    }

    // ====================== 7. UI ELEMENTS ======================
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            window.location.href = "Login/login.html"; 
        });
    }

    const greeting = document.getElementById('greeting');
    if (greeting) {
        greeting.innerHTML = `<h1>Hello, Guest</h1><p>Find something fun to play.</p>`;
    }

    // This runs the featured game logic
    const popular = getMostPopular();
    if (popular && popular.length > 0) {
        const titleEl = document.getElementById('hero-title');
        const descEl = document.getElementById('hero-desc');
        if (titleEl) titleEl.textContent = popular[0].title;
        if (descEl) descEl.textContent = popular[0].desc;
    }
});
