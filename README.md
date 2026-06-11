#  Hostel Library Management System

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![AI](https://img.shields.io/badge/AI-Google%20Gemini%202.5-orange)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-success)

A fully cloud-native, intelligent Library Management System built for the Engineering College Hostels (ECH) at CEG. This system digitizes manual library records and features **Athena**, a custom-built AI chatbot that uses a RAG (Retrieval-Augmented Generation) pipeline to provide "shelf-aware" book recommendations.

---

##  Key Features

* ** Athena AI Chatbot (RAG Architecture):** Integrated with the Google Gemini 2.5 API. The chatbot actively queries the MongoDB database and cross-references user requests (e.g., "Find me a short philosophy book") with live inventory. It will *only* recommend books where `availableCopies > 0`.
* ** Role-Based Access:** Secure, isolated dashboards for both Admins and Students to track borrowed books, overdue fines, and physical inventory.
* ** Lightning-Fast Search:** Utilizes backend MongoDB `$regex` algorithms to instantly search a seeded database of 2,500+ books without overloading the frontend client.
* ** Dynamic PDF Reporting:** Generates official, branded college library reports dynamically on the frontend using `jsPDF` to save server processing power.
* ** Cloud-Deployed:** Hosted live with a React frontend on Vercel, a Node/Express backend on Render, and a MongoDB Atlas cluster.

---

##  Tech Stack

**Frontend (Client)**
* React.js (Single Page Application)
* Material-UI (Component Library)
* Axios (HTTP API Requests)
* jsPDF & jsPDF-AutoTable (Report Generation)

**Backend (Server & AI)**
* Node.js & Express.js (RESTful API)
* Google Gemini 2.5 API (Large Language Model)
* CORS & Dotenv (Security & Environment Variables)

**Database**
* MongoDB Atlas (NoSQL Cloud Database)
* Mongoose (Data Modeling & Schema Validation)

---

##  System Architecture (How the AI Works)
Instead of relying on standard AI, which can hallucinate books the library doesn't own, this system implements a strict **Retrieval-Augmented Generation (RAG)** pipeline:
1. **Retrieval:** When a student asks a question, the Node.js backend uses a MongoDB Aggregation Pipeline (`$match` and `$sample`) to pull exactly 100 books that are physically available on the shelves.
2. **Generation:** This localized data is securely passed to the Gemini API as a strict context window.
3. **Response:** The AI acts as a digital librarian, recommending exact Accession Numbers for books the student can physically check out at that exact moment.

---
##  The Team

This project was developed collaboratively by a 3-person team. My specific role was leading the **Backend Architecture & AI Integration**.

* **Elavarasi Arumugam (Me)** - Engineered the Node.js/Express backend, integrated the Google Gemini 2.5 RAG pipeline, managed the MongoDB Atlas cloud connection, and handled live deployment on Vercel and Render.
* **Srivishnu** - Developed the React.js frontend Single Page Application and UI/UX styling using Material-UI.
* **Vasanthavelan** - Designed the database schemas, managed data seeding for 2,500+ records, and handled QA testing.

---
##  Live Demo &  Admin Access

**Live Deployment:** [https://hostel-library-book-management.vercel.app/](https://hostel-library-book-management.vercel.app/)

The system features role-based access control. For security reasons, live admin credentials are not public. If you are running this locally, you can create a test admin using the following dummy format in your database:

**Super Admin / Admin Login Format:**
* **Email:** `admin@ceg.edu` (Example)
* **Password:** `admin123` (Example)


---

##  Local Installation & Setup

To run this project locally on your machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/ElavarasiArumugam/Hostel-Library-Book-Management.git
cd Hostel-Library-Book-Management
2. Backend Setup
Bash
cd backend
npm install
Create a .env file inside the backend folder and add your secret keys:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
Start the backend server:

Bash
node server.js
3. Frontend Setup
Open a new terminal window:

Bash
cd frontend
npm install
Start the React development server:

Bash
npm start
The application will now be running on http://localhost:3000.
