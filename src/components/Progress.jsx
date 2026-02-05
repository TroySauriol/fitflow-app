import { useState } from 'react'
import './Progress.css'

export default function Progress({ records = {} }) {
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [timeRange, setTimeRange] = useState('all') // 'week', 'month', 'all'

  // Get all unique exercises
  const exercises = Object.keys(records).sort()

  // Get date range based on selection
  const getDateRange = () => {
    const now = new Date()
    let startDate = new Date('2000-01-01') // Very old date for 'all'

    if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (timeRange === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return startDate
  }

  // Parse date string to Date object
  const parseDate = (dateStr) => {
    const [month, day, year] = dateStr.split('/').map(Number)
    return new Date(year, month - 1, day)
  }

  // Get records for selected exercise within date range
  const getExerciseData = (exerciseName) => {
    if (!records[exerciseName]) return []

    const startDate = getDateRange()
    const filtered = records[exerciseName].filter(record => {
      try {
        const recordDate = parseDate(record.date)
        return recordDate >= startDate
      } catch {
        return false
      }
    })

    // Sort by date ascending
    return filtered.sort((a, b) => {
      const dateA = parseDate(a.date)
      const dateB = parseDate(b.date)
      return dateA - dateB
    })
  }

  // Get best set for each day
  const getBestSets = (exerciseName) => {
    const data = getExerciseData(exerciseName)
    const byDate = {}

    data.forEach(record => {
      if (!byDate[record.date]) {
        byDate[record.date] = []
      }
      byDate[record.date].push(record)
    })

    // For each date, get the best performance (highest weight, then reps)
    const bestByDate = {}
    Object.entries(byDate).forEach(([date, records]) => {
      bestByDate[date] = records.reduce((best, current) => {
        const currentTotal = parseInt(current.weight) * parseInt(current.reps)
        const bestTotal = parseInt(best.weight) * parseInt(best.reps)
        return currentTotal >= bestTotal ? current : best
      })
    })

    return Object.entries(bestByDate).map(([date, record]) => ({
      date,
      weight: record.weight,
      reps: record.reps,
      set: record.set || 1
    }))
  }

  // Calculate improvement stats
  const getImprovementStats = (exerciseName) => {
    const data = getExerciseData(exerciseName)
    if (data.length < 2) return null

    // Get first and last record
    const first = data[0]
    const last = data[data.length - 1]

    const firstTotal = parseInt(first.weight) * parseInt(first.reps)
    const lastTotal = parseInt(last.weight) * parseInt(last.reps)
    const improvement = lastTotal - firstTotal
    const improvementPercent = ((improvement / firstTotal) * 100).toFixed(1)

    return {
      firstDate: first.date,
      firstWeight: first.weight,
      firstReps: first.reps,
      lastDate: last.date,
      lastWeight: last.weight,
      lastReps: last.reps,
      improvement: improvement,
      improvementPercent: improvementPercent,
      totalSessions: new Set(data.map(r => r.date)).size
    }
  }

  // Get week-over-week comparison
  const getWeekComparison = (exerciseName) => {
    const data = getExerciseData(exerciseName)
    if (data.length === 0) return { currentWeek: [], previousWeek: [] }

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)

    const currentWeek = data.filter(record => {
      const recordDate = parseDate(record.date)
      return recordDate >= oneWeekAgo
    })

    const previousWeek = data.filter(record => {
      const recordDate = parseDate(record.date)
      return recordDate >= twoWeeksAgo && recordDate < oneWeekAgo
    })

    return { currentWeek, previousWeek }
  }

  const selectedData = selectedExercise ? getExerciseData(selectedExercise) : []
  const selectedStats = selectedExercise ? getImprovementStats(selectedExercise) : null
  const selectedBestSets = selectedExercise ? getBestSets(selectedExercise) : []
  const weekComparison = selectedExercise ? getWeekComparison(selectedExercise) : { currentWeek: [], previousWeek: [] }

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>💹 Workout Improvements</h2>
        <p>Track your progress and watch yourself get stronger</p>
      </div>

      <div className="progress-content">
        {exercises.length === 0 ? (
          <div className="empty-state">
            <h3>No workout data yet</h3>
            <p>Start logging sets on the Calendar or Saved Workouts tabs to see your progress!</p>
          </div>
        ) : (
          <>
            <div className="exercise-list">
              <h3>Exercises</h3>
              <div className="exercise-buttons">
                {exercises.map(exercise => {
                  const stats = getImprovementStats(exercise)
                  return (
                    <button
                      key={exercise}
                      className={`exercise-btn ${selectedExercise === exercise ? 'active' : ''}`}
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <div className="exercise-btn-name">{exercise}</div>
                      {stats && (
                        <div className="exercise-btn-improvement">
                          ↑ {stats.improvementPercent}%
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedExercise && (
              <div className="progress-details">
                <div className="details-header">
                  <h3>{selectedExercise}</h3>
                  <div className="time-range-selector">
                    <button
                      className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
                      onClick={() => setTimeRange('week')}
                    >
                      Last Week
                    </button>
                    <button
                      className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
                      onClick={() => setTimeRange('month')}
                    >
                      Last Month
                    </button>
                    <button
                      className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
                      onClick={() => setTimeRange('all')}
                    >
                      All Time
                    </button>
                  </div>
                </div>

                {selectedStats ? (
                  <div className="stats-grid">
                    <div className="stat-card improvement">
                      <div className="stat-icon">📈</div>
                      <div className="stat-content">
                        <div className="stat-label">Total Improvement</div>
                        <div className="stat-value">{selectedStats.improvement > 0 ? '+' : ''}{selectedStats.improvement}</div>
                        <div className="stat-detail">{selectedStats.improvementPercent}% increase</div>
                      </div>
                    </div>

                    <div className="stat-card sessions">
                      <div className="stat-icon">📅</div>
                      <div className="stat-content">
                        <div className="stat-label">Total Sessions</div>
                        <div className="stat-value">{selectedStats.totalSessions}</div>
                        <div className="stat-detail">with this exercise</div>
                      </div>
                    </div>

                    <div className="stat-card first">
                      <div className="stat-icon">🏁</div>
                      <div className="stat-content">
                        <div className="stat-label">First Record</div>
                        <div className="stat-value">{selectedStats.firstWeight} × {selectedStats.firstReps}</div>
                        <div className="stat-detail">{selectedStats.firstDate}</div>
                      </div>
                    </div>

                    <div className="stat-card best">
                      <div className="stat-icon">🏆</div>
                      <div className="stat-content">
                        <div className="stat-label">Current Best</div>
                        <div className="stat-value">{selectedStats.lastWeight} × {selectedStats.lastReps}</div>
                        <div className="stat-detail">{selectedStats.lastDate}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>No data available for this exercise in the selected time range</p>
                  </div>
                )}

                {weekComparison.currentWeek.length > 0 || weekComparison.previousWeek.length > 0 ? (
                  <div className="week-comparison">
                    <h4>Week-Over-Week Comparison</h4>
                    <div className="weeks-grid">
                      <div className="week-column">
                        <h5>Previous Week</h5>
                        {weekComparison.previousWeek.length > 0 ? (
                          <div className="week-sets">
                            {weekComparison.previousWeek.map((record, idx) => (
                              <div key={idx} className="week-set-item">
                                <span className="week-date">{record.date}</span>
                                <span className="week-performance">Set {record.set}: {record.weight} × {record.reps}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-data-small">No data</p>
                        )}
                      </div>

                      <div className="week-column">
                        <h5>Current Week</h5>
                        {weekComparison.currentWeek.length > 0 ? (
                          <div className="week-sets">
                            {weekComparison.currentWeek.map((record, idx) => (
                              <div key={idx} className="week-set-item current">
                                <span className="week-date">{record.date}</span>
                                <span className="week-performance">Set {record.set}: {record.weight} × {record.reps}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-data-small">No data</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {selectedBestSets.length > 0 && (
                  <div className="best-sets-timeline">
                    <h4>Best Performance by Day</h4>
                    <div className="timeline">
                      {selectedBestSets.map((record, idx) => (
                        <div key={idx} className="timeline-item">
                          <div className="timeline-date">{record.date}</div>
                          <div className="timeline-content">
                            <div className="timeline-weight">{record.weight} lbs</div>
                            <div className="timeline-reps">{record.reps} reps</div>
                            <div className="timeline-set">Set {record.set}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
