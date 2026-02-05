import { useState } from 'react'
import './ChatInterface.css'
import { generateWorkout } from '../services/workoutGenerator'

export default function ChatInterface({ onSaveWorkout, preferences = {} }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 Tell me what muscles you want to target or what your fitness goal is, and I'll create a personalized workout plan for you!",
      sender: 'bot'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentWorkout, setCurrentWorkout] = useState(null)
  const [expandedExercises, setExpandedExercises] = useState(new Set())

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user'
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Generate workout
    try {
      const workout = await generateWorkout(input, preferences)
      setCurrentWorkout(workout)

      const botMessage = {
        id: Date.now() + 1,
        text: `Great! I've created a workout plan for you:`,
        sender: 'bot',
        workout: workout
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't generate a workout. Please try again!",
        sender: 'bot'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCurrentWorkout = () => {
    if (currentWorkout) {
      onSaveWorkout({
        ...currentWorkout,
        savedAt: new Date().toLocaleDateString()
      })
      const message = {
        id: Date.now(),
        text: '✅ Workout saved! You can view it in the "Saved Workouts" tab.',
        sender: 'bot'
      }
      setMessages(prev => [...prev, message])
    }
  }

  const toggleExercise = (index) => {
    const newExpanded = new Set(expandedExercises)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedExercises(newExpanded)
  }

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-text">{msg.text}</div>
            {msg.workout && (
              <div className="workout-preview">
                <h4>{msg.workout.name}</h4>
                <div className="exercises-list">
                  {msg.workout.exercises.map((ex, idx) => (
                    <div key={idx} className="exercise-item">
                      <div
                        className="exercise-header"
                        onClick={() => toggleExercise(idx)}
                      >
                        <div className="exercise-title">
                          <span className="exercise-name">{ex.name}</span>
                          <span className="exercise-details">{ex.sets} × {ex.reps} • {ex.weight}</span>
                        </div>
                        <span className="expand-arrow">
                          {expandedExercises.has(idx) ? '▼' : '▶'}
                        </span>
                      </div>
                      {expandedExercises.has(idx) && ex.description && (
                        <div className="exercise-description">
                          {ex.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button className="save-btn" onClick={handleSaveCurrentWorkout}>
                  💾 Save This Workout
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message bot loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What muscles do you want to target today? (e.g., 'chest and triceps')"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  )
}
