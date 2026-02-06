# Account & Preferences System 🎯

## Overview

The app now includes a complete **Account & Preferences System** with an expandable sidebar that helps users customize their experience and inform the AI for smarter workout recommendations.

## Features

### 1. 👤 Account Sidebar (Hidden/Expandable)

**Location:** Top-right corner (purple floating button)

**How to Open:**
- Click the **👤** button in the top-right corner
- Sidebar slides in from the right with smooth animation
- Click anywhere outside or the **✕** button to close

**Three Main Tabs:**

#### a) Profile Tab
- User avatar (👤)
- Profile information display:
  - Full name
  - Email address  
  - Join date
- Editable fields:
  - **Full Name** - Change your display name
  - **Email** - Update contact email
  - **Current Goal** - Select fitness objective:
    - Build Muscle
    - Lose Fat
    - Build Strength
    - Build Endurance
    - Improve Flexibility
  - **Experience Level** - Choose your fitness level:
    - Beginner
    - Intermediate
    - Advanced
    - Elite

All profile changes are **automatically saved** to localStorage.

#### b) ⚙️ Preferences Tab

**Three sub-sections:**

**🩹 Injuries & Limitations**
- List any injuries or pain areas
- Quick-select buttons for common injuries:
  - Lower Back Pain
  - Knee Pain
  - Shoulder Pain
  - Wrist Pain
  - Elbow Pain
  - Hip Pain
  - Neck Pain
  - Ankle Pain
- Custom injury field for unique conditions
- The AI will **AVOID exercises** that could aggravate these injuries
- Scrollable list if you add multiple injuries
- Remove injuries with ✕ button

**❌ Excluded Exercises**
- Block specific exercises you dislike or can't do
- Quick-select buttons for common exercises:
  - Barbell Back Squats
  - Deadlifts
  - Leg Press
  - Bench Press
  - Overhead Press
  - Barbell Rows
  - Pull-ups
  - Dips
- Custom exercise field for exercises not in the list
- The AI will **NEVER suggest excluded exercises**, even if effective
- Example: "I hate leg press but want strong legs" → AI avoids leg press, suggests Front Squats, Goblet Squats, etc.
- Remove exercises with ✕ button

**🏋️ Available Equipment**
- Tell the app what equipment you have access to
- Quick-select buttons for common equipment:
  - Dumbbells
  - Barbells
  - Pull-up Bar
  - Bench
  - Machine Weights
  - Resistance Bands
  - Bodyweight Only
- Custom equipment field for specialized equipment
- The AI generates workouts using **only available equipment**
- Remove equipment with ✕ button

#### c) 🔧 Settings Tab
- **Notifications**
  - Workout reminders
  - Personal record alerts
- **Display**
  - Dark mode toggle
  - Performance graphs toggle
- **Data**
  - Export Workouts button
  - Clear All Data button
- **About**
  - App version info
  - View documentation link

---

## How It Works with the AI

### The Flow:

1. **User sets preferences** in Account → Preferences tab
   - Adds "Leg Press" to Excluded Exercises
   - Adds "Lower Back Pain" to Injuries
   - Adds "Dumbbells, Bodyweight" to Equipment

2. **User requests workout** in Chat: "I want to build strong legs"

3. **Preferences are sent to AI** with the request:
   ```
   User request: I want to build strong legs
   
   The user has the following injuries/limitations that I MUST avoid: Lower Back Pain
   The user EXPLICITLY does NOT want these exercises: Leg Press
   The user only has access to this equipment: Dumbbells, Bodyweight
   ```

4. **AI generates customized workout** that:
   - ✅ Builds legs without leg press
   - ✅ Protects lower back
   - ✅ Uses only dumbbells and bodyweight
   - ✅ Might suggest: Front Squats (dumbbell), Single-Leg Glute Bridges, Bulgarian Split Squats, etc.

5. **Two-layer filtering** ensures safety:
   - **Layer 1:** AI respects preferences in the prompt
   - **Layer 2:** App filters response to remove any excluded exercises that made it through
   - Result: Bulletproof protection against unwanted exercises

---

## Key Benefits

### For Users:
- ✅ **Safer workouts** - AI avoids exercises that hurt
- ✅ **More relevant suggestions** - Based on actual equipment  
- ✅ **Better personalization** - AI knows your preferences
- ✅ **No manual filtering** - Just tell the app once
- ✅ **Persistent settings** - All preferences saved automatically

### For the AI:
- ✅ **Better context** - Knows about injuries and limitations
- ✅ **Explicit constraints** - Very clear instructions to follow
- ✅ **Equipment awareness** - Suggests only feasible exercises
- ✅ **Higher compliance** - Preferences included in every request

---

## Data Persistence

