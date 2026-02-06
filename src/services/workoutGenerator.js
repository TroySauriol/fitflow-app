import { exerciseDatabase, exclusionPatterns, specificMuscleKeywords, equipmentCategories } from './exerciseDatabase.js';

// Enhanced AI prompt engineering with strict muscle group focus
function buildEnhancedPrompt(userPrompt, preferences = {}) {
  let systemPrompt = `You are an expert fitness coach. You MUST create workouts that ONLY target the specific muscles requested by the user.

CRITICAL MUSCLE GROUP RULES:
1. ONLY include exercises that directly target the requested muscle groups
2. If user asks for "chest and back" - ONLY chest and back exercises
3. If user asks for "arms" - ONLY arm exercises (biceps, triceps, forearms)
4. NEVER add leg exercises unless specifically requested
5. NEVER add shoulder exercises unless specifically requested
6. NEVER add core exercises unless specifically requested

MUSCLE GROUP EXERCISE MAPPING:
CHEST: Bench press, push-ups, chest flyes, incline press, decline press, dips
BACK: Pull-ups, rows, lat pulldowns, deadlifts, face pulls, reverse flyes
LEGS: Squats, lunges, leg press, leg curls, calf raises, hip thrusts
SHOULDERS: Overhead press, lateral raises, front raises, rear delt flyes
ARMS: Curls, tricep extensions, hammer curls, close-grip bench, dips
CORE: Planks, crunches, leg raises, Russian twists, mountain climbers

STRICT VALIDATION:
- Chest workout = ONLY chest exercises
- Back workout = ONLY back exercises  
- Chest + Back = ONLY chest AND back exercises
- Arms workout = ONLY bicep/tricep exercises

NEVER INCLUDE:
- Leg exercises in upper body workouts
- Upper body exercises in leg workouts
- Random exercises that don't match the target

FORMAT: Respond ONLY with valid JSON:
{
  "name": "Specific Muscle Group Workout Name",
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
  "description": "Brief overview focusing ONLY on requested muscles"
}`;

  // Add exclusion rules
  if (preferences.excludedExercises && preferences.excludedExercises.length > 0) {
    systemPrompt += `\n\nEXCLUDED EXERCISES - NEVER INCLUDE:
${preferences.excludedExercises.map(ex => `- ${ex} (and all variations)`).join('\n')}`;
  }

  // Add injury considerations
  if (preferences.injuries && preferences.injuries.length > 0) {
    systemPrompt += `\n\nINJURY LIMITATIONS:
${preferences.injuries.map(injury => `- ${injury}: Avoid exercises that stress this area`).join('\n')}`;
  }

  // Add equipment limitations
  if (preferences.availableEquipment && preferences.availableEquipment.length > 0) {
    systemPrompt += `\n\nAVAILABLE EQUIPMENT ONLY:
${preferences.availableEquipment.join(', ')}`;
  }

  systemPrompt += `\n\nUSER REQUEST: ${userPrompt}

REMEMBER: ONLY include exercises that target the specific muscles mentioned in the request. NO random additions!`;

  return systemPrompt;
}

// Strict muscle group validation with blacklist
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
    'military press', 'bradford press', 'bus driver'
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

// Blacklist: Exercises that should NEVER appear in certain muscle group workouts
const muscleGroupBlacklist = {
  chest: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'calf', 'split squat', 'bulgarian', 'nordic', 'hip thrust', 'glute'],
  back: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'calf', 'split squat', 'bulgarian', 'nordic', 'hip thrust', 'glute'],
  legs: ['bench press', 'push-up', 'chest fly', 'pull-up', 'row', 'curl', 'tricep', 'lateral raise'],
  shoulders: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'calf', 'split squat', 'bulgarian', 'bench press', 'chest fly'],
  arms: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'calf', 'split squat', 'bulgarian', 'bench press', 'chest fly'],
  core: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'bench press', 'chest fly', 'curl', 'tricep']
};

