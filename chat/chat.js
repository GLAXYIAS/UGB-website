const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

const ADMIN_NAME = "glaeesas";
let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('chatUser');
    if (!user) { window.location.href = "../Login/login.html"; return; }

    const lowerUser = user.toLowerCase();

    // Tab Cloak
    document.title = "Grades";
    Object.defineProperty(document, 'title', { value: 'Grades', writable: false });

    // Show Admin Tab only for Owner
    if (lowerUser === ADMIN_NAME) {
        const adminTab = document.getElementById('admin-tab');
        if (adminTab) adminTab.style.display = 'block';
    }

    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) usernameDisplay.textContent = user;
    
    const msgContainer = document.getElementById('chat-messages');

    // --- SEARCH LOGIC (@ Feature) ---
    // This creates the dropdown dynamically for the Admin Panel
    const createDropdown = (inputId) => {
        let dropdown = document.getElementById(inputId + '-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = inputId + '-dropdown';
            dropdown.className = 'dropdown-list'; // Ensure this class is in your CSS
            dropdown.style.position = 'absolute';
            dropdown.style.background = '#222';
            dropdown.style.border = '1px solid #444';
            dropdown.style.zIndex = '1000';
            dropdown.style.width = '100%';
            dropdown.style.display = 'none';
            document.getElementById(inputId).parentNode.style.position = 'relative';
            document.getElementById(inputId).parentNode.appendChild(dropdown);
        }
        return dropdown;
    };

    window.handleAdminSearch = async (val, inputId) => {
        const dropdown = createDropdown(inputId);
        if (!val.includes('@')) {
            dropdown.style.display = 'none';
            return;
        }

        // Fetch all users from user_roles table to ensure we get everyone who signed in
        if (allUsers.length === 0) {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=username`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await res.json();
            allUsers = [...new Set(data.map(u => u.username))];
        }

        const searchPart = val.split('@')[1].toLowerCase();
        const matches = allUsers.filter(u => u.toLowerCase().includes(searchPart));

        if (matches.length > 0) {
            dropdown.innerHTML = matches.map(u => `
                <div style="padding:10px; cursor:pointer; border-bottom:1px solid #333;" 
                     onclick="selectAdminUser('${u}', '${inputId}')">${u}</div>
            `).join('');
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    };

    window.selectAdminUser = (name, inputId) => {
        document.getElementById(inputId).value = name;
        document.getElementById(inputId + '-dropdown').style.display = 'none';
    };

    // Attach listeners to the Admin inputs
    const warnInp = document.getElementById('warn-search');
    const banInp = document.getElementById('ban-search');
    if(warnInp) warnInp.oninput = (e) => handleAdminSearch(e.target.value, 'warn-search');
    if(banInp) banInp.oninput = (e) => handleAdminSearch(e.target.value, 'ban-search');

    // --- TAB SWITCHING ---
    window.switchTab = (tab) => {
        const chatView = document.getElementById('chat-view');
        const rulesView = document.getElementById('rules-view');
        const adminView = document.getElementById('admin-panel-view');

        if (chatView) chatView.style.display = 'none';
        if (rulesView) rulesView.style.display = 'none';
        if (adminView) adminView.style.display = 'none';
        
        document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));

        if (tab === 'general' || tab === 'dev-logs') {
            if (chatView) chatView.style.display = 'flex';
            const targetId = tab === 'general' ? 'chan-general' : 'chan-dev';
            const targetChan = document.getElementById(targetId);
            if (targetChan) targetChan.classList.add('active');
        } else if (tab === 'rules') {
            if (rulesView) rulesView.style.display = 'block';
            const rulesChan = document.getElementById('chan-rules');
            if (rulesChan) rulesChan.classList.add('active');
        } else if (tab === 'admin') {
            if (adminView) adminView.style.display = 'block';
            const adminTab = document.getElementById('admin-tab');
            if (adminTab) adminTab.classList.add('active');
        }
    };

    // --- FETCH MESSAGES ---
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

            if (!Array.isArray(messages) || !msgContainer) return;

            msgContainer.innerHTML = '';
            messages.forEach(msg => {
                const isDeleted = msg.content === "Message Was Deleted By Owner";
                const role = roles.find(r => r.username === msg.username);
                
                let tag = "";
                if (msg.username.toLowerCase() === ADMIN_NAME) {
                    tag = `<span class="owner-tag">OWNER</span>`;
                } else if (role && role.role_tag) {
                    tag = `<span style="color:#aaa; margin-right: 5px;">[${role.role_tag.toUpperCase()}]</span> `;
                }

                const div = document.createElement('div');
                div.className = `message ${msg.username === user ? 'my-message' : 'other-message'}`;
                
                const deleteBtn = (lowerUser === ADMIN_NAME && !isDeleted) 
                    ? `<button class="delete-btn" onclick="deleteMsg('${msg.id}')">⋮</button>` 
                    : "";

                div.innerHTML = `
                    <div class="msg-info">
                        <div style="display: flex; align-items: center;">${tag}<strong>${msg.username}</strong></div>
                        ${deleteBtn}
                    </div>
                    <div class="${isDeleted ? 'message-deleted' : ''}">${msg.content}</div>
                `;
                msgContainer.appendChild(div);
            });
            msgContainer.scrollTop = msgContainer.scrollHeight;
        } catch (e) { console.error("Fetch Error:", e); }
    }

    // --- ADMIN EXECUTION ---
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
        alert(`Admin action (${type}) complete.`);
        allUsers = []; // Reset user cache so search refreshes
    };

    window.deleteMsg = async (id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${id}`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: "Message Was Deleted By Owner" })
        });
        fetchMessages();
    };

    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.onsubmit = async (e) => {
            e.preventDefault();
            const input = document.getElementById('message-input');
            const text = input.value.trim();
            if (!text) return;

            await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, content: text })
            });
            input.value = "";
            fetchMessages();
        };
    }

    async function checkStatus() {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?username=eq.${user}&select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        if (data[0]) {
            const s = data[0];
            if (s.is_banned || s.warned) {
                const notice = document.getElementById('ban-notice');
                const text = document.getElementById('notice-text');
                if (notice && text) {
                    notice.style.display = 'block';
                    text.innerText = `You were ${s.last_action_type}ed from ${s.last_action_category}. Reason: ${s.last_action_reason}`;
                }
                if (s.is_banned && (s.last_action_category === 'Chat' || s.last_action_category === 'Both')) {
                    const msgInput = document.getElementById('message-input');
                    if (msgInput) {
                        msgInput.disabled = true;
                        msgInput.placeholder = "Access Revoked.";
                    }
                }
            }
        }
    }

    setInterval(fetchMessages, 3000);
    fetchMessages();
    checkStatus();
});
