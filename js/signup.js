function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  const container = document.getElementById("toastContainer");
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function handleSignup() {
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const role = document.getElementById("signup-role").value;

  if (!username || !password || !role) {
    showToast("Please fill all fields and select a role.", "error");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Account created successfully!", "success");
      setTimeout(() => {
        window.location.href = role === "user" ? "login-user.html" : "login-manager.html";
      }, 2000);
    } else {
      showToast(data.message || "Signup failed", "error");
    }
  } catch (err) {
    console.error("Signup error:", err);
    showToast("Server error, please try again later.", "error");
  }
}

document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();
  handleSignup();
});
