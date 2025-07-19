document.addEventListener('DOMContentLoaded', function () {
  const timestampField = document.getElementById('timestamp');
  
  // ✅ ADDED THIS SECTION to handle the custom file input display
  const fileInput = document.getElementById('attachment');
  const fileNameSpan = document.getElementById('fileName');

  fileInput.addEventListener('change', function() {
    if (fileInput.files.length > 0) {
      fileNameSpan.textContent = fileInput.files[0].name;
    } else {
      fileNameSpan.textContent = 'No file chosen';
    }
  });
  // ✅ END OF ADDED SECTION

  const form = document.getElementById('requestForm');
  let isEditMode = false;
  let editData = null;

  // Check for edit mode
  try {
    const flag = sessionStorage.getItem("editMode");
    const rawData = sessionStorage.getItem("editData");

    if (flag === "true" && rawData) {
      editData = JSON.parse(rawData);
      isEditMode = true;
    }
  } catch (err) {
    console.warn("Invalid edit data. Resetting...");
    sessionStorage.removeItem("editMode");
    sessionStorage.removeItem("editData");
  }

  // Populate form if in edit mode, otherwise set current time
  if (isEditMode && editData) {
    document.querySelector('h2').textContent = 'Edit Maintenance Request';
    document.getElementById('department').value = editData.department;
    document.getElementById('machine').value = editData.machine;
    document.getElementById('machineId').value = editData.machineId;
    document.getElementById('description').value = editData.description;
    document.getElementById('priority').value = editData.priority;
    timestampField.value = new Date(editData.createdAt).toLocaleString();
    form.setAttribute("data-edit-id", editData._id);
  } else {
    timestampField.value = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
  }

  // Handle form submission
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("department", document.getElementById('department').value);
    formData.append("machine", document.getElementById('machine').value.trim());
    formData.append("machineId", document.getElementById('machineId').value.trim());
    formData.append("description", document.getElementById('description').value.trim());
    formData.append("priority", document.getElementById('priority').value);
    
    if (fileInput.files.length > 0) {
      formData.append("attachment", fileInput.files[0]);
    }

    const isEdit = form.hasAttribute("data-edit-id");
    const editId = form.getAttribute("data-edit-id");

    try {
      const token = localStorage.getItem("token");
      let response;
      let url;
      let options;

      if (isEdit) {
        url = `http://localhost:5000/api/requests/${editId}`;
        options = {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData // FormData can be used for PATCH if backend is set up for it
        };
      } else {
        url = "http://localhost:5000/api/requests";
        options = {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        };
      }
      
      response = await fetch(url, options);
      const result = await response.json();

      if (response.ok) {
        showToast(isEdit ? "Request updated successfully!" : "Request submitted successfully!", "success");
        sessionStorage.removeItem("editMode");
        sessionStorage.removeItem("editData");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      } else {
        showToast(`Error: ${result.message || "An unknown error occurred."}`, "error");
      }
    } catch (err) {
      console.error("Submit error:", err);
      showToast("Submission failed. Please check your connection and try again.", "error");
    }
  });
});

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.getElementById("toastContainer").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}