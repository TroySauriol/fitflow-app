// Heart Rate Zones Calculator
// Uses Karvonen Formula for accurate zone calculation

export class HeartRateZones {
  constructor(age, restingHR = 60) {
    this.age = age
    this.restingHR = restingHR
    this.maxHR = 220 - age // Simple formula (can be customized)
    this.hrReserve = this.maxHR - restingHR // Heart Rate Reserve
  }

  // Calculate all heart rate zones using Karvonen formula
  // HRTarget = HRRest + (HRReserve × %Intensity)
  getZones() {
    return {
      resting: {
        name: 'Resting',
        min: 0,
        max: this.restingHR,
        color: '#9E9E9E',
        description: 'At rest',
        intensity: 0
      },
      recovery: {
        name: 'Recovery',
        min: Math.round(this.restingHR + this.hrReserve * 0.50),
        max: Math.round(this.restingHR + this.hrReserve * 0.60),
        color: '#4CAF50',
        description: 'Easy recovery, warm-up, cool-down',
        intensity: 50,
        benefits: 'Active recovery, improves overall health'
      },
      fatBurn: {
        name: 'Fat Burn',
        min: Math.round(this.restingHR + this.hrReserve * 0.60),
        max: Math.round(this.restingHR + this.hrReserve * 0.70),
        color: '#8BC34A',
        description: 'Aerobic endurance, fat burning',
        intensity: 60,
        benefits: 'Burns fat, builds aerobic base'
      },
      cardio: {
        name: 'Cardio',
        min: Math.round(this.restingHR + this.hrReserve * 0.70),
        max: Math.round(this.restingHR + this.hrReserve * 0.80),
        color: '#FFC107',
        description: 'Aerobic fitness, stamina building',
        intensity: 70,
        benefits: 'Improves cardiovascular fitness'
      },
      threshold: {
        name: 'Threshold',
        min: Math.round(this.restingHR + this.hrReserve * 0.80),
        max: Math.round(this.restingHR + this.hrReserve * 0.90),
        color: '#FF9800',
        description: 'Lactate threshold, performance',
        intensity: 80,
        benefits: 'Increases lactate threshold, speed'
      },
      peak: {
        name: 'Peak',
        min: Math.round(this.restingHR + this.hrReserve * 0.90),
        max: this.maxHR,
        color: '#F44336',
        description: 'Maximum effort, anaerobic',
        intensity: 90,
        benefits: 'Builds maximum power, speed'
      },
      maximum: {
        name: 'Maximum',
        min: this.maxHR,
        max: 220,
        color: '#D32F2F',
        description: 'Unsustainable, dangerous',
        intensity: 100
      }
    }
  }

  // Get current zone based on heart rate
  getCurrentZone(currentHR) {
    if (!currentHR || currentHR < 20) {
      return null
    }

    const zones = this.getZones()
    
    // Find which zone the current HR falls into
    for (const [key, zone] of Object.entries(zones)) {
      if (currentHR >= zone.min && currentHR <= zone.max) {
        return { key, ...zone, currentHR }
      }
    }
    
    // If above max, return maximum zone
    if (currentHR > this.maxHR) {
      return { key: 'maximum', ...zones.maximum, currentHR }
    }
    
    return null
  }

  // Get zone percentage (how far into the zone)
  getZonePercentage(currentHR) {
    const zone = this.getCurrentZone(currentHR)
    if (!zone) return 0
    
    const range = zone.max - zone.min
    const position = currentHR - zone.min
    return Math.round((position / range) * 100)
  }

  // Calculate calories burned based on heart rate
  // Uses gender-specific formulas
  calculateCalories(avgHR, durationMinutes, weight = 70, gender = 'male') {
    // Formulas from Journal of Sports Sciences
    let caloriesPerMinute
    
    if (gender === 'male') {
      // Men: ((-55.0969 + (0.6309 x HR) + (0.1988 x W) + (0.2017 x A)) / 4.184) x T
      caloriesPerMinute = (
        -55.0969 + 
        (0.6309 * avgHR) + 
        (0.1988 * weight) + 
        (0.2017 * this.age)
      ) / 4.184
    } else {
      // Women: ((-20.4022 + (0.4472 x HR) - (0.1263 x W) + (0.074 x A)) / 4.184) x T
      caloriesPerMinute = (
        -20.4022 + 
        (0.4472 * avgHR) - 
        (0.1263 * weight) + 
        (0.074 * this.age)
      ) / 4.184
    }
    
    const totalCalories = caloriesPerMinute * durationMinutes
    return Math.max(0, Math.round(totalCalories))
  }

  // Calculate training load (TRIMP - Training Impulse)
  calculateTrainingLoad(avgHR, durationMinutes, gender = 'male') {
    const hrRatio = (avgHR - this.restingHR) / (this.maxHR - this.restingHR)
    
    let trimp
    if (gender === 'male') {
      trimp = durationMinutes * hrRatio * 0.64 * Math.exp(1.92 * hrRatio)
    } else {
      trimp = durationMinutes * hrRatio * 0.86 * Math.exp(1.67 * hrRatio)
    }
    
    return Math.round(trimp)
  }

  // Get training effectiveness score (0-100)
  getTrainingEffectiveness(timeInZones) {
    // Weight different zones
    const weights = {
      recovery: 0.3,
      fatBurn: 0.5,
      cardio: 1.0,
      threshold: 0.8,
      peak: 0.5
    }
    
    let totalScore = 0
    let totalTime = 0
    
    for (const [zone, time] of Object.entries(timeInZones)) {
      if (weights[zone]) {
        totalScore += time * weights[zone]
        totalTime += time
      }
    }
    
    if (totalTime === 0) return 0
    
    const effectiveness = (totalScore / totalTime) * 100
    return Math.min(100, Math.round(effectiveness))
  }

  // Suggest target zone for workout type
  getTargetZone(workoutType) {
    const targets = {
      'recovery': 'recovery',
      'easy': 'fatBurn',
      'base': 'fatBurn',
      'endurance': 'cardio',
      'tempo': 'threshold',
      'interval': 'peak',
      'hiit': 'peak'
    }
    
    const zoneKey = targets[workoutType.toLowerCase()] || 'cardio'
    const zones = this.getZones()
    return zones[zoneKey]
  }

  // Check if heart rate is in target zone
  isInTargetZone(currentHR, targetZone) {
    const zones = this.getZones()
    const zone = zones[targetZone]
    
    if (!zone) return false
    return currentHR >= zone.min && currentHR <= zone.max
  }

  // Get time to recover to resting HR (rough estimate)
  getRecoveryTime(maxHRReached) {
    // Rough estimate: 1 minute per 10 BPM above resting
    const difference = maxHRReached - this.restingHR
    const recoveryMinutes = Math.round(difference / 10)
    return Math.max(1, recoveryMinutes)
  }
}

export default HeartRateZones
