const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

const ADMIN_NAME = "glaeesas";
let allUsers = [];
let lastMessageTime = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const user = localStorage.getItem('chatUser');
    
    // 1. If no local storage exists, boot them out immediately
    if (!user) {
        window.location.href = "../Login/login.html";
        return;
    }

    // 2. HARD SECURITY KILL-SWITCH: Verify the user actually exists in user_roles
    try {
        const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?username=eq.${encodeURIComponent(user)}&select=username`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const verifyData = await verifyRes.json();

        // If backend database returns nothing, this user does not exist! Evict them.
        if (!verifyData || verifyData.length === 0) {
            console.warn("Ghost session detected. Clearing storage and executing lockout.");
            localStorage.removeItem('chatUser');
            localStorage.clear();
            window.location.href = "../Login/login.html";
            return;
        }
    } catch (authError) {
        console.error("Security handshake failed:", authError);
    }

    // 3. BAN CHECK: Make sure this user isn't actively flagged as banned in the database
    try {
        const banRes = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?username=eq.${encodeURIComponent(user)}&select=is_banned,temp_ban_until`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const banData = await banRes.json();
        
        if (banData && banData[0]) {
            const profile = banData[0];
            
            // Handle Permanent Ban Check
            if (profile.is_banned === true) {
                alert("This account has been permanently banned from the server.");
                localStorage.removeItem('chatUser');
                window.location.href = "../Login/login.html";
                return;
            }
            
            // Handle Temporary Ban Check
            if (profile.temp_ban_until) {
                const expiryTime = new Date(profile.temp_ban_until).getTime();
                if (expiryTime > Date.now()) {
                    alert(`You are temporarily banned until: ${new Date(profile.temp_ban_until).toLocaleString()}`);
                    localStorage.removeItem('chatUser');
                    window.location.href = "../Login/login.html";
                    return;
                }
            }
        }
    } catch (banCheckErr) {
        console.error("Ban check failed:", banCheckErr);
    }

    // --- CONTINUATION OF ORIGINAL ENGINE FLOW ---
    const lowerUser = user.toLowerCase();
    document.getElementById('username-display').textContent = user;
    
    // Admin Tab Visibility Check
    if (lowerUser === ADMIN_NAME.toLowerCase()) {
        const adminTab = document.getElementById('admin-tab');
        if (adminTab) adminTab.style.display = 'block';
    }

    const msgContainer = document.getElementById('chat-messages');

    // --- TAB NAVIGATION ---
    window.switchTab = (target) => {
        ['chat-view', 'rules-view', 'admin-panel-view', 'users-view'].forEach(v => {
            const el = document.getElementById(v);
            if (el) el.style.display = 'none';
        });
        
        document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
        
        if (target === 'general' || target === 'dev-logs') {
            document.getElementById('chat-view').style.display = 'flex';
            const tabId = target === 'general' ? 'chan-general' : 'chan-dev';
            const tabEl = document.getElementById(tabId);
            if (tabEl) tabEl.classList.add('active');
        } 
        else if (target === 'admin') {
            const adminView = document.getElementById('admin-panel-view');
            if (adminView) adminView.style.display = 'block';
            const adminTab = document.getElementById('admin-tab');
            if (adminTab) adminTab.classList.add('active');
            fetchAllUsers();
        } 
        else {
            const viewId = target + '-view';
            const v = document.getElementById(viewId);
            if (v) v.style.display = 'block';
            
            const tabId = 'chan-' + target;
            const t = document.getElementById(tabId);
            if (t) t.classList.add('active');
            
            if (target === 'users') fetchAllUsers();
        }
    };

    // --- USER DIRECTORY ---
    const fetchAllUsers = async () => {
        try {
            const rolesRes = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=username`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const rolesData = await rolesRes.json();
            const msgsRes = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=username`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const msgsData = await msgsRes.json();

            const combined = [...rolesData.map(u => u.username), ...msgsData.map(u => u.username)];
            allUsers = [...new Set(combined)].filter(name => name != null);
            renderUserDirectory();
        } catch (err) { console.error(err); }
    };

    const renderUserDirectory = (filterTerm = "") => {
        const listContainer = document.getElementById('user-list-display');
        if (!listContainer) return;
        const filtered = allUsers.filter(u => u.toLowerCase().includes(filterTerm.toLowerCase()));
        listContainer.innerHTML = filtered.map(username => `
            <div class="admin-card" style="text-align:center;">
                <div class="avatar" style="margin: 0 auto 10px; width:50px; height:50px; background:#333; border-radius:50%;"></div>
                <strong>${username}</strong>
            </div>
        `).join('');
    };

    // --- MESSAGE ENGINE ---
    async function fetchMessages() {
        try {
            const mRes = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.asc`, { 
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const rRes = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*`, { 
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const messages = await mRes.json();
            const roles = await rRes.json();

            msgContainer.innerHTML = '';
            messages.forEach(msg => {
                const isDel = msg.content === "Message Was Deleted By Owner";
                const role = roles.find(r => r.username === msg.username);
                const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                let tag = msg.username.toLowerCase() === ADMIN_NAME ? `<span style="color:#ff4444; font-weight:bold; margin-right:5px;">[OWNER]</span>` : (role?.role_tag ? `<span style="color:#aaa; font-weight:bold;">[${role.role_tag.toUpperCase()}]</span> ` : "");

                const div = document.createElement('div');
                div.className = `message ${msg.username === user ? 'my-message' : 'other-message'}`;
                div.innerHTML = `
                    <div style="font-size: 0.85rem; margin-bottom: 4px; opacity: 0.8;">
                        ${tag}<strong>${msg.username}</strong> <span style="font-size:10px; opacity:0.5; margin-left:5px;">${time}</span>
                    </div>
                    <div style="${isDel ? 'font-style:italic; opacity:0.5;' : ''}">${msg.content}</div>
                     ${(lowerUser === ADMIN_NAME && !isDel) ? `<button style="background:none; color:red; font-size:10px; padding:0; margin-top:5px; cursor:pointer;" onclick="deleteMsg('${msg.id}')">Delete</button>` : ""}
                `;
                msgContainer.appendChild(div);
            });
            msgContainer.scrollTop = msgContainer.scrollHeight;
        } catch (e) { console.error(e); }
    }

    // --- SENDING ---
    document.getElementById('chat-form').onsubmit = async (e) => {
        e.preventDefault();
        const now = Date.now();
        const input = document.getElementById('message-input');
        if (now - lastMessageTime < 2000 && lowerUser !== ADMIN_NAME) return alert("Please wait between messages.");
        
        const val = input.value.trim();
        if (!val) return;
        
        input.value = ""; 
        lastMessageTime = now;

        await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, content: val })
        });
        fetchMessages();
    };

    // --- ADMIN ACTIONS ---
    window.adminExecute = async (action) => {
        let target = document.getElementById(action === 'warn' ? 'warn-search' : 'ban-search').value.trim();
        const reason = document.getElementById(action === 'warn' ? 'warn-reason' : 'ban-reason').value.trim();
        const cat = document.getElementById('ban-category')?.value || 'Both';

        if (!target) return alert("Enter a username.");
        if (target.startsWith('@')) target = target.substring(1);

        let data = { username: target, last_action_reason: reason, last_action_type: action, last_action_category: cat };
        if (action === 'ban') { data.is_banned = true; }
        else if (action === 'unban') { data.is_banned = false; data.warned = false; data.temp_ban_until = null; }
        else if (action === 'warn') data.warned = true;

        await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify(data)
        });
        alert("Action completed.");
    };

    window.executeTempBan = async () => {
        let target = document.getElementById('temp-ban-search').value.trim();
        if (target.startsWith('@')) target = target.substring(1);
        
        const duration = parseInt(document.getElementById('temp-ban-duration').value);
        const reason = document.getElementById('temp-ban-reason').value.trim();
        const expiry = new Date(); 
        expiry.setMinutes(expiry.getMinutes() + duration);

        await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify({ 
                username: target, 
                last_action_type: 'temp_ban', 
                last_action_reason: reason,
                temp_ban_until: expiry.toISOString() 
            })
        });
        alert("Temporary ban applied.");
    };

    window.deleteMsg = async (id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${id}`, { 
            method: 'PATCH', 
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ content: "Message Was Deleted By Owner" })
        });
        fetchMessages();
    };

    const dirSearch = document.getElementById('directory-search');
    if (dirSearch) {
        dirSearch.oninput = (e) => renderUserDirectory(e.target.value);
    }

    setInterval(fetchMessages, 3000);
    fetchMessages();
});
