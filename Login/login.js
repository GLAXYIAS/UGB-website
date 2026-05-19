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

// --- SIGN UP LOGIC (WITH STRICT CUSTOM VALIDATIONS) ---
window.handleSignup = async () => {
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const message = document.getElementById('signupMessage');

    // 1. Check for blank fields
    if (!email || !username || !password) {
        message.innerHTML = '<span class="error">Please fill in all fields.</span>';
        return;
    }

    // 2. PASSWORD VALIDATION: More than 5 characters and shorter than 35
    if (password.length <= 5 || password.length >= 35) {
        message.innerHTML = '<span class="error">Password must be between 6 and 34 characters.</span>';
        return;
    }

    // 3. MAJOR EMAIL DOMAIN FILTER (Whitelist)
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
        message.innerHTML = '<span class="error">Invalid email format.</span>';
        return;
    }
    
    const domain = emailParts[1].toLowerCase();
    const allowedDomains = [
        'gmail.com', 
        'outlook.com', 
        'hotmail.com', 
        'live.com', 
        'msn.com',
        'yahoo.com', 
        'icloud.com', 
        'proton.me', 
        'protonmail.com', 
        'zoho.com', 
        'aol.com'
    ];

    if (!allowedDomains.includes(domain)) {
        message.innerHTML = '<span class="error">Please use a valid primary email provider (Gmail, Outlook, Proton, etc.).</span>';
        return;
    }

    message.innerHTML = '<span style="color: #8b00ff;">Verifying credentials...</span>';

    try {
        // 4. DUPLICATE USERNAME CHECK
        const { data: existingUser, error: userCheckError } = await _supabase
            .from('user_roles')
            .select('username')
            .eq('username', username);

        if (userCheckError) throw userCheckError;
        if (existingUser && existingUser.length > 0) {
            message.innerHTML = '<span class="error">Username is already taken.</span>';
            return;
        }

        // 5. DUPLICATE EMAIL CHECK
        const { data: existingEmail, error: emailCheckError } = await _supabase
            .from('user_roles')
            .select('email')
            .eq('email', email)
            .not('email', 'is', null);

        if (emailCheckError) throw emailCheckError;
        if (existingEmail && existingEmail.length > 0) {
            message.innerHTML = '<span class="error">This email is already registered.</span>';
            return;
        }

        // 6. SUBMIT TO SUPABASE AUTH
        const { data, error: authError } = await _supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { display_name: username }
            }
        });

        if (authError) {
            message.innerHTML = `<span class="error">${authError.message}</span>`;
            return;
        }

        if (data.user) {
            // 7. INSERT PROFILE INTO USER_ROLES
            const { error: insertError } = await _supabase.from('user_roles').insert([
                { 
                    id: data.user.id, 
                    username: username, 
                    email: email, 
                    role_tag: 'user',
                    is_banned: false, 
                    bio: null,
                    pfp_url: null,
                    temp_ban_until: null
                }
            ]);

            if (insertError) {
                console.error("Database Insert Error:", insertError);
                message.innerHTML = `<span class="error">Profile save failed: ${insertError.message}</span>`;
                return;
            }

            // Success state and login initialization
            message.innerHTML = '<span class="success">Account created! Logging you in...</span>';
            localStorage.setItem('chatUser', username);

            document.getElementById('signupEmail').value = '';
            document.getElementById('signupUsername').value = '';
            document.getElementById('signupPassword').value = '';

            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1500);
        }

    } catch (err) {
        console.error("Signup validation crash:", err);
        message.innerHTML = '<span class="error">Security processing error. Check console.</span>';
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