All data is stored in browser **localStorage**:
- `userProfile` - Name, email, goal, experience level
- `userPreferences` - Injuries, excluded exercises, equipment
- `savedWorkouts` - Your saved workout history
- `personalRecords` - Weight/reps history

**No data leaves your browser** - Everything is local!

---

## Example Scenarios

### Scenario 1: Avoiding Leg Press
```
User adds to Excluded Exercises: "Leg Press"
User says: "Create a leg workout"
AI generates: Goblet Squats, Bulgarian Split Squats, Leg Curls, Calf Raises
Result: ✅ Strong leg workout, leg press never suggested
```

### Scenario 2: Back Pain Protection
```
User adds to Injuries: "Lower Back Pain"
User says: "Full body workout"
AI generates: Avoids deadlifts, avoids heavy rows
Includes: Pull-ups (instead of rows), Leg Press (instead of squats), Chest Work
Result: ✅ Full body without stressing lower back
```

### Scenario 3: Limited Equipment
```
User adds Equipment: "Dumbbells only"
User says: "Build muscle"
AI generates: Dumbbell bench press, Dumbbell rows, Dumbbell squats, etc.
Result: ✅ Effective workout with only dumbbells
```

---

## Technical Implementation

### Components:
- **AccountSidebar.jsx** - Main sidebar container with profile, preferences, settings
- **Preferences.jsx** - Injuries, exclusions, equipment management

### State Management:
- Preferences stored in App.jsx state
- Synced to localStorage automatically
- Passed to ChatInterface and workoutGenerator

### AI Integration:
- Preferences included in every Ollama request
- Server.js builds preference context into system prompt
- Client-side filtering as backup safety layer
- Fallback templates also respect preferences

### Storage:
- **userPreferences** - localStorage key
- Loads on app startup
- Updates instantly when changed

---

## Future Enhancements

Potential additions to the preferences system:
- [ ] Age/gender information for better recommendations
- [ ] Height/weight for form corrections
- [ ] Dietary preferences (vegan, allergies, etc.)
- [ ] Recovery time preferences
- [ ] Pain level tracking
- [ ] Favorite exercises (inverse of exclusions)
- [ ] Preferred rep ranges
- [ ] Time available per session
- [ ] Export/backup preferences
- [ ] Multiple user profiles
- [ ] Cloud sync across devices

---

## Tips for Best Results

### ✅ For Optimal AI Performance:
1. **Be specific about injuries** - Not just "back pain" but "lower back pain near sacroiliac joint"
2. **List actual excluded exercises** - AI learns specific names better
3. **Set realistic equipment** - Only list equipment you regularly use
4. **Update preferences regularly** - As injuries heal or goals change
5. **Test and adjust** - If AI suggests something you dislike, add it to exclusions

### ✅ For Injuries:
- Be as specific as possible
- Mention when it hurts (movement, position, etc.)
- Update when it improves

### ✅ For Equipment:
- Only include what you have regular access to
- Update if you join a new gym with different equipment
- Include mobility aids (resistance bands, sliders, etc.)

---

## Troubleshooting

### "AI still suggests excluded exercises"
- Preferences were set after sending the request
- Try closing/reopening the app to reload localStorage
- Check that exercise name matches exactly
- Add it to exclusions again if needed

### "Preferences not saving"
- Check browser allows localStorage
- Look at browser console for errors
- Try clearing cache and reloading
- Ensure you're on http://localhost:5173

### "AI doesn't understand my injury"
- Be more specific (e.g., "chronic lower back pain from desk job")
- Try rephrasing as "avoid exercises that cause lower back pain"
- List specific movements to avoid (e.g., "heavy deadlifts")

---

## Architecture Diagram

```
User Interface (React)
    ↓
AccountSidebar Component
    ├─ Profile Tab (editable)
    ├─ Preferences Tab
    │   ├─ Injuries & Limitations
    │   ├─ Excluded Exercises  
    │   └─ Available Equipment
    └─ Settings Tab
    ↓
localStorage
(Persists across sessions)
    ↓
Chat Interface
    ↓
workoutGenerator.js
(Builds preference context)
    ↓
Express Server (server.js)
(Adds preferences to AI prompt)
    ↓
Ollama/Llama Model
(Generates workout respecting preferences)
    ↓
Client-side filter
(Removes any excluded exercises)
    ↓
Workout displayed to user
```

---

## Security & Privacy

✅ **All data stays local** - No backend storage
✅ **No account required** - Works immediately
✅ **No tracking** - Full privacy
✅ **No cloud sync** - Single-device only (for now)
✅ **Easy export** - Download all your data anytime

---

## Version Info

- **Account System:** v1.0.0
- **Preferences:** v1.0.0  
- **AI Integration:** v1.0.0
- **Last Updated:** January 28, 2026
