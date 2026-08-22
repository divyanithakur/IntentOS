# IntentOS

IntentOS turns natural-language work requests into structured intent, extracted entities, reviewed action plans, and auditable approval/execution records.

The local intent engine distinguishes personal study planning from meetings. For example, `Organize my study schedule` becomes `study_planning`, while `Schedule a meeting with Rahul` remains `schedule_meeting`.

## Architecture

```text
User
  -> Token authentication
  -> Natural-language request
  -> Intent Engine
  -> Structured Intent
  -> Action Planner
  -> User review
  -> Approval record
  -> Execution Engine
  -> Configured external executor
  -> Execution result and audit history
```

Approval and execution are separate. Approval never sends an email or performs an external action. The first executor is email, and it requires an approved intent plus explicit recipient, subject, message, sender, and SMTP configuration. Missing data fails safely without sending.

## Stack

- Frontend: Next.js 16, React, TypeScript, Tailwind CSS
- Backend: Django 6.1, Django REST Framework
- Database: SQLite locally; PostgreSQL through `DATABASE_URL` in production
- AI: OpenAI through a backend-only key, with `DEMO_MODE=true` for local tests

## Local setup

Backend:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Set `frontend/.env.local` when the API is not local:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Use `backend/.env.example` as the backend configuration template. Never commit `.env` files or secrets.

The deployed Vercel project must define `NEXT_PUBLIC_API_URL` as the HTTPS URL of the deployed Django service. The frontend deliberately refuses to fall back to localhost in production.

## API

Authentication:

```text
POST /api/intents/auth/register/
POST /api/intents/auth/login/
POST /api/intents/auth/logout/
GET  /api/intents/auth/me/
```

Intents require `Authorization: Token <token>`:

```text
POST /api/intents/create/
GET  /api/intents/
GET  /api/intents/<id>/
```

Approval and execution require ownership and valid lifecycle state:

```text
POST /api/intents/<id>/approve/   # planned -> approved
POST /api/intents/<id>/reject/    # planned -> cancelled
POST /api/intents/<id>/execute/   # approved -> executing -> completed/failed
GET  /api/health/
```

Users can only see and change their own intents. Approval and execution decisions record the authenticated user, timestamps, status, result, and safe failure details.

## Testing

```powershell
cd backend
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py test

cd ..\frontend
npm run lint
npm run build
```

Tests use the local intent engine and patched email delivery; they do not spend OpenAI credits or send real email.

## Deployment

The frontend is prepared for Vercel. The Django backend is prepared for Render with PostgreSQL, Gunicorn, WhiteNoise, migrations, static collection, and a health check through [render.yaml](render.yaml). Follow [docs/DJANGO_DEPLOYMENT.md](docs/DJANGO_DEPLOYMENT.md) for manual deployment and Vercel connection steps.

The backend is not considered publicly live until the Render service is manually created, its HTTPS health endpoint responds, and Vercel has `NEXT_PUBLIC_API_URL` set to that backend URL.

## Roadmap

- Deploy Django and PostgreSQL
- Configure production SMTP or a transactional email provider
- Add provider-specific execution audit details
- Add durable background jobs and retries
- Add calendar and other external executors
