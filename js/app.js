const BASE_URL = "http://localhost:8080/api/v1";

/* =========================
        TOKEN SYSTEM
========================= */

function setToken(token) {
    localStorage.setItem("token", token);
}

function getToken() {
    return localStorage.getItem("token");
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "../auth/login.html";
}

/* =========================
          AUTH
========================= */

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!data.token) {
        alert("Login failed");
        return;
    }

    setToken(data.token);
    window.location.href = "../public/index.html";
}

async function register() {
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password })
    });

    alert("Registered successfully!");
    window.location.href = "login.html";
}

/* =========================
        POSTS SYSTEM
========================= */

async function loadPosts() {
    const res = await fetch(`${BASE_URL}/posts`);
    const posts = await res.json();

    const container = document.getElementById("posts");
    if (!container) return;

    container.innerHTML = "";

    posts.forEach(p => {
        container.innerHTML += `
            <div class="card fade">
                <h3>${p.title}</h3>
                <p>${p.content}</p>
            </div>
        `;
    });
}

async function createPost() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        },
        body: JSON.stringify({ title, content })
    });

    alert("Post created!");

    loadPosts(); // 🔥 instant update (no reload)
}

/* =========================
        ADMIN USERS
========================= */

async function loadUsers() {
    const res = await fetch(`${BASE_URL}/users`, {
        headers: {
            "Authorization": "Bearer " + getToken()
        }
    });

    const users = await res.json();

    const box = document.getElementById("users");
    if (!box) return;

    box.innerHTML = "";

    users.forEach(u => {
        box.innerHTML += `
            <div class="card fade">
                <h4>${u.username}</h4>
                <p>${u.email}</p>

                <button class="danger" onclick="blockUser(${u.id})">Block</button>
                <button class="success" onclick="unblockUser(${u.id})">Unblock</button>
            </div>
        `;
    });
}

async function blockUser(id) {
    await fetch(`${BASE_URL}/users/block/${id}`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + getToken()
        }
    });

    loadUsers(); // 🔥 instant update
}

async function unblockUser(id) {
    await fetch(`${BASE_URL}/users/unblock/${id}`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + getToken()
        }
    });

    loadUsers(); // 🔥 instant update
}

/* =========================
        AUTO UPDATE
========================= */

// 🔥 real SaaS-style polling
function startAutoRefresh() {
    if (document.getElementById("posts")) {
        loadPosts();
        setInterval(loadPosts, 5000);
    }

    if (document.getElementById("users")) {
        loadUsers();
        setInterval(loadUsers, 5000);
    }
}

/* =========================
        INIT AUTO RUN
========================= */

document.addEventListener("DOMContentLoaded", () => {
    startAutoRefresh();
});