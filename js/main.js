// This function appears to be older login logic.
// It's not causing the error, but your newer `login.js` file handles this now.
function handleLogin(event, role) {
  event.preventDefault();
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username && password) {
    sessionStorage.setItem("role", role);

    if (role === "user") {
      alert("Logged in as User! Redirecting to request form...");
      window.location.href = "dashboard.html";
    } else {
      alert("Logged in as Manager! Redirecting to dashboard...");
      window.location.href = "dashboard.html";
    }
  } else {
    alert("Please enter valid credentials.");
  }

  return false;
}

// ✅ FIX: Find the filter elements first
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

// ✅ FIX: Only add event listeners IF the filter elements exist on the current page.
if (statusFilter && priorityFilter) {
  statusFilter.addEventListener("change", applyFilters);
  priorityFilter.addEventListener("change", applyFilters);
}

function applyFilters() {
  const status = document.getElementById("statusFilter").value;
  const priority = document.getElementById("priorityFilter").value;
  const rows = document.querySelectorAll("tbody tr");

  rows.forEach(row => {
    const rowStatus = row.querySelector(".status")?.textContent.trim();
    const rowPriority = row.querySelector(".priority")?.textContent.trim();

    const statusMatch = status === "All" || rowStatus === status;
    const priorityMatch = priority === "All" || rowPriority === priority;

    row.style.display = (statusMatch && priorityMatch) ? "" : "none";
  });
}

// Toast system
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  
  // ✅ FIX: Add a check for the toast container as well.
  if (toastContainer) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}