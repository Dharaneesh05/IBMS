# 🚀 DEPLOYMENT GUIDE
## Jewellery Inventory System - Free Deployment

This guide will help you deploy your full-stack application **completely FREE**.

---

## 📋 What You Need
1. ✅ GitHub account (create at https://github.com)
2. ✅ Railway account (sign up at https://railway.app)
3. ✅ Vercel account (sign up at https://vercel.com)

---

## 🎯 OPTION 1: RAILWAY (Recommended - Easiest)
**Deploys Backend + MySQL Database + Frontend All in One Place**

### Step 1: Push Code to GitHub

1. **Install Git** (if not installed):
   - Download from: https://git-scm.com/downloads
   - Install and restart your terminal

2. **Initialize Git in your project**:
   ```bash
   cd "D:\Dharaneesh\Project\Consultancy\Inventory Billing System"
   git init
   git add .
   git commit -m "Initial commit - Jewellery Inventory System"
   ```

3. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Repository name: `jewellery-inventory-system`
   - Make it **Public** or **Private**
   - Click **"Create repository"**

4. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/jewellery-inventory-system.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your actual GitHub username)

---

### Step 2: Deploy Backend + Database on Railway

1. **Sign Up on Railway**:
   - Go to https://railway.app
   - Click **"Login with GitHub"**
   - Authorize Railway

2. **Create New Project**:
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository: `jewellery-inventory-system`
   - Railway will detect your project

3. **Configure Backend Service**:
   - Click **"Add variables"**
   - Add these environment variables:
     ```
     NODE_ENV=production
     PORT=5000
     ```
   - Click **"Deploy"**

4. **Add MySQL Database**:
   - In your Railway project, click **"+ New"**
   - Select **"Database"** → **"MySQL"**
   - Railway will automatically create a MySQL database
   - Click on the MySQL service
   - Go to **"Connect"** tab
   - Copy the connection details

5. **Link Database to Backend**:
   - Click on your backend service
   - Click **"Variables"** tab
   - Click **"+ New Variable"** and add these from MySQL connection:
     ```
     DB_HOST=<MySQL host from Railway>
     DB_PORT=<MySQL port from Railway>
     DB_USER=<MySQL user from Railway>
     DB_PASSWORD=<MySQL password from Railway>
     DB_NAME=<MySQL database name from Railway>
     ```
   - Or simply click **"Add Reference"** → Select your MySQL database
   - Railway will auto-populate the variables

6. **Configure Root Directory** (Important!):
   - In backend service, click **"Settings"**
   - Under **"Build"**, set **Root Directory**: `backend`
   - Under **"Deploy"**, set **Start Command**: `node server.js`
   - Click **"Save"**

7. **Get Your Backend URL**:
   - Click on your backend service
   - Go to **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Copy your backend URL (e.g., `https://your-app.railway.app`)

8. **Initialize Database** (One-time setup):
   - In Railway, click your backend service
   - Click the three dots (•••) → **"Deploy logs"**
   - Wait for deployment to complete
   - The database will auto-sync on first run!

---

### Step 3: Deploy Frontend on Vercel

1. **Sign Up on Vercel**:
   - Go to https://vercel.com
   - Click **"Sign Up"** → **"Continue with GitHub"**
   - Authorize Vercel

2. **Import Project**:
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Vercel will detect it's a monorepo

3. **Configure Frontend**:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Click **"Edit"** → Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Add Environment Variable**:
   - Click **"Environment Variables"**
   - Add:
     ```
     Name: REACT_APP_API_URL
     Value: https://your-backend-url.railway.app/api
     ```
   (Replace with your actual Railway backend URL)

5. **Deploy**:
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Your app will be live! 🎉

6. **Update CORS (Important!)**:
   - Copy your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - Go to Railway → Backend service → Variables
   - Add:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Backend will automatically redeploy

---

## 📊 Seed Sample Data (Optional)

After deployment, you can add sample data:

1. **Using Railway CLI** (recommended):
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Link to your project
   railway link
   
   # Run seed command
   railway run node seed-database.js
   ```

2. **Or manually**: Use MySQL Workbench to connect to Railway MySQL and import data.

---

## 🎯 OPTION 2: RENDER (Alternative - PostgreSQL Instead of MySQL)

If you prefer Render (uses PostgreSQL instead of MySQL):

### Backend + Database on Render

1. **Sign up**: https://render.com
2. **New Web Service** → Connect GitHub repo
3. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. **Add PostgreSQL**:
   - New → PostgreSQL
   - Copy connection string
5. **Environment Variables**:
   - Add DATABASE_URL with PostgreSQL connection string
   - **Note**: You'll need to update your code to use PostgreSQL instead of MySQL

### Frontend on Render

1. **New Static Site** → Connect GitHub
2. **Configure**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `build`
3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```

---

## 🔧 Post-Deployment Checklist

✅ Backend is accessible at Railway URL
✅ Database is connected and tables created
✅ Frontend is accessible at Vercel URL
✅ Frontend can communicate with backend API
✅ CORS is configured properly
✅ Sample data loaded (optional)

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check REACT_APP_API_URL in Vercel environment variables
- Ensure Railway backend URL is correct
- Redeploy frontend after changing env variables

### Database connection errors
- Verify Railway MySQL variables are correctly set
- Check Railway deployment logs for errors
- Ensure DB_HOST uses Railway's internal hostname

### Build failures
- Check deployment logs in Railway/Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility

---

## 💰 Free Tier Limits

**Railway**:
- $5 free credit per month
- Enough for 500+ hours of runtime
- Includes database hosting

**Vercel**:
- Unlimited deployments
- 100GB bandwidth/month
- Perfect for frontend

---

## 📱 Your Live URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-app.railway.app`
- **MySQL Database**: Hosted on Railway

---

## 🎉 Congratulations!

Your Jewellery Inventory System is now live and accessible from anywhere! Share the Vercel URL with anyone to access your app.

---

## 📝 Quick Commands Reference

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend updates
cd backend
git add .
git commit -m "Update backend"
git push

# Deploy frontend updates
cd frontend
git add .
git commit -m "Update frontend"
git push
```

Railway and Vercel will auto-deploy on every git push! 🚀
