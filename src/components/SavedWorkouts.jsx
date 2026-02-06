import './SavedWorkouts.css'
import { useState } from 'react'

export default function SavedWorkouts({ workoutTemplates, onDelete, onScheduleWorkout, onSaveTemplate }) {
  const [expandedId, setExpandedId] = useState(null)
  const [expandedExercises, setExpandedExercises] = useState(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    description: '',
    muscles: [],
    exercises: []
  })
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: 3,
    reps: '10',
    weight: 'Moderate',
    description: ''
  })

  const muscleOptions = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']

  const toggleExerciseDescription = (exerciseIndex) => {
    const newExpanded = new Set(expandedExercises)
    if (newExpanded.has(exerciseIndex)) {
      newExpanded.delete(exerciseIndex)
    } else {
      newExpanded.add(exerciseIndex)
    }
    setExpandedExercises(newExpanded)
  }

  const handleScheduleWorkout = (template) => {
    // Create a copy of the template for scheduling
    const workoutToSchedule = {
      ...template,
      id: Date.now(), // New ID for calendar entry
      savedAt: new Date().toLocaleDateString(),
      scheduledFrom: template.id // Reference to original template
    }
    onScheduleWorkout(workoutToSchedule)
    alert(`✅ "${template.name}" has been added to today's calendar!`)
  }

  const handleAddExercise = () => {
    if (!currentExercise.name.trim()) {
      alert('Please enter an exercise name')
      return
    }

    setNewWorkout({
      ...newWorkout,
      exercises: [...newWorkout.exercises, { ...currentExercise }]
    })

    // Reset current exercise
    setCurrentExercise({
      name: '',
      sets: 3,
      reps: '10',
      weight: 'Moderate',
      description: ''
    })
  }

  const handleRemoveExercise = (index) => {
    setNewWorkout({
      ...newWorkout,
      exercises: newWorkout.exercises.filter((_, i) => i !== index)
    })
  }

  const handleSaveWorkout = () => {
    if (!newWorkout.name.trim()) {
      alert('Please enter a workout name')
      return
    }

    if (newWorkout.exercises.length === 0) {
      alert('Please add at least one exercise')
      return
    }

    const workoutToSave = {
      ...newWorkout,
      id: Date.now(),
      createdAt: new Date().toLocaleDateString(),
      type: 'template'
    }

    onSaveTemplate(workoutToSave)

    // Reset form
    setNewWorkout({
      name: '',
      description: '',
      muscles: [],
      exercises: []
    })
    setShowCreateModal(false)
    alert(`✅ "${workoutToSave.name}" has been saved to your templates!`)
  }

  const toggleMuscle = (muscle) => {
    if (newWorkout.muscles.includes(muscle)) {
      setNewWorkout({
        ...newWorkout,
        muscles: newWorkout.muscles.filter(m => m !== muscle)
      })
    } else {
      setNewWorkout({
        ...newWorkout,
        muscles: [...newWorkout.muscles, muscle]
      })
    }
  }

  if (workoutTemplates.length === 0) {
    return (
      <div className="saved-workouts">
        <div className="saved-workouts-header-box">
          <div className="header-icon">📋</div>
          <div className="header-content">
            <h2>Workout Templates</h2>
            <p>Your personal library of go-to workout routines</p>
          </div>
        </div>

        <div className="templates-container">
          <button className="btn-create-workout" onClick={() => setShowCreateModal(true)}>
            ➕ Create Custom Workout
          </button>

          <div className="empty-state">
            <div className="empty-icon">🏋️‍♂️</div>
            <h3>No Saved Workout Templates Yet</h3>
            <p>Create your own custom workouts or generate them with AI in the Chat tab!</p>
            <div className="empty-state-tips">
              <h4>💡 Tips:</h4>
              <ul>
                <li>Create custom workouts with your favorite exercises</li>
                <li>Save AI-generated routines as templates</li>
                <li>Build a library of go-to workouts</li>
                <li>Schedule templates to your calendar when ready to workout</li>
              </ul>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <CreateWorkoutModal
            newWorkout={newWorkout}
            setNewWorkout={setNewWorkout}
            currentExercise={currentExercise}
            setCurrentExercise={setCurrentExercise}
            muscleOptions={muscleOptions}
            toggleMuscle={toggleMuscle}
            handleAddExercise={handleAddExercise}
            handleRemoveExercise={handleRemoveExercise}
            handleSaveWorkout={handleSaveWorkout}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="saved-workouts">
      <div className="saved-workouts-header-box">
        <div className="header-icon">📋</div>
        <div className="header-content">
          <h2>Workout Templates</h2>
          <p>Your personal library of go-to workout routines</p>
        </div>
      </div>
      
      <div className="templates-container">
        <button className="btn-create-workout" onClick={() => setShowCreateModal(true)}>
          ➕ Create Custom Workout
        </button>

        <div className="workouts-list">
          {workoutTemplates.map(template => (
          <div key={template.id} className="workout-card template-card">
            <div
              className="workout-header"
              onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
            >
              <div className="workout-title">
                <h3>{template.name}</h3>
                <div className="template-meta">
                  <span className="template-date">Created: {template.createdAt}</span>
                  {template.muscles && (
                    <div className="muscle-tags">
                      {template.muscles.map(muscle => (
                        <span key={muscle} className="muscle-tag">{muscle}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span className="expand-icon">
                {expandedId === template.id ? '▼' : '▶'}
              </span>
            </div>

            {expandedId === template.id && (
              <div className="workout-details">
                {template.description && (
                  <div className="template-description">
                    <p>{template.description}</p>
                  </div>
                )}
                
                <div className="exercises-section">
                  <h4>Exercises ({template.exercises?.length || 0})</h4>
                  {template.exercises?.map((exercise, idx) => (
                    <div key={idx} className="exercise-detail template-exercise">
                      <div
                        className="exercise-header-clickable"
                        onClick={() => toggleExerciseDescription(idx)}
                      >
                        <div>
                          <h5>{exercise.name}</h5>
                          <span className="exercise-specs">
                            {exercise.sets}×{exercise.reps} @ {exercise.weight}
                          </span>
                        </div>
                        <span className="expand-icon">
                          {expandedExercises.has(idx) ? '▼' : '▶'}
                        </span>
                      </div>

                      {expandedExercises.has(idx) && exercise.description && (
                        <div className="exercise-description-box">
                          {exercise.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="template-actions">
                  <button
                    className="btn-schedule-workout"
                    onClick={() => handleScheduleWorkout(template)}
                  >
                    📅 Add to Today's Calendar
                  </button>
                  <button
                    className="btn-delete-template"
                    onClick={() => onDelete(template.id)}
                  >
                    🗑️ Delete Template
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        </div>
      </div>

      {showCreateModal && (
        <CreateWorkoutModal
          newWorkout={newWorkout}
          setNewWorkout={setNewWorkout}
          currentExercise={currentExercise}
          setCurrentExercise={setCurrentExercise}
          muscleOptions={muscleOptions}
          toggleMuscle={toggleMuscle}
          handleAddExercise={handleAddExercise}
          handleRemoveExercise={handleRemoveExercise}
          handleSaveWorkout={handleSaveWorkout}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}

// Create Workout Modal Component
function CreateWorkoutModal({
  newWorkout,
  setNewWorkout,
  currentExercise,
  setCurrentExercise,
  muscleOptions,
  toggleMuscle,
  handleAddExercise,
  handleRemoveExercise,
  handleSaveWorkout,
  onClose
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-workout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Custom Workout</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Workout Details */}
          <div className="form-section">
            <h3>Workout Details</h3>
            
            <div className="form-group">
              <label>Workout Name *</label>
              <input
                type="text"
                placeholder="e.g., Push Day, Leg Day, Full Body"
                value={newWorkout.name}
                onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                placeholder="Brief description of this workout..."
                value={newWorkout.description}
                onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                className="form-textarea"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Target Muscles</label>
              <div className="muscle-selector">
                {muscleOptions.map(muscle => (
                  <button
                    key={muscle}
                    className={`muscle-btn ${newWorkout.muscles.includes(muscle) ? 'active' : ''}`}
                    onClick={() => toggleMuscle(muscle)}
                    type="button"
                  >
                    {muscle}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add Exercise */}
          <div className="form-section">
            <h3>Add Exercise</h3>
            
            <div className="form-group">
              <label>Exercise Name *</label>
              <input
                type="text"
                placeholder="e.g., Bench Press, Squats, Pull-ups"
                value={currentExercise.name}
                onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sets</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={currentExercise.sets}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, sets: parseInt(e.target.value) })}
                  className="form-input-small"
                />
              </div>

              <div className="form-group">
                <label>Reps</label>
                <input
                  type="text"
                  placeholder="e.g., 10, 8-12"
                  value={currentExercise.reps}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, reps: e.target.value })}
                  className="form-input-small"
                />
              </div>

              <div className="form-group">
                <label>Weight/Intensity</label>
                <input
                  type="text"
                  placeholder="e.g., 135 lbs, Moderate"
                  value={currentExercise.weight}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, weight: e.target.value })}
                  className="form-input-small"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                placeholder="Form cues, tips, or modifications..."
                value={currentExercise.description}
                onChange={(e) => setCurrentExercise({ ...currentExercise, description: e.target.value })}
                className="form-textarea"
                rows="2"
              />
            </div>

            <button className="btn-add-exercise" onClick={handleAddExercise}>
              ➕ Add Exercise
            </button>
          </div>

          {/* Exercise List */}
          {newWorkout.exercises.length > 0 && (
            <div className="form-section">
              <h3>Exercises ({newWorkout.exercises.length})</h3>
              <div className="exercise-list">
                {newWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="exercise-item">
                    <div className="exercise-item-content">
                      <div className="exercise-item-name">{exercise.name}</div>
                      <div className="exercise-item-specs">
                        {exercise.sets} × {exercise.reps} @ {exercise.weight}
                      </div>
                      {exercise.description && (
                        <div className="exercise-item-notes">{exercise.description}</div>
                      )}
                    </div>
                    <button
                      className="btn-remove-exercise"
                      onClick={() => handleRemoveExercise(index)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save-workout" onClick={handleSaveWorkout}>
            💾 Save Workout Template
          </button>
        </div>
      </div>
    </div>
  )
}
