import { useState } from 'react'
import './Dashboard.css'

export default function Dashboard({ 
  workoutTemplates, 
  calendarWorkouts, 
  personalRecords, 
  onNavigateToTab 
}) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('week')

  // Calculate stats
  const getRecentWorkouts = () => {
    const now = new Date()
    const daysAgo = selectedTimeRange === 'week' ? 7 : 30
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    return calendarWorkouts.filter(workout => {
      const workoutDate = new Date(workout.savedAt)
      return workoutDate >= cutoff
    })
  }

  const getWorkoutStreak = () => {
    const sortedWorkouts = [...calendarWorkouts]
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
    
    let streak = 0
    let currentDate = new Date()
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.savedAt)
      const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= 1) {
        streak++
        currentDate = workoutDate
      } else {
        break
      }
    }
    
    return streak
  }

  const getTopExercises = () => {
    const exerciseCounts = {}
    
    Object.keys(personalRecords).forEach(exercise => {
      exerciseCounts[exercise] = personalRecords[exercise].length
    })
    
    return Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
  }

  const getUpcomingWorkouts = () => {
    const today = new Date().toLocaleDateString()
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()
    
    return calendarWorkouts.filter(workout => 
      workout.savedAt === today || workout.savedAt === tomorrow
    )
  }

  const recentWorkouts = getRecentWorkouts()
  const workoutStreak = getWorkoutStreak()
  const topExercises = getTopExercises()
  const upcomingWorkouts = getUpcomingWorkouts()

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🏠 Dashboard</h2>
        <p>Your fitness journey at a glance</p>
      </div>

      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="dashboard-card stats-card">
          <h3>📊 Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{workoutTemplates.length}</div>
              <div className="stat-label">Saved Templates</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{calendarWorkouts.length}</div>
              <div className="stat-label">Total Workouts</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{workoutStreak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{Object.keys(personalRecords).length}</div>
              <div className="stat-label">Exercises Tracked</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h3>🔥 Recent Activity</h3>
            <div className="time-range-selector">
              <button 
                className={selectedTimeRange === 'week' ? 'active' : ''}
                onClick={() => setSelectedTimeRange('week')}
              >
                Week
              </button>
              <button 
                className={selectedTimeRange === 'month' ? 'active' : ''}
                onClick={() => setSelectedTimeRange('month')}
              >
                Month
              </button>
            </div>
          </div>
          
          {recentWorkouts.length > 0 ? (
            <div className="recent-workouts-list">
              {recentWorkouts.slice(0, 4).map(workout => (
                <div key={workout.id} className="recent-workout-item">
                  <div className="workout-info">
                    <div className="workout-name">{workout.name}</div>
                    <div className="workout-date">{workout.savedAt}</div>
                  </div>
                  <div className="workout-muscles">
                    {workout.muscles?.slice(0, 2).map(muscle => (
                      <span key={muscle} className="muscle-tag-small">{muscle}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-activity">
              <p>No recent workouts</p>
              <button 
                className="btn-start-workout"
                onClick={() => onNavigateToTab('chat')}
              >
                Start Your First Workout
              </button>
            </div>
          )}
        </div>

        {/* Top Exercises */}
        <div className="dashboard-card exercises-card">
          <h3>💪 Most Trained Exercises</h3>
          {topExercises.length > 0 ? (
            <div className="top-exercises-list">
              {topExercises.map(([exercise, count], index) => (
                <div key={exercise} className="exercise-rank-item">
                  <div className="rank-number">#{index + 1}</div>
                  <div className="exercise-info">
                    <div className="exercise-name">{exercise}</div>
                    <div className="exercise-count">{count} sets logged</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-exercises">
              <p>Start logging workouts to see your top exercises</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card actions-card">
          <h3>⚡ Quick Actions</h3>
          <div className="quick-actions">
            <button 
              className="action-btn generate-btn"
              onClick={() => onNavigateToTab('chat')}
            >
              <span className="action-icon">🤖</span>
              <span className="action-text">Generate Workout</span>
            </button>
            <button 
              className="action-btn calendar-btn"
              onClick={() => onNavigateToTab('calendar')}
            >
              <span className="action-icon">📅</span>
              <span className="action-text">View Calendar</span>
            </button>
            <button 
              className="action-btn templates-btn"
              onClick={() => onNavigateToTab('saved')}
            >
              <span className="action-icon">📋</span>
              <span className="action-text">Browse Templates</span>
            </button>
            <button 
              className="action-btn progress-btn"
              onClick={() => onNavigateToTab('progress')}
            >
              <span className="action-icon">📈</span>
              <span className="action-text">View Progress</span>
            </button>
          </div>
        </div>

        {/* Upcoming Workouts */}
        {upcomingWorkouts.length > 0 && (
          <div className="dashboard-card upcoming-card">
            <h3>📅 Upcoming Workouts</h3>
            <div className="upcoming-workouts-list">
              {upcomingWorkouts.map(workout => (
                <div key={workout.id} className="upcoming-workout-item">
                  <div className="upcoming-workout-info">
                    <div className="upcoming-workout-name">{workout.name}</div>
                    <div className="upcoming-workout-date">
                      {workout.savedAt === new Date().toLocaleDateString() ? 'Today' : 'Tomorrow'}
                    </div>
                  </div>
                  <button 
                    className="btn-start-upcoming"
                    onClick={() => onNavigateToTab('calendar')}
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}