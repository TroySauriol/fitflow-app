# 🏃 Cardio Tracker Guide

## Overview

The Cardio Tracker is a comprehensive running/walking/cycling tracker inspired by RunKeeper and Strava, with AI-powered training plan generation.

---

## Features

### 1. Real-Time Activity Tracking ⏱️

**Track Your Runs:**
- ⏱️ **Live Timer** - Precise timing with millisecond accuracy
- 📍 **Distance Tracking** - Manual distance input (km or miles)
- 🏃 **Pace Calculation** - Automatic pace per km/mile
- ⚡ **Speed Display** - Real-time speed in km/h or mph
- 🔥 **Calorie Estimation** - Rough calorie burn estimate
- 🔄 **Lap Tracking** - Record splits during your run

**Activity Types:**
- 🏃 Running
- 🚶 Walking
- 🚴 Cycling

**Controls:**
- ▶️ Start - Begin tracking
- ⏸️ Pause - Pause timer (keeps distance)
- ▶️ Resume - Continue tracking
- 🔄 Lap - Record a split
- ⏹️ Finish - Stop and save session

---

### 2. Session History 📊

**View Your Progress:**
- Total distance covered (all time)
- Total time spent training
- Average pace across all sessions
- Number of sessions completed

**Session Details:**
- Activity type (run/walk/cycle)
- Date and time
- Distance and duration
- Pace and speed
- Calories burned
- Personal notes
- Lap splits

---

### 3. AI Training Plans 🤖

**Get Personalized Plans:**

The AI can create detailed, week-by-week training plans for:
- 5K races
- 10K races
- Half marathons
- Full marathons
- General endurance building

**Example Prompts:**

```
"It's my first time running a 5K race. It's in 4 weeks and I need a training plan so I'm ready for it"
```

```
"I want to improve my 10K time from 55 minutes to 50 minutes in 8 weeks"
```

```
"Create a beginner marathon training plan for someone who can run 5K comfortably"
```

**What You Get:**
- Week-by-week breakdown
- Specific workout types (easy runs, tempo, intervals, long runs)
- Distance and pace guidelines
- Rest and recovery days
- Race day strategy
- Nutrition and injury prevention tips

---

## How to Use

### Starting a Run:

1. **Go to Cardio Tab** - Click 🏃 Cardio in navigation
2. **Select Activity** - Choose Run, Walk, or Cycle
3. **Set Distance** - Enter your planned distance (optional)
4. **Choose Unit** - Select km or miles
5. **Press Start** - Begin tracking!

### During Your Run:

- **Check Stats** - View time, pace, speed, calories
- **Record Laps** - Press 🔄 Lap to mark splits
- **Pause if Needed** - Press ⏸️ Pause, then ▶️ Resume
- **Finish** - Press ⏹️ Finish when done

### After Your Run:

1. **Review Stats** - Check your performance
2. **Add Notes** - Write how you felt (optional)
3. **Save Session** - Press Save to record

### Viewing History:

1. **Go to History Tab** - Click 📊 History
2. **View Stats** - See total distance, time, average pace
3. **Browse Sessions** - Scroll through past workouts
4. **Delete if Needed** - Click 🗑️ to remove a session

### Getting a Training Plan:

1. **Go to Training Plans Tab** - Click 📋 Training Plans
2. **Review Examples** - See sample prompts
3. **Click Generate** - Opens Chat with AI
4. **Describe Your Goal** - Be specific about:
   - Current fitness level
   - Goal race distance and date
   - Any injuries or limitations
   - Training days per week

---

## AI Training Plan Format

When you request a training plan, the AI will provide:

### Week-by-Week Structure:
```
Week 1: Base Building
├── Monday: Easy Run - 3K at easy pace
├── Tuesday: Rest or Cross-training
├── Wednesday: Tempo Run - 4K at moderate pace
├── Thursday: Easy Run - 3K at easy pace
├── Friday: Rest
├── Saturday: Long Run - 5K at easy pace
└── Sunday: Rest

Week 2: Building Volume
...
```

### Workout Types Explained:

