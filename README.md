# Tata Steel Maintenance Portal

A full-stack maintenance request portal built for a summer internship. This application allows factory staff to submit maintenance requests and managers to track, manage, and resolve them.

## Key Features

- **User & Manager Roles:** Separate login and dashboard views for regular users and managers.
- **Authentication:** Secure user registration and login using JWT (JSON Web Tokens).
- **CRUD Operations:** Users can create, read, update, and delete their maintenance requests.
- **Real-time Updates:** The dashboard updates instantly for all users using Socket.io when a request's status is changed.
- **Dynamic Dashboard:** Features live search, status filters, and priority filters.
- **Analytics Page:** Visualizes request data with charts.
- **File Uploads:** Users can attach images or documents to their requests.

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-time Engine:** Socket.io
- **Authentication:** JWT, bcrypt

## How to Run Locally

1.  **Clone the repository.**
2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Create a .env file with your DATABASE_URL and JWT_SECRET
    node server.js
    ```
3.  **Frontend Setup:**
    - Open the `frontend/index.html` file in your browser (using a Live Server extension is recommended).
