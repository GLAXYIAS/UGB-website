// chat/chat.js

// Matches your General Settings Project ID
const SUPABASE_URL = 'https://abujajuzsiqjksabvybi.supabase.co'; 

// Matches your API Keys screenshot (Legacy anon/public)
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidWpajuzsiqjksabvybiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzE1MTk2NDA0LCJleHAiOjIwMzA3NzI0MDR9.Hj0q00y05YfXG1Z9fXG1Z9fXG1Z9fXG1Z9fXG1Z9fXG'; 

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('chatUser');
    if (!user) {
        window.location.href = "../Login/login.html";
        return;
    }

    document.title = "Grades";
    Object.defineProperty(document, 'title', { value: 'Grades', writable: false });

    const messageContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');

    async function fetchMessages() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.asc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
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
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }

    async function sendMessage(text) {
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
        } catch (err) {
            console.error("Send error:", err);
        }
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

    setInterval(fetchMessages, 2500);
    fetchMessages();
});
