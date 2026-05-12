// --- INITIALIZATION ---
const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

let _supabase;

// Ensure Supabase is loaded before initializing
if (window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error("Supabase library not found! Make sure the CDN script is in your HTML.");
}

// --- TAB SWITCHING (Wrapped to ensure elements exist) ---
document.addEventListener('DOMContentLoaded', () => {
    const signupTab = document.getElementById('signupTab');
    const loginTab = document.getElementById('loginTab');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (signupTab && loginTab) {
        signupTab.addEventListener('click', () => {
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
        });

        loginTab.addEventListener('click', () => {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            signupTab.classList.remove('active');
            loginTab.classList.add('active');
        });
    }

    // --- PASSWORD TOGGLES ---
    setupPasswordToggle('signupPassword', 'toggleSignupPassword');
    setupPasswordToggle('loginPassword', 'toggleLoginPassword');
});

function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (input && toggle) {
        toggle.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    }
}

// --- VALIDATION HELPERS ---
window.isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim());
};

window.checkUsername = async () => {
    const username = document.getElementById('signupUsername').value.trim();
    const feedback = document.getElementById('usernameFeedback');
    if (!username || !_supabase) return;

    const { data } = await _supabase.from('user_roles').select('username').eq('username', username);
    
    if (data && data.length > 0) {
        feedback.innerHTML = '<span class="error">Taken</span>';
    } else {
        feedback.innerHTML = '<span class="success">Available</span>';
    }
};

window.checkEmail = () => {
    const email = document.getElementById('signupEmail').value.trim();
    const feedback = document.getElementById('emailFeedback');
    if (!email || !window.isValidEmail(email)) {
        feedback.innerHTML = '<span class="error">Invalid email</span>';
        return;
    }
    feedback.innerHTML = '<span class="success">Valid format</span>';
};

// --- SIGN UP LOGIC ---
window.handleSignup = async () => {
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const message = document.getElementById('signupMessage');

    const captchaToken = grecaptcha.getResponse();
    if (!captchaToken) {
        message.innerHTML = '<span class="error">Please complete the reCAPTCHA</span>';
        return;
    }

    if (!window.isValidEmail(email) || !username || password.length < 8) {
        message.innerHTML = '<span class="error">Check inputs (Password 8+ chars)</span>';
        return;
    }

    message.innerHTML = '<span style="color: #8b00ff;">Creating account...</span>';

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            captchaToken: captchaToken,
            emailRedirectTo: 'https://glaxyias.github.io/UBGSite/',
            data: { display_name: username }
        }
    });

    if (error) {
        message.innerHTML = `<span class="error">${error.message}</span>`;
        grecaptcha.reset();
    } else {
        await _supabase.from('user_roles').insert([
            { username: username, role_tag: 'user', is_banned: false }
        ]);

        message.innerHTML = '<span class="success">Check your email for the verification link!</span>';
        grecaptcha.reset();
    }
};

// --- LOGIN LOGIC ---
window.handleLogin = async () => {
    const identifier = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    if (!identifier || !password) {
        message.innerHTML = '<span class="error">Enter username/email and password</span>';
        return;
    }

    message.innerHTML = '<span style="color: #8b00ff;">Logging in...</span>';

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: identifier,
        password: password
    });

    if (error) {
        if (error.message.includes("Email not confirmed")) {
            message.innerHTML = '<span class="error">Please verify your email first!</span>';
        } else {
            message.innerHTML = '<span class="error">Invalid credentials</span>';
        }
    } else {
        const userDisplayName = data.user.user_metadata.display_name || identifier.split('@')[0];
        localStorage.setItem('chatUser', userDisplayName);
        message.innerHTML = `<span class="success">Welcome, ${userDisplayName}!</span>`;
        
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1500);
    }
};
