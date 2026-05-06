document.addEventListener('DOMContentLoaded', () => {
  const colorBtns = document.querySelectorAll('.color-btn');
  const resetBtn = document.getElementById('resetBtn');

  // Function to apply theme
  const applyTheme = (color) => {
    localStorage.setItem('themeColor', color);
    // In a real setup, you'd update CSS variables here
    console.log("Theme color saved:", color);
  };

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from others
      colorBtns.forEach(b => b.classList.remove('active'));
      // Add to clicked
      btn.classList.add('active');
      
      const selectedColor = btn.getAttribute('data-color');
      applyTheme(selectedColor);
      
      // Visual feedback
      document.querySelector('.settings-container').style.borderColor = selectedColor;
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('themeColor');
      location.reload(); // Refresh to default
    });
  }
});
