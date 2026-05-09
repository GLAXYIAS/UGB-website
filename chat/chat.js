document.addEventListener('DOMContentLoaded', () => {
    const messageContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const usernameDisplay = document.getElementById('username-display');

    // Load or create a simple guest username
    let user = localStorage.getItem('chatUser') || "Guest_" + Math.floor(Math.random() * 9999);
    localStorage.setItem('chatUser', user);
    usernameDisplay.textContent = user;

    function addMessage(text, sender = "You") {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.innerHTML = `<strong style="color: #8b00ff">${sender}:</strong> ${text}`;
        messageContainer.appendChild(msgDiv);
        
        // Auto-scroll to bottom
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        
        if (text !== "") {
            addMessage(text, user);
            messageInput.value = "";
            
            // Temporary response for testing
            setTimeout(() => {
                if (text.toLowerCase().includes("hello")) {
                    addMessage("Encrypted connection established.", "System");
                }
            }, 1000);
        }
    });
});
