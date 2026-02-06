import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// Client's remote Ollama server with GPU acceleration
const OLLAMA_URL = 'https://api.databi.io/api/generate';
// Alternative direct access: http://192.168.2.200:11434/api/generate

app.use(cors());
app.use(express.json());

// ULTRA-STRICT muscle group exercise validation
const muscleGroupExercises = {
  chest: [
    'bench press', 'push-up', 'chest fly', 'incline press', 'decline press', 
    'dips', 'chest press', 'pec deck', 'cable crossover', 'dumbbell press',
    'incline fly', 'decline fly', 'svend press', 'squeeze press'
  ],
  back: [
    'pull-up', 'chin-up', 'row', 'lat pulldown', 'deadlift', 'face pull',
    'reverse fly', 't-bar row', 'cable row', 'hyperextension', 'pullover',
    'shrug', 'rack pull', 'seal row', 'pendlay row'
  ],
  legs: [
    'squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'calf raise',
    'hip thrust', 'step-up', 'bulgarian split squat', 'romanian deadlift',
    'split squat', 'hack squat', 'sissy squat', 'nordic curl', 'glute bridge'
  ],
  shoulders: [
    'overhead press', 'shoulder press', 'lateral raise', 'front raise',
    'rear delt fly', 'upright row', 'arnold press', 'pike push-up',
    'military press', 'bradford press', 'bus driver', 'face pull',
    'dumbbell press', 'cable lateral raise', 'reverse fly', 'shrug',
    'seated press', 'standing press', 'push press', 'landmine press'
  ],
  arms: [
    'curl', 'tricep extension', 'hammer curl', 'close-grip bench', 'tricep dip',
    'preacher curl', 'skull crusher', 'cable curl', 'tricep pushdown',
    'concentration curl', 'overhead extension', 'kickback', 'zottman curl'
  ],
  core: [
    'plank', 'crunch', 'sit-up', 'leg raise', 'russian twist', 'mountain climber',
    'dead bug', 'bicycle crunch', 'hanging knee raise', 'ab wheel', 'hollow hold',
    'v-up', 'toes to bar', 'dragon flag', 'pallof press'
  ]
};

// BLACKLIST: Exercises that should NEVER appear in certain muscle group workouts
const muscleGroupBlacklist = {
  chest: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'calf', 'split squat', 'bulgarian', 'nordic', 'hip thrust', 'glute'],
  back: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'calf', 'split squat', 'bulgarian', 'nordic', 'hip thrust', 'glute'],
  legs: ['bench press', 'push-up', 'chest fly', 'pull-up', 'row', 'curl', 'tricep', 'lateral raise'],
  shoulders: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'calf', 'split squat', 'bulgarian', 'bench press', 'chest fly'],
  arms: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'calf', 'split squat', 'bulgarian', 'bench press', 'chest fly'],
  core: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'bench press', 'chest fly', 'curl', 'tricep']
};

// Backup exercises for each muscle group
const backupExercises = {
  chest: [
    { name: 'Push-ups', sets: 3, reps: '12-15', weight: 'Bodyweight', description: 'Classic chest exercise targeting pectoralis major.' },
    { name: 'Dumbbell Bench Press', sets: 3, reps: '8-10', weight: 'Moderate', description: 'Effective chest builder using dumbbells.' }
  ],
  back: [
    { name: 'Pull-ups', sets: 3, reps: '8-12', weight: 'Bodyweight', description: 'Excellent lat and rhomboid developer.' },
    { name: 'Bent Over Rows', sets: 3, reps: '8-10', weight: 'Moderate', description: 'Targets middle traps and rhomboids.' }
  ],
  legs: [
    { name: 'Bodyweight Squats', sets: 3, reps: '15-20', weight: 'Bodyweight', description: 'Fundamental leg exercise.' },
    { name: 'Lunges', sets: 3, reps: '10-12', weight: 'Bodyweight', description: 'Unilateral leg strengthener.' }
  ],
  shoulders: [
    { name: 'Pike Push-ups', sets: 3, reps: '8-12', weight: 'Bodyweight', description: 'Bodyweight shoulder press variation.' },
    { name: 'Lateral Raises', sets: 3, reps: '12-15', weight: 'Light', description: 'Isolates lateral deltoids.' }
  ],
  arms: [
    { name: 'Diamond Push-ups', sets: 3, reps: '8-12', weight: 'Bodyweight', description: 'Targets triceps effectively.' },
    { name: 'Pike Curls', sets: 3, reps: '10-12', weight: 'Bodyweight', description: 'Bodyweight bicep exercise.' }
  ]
};

