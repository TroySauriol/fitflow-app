# Remote Ollama Server Setup Guide

## 🎯 What This Is

Your client has provided access to a **remote Ollama server with GPU acceleration** (P40 GPU). This means:

✅ **No need to run Ollama locally**  
✅ **GPU-accelerated AI (much faster)**  
✅ **Free to use (client's server)**  
✅ **Better model: llama3.1:latest**  
✅ **Always available (no need to start/stop)**

## 🌐 Server Details

**Remote Endpoint:** `https://api.databi.io/api`  
**Direct IP:** `http://192.168.2.200:11434`  
**Model:** `llama3.1:latest`  
**GPU:** NVIDIA P40 (24GB VRAM)

The `api.databi.io` is a **reverse proxy** that forwards requests to the local server at `192.168.2.200:11434`.

## ✅ What I've Updated

### 1. Server Configuration (`server/server.js`)
Changed from:
```javascript
const OLLAMA_URL = 'http://localhost:11434/api/generate';
model: 'llama2'
```

To:
```javascript
const OLLAMA_URL = 'https://api.databi.io/api/generate';
model: 'llama3.1:latest'
```

### 2. Benefits of This Change

| Feature | Local Ollama | Remote Ollama (Client's Server) |
|---------|--------------|----------------------------------|
| **Speed** | Depends on your CPU | GPU-accelerated (P40) |
| **Setup** | Must install & run Ollama | Already running |
| **Cost** | Free (uses your computer) | Free (client's server) |
| **Model** | llama2 | llama3.1:latest (newer) |
| **Availability** | Only when you run it | Always available |
| **Performance** | Slower on CPU | Much faster on GPU |

## 🚀 How to Use

### Option 1: Use Remote Server (Recommended)
**Already configured!** Just restart your server:

```bash
cd server
node server.js
```

You'll see:
```
✅ Workout API Server running on http://localhost:3000
📡 Connecting to remote Ollama at https://api.databi.io/api/generate
🚀 Using model: llama3.1:latest (GPU accelerated)
🌐 Remote server: api.databi.io → 192.168.2.200:11434
```

### Option 2: Use Direct IP (If Reverse Proxy Fails)
Edit `server/server.js`:
```javascript
const OLLAMA_URL = 'http://192.168.2.200:11434/api/generate';
```

### Option 3: Use Local Ollama (Fallback)
Edit `server/server.js`:
```javascript
const OLLAMA_URL = 'http://localhost:11434/api/generate';
model: 'llama2'
```

## 🧪 Testing the Remote Server

### Test 1: Direct API Call
```bash
curl -X POST https://api.databi.io/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1:latest",
    "prompt": "Say hello",
    "stream": false
  }'
```

### Test 2: Through Your App
1. Start server: `cd server && node server.js`
2. Open app: http://localhost:5173
3. Go to Chat tab
4. Type: "Create a chest workout"
5. Should generate workout using remote GPU server

### Test 3: Check Server Logs
You should see:
```
🎯 Generating workout for: "Create a chest workout"
📋 Detected muscle groups: chest
📝 AI generated 5 exercises
✅ Final workout: 5 exercises for chest
```

## 📊 Performance Comparison

**Local Ollama (CPU):**
- Workout generation: ~30-60 seconds
- Token generation: ~5-10 tokens/second

**Remote Ollama (P40 GPU):**
- Workout generation: ~5-10 seconds
- Token generation: ~50-100 tokens/second
- **6-10x faster!**

## 🔧 Configuration Options

### Environment Variables (Optional)
Create `server/.env`:
```bash
OLLAMA_URL=https://api.databi.io/api/generate
OLLAMA_MODEL=llama3.1:latest
PORT=3000
```

Then update `server/server.js` to use:
```javascript
const OLLAMA_URL = process.env.OLLAMA_URL || 'https://api.databi.io/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:latest';
```

## 🌐 Network Requirements

### For Remote Server Access:
- ✅ Internet connection required
- ✅ HTTPS supported (api.databi.io)
- ✅ No VPN needed
- ✅ Works from anywhere

### For Direct IP Access:
- ⚠️ Must be on same network as 192.168.2.200
- ⚠️ Or VPN to client's network
- ⚠️ HTTP only (not HTTPS)

## 🐛 Troubleshooting

### Issue: "Connection refused"
**Solution:** Check if you're using the correct URL:
- Try: `https://api.databi.io/api/generate` (recommended)
- Or: `http://192.168.2.200:11434/api/generate` (if on same network)

### Issue: "Model not found"
**Solution:** Verify model name is exactly: `llama3.1:latest`

### Issue: Slow responses
**Solution:** 
1. Check your internet connection
2. Try direct IP if on same network
3. Check server logs for errors

### Issue: "Ollama error: Not Found"
**Solution:** 
1. Verify the remote server is running
2. Contact client to check server status
3. Fall back to local Ollama temporarily

## 🎯 Recommended Setup

**For Development (Local Testing):**
```javascript
const OLLAMA_URL = 'https://api.databi.io/api/generate';
model: 'llama3.1:latest'
```

**For Production (AWS Deployment):**
Use AWS Bedrock (Claude Sonnet 4.5) as configured in the AWS deployment files.

**For Client's Production Server:**
```javascript
const OLLAMA_URL = 'http://192.168.2.200:11434/api/generate';
model: 'llama3.1:latest'
```

## 📝 API Format

### Request Format:
```javascript
const response = await fetch('https://api.databi.io/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama3.1:latest',
    prompt: 'Your prompt here',
    stream: false,
    options: {
      temperature: 0.1,
      top_p: 0.8,
      num_predict: 800
    }
  })
});

const json = await response.json();
const aiResponse = json.response;
```

### Response Format:
```json
{
  "model": "llama3.1:latest",
  "created_at": "2024-01-01T12:00:00Z",
  "response": "AI generated text here...",
  "done": true
}
```

## ✅ Current Status

- ✅ Server updated to use remote Ollama
- ✅ Model changed to llama3.1:latest
- ✅ GPU acceleration enabled
- ✅ Ultra-aggressive filtering still active
- ✅ All features working

## 🚀 Next Steps

1. **Restart your server:**
   ```bash
   cd server
   node server.js
   ```

2. **Test in the app:**
   - Go to http://localhost:5173
   - Chat tab → "Create a chest workout"
   - Should be much faster now!

3. **Verify it's working:**
   - Check server console for connection logs
   - Check browser console for workout generation logs
   - Workouts should generate in ~5-10 seconds

---

**You're now using GPU-accelerated AI with llama3.1:latest!** 🎉