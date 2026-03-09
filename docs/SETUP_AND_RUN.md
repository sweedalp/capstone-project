# LearnAI Pro — Setup & Run Guide

> Complete step-by-step guide for every team member to get the project running locally.

---

## Prerequisites

Install these tools before starting:

| Tool | Version | Download |
|---|---|---|
| Python | 3.9+ | https://www.python.org/downloads/ |
| Node.js | 16+ | https://nodejs.org/ |
| Git | any | https://git-scm.com/downloads |

---

## Step 1 — Clone the Repository

```bash
git clone <repository-url>
cd capstone-project
```

---

## Step 2 — Backend Environment Setup

### 2a. Create the `.env` file

Inside the `backend/` folder, create a file named `.env`:

```
backend/.env
```

Paste this template into it:

```env
# Application
APP_ENV=development
DEBUG=True
FRONTEND_URL=http://localhost:5173

# Database (Neon PostgreSQL — see Step 3)
DATABASE_URL=

# JWT Authentication
JWT_SECRET=
SECRET_KEY=
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# Email / SMTP (Gmail App Password — see Step 4)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_FROM_NAME=LearnAI Pro

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

> ⚠️ Never commit this file. It is already listed in `.gitignore`.

---

## Step 3 — Get Your DATABASE_URL (Neon PostgreSQL)

1. Go to **https://neon.tech** and sign up (free)
2. Click **"New Project"** → name it `learnai` → click **Create project**
3. On the dashboard, find the **Connection string** section
4. Copy the string — it looks like:
   ```
   postgresql://learnai_owner:yourpassword@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Paste it as `DATABASE_URL=` in your `.env`

---

## Step 4 — Get Your Gmail App Password (SMTP)

> Required for Login OTP / Forgot Password emails to work.

1. Go to **https://myaccount.google.com/security**
2. Enable **2-Step Verification** (required)
3. Search **"App Passwords"** in the Google Account search bar
4. Type any app name (e.g. `LearnAI`) → click **Create**
5. Copy the **16-character password** shown
6. Fill in your `.env`:
   ```env
   MAIL_USERNAME=youremail@gmail.com
   MAIL_PASSWORD=abcdabcdabcdabcd
   MAIL_FROM=youremail@gmail.com
   ```

> Do NOT use your regular Gmail password — it will not work.

---

## Step 5 — Generate JWT_SECRET

Run this command in any terminal:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and set **both** values in `.env`:

```env
JWT_SECRET=<generated-value>
SECRET_KEY=<same-generated-value>
```

---

## Step 6 — Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

---

## Step 7 — Initialize the Database

Run once after setting up `DATABASE_URL` to create all tables:

```bash
cd backend
python -c "import app.models; from app.core.database import engine, Base; Base.metadata.create_all(bind=engine); print('Tables created.')"
```

---

## Step 8 — Start the Backend Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

- API Base URL: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Step 9 — Install Frontend Dependencies

Open a **new terminal**:

```bash
cd frontend
npm install
```

---

## Step 10 — Start the Frontend Server

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE ready in ~2000ms
➜  Local: http://localhost:3000/
```

- Frontend URL: http://localhost:3000

---

## Quick Reference — All URLs

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger API Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## Quick Reference — Run Commands (Daily Use)

After first-time setup, simply run these two commands in separate terminals:

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Troubleshooting

### `ModuleNotFoundError` on backend start
```bash
pip install -r requirements.txt
```

### `DATABASE_URL` connection error
- Check your Neon project is active (it sleeps after inactivity — just click it to wake)
- Make sure `?sslmode=require` is at the end of the URL

### Port already in use (8000 or 3000)
Find and stop the process using that port:
```bash
# Windows — find process on port 8000
netstat -ano | findstr :8000
# Then kill it (replace PID with the number found)
taskkill /PID <PID> /F
```

### Forgot password email not sending
- Make sure 2-Step Verification is enabled on your Google account
- Re-generate the App Password (old ones expire if 2FA is toggled)
- Check `MAIL_USERNAME` and `MAIL_FROM` are the same Gmail address

### `settings` validation error on startup
- Make sure `backend/.env` exists and all required fields are filled
- Do not put quotes around values in `.env`

---

## Security Rules

1. **Never** commit `.env` to GitHub
2. **Never** share `JWT_SECRET` or `MAIL_PASSWORD` in group chats
3. Each developer generates their own credentials
4. For deployment, set environment variables in your hosting dashboard (not in `.env`)
