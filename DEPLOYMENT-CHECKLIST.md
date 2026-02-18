# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Ready
- [ ] All files committed to Git
- [ ] .gitignore configured
- [ ] Environment variables set
- [ ] Dependencies installed

### 2. GitHub Setup
- [ ] GitHub account created
- [ ] Repository created
- [ ] Code pushed to GitHub

### 3. Railway Deployment (Backend + Database)
- [ ] Railway account created (https://railway.app)
- [ ] Connected GitHub account
- [ ] Deployed backend service
- [ ] MySQL database added
- [ ] Environment variables configured:
  - [ ] DB_HOST
  - [ ] DB_PORT
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] DB_NAME
  - [ ] NODE_ENV=production
- [ ] Backend domain generated
- [ ] Tested backend URL (https://your-app.railway.app/api)

### 4. Vercel Deployment (Frontend)
- [ ] Vercel account created (https://vercel.com)
- [ ] Connected GitHub account
- [ ] Imported repository
- [ ] Root directory set to `frontend`
- [ ] Environment variable added:
  - [ ] REACT_APP_API_URL=https://your-backend.railway.app/api
- [ ] Deployed successfully
- [ ] Tested frontend URL

### 5. Final Configuration
- [ ] CORS updated with frontend URL
- [ ] Database initialized
- [ ] Sample data seeded (optional)
- [ ] All features tested

---

## 🌐 Your URLs

**Frontend**: _______________________________________

**Backend API**: _______________________________________

**Database**: Hosted on Railway (MySQL)

---

## 🎯 Common Issues & Solutions

### Issue: Frontend shows "Network Error"
**Solution**: 
- Check REACT_APP_API_URL in Vercel
- Ensure Railway backend is running
- Verify CORS is configured

### Issue: Database connection failed
**Solution**:
- Check Railway MySQL credentials
- Verify environment variables
- Check Railway logs for errors

### Issue: Build failed on Railway
**Solution**:
- Check package.json has all dependencies
- Verify Node version (>=16.0.0)
- Check deployment logs

---

## 📊 Free Tier Resources

**Railway**: $5 credit/month (~500 hours)
**Vercel**: Unlimited deployments

---

## 🔄 Update & Redeploy

```bash
# Make changes to code
git add .
git commit -m "Your update message"
git push

# Railway and Vercel auto-deploy!
```

---

**Deployment Time**: ~10-15 minutes
**Cost**: FREE ✅
