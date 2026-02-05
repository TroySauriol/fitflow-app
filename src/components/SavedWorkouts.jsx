import './SavedWorkouts.css'
import { useState } from 'react'

export default function SavedWorkouts({ workoutTemplates, onDelete, onScheduleWorkout }) {
  const [expandedId, setExpandedId] = useState(null)
  const [expandedExercises, setExpandedExercises] = useState(new Set())

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
          <div className="empty-state">
            <div className="empty-icon">🏋️‍♂️</div>
            <h3>No Saved Workout Templates Yet</h3>
            <p>Generate a workout in the Chat tab and save it to create your workout library!</p>
            <div className="empty-state-tips">
              <h4>💡 Tips:</h4>
              <ul>
                <li>Save your favorite routines as templates</li>
                <li>Build a library of go-to workouts</li>
                <li>Schedule templates to your calendar when ready to workout</li>
              </ul>
            </div>
          </div>
        </div>
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
    </div>
  )
}
