const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

const ADMIN_NAME = "glaeesas";

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('chatUser');
    if (!user) { window.location.href = "../Login/login.html"; return; }

    const lowerUser = user.toLowerCase();

    // Tab Cloak
    document.title = "Grades";
    Object.defineProperty(document, 'title', { value: 'Grades', writable: false });

    // Show Admin Tab only for Owner
    if (lowerUser === ADMIN_NAME) {
        document.getElementById('admin-tab').style.display = 'block';
    }

    document.getElementById('username-display').textContent = user;
    const msgContainer = document.getElementById('chat-messages');

    // --- TAB SWITCHING LOGIC ---
    window.switchTab = (tab) => {
        // Reset all views
        document.getElementById('chat-view').style.display = 'none';
        document.getElementById('rules-view').style.display = 'none';
        document.getElementById('admin-panel-view').style.display = 'none';
        
        // Remove active class from all channels
        document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));

        if (tab === 'general' || tab === 'dev-logs') {
            document.getElementById('chat-view').style.display = 'flex';
            document.getElementById(`chan-${tab === 'general' ? 'general' : 'dev'}`).classList.add('active');
        } else if (tab === 'rules') {
            document.getElementById('rules-view').style.display = 'block';
            document.getElementById('chan-rules').classList.add('active');
        } else if (tab === 'admin') {
            document.getElementById('admin-panel-view').style.display = 'block';
            document.getElementById('admin-tab').classList.add('active');
        }
    };

    // --- FETCH MESSAGES & ROLES ---
    async function fetchMessages() {
        try {
            const [mRes, rRes] = await Promise.all([
                fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.asc`, { 
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
                }),
                fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*`, { 
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
                })
            ]);
            const messages = await mRes.json();
            const roles = await rRes.json();

            if (!Array.isArray(messages)) return;

            msgContainer.innerHTML = '';
            messages.forEach(msg => {
                const isDeleted = msg.content === "Message Was Deleted By Owner";
                const role = roles.find(r => r.username === msg.username);
                
                let tag = "";
                if (msg.username.toLowerCase() === ADMIN_NAME) {
                    tag = '<span style="color:gold; font-weight:bold;">[OWNER]</span> ';
                } else if (role && role.role_tag) {
                    tag = `<span style="color:#aaa;">[${role.role_tag.toUpperCase()}]</span> `;
                }

                const div = document.createElement('div');
                div.className = `message ${msg.username === user ? 'my-message' : 'other-message'}`;
                
                // Only Owner sees the three dots delete button
                const deleteBtn = (lowerUser === ADMIN_NAME && !isDeleted) 
                    ? `<button class="delete-btn" onclick="deleteMsg('${msg.id}')">⋮</button>` 
                    : "";

                div.innerHTML = `
                    <div class="msg-info">
                        <strong>${tag}${msg.username}</strong>
                        ${deleteBtn}
                    </div>
                    <div class="${isDeleted ? 'message-deleted' : ''}">${msg.content}</div>
                `;
                msgContainer.appendChild(div);
            });
            msgContainer.scrollTop = msgContainer.scrollHeight;
        } catch (e) { console.error("Fetch Error:", e); }
    }

    // --- ADMIN EXECUTION (BULK & INDIVIDUAL) ---
    window.adminExecute = async (type) => {
        let targets = [];
        let reason = "";
        let category = document.getElementById('ban-category').value;

        if (type === 'warn') {
            const single = document.getElementById('warn-search').value.trim();
            const bulk = document.getElementById('bulk-warn').value.trim();
            reason = document.getElementById('warn-reason').value.trim();
            targets = single ? [single] : bulk.split(',').map(n => n.trim()).filter(n => n);
        } else {
            const single = document.getElementById('ban-search').value.trim();
            const bulk = document.getElementById('bulk-ban').value.trim();
            reason = document.getElementById('ban-reason').value.trim();
            targets = single ? [single] : bulk.split(',').map(n => n.trim()).filter(n => n);
        }

        if (targets.length === 0) return alert("No users specified.");

        for (let t of targets) {
            let data = { 
                username: t, 
                last_action_reason: reason || "No reason provided.", 
                last_action_type: type, 
                last_action_category: category 
            };

            if (type === 'ban') {
                data.is_banned = true;
                data.ban_until = '3000-01-01T00:00:00Z';
            } else if (type === 'unban') {
                data.is_banned = false;
                data.warned = false;
                data.last_action_type = "unban";
            } else if (type === 'warn') {
                data.warned = true;
            }

            await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
                method: 'POST',
                headers: { 
                    'apikey': SUPABASE_KEY, 
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json', 
                    'Prefer': 'resolution=merge-duplicates' 
                },
                body: JSON.stringify(data)
            });
        }
        alert(`Admin action (${type}) complete for: ${targets.join(', ')}`);
        // Clear inputs
        document.getElementById('warn-search').value = ""; document.getElementById('bulk-warn').value = "";
        document.getElementById('ban-search').value = ""; document.getElementById('bulk-ban').value = "";
    };

    // --- DELETE MESSAGE ---
    window.deleteMsg = async (id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${id}`, {
            method: 'PATCH',
            headers: { 
                'apikey': SUPABASE_KEY, 
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ content: "Message Was Deleted By Owner" })
        });
        fetchMessages();
    };

    // --- SEND MESSAGE ---
    document.getElementById('chat-form').onsubmit = async (e) => {
        e.preventDefault();
        const input = document.getElementById('message-input');
        const text = input.value.trim();
        if (!text) return;

        await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
            method: 'POST',
            headers: { 
                'apikey': SUPABASE_KEY, 
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ username: user, content: text })
        });
        input.value = "";
        fetchMessages();
    };

    // --- CHECK USER STATUS (Notices) ---
    async function checkStatus() {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?username=eq.${user}&select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        if (data[0]) {
            const s = data[0];
            if (s.is_banned || s.warned) {
                document.getElementById('ban-notice').style.display = 'block';
                document.getElementById('notice-text').innerText = 
                    `You were ${s.last_action_type}ed from ${s.last_action_category}. Reason: ${s.last_action_reason}`;
                
                if (s.is_banned && (s.last_action_category === 'Chat' || s.last_action_category === 'Both')) {
                    document.getElementById('message-input').disabled = true;
                    document.getElementById('message-input').placeholder = "Access Revoked.";
                }
            }
        }
    }

    setInterval(fetchMessages, 3000);
    fetchMessages();
    checkStatus();
});
