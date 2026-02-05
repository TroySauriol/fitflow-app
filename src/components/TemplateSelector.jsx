import { useState } from 'react'
import './TemplateSelector.css'

export default function TemplateSelector({ templates, onSelectTemplate, onCreateNew }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscles, setSelectedMuscles] = useState([])

  const allMuscles = [...new Set(templates.flatMap(t => t.muscles || []))]
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesMuscles = selectedMuscles.length === 0 || 
                          selectedMuscles.some(muscle => template.muscles?.includes(muscle))
    
    return matchesSearch && matchesMuscles
  })

  const toggleMuscleFilter = (muscle) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    )
  }

  return (
    <div className="template-selector">
      <div className="selector-header">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="template-search"
          />
        </div>
        
        {allMuscles.length > 0 && (
          <div className="muscle-filters">
            <label>Filter by muscle groups:</label>
            <div className="muscle-filter-tags">
              {allMuscles.map(muscle => (
                <button
                  key={muscle}
                  className={`muscle-filter-tag ${selectedMuscles.includes(muscle) ? 'active' : ''}`}
                  onClick={() => toggleMuscleFilter(muscle)}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="templates-grid">
        {filteredTemplates.length === 0 ? (
          <div className="no-templates">
            <p>No templates found matching your criteria</p>
            <button className="btn-create-new" onClick={onCreateNew}>
              ➕ Create New Workout
            </button>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div 
              key={template.id} 
              className="template-card-selector"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="template-card-header">
                <h3>{template.name}</h3>
                {template.muscles && (
                  <div className="template-muscles">
                    {template.muscles.map(muscle => (
                      <span key={muscle} className="muscle-badge">{muscle}</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="template-card-body">
                {template.description && (
                  <p className="template-description-preview">
                    {template.description.length > 100 
                      ? template.description.substring(0, 100) + '...'
                      : template.description
                    }
                  </p>
                )}
                
                <div className="template-stats">
                  <span className="exercise-count">
                    {template.exercises?.length || 0} exercises
                  </span>
                  <span className="created-date">
                    Created: {template.createdAt}
                  </span>
                </div>
              </div>
              
              <div className="template-card-footer">
                <button className="btn-select-template">
                  Select This Template
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="selector-footer">
        <button className="btn-create-new-alt" onClick={onCreateNew}>
          ➕ Create New Workout Instead
        </button>
      </div>
    </div>
  )
}