// Function to detect requested muscle groups from user input
function detectRequestedMuscles(userPrompt) {
  const prompt = userPrompt.toLowerCase();
  const requestedMuscles = [];

  // Direct muscle group mentions
  if (prompt.includes('chest') || prompt.includes('pec')) requestedMuscles.push('chest');
  if (prompt.includes('back') || prompt.includes('lat')) requestedMuscles.push('back');
  if (prompt.includes('leg') || prompt.includes('quad') || prompt.includes('hamstring') || prompt.includes('glute')) requestedMuscles.push('legs');
  if (prompt.includes('shoulder') || prompt.includes('delt')) requestedMuscles.push('shoulders');
  if (prompt.includes('arm') || prompt.includes('bicep') || prompt.includes('tricep')) requestedMuscles.push('arms');
  if (prompt.includes('core') || prompt.includes('ab')) requestedMuscles.push('core');

  // Upper body = chest, back, shoulders, arms (NO LEGS)
  if (prompt.includes('upper body') || prompt.includes('upper-body')) {
    requestedMuscles.push('chest', 'back', 'shoulders', 'arms');
  }

  // Lower body = legs only
  if (prompt.includes('lower body') || prompt.includes('lower-body')) {
    requestedMuscles.push('legs');
  }

  // If no specific muscles mentioned, try to infer from exercise names
  if (requestedMuscles.length === 0) {
    if (prompt.includes('bench') || prompt.includes('push')) requestedMuscles.push('chest');
    if (prompt.includes('pull') || prompt.includes('row')) requestedMuscles.push('back');
    if (prompt.includes('squat') || prompt.includes('lunge')) requestedMuscles.push('legs');
    if (prompt.includes('press') && !prompt.includes('bench')) requestedMuscles.push('shoulders');
    if (prompt.includes('curl')) requestedMuscles.push('arms');
  }

  return [...new Set(requestedMuscles)]; // Remove duplicates
}

// Strict exercise validation - only allow exercises that match requested muscles
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

// Enhanced exercise filtering with muscle group validation
function enhancedExerciseFilter(exercises, preferences, userPrompt) {
  let filteredExercises = [...exercises];

  // Step 1: Detect what muscles were actually requested
  const requestedMuscles = detectRequestedMuscles(userPrompt);
  
  // Step 2: Filter out exercises that don't match requested muscle groups
  if (requestedMuscles.length > 0) {
    filteredExercises = filteredExercises.filter(exercise => 
      validateExerciseRelevance(exercise, requestedMuscles)
    );
  }

  // Step 3: Apply existing filters (exclusions, equipment, injuries)
  if (preferences.excludedExercises && preferences.excludedExercises.length > 0) {
    filteredExercises = filteredExercises.filter(exercise => {
      const exerciseName = exercise.name.toLowerCase();
      
      return !preferences.excludedExercises.some(excluded => {
        const excludedLower = excluded.toLowerCase();
        
        if (exerciseName.includes(excludedLower)) return true;
        
        if (exclusionPatterns[excludedLower]) {
          return exclusionPatterns[excludedLower].some(pattern => 
            exerciseName.includes(pattern.toLowerCase())
          );
        }
        
        return false;
      });
    });
  }

  // Step 4: Equipment filtering
  if (preferences.availableEquipment && preferences.availableEquipment.length > 0) {
    filteredExercises = filteredExercises.filter(exercise => {
      if (!exercise.equipment) return true;
      
      return exercise.equipment.some(equipment => 
        preferences.availableEquipment.some(available => 
          available.toLowerCase().includes(equipment.toLowerCase()) ||
          equipment.toLowerCase().includes(available.toLowerCase())
        )
      );
    });
  }

  // Step 5: Injury considerations
  if (preferences.injuries && preferences.injuries.length > 0) {
    const injuryExclusions = {
      'lower back pain': ['deadlift', 'squat', 'row', 'good morning'],
      'knee pain': ['squat', 'lunge', 'leg press', 'jump'],
      'shoulder pain': ['overhead press', 'lateral raise', 'bench press'],
      'wrist pain': ['push-up', 'plank', 'wrist curl'],
      'elbow pain': ['curl', 'extension', 'close grip'],
      'hip pain': ['squat', 'lunge', 'hip thrust'],
      'neck pain': ['shrug', 'upright row', 'behind neck'],
      'ankle pain': ['calf raise', 'jump', 'lunge']
    };

    filteredExercises = filteredExercises.filter(exercise => {
      const exerciseName = exercise.name.toLowerCase();
      
      return !preferences.injuries.some(injury => {
        const injuryLower = injury.toLowerCase();
        const exclusions = injuryExclusions[injuryLower] || [];
        
        return exclusions.some(exclusion => 
          exerciseName.includes(exclusion.toLowerCase())
        );
      });
    });
  }

  return filteredExercises;
}

