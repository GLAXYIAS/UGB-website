// chat/chat.js

const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('chatUser');
    
    // Kick out if not signed in
    if (!user) {
        window.location.href = "../Login/login.html";
        return;
    }

    // Inject Name & Tab Cloak
    const nameDisplay = document.getElementById('username-display');
    if (nameDisplay) nameDisplay.textContent = user;
    
    document.title = "Grades";
    Object.defineProperty(document, 'title', { value: 'Grades', writable: false });

    // --- SPAM PROTECTION VARS ---
    let lastMessageTime = 0;
    let isLockedOut = false;
    const cooldownMs = 1500; // Speed limit (1.5s)
    const lockoutMs = 15000; // Jail time (15s)

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
                    
                    // Logic: Is this MY message?
                    const isMe = msg.username === user;
                    msgDiv.className = `message ${isMe ? 'my-message' : 'other-message'}`;
                    
                    msgDiv.innerHTML = `
                        <small>${msg.username}</small>
                        <span>${msg.content}</span>
                    `;
                    
                    messageContainer.appendChild(msgDiv);
                });
                
                // Keep the chat scrolled to the bottom
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    }

    async function sendMessage(text) {
        const currentTime = Date.now();
        
        // 1. Check if currently in 15s jail
        if (isLockedOut) return;

        // 2. Check if sending too fast (Spam Trigger)
        if (currentTime - lastMessageTime < cooldownMs) {
            isLockedOut = true;
            messageInput.disabled = true;
            messageInput.value = "";
            messageInput.placeholder = "Spam Detected! Wait 15s...";
            
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
            const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
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

            if (res.ok) {
                fetchMessages(); 
            }
        } catch (err) {
            console.error("Send Error:", err);
        }
    }

    // Handle Form Submit
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

    // Update messages every 2.5 seconds
    setInterval(fetchMessages, 2500);
    fetchMessages();
});
