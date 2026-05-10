const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

const ADMIN_NAME = "glaeesas";
let selectedCategory = "Chat";
let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('chatUser');
    if (!user) { window.location.href = "../Login/login.html"; return; }

    const lowerUser = user.toLowerCase();

    // Tab Cloak
    document.title = "Grades";
    Object.defineProperty(document, 'title', { value: 'Grades', writable: false });

    // Show Management Panel if Owner
    const adminSection = document.getElementById('admin-section');
    if (lowerUser === ADMIN_NAME && adminSection) {
        adminSection.style.display = 'block';
    }

    const nameDisplay = document.getElementById('username-display');
    if (nameDisplay) nameDisplay.textContent = user;

    const messageContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');

    let lastMessageTime = 0;
    let isLockedOut = false;

    // --- SEARCH LOGIC (@ Feature) ---
    window.handleUserSearch = async (val) => {
        const dropdown = document.getElementById('user-dropdown');
        if (!val.includes('@')) {
            dropdown.style.display = 'none';
            return;
        }

        if (allUsers.length === 0) {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=username`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await res.json();
            allUsers = [...new Set(data.map(m => m.username))];
        }

        const searchPart = val.split('@')[1].toLowerCase();
        const matches = allUsers.filter(u => u.toLowerCase().includes(searchPart));

        if (matches.length > 0) {
            dropdown.innerHTML = matches.map(u => `<div class="dropdown-item" onclick="selectUser('${u}')">${u}</div>`).join('');
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    };

    window.selectUser = (name) => {
        document.getElementById('admin-user-search').value = name;
        document.getElementById('user-dropdown').style.display = 'none';
    };

    window.setCategory = (cat) => {
        selectedCategory = cat;
        document.querySelectorAll('.category-tabs button').forEach(btn => {
            btn.classList.toggle('active', btn.innerText === cat);
        });
    };

    // --- FETCH MESSAGES ---
    async function fetchMessages() {
        try {
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
                    const isDeleted = msg.content === "Message Was Deleted By Owner";
                    const userRole = roles.find(r => r.username === msg.username);
                    
                    let tagHtml = "";
                    if (msg.username.toLowerCase() === ADMIN_NAME) {
                        tagHtml = `<span style="background:gold; color:black; padding:1px 5px; border-radius:3px; font-size:10px; font-weight:bold; margin-right:5px;">OWNER</span>`;
                    } else if (userRole && userRole.role_tag) {
                        tagHtml = `<span style="background:#444; color:white; padding:1px 5px; border-radius:3px; font-size:10px; font-weight:bold; margin-right:5px;">${userRole.role_tag.toUpperCase()}</span>`;
                    }

                    const adminMenu = (lowerUser === ADMIN_NAME && !isDeleted) 
                        ? `<button class="delete-btn" onclick="deleteMessage('${msg.id}')">⋮</button>` 
                        : "";

                    msgDiv.className = `message ${isMe ? 'my-message' : 'other-message'}`;
                    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    msgDiv.innerHTML = `
                        <div class="msg-info">
                            <div style="display:flex; align-items:center;">
                                <strong>${tagHtml}${msg.username}</strong>
                                ${adminMenu}
                            </div>
                            <span>${time}</span>
                        </div>
                        <div class="msg-text ${isDeleted ? 'message-deleted' : ''}">${msg.content}</div>
                    `;
                    messageContainer.appendChild(msgDiv);
                });
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        } catch (e) { console.error(e); }
    }

    // --- SEND MESSAGE & BAN CHECK ---
    async function sendMessage(text) {
        const roleRes = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?username=eq.${user}&select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const roleData = await roleRes.json();
        
        if (roleData[0] && roleData[0].is_banned && (roleData[0].last_action_category === 'Chat' || roleData[0].last_action_category === 'Both')) {
            alert("Your chat access is revoked.");
            return;
        }

        const now = Date.now();
        if (isLockedOut) return;
        if (now - lastMessageTime < 1500) {
            isLockedOut = true;
            messageInput.disabled = true;
            setTimeout(() => { isLockedOut = false; messageInput.disabled = false; }, 15000);
            return;
        }
        lastMessageTime = now;

        await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, content: text })
        });
        fetchMessages();
    }

    // --- MANAGEMENT ACTIONS ---
    window.processAction = async (type) => {
        const target = document.getElementById('admin-user-search').value.trim();
        const reason = prompt("Enter Reason for " + type + ":") || "Policy violation.";
        if (!target) return alert("Select a user.");

        let updateData = { 
            username: target, 
            last_action_reason: reason, 
            last_action_type: type, 
            last_action_category: selectedCategory 
        };

        if (type === 'ban') {
            updateData.is_banned = true;
            updateData.ban_until = '3000-01-01T00:00:00Z';
        } else {
            updateData.warned = true;
            updateData.is_banned = false;
        }

        await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify(updateData)
        });
        alert(`Success: ${type} ${target} for ${selectedCategory}`);
    };

    window.adminAction = async (type) => { // Handles "Tag" button from previous HTML
        const target = document.getElementById('admin-user-search').value.trim();
        if (type === 'tag') {
            const tag = prompt("Tag name:");
            if (tag) await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
                body: JSON.stringify({ username: target, role_tag: tag })
            });
        }
    };

    window.deleteMessage = async (id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${id}`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: "Message Was Deleted By Owner" })
        });
        fetchMessages();
    };

    // --- CHECK STATUS (For Notices) ---
    async function checkUserStatus() {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?username=eq.${user}&select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        if (data[0]) {
            const s = data[0];
            if (s.is_banned || s.warned) {
                const notice = document.getElementById('ban-notice');
                notice.style.display = 'block';
                document.getElementById('notice-text').innerText = 
                    `You were ${s.last_action_type}ed from ${s.last_action_category}. Reason: ${s.last_action_reason}`;
                
                if (s.is_banned && (s.last_action_category === 'Chat' || s.last_action_category === 'Both')) {
                    messageInput.disabled = true;
                    messageInput.placeholder = "BANNED";
                }
            }
        }
    }

    chatForm.onsubmit = (e) => { e.preventDefault(); const t = messageInput.value.trim(); if(t){sendMessage(t); messageInput.value="";} };
    setInterval(fetchMessages, 2500);
    fetchMessages();
    checkUserStatus();
});
