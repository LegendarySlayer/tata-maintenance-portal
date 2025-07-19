document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const isManager = window.location.pathname.includes("login-manager");
  const role = isManager ? "manager" : "user";

  if (!username || !password) {
    showToast("Please enter valid credentials.", "error");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Store user session
      sessionStorage.setItem("role", data.user.role);
      localStorage.setItem("username", data.user.username);
     localStorage.setItem("token", data.token); // ✅ NOT data.user.token

      // ✅ Clear any leftover edit state
      sessionStorage.removeItem("editMode");
      sessionStorage.removeItem("editData");

      showToast("Login successful!", "success");

      // ✅ Redirect to dashboard
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } else {
      showToast(data.message || "Login failed.", "error");
    }
  } catch (err) {
    console.error("Login error:", err);
    showToast("Login failed due to server issue.", "error");
  }
});

// Toast message function (if not already included globally)
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  const container = document.getElementById("toastContainer") || createToastContainer();
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toastContainer";
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}
