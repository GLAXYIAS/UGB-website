// BAN/guard.js
const DB_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

async function runSecurityCheck() {
    const user = localStorage.getItem('chatUser');
    
    // 1. Find or Create the overlay
    let overlay = document.getElementById('lockdown-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'lockdown-overlay';
        // IMPORTANT: We set it to NONE immediately here
        overlay.style.display = 'none'; 
        document.body.appendChild(overlay);
    }

    // 2. If no user, hide and stop
    if (!user) {
        overlay.style.display = 'none';
        return;
    }

    try {
        const res = await fetch(`${DB_URL}/rest/v1/user_roles?username=eq.${user}&select=*`, {
            headers: { 'apikey': DB_KEY, 'Authorization': `Bearer ${DB_KEY}` }
        });
        const data = await res.json();
        
        // 3. Logic Gate
        if (data && data.length > 0) {
            const profile = data[0];

            if (profile.is_banned === true) {
                overlay.style.display = 'flex'; // ONLY SHOW IF BANNED
                overlay.innerHTML = `<h1 style="color:red;">BANNED</h1><p style="color:white;">${profile.last_action_reason || ""}</p>`;
                return;
            }

            if (profile.temp_ban_until && new Date(profile.temp_ban_until) > new Date()) {
                overlay.style.display = 'flex'; // ONLY SHOW IF TEMP BANNED
                overlay.innerHTML = `<h1 style="color:red;">TEMP BAN</h1><div id="lockdown-timer" style="color:white;"></div>`;
                return;
            }
        }

        // 4. FORCE HIDE IF WE GET HERE
        overlay.style.display = 'none';
        console.log("Security Check: User is clean. Hiding overlay.");

    } catch (err) {
        overlay.style.display = 'none';
        console.error("Guard Error:", err);
    }
}
runSecurityCheck();
