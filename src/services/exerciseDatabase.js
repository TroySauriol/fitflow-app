// Comprehensive exercise database with detailed muscle targeting
export const exerciseDatabase = {
  // Chest exercises
  chest: {
    primary: [
      {
        name: 'Barbell Bench Press',
        primaryMuscles: ['pectoralis major'],
        secondaryMuscles: ['anterior deltoid', 'triceps'],
        equipment: ['barbell', 'bench'],
        difficulty: 'intermediate',
        sets: 4, reps: '6-8', weight: 'Heavy',
        description: 'Lie flat on a bench with feet firmly on the floor. Grip the barbell slightly wider than shoulder-width. Lower the bar to your chest in a controlled manner, then push it back up explosively.'
      },
      {
        name: 'Incline Dumbbell Press',
        primaryMuscles: ['upper pectoralis major'],
        secondaryMuscles: ['anterior deltoid', 'triceps'],
        equipment: ['dumbbells', 'incline bench'],
        difficulty: 'intermediate',
        sets: 3, reps: '8-10', weight: 'Moderate',
        description: 'Set the bench to a 45-degree angle. Hold dumbbells at shoulder height with palms facing forward. Press upward and slightly forward until arms are nearly extended.'
      },
      {
        name: 'Decline Barbell Press',
        primaryMuscles: ['lower pectoralis major'],
        secondaryMuscles: ['anterior deltoid', 'triceps'],
        equipment: ['barbell', 'decline bench'],
        difficulty: 'intermediate',
        sets: 3, reps: '8-10', weight: 'Heavy',
        description: 'Set bench to 15-30 degree decline. Secure feet and grip bar slightly wider than shoulders. Lower to lower chest, press back up focusing on lower pec contraction.'
      },
      {
        name: 'Dumbbell Flyes',
        primaryMuscles: ['pectoralis major'],
        secondaryMuscles: ['anterior deltoid'],
        equipment: ['dumbbells', 'bench'],
        difficulty: 'beginner',
        sets: 3, reps: '10-12', weight: 'Light',
        description: 'Lie on a flat bench holding dumbbells above your chest with a slight bend in your elbows. Lower in an arc motion to the sides, then bring back up.'
      },
      {
        name: 'Cable Crossover',
        primaryMuscles: ['pectoralis major', 'inner chest'],
        secondaryMuscles: ['anterior deltoid'],
        equipment: ['cable machine'],
        difficulty: 'intermediate',
        sets: 3, reps: '12-15', weight: 'Moderate',
        description: 'Stand between cable towers with handles at shoulder height. Step forward, lean slightly, and bring handles together in front of chest with slight elbow bend. Squeeze at peak contraction.'
      },
      {
        name: 'Incline Cable Flyes',
        primaryMuscles: ['upper pectoralis major'],
        secondaryMuscles: ['anterior deltoid'],
        equipment: ['cable machine', 'incline bench'],
        difficulty: 'intermediate',
        sets: 3, reps: '12-15', weight: 'Moderate',
        description: 'Set bench to 30-45 degrees between low cable pulleys. Grab handles and bring them together above chest with slight elbow bend, focusing on upper chest squeeze.'
      },
      {
        name: 'Push-ups',
        primaryMuscles: ['pectoralis major'],
        secondaryMuscles: ['anterior deltoid', 'triceps', 'core'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        sets: 3, reps: '12-15', weight: 'Bodyweight',
        description: 'Start in a plank position with hands slightly wider than shoulder-width. Lower until chest nearly touches floor, then push back up.'
      },
      {
        name: 'Dumbbell Pullover',
        primaryMuscles: ['pectoralis major', 'serratus anterior'],
        secondaryMuscles: ['latissimus dorsi', 'triceps'],
        equipment: ['dumbbell', 'bench'],
        difficulty: 'intermediate',
        sets: 3, reps: '10-12', weight: 'Moderate',
        description: 'Lie perpendicular on bench with upper back supported. Hold dumbbell overhead with both hands. Lower behind head in arc motion, then pull back over chest.'
      },
      {
        name: 'Pec Deck Machine',
        primaryMuscles: ['pectoralis major'],
        secondaryMuscles: ['anterior deltoid'],
        equipment: ['pec deck machine'],
        difficulty: 'beginner',
        sets: 3, reps: '12-15', weight: 'Moderate',
        description: 'Sit with back against pad, forearms on pads. Bring arms together in front of chest, squeezing pecs at peak. Control the return to starting position.'
      },
      {
        name: 'Dips (Chest Focus)',
        primaryMuscles: ['lower pectoralis major'],
        secondaryMuscles: ['triceps', 'anterior deltoid'],
        equipment: ['parallel bars'],
        difficulty: 'intermediate',
        sets: 3, reps: '8-12', weight: 'Bodyweight',
        description: 'Grip parallel bars, lean forward 30 degrees. Lower body until shoulders are below elbows, then press back up. Forward lean emphasizes chest over triceps.'
      },
      {
        name: 'Landmine Press',
        primaryMuscles: ['pectoralis major', 'upper chest'],
        secondaryMuscles: ['anterior deltoid', 'triceps', 'core'],
        equipment: ['barbell', 'landmine attachment'],
        difficulty: 'intermediate',
        sets: 3, reps: '8-12', weight: 'Moderate',
        description: 'Stand holding end of landmine barbell at chest. Press forward and up at 45-degree angle. Can be done single-arm or with both hands.'
      },
      {
        name: 'Wide Grip Push-ups',
        primaryMuscles: ['outer pectoralis major'],
        secondaryMuscles: ['anterior deltoid', 'triceps'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        sets: 3, reps: '10-15', weight: 'Bodyweight',
        description: 'Perform push-ups with hands placed wider than shoulder-width to emphasize outer chest. Maintain straight body line throughout movement.'
      }
    ]
  },

  // Back exercises
  back: {
    primary: [
      {
        name: 'Conventional Deadlifts',
        primaryMuscles: ['erector spinae', 'latissimus dorsi', 'rhomboids'],
        secondaryMuscles: ['glutes', 'hamstrings', 'traps'],
        equipment: ['barbell'],
        difficulty: 'advanced',
        sets: 4, reps: '5-6', weight: 'Heavy',
        description: 'Stand with feet hip-width apart, barbell over mid-foot. Keep chest up and core tight as you pull the bar up along your body. Hinge at hips, maintain neutral spine.'
      },
      {
        name: 'Pull-ups',
        primaryMuscles: ['latissimus dorsi'],
        secondaryMuscles: ['rhomboids', 'middle traps', 'biceps'],
        equipment: ['pull-up bar'],
        difficulty: 'intermediate',
        sets: 3, reps: '8-12', weight: 'Bodyweight',
        description: 'Hang from a bar with hands slightly wider than shoulder-width. Pull yourself up until chin clears the bar. Control descent back to full hang.'
      },
      {
        name: 'Bent Over Barbell Rows',
        primaryMuscles: ['rhomboids', 'middle traps', 'latissimus dorsi'],
        secondaryMuscles: ['posterior deltoid', 'biceps'],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        sets: 4, reps: '6-8', weight: 'Heavy',
        description: 'Bend forward at hips with knees slightly bent. Pull barbell toward torso, driving elbows back. Squeeze shoulder blades together at top.'
      },
      {
        name: 'Lat Pulldown',
        primaryMuscles: ['latissimus dorsi'],
        secondaryMuscles: ['rhomboids', 'biceps', 'rear deltoid'],
        equipment: ['cable machine', 'lat pulldown bar'],
        difficulty: 'beginner',
        sets: 3, reps: '10-12', weight: 'Moderate',
        description: 'Sit at lat pulldown machine with thighs secured. Grip bar wider than shoulders. Pull bar down to upper chest while keeping torso upright. Control the return.'
      },
      {
        name: 'Single-Arm Dumbbell Row',
        primaryMuscles: ['latissimus dorsi', 'rhomboids'],
        secondaryMuscles: ['biceps', 'rear deltoid', 'core'],
        equipment: ['dumbbell', 'bench'],
        difficulty: 'beginner',
        sets: 3, reps: '10-12', weight: 'Moderate',
        description: 'Place one knee and hand on bench. Hold dumbbell in opposite hand. Pull dumbbell to hip, keeping elbow close to body. Squeeze lat at top.'
      },
      {
        name: 'T-Bar Row',
        primaryMuscles: ['middle back', 'latissimus dorsi'],
        secondaryMuscles: ['rhomboids', 'traps', 'biceps'],
        equipment: ['t-bar row machine', 'barbell'],
        difficulty: 'intermediate',
        sets: 4, reps: '8-10', weight: 'Heavy',
        description: 'Straddle T-bar with bent knees and flat back. Grip handles and pull weight to chest. Focus on squeezing shoulder blades together.'
      },
      {
        name: 'Seated Cable Row',
        primaryMuscles: ['middle back', 'rhomboids'],
        secondaryMuscles: ['latissimus dorsi', 'biceps', 'rear deltoid'],
        equipment: ['cable machine', 'v-bar attachment'],
        difficulty: 'beginner',
        sets: 3, reps: '10-12', weight: 'Moderate',
        description: 'Sit at cable row station with feet on platform. Pull handle to torso while keeping back straight. Squeeze shoulder blades at peak contraction.'
      },
      {
        name: 'Chin-ups',
        primaryMuscles: ['latissimus dorsi', 'biceps'],
        secondaryMuscles: ['rhomboids', 'middle traps'],
        equipment: ['pull-up bar'],
        difficulty: 'intermediate',
        sets: 3, reps: '8-12', weight: 'Bodyweight',
        description: 'Hang from bar with underhand grip (palms facing you). Pull up until chin clears bar. More bicep emphasis than standard pull-ups.'
      },
      {
        name: 'Inverted Rows',
        primaryMuscles: ['middle back', 'rhomboids'],
        secondaryMuscles: ['latissimus dorsi', 'biceps', 'rear deltoid'],
        equipment: ['smith machine', 'barbell in rack'],
        difficulty: 'beginner',
        sets: 3, reps: '10-15', weight: 'Bodyweight',
        description: 'Lie under bar set at waist height. Grip bar with straight body. Pull chest to bar, keeping body rigid. Great for beginners building to pull-ups.'
      },
      {
        name: 'Sumo Deadlift',
        primaryMuscles: ['glutes', 'adductors', 'erector spinae'],
        secondaryMuscles: ['hamstrings', 'quadriceps', 'traps'],
        equipment: ['barbell'],
        difficulty: 'advanced',
        sets: 4, reps: '5-8', weight: 'Heavy',
        description: 'Stand with wide stance, toes pointed out. Grip bar inside legs. Keep chest up and pull bar straight up, driving through heels. More quad and glute emphasis than conventional.'
      },
      {
        name: 'Hyperextensions',
        primaryMuscles: ['erector spinae', 'lower back'],
        secondaryMuscles: ['glutes', 'hamstrings'],
        equipment: ['hyperextension bench'],
        difficulty: 'beginner',
        sets: 3, reps: '12-15', weight: 'Bodyweight',
        description: 'Position yourself on hyperextension bench with hips on pad. Lower torso toward floor, then raise back to parallel. Can add weight for progression.'
      },
      {
        name: 'Face Pulls',
        primaryMuscles: ['posterior deltoid', 'rhomboids'],
        secondaryMuscles: ['middle traps', 'rotator cuff'],
        equipment: ['cable machine', 'rope attachment'],
        difficulty: 'beginner',
        sets: 3, reps: '15-20', weight: 'Light',
        description: 'Pull rope toward face, spreading ends apart. Excellent for rear delt development and posture. Keep elbows high throughout movement.'
      },
      {
        name: 'Pendlay Row',
        primaryMuscles: ['latissimus dorsi', 'rhomboids', 'traps'],
        secondaryMuscles: ['biceps', 'erector spinae'],
        equipment: ['barbell'],
        difficulty: 'advanced',
        sets: 4, reps: '6-8', weight: 'Heavy',
        description: 'Barbell starts on floor each rep. Explosive pull to lower chest with torso parallel to floor. Reset completely between reps for maximum power.'
      },
      {
        name: 'Wide Grip Pull-ups',
        primaryMuscles: ['latissimus dorsi', 'upper lats'],
        secondaryMuscles: ['rhomboids', 'traps'],
        equipment: ['pull-up bar'],
        difficulty: 'advanced',
        sets: 3, reps: '6-10', weight: 'Bodyweight',
        description: 'Grip bar 1.5x shoulder width. Pull up focusing on bringing elbows down and back. Emphasizes lat width development.'
      }
    ]
  },

  // Arms with specific muscle targeting
  arms: {
    biceps: [
      {
        name: 'Barbell Curls',
        primaryMuscles: ['biceps brachii'],
        secondaryMuscles: ['brachialis', 'brachioradialis'],
        equipment: ['barbell'],
        difficulty: 'beginner',
        sets: 4, reps: '8-10', weight: 'Moderate',
        description: 'Stand holding a barbell with hands shoulder-width apart. Keep elbows stationary as you curl the bar upward.'
      },
      {
        name: 'Hammer Curls',
        primaryMuscles: ['brachialis', 'brachioradialis'],
        secondaryMuscles: ['biceps brachii'],
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        sets: 3, reps: '10-12', weight: 'Moderate',
        description: 'Hold dumbbells with palms facing each other (hammer grip). Curl up toward shoulders, keeping elbows stationary. Excellent for brachialis development.'
      },
      {
        name: 'Cable Hammer Curls',
        primaryMuscles: ['brachialis', 'brachioradialis'],
        secondaryMuscles: ['biceps brachii'],
        equipment: ['cable machine', 'rope attachment'],
        difficulty: 'beginner',
        sets: 3, reps: '12-15', weight: 'Moderate',
        description: 'Use rope attachment on low cable. Curl with neutral grip, focusing on squeezing the brachialis at the top.'
      },
      {
        name: 'Reverse Curls',
        primaryMuscles: ['brachialis', 'brachioradialis'],
        secondaryMuscles: ['extensor carpi'],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        sets: 3, reps: '10-12', weight: 'Light',
        description: 'Hold barbell with overhand grip. Curl up while keeping wrists straight. Targets brachialis and forearm extensors.'
      }
    ],
    triceps: [
      {
        name: 'Close-Grip Bench Press',
        primaryMuscles: ['triceps brachii'],
        secondaryMuscles: ['pectoralis major', 'anterior deltoid'],
        equipment: ['barbell', 'bench'],
        difficulty: 'intermediate',
        sets: 4, reps: '6-8', weight: 'Heavy',
        description: 'Lie on bench with hands closer than shoulder-width. Lower bar to chest, focusing on triceps extension.'
      },
      {
        name: 'Tricep Dips',
        primaryMuscles: ['triceps brachii'],
        secondaryMuscles: ['anterior deltoid', 'pectoralis major'],
        equipment: ['parallel bars'],
        difficulty: 'intermediate',
        sets: 3, reps: '8-12', weight: 'Bodyweight',
        description: 'Support yourself on parallel bars. Lower body by bending elbows to 90 degrees, then push back up.'
      }
    ]
  },

  // Legs with specific targeting
  legs: {
    quadriceps: [
      {
        name: 'Front Squats',
        primaryMuscles: ['quadriceps'],
        secondaryMuscles: ['glutes', 'core'],
        equipment: ['barbell', 'squat rack'],
        difficulty: 'advanced',
        sets: 4, reps: '6-8', weight: 'Heavy',
        description: 'Hold barbell across front of shoulders. Squat down keeping chest up and knees tracking over toes.'
      },
      {
        name: 'Bulgarian Split Squats',
        primaryMuscles: ['quadriceps'],
        secondaryMuscles: ['glutes', 'calves'],
        equipment: ['dumbbells', 'bench'],
        difficulty: 'intermediate',
        sets: 3, reps: '10-12', weight: 'Moderate',
        description: 'Place rear foot on bench behind you. Lower into lunge position, focusing on front leg quadriceps.'
      }
    ],
    hamstrings: [
      {
        name: 'Romanian Deadlifts',
        primaryMuscles: ['hamstrings'],
        secondaryMuscles: ['glutes', 'erector spinae'],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        sets: 4, reps: '8-10', weight: 'Heavy',
        description: 'Hold barbell with straight legs. Hinge at hips, lowering bar while keeping back straight. Feel stretch in hamstrings.'
      },
      {
        name: 'Nordic Curls',
        primaryMuscles: ['hamstrings'],
        secondaryMuscles: ['glutes', 'calves'],
        equipment: ['bodyweight'],
        difficulty: 'advanced',
        sets: 3, reps: '5-8', weight: 'Bodyweight',
        description: 'Kneel with feet anchored. Lower body forward using hamstrings to control descent. Excellent for hamstring strength.'
      }
    ]
  },

  // Shoulders with specific deltoid targeting
  shoulders: {
    anterior: [
      {
        name: 'Overhead Press',
        primaryMuscles: ['anterior deltoid'],
        secondaryMuscles: ['triceps', 'upper chest'],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        sets: 4, reps: '6-8', weight: 'Heavy',
        description: 'Stand holding barbell at shoulder height. Press overhead while keeping core tight.'
      }
    ],
    lateral: [
      {
        name: 'Lateral Raises',
        primaryMuscles: ['lateral deltoid'],
        secondaryMuscles: ['anterior deltoid', 'posterior deltoid'],
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        sets: 3, reps: '12-15', weight: 'Light',
        description: 'Hold dumbbells at sides. Raise out to sides until parallel to floor, focusing on lateral deltoids.'
      }
    ],
    posterior: [
      {
        name: 'Face Pulls',
        primaryMuscles: ['posterior deltoid'],
        secondaryMuscles: ['rhomboids', 'middle traps'],
        equipment: ['cable machine', 'rope attachment'],
        difficulty: 'beginner',
        sets: 3, reps: '15-20', weight: 'Light',
        description: 'Pull rope toward face, spreading ends apart. Excellent for rear delt development and posture.'
      }
    ]
  }
};

// Exercise exclusion patterns for better filtering
export const exclusionPatterns = {
  'squats': ['squat', 'back squat', 'front squat', 'goblet squat', 'split squat'],
  'deadlifts': ['deadlift', 'romanian deadlift', 'sumo deadlift', 'stiff leg deadlift'],
  'bench press': ['bench press', 'barbell bench', 'dumbbell bench'],
  'overhead press': ['overhead press', 'military press', 'shoulder press'],
  'pull-ups': ['pull-up', 'chin-up', 'assisted pull-up'],
  'rows': ['row', 'bent over row', 'barbell row', 'dumbbell row', 't-bar row']
};

// Specific muscle targeting keywords
export const specificMuscleKeywords = {
  'brachialis': ['brachialis', 'hammer curl', 'reverse curl', 'neutral grip'],
  'brachioradialis': ['brachioradialis', 'hammer curl', 'reverse curl', 'forearm'],
  'posterior deltoid': ['rear delt', 'posterior deltoid', 'face pull', 'reverse fly'],
  'lateral deltoid': ['side delt', 'lateral deltoid', 'lateral raise', 'side raise'],
  'upper chest': ['upper chest', 'incline', 'upper pec'],
  'lower chest': ['lower chest', 'decline', 'lower pec', 'dips'],
  'inner chest': ['inner chest', 'squeeze', 'fly', 'cable crossover'],
  'outer chest': ['outer chest', 'wide grip', 'flare'],
  'long head triceps': ['long head triceps', 'overhead extension', 'skull crusher'],
  'short head biceps': ['short head biceps', 'wide grip curl', 'drag curl'],
  'vastus medialis': ['vastus medialis', 'inner quad', 'terminal knee extension'],
  'glute medius': ['glute medius', 'side lying', 'clamshell', 'lateral walk']
};

// Equipment categories
export const equipmentCategories = {
  'home gym': ['dumbbells', 'resistance bands', 'bodyweight', 'pull-up bar'],
  'commercial gym': ['barbell', 'cable machine', 'machines', 'dumbbells', 'pull-up bar'],
  'bodyweight only': ['bodyweight'],
  'minimal equipment': ['dumbbells', 'resistance bands', 'bodyweight']
};