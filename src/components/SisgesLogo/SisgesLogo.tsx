type Variant = 'mark' | 'lockup'

/** 16 nós (tamanhos variados) + ligações — rede / “cérebro” estilo app profissional. viewBox 32×32 */
const NODES: ReadonlyArray<{ cx: number; cy: number; r: number }> = [
  { cx: 16, cy: 4, r: 1.2 },
  { cx: 8, cy: 7, r: 0.95 },
  { cx: 24, cy: 7, r: 0.95 },
  { cx: 5, cy: 12, r: 0.85 },
  { cx: 16, cy: 9, r: 1.4 },
  { cx: 27, cy: 12, r: 0.85 },
  { cx: 7, cy: 16.5, r: 1.1 },
  { cx: 25, cy: 16.5, r: 1.1 },
  { cx: 16, cy: 16, r: 1.35 },
  { cx: 9, cy: 20, r: 0.95 },
  { cx: 23, cy: 20, r: 0.95 },
  { cx: 5, cy: 23.5, r: 0.75 },
  { cx: 27, cy: 23.5, r: 0.75 },
  { cx: 12, cy: 26.5, r: 0.9 },
  { cx: 20, cy: 26.5, r: 0.9 },
  { cx: 16, cy: 29, r: 0.8 },
]

const EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [0, 2], [0, 4],
  [1, 2], [1, 3], [1, 4], [1, 6],
  [2, 4], [2, 5], [2, 7],
  [3, 4], [3, 6], [3, 9],
  [4, 5], [4, 6], [4, 7], [4, 8],
  [5, 7], [5, 8], [5, 10],
  [6, 7], [6, 8], [6, 9], [6, 11],
  [7, 8], [7, 10], [7, 12],
  [8, 9], [8, 10], [8, 13], [8, 14],
  [9, 10], [9, 11], [9, 13],
  [10, 12], [10, 14],
  [11, 13],
  [12, 14],
  [13, 14], [13, 15], [14, 15],
]

function MarkSvg() {
  return (
    <g>
      {EDGES.map(([a, b], i) => {
        const p = NODES[a]!
        const q = NODES[b]!
        return (
          <line
            key={`e-${a}-${b}-${i}`}
            x1={p.cx}
            y1={p.cy}
            x2={q.cx}
            y2={q.cy}
            stroke="currentColor"
            strokeWidth={0.42}
            strokeLinecap="round"
            className="opacity-[0.55]"
          />
        )
      })}
      {NODES.map((n, i) => (
        <circle
          key={`n-${i}`}
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          fill="currentColor"
        />
      ))}
    </g>
  )
}

/**
 * SISGES — símbolo de rede / inteligência (cérebro em grafo, estilo aplicação de gestão).
 */
export function SisgesLogo({
  variant = 'mark',
  className = '',
  textClassName = 'text-base font-bold tracking-tight text-[var(--color-text-primary)] sm:text-lg',
  title = 'SISGES',
  'aria-label': ariaLabel = 'SISGES - Sistema de Gestão Escolar',
}: {
  variant?: Variant
  className?: string
  textClassName?: string
  title?: string
  'aria-label'?: string
}) {
  if (variant === 'lockup') {
    return (
      <div className={['inline-flex min-w-0 max-w-full items-center gap-2 sm:gap-2.5', className].filter(Boolean).join(' ')} role="img" aria-label={ariaLabel}>
        <svg
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 shrink-0 text-[var(--color-primary)] sm:h-8 sm:w-8"
          aria-hidden
        >
          <MarkSvg />
        </svg>
        <span className={['min-w-0 truncate', textClassName].filter(Boolean).join(' ')}>{title}</span>
      </div>
    )
  }

  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      className={className || 'h-7 w-7 sm:h-8 sm:w-8 text-[var(--color-primary)]'}
      aria-label={ariaLabel}
    >
      <title>{title}</title>
      <MarkSvg />
    </svg>
  )
}