// Smart exercise selection based on user request
function selectExercisesForRequest(userPrompt, preferences = {}) {
  const prompt = userPrompt.toLowerCase();
  let selectedExercises = [];

  // Check for specific muscle requests
  Object.entries(specificMuscleKeywords).forEach(([muscle, keywords]) => {
    if (keywords.some(keyword => prompt.includes(keyword.toLowerCase()))) {
      // Find exercises that target this specific muscle
      Object.values(exerciseDatabase).forEach(muscleGroup => {
        Object.values(muscleGroup).forEach(exercises => {
          if (Array.isArray(exercises)) {
            exercises.forEach(exercise => {
              if (exercise.primaryMuscles && 
                  exercise.primaryMuscles.some(m => m.toLowerCase().includes(muscle.toLowerCase()))) {
                selectedExercises.push(exercise);
              }
            });
          }
        });
      });
    }
  });

  // If no specific muscles found, use general muscle group detection
  if (selectedExercises.length === 0) {
    const muscleKeywords = {
      chest: ['chest', 'pec', 'bench'],
      back: ['back', 'lat', 'row', 'pull'],
      legs: ['leg', 'quad', 'hamstring', 'glute', 'squat'],
      shoulders: ['shoulder', 'delt', 'press'],
      arms: ['arm', 'bicep', 'tricep', 'curl'],
      core: ['core', 'ab', 'abs', 'plank']
    };

    Object.entries(muscleKeywords).forEach(([muscle, keywords]) => {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        if (exerciseDatabase[muscle]) {
          Object.values(exerciseDatabase[muscle]).forEach(exercises => {
            if (Array.isArray(exercises)) {
              selectedExercises.push(...exercises);
            }
          });
        }
      }
    });
  }

  // Apply filtering
  selectedExercises = enhancedExerciseFilter(selectedExercises, preferences, userPrompt);

  // Limit to reasonable number
  return selectedExercises.slice(0, 8);
}

// Enhanced fallback function
function generateEnhancedFallback(userPrompt, preferences = {}) {
  const selectedExercises = selectExercisesForRequest(userPrompt, preferences);
  
  if (selectedExercises.length === 0) {
    // Default to a basic full-body workout if nothing matches
    const basicExercises = [
      exerciseDatabase.chest.primary[3], // Push-ups
      exerciseDatabase.back.primary[1],  // Pull-ups
      exerciseDatabase.legs.quadriceps[1], // Bulgarian Split Squats
      exerciseDatabase.shoulders.lateral[0] // Lateral Raises
    ].filter(ex => ex); // Remove undefined exercises
    
    selectedExercises.push(...basicExercises);
  }

  // Determine workout name based on targeted muscles
  const targetedMuscles = [...new Set(selectedExercises.flatMap(ex => ex.primaryMuscles || []))];
  const workoutName = targetedMuscles.length > 0 
    ? `${targetedMuscles.slice(0, 2).map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' & ')} Focused Workout`
    : 'Custom Workout';

  return {
    name: workoutName,
    exercises: selectedExercises,
    muscles: targetedMuscles,
    description: `Targeted workout focusing on ${targetedMuscles.join(', ')} with your specified preferences.`
  };
}

// Build preference context for AI
function buildPreferenceContext(preferences) {
  let context = '';
  
  if (preferences.injuries && preferences.injuries.length > 0) {
    context += `\nINJURY LIMITATIONS: ${preferences.injuries.join(', ')}. Avoid exercises that stress these areas.`;
  }
  
  if (preferences.excludedExercises && preferences.excludedExercises.length > 0) {
    context += `\nEXCLUDED EXERCISES: ${preferences.excludedExercises.join(', ')}. NEVER include these or their variations.`;
  }
  
  if (preferences.availableEquipment && preferences.availableEquipment.length > 0) {
    context += `\nAVAILABLE EQUIPMENT: ${preferences.availableEquipment.join(', ')}. Only use exercises with this equipment.`;
  }
  
  return context;
}

