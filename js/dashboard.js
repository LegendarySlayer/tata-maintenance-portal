// =================================================================
//                 UPDATED dashboard.js with Search
// =================================================================

document.addEventListener("DOMContentLoaded", () => {
  renderDashboard(); 

  // Attach event listeners for filters
  document.getElementById("statusFilter").addEventListener("change", renderDashboard);
  document.getElementById("priorityFilter").addEventListener("change", renderDashboard);

  // ✅ ADDED: Event listener for the search bar
  document.getElementById("searchInput").addEventListener("input", renderDashboard);

  // This part for hiding the button based on role is fine
  const role = sessionStorage.getItem("role");
  document.querySelectorAll(".add-request-btn").forEach(btn => {
    if (role === "manager") {
      btn.style.display = "none";
    } else if (role === "user") {
      const isNavButton = btn.closest("nav");
      if (isNavButton) {
        btn.style.display = "none";
      }
    }
  });
});

async function renderDashboard() {
  const tableBody = document.getElementById("ticketTableBody");
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("No token found, redirecting to login.");
    window.location.href = 'login-user.html';
    return;
  }

  // ✅ ADDED: Get the current value from the search bar
  const searchTerm = document.getElementById("searchInput").value;
  
  const statusFilter = document.getElementById("statusFilter").value.toLowerCase();
  const priorityFilter = document.getElementById("priorityFilter").value.toLowerCase();

  try {
    // ✅ MODIFIED: Build the URL dynamically to include the search term
    const url = new URL("http://localhost:5000/api/requests");
    if (searchTerm) {
      url.searchParams.append('search', searchTerm);
    }

    // Use the new dynamic URL in the fetch request
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      console.log("Token invalid or expired, redirecting to login.");
      localStorage.removeItem("token"); 
      sessionStorage.removeItem("role");
      window.location.href = 'login-user.html';
      return;
    }

    const requests = await res.json();
    tableBody.innerHTML = "";
    updateCounters(requests);
    
    // The frontend filters will now run on the data returned by the backend search
    const filteredRequests = requests.filter(r => {
      const statusMatch = statusFilter === "all" || (r.status || "pending").toLowerCase() === statusFilter;
      const priorityMatch = priorityFilter === "all" || (r.priority || "").toLowerCase() === priorityFilter;
      return statusMatch && priorityMatch;
    });

    if (filteredRequests.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 11;
      td.style.textAlign = "center";
      td.textContent = "No requests found.";
      tr.appendChild(td);
      tableBody.appendChild(tr);
      return;
    }

    filteredRequests.forEach(req => {
      const role = sessionStorage.getItem("role");
      const username = localStorage.getItem("username")?.trim().toLowerCase();
      const status = req.status?.toLowerCase() || "pending";
      const resolvedAt = req.resolvedAt ? new Date(req.resolvedAt).toLocaleString() : '—';
      const createdAt = req.createdAt ? new Date(req.createdAt).toLocaleString() : '—';
      const submittedBy = req.submittedBy?.trim().toLowerCase();
      const canEdit = role === "manager" || submittedBy === username;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${req._id}</td>
        <td>${req.department || '—'}</td>
        <td>${req.machine || '—'}</td>
        <td>${req.machineId || '—'}</td>
        <td><span class="status ${status.replace(/\s+/g, '-')}">${req.status || 'Pending'}</span></td>
        <td><span class="priority ${req.priority?.toLowerCase()}">${req.priority || '—'}</span></td>
        <td>${createdAt}</td>
        <td>${req.attachment ? `<a href="http://localhost:5000/${req.attachment.replace(/^\/?uploads\//, 'uploads/')}" target="_blank">View</a>` : '—'}</td>
        <td><button class="action-btn view-btn" data-desc="${req.description}">View</button></td>
        <td>
          ${canEdit ? `
            <div style="display:inline-flex; gap:6px;">
              <button class="edit-btn" data-id="${req._id}">✏️</button>
              <button class="delete-btn" data-id="${req._id}">🗑️</button>
            </div>
          ` : '&nbsp;'}
        </td>
        <td>
          ${status !== 'resolved' && role === 'manager' ? `
            <div style="display:inline-flex; gap:6px; align-items:center;">
              <button class="resolve-btn" data-id="${req._id}">Resolve</button>
              <select class="status-dropdown" data-id="${req._id}">
                <option value="">⋯</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          ` : `<span class="resolved-label">${resolvedAt}</span>`}
        </td>
      `;
      tableBody.appendChild(tr);
    });

    attachEventListeners();
  } catch (err) {
    console.error("Failed to load requests:", err);
    tableBody.innerHTML = "<tr><td colspan='11' style='text-align:center;'>An error occurred. Please try logging in again.</td></tr>";
  }
}

function attachEventListeners() {
  const token = localStorage.getItem("token");

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const desc = e.target.getAttribute("data-desc");
      alert("Description:\n" + desc);
    });
  });

  document.querySelectorAll('.resolve-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute("data-id");
      await fetch(`http://localhost:5000/api/requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Resolved" })
      });
      renderDashboard();
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute("data-id");
      const res = await fetch(`http://localhost:5000/api/requests`, { 
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      const req = data.find(r => r._id === id);
      if (req) {
        sessionStorage.setItem("editMode", "true");
        sessionStorage.setItem("editData", JSON.stringify(req));
        window.location.href = "add.html";
      }
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this request?")) {
        await fetch(`http://localhost:5000/api/requests/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        renderDashboard();
      }
    });
  });

  document.querySelectorAll(".status-dropdown").forEach(drop => {
    drop.addEventListener("change", async (e) => {
      const id = e.target.getAttribute("data-id");
      const newStatus = e.target.value;
      if (newStatus) {
        await fetch(`http://localhost:5000/api/requests/${id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
        renderDashboard();
      }
    });
  });
}

function updateCounters(requests) {
  document.getElementById("totalCount").textContent = requests.length;
  document.getElementById("pendingCount").textContent = requests.filter(r => (r.status || 'pending').toLowerCase() === 'pending').length;
  document.getElementById("inProgressCount").textContent = requests.filter(r => (r.status || '').toLowerCase() === 'in progress').length;
  document.getElementById("resolvedCount").textContent = requests.filter(r => (r.status || '').toLowerCase() === 'resolved').length;
}