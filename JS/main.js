import { applyCloak } from '../Cloaks/Cloaks.js';

// --- DATA HARDCODED & ENCODED TO BYPASS FILTERS ---
// ids: s_lp (Slope), d_md (Drive Mad), b_ft (Bullet Force), p_em (Pokemon)
const _0xData = [
  {
    id: "s_lp",
    title: atob("U2xvcGU="), 
    url: "Games/slope/index.html",
    desc: "A fast-paced 3D platformer. Stay on the track!",
    popular: true
  },
  {
    id: "d_md",
    title: atob("RHJpdmUgTWFk"), 
    url: "Games/drivemad/index.html",
    desc: "Challenging physics-based driving. Don't flip your truck!",
    popular: true
  },
  {
    id: "b_ft",
    title: atob("QnVsbGV0IEZvcmNl"), 
    url: "Games/bulletforce/index.html",
    desc: "Action-packed multiplayer FPS. Dominate the battlefield.",
    popular: true
  },
  {
    id: "p_em",
    title: atob("UG9rZW1vbiBFbWVyYWxk"), 
    url: "Games/pokemon-emerald/index.html",
    desc: "The classic GBA adventure. Become the Hoenn Champion!",
    popular: true
  }
];

function getMostPopular() {
    return _0xData.filter(g => g.popular);
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. THEME & CLOAK PERSISTENCE
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) applyTheme(savedTheme);

    const savedCloak = localStorage.getItem('savedCloak');
    if (savedCloak && savedCloak !== "none") {
        try { applyCloak(savedCloak); } catch (e) {}
    }

    // 2. SELECTORS
    const navHome = document.getElementById('nav-home');
    const navGames = document.getElementById('nav-games');
    const heroSection = document.getElementById('heroSection');
    const gameGrid = document.getElementById('gameGrid');
    const settingsModal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettings = document.getElementById('closeSettings');
    const cloakSelector = document.getElementById('cloakSelector');

    // 3. THEME LOGIC
    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'midnight') {
            root.style.setProperty('--accent', '#ffffff');
            root.style.setProperty('--container-bg', '#000000');
            document.body.style.background = "#000000";
        } else {
            root.style.setProperty('--accent', '#8b00ff');
            root.style.setProperty('--container-bg', 'rgba(15, 15, 25, 0.95)');
            document.body.style.background = "linear-gradient(135deg, #0a0a0a, #1a0033)";
        }
    }

    // 4. NAVIGATION & LIBRARY
    function launchGame(gameId) {
        window.location.href = `Games/game-player.html?id=${gameId}`;
    }

    function showLibrary() {
        if (heroSection) heroSection.style.display = 'none';
        if (gameGrid) {
            gameGrid.innerHTML = '';
            gameGrid.style.display = 'grid';
            _0xData.forEach(game => {
                const card = document.createElement('div');
                card.className = 'game-card';
                card.innerHTML = `
                    <h3>${game.title}</h3>
                    <div class="game-desc-overlay">${game.desc}</div>
                `;
                card.onclick = () => launchGame(game.id);
                gameGrid.appendChild(card);
            });
        }
    }

    function showHome() {
        if (heroSection) heroSection.style.display = 'flex';
        if (gameGrid) gameGrid.style.display = 'none';
    }

    if (navGames) navGames.onclick = (e) => { e.preventDefault(); showLibrary(); };
    if (navHome) navHome.onclick = (e) => { e.preventDefault(); showHome(); };

    // 5. CLOAK & SETTINGS LOGIC
    if (settingsBtn) settingsBtn.onclick = () => settingsModal.style.display = 'flex';
    if (closeSettings) closeSettings.onclick = () => settingsModal.style.display = 'none';

    if (cloakSelector) {
        if (savedCloak) cloakSelector.value = savedCloak;
        cloakSelector.onchange = (e) => {
            const val = e.target.value;
            if (val === "none") {
                localStorage.removeItem('savedCloak');
                localStorage.removeItem('cloakTitle');
                localStorage.removeItem('cloakIcon');
                location.reload(); 
            } else {
                applyCloak(val);
            }
        };
    }

    // 6. PANIC BUTTON LOGIC
    let savedShortcut = localStorage.getItem('panicKey') || "";
    let savedLink = localStorage.getItem('panicUrl') || "https://google.com";
    const panicInput = document.getElementById('panicShortcut');
    const panicLinkInput = document.getElementById('panicLink');
    const savePanicBtn = document.getElementById('savePanic');

    if (panicInput) {
        panicInput.value = savedShortcut;
        panicInput.onkeydown = (e) => { e.preventDefault(); panicInput.value = e.key; };
    }
    if (panicLinkInput) panicLinkInput.value = savedLink;
    if (savePanicBtn) {
        savePanicBtn.onclick = () => {
            localStorage.setItem('panicKey', panicInput.value);
            localStorage.setItem('panicUrl', panicLinkInput.value);
            alert("Panic settings saved!");
        };
    }

    window.onkeydown = (e) => {
        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isTyping && e.key === localStorage.getItem('panicKey')) {
            window.location.href = localStorage.getItem('panicUrl') || "https://google.com";
        }
    };

    // 7. INITIALIZE HERO UI
    const popular = getMostPopular();
    if (popular.length > 0) {
        const titleEl = document.getElementById('hero-title');
        const descEl = document.getElementById('hero-desc');
        if (titleEl) titleEl.textContent = popular[0].title;
        if (descEl) descEl.textContent = popular[0].desc;
        const playBtn = document.getElementById('playFeatured'); 
        if (playBtn) playBtn.onclick = () => launchGame(popular[0].id);
    }

    const randomBtn = document.getElementById('randomBtn');
    if (randomBtn) {
        randomBtn.onclick = () => {
            const rand = _0xData[Math.floor(Math.random() * _0xData.length)];
            launchGame(rand.id);
        };
    }
});
