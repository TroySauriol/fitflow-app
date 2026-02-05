import './PersonalRecords.css'

export default function PersonalRecords({ records }) {
  if (Object.keys(records).length === 0) {
    return (
      <div className="personal-records">
        <div className="empty-state">
          <h2>🏆 No Personal Records Yet</h2>
          <p>Log your workouts to track your progress and personal bests!</p>
        </div>
      </div>
    )
  }

  const getPersonalBest = (entries) => {
    if (!entries || entries.length === 0) return null
    return entries.reduce((best, current) => {
      const currentTotal = parseFloat(current.weight) * parseFloat(current.reps)
      const bestTotal = parseFloat(best.weight) * parseFloat(best.reps)
      return currentTotal > bestTotal ? current : best
    })
  }

  return (
    <div className="personal-records">
      <h2>🏆 Personal Records</h2>
      <div className="records-grid">
        {Object.entries(records).map(([exercise, entries]) => {
          const pb = getPersonalBest(entries)
          const latest = entries[entries.length - 1]

          return (
            <div key={exercise} className="record-card">
              <h3>{exercise}</h3>

              {pb && (
                <div className="pb-section">
                  <div className="pb-label">Personal Best</div>
                  <div className="pb-value">
                    {pb.weight} lbs × {pb.reps} reps
                  </div>
                  <div className="pb-date">{pb.date}</div>
                </div>
              )}

              {latest && latest !== pb && (
                <div className="latest-section">
                  <div className="latest-label">Latest</div>
                  <div className="latest-value">
                    {latest.weight} lbs × {latest.reps} reps
                  </div>
                  <div className="latest-date">{latest.date}</div>
                </div>
              )}

              <div className="history">
                <h4>History</h4>
                <ul className="history-list">
                  {[...entries].reverse().map((entry, idx) => (
                    <li key={idx}>
                      <span className="history-weight">{entry.weight} lbs</span>
                      <span className="history-reps">× {entry.reps}</span>
                      <span className="history-date">{entry.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
