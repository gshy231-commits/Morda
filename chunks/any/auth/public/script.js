const apiUrl = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Страница загружена!");
    checkAuth(); 
    document.getElementById("loginBtn").addEventListener("click", login);
    document.getElementById("profileBtn").addEventListener("click", getProfile);
});

function checkAuth() {
    const token = localStorage.getItem("token");
    if (token) {
        console.log("✅ Токен найден:", token);
    } else {
        console.warn("❌ Токен не найден в localStorage!");
    }
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    document.getElementById("message").innerText = data.message || "Успешно";

    if (response.ok) {
        localStorage.setItem("token", data.token);
        console.log("🔒 Токен сохранен:", data.token);
    } else {
        console.error("Ошибка авторизации:", data);
    }
}

async function getProfile() {
    const token = localStorage.getItem("token");
    console.log("📤 Токен перед отправкой:", token);

    if (!token) {
        document.getElementById("profile").innerText = "Вы не авторизованы";
        return;
    }

    const response = await fetch(`${apiUrl}/profile`, {
        method: "GET",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    console.log("Ответ сервера:", data);

    document.getElementById("profile").innerText = data.message || "Ошибка";
}
