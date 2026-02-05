import { useState, useEffect } from 'react'
import './WorkoutCalendar.css'

export default function WorkoutCalendar({ calendarWorkouts, workoutTemplates, personalRecords, onUpdateRecord, onDeleteWorkout, onSaveWorkout }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view') // 'view', 'add', 'edit'
  const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: '8-10', weight: 'Moderate' })
  const [logForm, setLogForm] = useState({})
  const [workoutName, setWorkoutName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [workoutExercises, setWorkoutExercises] = useState([])
  const [expandedSetInfo, setExpandedSetInfo] = useState({}) // Track which exercises have Set Info expanded
  const [expandedExerciseDescription, setExpandedExerciseDescription] = useState({}) // Track which exercises have description expanded
  const [restTimers, setRestTimers] = useState({}) // Track active rest timers per exercise
  const [workoutNotes, setWorkoutNotes] = useState('') // Track workout notes

  // Rest timer effect
  useEffect(() => {
    const timers = {}
    Object.entries(restTimers).forEach(([exercise, seconds]) => {
      if (seconds > 0) {
        timers[exercise] = setInterval(() => {
          setRestTimers(prev => ({
            ...prev,
            [exercise]: Math.max(0, prev[exercise] - 1)
          }))
        }, 1000)
      }
    })
    return () => {
      Object.values(timers).forEach(timer => clearInterval(timer))
    }
  }, [restTimers])

  const startRestTimer = (exerciseName, seconds = 90) => {
    setRestTimers(prev => ({
      ...prev,
      [exerciseName]: seconds
    }))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getWorkoutForDate = (date) => {
    const dateStr = date.toLocaleDateString()
    return calendarWorkouts.find(w => w.savedAt === dateStr)
  }

  const getMuscleEmojis = (muscles) => {
    const emojiMap = {
      chest: '🫀',
      back: '🔙',
      shoulders: '💪',
      arms: '💪',
      legs: '🦵',
      core: '🤸',
      cardio: '🏃'
    }
    const emojis = new Set()
    if (muscles) {
      muscles.forEach(muscle => {
        const emoji = emojiMap[muscle]
        if (emoji) emojis.add(emoji)
      })
    }
    return Array.from(emojis).join('')
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    setSelectedDate(null)
  }

  const openModal = (mode) => {
    setModalMode(mode)
    if (mode === 'add') {
      setWorkoutName('')
      setNewExercise({ name: '', sets: 3, reps: '8-10', weight: 'Moderate' })
      setSelectedTemplate(null)
      setWorkoutExercises([])
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setNewExercise({ name: '', sets: 3, reps: '8-10', weight: 'Moderate' })
    setWorkoutName('')
    setSelectedTemplate(null)
    setWorkoutExercises([])
    setWorkoutNotes('')
  }

  const handleSelectTemplate = (workout) => {
    setSelectedTemplate(workout.id)
    setWorkoutName(workout.name)
    setWorkoutExercises([...workout.exercises])
  }

  const addExerciseToWorkout = () => {
    if (!newExercise.name.trim()) return
    const exerciseToAdd = {
      name: newExercise.name,
      sets: newExercise.sets,
      reps: newExercise.reps,
      weight: newExercise.weight
    }
    setWorkoutExercises([...workoutExercises, exerciseToAdd])
    setNewExercise({ name: '', sets: 3, reps: '8-10', weight: 'Moderate' })
  }

  const removeExerciseFromWorkout = (index) => {
    const updated = workoutExercises.filter((_, i) => i !== index)
    setWorkoutExercises(updated)
  }

  const saveNewWorkout = () => {
    if (!workoutName.trim() || workoutExercises.length === 0) {
      alert('Please enter a workout name and add at least one exercise')
      return
    }
    
    // Extract muscle groups from exercise names (simple heuristic)
    const muscles = extractMusclesFromExercises(workoutExercises)
    
    const newWorkout = {
      id: Date.now(),
      name: workoutName,
      exercises: workoutExercises,
      muscles: muscles,
      savedAt: selectedDate.toLocaleDateString(),
      createdAt: new Date().toISOString(),
      notes: workoutNotes
    }
    
    // Call parent's onSaveWorkout if provided
    if (onSaveWorkout) {
      onSaveWorkout(newWorkout)
    }
    
    closeModal()
  }

  const extractMusclesFromExercises = (exercises) => {
    const muscleKeywords = {
      chest: ['chest', 'bench press', 'fly'],
      back: ['back', 'row', 'deadlift', 'lat'],
      legs: ['leg', 'squat', 'lunge', 'calf', 'glute'],
      shoulders: ['shoulder', 'press', 'raise', 'delt'],
      arms: ['curl', 'tricep', 'bicep'],
      core: ['core', 'abs', 'crunch', 'plank']
    }
    
    const foundMuscles = new Set()
    exercises.forEach(ex => {
      const exName = ex.name.toLowerCase()
      Object.entries(muscleKeywords).forEach(([muscle, keywords]) => {
        if (keywords.some(keyword => exName.includes(keyword))) {
          foundMuscles.add(muscle)
        }
      })
    })
    
    return Array.from(foundMuscles)
  }

  const logExercise = (exerciseName) => {
    const weight = logForm[`${exerciseName}-weight`]
    const reps = logForm[`${exerciseName}-reps`]
    if (weight && reps) {
      onUpdateRecord(exerciseName, weight, reps)
      setLogForm(prev => ({
        ...prev,
        [`${exerciseName}-weight`]: '',
        [`${exerciseName}-reps`]: ''
      }))
    }
  }

  const toggleSetInfo = (exerciseName) => {
    setExpandedSetInfo(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName]
    }))
  }

  const toggleExerciseDescription = (exerciseName) => {
    setExpandedExerciseDescription(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName]
    }))
  }

  const getLogsForExercise = (exerciseName) => {
    const records = personalRecords[exerciseName] || []
    return records.filter(r => r.date === selectedDate.toLocaleDateString())
  }

  const getSetCount = (exerciseName) => {
    const logs = getLogsForExercise(exerciseName)
    return logs.length > 0 ? Math.max(...logs.map(l => l.set || 1)) : 0
  }

  const getPastWorkoutHistory = (exerciseName) => {
    const records = personalRecords[exerciseName] || []
    // Sort by date descending, get unique dates, take last 3
    const uniqueDates = {}
    records.forEach(record => {
      if (!uniqueDates[record.date]) {
        uniqueDates[record.date] = record
      }
    })
    return Object.values(uniqueDates)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3)
      .reverse() // Show chronologically
  }

  const getProgressiveOverloadSuggestion = (exerciseName) => {
    const history = getPastWorkoutHistory(exerciseName)
    if (history.length < 2) return null // Need at least 2 sessions to suggest progress
    
    const latest = history[history.length - 1]
    const previous = history[history.length - 2]
    
    // Suggest increase if same or higher reps at same weight
    if (latest.reps >= previous.reps && latest.weight === previous.weight) {
      const suggestedWeight = Math.ceil(latest.weight * 1.05) // 5% increase
      return {
        type: 'weight',
        current: latest.weight,
        suggested: suggestedWeight,
        reason: `You've completed ${latest.reps} reps at ${latest.weight}lbs. Try ${suggestedWeight}lbs!`
      }
    }
    
    // Suggest reps increase if weight increased
    if (latest.weight > previous.weight) {
      const suggestedReps = latest.reps + 1
      return {
        type: 'reps',
        current: latest.reps,
        suggested: suggestedReps,
        reason: `Great strength gain! Try ${suggestedReps} reps at ${latest.weight}lbs.`
      }
    }
    
    return null
  }

  const calculate1RM = (exerciseName) => {
    const records = personalRecords[exerciseName] || []
    if (records.length === 0) return null
    
    // Get the best performance (highest weight × reps combination)
    let best1RM = 0
    records.forEach(record => {
      // Epley formula: 1RM = weight × (1 + reps/30)
      const estimated1RM = record.weight * (1 + record.reps / 30)
      if (estimated1RM > best1RM) {
        best1RM = estimated1RM
      }
    })
    
    return Math.round(best1RM)
  }

  const addSet = (exerciseName) => {
    const weight = logForm[`${exerciseName}-set-weight`]
    const reps = logForm[`${exerciseName}-set-reps`]
    const rpe = parseInt(logForm[`${exerciseName}-set-rpe`]) || 0
    if (weight && reps) {
      const setNumber = getSetCount(exerciseName) + 1
      onUpdateRecord(exerciseName, weight, reps, setNumber, rpe)
      setLogForm(prev => ({
        ...prev,
        [`${exerciseName}-set-weight`]: '',
        [`${exerciseName}-set-reps`]: '',
        [`${exerciseName}-set-rpe`]: ''
      }))
    }
  }

  const getWeekStats = () => {
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const weekWorkouts = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      const workout = getWorkoutForDate(date)
      if (workout) weekWorkouts.push(workout)
    }
    return weekWorkouts
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
  }

  const selectedWorkout = selectedDate ? getWorkoutForDate(selectedDate) : null
  const weekStats = selectedDate ? getWeekStats() : []

  return (
    <div className="workout-calendar">
      <div className="calendar-header">
        <h2>📅 Workout Calendar</h2>
      </div>

      <div className="calendar-container">
        <div className="calendar-view">
          <div className="month-nav">
            <button onClick={prevMonth}>◀</button>
            <h3>{monthName}</h3>
            <button onClick={nextMonth}>▶</button>
          </div>

          <div className="calendar-grid">
            <div className="weekdays">
              <div className="weekday">Sun</div>
              <div className="weekday">Mon</div>
              <div className="weekday">Tue</div>
              <div className="weekday">Wed</div>
              <div className="weekday">Thu</div>
              <div className="weekday">Fri</div>
              <div className="weekday">Sat</div>
            </div>

            <div className="days-grid">
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="day empty"></div>

                const workout = getWorkoutForDate(date)
                const emojis = workout ? getMuscleEmojis(workout.muscles) : ''
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

                return (
                  <div
                    key={date.toDateString()}
                    className={`day ${workout ? 'has-workout' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="day-number">{date.getDate()}</div>
                    {emojis && <div className="day-emojis">{emojis}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {selectedDate && (
          <div className="day-detail">
            <div className="detail-header">
              <h3>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
              <div className="action-buttons">
                {!selectedWorkout && (
                  <button className="btn-add" onClick={() => openModal('add')} title="Add workout">
                    ➕
                  </button>
                )}
                {selectedWorkout && (
                  <>
                    <button className="btn-edit" onClick={() => openModal('edit')} title="Edit workout">
                      ✏️
                    </button>
                    <button className="btn-delete" onClick={() => onDeleteWorkout(selectedWorkout.id)} title="Delete workout">
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>

            {selectedWorkout ? (
              <>
                <div className="workout-info">
                  <h4>{selectedWorkout.name}</h4>
                  <p className="muscle-tags">
                    {selectedWorkout.muscles?.map(m => (
                      <span key={m} className="muscle-tag">{m}</span>
                    ))}
                  </p>
                  {selectedWorkout.notes && (
                    <div className="workout-notes-display">
                      <p className="notes-label">Notes:</p>
                      <p className="notes-content">{selectedWorkout.notes}</p>
                    </div>
                  )}
                </div>

                <div className="exercises-on-day">
                  <h5>Today's Exercises:</h5>
                  {selectedWorkout.exercises.map((exercise, idx) => {
                    const dayRecords = getLogsForExercise(exercise.name)
                    const isExpanded = expandedSetInfo[exercise.name]

                    return (
                      <div key={idx} className="day-exercise">
                        <div className="exercise-info">
                          <div className="exercise-name">{exercise.name}</div>
                          <div className="exercise-planned">
                            {exercise.sets}×{exercise.reps} @ {exercise.weight}
                          </div>
                        </div>
                        
                        <button
                          className="btn-set-info"
                          onClick={() => toggleSetInfo(exercise.name)}
                          title="Log sets for this exercise"
                        >
                          📊 Set Info {dayRecords.length > 0 && `(${dayRecords.length})`}
                        </button>

                        {isExpanded && (
                          <div className="set-info-expanded">
                            {dayRecords.length > 0 && (
                              <div className="logged-sets">
                                <h6>Logged Sets:</h6>
                                {dayRecords.map((record, i) => (
                                  <div key={i} className="logged-set-item">
                                    <span className="set-number">Set {record.set || i + 1}</span>
                                    <span className="set-performance">{record.weight} lbs × {record.reps} reps</span>
                                    {record.rpe > 0 && <span className="set-rpe">RPE {record.rpe}</span>}
                                  </div>
                                ))}
                              </div>
                            )}

                            {getPastWorkoutHistory(exercise.name).length > 0 && (
                              <div className="past-workout-reference">
                                <h6>📋 Past Workouts</h6>
                                <div className="past-sets-list">
                                  {getPastWorkoutHistory(exercise.name).map((record, idx) => (
                                    <div key={idx} className="past-set-item">
                                      <span className="past-date">{record.date}</span>
                                      <span className="past-performance">{record.weight} lbs × {record.reps} reps</span>
                                      {record.rpe > 0 && <span className="past-rpe">RPE {record.rpe}</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {getProgressiveOverloadSuggestion(exercise.name) && (
                              <div className="overload-suggestion">
                                <h6>💪 Progressive Overload</h6>
                                <p>{getProgressiveOverloadSuggestion(exercise.name).reason}</p>
                              </div>
                            )}

                            {calculate1RM(exercise.name) && (
                              <div className="one-rm-display">
                                <h6>🏋️ Estimated 1RM</h6>
                                <div className="one-rm-value">{calculate1RM(exercise.name)} lbs</div>
                                <p className="one-rm-note">Based on your best performance</p>
                              </div>
                            )}
                            
                            <div className="add-set-form">
                              <h6>{dayRecords.length > 0 ? 'Add Another Set' : 'Log First Set'}</h6>
                              <div className="set-input-row">
                                <input
                                  type="number"
                                  placeholder="Weight (lbs)"
                                  className="set-input"
                                  value={logForm[`${exercise.name}-set-weight`] || ''}
                                  onChange={(e) =>
                                    setLogForm(prev => ({
                                      ...prev,
                                      [`${exercise.name}-set-weight`]: e.target.value
                                    }))
                                  }
                                />
                                <input
                                  type="number"
                                  placeholder="Reps"
                                  className="set-input"
                                  value={logForm[`${exercise.name}-set-reps`] || ''}
                                  onChange={(e) =>
                                    setLogForm(prev => ({
                                      ...prev,
                                      [`${exercise.name}-set-reps`]: e.target.value
                                    }))
                                  }
                                />
                                <select
                                  className="set-input-rpe"
                                  value={logForm[`${exercise.name}-set-rpe`] || '0'}
                                  onChange={(e) =>
                                    setLogForm(prev => ({
                                      ...prev,
                                      [`${exercise.name}-set-rpe`]: e.target.value
                                    }))
                                  }
                                  title="Rate of Perceived Exertion (1-10)"
                                >
                                  <option value="0">RPE</option>
                                  <option value="1">1 (Easy)</option>
                                  <option value="2">2</option>
                                  <option value="3">3</option>
                                  <option value="4">4</option>
                                  <option value="5">5 (Moderate)</option>
                                  <option value="6">6</option>
                                  <option value="7">7</option>
                                  <option value="8">8</option>
                                  <option value="9">9</option>
                                  <option value="10">10 (Max Effort)</option>
                                </select>
                                <button
                                  className="btn-add-set"
                                  onClick={() => addSet(exercise.name)}
                                >
                                  Add Set
                                </button>
                              </div>

                              {restTimers[exercise.name] > 0 ? (
                                <div className="rest-timer-display">
                                  <div className="timer-time">{formatTime(restTimers[exercise.name])}</div>
                                  <button
                                    className="btn-timer-skip"
                                    onClick={() => setRestTimers(prev => ({...prev, [exercise.name]: 0}))}
                                  >
                                    Skip Rest
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="btn-start-timer"
                                  onClick={() => startRestTimer(exercise.name, 90)}
                                  title="Start 90-second rest timer"
                                >
                                  ⏱️ Start Rest (90s)
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="no-workout">
                <p>No workout for this day</p>
                <button className="btn-add-large" onClick={() => openModal('add')}>
                  ➕ Add Workout
                </button>
              </div>
            )}

            {weekStats.length > 0 && (
              <div className="week-stats">
                <h5>This Week</h5>
                <div className="stats-summary">
                  <div className="stat-item">
                    <span className="stat-label">Workouts:</span>
                    <span className="stat-value">{weekStats.length}/7</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Exercises:</span>
                    <span className="stat-value">{weekStats.reduce((sum, w) => sum + (w.exercises?.length || 0), 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{modalMode === 'add' ? 'Create New Workout' : 'Edit Workout'}</h4>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {workoutTemplates && workoutTemplates.length > 0 && (
                <div className="form-group">
                  <label>📋 Quick Select Saved Workout</label>
                  <p className="form-helper">Start with one of your favorite workouts and adjust as needed</p>
                  <div className="template-list">
                    {workoutTemplates.map(workout => (
                      <button
                        key={workout.id}
                        className={`template-btn ${selectedTemplate === workout.id ? 'active' : ''}`}
                        onClick={() => handleSelectTemplate(workout)}
                      >
                        <div className="template-name">{workout.name}</div>
                        <div className="template-exercises">{workout.exercises?.length} exercises</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-divider">
                <span>OR</span>
              </div>

              <div className="form-group">
                <label>Workout Name</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="e.g., Chest & Triceps"
                  disabled={selectedTemplate !== null}
                />
                {selectedTemplate && (
                  <button className="btn-clear-template" onClick={() => {
                    setSelectedTemplate(null)
                    setWorkoutName('')
                    setWorkoutExercises([])
                  }}>
                    Create Custom Workout Instead
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Exercises ({workoutExercises.length})</label>
                {workoutExercises.length > 0 && (
                  <div className="exercises-preview">
                    {workoutExercises.map((ex, idx) => (
                      <div key={idx} className="exercise-preview-item">
                        <div className="exercise-preview-info">
                          <strong>{ex.name}</strong>
                          <div className="exercise-preview-specs">
                            <span className="spec-badge">{ex.sets} sets</span>
                            <span className="spec-badge">{ex.reps} reps</span>
                            <span className="spec-badge">{ex.weight}</span>
                          </div>
                        </div>
                        <button
                          className="btn-remove-exercise"
                          onClick={() => removeExerciseFromWorkout(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!selectedTemplate && (
                  <>
                    <label style={{ marginTop: '12px', fontSize: '12px', fontWeight: 'normal' }}>Add Exercise</label>
                    <div className="exercise-form">
                      <input
                        type="text"
                        value={newExercise.name}
                        onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                        placeholder="Exercise name"
                        className="exercise-input"
                      />
                      <input
                        type="number"
                        value={newExercise.sets}
                        onChange={(e) => setNewExercise({...newExercise, sets: parseInt(e.target.value) || 1})}
                        placeholder="Sets"
                        className="small-input"
                      />
                      <input
                        type="text"
                        value={newExercise.reps}
                        onChange={(e) => setNewExercise({...newExercise, reps: e.target.value})}
                        placeholder="Reps"
                        className="small-input"
                      />
                      <select
                        value={newExercise.weight}
                        onChange={(e) => setNewExercise({...newExercise, weight: e.target.value})}
                        className="small-input"
                      >
                        <option value="Light">Light</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Heavy">Heavy</option>
                        <option value="Bodyweight">Bodyweight</option>
                      </select>
                      <button className="btn-add-exercise" onClick={addExerciseToWorkout} title="Add exercise">+</button>
                    </div>
                  </>
                )}

                {selectedTemplate && (
                  <button className="btn-modify-selected" onClick={() => setSelectedTemplate(null)}>
                    + Add More Exercises
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Workout Notes (optional)</label>
                <textarea
                  className="workout-notes-input"
                  placeholder="Add notes about this workout - how you felt, energy level, form notes, etc."
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button 
                className="btn-save" 
                onClick={saveNewWorkout}
                disabled={!workoutName.trim() || workoutExercises.length === 0}
              >
                Save Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
