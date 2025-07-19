document.addEventListener("DOMContentLoaded", async () => {
  // ✅ FIX: Get the token from local storage first.
  const token = localStorage.getItem("token");

  // ✅ FIX: If there is no token, redirect to the login page.
  if (!token) {
    window.location.href = 'login-user.html';
    return;
  }

  try {
    // ✅ FIX: Add the Authorization header to the fetch request.
    const res = await fetch("http://localhost:5000/api/requests", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // ✅ FIX: Check if the token was invalid and redirect if needed.
    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login-user.html';
        }
        // Throw an error to be caught by the catch block
        throw new Error(`Server responded with status: ${res.status}`);
    }

    const data = await res.json();

    // The rest of your data processing logic is perfect
    const statusCount = { Pending: 0, "In Progress": 0, Resolved: 0 };
    const priorityCount = { Low: 0, Medium: 0, High: 0 };
    const trendData = {}; // date: count

    data.forEach(req => {
      const status = req.status || "Pending";
      const priority = req.priority || "Medium";
      const createdAt = new Date(req.createdAt).toISOString().split("T")[0]; // YYYY-MM-DD

      statusCount[status] = (statusCount[status] || 0) + 1;
      priorityCount[priority] = (priorityCount[priority] || 0) + 1;
      trendData[createdAt] = (trendData[createdAt] || 0) + 1;
    });

    // Your chart rendering logic is also perfect
    renderPieChart("statusChart", "Request Status Distribution", statusCount, ["#ffc107", "#17a2b8", "#28a745"]);
    renderBarChart("priorityChart", "Priority Level Comparison", priorityCount, ["#6c757d", "#007bff", "#dc3545"]);
    renderLineChart("trendChart", "Requests Over Time", trendData, "#00b894");

  } catch (err) {
    console.error("Analytics Error:", err);
    // You can also show an error message on the page
    document.body.innerHTML = "<h2>Could not load analytics. Please try logging in again.</h2>";
  }
});


// =============================================================
// Your chart rendering functions are perfect. No changes needed.
// =============================================================

function renderPieChart(canvasId, title, dataObj, colors) {
  const chartElement = document.getElementById(canvasId);
  if (!chartElement) return; // Prevent errors if canvas is missing
  new Chart(chartElement, {
    type: "pie",
    data: {
      labels: Object.keys(dataObj),
      datasets: [{
        label: title,
        data: Object.values(dataObj),
        backgroundColor: colors
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: title },
        legend: { position: "bottom" }
      }
    }
  });
}

function renderBarChart(canvasId, title, dataObj, colors) {
  const chartElement = document.getElementById(canvasId);
  if (!chartElement) return;
  new Chart(chartElement, {
    type: "bar",
    data: {
      labels: Object.keys(dataObj),
      datasets: [{
        label: title,
        data: Object.values(dataObj),
        backgroundColor: colors
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: title },
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderLineChart(canvasId, title, dataObj, lineColor) {
  const chartElement = document.getElementById(canvasId);
  if (!chartElement) return;
  const labels = Object.keys(dataObj).sort(); // sort dates
  const data = labels.map(label => dataObj[label]);

  new Chart(chartElement, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        fill: true,
        backgroundColor: `${lineColor}33`,
        borderColor: lineColor,
        tension: 0.3
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: title },
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}