function detectRequestedMusclesFromPrompt(prompt) {
  const promptLower = prompt.toLowerCase();
  const requestedMuscles = [];

  // Direct muscle group mentions
  if (promptLower.includes('chest') || promptLower.includes('pec')) requestedMuscles.push('chest');
  if (promptLower.includes('back') || promptLower.includes('lat')) requestedMuscles.push('back');
  if (promptLower.includes('leg') || promptLower.includes('quad') || promptLower.includes('hamstring') || promptLower.includes('glute')) requestedMuscles.push('legs');
  if (promptLower.includes('shoulder') || promptLower.includes('delt') || promptLower.includes('rotator cuff')) requestedMuscles.push('shoulders');
  if (promptLower.includes('arm') || promptLower.includes('bicep') || promptLower.includes('tricep')) requestedMuscles.push('arms');
  if (promptLower.includes('core') || promptLower.includes('ab')) requestedMuscles.push('core');

  // If "upper body" is mentioned, include chest, back, shoulders, arms
  if (promptLower.includes('upper body') || promptLower.includes('upper-body')) {
    requestedMuscles.push('chest', 'back', 'shoulders', 'arms');
  }

  // If "lower body" is mentioned, only include legs
  if (promptLower.includes('lower body') || promptLower.includes('lower-body')) {
    requestedMuscles.push('legs');
  }

  return [...new Set(requestedMuscles)];
}

// Detect if request is for rehab/recovery/stretching
function detectWorkoutType(prompt) {
  const promptLower = prompt.toLowerCase();
  
  const isRehab = promptLower.includes('rehab') || 
                  promptLower.includes('recovery') || 
                  promptLower.includes('injury') ||
                  promptLower.includes('torn') ||
                  promptLower.includes('hurt') ||
                  promptLower.includes('pain');
  
  const isStretching = promptLower.includes('stretch') || 
                       promptLower.includes('flexibility') || 
                       promptLower.includes('mobility');
  
  const isLowImpact = promptLower.includes('low impact') || 
                      promptLower.includes('gentle') || 
                      promptLower.includes('easy');
  
  return { isRehab, isStretching, isLowImpact };
}

function validateExerciseRelevance(exercise, requestedMuscles) {
  if (!requestedMuscles || requestedMuscles.length === 0) return true;
  
  const exerciseName = exercise.name.toLowerCase();
  
  // FIRST: Check blacklist - if exercise is blacklisted for ANY requested muscle, reject it
  for (const muscle of requestedMuscles) {
    const blacklist = muscleGroupBlacklist[muscle] || [];
    const isBlacklisted = blacklist.some(banned => exerciseName.includes(banned.toLowerCase()));
    if (isBlacklisted) {
      console.log(`❌ BLACKLISTED: "${exercise.name}" is banned for ${muscle} workouts`);
      return false;
    }
  }
  
  // SECOND: Check if exercise belongs to any of the requested muscle groups
  const isRelevant = requestedMuscles.some(muscle => {
    const allowedExercises = muscleGroupExercises[muscle] || [];
    return allowedExercises.some(allowedExercise => 
      exerciseName.includes(allowedExercise.toLowerCase())
    );
  });
  
  if (!isRelevant) {
    console.log(`❌ IRRELEVANT: "${exercise.name}" doesn't match requested muscles: ${requestedMuscles.join(', ')}`);
  }
  
  return isRelevant;
}

