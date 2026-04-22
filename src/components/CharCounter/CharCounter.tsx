interface CharCounterProps {
  current: number
  max: number
  size?: number
}

const WARN_THRESHOLD = 0.8

export function CharCounter({ current, max, size = 24 }: CharCounterProps) {
  const ratio = current / max
  const remaining = max - current
  const over = remaining < 0

  let stroke = 'var(--color-border)'
  if (over) stroke = 'var(--color-error)'
  else if (ratio >= WARN_THRESHOLD) stroke = '#f5a623'
  else if (current > 0) stroke = 'var(--color-primary)'

  const r = (size - 4) / 2
  const circumference = 2 * Math.PI * r
  const filled = Math.min(ratio, 1) * circumference

  const showNumber = remaining <= 20

  return (
    <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={2} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showNumber && (
        <span
          className="absolute font-medium leading-none"
          style={{
            color: over ? 'var(--color-error)' : 'var(--color-text-muted)',
            fontSize: size * 0.38,
          }}
        >
          {remaining}
        </span>
      )}
    </div>
  )
}
