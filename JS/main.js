// Import game config
import { games, getMostPopular } from './config.js';

document.addEventListener('DOMContentLoaded', () => {

  // ====================== BUTTONS ======================
  
  // Sign In Button
  const signInBtn = document.getElementById('signInBtn');
  if (signInBtn) {
    signInBtn.addEventListener('click', () => {
      window.location.href = "Login/login.html";
    });
  }

  // Random Game Button
  const randomBtn = document.getElementById('randomBtn');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const randomGame = games[Math.floor(Math.random() * games.length)];
      alert(`Launching: ${randomGame.title}`);
      // TODO: Later redirect to actual game
    });
  }

  // Play Featured Button
  const playFeatured = document.getElementById('playFeatured');
  if (playFeatured) {
    playFeatured.addEventListener('click', () => {
      const popular = getMostPopular();
      const featured = popular[0];
      alert(`Launching Featured Game: ${featured.title}`);
    });
  }

  // Search Input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          console.log('Searching for:', query);
          alert(`Searching for: ${query} (Feature coming soon)`);
        }
      }
    });
  }

  // Dynamic Greeting
  const greeting = document.getElementById('greeting');
  if (greeting) {
    greeting.innerHTML = `
      <h1>Hello, Guest</h1>
      <p>Find something fun to play.</p>
    `;
  }

  // Set Featured Game from most clicked
  function setFeaturedGame() {
    const popular = getMostPopular();
    if (popular.length > 0) {
      const featured = popular[0];
      const heroTitle = document.getElementById('hero-title');
      const heroDesc = document.getElementById('hero-desc');
      
      if (heroTitle) heroTitle.textContent = featured.title;
      if (heroDesc) heroDesc.textContent = featured.desc;
    }
  }

  setFeaturedGame();

  console.log("%cNull_X Dashboard loaded successfully", "color: #c084fc; font-weight: bold");
});
