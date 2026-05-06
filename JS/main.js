import { games, getMostPopular } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("JavaScript loaded successfully");
// ====================== PANIC BUTTON LOGIC ======================
const panicInput = document.getElementById('panicShortcut');
const panicLinkInput = document.getElementById('panicLink');
const savePanicBtn = document.getElementById('savePanic');

// 1. Load saved settings on page load
let savedShortcut = localStorage.getItem('panicKey') || "";
let savedLink = localStorage.getItem('panicUrl') || "https://google.com";

if (panicInput) panicInput.value = savedShortcut;
if (panicLinkInput) panicLinkInput.value = savedLink;

// 2. Capture the key for the shortcut
if (panicInput) {
    panicInput.addEventListener('keydown', (e) => {
        e.preventDefault(); // Stop the key from actually typing
        panicInput.value = e.key; // Set the input to the key name (e.g., "p" or "Escape")
    });
}

// 3. Save to LocalStorage
if (savePanicBtn) {
    savePanicBtn.addEventListener('click', () => {
        localStorage.setItem('panicKey', panicInput.value);
        localStorage.setItem('panicUrl', panicLinkInput.value);
        savedShortcut = panicInput.value;
        savedLink = panicLinkInput.value;
        alert("Panic settings saved!");
    });
}

// 4. THE ACTUAL PANIC TRIGGER
// This listens for the key globally on the site
window.addEventListener('keydown', (e) => {
    // If the key pressed matches our saved key, and it's not empty
    if (e.key === savedShortcut && savedShortcut !== "") {
        // Ensure the link starts with http so it doesn't break
        let url = savedLink.startsWith('http') ? savedLink : 'https://' + savedLink;
        window.location.href = url;
    }
});
  // ====================== THEME PERSISTENCE ======================
  // This makes sure your choice stays even if you refresh!
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  // ====================== SIGN IN BUTTON ======================
  const signInBtn = document.getElementById('signInBtn');
  if (signInBtn) {
    signInBtn.addEventListener('click', () => {
      // For now, still redirecting, but soon we can make this a modal too!
      window.location.href = "Login/login.html"; 
    });
  }

  // ====================== SETTINGS MODAL ======================
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettings = document.getElementById('closeSettings');
  const themeCards = document.querySelectorAll('.theme-card');

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
  }
  if (closeSettings) {
    closeSettings.addEventListener('click', () => settingsModal.style.display = 'none');
  }

  function applyTheme(theme) {
  const root = document.documentElement;
  
 if (theme === 'midnight') {
    root.style.setProperty('--accent', '#ffffff');
    root.style.setProperty('--container-bg', '#000000');
    root.style.setProperty('--bg-gradient', '#000000');
    document.body.style.background = "#000000";
} else {
    // Reset to Default Purple
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

  // ====================== NAVIGATION & OTHER ======================
  const navHome = document.getElementById('nav-home');
  const navGames = document.getElementById('nav-games');
  
  if (navHome) navHome.addEventListener('click', () => alert("You are already on Home"));
  if (navGames) navGames.addEventListener('click', () => alert("All Games section coming soon"));

  // Random Game logic
  const randomBtn = document.getElementById('randomBtn');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      if (games.length === 0) return alert("No games available!");
      const randomGame = games[Math.floor(Math.random() * games.length)];
      alert(`Launching: ${randomGame.title}`);
    });
  }

  // Greeting and Featured Game
  const greeting = document.getElementById('greeting');
  if (greeting) {
    greeting.innerHTML = `<h1>Hello, Guest</h1><p>Find something fun to play.</p>`;
  }

  function setFeaturedGame() {
    const popular = getMostPopular();
    if (popular.length > 0) {
      const title = document.getElementById('hero-title');
      const desc = document.getElementById('hero-desc');
      if (title) title.textContent = popular[0].title;
      if (desc) desc.textContent = popular[0].desc;
    }
  }
  setFeaturedGame();

  console.log("%cNull_X loaded successfully", "color: #c084fc");
});
