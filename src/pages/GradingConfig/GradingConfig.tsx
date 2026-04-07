import { useState, useEffect, useCallback, useMemo, type FormEvent, type ChangeEvent } from 'react'
import { BackButton } from '../../components/BackButton/BackButton'
import { useToast } from '../../contexts/ToastContext'
import { ApiError } from '../../services/api'
import { FiAlertCircle } from 'react-icons/fi'
import {
  getGradingConfig,
  updateGradingConfig,
  type GradingConfig as GradingConfigData,
} from '../../services/gradingConfigService'
import './GradingConfig.css'

const YEAR_MIN = 10
const YEAR_MAX = 1000
const TRIMESTER_POINTS_MAX = 1000
const MAX_DIGITS_YEAR = 4

function digitsOnly(s: string, maxLen: number): string {
  return s.replace(/\D/g, '').slice(0, maxLen)
}

function parseIntOrNull(s: string): number | null {
  if (s.trim() === '') return null
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? null : n
}

function normalizePointsInput(raw: string, max: number): string {
  const d = digitsOnly(raw, MAX_DIGITS_YEAR)
  if (d === '') return ''
  let n = parseInt(d, 10)
  if (Number.isNaN(n)) return ''
  n = Math.min(max, n)
  return String(n)
}

function normalizeCompositionPointsInput(raw: string, max: number): string {
  const d = digitsOnly(raw, MAX_DIGITS_YEAR)
  if (d === '') return ''
  let n = parseInt(d, 10)
  if (Number.isNaN(n)) return ''
  if (n === 0) return ''
  n = Math.min(max, n)
  return String(n)
}

function sanitizePctInput(s: string): string {
  let t = s.replace(/[^0-9.]/g, '')
  const firstDot = t.indexOf('.')
  if (firstDot !== -1) {
    const rest = t.slice(firstDot + 1).replace(/\./g, '')
    t = t.slice(0, firstDot + 1) + rest.slice(0, 2)
  }
  const parts = t.split('.')
  const intPart = parts[0] ?? ''
  if (intPart.length > 3) {
    parts[0] = intPart.slice(0, 3)
  }
  return parts.length > 1 && parts[1] !== undefined ? `${parts[0]}.${parts[1]}` : parts[0]
}

function parsePctOrNull(s: string): number | null {
  if (s.trim() === '') return null
  const n = parseFloat(s.replace(',', '.'))
  if (Number.isNaN(n)) return null
  return n
}

function formatPctOnBlur(s: string): string {
  const n = parsePctOrNull(s)
  if (n === null) return ''
  const c = Math.min(100, Math.max(0, n))
  if (Number.isInteger(c)) return String(c)
  return String(Math.round(c * 100) / 100)
}

