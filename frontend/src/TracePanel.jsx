import React from 'react'

export default function TracePanel({ traceUrl }) {
  if (!traceUrl) return null

  return (
    <div style={styles.container}>
      <a href={traceUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
        VIEW IN PHOENIX &rarr;
      </a>
      <span style={styles.hint}>Every rejection is traced. Ghost learns from outcomes.</span>
    </div>
  )
}

const styles = {
  container: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#161b22',
    border: '1px solid #21262d',
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    color: '#58a6ff',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
  },
  hint: {
    color: '#484f58',
    fontSize: 11,
    fontStyle: 'italic',
  },
}
