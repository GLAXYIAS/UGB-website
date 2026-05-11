const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8';

document.addEventListener('DOMContentLoaded', async () => {
    const user = localStorage.getItem('chatUser');
    if (!user) { window.location.href = "../Login/login.html"; return; }

    document.getElementById('display-username').textContent = user;

    // --- 1. LOAD EXISTING PROFILE ---
    const loadProfile = async () => {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?username=eq.${user}&select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await response.json();

            if (data && data[0]) {
                const profile = data[0];
                if (profile.bio) document.getElementById('bio-input').value = profile.bio;
                if (profile.display_name) document.getElementById('display-name-input').value = profile.display_name;
                if (profile.pfp_url) document.getElementById('pfp-preview').src = profile.pfp_url;
                
                const joined = new Date(profile.created_at).toLocaleDateString();
                document.getElementById('join-date').textContent = `Member since: ${joined}`;
            }
        } catch (err) { console.error("Error loading profile:", err); }
    };

    // --- 2. HANDLE PFP UPLOAD (Base64 for simplicity) ---
    const pfpInput = document.getElementById('pfp-input');
    const pfpPreview = document.getElementById('pfp-preview');

    pfpInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                pfpPreview.src = event.target.result; // Set preview to the uploaded image
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 3. SAVE PROFILE DATA ---
    document.getElementById('save-profile-btn').onclick = async () => {
        const bio = document.getElementById('bio-input').value;
        const displayName = document.getElementById('display-name-input').value;
        const pfpUrl = document.getElementById('pfp-preview').src;
        const statusEl = document.getElementById('save-status');

        statusEl.textContent = "Saving...";
        statusEl.style.color = "white";

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?username=eq.${user}`, {
                method: 'PATCH',
                headers: { 
                    'apikey': SUPABASE_KEY, 
                    'Authorization': `Bearer ${SUPABASE_KEY}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    bio: bio, 
                    display_name: displayName, 
                    pfp_url: pfpUrl 
                })
            });

            if (response.ok) {
                statusEl.textContent = "Profile Updated Successfully!";
                statusEl.style.color = "#00c853";
            } else {
                throw new Error();
            }
        } catch (err) {
            statusEl.textContent = "Error saving profile. Try again.";
            statusEl.style.color = "#ff4444";
        }
    };

    loadProfile();
});
