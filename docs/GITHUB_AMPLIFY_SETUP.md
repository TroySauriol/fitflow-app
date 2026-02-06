# Connect GitHub to Amplify - Step by Step

## ✅ Your Code is on GitHub!

Repository: https://github.com/TroySauriol/fitflow-app

Now let's connect it to AWS Amplify for automatic deployment.

---

## 🚀 Connect Amplify to GitHub

### Step 1: Open Amplify Console

1. **Go to:** https://console.aws.amazon.com/amplify
2. **Click "New app"** (top right corner)
3. **Select "Host web app"**

### Step 2: Choose GitHub

1. **Select "GitHub"** as your Git provider
2. **Click "Continue"**

### Step 3: Authorize AWS Amplify

1. **A popup window will open** asking you to authorize AWS Amplify
2. **Click "Authorize aws-amplify"**
3. **Enter your GitHub password** if prompted
4. **Grant access** to your repositories

### Step 4: Select Repository

1. **Repository:** Select `fitflow-app` from the dropdown
2. **Branch:** Select `main`
3. **Click "Next"**

### Step 5: Configure Build Settings

Amplify should auto-detect Vite. Verify these settings:

**App name:** `fitflow-production`

**Build and test settings:**
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
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**If the settings look different:**
1. Click "Edit" on the build settings
2. Copy and paste the YAML above
3. Click "Save"

**Click "Next"**

### Step 6: Review and Deploy

1. **Review all settings:**
   - Repository: fitflow-app
   - Branch: main
   - Build settings: Vite detected
   - Output directory: dist

2. **Click "Save and deploy"**

### Step 7: Watch the Build

You'll see 4 stages:

1. **Provision** (30 seconds) - Setting up build environment
2. **Build** (2-3 minutes) - Running `npm ci` and `npm run build`
3. **Deploy** (1 minute) - Uploading to CloudFront CDN
4. **Verify** (30 seconds) - Final checks

**Total time: 4-5 minutes**

### Step 8: Get Your URL

Once all stages are green ✅:

1. **You'll see your URL** at the top: `https://main.d1234567890.amplifyapp.com`
2. **Click the URL** to open your app
3. **It should work perfectly!** No more 404 errors

---

## 🎉 Success Indicators

You'll know it worked when:

- ✅ All 4 build stages are green
- ✅ URL opens and shows your dashboard
- ✅ No 404 errors in console
- ✅ App is fully functional

---

## 🔄 Future Updates

From now on, whenever you want to update your app:

### Option A: Edit on GitHub Website

1. Go to: https://github.com/TroySauriol/fitflow-app
2. Navigate to the file you want to edit
3. Click the pencil icon (Edit)
4. Make your changes
5. Click "Commit changes"
6. **Amplify automatically rebuilds!** (takes 4-5 minutes)

### Option B: Push from Your Computer

```powershell
# Make changes to your files
# Then:
git add .
git commit -m "Description of changes"
git push

# Amplify automatically rebuilds!
```

---

## 📊 Monitor Deployments

To see deployment status:

1. **Go to Amplify Console**
2. **Click your app**
3. **You'll see:**
   - Current deployment status
   - Build logs
   - Deployment history
   - URL

---

## 🔧 Troubleshooting

### If Build Fails

1. **Click on the failed build**
2. **Expand "Build" section**
3. **Look for red error messages**
4. **Common issues:**
   - Missing dependencies → Check package.json
   - Build command failed → Check vite.config.js
   - Wrong Node version → Update build settings

### If App Shows White Screen

1. **Check Console tab** (F12)
2. **Look for errors**
3. **Most likely:** Build succeeded but there's a code error
4. **Fix the error** and push again

---

## 🎯 What You Get

With GitHub + Amplify:

- ✅ **Automatic deployments** - Push code, auto-deploys
- ✅ **Build logs** - See exactly what happened
- ✅ **Rollback** - Revert to any previous deployment
- ✅ **Preview deployments** - Test before going live
- ✅ **Custom domain** - Add your own domain later
- ✅ **HTTPS** - Automatic SSL certificate
- ✅ **CDN** - Fast global delivery via CloudFront

---

## 📞 Next Steps

1. **Go to:** https://console.aws.amazon.com/amplify
2. **Click "New app"**
3. **Follow the steps above**
4. **Wait 5 minutes**
5. **Your app will be live!**

---

**Ready? Go to Amplify Console now:** https://console.aws.amazon.com/amplify
