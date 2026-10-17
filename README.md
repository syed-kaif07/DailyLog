# BuildLog

A personal daily progress tracker for my AI Engineering journey.

---

## Why I Built This

I needed a dead-simple way to stay consistent and accountable without wasting time filling out Jira tickets, Notion databases, or messy notes.

BuildLog exists so I can:
- Open the app, record 3–4 bullet points of what I actually built, studied, or debugged today under a specific technology, and save it in under 60 seconds.
- See my entire week at a glance on a full-screen board.
- Keep my progress data 100% local, offline, and private on my own machine.

---

## What You Can Do With It

- **Daily Progress Board**: Full-screen 7-day view (Monday–Sunday) showing all entries, bullet points, tech tags, and status badges directly on cards without having to click into them.
- **Drag-and-Drop**: Drag cards between days or reorder them within a day. Positions persist across page refreshes and restarts.
- **Fast Logging**: Quick modal (`+ Log Today` or `+` on any day column) with title, tech category, 3–4 progress points, status (`Planned`, `In Progress`, `Completed`), and tags. Save instantly with `Ctrl + Enter`.
- **Search & Filters**: Filter by technology, status, and live text search across titles, bullet points, and tags.
- **Multiple Views**:
  - **Daily Board**: Visual 7-day kanban workflow.
  - **All Entries**: Chronological searchable list/table.
  - **Calendar**: Monthly activity grid with technology color dots.
  - **Insights**: Daily streaks, completion rate, and technology distribution breakdown.
  - **Tech Stack**: Add and edit your own custom technology categories with custom colors.
- **Local Storage & Backups**: Runs on local SQLite (`buildlog.db`) with one-click JSON backup export and import.

---

## Installation & Quick Start

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies & Build
```bash
cd frontend
npm install
npm run build
cd ..
```

### 4. Run the Application
```bash
python run.py
```

Open **http://127.0.0.1:8000** in your browser.

*(Note: `python run.py` will automatically build the frontend if the `frontend/dist` directory is missing).*

---

## Development Mode (Optional)

If you want hot-reloading for local development:

- **Backend (Terminal 1)**:
  ```bash
  cd backend
  uvicorn main:app --reload --port 8000
  ```

- **Frontend (Terminal 2)**:
  ```bash
  cd frontend
  npm run dev
  ```
  Open **http://localhost:5173**.
