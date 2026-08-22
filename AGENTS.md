# IntentOS — Codex Development Guide

## 1. Project Overview

IntentOS is an AI-powered intent understanding and action-planning application.

The core idea is:

> User gives a natural-language request → IntentOS understands the intent → extracts useful information/entities → creates a structured plan/actions → the frontend presents the result clearly.

This is an existing project. **Do not treat it as a blank project.** First inspect the current codebase and preserve working functionality.

---

## 2. Current Project Structure

The repository currently has:

```text
IntentOS/
├── backend/
│   ├── config/
│   ├── intents/
│   │   ├── migrations/
│   │   ├── services/
│   │   │   ├── intent_engine.py
│   │   │   └── planner.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── tests.py
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── ...
│
└── docs/
```

### Backend

- Framework: Django 6.1
- Python virtual environment: `backend/venv`
- CORS has been configured using `django-cors-headers`.
- Django system checks pass.
- Development server runs on:
  `http://127.0.0.1:8000/`
- Important backend logic:
  - `backend/intents/services/intent_engine.py`
  - `backend/intents/services/planner.py`
  - `backend/intents/views.py`
  - `backend/intents/models.py`
  - `backend/intents/serializers.py`

### Frontend

- Framework: Next.js 16.3.1
- React
- TypeScript
- App Router
- Tailwind CSS
- Frontend directory: `frontend/`
- Local development:
  `npm run dev`
- Local frontend normally runs at:
  `http://localhost:3000/`

The frontend has already been created and successfully built.

---

## 3. Git / Deployment Status

The project has already been pushed to GitHub.

Repository:

`https://github.com/divyanithakur/IntentOS`

The actual project code was pushed to the `master` branch.

The important commit containing the frontend is:

`33ab1f4 Add Next.js frontend`

The previous backend planning work is in:

`7f47794 Add structured intent action planning`

### Important

Do not randomly create a new repository, delete Git history, or reinitialize Git.

Before making major changes:

```bash
git status
git branch
git log --oneline -5
```

Work with the existing repository.

---

## 4. Vercel Status

The frontend is connected to Vercel.

The Next.js production build has successfully completed with:

```text
Build Completed
Deployment completed
```

The frontend build generated:

```text
/
_not-found
```

The Vercel project uses:

```text
Root Directory: frontend
Framework: Next.js
```

There has been a deployment/domain issue caused by the repository's branch situation (`main` vs `master`). Do not assume a Vercel 404 means the Next.js application is broken.

If deployment problems occur:

1. Check the connected Git branch.
2. Check the Vercel Production Branch.
3. Check Root Directory = `frontend`.
4. Check that `frontend/package.json` exists.
5. Check the deployment logs.
6. Only then change application code.

---

# 5. What Is Already Done

## Backend

The backend has already been extended to support structured intent processing and action planning.

Existing work includes:

- Intent processing.
- Structured intent/action planning.
- Intent entities.
- Intent summary.
- Django API views.
- Database models and migrations.
- CORS configuration.
- Planner service.

Do not rewrite these systems unless there is a real reason.

Before changing backend logic, read the existing implementation.

---

## Frontend

The Next.js application has been initialized and connected to the repository.

The frontend currently has the basic Next.js/Tailwind structure.

It is **not considered finished**.

The next major task is to transform the basic frontend into a polished IntentOS product interface.

---

# 6. Product Vision

IntentOS should feel like a serious modern AI product, not a generic Next.js demo.

The UI should communicate:

> "Tell IntentOS what you want. It understands your intent and turns it into structured actions."

The design should be:

- Modern
- Clean
- Premium
- Minimal
- Professional
- AI-product style
- Responsive
- Easy to understand
- Visually impressive without being unnecessarily complicated

Avoid making it look like a template or a basic CRUD dashboard.

---

# 7. Main User Experience

The primary user flow should eventually be:

```text
Open IntentOS
      ↓
See clear explanation of what IntentOS does
      ↓
Enter a natural-language request
      ↓
Submit request
      ↓
Frontend sends request to Django backend
      ↓
Backend analyzes intent
      ↓
Backend extracts entities / summary / actions
      ↓
Frontend receives structured response
      ↓
Display the result in a beautiful, understandable UI
```

The user should not need to understand the backend or AI terminology to use the application.

---

# 8. Frontend Pages / Sections To Build

Build progressively. Do not attempt to create everything in one huge change.

## A. Landing / Home

Create a polished landing page with:

### Header

- IntentOS logo/name
- Simple navigation
- Clear primary CTA
- Responsive mobile navigation

### Hero

Strong headline explaining the product.

Example direction:

> Turn your intent into action.

Supporting text should explain that IntentOS understands natural-language requests and converts them into structured plans/actions.

Include the main input/action area.

### Intent Input

A prominent text box where users can type requests such as:

```text
Plan a trip to Pune this weekend
```

or

```text
Find the best way to organize my study schedule
```

or another natural-language instruction.

Include:

- Text input / textarea
- Submit button
- Loading state
- Error state
- Clear visual feedback

---

# 9. Intent Result UI

After the backend responds, show the result clearly.

Possible sections:

### Detected Intent

Example:

```text
Intent
Travel Planning
```

### Summary

A human-readable explanation of what the system understood.

### Entities

Display extracted information in cards/chips.

Example:

```text
Location: Pune
Time: This weekend
Category: Travel
```

### Planned Actions

Display actions as an ordered list/timeline.

Example:

```text
1. Understand destination
2. Determine dates
3. Identify requirements
4. Prepare travel plan
```

The exact data fields must come from the existing backend response. Do not invent API response fields without checking the backend.

---

# 10. Backend Integration

The frontend must eventually communicate with the existing Django API.

