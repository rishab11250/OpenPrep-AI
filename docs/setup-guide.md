# 🛠️ Setup Guide

This guide walks you through setting up a local development environment for **OpenPrep AI**.

---

## 📋 Prerequisites

Ensure you have the following installed on your local development machine:
* [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
* [npm](https://www.npmjs.com/) (v9.x or higher)
* [PostgreSQL](https://www.postgresql.org/) (Local installation or remote instance)
* [Docker & Docker Compose](https://www.docker.com/) (Optional, for running with containers)

---

## 🔑 Environment Variables

You need to set up environment variables for both the backend and frontend.

### 🔌 Backend Environment Variables (`backend/.env`)
Create a file named `.env` in the `backend/` directory:

```env
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/openprep
JWT_SECRET=your_super_secret_jwt_key_change_me
GEMINI_API_KEY=your_gemini_api_key_here
```
> [!NOTE]
> If `GEMINI_API_KEY` is omitted or left as default, the backend will automatically fallback to returning detailed pre-configured mock data for planning, analysis, and quizzes so you can develop offline.

### 🎨 Frontend Environment Variables (`frontend/.env`)
Create a file named `.env` in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚙️ Manual Local Installation

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Ensure your local PostgreSQL service is running and the database specified in `DATABASE_URL` exists.
4. (Optional) Seed the database with sample development data (subjects, topics, flashcards, quizzes, study plans, etc.):
   ```bash
   # From the repository root (or backend folder):
   npm run seed
   
   # Or to drop existing tables and recreate them cleanly:
   # (From backend folder)
   npm run seed -- --clean
   ```
5. Start the Node.js development server:
   ```bash
   npm run dev
   ```
The backend server runs at `http://localhost:5000`.

### 2. Setup Frontend
1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite client dev server:
   ```bash
   npm run dev
   ```
The frontend application will boot at `http://localhost:5173`. Open this URL in your web browser.

---

## 🐳 Running with Docker

If you prefer to run the entire stack containerized, you can use the configured `docker-compose.yml` file.

### Steps
1. Navigate to the project root directory containing `docker-compose.yml`.
2. Ensure you have created the backend environment configuration in `backend/.env`.
3. Spin up the container services:
   ```bash
   docker-compose up --build
   ```
This command downloads the necessary images, boots an isolated PostgreSQL database container, and builds the frontend and backend service instances.

### Port Mappings
* **React Frontend**: accessible at `http://localhost:3000` (in container mode) or `http://localhost:5173` (local dev)
* **Node.js Express Backend**: accessible at `http://localhost:5000`
* **PostgreSQL Database Instance**: internally mapped and exposed at port `5432`

To shut down all running containers, run:
```bash
docker-compose down
```