**Easy Runs:**
- Conversational pace
- Build aerobic base
- Active recovery

**Tempo Runs:**
- Comfortably hard pace
- Improve lactate threshold
- Race pace training

**Interval Training:**
- Short fast repeats
- Improve speed and VO2 max
- Example: 6 x 400m with 200m recovery

**Long Runs:**
- Build endurance
- Increase weekly distance
- Practice race nutrition

**Recovery Runs:**
- Very easy pace
- Active recovery between hard days
- Keep legs moving

**Rest Days:**
- Complete rest or light cross-training
- Allow body to adapt and recover

---

## Tips for Best Results

### Tracking Tips:
1. **Be Consistent** - Track every run for accurate stats
2. **Add Notes** - Record how you felt, weather, etc.
3. **Use Laps** - Mark splits for interval training
4. **Check Pace** - Monitor your effort level

### Training Plan Tips:
1. **Be Specific** - Tell AI your current fitness level
2. **Set Realistic Goals** - Give yourself enough time
3. **Mention Limitations** - Include injuries or constraints
4. **Follow the Plan** - Trust the progressive structure
5. **Listen to Your Body** - Rest if you need extra recovery

### Safety Tips:
1. **Warm Up** - Always start with 5-10 minutes easy
2. **Cool Down** - End with 5-10 minutes easy + stretching
3. **Stay Hydrated** - Drink water before, during, after
4. **Rest Days Matter** - Recovery is when you get stronger
5. **Don't Increase Too Fast** - Follow 10% rule (max 10% weekly increase)

---

## Mobile Optimization

The Cardio Tracker is fully optimized for mobile use:

- ✅ Large, easy-to-tap buttons
- ✅ Clear, readable stats display
- ✅ Responsive layout for all screen sizes
- ✅ Works offline (PWA)
- ✅ Can run in background

**Best Practice:**
- Keep phone in pocket or armband
- Check stats at intervals or after run
- Use lap button to mark splits
- Save session immediately after finishing

---

## Data Storage

All cardio data is stored locally in your browser:

- **Sessions** - Saved in localStorage
- **Stats** - Calculated from session data
- **Privacy** - Data never leaves your device
- **Backup** - Export/import coming soon

---

## Future Enhancements

Coming soon:
- 📍 GPS tracking integration
- 📈 Advanced analytics and charts
- 🏆 Personal records and achievements
- 👥 Social features and challenges
- 📱 Smartwatch integration
- 🎵 Music integration
- 🗺️ Route mapping
- 📊 Heart rate monitoring

---

## Troubleshooting

### Timer Not Starting:
- Check if distance is set (can be 0)
- Refresh page if needed
- Clear browser cache

### Stats Not Calculating:
- Ensure distance is greater than 0
- Check unit selection (km vs mi)
- Verify time is running

### Session Not Saving:
- Check browser localStorage is enabled
- Ensure you clicked "Save Session"
- Try refreshing and re-entering

### AI Training Plan Issues:
- Be more specific in your prompt
- Include current fitness level
- Mention goal race and date
- Try rephrasing your request

---

## Example Training Plan Request

**Good Prompt:**
```
"I'm a beginner runner who can currently run 2K without stopping. 
I have a 5K race in 6 weeks and want to finish it comfortably. 
I can train 4 days per week (Monday, Wednesday, Friday, Saturday). 
I have no injuries but want to avoid overtraining. 
Please create a progressive training plan."
```

**What AI Will Provide:**
- 6-week progressive plan
- 4 workouts per week
- Gradual distance increases
- Mix of easy runs and tempo work
- Rest days for recovery
- Race day strategy
- Tips for avoiding injury

---

## Summary

The Cardio Tracker gives you:
- ✅ Professional-grade run tracking
- ✅ Detailed session history
- ✅ AI-powered training plans
- ✅ Mobile-optimized interface
- ✅ Complete privacy (local storage)

**Start tracking your runs today and let AI help you reach your goals!** 🏃‍♂️💨

---

**Questions or Issues?**
Check the main documentation or ask in the Chat tab!
