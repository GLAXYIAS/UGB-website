const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('chatUser');
    
    if (!user) {
        window.location.href = "../Login/login.html";
        return;
    }

    const nameDisplay = document.getElementById('username-display');
    if (nameDisplay) nameDisplay.textContent = user;

    // --- SPAM PROTECTION VARIABLES ---
    let lastMessageTime = 0;
    let isLockedOut = false;
    const cooldownMs = 1500; // Minimum time between messages (1.5 seconds)
    const lockoutMs = 15000; // Punishment time (15 seconds)

    const messageContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');

    async function fetchMessages() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.asc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await response.json();
            if (messageContainer && Array.isArray(data)) {
                messageContainer.innerHTML = '';
                data.forEach(msg => {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message';
                    msgDiv.innerHTML = `<strong style="color: #8b00ff">${msg.username}:</strong> ${msg.content}`;
                    messageContainer.appendChild(msgDiv);
                });
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        } catch (err) { console.error(err); }
    }

    async function sendMessage(text) {
        // --- SPAM CHECK LOGIC ---
        const currentTime = Date.now();
        
        if (isLockedOut) {
            alert("Slow down! You are locked out for 15 seconds.");
            return;
        }

        if (currentTime - lastMessageTime < cooldownMs) {
            isLockedOut = true;
            messageInput.disabled = true;
            messageInput.placeholder = "Spam detected! Wait 15s...";
            
            setTimeout(() => {
                isLockedOut = false;
                messageInput.disabled = false;
                messageInput.placeholder = "Type a message...";
                messageInput.focus();
            }, lockoutMs);

            return;
        }

        lastMessageTime = currentTime;

        try {
            await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ username: user, content: text })
            });
            fetchMessages();
        } catch (err) { console.error(err); }
    }

    if (chatForm) {
        chatForm.onsubmit = (e) => {
            e.preventDefault();
            const text = messageInput.value.trim();
            if (text) { 
                sendMessage(text); 
                messageInput.value = ""; 
            }
        };
    }

    setInterval(fetchMessages, 2000);
    fetchMessages();
});
