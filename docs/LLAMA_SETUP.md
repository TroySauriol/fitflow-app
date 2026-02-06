# Workout App with Llama 3.1 AI - Setup Guide

## ✅ Setup Complete!

Your app now has:
1. **React Frontend** - Chat interface, saved workouts, personal records
2. **Express Backend** - Proxy server for AI requests
3. **Llama 3.1 Integration** - Local AI for generating workouts

---

## 🚀 Quick Start (Once Ollama is installed)

### Step 1: Start Ollama & Download Llama 3.1
Once Ollama finishes installing, run:
```bash
ollama pull llama2
ollama run llama2
```

Ollama will:
- Download Llama 3.1 (~4-5GB)
- Start a server on `localhost:11434`
- Keep it running in that terminal

### Step 2: Install & Start Backend Server
Open a new terminal in the `server` folder:
```bash
cd server
npm install
npm start
```

This starts the Express proxy on `localhost:3000`

### Step 3: Keep React Running
Your React app should already be running on `localhost:5174` (from `npm run dev`)

### Step 4: Use the App!
- Open `http://localhost:5174`
- Type a prompt like "chest and triceps"
- The app will send it to your local Llama AI
- Get personalized AI-generated workouts!

---

## 📋 Requirements

- **Node.js** ✅ (Already installed)
- **Ollama** ⏳ (Installing...)
- **Llama 3.1 Model** (Will download when you run `ollama pull llama2`)
- **4-5GB disk space** for the model

---

## 🔄 How It Works

```
React App → Express Server → Ollama → Llama 3.1 AI
```

1. User types prompt in React
2. Request sent to Express server (`localhost:3000/api/workout`)
3. Server forwards to Ollama (`localhost:11434`)
4. Llama generates custom workout JSON
5. Response flows back to React
6. Workout displays in chat

---

## 🛠️ Troubleshooting

### "Cannot connect to API"
- Make sure `npm start` is running in the `server` folder

### "Ollama not found"
- Ollama installation might still be pending
- Check if `ollama` command works in terminal
- May need to restart terminal/computer

### "Cannot reach Llama"
- Make sure Ollama is running (`ollama run llama2`)
- Check port 11434 is accessible

### App still using template workouts
- This is normal! If Ollama/backend isn't running, it falls back to the template database
- Check browser console for errors

---

## 📁 Project Structure

```
workout-app/
├── src/                          # React Frontend
│   ├── components/
│   │   ├── ChatInterface.jsx      # Chat UI
│   │   ├── SavedWorkouts.jsx      # Saved workouts list
│   │   └── PersonalRecords.jsx    # Progress tracking
│   └── services/
│       └── workoutGenerator.js    # AI integration + fallback
├── server/                        # Express Backend
│   ├── server.js                  # Proxy to Ollama
│   └── package.json
└── package.json                   # React dependencies
```

---

## 🎯 Next Steps

1. **Wait for Ollama to finish installing**
2. **Run `ollama pull llama2` and `ollama run llama2`**
3. **Open new terminal and run `npm install && npm start` in `/server`**
4. **Use the app at `localhost:5174`**

That's it! Your AI-powered workout app will be fully functional! 💪🤖
