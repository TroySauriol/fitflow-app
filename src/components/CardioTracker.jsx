import { useState, useEffect, useRef } from 'react'
import './CardioTracker.css'
import HeartRateMonitor from '../services/heartRateMonitor'
import HeartRateZones from '../services/heartRateZones'

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
  const [useGPS, setUseGPS] = useState(false)
  const [gpsAvailable, setGpsAvailable] = useState(false)
  const [gpsError, setGpsError] = useState(null)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [route, setRoute] = useState([]) // Array of {lat, lng, timestamp}
  
  // Heart Rate Monitor state
  const [hrMonitor] = useState(() => new HeartRateMonitor())
  const [hrZones] = useState(() => new HeartRateZones(30)) // Default age 30, can be customized
  const [currentHR, setCurrentHR] = useState(0)
  const [avgHR, setAvgHR] = useState(0)
  const [maxHR, setMaxHR] = useState(0)
  const [hrHistory, setHrHistory] = useState([])
  const [hrConnected, setHrConnected] = useState(false)
  const [hrDeviceName, setHrDeviceName] = useState('')
  const [hrError, setHrError] = useState(null)
  const [timeInZones, setTimeInZones] = useState({
    recovery: 0,
    fatBurn: 0,
    cardio: 0,
    threshold: 0,
    peak: 0
  })
  
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const pausedTimeRef = useRef(0)
  const watchIdRef = useRef(null)
  const lastPositionRef = useRef(null)
  const lastZoneUpdateRef = useRef(Date.now())

  // Check GPS availability on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setGpsAvailable(true)
    } else {
      setGpsAvailable(false)
      setGpsError('GPS not available on this device')
    }
  }, [])

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in km
  }

  // GPS tracking
  useEffect(() => {
    if (isRunning && !isPaused && useGPS && gpsAvailable) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }

      const successCallback = (position) => {
        const { latitude, longitude, speed, accuracy } = position.coords
        const timestamp = position.timestamp

        // Add to route
        setRoute(prev => [...prev, { 
          lat: latitude, 
          lng: longitude, 
          timestamp,
          accuracy,
          speed: speed || 0
        }])

        // Calculate distance if we have a previous position
        if (lastPositionRef.current) {
          const distanceIncrement = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            latitude,
            longitude
          )
          
          // Only add distance if accuracy is good (< 50m) and increment is reasonable (< 100m)
          if (accuracy < 50 && distanceIncrement < 0.1) {
            setDistance(prev => prev + distanceIncrement)
          }
        }

        // Update current speed (convert m/s to km/h)
        if (speed !== null && speed > 0) {
          const speedKmh = speed * 3.6
          setCurrentSpeed(speedKmh)
        }

        lastPositionRef.current = { lat: latitude, lng: longitude }
      }

      const errorCallback = (error) => {
        console.error('GPS Error:', error)
        setGpsError(error.message)
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        options
      )
    } else {
      // Stop watching position
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [isRunning, isPaused, useGPS, gpsAvailable])

  // Heart Rate Monitor tracking
  useEffect(() => {
    if (isRunning && !isPaused && hrConnected) {
      // Update time in zones every second
      const zoneInterval = setInterval(() => {
        if (currentHR > 0) {
          const zone = hrZones.getCurrentZone(currentHR)
          if (zone && zone.key !== 'resting' && zone.key !== 'maximum') {
            setTimeInZones(prev => ({
              ...prev,
              [zone.key]: prev[zone.key] + 1
            }))
          }
        }
      }, 1000)

      return () => clearInterval(zoneInterval)
    }
  }, [isRunning, isPaused, hrConnected, currentHR, hrZones])

  // Setup heart rate monitor callbacks
  useEffect(() => {
    hrMonitor.onHeartRateChange = (hr) => {
      if (hr && hr > 0) {
        setCurrentHR(hr)
        setHrHistory(prev => [...prev, { hr, timestamp: Date.now() }])
        
        // Update max HR
        if (hr > maxHR) {
          setMaxHR(hr)
        }
        
        // Calculate average HR
        const recentHistory = [...hrHistory, { hr }].slice(-60) // Last 60 readings
        const avg = recentHistory.reduce((sum, h) => sum + h.hr, 0) / recentHistory.length
        setAvgHR(Math.round(avg))
      }
    }

    hrMonitor.onConnectionChange = (connected) => {
      setHrConnected(connected)
      if (!connected) {
        setCurrentHR(0)
        setHrDeviceName('')
        setHrError('Heart rate monitor disconnected')
      }
    }

    return () => {
      hrMonitor.onHeartRateChange = null
      hrMonitor.onConnectionChange = null
    }
  }, [hrMonitor, hrHistory, maxHR])

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
    if (useGPS && currentSpeed > 0) {
      // Use GPS speed if available
      const speed = unit === 'km' ? currentSpeed : currentSpeed / 1.60934
      return speed.toFixed(1)
    }
    
    // Fallback to calculated speed
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
      setRoute([])
      lastPositionRef.current = null
      setGpsError(null)
      
      // Request GPS permission if using GPS
      if (useGPS && gpsAvailable) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('GPS initialized:', position.coords)
          },
          (error) => {
            console.error('GPS permission denied:', error)
            setGpsError('GPS permission denied. Please enable location access.')
          }
        )
      }
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
      calories: estimateCalories(),
      gpsTracked: useGPS,
      route: useGPS ? route : null,
      heartRate: hrConnected ? {
        average: avgHR,
        maximum: maxHR,
        history: hrHistory,
        timeInZones: timeInZones
      } : null
    }
    
    onSaveSession(session)
    
    // Reset
    setElapsedTime(0)
    setDistance(0)
    setLaps([])
    setCurrentLap(1)
    setSessionNotes('')
    setRoute([])
    setCurrentSpeed(0)
    lastPositionRef.current = null
    setShowSaveModal(false)
    
    // Reset HR data
    setCurrentHR(0)
    setAvgHR(0)
    setMaxHR(0)
    setHrHistory([])
    setTimeInZones({
      recovery: 0,
      fatBurn: 0,
      cardio: 0,
      threshold: 0,
      peak: 0
    })
  }

  // Heart Rate Monitor handlers
  const handleConnectHR = async () => {
    const support = hrMonitor.isSupported()
    if (!support.supported) {
      setHrError(support.reason)
      alert(support.reason + '\n\nTry using Chrome or Edge browser.')
      return
    }

    setHrError(null)
    const result = await hrMonitor.connect()
    
    if (result.success) {
      setHrDeviceName(result.deviceName)
      setHrConnected(true)
      alert(`✅ Connected to ${result.deviceName}!`)
    } else {
      setHrError(result.error)
      alert(`❌ ${result.error}`)
    }
  }

  const handleDisconnectHR = async () => {
    await hrMonitor.disconnect()
    setHrConnected(false)
    setCurrentHR(0)
    setHrDeviceName('')
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
          {/* GPS Toggle */}
          {gpsAvailable && (
            <div className="gps-toggle-container">
              <label className="gps-toggle">
                <input
                  type="checkbox"
                  checked={useGPS}
                  onChange={(e) => setUseGPS(e.target.checked)}
                  disabled={isRunning}
                />
                <span className="gps-toggle-label">
                  📍 Use GPS Tracking
                  {useGPS && isRunning && !isPaused && (
                    <span className="gps-active-indicator">● Live</span>
                  )}
                </span>
              </label>
              {gpsError && (
                <div className="gps-error">⚠️ {gpsError}</div>
              )}
              {useGPS && !isRunning && (
                <div className="gps-info">
                  GPS will automatically track distance and pace
                </div>
              )}
            </div>
          )}

          {/* Heart Rate Monitor Toggle */}
          <div className="hr-toggle-container">
            {!hrConnected ? (
              <button className="btn-connect-hr" onClick={handleConnectHR} disabled={isRunning}>
                ❤️ Connect Heart Rate Monitor
              </button>
            ) : (
              <div className="hr-connected-info">
                <div className="hr-device-name">
                  ❤️ {hrDeviceName}
                  {isRunning && !isPaused && currentHR > 0 && (
                    <span className="hr-live-indicator">● Live</span>
                  )}
                </div>
                {!isRunning && (
                  <button className="btn-disconnect-hr" onClick={handleDisconnectHR}>
                    Disconnect
                  </button>
                )}
              </div>
            )}
            {hrError && (
              <div className="hr-error">⚠️ {hrError}</div>
            )}
          </div>

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
                  {useGPS ? (
                    <>
                      <div className="distance-display">{distance.toFixed(2)}</div>
                      <div className="unit-display">{unit}</div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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

              {hrConnected && currentHR > 0 && (
                <div className="stat-box hr-stat-box">
                  <div className="stat-label">Heart Rate</div>
                  <div className="stat-value hr-value">{currentHR}</div>
                  <div className="stat-unit">BPM</div>
                </div>
              )}
            </div>

            {/* Heart Rate Zone Display */}
            {hrConnected && currentHR > 0 && (
              <div className="hr-zone-display">
                {(() => {
                  const zone = hrZones.getCurrentZone(currentHR)
                  return zone ? (
                    <>
                      <div className="hr-zone-name" style={{ color: zone.color }}>
                        {zone.name} Zone
                      </div>
                      <div className="hr-zone-bar">
                        <div 
                          className="hr-zone-fill" 
                          style={{ 
                            width: `${(currentHR / hrZones.maxHR) * 100}%`,
                            background: zone.color
                          }}
                        />
                      </div>
                      <div className="hr-zone-stats">
                        <span>Avg: {avgHR} BPM</span>
                        <span>Max: {maxHR} BPM</span>
                      </div>
                    </>
                  ) : null
                })()}
              </div>
            )}
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
                      {session.gpsTracked && (
                        <span className="gps-badge">📍 GPS</span>
                      )}
                      {session.heartRate && (
                        <span className="session-hr-badge">❤️ HR</span>
                      )}
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
                    {session.heartRate && (
                      <>
                        <div className="session-stat">
                          <span className="session-stat-label">Avg HR:</span>
                          <span className="session-stat-value">{session.heartRate.average} BPM</span>
                        </div>
                        <div className="session-stat">
                          <span className="session-stat-label">Max HR:</span>
                          <span className="session-stat-value">{session.heartRate.maximum} BPM</span>
                        </div>
                      </>
                    )}
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
