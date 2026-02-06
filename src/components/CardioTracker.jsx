import { useState, useEffect, useRef } from 'react'
import './CardioTracker.css'

export default function CardioTracker({ 
  cardioSessions, 
  onSaveSession, 
  onDeleteSession,
  onGenerateTrainingPlan 
}) {
  const [activeView, setActiveView] = useState('tracker') // tracker, history, plans
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [distance, setDistance] = useState(0)
  const [currentLap, setCurrentLap] = useState(1)
  const [laps, setLaps] = useState([])
  const [unit, setUnit] = useState('km') // km or mi
  const [activityType, setActivityType] = useState('run') // run, walk, cycle
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [sessionNotes, setSessionNotes] = useState('')
  
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const pausedTimeRef = useRef(0)

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = now - startTimeRef.current - pausedTimeRef.current
        setElapsedTime(elapsed)
      }, 10) // Update every 10ms for smooth display
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  // Format time as HH:MM:SS.ms
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const milliseconds = Math.floor((ms % 1000) / 10)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  }

  // Calculate pace (time per km or mile)
  const calculatePace = () => {
    if (distance === 0) return '--:--'
    const timeInMinutes = elapsedTime / 60000
    const paceMinutes = timeInMinutes / distance
    const minutes = Math.floor(paceMinutes)
    const seconds = Math.floor((paceMinutes - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Calculate speed (km/h or mph)
  const calculateSpeed = () => {
    if (distance === 0 || elapsedTime === 0) return '0.0'
    const timeInHours = elapsedTime / 3600000
    const speed = distance / timeInHours
    return speed.toFixed(1)
  }

  // Start tracking
  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now()
      pausedTimeRef.current = 0
      setIsRunning(true)
      setIsPaused(false)
    }
  }

  // Pause tracking
  const handlePause = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true)
      pausedTimeRef.current += Date.now() - startTimeRef.current - elapsedTime
    }
  }

  // Resume tracking
  const handleResume = () => {
    if (isPaused) {
      setIsPaused(false)
    }
  }

  // Stop and save
  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
    if (elapsedTime > 0) {
      setShowSaveModal(true)
    }
  }

  // Record lap
  const handleLap = () => {
    if (isRunning) {
      const lapData = {
        lapNumber: currentLap,
        time: elapsedTime,
        distance: distance,
        pace: calculatePace()
      }
      setLaps([...laps, lapData])
      setCurrentLap(currentLap + 1)
    }
  }

  // Save session
  const handleSaveSession = () => {
    const session = {
      id: Date.now(),
      type: activityType,
      date: new Date().toISOString(),
      duration: elapsedTime,
      distance: distance,
      unit: unit,
      pace: calculatePace(),
      speed: calculateSpeed(),
      laps: laps,
      notes: sessionNotes,
      calories: estimateCalories()
    }
    
    onSaveSession(session)
    
    // Reset
    setElapsedTime(0)
    setDistance(0)
    setLaps([])
    setCurrentLap(1)
    setSessionNotes('')
    setShowSaveModal(false)
  }

  // Estimate calories burned (rough estimate)
  const estimateCalories = () => {
    const timeInHours = elapsedTime / 3600000
    const distanceInKm = unit === 'km' ? distance : distance * 1.60934
    
    // Rough estimates based on activity type
    const caloriesPerKm = {
      run: 60,
      walk: 40,
      cycle: 30
    }
    
    return Math.round(distanceInKm * caloriesPerKm[activityType])
  }

  // Get recent sessions
  const getRecentSessions = () => {
    return [...cardioSessions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
  }

  // Calculate stats
  const getTotalDistance = () => {
    return cardioSessions.reduce((sum, session) => {
      const dist = session.unit === unit ? session.distance : 
                   (unit === 'km' ? session.distance * 1.60934 : session.distance / 1.60934)
      return sum + dist
    }, 0).toFixed(1)
  }

  const getTotalTime = () => {
    const total = cardioSessions.reduce((sum, session) => sum + session.duration, 0)
    return formatTime(total)
  }

  const getAveragePace = () => {
    if (cardioSessions.length === 0) return '--:--'
    const totalDistance = cardioSessions.reduce((sum, s) => sum + s.distance, 0)
    const totalTime = cardioSessions.reduce((sum, s) => sum + s.duration, 0)
    if (totalDistance === 0) return '--:--'
    
    const avgPaceMinutes = (totalTime / 60000) / totalDistance
    const minutes = Math.floor(avgPaceMinutes)
    const seconds = Math.floor((avgPaceMinutes - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="cardio-tracker">
      <div className="cardio-header">
        <h2>🏃 Cardio Tracker</h2>
        <p>Track your runs, walks, and rides</p>
      </div>

      {/* View Tabs */}
      <div className="cardio-tabs">
        <button
          className={`cardio-tab ${activeView === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveView('tracker')}
        >
          ⏱️ Tracker
        </button>
        <button
          className={`cardio-tab ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => setActiveView('history')}
        >
          📊 History
        </button>
        <button
          className={`cardio-tab ${activeView === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveView('plans')}
        >
          📋 Training Plans
        </button>
      </div>

      {/* Tracker View */}
      {activeView === 'tracker' && (
        <div className="tracker-view">
          {/* Activity Type Selector */}
          <div className="activity-selector">
            <button
              className={`activity-btn ${activityType === 'run' ? 'active' : ''}`}
              onClick={() => setActivityType('run')}
              disabled={isRunning}
            >
              🏃 Run
            </button>
            <button
              className={`activity-btn ${activityType === 'walk' ? 'active' : ''}`}
              onClick={() => setActivityType('walk')}
              disabled={isRunning}
            >
              🚶 Walk
            </button>
            <button
              className={`activity-btn ${activityType === 'cycle' ? 'active' : ''}`}
              onClick={() => setActivityType('cycle')}
              disabled={isRunning}
            >
              🚴 Cycle
            </button>
          </div>

          {/* Main Display */}
          <div className="tracker-display">
            <div className="main-timer">
              <div className="timer-label">Time</div>
              <div className="timer-value">{formatTime(elapsedTime)}</div>
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-label">Distance</div>
                <div className="stat-value-container">
                  <input
                    type="number"
                    className="distance-input"
                    value={distance}
                    onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    disabled={isRunning}
                  />
                  <select
                    className="unit-selector"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    disabled={isRunning}
                  >
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                  </select>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-label">Pace</div>
                <div className="stat-value">{calculatePace()}</div>
                <div className="stat-unit">/{unit}</div>
              </div>

              <div className="stat-box">
                <div className="stat-label">Speed</div>
                <div className="stat-value">{calculateSpeed()}</div>
                <div className="stat-unit">{unit}/h</div>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-label">Calories</div>
                <div className="stat-value">{estimateCalories()}</div>
                <div className="stat-unit">kcal</div>
              </div>

              <div className="stat-box">
                <div className="stat-label">Current Lap</div>
                <div className="stat-value">{currentLap}</div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="tracker-controls">
            {!isRunning ? (
              <button className="control-btn start-btn" onClick={handleStart}>
                ▶️ Start
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button className="control-btn pause-btn" onClick={handlePause}>
                    ⏸️ Pause
                  </button>
                ) : (
                  <button className="control-btn resume-btn" onClick={handleResume}>
                    ▶️ Resume
                  </button>
                )}
                <button className="control-btn lap-btn" onClick={handleLap}>
                  🔄 Lap
                </button>
                <button className="control-btn stop-btn" onClick={handleStop}>
                  ⏹️ Finish
                </button>
              </>
            )}
          </div>

          {/* Laps */}
          {laps.length > 0 && (
            <div className="laps-section">
              <h3>Laps</h3>
              <div className="laps-list">
                {laps.map((lap, index) => (
                  <div key={index} className="lap-item">
                    <div className="lap-number">Lap {lap.lapNumber}</div>
                    <div className="lap-time">{formatTime(lap.time)}</div>
                    <div className="lap-pace">{lap.pace}/{unit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div className="history-view">
          <div className="history-stats">
            <div className="history-stat-card">
              <div className="history-stat-value">{getTotalDistance()}</div>
              <div className="history-stat-label">Total {unit}</div>
            </div>
            <div className="history-stat-card">
              <div className="history-stat-value">{getTotalTime()}</div>
              <div className="history-stat-label">Total Time</div>
            </div>
            <div className="history-stat-card">
              <div className="history-stat-value">{getAveragePace()}</div>
              <div className="history-stat-label">Avg Pace</div>
            </div>
            <div className="history-stat-card">
              <div className="history-stat-value">{cardioSessions.length}</div>
              <div className="history-stat-label">Sessions</div>
            </div>
          </div>

          <div className="sessions-list">
            <h3>Recent Sessions</h3>
            {getRecentSessions().length > 0 ? (
              getRecentSessions().map(session => (
                <div key={session.id} className="session-card">
                  <div className="session-header">
                    <div className="session-type">
                      {session.type === 'run' && '🏃'}
                      {session.type === 'walk' && '🚶'}
                      {session.type === 'cycle' && '🚴'}
                      <span>{session.type.charAt(0).toUpperCase() + session.type.slice(1)}</span>
                    </div>
                    <div className="session-date">
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <button
                      className="delete-session-btn"
                      onClick={() => onDeleteSession(session.id)}
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="session-stats">
                    <div className="session-stat">
                      <span className="session-stat-label">Distance:</span>
                      <span className="session-stat-value">{session.distance.toFixed(2)} {session.unit}</span>
                    </div>
                    <div className="session-stat">
                      <span className="session-stat-label">Time:</span>
                      <span className="session-stat-value">{formatTime(session.duration)}</span>
                    </div>
                    <div className="session-stat">
                      <span className="session-stat-label">Pace:</span>
                      <span className="session-stat-value">{session.pace}/{session.unit}</span>
                    </div>
                    <div className="session-stat">
                      <span className="session-stat-label">Calories:</span>
                      <span className="session-stat-value">{session.calories} kcal</span>
                    </div>
                  </div>
                  {session.notes && (
                    <div className="session-notes">
                      <strong>Notes:</strong> {session.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-history">
                <p>No sessions yet. Start tracking your first run!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Training Plans View */}
      {activeView === 'plans' && (
        <div className="plans-view">
          <div className="plans-header">
            <h3>AI Training Plans</h3>
            <p>Get personalized training plans from AI</p>
          </div>

          <div className="plan-examples">
            <div className="example-prompt">
              <div className="example-icon">💡</div>
              <div className="example-text">
                "It's my first time running a 5K race. It's in 4 weeks and I need a training plan so I'm ready for it"
              </div>
            </div>
            <div className="example-prompt">
              <div className="example-icon">💡</div>
              <div className="example-text">
                "I want to improve my 10K time from 55 minutes to 50 minutes in 8 weeks"
              </div>
            </div>
            <div className="example-prompt">
              <div className="example-icon">💡</div>
              <div className="example-text">
                "Create a beginner marathon training plan for someone who can run 5K comfortably"
              </div>
            </div>
          </div>

          <button
            className="generate-plan-btn"
            onClick={() => onGenerateTrainingPlan()}
          >
            🤖 Generate Training Plan in Chat
          </button>

          <div className="plan-tips">
            <h4>Training Plan Tips:</h4>
            <ul>
              <li>Be specific about your current fitness level</li>
              <li>Mention your goal race distance and date</li>
              <li>Include any injuries or limitations</li>
              <li>Specify how many days per week you can train</li>
            </ul>
          </div>
        </div>
      )}

      {/* Save Session Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="save-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Save Session</h3>
            <div className="modal-stats">
              <div className="modal-stat">
                <strong>Time:</strong> {formatTime(elapsedTime)}
              </div>
              <div className="modal-stat">
                <strong>Distance:</strong> {distance} {unit}
              </div>
              <div className="modal-stat">
                <strong>Pace:</strong> {calculatePace()}/{unit}
              </div>
              <div className="modal-stat">
                <strong>Calories:</strong> {estimateCalories()} kcal
              </div>
            </div>
            <textarea
              className="session-notes-input"
              placeholder="Add notes about your session (optional)"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows="3"
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveSession}>
                Save Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
