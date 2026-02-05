const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({ region: process.env.REGION || 'us-east-1' });

// Ultra-strict muscle group exercise validation
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

function detectRequestedMuscles(prompt) {
  const promptLower = prompt.toLowerCase();
  const requestedMuscles = [];

  if (promptLower.includes('chest') || promptLower.includes('pec')) requestedMuscles.push('chest');
  if (promptLower.includes('back') || promptLower.includes('lat')) requestedMuscles.push('back');
  if (promptLower.includes('leg') || promptLower.includes('quad') || promptLower.includes('hamstring') || promptLower.includes('glute')) requestedMuscles.push('legs');
  if (promptLower.includes('shoulder') || promptLower.includes('delt')) requestedMuscles.push('shoulders');
  if (promptLower.includes('arm') || promptLower.includes('bicep') || promptLower.includes('tricep')) requestedMuscles.push('arms');
  if (promptLower.includes('core') || promptLower.includes('ab')) requestedMuscles.push('core');

  if (promptLower.includes('upper body') || promptLower.includes('upper-body')) {
    requestedMuscles.push('chest', 'back', 'shoulders', 'arms');
  }

  if (promptLower.includes('lower body') || promptLower.includes('lower-body')) {
    requestedMuscles.push('legs');
  }

  return [...new Set(requestedMuscles)];
}

function validateExerciseRelevance(exercise, requestedMuscles) {
  if (!requestedMuscles || requestedMuscles.length === 0) return true;
  
  const exerciseName = exercise.name.toLowerCase();
  
  // Check blacklist first
  for (const muscle of requestedMuscles) {
    const blacklist = muscleGroupBlacklist[muscle] || [];
    const isBlacklisted = blacklist.some(banned => exerciseName.includes(banned.toLowerCase()));
    if (isBlacklisted) {
      console.log(`❌ BLACKLISTED: "${exercise.name}" is banned for ${muscle} workouts`);
      return false;
    }
  }
  
  // Check if relevant
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

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { prompt, preferences } = body;

    console.log(`🎯 Generating workout for: "${prompt}"`);
    const requestedMuscles = detectRequestedMuscles(prompt);
    console.log(`📋 Detected muscle groups: ${requestedMuscles.join(', ')}`);

    // Build ultra-strict prompt for Claude
    const systemPrompt = `You are an expert fitness coach. You MUST create workouts that ONLY target the specific muscles requested.

⚠️ CRITICAL RULES - VIOLATION WILL RESULT IN REJECTION:
1. If user asks for "chest and back" - ONLY include chest and back exercises
2. If user asks for "chest" - ONLY chest exercises (bench press, push-ups, flyes, dips)
3. If user asks for "back" - ONLY back exercises (pull-ups, rows, lat pulldowns)
4. NEVER EVER add leg exercises unless legs are specifically mentioned
5. NEVER EVER add shoulder exercises unless shoulders are specifically mentioned
6. NEVER add random exercises that don't directly target requested muscles

🚫 ABSOLUTELY FORBIDDEN COMBINATIONS:
- Chest/Back workout → NO squats, lunges, leg press, split squats, bulgarian split squats
- Upper body workout → NO leg exercises of any kind
- Leg workout → NO bench press, push-ups, pull-ups, rows, curls
- Arms workout → NO leg exercises, NO chest exercises

✅ MUSCLE GROUP EXERCISE LISTS (USE ONLY THESE):
CHEST ONLY: Bench press, push-ups, chest flyes, incline press, decline press, dips, chest press, cable crossovers
BACK ONLY: Pull-ups, rows, lat pulldowns, deadlifts, face pulls, reverse flyes, cable rows, t-bar rows
LEGS ONLY: Squats, lunges, leg press, leg curls, leg extensions, calf raises, hip thrusts, step-ups, bulgarian split squats
SHOULDERS ONLY: Overhead press, lateral raises, front raises, rear delt flyes, upright rows, arnold press
ARMS ONLY: Curls, tricep extensions, hammer curls, close-grip bench press, tricep dips, skull crushers
CORE ONLY: Planks, crunches, leg raises, russian twists, mountain climbers, ab wheel

RESPONSE FORMAT - JSON ONLY (NO MARKDOWN):
{
  "name": "Specific Muscle Group Workout",
  "muscles": ["only", "requested", "muscles"],
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": "8-10",
      "weight": "Moderate",
      "description": "Form instructions"
    }
  ],
  "description": "Brief overview"
}`;

    const userMessage = preferences 
      ? `${systemPrompt}\n\nUSER PREFERENCES: ${preferences}\n\nUSER REQUEST: ${prompt}`
      : `${systemPrompt}\n\nUSER REQUEST: ${prompt}`;

    // Call Claude Sonnet 4.5 via Bedrock
    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract workout from Claude's response
    let workoutText = responseBody.content[0].text;
    
    // Clean up response
    workoutText = workoutText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = workoutText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      workoutText = jsonMatch[0];
    }
    
    let workout = JSON.parse(workoutText);
    
    // AGGRESSIVE POST-PROCESSING FILTER
    if (workout.exercises && requestedMuscles.length > 0) {
      const originalCount = workout.exercises.length;
      
      workout.exercises = workout.exercises.filter(exercise => 
        validateExerciseRelevance(exercise, requestedMuscles)
      );
      
      const removedCount = originalCount - workout.exercises.length;
      if (removedCount > 0) {
        console.log(`⚠️  FILTERED OUT ${removedCount} irrelevant exercises`);
      }
      
      workout.muscles = requestedMuscles;
    }
    
    console.log(`✅ Final workout: ${workout.exercises.length} exercises for ${requestedMuscles.join(', ')}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(workout),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to generate workout',
        message: error.message 
      }),
    };
  }
};