export function GradingConfig() {
  const { showToast } = useToast()

  const [yearMaxStr, setYearMaxStr] = useState('')
  const [yearMinStr, setYearMinStr] = useState('')
  const [t1MaxStr, setT1MaxStr] = useState('')
  const [t1MinStr, setT1MinStr] = useState('')
  const [t2MaxStr, setT2MaxStr] = useState('')
  const [t2MinStr, setT2MinStr] = useState('')
  const [t3MaxStr, setT3MaxStr] = useState('')
  const [t3MinStr, setT3MinStr] = useState('')
  const [t1ProvasStr, setT1ProvasStr] = useState('')
  const [t1AtividadesStr, setT1AtividadesStr] = useState('')
  const [t1TrabalhosStr, setT1TrabalhosStr] = useState('')
  const [t2ProvasStr, setT2ProvasStr] = useState('')
  const [t2AtividadesStr, setT2AtividadesStr] = useState('')
  const [t2TrabalhosStr, setT2TrabalhosStr] = useState('')
  const [t3ProvasStr, setT3ProvasStr] = useState('')
  const [t3AtividadesStr, setT3AtividadesStr] = useState('')
  const [t3TrabalhosStr, setT3TrabalhosStr] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trimesterOpen, setTrimesterOpen] = useState<Record<1 | 2 | 3, boolean>>({
    1: true,
    2: true,
    3: true,
  })

  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const cfg = await getGradingConfig()
      setYearMaxStr(String(cfg.yearMaxPoints))
      setYearMinStr(formatPctOnBlur(String(cfg.yearMinPercentage)))
      setT1MaxStr(String(cfg.trimester1MaxPoints))
      setT1MinStr(formatPctOnBlur(String(cfg.trimester1MinPercentage)))
      setT2MaxStr(String(cfg.trimester2MaxPoints))
      setT2MinStr(formatPctOnBlur(String(cfg.trimester2MinPercentage)))
      setT3MaxStr(String(cfg.trimester3MaxPoints))
      setT3MinStr(formatPctOnBlur(String(cfg.trimester3MinPercentage)))
      setT1ProvasStr(String(cfg.trimester1PointsProvas))
      setT1AtividadesStr(String(cfg.trimester1PointsAtividades))
      setT1TrabalhosStr(String(cfg.trimester1PointsTrabalhos))
      setT2ProvasStr(String(cfg.trimester2PointsProvas))
      setT2AtividadesStr(String(cfg.trimester2PointsAtividades))
      setT2TrabalhosStr(String(cfg.trimester2PointsTrabalhos))
      setT3ProvasStr(String(cfg.trimester3PointsProvas))
      setT3AtividadesStr(String(cfg.trimester3PointsAtividades))
      setT3TrabalhosStr(String(cfg.trimester3PointsTrabalhos))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configuração.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const yearMaxPoints = parseIntOrNull(yearMaxStr)
  const t1Max = parseIntOrNull(t1MaxStr)
  const t2Max = parseIntOrNull(t2MaxStr)
  const t3Max = parseIntOrNull(t3MaxStr)

  const trimesterSum = useMemo(() => {
    const a = t1Max ?? 0
    const b = t2Max ?? 0
    const c = t3Max ?? 0
    return a + b + c
  }, [t1Max, t2Max, t3Max])

  const sumValid = yearMaxPoints !== null && trimesterSum === yearMaxPoints
  const yearValid =
    yearMaxPoints !== null && yearMaxPoints >= YEAR_MIN && yearMaxPoints <= YEAR_MAX

  const compositionByTrimester = useMemo(() => {
    const row = (max: number | null, provas: string, ativ: string, trab: string) => {
      const p = parseIntOrNull(provas)
      const a = parseIntOrNull(ativ)
      const tr = parseIntOrNull(trab)
      const sum = (p ?? 0) + (a ?? 0) + (tr ?? 0)
      const hasEmpty = p === null || a === null || tr === null
      const allPositive =
        p !== null && a !== null && tr !== null && p >= 1 && a >= 1 && tr >= 1
      const valid = max !== null && allPositive && sum === max
      let hint: string | null = null
      if (max !== null && !valid) {
        if (hasEmpty || !allPositive) {
          hint = 'Preencha todos os campos com valores maiores que zero.'
        } else {
          hint = 'A soma deve ser igual à pontuação máxima deste trimestre.'
        }
      }
      return { sum, valid, hint }
    }
    return {
      1: row(t1Max, t1ProvasStr, t1AtividadesStr, t1TrabalhosStr),
      2: row(t2Max, t2ProvasStr, t2AtividadesStr, t2TrabalhosStr),
      3: row(t3Max, t3ProvasStr, t3AtividadesStr, t3TrabalhosStr),
    }
  }, [
    t1Max,
    t1ProvasStr,
    t1AtividadesStr,
    t1TrabalhosStr,
    t2Max,
    t2ProvasStr,
    t2AtividadesStr,
    t2TrabalhosStr,
    t3Max,
    t3ProvasStr,
    t3AtividadesStr,
    t3TrabalhosStr,
  ])

  const compositionAllValid =
    compositionByTrimester[1].valid &&
    compositionByTrimester[2].valid &&
    compositionByTrimester[3].valid

  const canSave = yearValid && sumValid && compositionAllValid && !isSaving

  const handleYearMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setYearMaxStr(normalizePointsInput(e.target.value, YEAR_MAX))
  }

  const handleTrimesterMaxChange = (
    e: ChangeEvent<HTMLInputElement>,
    setField: (v: string) => void,
  ) => {
    setField(normalizePointsInput(e.target.value, TRIMESTER_POINTS_MAX))
  }

  const toggleTrimester = (idx: 1 | 2 | 3) => {
    setTrimesterOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const handlePctChange = (e: ChangeEvent<HTMLInputElement>, setField: (v: string) => void) => {
    setField(sanitizePctInput(e.target.value))
  }

  const handlePctBlur = (s: string, setField: (v: string) => void) => {
    const n = parsePctOrNull(s)
    if (n === null) {
      setField('')
      return
    }
    const c = Math.min(100, Math.max(0, n))
    if (Number.isInteger(c)) {
      setField(String(c))
    } else {
      setField(String(Math.round(c * 100) / 100))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return

    const ym = parseIntOrNull(yearMaxStr)
    const yp = parsePctOrNull(yearMinStr)
    const p1 = parsePctOrNull(t1MinStr)
    const p2 = parsePctOrNull(t2MinStr)
    const p3 = parsePctOrNull(t3MinStr)

    const t1p = parseIntOrNull(t1ProvasStr)
    const t1a = parseIntOrNull(t1AtividadesStr)
    const t1t = parseIntOrNull(t1TrabalhosStr)
    const t2p = parseIntOrNull(t2ProvasStr)
    const t2a = parseIntOrNull(t2AtividadesStr)
    const t2t = parseIntOrNull(t2TrabalhosStr)
    const t3p = parseIntOrNull(t3ProvasStr)
    const t3a = parseIntOrNull(t3AtividadesStr)
    const t3t = parseIntOrNull(t3TrabalhosStr)

    if (
      ym === null ||
      yp === null ||
      t1Max === null ||
      t2Max === null ||
      t3Max === null ||
      p1 === null ||
      p2 === null ||
      p3 === null ||
      t1p === null ||
      t1a === null ||
      t1t === null ||
      t2p === null ||
      t2a === null ||
      t2t === null ||
      t3p === null ||
      t3a === null ||
      t3t === null
    ) {
      showToast('Preencha todos os campos.', 'error')
      return
    }

    if (
      t1p < 1 ||
      t1a < 1 ||
      t1t < 1 ||
      t2p < 1 ||
      t2a < 1 ||
      t2t < 1 ||
      t3p < 1 ||
      t3a < 1 ||
      t3t < 1
    ) {
      showToast('Cada valor de provas, atividades e trabalhos deve ser maior que zero.', 'error')
      return
    }

    setIsSaving(true)
    try {
      const payload: GradingConfigData = {
        yearMaxPoints: ym,
        yearMinPercentage: yp,
        trimester1MaxPoints: t1Max,
        trimester1MinPercentage: p1,
        trimester1PointsProvas: t1p,
        trimester1PointsAtividades: t1a,
        trimester1PointsTrabalhos: t1t,
        trimester2MaxPoints: t2Max,
        trimester2MinPercentage: p2,
        trimester2PointsProvas: t2p,
        trimester2PointsAtividades: t2a,
        trimester2PointsTrabalhos: t2t,
        trimester3MaxPoints: t3Max,
        trimester3MinPercentage: p3,
        trimester3PointsProvas: t3p,
        trimester3PointsAtividades: t3a,
        trimester3PointsTrabalhos: t3t,
      }
      await updateGradingConfig(payload)
      showToast('Configuração de notas salva com sucesso.', 'success')
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, 'error')
      } else {
        showToast('Erro ao salvar configuração.', 'error')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grading-container">
        <header className="grading-header">
          <div className="grading-header-content">
            <BackButton to="/" />
            <h1>Configuração de Notas</h1>
          </div>
        </header>
        <div className="grading-content">
          <div className="grading-loading">
            <div className="loading-spinner-sm"></div>
            <span>Carregando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grading-container">
        <header className="grading-header">
          <div className="grading-header-content">
            <BackButton to="/" />
            <h1>Configuração de Notas</h1>
          </div>
        </header>
        <div className="grading-content">
          <div className="grading-error">
            <p>{error}</p>
            <button type="button" onClick={fetchConfig} className="btn-retry">
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grading-container">
      <header className="grading-header">
        <div className="grading-header-content">
          <BackButton to="/" />
          <h1>Configuração de Notas</h1>
        </div>
      </header>

      <div className="grading-content">
        <form onSubmit={handleSubmit} className="grading-form">
          <div className="grading-section">
            <h3 className="grading-section-title">Ano letivo</h3>
            <div className="grading-row">
              <div className="grading-field">
                <label htmlFor="yearMax" className="grading-label">Pontuação máxima</label>
                <input
                  id="yearMax"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={MAX_DIGITS_YEAR}
                  value={yearMaxStr}
                  onChange={handleYearMaxChange}
                  className={`grading-input grading-input--points${!yearValid && yearMaxStr !== '' ? ' grading-input--error' : ''}`}
                  disabled={isSaving}
                />
                {yearMaxStr !== '' && !yearValid && (
                  <span className="grading-field-error">Entre {YEAR_MIN} e {YEAR_MAX}</span>
                )}
              </div>
              <div className="grading-field">
                <label htmlFor="yearMin" className="grading-label">Média mínima (%)</label>
                <div className="grading-input-suffix">
                  <input
                    id="yearMin"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={yearMinStr}
                    onChange={(e) => handlePctChange(e, setYearMinStr)}
                    onBlur={() => handlePctBlur(yearMinStr, setYearMinStr)}
                    className="grading-input"
                    disabled={isSaving}
                  />
                  <span className="grading-suffix">%</span>
                </div>
              </div>
            </div>
          </div>

          {[
            {
              idx: 1,
              label: '1\u00BA Trimestre',
              maxStr: t1MaxStr,
              setMaxStr: setT1MaxStr,
              minStr: t1MinStr,
              setMinStr: setT1MinStr,
              provasStr: t1ProvasStr,
              setProvasStr: setT1ProvasStr,
              ativStr: t1AtividadesStr,
              setAtivStr: setT1AtividadesStr,
              trabStr: t1TrabalhosStr,
              setTrabStr: setT1TrabalhosStr,
            },
            {
              idx: 2,
              label: '2\u00BA Trimestre',
              maxStr: t2MaxStr,
              setMaxStr: setT2MaxStr,
              minStr: t2MinStr,
              setMinStr: setT2MinStr,
              provasStr: t2ProvasStr,
              setProvasStr: setT2ProvasStr,
              ativStr: t2AtividadesStr,
              setAtivStr: setT2AtividadesStr,
              trabStr: t2TrabalhosStr,
              setTrabStr: setT2TrabalhosStr,
            },
            {
              idx: 3,
              label: '3\u00BA Trimestre',
              maxStr: t3MaxStr,
              setMaxStr: setT3MaxStr,
              minStr: t3MinStr,
              setMinStr: setT3MinStr,
              provasStr: t3ProvasStr,
              setProvasStr: setT3ProvasStr,
              ativStr: t3AtividadesStr,
              setAtivStr: setT3AtividadesStr,
              trabStr: t3TrabalhosStr,
              setTrabStr: setT3TrabalhosStr,
            },
          ].map((t) => {
            const idx = t.idx as 1 | 2 | 3
            const comp = compositionByTrimester[idx]
            const tm = parseIntOrNull(t.maxStr)
            const trimesterPct = parsePctOrNull(t.minStr)
            const trimesterMaxOk = tm !== null && tm >= 1
            const trimesterPctOk = trimesterPct !== null
            const hasTrimesterIssue = !trimesterMaxOk || !trimesterPctOk || !comp.valid
            const isOpen = trimesterOpen[idx]
            return (
              <div key={t.idx} className="grading-section grading-section--trimester">
                <button
                  type="button"
                  className="grading-trimester-toggle"
                  id={`trimester-heading-${t.idx}`}
                  aria-expanded={isOpen}
                  aria-controls={`trimester-panel-${t.idx}`}
                  onClick={() => toggleTrimester(idx)}
                >
                  <svg
                    className={`grading-trimester-chevron${isOpen ? ' grading-trimester-chevron--open' : ''}`}
                    viewBox="0 0 24 24"
                    aria-hidden={true}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="grading-trimester-toggle-text">{t.label}</span>
                  {hasTrimesterIssue ? (
                    <span
                      className="grading-trimester-issue-wrap"
                      title="Há campos em falta ou inválidos neste trimestre"
                      aria-hidden={true}
                    >
                      <FiAlertCircle className="grading-trimester-issue-icon" />
                    </span>
                  ) : null}
                </button>
                <div
                  className="grading-trimester-panel-wrap"
                  data-open={isOpen ? 'true' : 'false'}
                >
                  <div
                    className="grading-trimester-panel-inner"
                    ref={(el) => {
                      if (el) el.inert = !isOpen
                    }}
                  >
                    <div
                      className="grading-trimester-panel"
                      id={`trimester-panel-${t.idx}`}
                      role="region"
                      aria-labelledby={`trimester-heading-${t.idx}`}
                    >
                      <div className="grading-row">
                      <div className="grading-field">
                        <label htmlFor={`t${t.idx}Max`} className="grading-label">Pontuação máxima</label>
                        <input
                          id={`t${t.idx}Max`}
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={MAX_DIGITS_YEAR}
                          value={t.maxStr}
                          onChange={(e) => handleTrimesterMaxChange(e, t.setMaxStr)}
                          className="grading-input grading-input--points"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="grading-field">
                        <label htmlFor={`t${t.idx}Pct`} className="grading-label">Média mínima (%)</label>
                        <div className="grading-input-suffix">
                          <input
                            id={`t${t.idx}Pct`}
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            value={t.minStr}
                            onChange={(e) => handlePctChange(e, t.setMinStr)}
                            onBlur={() => handlePctBlur(t.minStr, t.setMinStr)}
                            className="grading-input"
                            disabled={isSaving}
                          />
                          <span className="grading-suffix">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="grading-composition">
                      <h4 className="grading-composition-title">Provas, atividades e trabalhos (pontos)</h4>
                      <div className="grading-row">
                        <div className="grading-field">
                          <label htmlFor={`t${t.idx}Provas`} className="grading-label">Provas</label>
                          <input
                            id={`t${t.idx}Provas`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={MAX_DIGITS_YEAR}
                            value={t.provasStr}
                            onChange={(e) =>
                              t.setProvasStr(
                                normalizeCompositionPointsInput(e.target.value, TRIMESTER_POINTS_MAX),
                              )
                            }
                            className="grading-input grading-input--points"
                            disabled={isSaving}
                          />
                        </div>
                        <div className="grading-field">
                          <label htmlFor={`t${t.idx}Ativ`} className="grading-label">Atividades</label>
                          <input
                            id={`t${t.idx}Ativ`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={MAX_DIGITS_YEAR}
                            value={t.ativStr}
                            onChange={(e) =>
                              t.setAtivStr(
                                normalizeCompositionPointsInput(e.target.value, TRIMESTER_POINTS_MAX),
                              )
                            }
                            className="grading-input grading-input--points"
                            disabled={isSaving}
                          />
                        </div>
                        <div className="grading-field">
                          <label htmlFor={`t${t.idx}Trab`} className="grading-label">Trabalhos</label>
                          <input
                            id={`t${t.idx}Trab`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={MAX_DIGITS_YEAR}
                            value={t.trabStr}
                            onChange={(e) =>
                              t.setTrabStr(
                                normalizeCompositionPointsInput(e.target.value, TRIMESTER_POINTS_MAX),
                              )
                            }
                            className="grading-input grading-input--points"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      <div
                        className={`grading-composition-sum${comp.valid ? ' grading-composition-sum--valid' : ' grading-composition-sum--invalid'}`}
                      >
                        <div className="grading-sum-line">
                          <span>Soma:</span>
                          <strong className="grading-sum-values">
                            {comp.sum} / {tm ?? '—'}
                          </strong>
                          {comp.valid ? <span className="grading-sum-check">OK</span> : null}
                        </div>
                        {!comp.valid && tm !== null && comp.hint !== null && (
                          <p className="grading-sum-warning">{comp.hint}</p>
                        )}
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <div className={`grading-sum-row${sumValid ? ' grading-sum-row--valid' : ' grading-sum-row--invalid'}`}>
            <div className="grading-sum-line">
              <span>Soma dos trimestres:</span>
              <strong className="grading-sum-values">{trimesterSum} / {yearMaxPoints ?? '—'}</strong>
              {sumValid ? <span className="grading-sum-check">OK</span> : null}
            </div>
            {!sumValid && yearMaxPoints !== null && (
              <p className="grading-sum-warning">A soma deve ser igual à pontuação do ano</p>
            )}
          </div>

          <div className="grading-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={!canSave}
            >
              {isSaving ? 'Salvando...' : 'Salvar configuração'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
