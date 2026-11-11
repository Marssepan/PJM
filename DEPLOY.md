# Publish PJM online — free (GitHub Pages + Render + Neon)

```
 Browser ──► GitHub Pages  (React app + .mp4 videos)       free, always on
    │
    └──────► Render        (Express API)                   free, sleeps after 15 min idle (~1 min to wake)
                │
                └──────► Neon (PostgreSQL 16, Frankfurt)    free, no expiry
```

Do the parts **in order** — each one gives you a value the next one needs.
Total time: ~30–40 minutes.

---

## Part 1 — Prepare (your Mac)

1. Unzip the project, e.g. to `~/Desktop/PJM`.
2. Copy your `.mp4` videos into `backend/public/videos/`.
3. Run it locally once (see `README.md` → "Run locally"). Check the site works at
   `http://localhost:5173`. Then stop both servers (Ctrl+C).

   Running `npm install` creates `package-lock.json` in `backend/` and `frontend/` —
   keep them, they get committed.

---

## Part 2 — GitHub

**Create the repo**
1. github.com → **+** → **New repository**
2. Name: `pjm` · **Public** · do NOT add README / .gitignore / license → **Create repository**

**Push the code** (Terminal, inside the project folder)

```bash
git init
git add .
git status
```

Check the list before committing:
- must **NOT** contain: `node_modules`, `.env` (only `.env.example`), `postgres_data`
- must contain: `backend/prisma/migrations/…`, `.github/workflows/deploy-frontend.yml`, your `.mp4` files

```bash
git commit -m "PJM Dictionary"
git branch -M main
git remote add origin https://github.com/<your-user>/pjm.git
git push -u origin main
```

GitHub asks for a password → it wants a Personal Access Token, not your account password.
Easier: VS Code → Source Control panel → **Publish Branch** (logs in through the browser).

The first "Deploy frontend" run in the **Actions** tab will fail — expected, `API_URL` is not set yet.

---

## Part 3 — Database (Neon)

1. **neon.com** → Sign up with GitHub (no credit card).
2. **Create project** → name `pjm` · Postgres **16** · region **AWS Europe Central 1 (Frankfurt)**.
3. **Connect** → copy two connection strings into a note:
   - **Pooled connection ON** — host contains `-pooler` → call it **POOLED**
   - **Pooled connection OFF** — no `-pooler` → call it **DIRECT**
4. Create tables + data. Terminal, in `backend/`, in a **new terminal tab**:

   ```bash
   export DATABASE_URL="<POOLED>"
   export DIRECT_URL="<DIRECT>"
   npx prisma migrate deploy
   npx prisma db seed
   ```

   Seed must end with: `… 32 liter (10 z ruchem, 22 statycznych).`

5. **Close that terminal tab** — so later commands don't hit Neon by accident.

---

## Part 4 — Backend (Render)

1. **render.com** → Sign up with GitHub.
2. **New +** → **Blueprint** → connect GitHub → choose the `pjm` repo.
3. Render reads `render.yaml` and shows service `pjm-api`. Fill in:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | **POOLED** |
   | `DIRECT_URL` | **DIRECT** |
   | `CORS_ORIGIN` | `https://<your-github-user>.github.io` — no `/pjm`, no trailing `/` |

4. **Apply** → wait 3–5 min until the status is **Live**.
5. Copy the service address (e.g. `https://pjm-api-ab12.onrender.com`) and test:
   - `…/api/health` → `{"status":"ok"}`
   - `…/api/alphabet` → letters with `"requiresMovement"`

---

## Part 5 — Frontend (GitHub Pages)

1. GitHub repo → **Settings** → **Pages** → Source: **GitHub Actions**.
2. **Settings** → **Secrets and variables** → **Actions** → tab **Variables** →
   **New repository variable**: name `API_URL`, value = Render address (no trailing `/`).
3. **Actions** → **Deploy frontend to GitHub Pages** → **Run workflow**.
4. ~2 min later: `https://<your-github-user>.github.io/pjm/`

---

## Part 6 — Check

- [ ] Categories load (first visit after a pause: "Serwer się uruchamia…" up to 1 min)
- [ ] Alphabet shows dots on Ą Ć Ę J Ł Ń Ó Ś Ź Ż
- [ ] Search `zolw` / `dziekuje` finds words with Polish letters
- [ ] A video plays
- [ ] Browser console (Cmd+Option+J) has no red CORS errors

## Updating later

```bash
git add . && git commit -m "…" && git push
```

Render redeploys the backend (and applies new migrations); GitHub Pages rebuilds the frontend.
Changed the seed data? Re-run Part 3 step 4 (it replaces all data in Neon).

## Troubleshooting

| Symptom | Fix |
|---|---|
| CORS error in console | `CORS_ORIGIN` on Render must be exactly `https://<user>.github.io` |
| White page / 404 for `assets/*.js` | Pages source not set to "GitHub Actions" — re-run workflow |
| "Brak połączenia" for over 1 min | Render → Logs. Usually a wrong `DATABASE_URL` |
| Render build fails at `prisma migrate deploy` | `DIRECT_URL` missing, or it contains `-pooler` |
| Video 404 | file name in the database ≠ file name in `backend/public/videos` |
| Everyone gets 429 | `TRUST_PROXY` must be `1` on Render (already in `render.yaml`) |

## Free-tier limits

| Service | Limit |
|---|---|
| Render | sleeps after 15 min without traffic, ~1 min to wake; 750 h/month |
| Neon | 100 compute-hours/month, small storage — the dictionary uses a few KB |
| GitHub Pages | site ≤ 1 GB, ~100 GB traffic/month — keep videos short (720p, ~1 MB) |

**Thesis defence:** open the site 2 minutes before presenting so everything is awake.
