// js/api.js  – Shared fetch helper used by all pages
// All API calls go through these functions

const BASE_URL = 'http://localhost:3000/api';

// Generic GET
async function apiGet(endpoint) {
    const res = await fetch(BASE_URL + endpoint);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// Generic POST
async function apiPost(endpoint, data) {
    const res = await fetch(BASE_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed.');
    return json;
}

// Generic PUT
async function apiPut(endpoint, data) {
    const res = await fetch(BASE_URL + endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed.');
    return json;
}

// Generic DELETE
async function apiDelete(endpoint) {
    const res = await fetch(BASE_URL + endpoint, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed.');
    return json;
}

// Show an alert message inside a container element
function showMsg(containerId, message, type = 'success') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => { el.innerHTML = ''; }, 4000);
}

// Check login - redirect to login if not logged in
function requireLogin() {
    const user = JSON.parse(localStorage.getItem('inv_user') || 'null');
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

// Render sidebar user info + highlight active link
function initPage(activeHref) {
    const user = requireLogin();
    if (!user) return null;

    // Show user name and role in sidebar footer
    const nameEl = document.getElementById('sidebar-username');
    const roleEl = document.getElementById('sidebar-role');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role_name || 'User';

    // Highlight the active nav link
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
        if (a.getAttribute('href') === activeHref) a.classList.add('active');
    });

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('inv_user');
            window.location.href = 'index.html';
        });
    }

    return user;
}
