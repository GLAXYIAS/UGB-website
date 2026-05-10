

const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

// --- ADMIN CONFIG ---
const ADMIN_NAME = "Glaeesas";
const ADMIN_SECRET = "TEST";

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('chatUser');
    if (!user) { window.location.href = "../Login/login.html"; return; }

    // Tab Cloak
    document.title = "Grades";
    Object.defineProperty(document, 'title', { value: 'Grades', writable: false });

    // Show Admin Section if you are the Owner
    const adminSection = document.getElementById('admin-section');
    if (user === ADMIN_NAME && adminSection) {
        adminSection.style.display = 'block';
    }

    const nameDisplay = document.getElementById('username-display');
    if (nameDisplay) nameDisplay.textContent = user;

    const messageContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');

    let lastMessageTime = 0;
    let isLockedOut = false;

    async function fetchMessages() {
        try {
            // Fetch messages and user roles (tags/bans) simultaneously
            const [msgRes, roleRes] = await Promise.all([
                fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.asc`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }}),
                fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }})
            ]);

            const messages = await msgRes.json();
            const roles = await roleRes.json();

            if (messageContainer && Array.isArray(messages)) {
                messageContainer.innerHTML = '<div class="message system">Welcome to the encrypted comms.</div>';
                
                messages.forEach(msg => {
                    const msgDiv = document.createElement('div');
                    const isMe = msg.username === user;
                    
                    // Logic for Tags
                    const userRole = roles.find(r => r.username === msg.username);
                    let tagHtml = "";
                    if (msg.username === ADMIN_NAME) {
                        tagHtml = `<span style="background:gold; color:black; padding:1px 5px; border-radius:3px; font-size:10px; font-weight:bold; margin-right:5px;">OWNER</span>`;
                    } else if (userRole && userRole.role_tag) {
                        tagHtml = `<span style="background:#555; color:white; padding:1px 5px; border-radius:3px; font-size:10px; font-weight:bold; margin-right:5px;">${userRole.role_tag.toUpperCase()}</span>`;
                    }

                    msgDiv.className = `message ${isMe ? 'my-message' : 'other-message'}`;
                    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    msgDiv.innerHTML = `
                        <div class="msg-info">
                            <strong>${tagHtml}${msg.username}</strong>
                            <span>${time}</span>
                        </div>
                        <div class="msg-text">${msg.content}</div>
                    `;
                    messageContainer.appendChild(msgDiv);
                });
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        } catch (err) { console.error(err); }
    }

    async function sendMessage(text) {
        // 1. Check if user is banned before sending
        const roleCheck = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?username=eq.${user}&select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const roleData = await roleCheck.json();
        
        if (roleData[0] && roleData[0].is_banned) {
            const banExpiry = new Date(roleData[0].ban_until);
            if (new Date() < banExpiry) {
                alert(`You are banned until ${banExpiry.toLocaleString()}`);
                return;
            }
        }

        // 2. Spam Protection
        const currentTime = Date.now();
        if (isLockedOut) return;
        if (currentTime - lastMessageTime < 1500) {
            isLockedOut = true;
            messageInput.disabled = true;
            messageInput.placeholder = "Spam Detected! 15s Lockout...";
            setTimeout(() => { isLockedOut = false; messageInput.disabled = false; messageInput.placeholder = "Type a message..."; }, 15000);
            return;
        }
        lastMessageTime = currentTime;

        // 3. Send
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, content: text })
            });
            fetchMessages();
        } catch (err) { console.error(err); }
    }

    // --- ADMIN PANEL FUNCTIONS ---
    window.adminAction = async (type) => {
        const pass = prompt("Enter Admin Secret Key:");
        if (pass !== ADMIN_SECRET) return alert("Access Denied.");

        const target = document.getElementById('admin-target-user').value.trim();
        if (!target) return alert("Enter a username.");

        if (type === 'tag') {
            const tag = prompt("New Tag (e.g., Support, Admin, VIP):");
            if (tag) await saveRole(target, { role_tag: tag });
        } else if (type === 'ban') {
            const mins = prompt("Ban length in minutes (0 for permanent):");
            const date = mins > 0 ? new Date(Date.now() + mins * 60000).toISOString() : '3000-01-01T00:00:00Z';
            await saveRole(target, { is_banned: true, ban_until: date });
            alert(`Banned ${target}`);
        } else if (type === 'warn') {
            alert(`Warned ${target}.`);
        }
    };

    async function saveRole(targetUser, data) {
        // This attempts to update or create a new role record
        await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
            method: 'POST',
            headers: { 
                'apikey': SUPABASE_KEY, 
                'Authorization': `Bearer ${SUPABASE_KEY}`, 
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates' 
            },
            body: JSON.stringify({ username: targetUser, ...data })
        });
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
