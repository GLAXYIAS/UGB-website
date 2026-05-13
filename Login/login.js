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

// --- SIGN UP LOGIC (12-DIGIT CODE) ---
window.handleSignup = async () => {
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const message = document.getElementById('signupMessage');

    const captchaToken = grecaptcha.getResponse();
    if (!captchaToken) {
        message.innerHTML = '<span class="error">Complete the reCAPTCHA</span>';
        return;
    }

    // 1. Generate 12-digit code
    const verificationCode = Math.floor(100000000000 + Math.random() * 900000000000);
    message.innerHTML = '<span style="color: #8b00ff;">Sending code to ' + email + '...</span>';

    // 2. SEND EMAIL VIA EMAILJS (Your Outlook Service)
    try {
        await emailjs.send("service_jh86mmf", "template_yhnzvos", {
            to_email: email,
            verification_code: verificationCode,
            username: username
        });
        console.log("Email sent successfully with code:", verificationCode);
    } catch (err) {
        console.error("EmailJS Error:", err);
        message.innerHTML = '<span class="error">Failed to send email. Check console.</span>';
        return;
    }

    // 3. Register in Supabase
    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            captchaToken: captchaToken,
            data: { display_name: username }
        }
    });

    if (error) {
        message.innerHTML = `<span class="error">${error.message}</span>`;
        grecaptcha.reset();
    } else {
        // 4. Verification Prompt
        const userEnteredCode = prompt("Check your inbox! Enter the 12-digit code sent to " + email);

        if (userEnteredCode == verificationCode) {
            // Save to database
            await _supabase.from('user_roles').insert([
                { username: username, email: email, role_tag: 'user' }
            ]);
            
            message.innerHTML = '<span class="success">Verified! You can now login.</span>';
            grecaptcha.reset();
        } else {
            message.innerHTML = '<span class="error">Invalid code. Signup failed.</span>';
        }
    }
};

// --- LOGIN LOGIC (BY USERNAME OR EMAIL) ---
window.handleLogin = async () => {
    const identifier = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    message.innerHTML = '<span style="color: #8b00ff;">Logging in...</span>';

    let emailToAuth = identifier;

    // Look up email if they used a username
    if (!identifier.includes('@')) {
        const { data: profile } = await _supabase
            .from('user_roles')
            .select('email')
            .eq('username', identifier)
            .single();

        if (profile) {
            emailToAuth = profile.email;
        } else {
            message.innerHTML = '<span class="error">Username not found</span>';
            return;
        }
    }

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: emailToAuth,
        password: password
    });

    if (error) {
        message.innerHTML = `<span class="error">Login failed: ${error.message}</span>`;
    } else {
        const finalName = data.user.user_metadata.display_name || identifier;
        localStorage.setItem('chatUser', finalName);
        message.innerHTML = `<span class="success">Welcome, ${finalName}!</span>`;
        
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1000);
    }
};
