import { useState } from 'react'
import './Preferences.css'

export default function Preferences({ preferences, onPreferencesChange }) {
  const [activeSection, setActiveSection] = useState('injuries')
  const [newInjury, setNewInjury] = useState('')
  const [newExclusion, setNewExclusion] = useState('')
  const [newEquipment, setNewEquipment] = useState('')

  const handleAddInjury = () => {
    if (!newInjury.trim()) return
    const updated = {
      ...preferences,
      injuries: [...(preferences.injuries || []), newInjury]
    }
    onPreferencesChange(updated)
    setNewInjury('')
  }

  const handleRemoveInjury = (index) => {
    const updated = {
      ...preferences,
      injuries: preferences.injuries.filter((_, i) => i !== index)
    }
    onPreferencesChange(updated)
  }

  const handleAddExclusion = () => {
    if (!newExclusion.trim()) return
    const updated = {
      ...preferences,
      excludedExercises: [...(preferences.excludedExercises || []), newExclusion]
    }
    onPreferencesChange(updated)
    setNewExclusion('')
  }

  const handleRemoveExclusion = (index) => {
    const updated = {
      ...preferences,
      excludedExercises: preferences.excludedExercises.filter((_, i) => i !== index)
    }
    onPreferencesChange(updated)
  }

  const handleAddEquipment = () => {
    if (!newEquipment.trim()) return
    const updated = {
      ...preferences,
      availableEquipment: [...(preferences.availableEquipment || []), newEquipment]
    }
    onPreferencesChange(updated)
    setNewEquipment('')
  }

  const handleRemoveEquipment = (index) => {
    const updated = {
      ...preferences,
      availableEquipment: preferences.availableEquipment.filter((_, i) => i !== index)
    }
    onPreferencesChange(updated)
  }

  const commonInjuries = [
    'Lower Back Pain',
    'Knee Pain',
    'Shoulder Pain',
    'Wrist Pain',
    'Elbow Pain',
    'Hip Pain',
    'Neck Pain',
    'Ankle Pain'
  ]

  const commonExercises = [
    'Barbell Back Squats',
    'Deadlifts',
    'Leg Press',
    'Bench Press',
    'Overhead Press',
    'Barbell Rows',
    'Pull-ups',
    'Dips'
  ]

  return (
    <div className="preferences-container">
      <div className="pref-tabs">
        <button
          className={`pref-tab ${activeSection === 'injuries' ? 'active' : ''}`}
          onClick={() => setActiveSection('injuries')}
        >
          🩹 Injuries
        </button>
        <button
          className={`pref-tab ${activeSection === 'exclusions' ? 'active' : ''}`}
          onClick={() => setActiveSection('exclusions')}
        >
          ❌ Excluded Exercises
        </button>
        <button
          className={`pref-tab ${activeSection === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveSection('equipment')}
        >
          🏋️ Equipment
        </button>
      </div>

      <div className="pref-content">
        {/* Injuries Section */}
        {activeSection === 'injuries' && (
          <div className="pref-section">
            <h4>Injuries & Limitations</h4>
            <p className="pref-helper">Tell us about any injuries or pain so we can avoid suggesting problematic exercises</p>

            <div className="pref-list">
              {preferences.injuries && preferences.injuries.length > 0 ? (
                preferences.injuries.map((injury, idx) => (
                  <div key={idx} className="pref-item">
                    <span className="pref-item-text">🩹 {injury}</span>
                    <button
                      className="btn-remove-pref"
                      onClick={() => handleRemoveInjury(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-message">No injuries listed</p>
              )}
            </div>

            <div className="pref-form">
              <div className="quick-buttons">
                {commonInjuries.map(injury => (
                  <button
                    key={injury}
                    className="quick-btn"
                    onClick={() => {
                      if (!preferences.injuries?.includes(injury)) {
                        handleAddInjury()
                        setNewInjury(injury)
                      }
                    }}
                  >
                    {injury}
                  </button>
                ))}
              </div>

              <div className="form-row">
                <input
                  type="text"
                  value={newInjury}
                  onChange={(e) => setNewInjury(e.target.value)}
                  placeholder="Add custom injury (e.g., Sacroiliac Joint Pain)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInjury()}
                />
                <button className="btn-add-pref" onClick={handleAddInjury}>Add</button>
              </div>
            </div>

            <div className="pref-tip">
              💡 <strong>Tip:</strong> The AI will specifically avoid exercises that could aggravate these injuries.
            </div>
          </div>
        )}

        {/* Excluded Exercises Section */}
        {activeSection === 'exclusions' && (
          <div className="pref-section">
            <h4>Excluded Exercises</h4>
            <p className="pref-helper">Block specific exercises you dislike or can't do</p>

            <div className="pref-list">
              {preferences.excludedExercises && preferences.excludedExercises.length > 0 ? (
                preferences.excludedExercises.map((exercise, idx) => (
                  <div key={idx} className="pref-item">
                    <span className="pref-item-text">❌ {exercise}</span>
                    <button
                      className="btn-remove-pref"
                      onClick={() => handleRemoveExclusion(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-message">No exercises excluded</p>
              )}
            </div>

            <div className="pref-form">
              <div className="quick-buttons">
                {commonExercises.map(exercise => (
                  <button
                    key={exercise}
                    className="quick-btn"
                    onClick={() => {
                      if (!preferences.excludedExercises?.includes(exercise)) {
                        setNewExclusion(exercise)
                        handleAddExclusion()
                      }
                    }}
                  >
                    {exercise}
                  </button>
                ))}
              </div>

              <div className="form-row">
                <input
                  type="text"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  placeholder="Add exercise to exclude (e.g., Leg Press)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddExclusion()}
                />
                <button className="btn-add-pref" onClick={handleAddExclusion}>Add</button>
              </div>
            </div>

            <div className="pref-tip">
              💡 <strong>Tip:</strong> The AI will NEVER suggest these exercises, even if they're effective for your goals.
            </div>
          </div>
        )}

        {/* Equipment Section */}
        {activeSection === 'equipment' && (
          <div className="pref-section">
            <h4>Available Equipment</h4>
            <p className="pref-helper">Tell us what equipment you have access to for smarter recommendations</p>

            <div className="pref-list">
              {preferences.availableEquipment && preferences.availableEquipment.length > 0 ? (
                preferences.availableEquipment.map((equipment, idx) => (
                  <div key={idx} className="pref-item">
                    <span className="pref-item-text">🏋️ {equipment}</span>
                    <button
                      className="btn-remove-pref"
                      onClick={() => handleRemoveEquipment(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-message">No equipment listed</p>
              )}
            </div>

            <div className="pref-form">
              <div className="quick-buttons">
                {['Dumbbells', 'Barbells', 'Pull-up Bar', 'Bench', 'Machine Weights', 'Resistance Bands', 'Bodyweight Only'].map(equip => (
                  <button
                    key={equip}
                    className="quick-btn"
                    onClick={() => {
                      if (!preferences.availableEquipment?.includes(equip)) {
                        setNewEquipment(equip)
                        handleAddEquipment()
                      }
                    }}
                  >
                    {equip}
                  </button>
                ))}
              </div>

              <div className="form-row">
                <input
                  type="text"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="Add equipment (e.g., Cable Machine)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEquipment()}
                />
                <button className="btn-add-pref" onClick={handleAddEquipment}>Add</button>
              </div>
            </div>

            <div className="pref-tip">
              💡 <strong>Tip:</strong> Workouts will be tailored to use only equipment you have available.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
