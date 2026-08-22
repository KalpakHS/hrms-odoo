# Dayflow HRMS

Human Resource Management System (HRMS) built with Django (Backend & MySQL Database) and React + TypeScript + Vite (Frontend).

---

## Project Structure

```
dayflow-hrms/
├── apps/                   # Django modular backend applications
│   ├── accounts/           # User authentication, roles (Admin, HR, Employee) & security
│   ├── employees/          # Employee profile & organization management
│   ├── attendance/         # Attendance tracking & work hours
│   ├── leave/              # Leave requests & quota management
│   └── payroll/            # Salary structure & payslips
├── dayflow/                # Django project settings & configuration
├── src/                    # React + TypeScript + Vite frontend
├── public/                 # Static frontend assets
├── static/                 # Django static assets
├── media/                  # Uploaded documents and avatars
├── .env                    # Local backend environment variables (Git-ignored)
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore configuration
├── manage.py               # Django management script
├── package.json            # Node.js frontend dependencies
├── requirements.txt        # Python backend dependencies
└── vite.config.ts          # Vite build configuration
```

---

## Getting Started

### 1. Backend Setup (Django + MySQL)

```powershell
# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r requirements.txt

# Configure .env from template
cp .env.example .env
# (Configure your DB_PASSWORD in .env)

# Run database migrations
python manage.py migrate

# Start Django development server
python manage.py runserver
```

Backend API / Server runs on: `http://127.0.0.1:8000`

---

### 2. Frontend Setup (React + Vite)

```powershell
# Install frontend dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend runs on: `http://localhost:5173`
