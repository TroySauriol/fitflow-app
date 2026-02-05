import { useState, useEffect } from 'react'
import './AccountSidebar.css'
import Preferences from './Preferences'
// Temporarily disabled AuthModal
// import AuthModal from './AuthModal'

export default function AccountSidebar({ preferences, onPreferencesChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile')
    return saved ? JSON.parse(saved) : {
      name: 'Guest User',
      email: '',
      joinDate: new Date().toLocaleDateString(),
      goal: 'muscle-gain',
      level: 'intermediate'
    }
  })

  // Check for existing authentication on mount
  useEffect(() => {
    const authData = localStorage.getItem('userAuth')
    if (authData) {
      setUser(JSON.parse(authData))
    }
  }, [])

  const handleSaveProfile = (profile) => {
    setUserProfile(profile)
    localStorage.setItem('userProfile', JSON.stringify(profile))
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setUserProfile(prev => ({
      ...prev,
      name: userData.name,
      email: userData.email,
      joinDate: userData.joinDate
    }))
  }

  const handleSignOut = () => {
    localStorage.removeItem('userAuth')
    setUser(null)
    setUserProfile(prev => ({
      ...prev,
      name: 'Guest User',
      email: ''
    }))
    alert('You have been signed out successfully.')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.removeItem('userAuth')
      localStorage.removeItem('userProfile')
      localStorage.removeItem('workoutTemplates')
      localStorage.removeItem('calendarWorkouts')
      localStorage.removeItem('personalRecords')
      localStorage.removeItem('userPreferences')
      setUser(null)
      setUserProfile({
        name: 'Guest User',
        email: '',
        joinDate: new Date().toLocaleDateString(),
        goal: 'muscle-gain',
        level: 'intermediate'
      })
      alert('Your account and all data have been deleted.')
      setIsOpen(false)
    }
  }

  const exportData = () => {
    const data = {
      profile: userProfile,
      preferences: preferences,
      workoutTemplates: JSON.parse(localStorage.getItem('workoutTemplates') || '[]'),
      calendarWorkouts: JSON.parse(localStorage.getItem('calendarWorkouts') || '[]'),
      personalRecords: JSON.parse(localStorage.getItem('personalRecords') || '{}'),
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitflow-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        className="account-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Account & Settings"
      >
        {user ? '👤' : '🔐'}
      </button>

      {/* Sidebar */}
      <div className={`account-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Account</h2>
          <button className="btn-close-sidebar" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {!user ? (
          // Guest/Unauthenticated State
          <div className="guest-state">
            <div className="guest-avatar">🔐</div>
            <h3>Welcome to FitFlow</h3>
            <p>Sign in to save your progress, sync across devices, and unlock premium features.</p>
            
            <div className="guest-actions">
              <button 
                className="btn-primary"
                onClick={() => alert('Sign In functionality temporarily disabled')}
              >
                Sign In
              </button>
              <button 
                className="btn-secondary"
                onClick={() => alert('Create Account functionality temporarily disabled')}
              >
                Create Account
              </button>
            </div>

            <div className="guest-features">
              <h4>With an account you get:</h4>
              <ul>
                <li>✅ Cloud sync across devices</li>
                <li>✅ Advanced progress tracking</li>
                <li>✅ Personalized AI recommendations</li>
                <li>✅ Workout history backup</li>
                <li>✅ Premium exercise library</li>
              </ul>
            </div>
          </div>
        ) : (
          // Authenticated State
          <>
            <div className="sidebar-tabs">
              <button
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                👤 Profile
              </button>
              <button
                className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                ⚙️ Preferences
              </button>
              <button
                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                🔧 Settings
              </button>
              <button
                className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                🔒 Security
              </button>
            </div>

            <div className="sidebar-content">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="tab-content">
                  <div className="profile-section">
                    <div className="profile-avatar">
                      {userProfile.profilePicture ? (
                        <img src={userProfile.profilePicture} alt="Profile" />
                      ) : (
                        <div className="avatar-placeholder">
                          {userProfile.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3>{userProfile.name}</h3>
                    <p className="profile-email">{userProfile.email}</p>
                    <p className="profile-meta">Member since {userProfile.joinDate}</p>
                    <div className="profile-status">
                      <span className="status-badge verified">✅ Verified</span>
                    </div>
                  </div>

                  <div className="form-section">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => handleSaveProfile({...userProfile, name: e.target.value})}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="form-section">
                    <label>Email</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => handleSaveProfile({...userProfile, email: e.target.value})}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="form-section">
                    <label>Current Goal</label>
                    <select
                      value={userProfile.goal || 'muscle-gain'}
                      onChange={(e) => handleSaveProfile({...userProfile, goal: e.target.value})}
                    >
                      <option value="muscle-gain">Build Muscle</option>
                      <option value="fat-loss">Lose Fat</option>
                      <option value="strength">Build Strength</option>
                      <option value="endurance">Build Endurance</option>
                      <option value="flexibility">Improve Flexibility</option>
                    </select>
                  </div>

                  <div className="form-section">
                    <label>Experience Level</label>
                    <select
                      value={userProfile.level || 'intermediate'}
                      onChange={(e) => handleSaveProfile({...userProfile, level: e.target.value})}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="elite">Elite</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <Preferences 
                  preferences={preferences}
                  onPreferencesChange={onPreferencesChange}
                />
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="tab-content">
                  <div className="settings-section">
                    <h4>Notifications</h4>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Workout reminders</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Personal record alerts</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Weekly progress reports</span>
                    </label>
                  </div>

                  <div className="settings-section">
                    <h4>Display</h4>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Dark mode</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Show performance graphs</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Metric units (kg/cm)</span>
                    </label>
                  </div>

                  <div className="settings-section">
                    <h4>Data Management</h4>
                    <button className="btn-settings" onClick={exportData}>
                      📥 Export All Data
                    </button>
                    <button className="btn-settings">
                      📤 Import Data
                    </button>
                    <button className="btn-settings danger" onClick={() => {
                      if (window.confirm('Clear all workout data? This cannot be undone.')) {
                        localStorage.removeItem('workoutTemplates')
                        localStorage.removeItem('calendarWorkouts')
                        localStorage.removeItem('personalRecords')
                        alert('All workout data cleared.')
                      }
                    }}>
                      🗑️ Clear Workout Data
                    </button>
                  </div>

                  <div className="settings-section">
                    <h4>About</h4>
                    <p className="settings-info">FitFlow v1.0.0</p>
                    <p className="settings-info">Local + Cloud Storage</p>
                    <button className="btn-settings">📖 Help & Support</button>
                    <button className="btn-settings">🐛 Report Bug</button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="tab-content">
                  <div className="settings-section">
                    <h4>Password & Security</h4>
                    <button className="btn-settings">🔑 Change Password</button>
                    <button className="btn-settings">📱 Enable 2FA</button>
                    <button className="btn-settings">📋 View Login History</button>
                  </div>

                  <div className="settings-section">
                    <h4>Privacy</h4>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Allow analytics for app improvement</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>Share workout data for research</span>
                    </label>
                  </div>

                  <div className="settings-section">
                    <h4>Account Actions</h4>
                    <button className="btn-settings" onClick={handleSignOut}>
                      🚪 Sign Out
                    </button>
                    <button className="btn-settings danger" onClick={handleDeleteAccount}>
                      ⚠️ Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Auth Modal - Temporarily Disabled */}
      {/* <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      /> */}
    </>
  )
}
