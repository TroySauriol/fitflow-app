# White Screen Fix Guide - Amplify Deployment

## 🔍 Your Situation
- ✅ Tab name shows: "FitFlow - Personal Workout Trainer"
- ✅ Favicon loads
- ❌ White screen (no content)

This means HTML loads but JavaScript doesn't execute.

## 📋 Step-by-Step Troubleshooting

### Step 1: Check Browser Console (CRITICAL)

1. Open your deployed URL: `https://staging.d279eo98j4i6rr.amplifyapp.com/`
2. Press **F12** (or right-click → Inspect)
3. Click **Console** tab
4. **Take a screenshot of any red errors**

### Common Errors & Fixes:

#### Error A: "Failed to load module script"
```
Failed to load module script: Expected a JavaScript module script 
but the server responded with a MIME type of "text/html"
```

**Fix:** Add this to `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: './', // Add this line
})
```

#### Error B: "404 Not Found" for /assets/
```
GET https://staging.d279eo98j4i6rr.amplifyapp.com/assets/index-xxx.js 404
```

**Fix:** Assets not uploaded correctly. Recreate zip:
```bash
npm run build
Compress-Archive -Path dist/* -DestinationPath fitflow-amplify-deploy.zip -Force
```

#### Error C: CORS Error
```
Access to fetch at 'http://localhost:3000' blocked by CORS
```

**Fix:** Backend not accessible. This is expected - app will use fallback workouts.

### Step 2: Check Network Tab

1. In DevTools, click **Network** tab
2. Refresh the page (Ctrl+R)
3. Look for failed requests (red)
4. Check if `/assets/index-xxx.js` loads successfully

**What to look for:**
- ✅ `index.html` - Status 200
- ✅ `index-xxx.js` - Status 200
- ✅ `index-xxx.css` - Status 200
- ❌ Any 404 errors?

### Step 3: Verify Zip Contents

The zip should contain:
```
fitflow-amplify-deploy.zip
├── index.html
├── manifest.json
├── sw.js
├── vite.svg
├── assets/
│   ├── index-D7j3MWRx.js
│   └── index-BV1cDxeQ.css
└── icons/
    └── (all icon files)
```

**NOT:**
```
fitflow-amplify-deploy.zip
└── dist/  ← WRONG! Should not have dist folder
    ├── index.html
    └── ...
```

### Step 4: Check Amplify Build Settings

In Amplify Console:
1. Go to your app
2. Click "Build settings"
3. Verify it says:

```yaml
version: 1
frontend:
  phases:
    build:
      commands:
        - echo "Manual deployment - no build needed"
  artifacts:
    baseDirectory: /
    files:
      - '**/*'
```

## 🔧 Quick Fixes to Try

### Fix 1: Use Relative Paths

Update `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths
})
```

Then rebuild and redeploy:
```bash
npm run build
Compress-Archive -Path dist/* -DestinationPath fitflow-amplify-deploy.zip -Force
```

### Fix 2: Check Service Worker

The service worker might be interfering. Try:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers**
4. Click **Unregister** if any are listed
5. Refresh the page

### Fix 3: Clear Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 4: Check Mobile.css Import

There's a PostCSS warning about `@import` order. Let's fix it:

Update `src/index.css` - move the import to the TOP:
```css
/* Import mobile-optimized styles */
@import './mobile.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* ... rest of file */
}
```

## 📸 What to Send Me

To help you further, send me:

1. **Screenshot of Console tab** (F12 → Console)
2. **Screenshot of Network tab** (F12 → Network → refresh page)
3. **Answer these questions:**
   - Do you see any red errors in console?
   - Do you see any 404 errors in network tab?
   - Does `/assets/index-xxx.js` load (status 200)?

## 🎯 Most Likely Solution

Based on similar issues, try this:

1. **Update vite.config.js** to use relative paths
2. **Fix CSS import order** in index.css
3. **Rebuild and redeploy**

```bash
# 1. Update vite.config.js (add base: './')
# 2. Fix index.css (move @import to top)
# 3. Rebuild
npm run build

# 4. Create new zip
Compress-Archive -Path dist/* -DestinationPath fitflow-amplify-deploy.zip -Force

# 5. Redeploy to Amplify
```

## 🆘 If Nothing Works

Try deploying to a different service to isolate the issue:

**Option A: Netlify (Free)**
1. Go to netlify.com
2. Drag and drop `fitflow-amplify-deploy.zip`
3. See if it works there

**Option B: Vercel (Free)**
1. Go to vercel.com
2. Import your project
3. Deploy

If it works on Netlify/Vercel but not Amplify, it's an Amplify-specific configuration issue.

---

**Next Step:** Open your deployed URL, press F12, and tell me what errors you see in the Console tab!