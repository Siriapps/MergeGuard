import React from 'react'

export default function DiffViewer({ diff, rejections }) {
  const flaggedLines = new Set()
  for (const r of rejections) {
    if (r.line) flaggedLines.add(String(r.line))
  }

  const lines = diff.split('\n')

  return (
    <div style={styles.container}>
      {lines.map((line, i) => {
        let bg = 'transparent'
        let color = '#64748b'

        if (line.startsWith('+') && !line.startsWith('+++')) {
          bg = 'rgba(16, 185, 129, 0.06)'
          color = '#10b981'
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          bg = 'rgba(239, 68, 68, 0.06)'
          color = '#ef4444'
        } else if (line.startsWith('@@')) {
          color = '#3b82f6'
        } else if (line.startsWith('diff')) {
          color = '#94a3b8'
        }

        const lineNum = extractLineNum(line)
        const isFlagged = flaggedLines.has(String(lineNum))

        return (
          <div
            key={i}
            style={{
              ...styles.line,
              backgroundColor: isFlagged ? 'rgba(239, 68, 68, 0.12)' : bg,
              borderLeft: isFlagged ? '3px solid #ef4444' : '3px solid transparent',
            }}
          >
            <span style={styles.lineNum}>{lineNum || ''}</span>
            <span style={{ color }}>{line}</span>
            {isFlagged && <span style={styles.flag}>!</span>}
          </div>
        )
      })}
    </div>
  )
}

function extractLineNum(line) {
  if (line.startsWith('@@')) {
    const match = line.match(/\+(\d+)/)
    return match ? parseInt(match[1]) : ''
  }
  return ''
}

const styles = {
  container: {
    flex: 1,
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    lineHeight: 1.7,
  },
  line: {
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'pre',
  },
  lineNum: {
    width: 36,
    textAlign: 'right',
    marginRight: 10,
    color: '#475569',
    userSelect: 'none',
    flexShrink: 0,
    fontSize: 10,
  },
  flag: {
    marginLeft: 'auto',
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 800,
    background: 'rgba(239,68,68,0.2)',
    width: 16,
    height: 16,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}