// Detect workout type (rehab, stretching, cardio, etc.)
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
  
  const isCardio = promptLower.includes('running') ||
                   promptLower.includes('run') ||
                   promptLower.includes('5k') ||
                   promptLower.includes('10k') ||
                   promptLower.includes('marathon') ||
                   promptLower.includes('half marathon') ||
                   promptLower.includes('training plan') ||
                   promptLower.includes('race') ||
                   promptLower.includes('cardio') ||
                   promptLower.includes('endurance');
  
  return { isRehab, isStretching, isLowImpact, isCardio };
}

// Build specialized system prompt based on workout type
function buildSystemPrompt(workoutType, userPrompt, preferences) {
  let systemPrompt = '';
  
  if (workoutType.isCardio) {
    systemPrompt = `You are an expert running coach and endurance training specialist. Create a DETAILED, PROGRESSIVE training plan.

🏃 CARDIO TRAINING PLAN RULES:
1. Assess current fitness level from user's description
2. Create a WEEK-BY-WEEK progressive plan
3. Include specific distances, paces, and workout types
4. Balance hard days with easy/recovery days
5. Include rest days for recovery
6. Build volume gradually (10% rule)
7. Include taper period before race day

📅 TRAINING PLAN STRUCTURE:
- Easy Runs: Conversational pace, aerobic base building
- Tempo Runs: Comfortably hard pace, lactate threshold
- Interval Training: Short fast repeats with recovery
- Long Runs: Build endurance, increase weekly
- Recovery Runs: Very easy pace, active recovery
- Rest Days: Complete rest or cross-training

🎯 PLAN COMPONENTS:
- Weekly mileage/distance targets
- Specific workout descriptions
- Pace guidelines (easy, moderate, hard)
- Recovery recommendations
- Race day strategy

📋 RESPONSE FORMAT - JSON ONLY:
{
  "name": "Training Plan Name (e.g., '4-Week 5K Training Plan')",
  "type": "cardio_plan",
  "goal": "Race distance and target time",
  "duration": "Number of weeks",
  "weeks": [
    {
      "week": 1,
      "focus": "Base building / Speed work / Taper",
      "totalDistance": "Weekly total in km or miles",
      "workouts": [
        {
          "day": "Monday",
          "type": "Easy Run / Tempo / Intervals / Long Run / Rest",
          "distance": "5K",
          "pace": "Easy / Moderate / Hard",
          "description": "Detailed workout instructions",
          "notes": "Tips and reminders"
        }
      ]
    }
  ],
  "tips": ["Race day tips", "Nutrition advice", "Recovery tips"],
  "description": "Overview of the training plan philosophy"
}

⚠️ IMPORTANT:
- Be specific with distances and paces
- Explain WHY each workout matters
- Include warm-up and cool-down
- Mention injury prevention
- Provide motivation and encouragement`;
  } else if (workoutType.isRehab) {
    systemPrompt = `You are an expert physical therapist. Create a SAFE, GENTLE rehabilitation program.

⚠️ CRITICAL REHABILITATION RULES:
1. SAFETY FIRST - All exercises must be low-intensity and pain-free
2. Focus on MOBILITY, FLEXIBILITY, and GENTLE STRENGTHENING
3. Include proper WARM-UP and COOL-DOWN stretches
4. Emphasize CONTROLLED MOVEMENTS with proper form
5. Start with BODYWEIGHT or VERY LIGHT resistance

🏥 REHABILITATION EXERCISE TYPES:
- Range of Motion (ROM) exercises
- Gentle stretching (static and dynamic)
- Isometric holds (no movement, just tension)
- Light resistance band work
- Controlled bodyweight movements

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
      "description": "Detailed form cues emphasizing SAFETY. Mention: 'Stop if you feel pain.'"
    }
  ],
  "description": "Safe rehabilitation program. Always consult with a healthcare professional."
}`;
  } else if (workoutType.isStretching) {
    systemPrompt = `You are an expert flexibility coach. Create a STRETCHING and MOBILITY routine.

🧘 STRETCHING PROGRAM RULES:
1. Include both STATIC and DYNAMIC stretches
2. Focus on FULL BODY or TARGETED areas as requested
3. Emphasize PROPER BREATHING and RELAXATION
4. Include hold times (20-30 seconds for static)

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
      "description": "Detailed instructions. Mention: 'Stretch to mild tension, never pain.'"
    }
  ],
  "description": "Comprehensive stretching routine to improve flexibility and mobility."
}`;
  } else {
    systemPrompt = buildEnhancedPrompt(userPrompt, preferences);
  }
  
  return systemPrompt;
}

