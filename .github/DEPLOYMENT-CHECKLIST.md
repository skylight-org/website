# Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Supabase project created
- [ ] Database schema applied from `DB_Schema.md`
- [ ] Sample data uploaded using `database_mgmt/upload.py`
- [ ] Database credentials noted (URL and anon key)

### 2. Backend Preparation
- [ ] Backend hosting platform chosen (Railway/Render/Heroku)
- [ ] Backend repository connected to hosting platform
- [ ] Environment variables configured:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_KEY`
  - [ ] `PORT` (usually 3000)
  - [ ] `NODE_ENV=production`
- [ ] Backend deployed successfully
- [ ] Backend health check accessible: `/health` returns `{"status":"ok"}`
- [ ] Backend URL noted (e.g., `https://your-app.railway.app`)

### 3. Frontend Configuration
- [ ] GitHub repository settings configured
  - [ ] Settings → Pages → Source set to "GitHub Actions"
- [ ] GitHub Actions secret added:
  - [ ] `VITE_API_BASE_URL` = `https://your-backend.com/api/v1`
- [ ] Base path configured in `.github/workflows/deploy-gh-pages.yml`:
  - [ ] Set to `'/'` for custom domain or `username.github.io`
  - [ ] Set to `'/repo-name/'` for `username.github.io/repo-name/`
- [ ] Changes committed and pushed to `main` branch

## Deployment Process

### 4. Initial Deployment
- [ ] GitHub Actions workflow triggered (automatic on push to `main`)
- [ ] Workflow completed successfully (green checkmark in Actions tab)
- [ ] Frontend accessible at GitHub Pages URL
- [ ] No console errors in browser developer tools
- [ ] Data loads correctly on the leaderboard

### 5. Functional Testing
- [ ] Homepage loads and displays stats
- [ ] Overall Rankings table shows data
- [ ] Dataset cards display and expand correctly
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Navigation between pages works
- [ ] All links and buttons functional
- [ ] Responsive design works on mobile
- [ ] All API endpoints responding correctly

### 6. Performance & Security
- [ ] Page load time acceptable (< 3 seconds)
- [ ] No mixed content warnings (HTTP/HTTPS)
- [ ] HTTPS enabled on GitHub Pages
- [ ] CORS configured correctly (no console errors)
- [ ] API rate limiting considered (if needed)

## Post-Deployment

### 7. Monitoring Setup (Optional but Recommended)
- [ ] Uptime monitoring configured (e.g., UptimeRobot)
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Analytics configured (e.g., Plausible, Google Analytics)

### 8. Documentation
- [ ] Deployment date recorded
- [ ] Frontend URL documented
- [ ] Backend URL documented
- [ ] Environment variables backed up securely
- [ ] Team members have access to necessary credentials

### 9. Custom Domain (Optional)
- [ ] Domain purchased/available
- [ ] DNS records configured
- [ ] GitHub Pages custom domain set
- [ ] DNS propagation complete (up to 24 hours)
- [ ] HTTPS enforced on custom domain

## Maintenance Schedule

### Weekly
- [ ] Check error logs on backend hosting platform
- [ ] Review GitHub Actions for any failed runs
- [ ] Monitor uptime metrics

### Monthly
- [ ] Review database usage and performance
- [ ] Check for dependency updates
- [ ] Review hosting costs and usage

### Quarterly
- [ ] Update dependencies (`npm update`)
- [ ] Security audit
- [ ] Performance optimization review

## Rollback Plan

If issues arise post-deployment:

### Frontend Rollback
1. Go to GitHub Actions
2. Find last successful workflow
3. Re-run that workflow

### Backend Rollback
- **Railway/Render**: Use platform's rollback feature
- **Manual**: Revert git commit and redeploy

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Project Lead | ___________ | ___________ |
| Backend Dev | ___________ | ___________ |
| Frontend Dev | ___________ | ___________ |
| DevOps | ___________ | ___________ |

## Deployment URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend (Production) | ___________ | GitHub Pages |
| Backend API | ___________ | Railway/Render/etc |
| Supabase Dashboard | ___________ | Database management |
| GitHub Repository | ___________ | Source code |

## Credentials Storage

⚠️ **IMPORTANT**: Store all credentials securely
- [ ] Backend environment variables backed up
- [ ] GitHub secrets documented (not the values, just which ones exist)
- [ ] Supabase credentials stored in password manager
- [ ] Hosting platform login credentials secured

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Version**: ___________  
**Status**: ⬜ In Progress | ⬜ Complete | ⬜ Issues

