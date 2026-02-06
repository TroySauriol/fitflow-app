# Amplify Manual Deployment Fix - 404 Errors

## 🔍 Problem

All files are returning 404:
- CSS file: 404
- JS file: 404  
- Icons: 404

**This means Amplify cannot find the files, even though they're in the zip.**

## 🎯 Root Cause

Your Amplify app is likely configured for **Git-based deployment** (expects source code to build), but you're doing **manual deployment** (uploading pre-built files).

## ✅ Solution: Two Options

### Option A: Use Amplify Hosting (Recommended)

This is the correct way to manually deploy to Amplify:

1. **Go to AWS Amplify Console**
2. **Click "New app" → "Host web app"**
3. **Choose "Deploy without Git provider"**
4. **Give it a name:** `fitflow-manual`
5. **Drag and drop:** The `dist` folder (NOT the zip!)
6. **Wait for deployment**
7. **Get new URL**

### Option B: Fix Current App Configuration

If you want to keep using your current app:

1. **Go to Amplify Console → Your App**
2. **Click "App settings" → "Build settings"**
3. **Edit the build specification:**

```yaml
version: 1
frontend:
  phases:
    build:
      commands:
        - echo "Manual deployment"
  artifacts:
    baseDirectory: /
    files:
      - '**/*'
```

4. **Save**
5. **Go to "Hosting environments"**
6. **Click "Deploy updates"**
7. **Upload the zip**

## 🚀 Quick Fix (Try This First)

### Step 1: Extract the Zip

```powershell
Expand-Archive -Path fitflow-amplify-FIXED-PATHS.zip -DestinationPath amplify-manual-deploy -Force
```

### Step 2: Deploy Using Amplify Console

1. **Go to:** https://console.aws.amazon.com/amplify
2. **Click your app** (or create new one)
3. **Look for "Manual deploy" or "Drag and drop"**
4. **Drag the `amplify-manual-deploy` folder**
5. **Wait for deployment**

## 🔧 Alternative: Use AWS CLI

If the console doesn't work, use AWS CLI:

```powershell
# Install AWS CLI (if not installed)
# Download from: https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure

# Deploy to Amplify
aws amplify create-deployment --app-id YOUR_APP_ID --branch-name main

# Upload the zip
# (Follow the returned upload URL)
```

## 📋 Verify Zip Contents

Let's make sure the zip is correct:

```powershell
# Extract and list contents
Expand-Archive -Path fitflow-amplify-FIXED-PATHS.zip -DestinationPath temp-check -Force
Get-ChildItem temp-check -Recurse -Name
Remove-Item temp-check -Recurse -Force
```

**You should see:**
```
index.html
manifest.json
sw.js
vite.svg
assets/index-BIb5Tdm9.css
assets/index-GkRcyaly.js
assets/pwa-DPCPClev.js
icons/icon-72x72.svg
icons/icon-144x144.svg
... (more icons)
```

**NOT:**
```
dist/index.html  ← WRONG!
dist/assets/...  ← WRONG!
```

## 🎯 Most Likely Issue

Based on the 404 errors, here's what's probably happening:

### Issue: Amplify App Type Mismatch

Your Amplify app is configured for **Git deployment** (builds from source), but you're uploading **pre-built files**.

**Solution:**
1. Create a NEW Amplify app
2. Choose "Deploy without Git provider"
3. Upload the dist folder

### How to Check

1. Go to Amplify Console
2. Look at your app
3. Does it show:
   - "Repository" or "Branch"? → Git-based (wrong for manual deploy)
   - "Manual deploy" or "Drag and drop"? → Manual (correct)

## 📸 What I Need to See

To help you fix this, send me screenshots of:

1. **Amplify Console main page** (showing your app)
2. **App settings → Build settings**
3. **Hosting environments page**

This will tell me exactly how your app is configured.

## 🚨 Emergency Fix: Create New App

If nothing works, create a fresh Amplify app:

### Step 1: Create New App

1. Go to: https://console.aws.amazon.com/amplify
2. Click "New app" → "Host web app"
3. Choose "Deploy without Git provider"
4. App name: `fitflow-staging`
5. Environment name: `production`

### Step 2: Deploy

1. Drag and drop the `dist` folder
2. Wait 2-3 minutes
3. Get the new URL
4. Test it

### Step 3: Configure Custom Domain (Optional)

1. Go to "Domain management"
2. Add your subdomain
3. Follow DNS instructions

## 🔍 Debug: Check What Amplify Sees

After uploading, check what Amplify actually deployed:

1. Go to Amplify Console → Your App
2. Click on the deployment
3. Look at "Artifacts"
4. Check if files are listed

If no files are listed, the upload failed.

## 💡 Why This Happens

Amplify has two deployment modes:

**Mode 1: Git-based (CI/CD)**
- Connects to Git repository
- Runs `npm install` and `npm run build`
- Expects source code
- ❌ Won't work with pre-built files

**Mode 2: Manual (Hosting)**
- No Git connection
- Accepts pre-built files
- Just serves static files
- ✅ Works with our zip

Your app is probably in Mode 1, but you need Mode 2.

## 🎯 Action Plan

**Do this in order:**

1. **Check your Amplify app type** (Git or Manual?)
2. **If Git:** Create new app with "Deploy without Git"
3. **If Manual:** Check build settings and fix baseDirectory
4. **Deploy the `dist` folder** (not zip)
5. **Test the URL**

---

**Tell me: Is your Amplify app connected to a Git repository, or is it set up for manual deployment?**
