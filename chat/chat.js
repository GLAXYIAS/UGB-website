// chat/chat.js
const SUPABASE_URL = 'https://abujajuzsiqjksabvybi.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_p-LIu9LC5FT-KprFOosVTw_Y16KCLAN';

document.addEventListener('DOMContentLoaded', () => {
    // 1. PULL USER FROM LOGIN
    const user = localStorage.getItem('chatUser');
    
    // 2. MANDATORY SIGN-IN CHECK
    if (!user) {
        // Kicks them to login if they try to access the URL directly
        window.location.href = "../Login/login.html";
        return;
    }

    // 3. THE "GRADES" CLOAK
    // This locks the tab title so it can't be changed by other scripts
    document.title = "Grades";
    Object.defineProperty(document, 'title', {
        value: 'Grades',
        writable: false
    });

    const messageContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const usernameDisplay = document.getElementById('username-display');

    if (usernameDisplay) usernameDisplay.textContent = user;

    // --- Database Functions ---
    async function fetchMessages() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.asc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await response.json();
            if (messageContainer) {
                messageContainer.innerHTML = '<div class="message system">Secure line established.</div>';
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
    }

    if (chatForm) {
        chatForm.onsubmit = (e) => {
            e.preventDefault();
            const text = messageInput.value.trim();
            if (text) { sendMessage(text); messageInput.value = ""; }
        };
    }

    setInterval(fetchMessages, 2500);
    fetchMessages();
});
