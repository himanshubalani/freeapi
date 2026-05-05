// --- CONFIGURATION ---
const BASE_URL = 'https://api.freeapi.app/api/v1/users';

// --- STATE MANAGEMENT ---
let accessToken = localStorage.getItem('accessToken') || null;

// --- DOM ELEMENTS ---
const forms = {
    login: document.getElementById('login-form'),
    register: document.getElementById('register-form')
};
const tabs = {
    login: document.getElementById('tab-login'),
    register: document.getElementById('tab-register')
};
const views = {
    unauth: document.getElementById('unauth-state'),
    auth: document.getElementById('auth-state')
};
const uiElements = {
    badge: document.getElementById('status-badge'),
    logoutBtn: document.getElementById('btn-logout'),
    dataTable: document.getElementById('user-data-table')
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    toggleTab('login');
    if (accessToken) {
        fetchCurrentUser();
    }
});

// --- UI HELPERS ---
function toggleTab(tab) {
    if (tab === 'login') {
        forms.login.classList.remove('hidden');
        forms.register.classList.add('hidden');
        tabs.login.classList.add('active');
        tabs.register.classList.remove('active');
    } else {
        forms.register.classList.remove('hidden');
        forms.login.classList.add('hidden');
        tabs.register.classList.add('active');
        tabs.login.classList.remove('active');
    }
}

function showBadge(message, type = 'success') {
    uiElements.badge.textContent = message;
    uiElements.badge.className = `badge ${type}`;
    // Auto-hide after 3 seconds
    setTimeout(() => {
        uiElements.badge.classList.add('hidden');
    }, 3000);
}

function setLoading(buttonId, isLoading, defaultText) {
    const btn = document.getElementById(buttonId);
    if (isLoading) {
        btn.disabled = true;
        btn.textContent = 'Processing...';
    } else {
        btn.disabled = false;
        btn.textContent = defaultText;
    }
}

// --- API ACTIONS ---

// 1. REGISTER
forms.register.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading('btn-register', true, 'Create Account');
    
    const payload = {
        username: document.getElementById('reg-username').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value
    };

    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            showBadge('Registration Successful', 'success');
            forms.register.reset();
            toggleTab('login'); // Redirect to login tab
        } else {
            showBadge(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showBadge('Network Error', 'error');
    } finally {
        setLoading('btn-register', false, 'Create Account');
    }
});

// 2. LOGIN
forms.login.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading('btn-login', true, 'Authenticate');

    const payload = {
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
    };

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            accessToken = data.data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            showBadge('Authentication Successful', 'success');
            forms.login.reset();
            fetchCurrentUser(); // Fetch profile immediately
        } else {
            showBadge(data.message || 'Invalid credentials', 'error');
        }
    } catch (error) {
        showBadge('Network Error', 'error');
    } finally {
        setLoading('btn-login', false, 'Authenticate');
    }
});

// 3. GET CURRENT USER
async function fetchCurrentUser() {
    if (!accessToken) return;

    try {
        const res = await fetch(`${BASE_URL}/current-user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await res.json();

        if (data.success) {
            renderProfile(data.data);
        } else {
            // Token likely expired or invalid
            handleLogoutState();
            showBadge('Session Expired', 'error');
        }
    } catch (error) {
        showBadge('Failed to fetch profile', 'error');
    }
}

// 4. LOGOUT
uiElements.logoutBtn.addEventListener('click', async () => {
    if (!accessToken) return;

    try {
        const res = await fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await res.json();

        if (data.success) {
            showBadge('Session Terminated', 'success');
            handleLogoutState();
        }
    } catch (error) {
        showBadge('Logout failed', 'error');
    }
});

// --- RENDER FUNCTIONS ---
function renderProfile(user) {
    // Switch to Auth View
    views.unauth.classList.add('hidden');
    views.auth.classList.remove('hidden');
    uiElements.logoutBtn.classList.remove('hidden');

    // Build Workbench-style Data Table
    const fieldsToDisplay = ['_id', 'username', 'email', 'role', 'createdAt'];
    let html = '';
    
    fieldsToDisplay.forEach(key => {
        if (user[key]) {
            html += `
                <div class="data-row">
                    <div class="data-key">${key}</div>
                    <div class="data-value">${user[key]}</div>
                </div>
            `;
        }
    });

    uiElements.dataTable.innerHTML = html;
}

function handleLogoutState() {
    accessToken = null;
    localStorage.removeItem('accessToken');
    
    // Switch to Unauth View (Empty State)
    views.auth.classList.add('hidden');
    views.unauth.classList.remove('hidden');
    uiElements.logoutBtn.classList.add('hidden');
    uiElements.dataTable.innerHTML = '';
}