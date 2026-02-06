# Amplify Deployment Troubleshooting Guide

## 🔴 Your Issue: URL Not Working

**Your URL:** https://staging.d279eo98j4i6rr.amplifyapp.com/  
**Status:** Not working  
**Teammate's URL:** Working ✅

## ✅ Step-by-Step Fix

### Step 1: Check Build Status in Amplify Console

1. Go to: https://console.aws.amazon.com/amplify
2. Find your app: `workout-app` or similar
3. Click on it
4. Look at the deployment status

**What to look for:**
- ✅ Green "Deployed" badge = Good
- 🟡 Yellow "In Progress" = Wait for it to finish
- 🔴 Red "Failed" = Build error (go to Step 2)

### Step 2: Check Build Logs (If Failed)

1. Click on the failed build
2. Expand each phase:
   - Provision
   - Build
   - Deploy
3. Look for red error messages

**Common errors and fixes:**

#### Error: "npm install failed"
```bash
# Fix: Update package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

#### Error: "npm run build failed"
```bash
# Fix: Test build locally first
npm run build

# If it fails locally, fix the errors
# Then commit and push
```

#### Error: "No artifacts found"
```
# Fix: Wrong build output directory
# Update amplify.yml to use 'dist' instead of 'build'
```

### Step 3: Verify Build Configuration

**Check your `amplify.yml` file:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist  # ← MUST be 'dist' for Vite
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**How to update in Amplify Console:**
1. Go to your app in Amplify
2. Click "Build settings" in left menu
3. Click "Edit" on Build specification
4. Paste the correct YAML above
5. Click "Save"
6. Trigger a new build

### Step 4: Check Node.js Version

**In Amplify Console:**
1. Go to Build settings
2. Check "Build image settings"
3. Should be: `Amazon Linux:2023` or similar
4. Node.js version should be 18.x or higher

**To update:**
1. Click "Edit" on Build image
2. Select latest Amazon Linux image
3. Save and redeploy

### Step 5: Test Local Build

Before deploying, always test locally:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Test build
npm run build

# Check output
ls dist
# Should see: index.html, assets/, icons/, etc.

# Test locally
npm run preview
# Open http://localhost:4173
```

### Step 6: Compare with Teammate

Ask your teammate to share:

**Their `amplify.yml`:**
```bash
# In their project
cat amplify.yml
```

**Their build settings:**
- Screenshot of Amplify build settings
- Environment variables (if any)
- Node.js version

**Their `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Step 7: Check for CORS/API Issues

If the site loads but doesn't work:

**Open browser console (F12) and check for:**
- ❌ CORS errors
- ❌ 404 errors
- ❌ Failed API calls

**Fix CORS issues:**
Your backend needs to allow the Amplify domain:

```javascript
// In server/server.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://staging.d279eo98j4i6rr.amplifyapp.com'
  ]
}));
```

### Step 8: Redeploy

**Option A: Trigger new build from console**
1. Go to Amplify Console
2. Click "Redeploy this version"

**Option B: Push a new commit**
```bash
git commit --allow-empty -m "Trigger rebuild"
git push
```

**Option C: Manual deployment**
```bash
# Build locally
npm run build

# Install Amplify CLI
npm install -g @aws-amplify/cli

# Deploy
amplify publish
```

## 🔍 Diagnostic Commands

Run these to gather information:

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check if build works
npm run build

# Check build output
ls -la dist/

# Check for errors in package.json
npm run build 2>&1 | tee build-log.txt
```

## 📋 Checklist Before Asking for Help

- [ ] Build status in Amplify Console (screenshot)
- [ ] Build logs (copy error messages)
- [ ] Your `amplify.yml` file
- [ ] Your `package.json` scripts section
- [ ] Local build works (`npm run build` succeeds)
- [ ] Node.js version (run `node --version`)
- [ ] Teammate's working configuration

## 🚨 Most Common Issues

### Issue 1: Wrong Build Output Directory
**Symptom:** Build succeeds but site shows 404  
**Fix:** Change `baseDirectory` from `build` to `dist` in amplify.yml

### Issue 2: Missing Dependencies
**Symptom:** Build fails with "Cannot find module"  
**Fix:** Run `npm install` and commit `package-lock.json`

### Issue 3: Build Timeout
**Symptom:** Build fails after 5 minutes  
**Fix:** Increase timeout in Amplify settings to 10-15 minutes

### Issue 4: Environment Variables
**Symptom:** App loads but features don't work  
**Fix:** Add environment variables in Amplify Console

### Issue 5: CORS Errors
**Symptom:** API calls fail in browser console  
**Fix:** Update backend CORS to allow Amplify domain

## 🎯 Quick Fix Script

Run this to prepare for deployment:

```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build

# Verify output
ls dist/index.html && echo "✅ Build successful" || echo "❌ Build failed"

# Commit and push
git add .
git commit -m "Fix Amplify deployment"
git push
```

## 📞 What to Tell Your Admin

If you need help from your admin:

"My Amplify deployment at https://staging.d279eo98j4i6rr.amplifyapp.com/ isn't working. I've checked:
- Build status: [Deployed/Failed/In Progress]
- Build logs: [Attach screenshot or error message]
- Build configuration: Using Vite with 'dist' output directory
- Local build: [Works/Doesn't work]

My teammate's deployment works with the same code. Can you help me compare our Amplify settings?"

---

**Next Step:** Check your Amplify Console and report back what you see!