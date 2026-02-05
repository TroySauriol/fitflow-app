import './Logo.css'

export default function Logo({ onNavigateHome }) {
  return (
    <div className="logo-container" onClick={onNavigateHome}>
      <div className="logo-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dumbbell icon with modern design */}
          <g className="logo-svg">
            {/* Left weight */}
            <rect x="2" y="12" width="8" height="16" rx="2" fill="currentColor" />
            {/* Right weight */}
            <rect x="30" y="12" width="8" height="16" rx="2" fill="currentColor" />
            {/* Center bar */}
            <rect x="10" y="18" width="20" height="4" rx="2" fill="currentColor" />
            {/* Grip texture lines */}
            <line x1="14" y1="16" x2="14" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="17" y1="16" x2="17" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="20" y1="16" x2="20" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="23" y1="16" x2="23" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="26" y1="16" x2="26" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          </g>
        </svg>
      </div>
      <div className="logo-text">
        <div className="logo-title">FitFlow</div>
        <div className="logo-subtitle">AI Workout Generator</div>
      </div>
    </div>
  )
}