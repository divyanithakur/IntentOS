# Deploy the IntentOS API

This guide deploys the existing Django API to Render and keeps the Next.js frontend on Vercel. The backend is prepared for deployment, but it has not been deployed by this repository change.

## Recommended architecture

- Frontend: Vercel, rooted at `frontend/`
- API: Render Web Service, rooted at `backend/`
- Database: Render PostgreSQL connected through `DATABASE_URL`

The repository includes `render.yaml` for the web service and database setup.

## Deploy on Render

1. Sign in to Render and choose **New > Blueprint**.
2. Connect the `divyanithakur/IntentOS` GitHub repository and select the `master` branch.
3. Review the services from `render.yaml` and apply the blueprint.
4. In the API service environment settings, set `FRONTEND_URL` to the deployed Vercel URL, for example:
   `https://intentos-d1s1lpukh-divyanithakurs-projects.vercel.app`
5. Keep `DEMO_MODE=true` for the first deployment. This uses the existing local intent engine and does not spend OpenAI credits.
6. Copy the generated Render API URL and check:
   `https://YOUR-API.onrender.com/api/health/`

The health response must be:

```json
{"status": "ok"}
```

## Environment variables

Required or recommended on Render:

```text
DJANGO_SECRET_KEY=<generate a secret value>
DEBUG=false
ALLOWED_HOSTS=.onrender.com
FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
DATABASE_URL=<Render PostgreSQL connection string>
DEMO_MODE=true
OPENAI_API_KEY=<leave empty while using demo mode>
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
```

`OPENAI_API_KEY` is read only by Django. Never add it to a `NEXT_PUBLIC_` variable or frontend environment setting.

For a production SMTP backend, also provide the SMTP host, port, username, password, and TLS settings required by your email provider. Email is not used by the current intent pipeline, so the first Render deployment can leave email unconfigured.

## Build and start commands

The Render blueprint runs:

```bash
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
```

The production server starts with:

```bash
gunicorn config.wsgi:application
```

The database stores intent requests, summaries, entities, action plans, statuses, and timestamps through the existing migrations.

## Connect Vercel

In the Vercel project settings, open **Environment Variables** and add:

```text
NEXT_PUBLIC_API_URL=https://YOUR-API.onrender.com
```

Apply it to Preview and Production, then redeploy the frontend. Django must have the exact Vercel origin in `FRONTEND_URL`; do not use `CORS_ALLOW_ALL_ORIGINS`.

The frontend will then call:

```text
POST https://YOUR-API.onrender.com/api/intents/create/
GET  https://YOUR-API.onrender.com/api/intents/
GET  https://YOUR-API.onrender.com/api/intents/<id>/
```

## Verify after deployment

From the backend service shell or a local terminal configured with the production `DATABASE_URL`, run:

```bash
python manage.py check --deploy
python manage.py migrate
python manage.py collectstatic --no-input
```

`check --deploy` may report HSTS preload warnings until you intentionally configure `SECURE_HSTS_INCLUDE_SUBDOMAINS` and `SECURE_HSTS_PRELOAD` for a domain you control. Do not enable preload on a shared provider hostname.

Then test the API:

```bash
curl https://YOUR-API.onrender.com/api/health/
curl -X POST https://YOUR-API.onrender.com/api/intents/create/ ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"Onboard Rahul as a Backend Engineer starting Monday\"}"
```

The second response should contain the real `intent_type`, extracted entities, summary, action list, plan, and database status. Actions are planned only; this system does not execute external actions yet.

## PostgreSQL notes

Render’s PostgreSQL connection string is supplied to `DATABASE_URL`. Django uses `dj-database-url` to parse it and falls back to the existing SQLite database when `DATABASE_URL` is absent locally. Do not commit the connection string or any `.env` file.

## Current status

The backend is deployment-ready in the repository but is not deployed until the Render blueprint is applied manually and the generated URL is configured in Vercel and Django.
