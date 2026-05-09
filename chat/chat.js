// REPLACE THESE WITH THE KEYS FROM YOUR SUPABASE DASHBOARD
const SUPABASE_URL = 'https://abujajuzsiqjksabvybi.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_p-LIu9LC5FT-KprFOosVTw_Y16KCLAN';

document.addEventListener('DOMContentLoaded', () => {
    // 1. PULL FROM LOGIN: Check if user is authenticated
    const user = localStorage.getItem('chatUser');
    
    if (!user) {
        // Kick out to login if no session is found
        window.location.href = "../Login/login.html";
        return;
    }

    // 2. TAB CLOAK: Force title to stay "Grades"
    document.title = "Grades";
    // This prevents any other scripts from changing the name back
    Object.defineProperty(document, 'title', {
        value: 'Grades',
        writable: false
    });

    const messageContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const usernameDisplay = document.getElementById('username-display');

    // Display the logged-in username
    if (usernameDisplay) usernameDisplay.textContent = user;

    // --- DATABASE LOGIC ---

    async function fetchMessages() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.asc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            const data = await response.json();
            
            if (messageContainer) {
                messageContainer.innerHTML = '<div class="message system">Encrypted connection active.</div>';
                data.forEach(msg => {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message';
                    msgDiv.innerHTML = `<strong style="color: #8b00ff">${msg.username}:</strong> ${msg.content}`;
                    messageContainer.appendChild(msgDiv);
                });
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        } catch (err) {
            console.error("Connection error:", err);
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
                body: JSON.stringify({ 
                    username: user, // Sends the username pulled from Login
                    content: text 
                })
            });
            fetchMessages(); 
        } catch (err) {
            console.error("Send failed:", err);
        }
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = messageInput.value.trim();
            if (text) {
                sendMessage(text);
                messageInput.value = "";
            }
        });
    }

    // Auto-refresh messages every 2.5 seconds
    setInterval(fetchMessages, 2500); 
    fetchMessages(); 
});
