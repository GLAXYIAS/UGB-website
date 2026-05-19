import { applyCloak } from '../Cloaks/Cloaks.js';

/**
 * Null_X Database / Game Registry
 */
const _0xData = [
  {
    id: "b_to",
    title: atob("QnJvdGF0bw=="), 
    url: "Games/brotato/index.html",
    desc: "A top-down arena shooter roguelite where you play a potato wielding up to 6 weapons at a time.",
    popular: true
  },
  {
    id: "s_lp",
    title: atob("U2xvcGU="), 
    url: "Games/slope/index.html",
    desc: "A fast-paced 3D platformer. Stay on the track!",
    popular: true
  },
  {
    id: "d_md",
    title: atob("RHJpdmUwYWQ="), 
    url: "Games/drivemad/index.html",
    desc: "Challenging physics-based driving. Don't flip your truck!",
    popular: true
  },
  {
    id: "b_ft",
    title: atob("QnVsbGV0IEZvcmNl"), 
    url: "Games/bulletforce/index.html",
    desc: "Action-packed multiplayer FPS. dominate the battlefield.",
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

/**
 * Helper: Filter data for popular/featured games
 */
function getMostPopular() {
    return _0xData.filter(g => g.popular);
}

/**
 * Global Function: Opens encrypted chat in a new tab
 * Cloaks the window title as "Grades" for stealth.
 */
window.openNullChat = function() {
    const user = localStorage.getItem('chatUser');
    if (!user) {
        window.location.href = "Login/login.html";
        return;
    }
    const chatWin = window.open('chat/chat.html', '_blank');
    if (chatWin) {
        chatWin.document.title = "Grades";
    }
};

/**
 * Main Initialization Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. Educational Cloak Countdown Engine ---
    const cloakElement = document.getElementById('educational-cloak');
    const cloakTimerText = document.getElementById('cloak-timer');
    const cloakCheckbox = document.getElementById('toggle-study-cloak');
    
    // Read preference flag from master memory storage
    const isCloakDisabled = localStorage.getItem('disableStudyCloak') === 'true';
    
    // Configure settings checkbox component checkmark state to match
    if (cloakCheckbox) {
        cloakCheckbox.checked = isCloakDisabled;
        
        // Save changes whenever user manually alters input box value
        cloakCheckbox.addEventListener('change', (e) => {
            localStorage.setItem('disableStudyCloak', e.target.checked ? 'true' : 'false');
        });
    }

    if (isCloakDisabled) {
        // Strip the element layout node completely if deactivated by preference settings
        if (cloakElement) cloakElement.style.display = 'none';
    } else {
        // Run countdown sequence routine if overlay engine is active
        let clockSecondsLeft = 10;
        
        const countdownLoop = setInterval(() => {
            clockSecondsLeft--;
            if (cloakTimerText) cloakTimerText.textContent = clockSecondsLeft;
            
            if (clockSecondsLeft <= 0) {
                clearInterval(countdownLoop);
                
                if (cloakElement) {
                    cloakElement.style.opacity = '0';
                    cloakElement.style.visibility = 'hidden';
                    
                    // Detach from interactive visibility nodes upon termination complete
                    setTimeout(() => {
                        cloakElement.style.display = 'none';
                    }, 500);
                }
            }
        }, 1000);
    }
    
    // --- 1. Theme & Cloak Persistence ---
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) applyTheme(savedTheme);

    const savedCloak = localStorage.getItem('savedCloak');
    if (savedCloak && savedCloak !== "none") {
        try { 
            applyCloak(savedCloak); 
        } catch (e) { 
            console.error("Cloak Error:", e); 
        }
    }

    // --- 2. Authentication UI Sync ---
    const user = localStorage.getItem('chatUser');
    const welcomeText = document.getElementById('welcome-text');
    const signInBtn = document.getElementById('signInBtn');

    if (user) {
        if (welcomeText) welcomeText.textContent = `Hello, ${user}`;
        if (signInBtn) signInBtn.textContent = "Sign Out";
    }

    if (signInBtn) {
        signInBtn.onclick = () => {
            if (localStorage.getItem('chatUser')) {
                localStorage.removeItem('chatUser');
                location.reload();
            } else {
                window.location.href = "Login/login.html";
            }
        };
    }

    // --- 3. DOM Element Selection ---
    const settingsModal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettings = document.getElementById('closeSettings');
    const cloakSelector = document.getElementById('cloakSelector');
    const navHome = document.getElementById('nav-home');
    const navGames = document.getElementById('nav-games');
    const navComms = document.getElementById('nav-communications');
    const heroSection = document.getElementById('heroSection');
    const gameGrid = document.getElementById('gameGrid');
    const stealthBtn = document.getElementById('stealthOpener');
    
    // Panic Settings UI
    const panicShortcutInput = document.getElementById('panicShortcut');
    const panicLinkInput = document.getElementById('panicLink');
    const savePanicBtn = document.getElementById('savePanic');

    // --- 4. Core Functions ---

    /**
     * Updates visual CSS variables based on selected theme
     */
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

    /**
     * Direct Launch Logic (Old-School Reliable)
     * Redirects current window to the game URL
     */
    function launchGame(gameId) {
        const game = _0xData.find(g => g.id === gameId);
        if (game) {
            window.location.href = game.url;
        }
    }

    /**
     * Populates and displays the game library
     */
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

    /**
     * Restores the home/hero view
     */
    function showHome() {
        if (heroSection) heroSection.style.display = 'flex';
        if (gameGrid) gameGrid.style.display = 'none';
    }

    // --- 5. Stealth & Panic Logic ---

    /**
     * Stealth Mode Launcher
     * Opens site in about:blank and replaces original tab with Classroom
     */
    if (stealthBtn) {
        stealthBtn.onclick = () => {
            const url = window.location.href;
            const win = window.open('about:blank', '_blank');
            if (!win) {
                alert("Please allow popups for Stealth Mode.");
                return;
            }
            win.document.title = "Google Docs";
            const iframe = win.document.createElement('iframe');
            iframe.src = url;
            iframe.style = "position:fixed; top:0; left:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden;";
            win.document.body.appendChild(iframe);
            
            // Redirect the "evidence" tab immediately
            window.location.replace("https://classroom.google.com");
        };
    }

    /**
     * Panic Shortcut Recorder
     */
    if (panicShortcutInput) {
        panicShortcutInput.value = localStorage.getItem('panicKey') || "";
        panicShortcutInput.onclick = () => {
            panicShortcutInput.placeholder = "Press any key...";
            const captureKey = (e) => {
                e.preventDefault();
                localStorage.setItem('panicKey', e.key);
                panicShortcutInput.value = e.key;
                window.removeEventListener('keydown', captureKey);
            };
            window.addEventListener('keydown', captureKey);
        };
    }

    /**
     * Panic URL Saver (with Protocol Fix)
     */
    if (savePanicBtn) {
        savePanicBtn.onclick = () => {
            let link = panicLinkInput.value || "https://classroom.google.com";
            
            // Critical Fix: Prevent the repo-path error by forcing https://
            if (!link.startsWith('http')) {
                link = 'https://' + link;
            }
            
            localStorage.setItem('panicUrl', link);
            alert("Panic settings saved!");
        };
    }

    // --- 6. Event Handlers ---

    if (navGames) navGames.onclick = (e) => { e.preventDefault(); showLibrary(); };
    if (navHome) navHome.onclick = (e) => { e.preventDefault(); showHome(); };

    // Communications / Chat Tab Logic
    if (navComms) {
        navComms.onclick = (e) => {
            e.preventDefault();
            if (heroSection) heroSection.style.display = 'none';
            if (gameGrid) {
                gameGrid.innerHTML = `
                    <div class="game-card" onclick="openNullChat()" style="cursor:pointer; border: 1px solid #8b00ff; background: #0a0a0a; grid-column: span 1;">
                        <div class="game-info">
                            <h3>Null Chat</h3>
                            <p>Encrypted Comms (Sign-in Required)</p>
                        </div>
                    </div>
                    <div class="form-wrapper" style="grid-column: 1 / -1; margin-top: 30px;">
                        <h2 class="form-title">🎮 Request a Game</h2>
                        <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdM5VOrjMSdmRv5udVq9PTP4olf6kBQtShX3ZT9-I45Uu0nfQ/viewform?embedded=true" class="google-form-iframe" width="100%" height="700" frameborder="0" style="border-radius: 10px; background: #fff;">
                        Loading…
                        </iframe>
                    </div>
                `;
                gameGrid.style.display = 'grid';
            }
        };
    }

    // Settings Modal Toggles
    if (settingsBtn) settingsBtn.onclick = () => settingsModal.style.display = 'flex';
    if (closeSettings) closeSettings.onclick = () => settingsModal.style.display = 'none';

    // Cloak Selection Listener
    if (cloakSelector) {
        if (savedCloak) cloakSelector.value = savedCloak;
        cloakSelector.onchange = (e) => {
            const val = e.target.value;
            if (val === "none") {
                localStorage.removeItem('savedCloak');
                location.reload(); 
            } else {
                localStorage.setItem('savedCloak', val);
                applyCloak(val);
            }
        };
    }

    // --- 7. Page Content Initialization ---

    // Set Hero Section content based on featured game
    const popular = getMostPopular();
    if (popular.length > 0) {
        const titleEl = document.getElementById('hero-title');
        const descEl = document.getElementById('hero-desc');
        const playBtn = document.getElementById('playFeatured');

        if (titleEl) titleEl.textContent = popular[0].title;
        if (descEl) descEl.textContent = popular[0].desc;
        if (playBtn) playBtn.onclick = () => launchGame(popular[0].id);
    }

    /**
     * GLOBAL PANIC KEY LISTENER
     * Checks all keystrokes for the user-defined panic key
     */
    window.addEventListener('keydown', (e) => {
        const panicKey = localStorage.getItem('panicKey');
        if (panicKey && e.key === panicKey) {
            let url = localStorage.getItem('panicUrl') || "https://classroom.google.com";
            
            // Protocol safety check
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            
            window.location.href = url;
        }
    });
});