// Main enhanced function
export async function generateWorkout(userPrompt, preferences = {}) {
  try {
    console.log(`🎯 Generating workout for: "${userPrompt}"`);
    const requestedMuscles = detectRequestedMuscles(userPrompt);
    const workoutType = detectWorkoutType(userPrompt);
    console.log(`📋 Detected muscle groups: ${requestedMuscles.join(', ')}`);
    console.log(`🎯 Workout type: ${JSON.stringify(workoutType)}`);
    
    // Detect requested exercise count
    const exerciseCountMatch = userPrompt.match(/(\d+)\s*exercise/i);
    const requestedCount = exerciseCountMatch ? parseInt(exerciseCountMatch[1]) : 5;
    const tokenLimit = Math.max(800, requestedCount * 150 + 300);
    
    // Build specialized prompt
    const systemPrompt = buildSystemPrompt(workoutType, userPrompt, preferences);
    const fullPrompt = preferences 
      ? `${systemPrompt}\n\n🔧 USER PREFERENCES:\n${buildPreferenceContext(preferences)}\n\n💬 USER REQUEST: ${userPrompt}`
      : `${systemPrompt}\n\n💬 USER REQUEST: ${userPrompt}`;
    
    // Try to call Ollama directly (works on AWS and locally)
    const OLLAMA_URL = 'https://api.databi.io/api/generate';
    
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:latest',
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.2,
          top_p: 0.9,
          repeat_penalty: 1.2,
          num_predict: tokenLimit
        }
      })
    });

    if (!response.ok) {
      throw new Error('Ollama server unavailable');
    }

    const data = await response.json();
    
    // Parse JSON response
    let jsonResponse = data.response.trim();
    const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonResponse = jsonMatch[0];
    }
    
    jsonResponse = jsonResponse
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    let workout = JSON.parse(jsonResponse);
    
    console.log(`📝 AI returned ${workout.exercises?.length || 0} exercises`);
    
    // AGGRESSIVE CLIENT-SIDE FILTERING - Double-check everything
    if (workout.exercises && requestedMuscles.length > 0) {
      const originalCount = workout.exercises.length;
      const originalExercises = workout.exercises.map(e => e.name);
      
      // Filter out irrelevant exercises
      workout.exercises = workout.exercises.filter(exercise => 
        validateExerciseRelevance(exercise, requestedMuscles)
      );
      
      // Apply user preferences filtering
      workout.exercises = enhancedExerciseFilter(workout.exercises, preferences, userPrompt);
      
      const removedCount = originalCount - workout.exercises.length;
      if (removedCount > 0) {
        console.log(`⚠️  CLIENT-SIDE: Filtered out ${removedCount} more irrelevant exercises`);
        console.log(`   Original: ${originalExercises.join(', ')}`);
        console.log(`   Final: ${workout.exercises.map(e => e.name).join(', ')}`);
      }
      
      // If too few exercises remain, use fallback
      if (workout.exercises.length < 3) {
        console.log(`⚠️  Too few exercises (${workout.exercises.length}), using fallback generator`);
        return generateEnhancedFallback(userPrompt, preferences);
      }
    }
    
    console.log(`✅ Final workout: ${workout.exercises.length} exercises\n`);
    return workout;
  } catch (error) {
    console.warn('AI unavailable, using enhanced fallback:', error.message);
    // Use enhanced fallback
    return generateEnhancedFallback(userPrompt, preferences);
  }
}
