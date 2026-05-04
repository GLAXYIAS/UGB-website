document.addEventListener('DOMContentLoaded', () => {

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
      alert("Random Game feature coming soon!");
      // You can later add actual random game logic here
    });
  }

  // Play Featured Button
  const playFeatured = document.getElementById('playFeatured');
  if (playFeatured) {
    playFeatured.addEventListener('click', () => {
      alert("Launching game... (Feature coming soon)");
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

  // Dynamic Greeting (Hello, Guest)
  const greeting = document.getElementById('greeting');
  if (greeting) {
    greeting.innerHTML = `
      <h1>Hello, Guest</h1>
      <p>Find something fun to play.</p>
    `;
  }

  // Example: You can later add real game cards here
  console.log("Null_X Dashboard loaded successfully.");
});
