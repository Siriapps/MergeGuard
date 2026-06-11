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
        let color = '#8b949e'

        if (line.startsWith('+') && !line.startsWith('+++')) {
          bg = 'rgba(63, 185, 80, 0.1)'
          color = '#3fb950'
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          bg = 'rgba(248, 81, 73, 0.1)'
          color = '#f85149'
        } else if (line.startsWith('@@')) {
          color = '#79c0ff'
        }

        const lineNum = extractLineNum(line, i)
        const isFlagged = flaggedLines.has(String(lineNum))

        return (
          <div
            key={i}
            style={{
              ...styles.line,
              backgroundColor: isFlagged ? 'rgba(248, 81, 73, 0.25)' : bg,
              borderLeft: isFlagged ? '3px solid #f85149' : '3px solid transparent',
            }}
          >
            <span style={styles.lineNum}>{lineNum || ''}</span>
            <span style={{ color }}>{line}</span>
            {isFlagged && <span style={styles.flag}>⚠</span>}
          </div>
        )
      })}
    </div>
  )
}

function extractLineNum(line, index) {
  if (line.startsWith('@@')) {
    const match = line.match(/\+(\d+)/)
    return match ? parseInt(match[1]) : ''
  }
  if (line.startsWith('diff') || line.startsWith('---') || line.startsWith('+++')) return ''
  return ''
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    overflow: 'auto',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    lineHeight: 1.6,
  },
  line: {
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'pre',
  },
  lineNum: {
    width: 40,
    textAlign: 'right',
    marginRight: 12,
    color: '#484f58',
    userSelect: 'none',
    flexShrink: 0,
  },
  flag: {
    marginLeft: 'auto',
    color: '#f85149',
    fontSize: 14,
  },
}
