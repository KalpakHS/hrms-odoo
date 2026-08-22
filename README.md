# Dayflow HRMS - Backend & Database

Web-based Human Resource Management System (HRMS) backend built with Python, Django, and MySQL.

---

## Architecture & Modular Structure

The project is architected to allow multiple developers (4 modules) to work independently without merge conflicts:

```
dayflow-hrms/
├── apps/                   # Placed on sys.path - contains all decoupled Django apps
│   ├── authentication/     # Developer 1: Auth & RBAC (Future)
│   ├── employees/          # Developer 2: Employee Profile Management (Future)
│   ├── attendance/         # Developer 3: Attendance Tracking (Future)
│   ├── leave/              # Developer 4: Leave & Time Off (Future)
│   ├── payroll/            # Payroll & Compensation (Future)
│   └── __init__.py
├── dayflow/                # Project root configuration package
│   ├── __init__.py         # PyMySQL / MySQLdb compatibility
│   ├── asgi.py
│   ├── settings.py         # Reads configuration from .env via python-dotenv
│   ├── urls.py             # Root URL routing
│   └── wsgi.py
├── media/                  # User uploaded media files (gitignored)
├── static/                 # Static assets (CSS/JS/images)
├── templates/              # Base HTML templates
├── .env                    # Local environment variables (gitignored, do not commit)
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
├── manage.py               # Django CLI management script
├── requirements.txt        # Python dependency manifest
└── README.md
```

---

## Getting Started

### 1. Environment Setup
```powershell
# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt
```

### 2. Database Configuration
Copy `.env.example` to `.env` and configure your local MySQL credentials:
```ini
DB_NAME=dayflow_hrms
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

Ensure the MySQL database `dayflow_hrms` exists:
```sql
CREATE DATABASE IF NOT EXISTS dayflow_hrms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Run Migrations
```powershell
python manage.py migrate
```

### 4. Start Development Server
```powershell
python manage.py runserver
```
Visit [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.
