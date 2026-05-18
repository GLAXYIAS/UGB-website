// --- INITIALIZATION ---
const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

let _supabase;
if (window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// --- TAB SWITCHING & UI ---
document.addEventListener('DOMContentLoaded', () => {
    const signupTab = document.getElementById('signupTab');
    const loginTab = document.getElementById('loginTab');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (signupTab && loginTab) {
        signupTab.onclick = () => {
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
        };

        loginTab.onclick = () => {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            signupTab.classList.remove('active');
            loginTab.classList.add('active');
        };
    }

    const setupToggle = (inputId, toggleId) => {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        if (input && toggle) {
            toggle.onclick = () => {
                input.type = input.type === 'password' ? 'text' : 'password';
                toggle.textContent = input.type === 'password' ? '👁️' : '🙈';
            };
        }
    };
    setupToggle('signupPassword', 'toggleSignupPassword');
    setupToggle('loginPassword', 'toggleLoginPassword');
});

// --- VALIDATION ---
window.checkEmail = () => {
    const email = document.getElementById('signupEmail').value.trim();
    const feedback = document.getElementById('emailFeedback');
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    feedback.innerHTML = regex.test(email) ? '<span class="success">Valid format</span>' : '<span class="error">Invalid email</span>';
};

window.checkUsername = async () => {
    const username = document.getElementById('signupUsername').value.trim();
    const feedback = document.getElementById('usernameFeedback');
    if (username.length < 3) return;
    const { data } = await _supabase.from('user_roles').select('username').eq('username', username);
    feedback.innerHTML = (data && data.length > 0) ? '<span class="error">Taken</span>' : '<span class="success">Available</span>';
};

// --- SIGN UP LOGIC (SIMPLE: NO CAPTCHA & INSTANT LOGIN) ---
window.handleSignup = async () => {
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const message = document.getElementById('signupMessage');

    if (!email || !username || !password) {
        message.innerHTML = '<span class="error">Please fill in all fields.</span>';
        return;
    }

    message.innerHTML = '<span style="color: #8b00ff;">Creating account...</span>';

    // Captcha option completely removed here
    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { display_name: username }
        }
    });

    if (error) {
        message.innerHTML = `<span class="error">${error.message}</span>`;
        return;
    }

    if (data.user) {
        try {
            // Inserts into your correct 'user_roles' table
            const { error: insertError } = await _supabase.from('user_roles').insert([
                { id: data.user.id, username: username, email: email, role_tag: 'user' }
            ]);

            if (insertError) {
                console.error("Database Insert Error:", insertError);
                message.innerHTML = `<span class="error">Profile link failed: ${insertError.message}</span>`;
                return;
            }

            // Updated confirmation message: Notice of instant access instead of email verification check
            message.innerHTML = '<span class="success">Account created! Logging you in seamlessly...</span>';
            
            // Set user into localStorage right away
            localStorage.setItem('chatUser', username);

            document.getElementById('signupEmail').value = '';
            document.getElementById('signupUsername').value = '';
            document.getElementById('signupPassword').value = '';

            // Automatically route inside your app after 1.5 seconds
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1500);

        } catch (dbErr) {
            console.error("Database Crash:", dbErr);
            message.innerHTML = '<span class="error">Failed to save profile records.</span>';
        }
    }
};

// --- LOGIN LOGIC ---
window.handleLogin = async () => {
    const identifier = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    if (!identifier || !password) {
        message.innerHTML = '<span class="error">Fill in all fields</span>';
        return;
    }

    message.innerHTML = '<span style="color: #8b00ff;">Logging in...</span>';

    try {
        let emailToAuth = identifier;

        if (!identifier.includes('@')) {
            const { data: profile, error: profileError } = await _supabase
                .from('user_roles')
                .select('email')
                .eq('username', identifier)
                .single();

            if (profileError || !profile) {
                message.innerHTML = '<span class="error">Username not found</span>';
                return;
            }
            emailToAuth = profile.email;
        }

        const { data, error } = await _supabase.auth.signInWithPassword({
            email: emailToAuth,
            password: password
        });

        if (error) {
            message.innerHTML = `<span class="error">${error.message}</span>`;
        } else {
            const finalName = data.user.user_metadata?.display_name || identifier;
            localStorage.setItem('chatUser', finalName);
            message.innerHTML = `<span class="success">Welcome, ${finalName}!</span>`;
            
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1000);
        }
    } catch (criticalErr) {
        console.error("Authentication Process Exception:", criticalErr);
        message.innerHTML = '<span class="error">Unexpected server error. Check console.</span>';
    }
};
