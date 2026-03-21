# Deployment & Data Migration Guide

This guide explains how to deploy your "Shanmuga Jewellers" application to Vercel (Frontend) and Railway (Backend + Database) while preserving your existing local data.

## ⚠️ Important: Data Migration
Deployment does **NOT** automatically copy your local data (products, sales, etc.) to the cloud. You must manually export your local data and import it into the Railway database.

---

## Part 1: Backend & Database Deployment (Railway)

1.  **Create a Railway Project:**
    *   Go to [Railway.app](https://railway.app/) and create a new project.
    *   Select "Deploy from GitHub repo" and choose your repository `IBMS`.

2.  **Add a MySQL Database Service:**
    *   In your Railway project, click "New" -> "Database" -> "MySQL".
    *   Wait for it to initialize.

3.  **Configure Backend Environment Variables:**
    *   Click on your backend service (the GitHub repo one).
    *   Go to the "Settings" or "Variables" tab.
    *   Add the following variables (get values from the MySQL service "Connect" tab):
        *   `DB_HOST`: (e.g., `containers-us-west-xxx.railway.app`)
        *   `DB_PORT`: (e.g., `6543`)
        *   `DB_USER`: `root`
        *   `DB_PASSWORD`: (copy from Railway)
        *   `DB_NAME`: `railway` (default)
        *   `NODE_ENV`: `production`
        *   `PORT`: `5000`

4.  **Migrate Your Local Data:**
    *   **Export Local Data:** Open MySQL Workbench, go to **Server** -> **Data Export**. Select your `jewellery_shop` database, check "Export to Self-Contained File", and click **Start Export**.
    *   **Connect to Railway DB:** In MySQL Workbench, create a new connection using the Host, Port, User, and Password from Railway.
    *   **Import Data:** Connect to the Railway DB, go to **Server** -> **Data Import**, select your exported file, and click **Start Import**.
    *   *Verify:* Run `SELECT * FROM products;` in the Railway connection to ensure your data is there.

---

## Part 2: Frontend Deployment (Vercel)

1.  **Import Project:**
    *   Go to [Vercel.com](https://vercel.com/) -> "Add New..." -> "Project".
    *   Import your `IBMS` repository.

2.  **Configure Project:**
    *   **Framework Preset:** Create React App
    *   **Root Directory:** Click "Edit" and select `frontend`.
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `build`
    *   **Install Command:** `npm install`

3.  **Environment Variables:**
    *   Add `REACT_APP_API_URL`: Set this to your **Railway Backend URL** (e.g., `https://ibms-production.up.railway.app/api`).
    *   *Note:* Do not use `localhost` here!

4.  **Deploy:** Click "Deploy".

---

## ✅ Verification Checklist

- [ ] **Backend:** Visit `https://your-railway-url.app/api/health` (if exists) or root `/` to see if it's running.
- [ ] **Database:** Check MySQL Workbench (Railway connection) to see your products.
- [ ] **Frontend:** Open your Vercel URL.
    - [ ] Login (ensure admin user exists in the migrated DB).
    - [ ] Check Dashboard stats (should match your local).
    - [ ] Try adding a dummy product and see if it persists.

**Troubleshooting:**
- If the frontend says "Network Error", check if `REACT_APP_API_URL` is correct and starts with `https://`.
- If data is missing, re-run the "Import Data" step in MySQL Workbench.
