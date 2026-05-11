const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

const ADMIN_NAME = "glaeesas";
let allUsers = [];
let lastMessageTime = 0; 
let reportingUser = ""; // Tracks who is being reported

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('chatUser');
    if (!user) { window.location.href = "../Login/login.html"; return; }
    const lowerUser = user.toLowerCase();

    // --- INITIAL SETUP ---
    document.title = "Grades";
    Object.defineProperty(document, 'title', { value: 'Grades', writable: false });

    if (lowerUser === ADMIN_NAME) {
        const adminTab = document.getElementById('admin-tab');
        if (adminTab) adminTab.style.display = 'block';
    }

    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) usernameDisplay.textContent = user;
    
    const msgContainer = document.getElementById('chat-messages');

    // --- DYNAMIC SEARCH DROPDOWN (UPWARD) ---
    const createDropdown = (inputId) => {
        let dropdown = document.getElementById(inputId + '-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = inputId + '-dropdown';
            dropdown.style.cssText = `
                position: absolute;
                bottom: 100%; /* Shows ABOVE the bar */
                left: 0;
                background: #1a1a1a;
                border: 2px solid #8b00ff;
                border-radius: 8px 8px 0 0;
                z-index: 10000;
                width: 100%;
                max-height: 200px;
                overflow-y: auto;
                display: none;
                box-shadow: 0 -5px 15px rgba(0,0,0,0.8);
            `;
            const parent = document.getElementById(inputId).parentNode;
            parent.style.position = 'relative';
            parent.appendChild(dropdown);
        }
        return dropdown;
    };

    window.handleAdminSearch = (val, inputId) => {
        const dropdown = createDropdown(inputId);
        if (!val.includes('@')) {
            dropdown.style.display = 'none';
            return;
        }

        const searchPart = val.split('@')[1].toLowerCase();
        const matches = allUsers.filter(u => u.toLowerCase().includes(searchPart));

        if (matches.length > 0) {
            dropdown.innerHTML = matches.map(u => `
                <div style="padding: 12px; cursor: pointer; border-bottom: 1px solid #333; color: white;" 
                     onmouseover="this.style.background='#333'" 
                     onmouseout="this.style.background='transparent'"
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

    // --- USER DIRECTORY & MODAL LOGIC ---
    const fetchAllUsers = async () => {
        try {
            const [rolesRes, msgRes] = await Promise.all([
                fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=username`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }}),
                fetch(`${SUPABASE_URL}/rest/v1/messages?select=username`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }})
            ]);
            const rData = await rolesRes.json();
            const mData = await msgRes.json();
            const combined = [...rData.map(u => u.username), ...mData.map(u => u.username)];
            allUsers = [...new Set(combined)].filter(n => n);
            renderUserDirectory();
        } catch (e) { console.error("Fetch Users Error:", e); }
    };

    const renderUserDirectory = (filter = "") => {
        const container = document.getElementById('user-list-display');
        if (!container) return;
        const filtered = allUsers.filter(u => u.toLowerCase().includes(filter.toLowerCase()));
        
        container.innerHTML = filtered.map(u => `
            <div class="admin-card" style="position:relative; text-align:center;">
                <div onclick="toggleUserActions('${u}')" style="cursor:pointer;">
                    <div class="avatar" style="margin: 0 auto 10px;"></div>
                    <strong>${u}</strong>
                </div>
                <div id="actions-${u}" style="display:none; margin-top:15px; padding-top:10px; border-top:1px solid #333; gap:10px; justify-content:center;">
                    <button onclick="openReportModal('${u}')" style="background:#ff4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Report</button>
                    <button onclick="startPrivateMessage('${u}')" style="background:#8b00ff; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Message</button>
                </div>
            </div>
        `).join('');
    };

    window.toggleUserActions = (username) => {
        const el = document.getElementById(`actions-${username}`);
        const isHidden = el.style.display === 'none';
        // Hide others
        allUsers.forEach(u => {
            const other = document.getElementById(`actions-${u}`);
            if(other) other.style.display = 'none';
        });
        if(isHidden) el.style.display = 'flex';
    };

    window.openReportModal = (username) => {
        reportingUser = username;
        // Create modal if it doesn't exist
        let modal = document.getElementById('report-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'report-modal';
            modal.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 400px; background: #161616; border: 2px solid #ff4444; border-radius: 12px;
                padding: 30px; z-index: 20000; box-shadow: 0 0 50px rgba(0,0,0,0.9);
                text-align: center;
            `;
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <h2 style="color:#ff4444; margin-bottom:15px;">Report User</h2>
            <p style="margin-bottom:20px;">Reporting: <strong>${username}</strong></p>
            <textarea id="report-reason" placeholder="What did they do?" style="height:100px;"></textarea>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button onclick="submitReport()" style="flex:1; background:#ff4444; color:white; padding:10px; border:none; border-radius:5px; cursor:pointer;">Submit Report</button>
                <button onclick="document.getElementById('report-modal').style.display='none'" style="flex:1; background:#333; color:white; padding:10px; border:none; border-radius:5px; cursor:pointer;">Cancel</button>
            </div>
        `;
        modal.style.display = 'block';
    };

    window.submitReport = async () => {
        const reason = document.getElementById('report-reason').value;
        if (!reason) return alert("Please provide a reason.");
        
        // Log report to Supabase user_roles (as a warning or specific report column)
        await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify({ 
                username: reportingUser, 
                last_action_reason: `REPORTED BY ${user}: ${reason}`,
                last_action_type: 'report'
            })
        });

        alert("Report submitted to the Owner.");
        document.getElementById('report-modal').style.display = 'none';
    };

    // --- TAB SWITCHING ---
    window.switchTab = (tab) => {
        const views = ['chat-view', 'rules-view', 'admin-panel-view', 'users-view'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if (el) el.style.display = 'none';
        });
        document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));

        if (tab === 'general' || tab === 'dev-logs') {
            document.getElementById('chat-view').style.display = 'flex';
            document.getElementById(tab === 'general' ? 'chan-general' : 'chan-dev').classList.add('active');
        } else if (tab === 'users') {
            document.getElementById('users-view').style.display = 'block';
            document.getElementById('chan-users').classList.add('active');
            fetchAllUsers();
        } else if (tab === 'rules') {
            document.getElementById('rules-view').style.display = 'block';
            document.getElementById('chan-rules').classList.add('active');
        } else if (tab === 'admin') {
            document.getElementById('admin-panel-view').style.display = 'block';
            document.getElementById('admin-tab').classList.add('active');
            fetchAllUsers(); 
        }
    };

    // --- FETCH MESSAGES ---
    async function fetchMessages() {
        try {
            const [mRes, rRes] = await Promise.all([
                fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.asc`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }}),
                fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }})
            ]);
            const messages = await mRes.json();
            const roles = await rRes.json();

            if (!Array.isArray(messages) || !msgContainer) return;

            msgContainer.innerHTML = '';
            messages.forEach(msg => {
                const isDeleted = msg.content === "Message Was Deleted By Owner";
                const roleData = roles.find(r => r.username === msg.username);
                const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                
                let tag = "";
                if (msg.username.toLowerCase() === ADMIN_NAME) { tag = `<span class="owner-tag">OWNER</span>`; }
                else if (roleData && roleData.role_tag) { tag = `<span style="color:#aaa; font-weight:bold; margin-right:5px;">[${roleData.role_tag.toUpperCase()}]</span> `; }

                const div = document.createElement('div');
                div.className = `message ${msg.username === user ? 'my-message' : 'other-message'}`;
                const delBtn = (lowerUser === ADMIN_NAME && !isDeleted) ? `<button class="delete-btn" onclick="deleteMsg('${msg.id}')">⋮</button>` : "";

                div.innerHTML = `
                    <div class="msg-info">
                        <div style="display: flex; align-items: center;">${tag}<strong>${msg.username}</strong></div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 10px; opacity: 0.4;">${time}</span>
                            ${delBtn}
                        </div>
                    </div>
                    <div class="${isDeleted ? 'message-deleted' : ''}">${msg.content}</div>
                `;
                msgContainer.appendChild(div);
            });
            msgContainer.scrollTop = msgContainer.scrollHeight;
        } catch (e) { console.error(e); }
    }

    // --- SEND & ANTI-SPAM ---
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.onsubmit = async (e) => {
            e.preventDefault();
            const now = Date.now();
            if (now - lastMessageTime < 3000 && lowerUser !== ADMIN_NAME) {
                alert("Slow down! 3-second anti-spam.");
                return;
            }
            const input = document.getElementById('message-input');
            if (!input.value.trim()) return;

            await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, content: input.value.trim() })
            });
            input.value = "";
            lastMessageTime = Date.now();
            fetchMessages();
        };
    }

    // --- ADMIN EXECUTION ---
    window.adminExecute = async (type) => {
        let targets = [];
        let cat = document.getElementById('ban-category').value;
        let single, bulk, reason;

        if (type === 'warn') {
            single = document.getElementById('warn-search').value;
            bulk = document.getElementById('bulk-warn').value;
            reason = document.getElementById('warn-reason').value;
        } else {
            single = document.getElementById('ban-search').value;
            reason = document.getElementById('ban-reason').value;
        }

        targets = single ? [single] : bulk.split(',').map(n => n.trim()).filter(n => n);
        for (let t of targets) {
            let data = { username: t, last_action_reason: reason || "No reason.", last_action_type: type, last_action_category: cat };
            if (type === 'ban') { data.is_banned = true; data.ban_until = '3000-01-01'; }
            else if (type === 'unban') { data.is_banned = false; data.warned = false; }
            else { data.warned = true; }

            await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
                body: JSON.stringify(data)
            });
        }
        alert("Action complete.");
    };

    window.deleteMsg = async (id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${id}`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: "Message Was Deleted By Owner" })
        });
        fetchMessages();
    };

    // --- SEARCH BAR LISTENERS ---
    const directorySearch = document.getElementById('directory-search');
    if (directorySearch) directorySearch.oninput = (e) => renderUserDirectory(e.target.value);
    
    const warnInp = document.getElementById('warn-search');
    const banInp = document.getElementById('ban-search');
    if(warnInp) warnInp.oninput = (e) => handleAdminSearch(e.target.value, 'warn-search');
    if(banInp) banInp.oninput = (e) => handleAdminSearch(e.target.value, 'ban-search');

    setInterval(fetchMessages, 3000);
    fetchMessages();
});
