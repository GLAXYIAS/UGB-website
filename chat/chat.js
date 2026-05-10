// chat/chat.js

const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('chatUser');
    
    // Security: Redirect to login if no user found
    if (!user) {
        window.location.href = "../Login/login.html";
        return;
    }

    // Sidebar & Tab Cloak
    const nameDisplay = document.getElementById('username-display');
    if (nameDisplay) nameDisplay.textContent = user;
    
    document.title = "Grades";
    Object.defineProperty(document, 'title', { value: 'Grades', writable: false });

    // Spam Protection Variables
    let lastMessageTime = 0;
    let isLockedOut = false;
    const cooldownMs = 1500; // Speed limit
    const lockoutMs = 15000; // 15-second jail

    const messageContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');

    // Helper: Format Supabase timestamp to HH:MM
    function formatTime(ts) {
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

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
                // Keep the system welcome message
                messageContainer.innerHTML = '<div class="message system">Welcome to the encrypted comms.</div>';
                
                data.forEach(msg => {
                    const msgDiv = document.createElement('div');
                    const isMe = msg.username === user;
                    
                    msgDiv.className = `message ${isMe ? 'my-message' : 'other-message'}`;
                    
                    const time = formatTime(msg.created_at);

                    msgDiv.innerHTML = `
                        <div class="msg-info">
                            <strong>${msg.username}</strong>
                            <span>${time}</span>
                        </div>
                        <div class="msg-text">${msg.content}</div>
                    `;
                    
                    messageContainer.appendChild(msgDiv);
                });
                
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    }

    async function sendMessage(text) {
        const currentTime = Date.now();
        
        if (isLockedOut) return;

        // Spam Check
        if (currentTime - lastMessageTime < cooldownMs) {
            isLockedOut = true;
            messageInput.disabled = true;
            const originalPlaceholder = messageInput.placeholder;
            messageInput.placeholder = "Spam Detected! Wait 15s...";
            messageInput.value = "";
            
            setTimeout(() => {
                isLockedOut = false;
                messageInput.disabled = false;
                messageInput.placeholder = originalPlaceholder;
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
                body: JSON.stringify({ 
                    username: user, 
                    content: text 
                })
            });
            fetchMessages(); 
        } catch (err) {
            console.error("Send Error:", err);
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

    // Polling for new messages every 2.5 seconds
    setInterval(fetchMessages, 2500);
    fetchMessages();
});