Before writing the API client:

1. Inspect:
   - `backend/intents/urls.py`
   - `backend/intents/views.py`
   - `backend/intents/serializers.py`
   - `backend/intents/models.py`
   - `backend/intents/services/intent_engine.py`
   - `backend/intents/services/planner.py`

2. Determine:
   - API endpoint
   - HTTP method
   - request body
   - response JSON
   - error format

3. Then create a clean frontend API layer.

Do NOT guess the endpoint.

Prefer a structure such as:

```text
frontend/
├── app/
├── components/
├── lib/
│   └── api.ts
├── types/
└── ...
```

Keep API calls separate from UI components.

---

# 11. Environment Variables

Never hardcode production backend URLs throughout the code.

Use an environment variable such as:

```text
NEXT_PUBLIC_API_URL
```

Example:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

for local development.

Production should use the deployed backend URL once available.

Never commit:

- API keys
- passwords
- tokens
- secrets
- `.env.local`

---

# 12. Component Architecture

As the UI grows, avoid putting everything into `app/page.tsx`.

Create reusable components.

Suggested structure:

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── IntentInput.tsx
│   ├── IntentResult.tsx
│   ├── EntityList.tsx
│   ├── ActionPlan.tsx
│   └── ...
│
├── lib/
│   └── api.ts
│
└── types/
    └── intent.ts
```

Only create components when they make the code easier to maintain.

---

# 13. Design Rules

## Do

- Use consistent spacing.
- Use strong typography hierarchy.
- Make the main action obvious.
- Use subtle animations where useful.
- Make cards and sections visually distinct.
- Handle loading and error states.
- Make the design mobile responsive.
- Maintain accessibility.
- Use semantic HTML.
- Keep contrast readable.
- Make buttons clearly interactive.

## Don't

- Don't create a generic dashboard just because it is easy.
- Don't use excessive gradients.
- Don't fill every area with cards.
- Don't add random animations.
- Don't add unnecessary dependencies.
- Don't use placeholder lorem ipsum in the final UI.
- Don't create fake backend results.
- Don't hide errors.
- Don't hardcode secrets.
- Don't replace working backend logic without understanding it.

---

# 14. Technical Rules

Use:

- TypeScript
- React
- Next.js App Router
- Tailwind CSS
- Existing project dependencies where possible

Before adding a dependency, ask:

> Is this actually necessary?

Prefer native React / CSS / Tailwind solutions when they are sufficient.

Do not migrate frameworks.

Do not switch Next.js versions unless there is a specific compatibility reason.

Do not switch Django versions.

---

# 15. Development Workflow

For every significant task:

### Step 1 — Inspect

Read the relevant existing files first.

### Step 2 — Plan

Briefly determine which files need to change.

### Step 3 — Implement

Make the smallest clean change that achieves the goal.

### Step 4 — Test

For frontend:

```bash
npm run lint
npm run build
```

For backend:

```bash
python manage.py check
```

If relevant, run backend tests.

### Step 5 — Review

Check:

- TypeScript errors
- lint errors
- broken imports
- API mismatches
- responsive behavior
- accidental secrets
- unnecessary files

### Step 6 — Git

Show:

```bash
git status
git diff
```

before committing.

Use clear commit messages.

Example:

```text
Build IntentOS landing page
```

or:

```text
Connect frontend to intent API
```

---

# 16. Important Safety Rule For Existing Code

This project is being actively developed.

**Never delete or replace an existing implementation just to make a task easier.**

If an existing function already handles something:

1. Understand it.
2. Reuse it.
3. Extend it if necessary.
4. Preserve backward compatibility.

If you believe an architectural change is necessary, explain why before making a large destructive change.

---

# 17. Current Priority Order

Build in this order:

## Priority 1 — Product UI

Turn the current basic Next.js page into a polished IntentOS landing/application interface.

## Priority 2 — Intent Input

Build the primary natural-language input experience.

## Priority 3 — Backend Connection

Connect the input to the existing Django API after inspecting the actual API contract.

## Priority 4 — Result Visualization

Beautifully display:

- intent
- summary
- entities
- planned actions

based on the real backend response.

## Priority 5 — States

Implement:

- idle
- typing
- loading
- success
- API error
- empty input
- retry

## Priority 6 — Responsive Design

Test desktop, tablet, and mobile layouts.

## Priority 7 — Production Readiness

Check:

- environment variables
- build
- lint
- API URL
- CORS
- deployment configuration
- error handling

---

# 18. Definition of Done

A feature is NOT done merely because the page looks good.

It is done when:

- The UI works.
- The UI is responsive.
- Existing functionality still works.
- Real backend data is used where applicable.
- Loading/error states work.
- TypeScript passes.
- Lint passes.
- Production build passes.
- No secrets are committed.
- Code is reasonably organized.
- The implementation is understandable to another developer.

---

# 19. How Codex Should Work With This Project

When receiving a new instruction, first classify it:

```text
UI
Backend
API integration
Database
Deployment
Bug fix
Refactoring
```

Then inspect only the relevant existing files.

Do not assume the current implementation from memory.

Always use the repository itself as the source of truth.

If something is unclear, inspect the code before guessing.

If a request conflicts with this guide, prioritize:

1. Existing working functionality
2. Security
3. Correctness
4. User experience
5. Maintainability
6. Visual polish

---

# 20. Immediate Task

The immediate goal is:

> Build IntentOS into a polished, production-quality AI intent interface on top of the existing Django backend and Next.js frontend.

Start by inspecting the existing frontend and backend.

Then improve the frontend incrementally.

Do not rebuild the repository from scratch.
Do not create a fake API.
Do not replace the existing backend.
Do not introduce unnecessary dependencies.

Build the product, not a demo.