function addRelevantExercises(currentExercises, requestedMuscles) {
  const exercises = [...currentExercises];
  
  // Add backup exercises for each requested muscle group
  requestedMuscles.forEach(muscle => {
    const backups = backupExercises[muscle] || [];
    const needed = Math.max(0, 2 - exercises.filter(ex => validateExerciseRelevance(ex, [muscle])).length);
    
    for (let i = 0; i < needed && i < backups.length; i++) {
      exercises.push(backups[i]);
    }
  });
  
  return exercises;
}

app.post('/api/workout', async (req, res) => {
  try {
    const { prompt, preferences } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Detect workout type
    const workoutType = detectWorkoutType(prompt);
    const requestedMuscles = detectRequestedMusclesFromPrompt(prompt);
    
    console.log(`🎯 Workout type: ${JSON.stringify(workoutType)}`);
    console.log(`📋 Target muscles: ${requestedMuscles.join(', ')}`);

    // Build specialized system prompt based on workout type
    let systemPrompt = '';
    
    if (workoutType.isRehab) {
      systemPrompt = `You are an expert physical therapist and rehabilitation specialist. Create a SAFE, GENTLE rehabilitation program.

⚠️ CRITICAL REHABILITATION RULES:
1. SAFETY FIRST - All exercises must be low-intensity and pain-free
2. Focus on MOBILITY, FLEXIBILITY, and GENTLE STRENGTHENING
3. Include proper WARM-UP and COOL-DOWN stretches
4. Emphasize CONTROLLED MOVEMENTS with proper form
5. Start with BODYWEIGHT or VERY LIGHT resistance
6. Include REST periods and recovery guidance

🏥 REHABILITATION EXERCISE TYPES:
- Range of Motion (ROM) exercises
- Gentle stretching (static and dynamic)
- Isometric holds (no movement, just tension)
- Light resistance band work
- Controlled bodyweight movements
- Mobility drills
- Stability exercises

⚠️ WHAT TO AVOID IN REHAB:
- Heavy weights or high resistance
- Explosive or ballistic movements
- Exercises that cause pain
- Overhead pressing (for shoulder injuries)
- Deep squats (for knee injuries)
- High-impact movements

📋 RESPONSE FORMAT - JSON ONLY:
{
  "name": "Rehabilitation Program for [Injury]",
  "muscles": ["affected", "area"],
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 2-3,
      "reps": "10-15" or "Hold 20-30 seconds",
      "weight": "Bodyweight" or "Very Light",
      "description": "Detailed form cues emphasizing SAFETY and CONTROL. Mention: 'Stop if you feel pain.'"
    }
  ],
  "description": "Safe rehabilitation program focusing on recovery, mobility, and gentle strengthening. Always consult with a healthcare professional before starting."
}

⚠️ MEDICAL DISCLAIMER: Include reminder to consult healthcare professional.`;
    } else if (workoutType.isStretching) {
      systemPrompt = `You are an expert flexibility and mobility coach. Create a comprehensive STRETCHING and MOBILITY routine.

🧘 STRETCHING PROGRAM RULES:
1. Include both STATIC and DYNAMIC stretches
2. Focus on FULL BODY or TARGETED areas as requested
3. Emphasize PROPER BREATHING and RELAXATION
4. Include hold times (20-30 seconds for static, 10-15 reps for dynamic)
5. Progress from gentle to deeper stretches
6. Include mobility drills for joint health

✅ STRETCHING EXERCISE TYPES:
- Static stretches (hold position)
- Dynamic stretches (controlled movement)
- PNF stretching (contract-relax)
- Mobility drills (joint circles, flows)
- Foam rolling suggestions
- Yoga-inspired poses

📋 RESPONSE FORMAT - JSON ONLY:
{
  "name": "Flexibility & Mobility Routine",
  "muscles": ["targeted", "areas"],
  "exercises": [
    {
      "name": "Stretch Name",
      "sets": 2-3,
      "reps": "Hold 20-30 seconds" or "10-15 reps",
      "weight": "Bodyweight",
      "description": "Detailed instructions on proper form, breathing, and progression. Mention: 'Stretch to mild tension, never pain.'"
    }
  ],
  "description": "Comprehensive stretching routine to improve flexibility, mobility, and recovery."
}`;
    } else {
      // Standard workout prompt (existing)
      systemPrompt = `You are an expert fitness coach. You MUST create workouts that ONLY target the specific muscles requested.

⚠️ CRITICAL RULES - VIOLATION WILL RESULT IN REJECTION:
1. If user asks for "chest and back" - ONLY include chest and back exercises
2. If user asks for "chest" - ONLY chest exercises (bench press, push-ups, flyes, dips)
3. If user asks for "back" - ONLY back exercises (pull-ups, rows, lat pulldowns)
4. If user asks for "7 exercises" - YOU MUST PROVIDE EXACTLY 7 EXERCISES
5. If user asks for "5 exercises" - YOU MUST PROVIDE EXACTLY 5 EXERCISES
6. NEVER EVER add leg exercises unless legs are specifically mentioned
7. NEVER EVER add shoulder exercises unless shoulders are specifically mentioned
8. NEVER add random exercises that don't directly target requested muscles

🔢 EXERCISE COUNT RULES:
- User specifies number → Provide EXACTLY that many exercises
- No number specified → Provide 5-6 exercises
- "Few exercises" → Provide 3-4 exercises
- "Many exercises" → Provide 7-8 exercises
- NEVER provide fewer exercises than requested

🚫 ABSOLUTELY FORBIDDEN COMBINATIONS:
- Chest/Back workout → NO squats, lunges, leg press, split squats, bulgarian split squats
- Upper body workout → NO leg exercises of any kind
- Leg workout → NO bench press, push-ups, pull-ups, rows, curls
- Arms workout → NO leg exercises, NO chest exercises
- Shoulder workout → NO leg exercises, NO chest exercises (unless specifically requested)

✅ MUSCLE GROUP EXERCISE LISTS (USE ONLY THESE):
CHEST ONLY: Bench press, push-ups, chest flyes, incline press, decline press, dips, chest press, cable crossovers, dumbbell press
BACK ONLY: Pull-ups, rows, lat pulldowns, deadlifts, face pulls, reverse flyes, cable rows, t-bar rows, seal rows
LEGS ONLY: Squats, lunges, leg press, leg curls, leg extensions, calf raises, hip thrusts, step-ups, bulgarian split squats, romanian deadlifts
SHOULDERS ONLY: Overhead press, lateral raises, front raises, rear delt flyes, upright rows, arnold press, pike push-ups, face pulls
ARMS ONLY: Curls, tricep extensions, hammer curls, close-grip bench press, tricep dips, skull crushers, cable curls, concentration curls
CORE ONLY: Planks, crunches, leg raises, russian twists, mountain climbers, ab wheel, dead bugs, hollow holds

🔍 VALIDATION CHECKLIST (CHECK BEFORE RESPONDING):
□ Does EVERY exercise directly target the requested muscle group?
□ Did I provide the EXACT number of exercises requested?
□ Are there ANY leg exercises in an upper body workout? (If YES, REMOVE THEM)
□ Are there ANY upper body exercises in a leg workout? (If YES, REMOVE THEM)
□ Did I accidentally add exercises from a different muscle group? (If YES, REMOVE THEM)
□ Did I exclude the exercises the user specifically said to avoid?

📋 RESPONSE FORMAT - JSON ONLY (NO MARKDOWN, NO EXPLANATIONS):
{
  "name": "Specific Muscle Group Workout",
  "muscles": ["only", "requested", "muscles"],
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": "8-10", 
      "weight": "Moderate",
      "description": "Form instructions focusing on target muscles"
    }
  ],
  "description": "Brief overview of ONLY the requested muscles"
}

⚠️ FINAL CHECK: Before responding, verify:
1. EVERY exercise targets ONLY the requested muscles
2. You provided the EXACT number of exercises requested
3. You excluded any exercises the user said to avoid
4. Remove ANY exercise that doesn't match.`;
    }

    const userPrompt = preferences 
      ? `${systemPrompt}\n\n🔧 USER PREFERENCES/LIMITATIONS:\n${preferences}\n\n💬 USER REQUEST: ${prompt}\n\n⚠️ REMEMBER: ONLY include exercises for the specific muscles mentioned in the request above! NO leg exercises in upper body workouts! NO upper body exercises in leg workouts!`
      : `${systemPrompt}\n\n💬 USER REQUEST: ${prompt}\n\n⚠️ REMEMBER: ONLY include exercises for the specific muscles mentioned in the request above! NO leg exercises in upper body workouts! NO upper body exercises in leg workouts!`;

    // Extract number of exercises requested
    const exerciseCountMatch = prompt.match(/(\d+)\s*exercise/i);
    const requestedCount = exerciseCountMatch ? parseInt(exerciseCountMatch[1]) : 5;
    
    // Adjust token limit based on requested exercises (each exercise needs ~100-150 tokens)
    const tokenLimit = Math.max(800, requestedCount * 150 + 300);
    
    console.log(`📊 Requested ${requestedCount} exercises, setting token limit to ${tokenLimit}`);
    
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:latest',
        prompt: userPrompt,
        stream: false,
        options: {
          temperature: 0.2, // Slightly higher for more variety
          top_p: 0.9,
          repeat_penalty: 1.2,
          num_predict: tokenLimit // Dynamic based on request
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract JSON from response with better error handling
    try {
      let jsonResponse = data.response.trim();
      
      // Find JSON block
      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = jsonMatch[0];
      }
      
      // Clean up common AI response issues
      jsonResponse = jsonResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^\s*```[\s\S]*?```\s*/g, '')
        .trim();
      
      const workout = JSON.parse(jsonResponse);
      
      // Validate required fields
      if (!workout.name || !workout.exercises || !Array.isArray(workout.exercises)) {
        throw new Error('Invalid workout structure');
      }
      
      // POST-PROCESSING: Aggressively remove exercises that don't match requested muscle groups
      const requestedMuscles = detectRequestedMusclesFromPrompt(prompt);
      console.log(`\n🎯 Requested muscles: ${requestedMuscles.join(', ')}`);
      console.log(`📝 AI generated ${workout.exercises.length} exercises`);
      
      if (requestedMuscles.length > 0) {
        const originalCount = workout.exercises.length;
        const originalExercises = workout.exercises.map(e => e.name).join(', ');
        
        // AGGRESSIVE FILTERING: Remove any exercise that doesn't match
        workout.exercises = workout.exercises.filter(exercise => {
          const isRelevant = validateExerciseRelevance(exercise, requestedMuscles);
          if (!isRelevant) {
            console.log(`🗑️  Removing irrelevant exercise: ${exercise.name}`);
          }
          return isRelevant;
        });
        
        const removedCount = originalCount - workout.exercises.length;
        if (removedCount > 0) {
          console.log(`\n⚠️  FILTERED OUT ${removedCount} irrelevant exercises`);
          console.log(`Original: ${originalExercises}`);
          console.log(`Filtered: ${workout.exercises.map(e => e.name).join(', ')}`);
        }
        
        // If we filtered out too many exercises, add appropriate ones from backup
        if (workout.exercises.length < 3) {
          console.log(`⚠️  Too few exercises remaining (${workout.exercises.length}), adding backups...`);
          workout.exercises = addRelevantExercises(workout.exercises, requestedMuscles);
        }
        
        // Update workout muscles to match what we actually have
        workout.muscles = requestedMuscles;
      }
      
      console.log(`✅ Final workout: ${workout.exercises.length} exercises for ${requestedMuscles.join(', ')}\n`);
      
      res.json(workout);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw AI Response:', data.response);
      res.status(500).json({ 
        error: 'Failed to parse AI response', 
        response: data.response,
        parseError: parseError.message 
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate workout', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Workout API Server running on http://localhost:${PORT}`);
  console.log(`📡 Connecting to remote Ollama at ${OLLAMA_URL}`);
  console.log(`🚀 Using model: llama3.1:latest (GPU accelerated)`);
  console.log(`🌐 Remote server: api.databi.io → 192.168.2.200:11434`);
});
