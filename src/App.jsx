import { useState, useEffect } from 'react'
import './App.css'
import ChatInterface from './components/ChatInterface'
import SavedWorkouts from './components/SavedWorkouts'
import PersonalRecords from './components/PersonalRecords'
import WorkoutCalendar from './components/WorkoutCalendar'
import AccountSidebar from './components/AccountSidebar'
import Progress from './components/Progress'
import Dashboard from './components/Dashboard'
import CardioTracker from './components/CardioTracker'
import Logo from './components/Logo'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [workoutTemplates, setWorkoutTemplates] = useState([]) // Saved workout routines (menu)
  const [calendarWorkouts, setCalendarWorkouts] = useState([]) // Scheduled/completed workouts
  const [cardioSessions, setCardioSessions] = useState([]) // Cardio tracking sessions
  const [personalRecords, setPersonalRecords] = useState({})
  const [preferences, setPreferences] = useState({
    injuries: [],
    excludedExercises: [],
    availableEquipment: []
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const templates = localStorage.getItem('workoutTemplates')
    const calendar = localStorage.getItem('calendarWorkouts')
    const cardio = localStorage.getItem('cardioSessions')
    const records = localStorage.getItem('personalRecords')
    const prefs = localStorage.getItem('userPreferences')
    if (templates) setWorkoutTemplates(JSON.parse(templates))
    if (calendar) setCalendarWorkouts(JSON.parse(calendar))
    if (cardio) setCardioSessions(JSON.parse(cardio))
    if (records) setPersonalRecords(JSON.parse(records))
    if (prefs) setPreferences(JSON.parse(prefs))
  }, [])

  // Save preferences to localStorage
  const handlePreferencesChange = (newPreferences) => {
    setPreferences(newPreferences)
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences))
  }

  // Save workout template (from AI chat)
  const handleSaveWorkoutTemplate = (workout) => {
    const newTemplate = { 
      ...workout, 
      id: Date.now(),
      createdAt: new Date().toLocaleDateString(),
      type: 'template' // Mark as template
    }
    const newTemplates = [...workoutTemplates, newTemplate]
    setWorkoutTemplates(newTemplates)
    localStorage.setItem('workoutTemplates', JSON.stringify(newTemplates))
  }

  // Delete workout template
  const handleDeleteWorkoutTemplate = (id) => {
    const filtered = workoutTemplates.filter(w => w.id !== id)
    setWorkoutTemplates(filtered)
    localStorage.setItem('workoutTemplates', JSON.stringify(filtered))
  }

  // Save workout to calendar (scheduled or completed)
  const handleSaveCalendarWorkout = (workout) => {
    const newCalendarWorkout = { 
      ...workout, 
      id: Date.now(),
      savedAt: workout.savedAt || new Date().toLocaleDateString(),
      type: 'calendar' // Mark as calendar entry
    }
    const newCalendarWorkouts = [...calendarWorkouts, newCalendarWorkout]
    setCalendarWorkouts(newCalendarWorkouts)
    localStorage.setItem('calendarWorkouts', JSON.stringify(newCalendarWorkouts))
  }

  // Delete calendar workout
  const handleDeleteCalendarWorkout = (id) => {
    const filtered = calendarWorkouts.filter(w => w.id !== id)
    setCalendarWorkouts(filtered)
    localStorage.setItem('calendarWorkouts', JSON.stringify(filtered))
  }

  // Update personal records with set info
  const handleUpdateRecord = (exercise, weight, reps, setNumber = 1, rpe = 0) => {
    const updated = { ...personalRecords }
    if (!updated[exercise]) {
      updated[exercise] = []
    }
    updated[exercise].push({ 
      weight, 
      reps, 
      date: new Date().toLocaleDateString(),
      set: setNumber,
      rpe: rpe || 0
    })
    setPersonalRecords(updated)
    localStorage.setItem('personalRecords', JSON.stringify(updated))
  }

  // Save cardio session
  const handleSaveCardioSession = (session) => {
    const newSessions = [...cardioSessions, session]
    setCardioSessions(newSessions)
    localStorage.setItem('cardioSessions', JSON.stringify(newSessions))
  }

  // Delete cardio session
  const handleDeleteCardioSession = (id) => {
    const filtered = cardioSessions.filter(s => s.id !== id)
    setCardioSessions(filtered)
    localStorage.setItem('cardioSessions', JSON.stringify(filtered))
  }

  // Navigate to chat for training plan
  const handleGenerateTrainingPlan = () => {
    setActiveTab('chat')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <Logo onNavigateHome={() => setActiveTab('dashboard')} />
          <div className="header-text">
            <p>Get personalized workouts powered by AI</p>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          🏠 Dashboard
        </button>
        <button
          className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button
          className={`nav-btn ${activeTab === 'cardio' ? 'active' : ''}`}
          onClick={() => setActiveTab('cardio')}
        >
          🏃 Cardio
        </button>
        <button
          className={`nav-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendar
        </button>
        <button
          className={`nav-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          📋 Templates
        </button>
        <button
          className={`nav-btn ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          🏆 Records
        </button>
        <button
          className={`nav-btn ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          📈 Progress
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            workoutTemplates={workoutTemplates}
            calendarWorkouts={calendarWorkouts}
            personalRecords={personalRecords}
            onNavigateToTab={setActiveTab}
          />
        )}
        {activeTab === 'chat' && (
          <ChatInterface 
            onSaveWorkout={handleSaveWorkoutTemplate}
            preferences={preferences}
          />
        )}
        {activeTab === 'cardio' && (
          <CardioTracker
            cardioSessions={cardioSessions}
            onSaveSession={handleSaveCardioSession}
            onDeleteSession={handleDeleteCardioSession}
            onGenerateTrainingPlan={handleGenerateTrainingPlan}
          />
        )}
        {activeTab === 'calendar' && (
          <WorkoutCalendar
            calendarWorkouts={calendarWorkouts}
            workoutTemplates={workoutTemplates}
            personalRecords={personalRecords}
            onUpdateRecord={handleUpdateRecord}
            onDeleteWorkout={handleDeleteCalendarWorkout}
            onSaveWorkout={handleSaveCalendarWorkout}
          />
        )}
        {activeTab === 'saved' && (
          <SavedWorkouts
            workoutTemplates={workoutTemplates}
            onDelete={handleDeleteWorkoutTemplate}
            onScheduleWorkout={handleSaveCalendarWorkout}
            onSaveTemplate={handleSaveWorkoutTemplate}
          />
        )}
        {activeTab === 'records' && (
          <PersonalRecords records={personalRecords} />
        )}
        {activeTab === 'progress' && (
          <Progress records={personalRecords} />
        )}
      </main>

      <AccountSidebar 
        preferences={preferences}
        onPreferencesChange={handlePreferencesChange}
      />
    </div>
  )
}

export default App
