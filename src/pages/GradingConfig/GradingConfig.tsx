import { useState, useEffect, useCallback, useMemo, type FormEvent, type ChangeEvent } from 'react'
import { BackButton } from '../../components/BackButton/BackButton'
import { useToast } from '../../contexts/ToastContext'
import { ApiError } from '../../services/api'
import { FiAlertCircle, FiChevronDown } from 'react-icons/fi'
import {
  getGradingConfig,
  updateGradingConfig,
  type GradingConfig as GradingConfigData,
} from '../../services/gradingConfigService'
import { PageHeader, Button, StateBlock } from '../../components/ui'

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
  return String(Math.min(max, n))
}
function normalizeCompositionPointsInput(raw: string, max: number): string {
  const d = digitsOnly(raw, MAX_DIGITS_YEAR)
  if (d === '') return ''
  let n = parseInt(d, 10)
  if (Number.isNaN(n) || n === 0) return ''
  return String(Math.min(max, n))
}
function sanitizePctInput(s: string): string {
  let t = s.replace(/[^0-9.]/g, '')
  const firstDot = t.indexOf('.')
  if (firstDot !== -1) {
    const rest = t.slice(firstDot + 1).replace(/\./g, '')
    t = t.slice(0, firstDot + 1) + rest.slice(0, 2)
  }
  const parts = t.split('.')
  if ((parts[0] ?? '').length > 3) parts[0] = (parts[0] ?? '').slice(0, 3)
  return parts.length > 1 && parts[1] !== undefined ? `${parts[0]}.${parts[1]}` : parts[0] ?? ''
}
function parsePctOrNull(s: string): number | null {
  if (s.trim() === '') return null
  const n = parseFloat(s.replace(',', '.'))
  return Number.isNaN(n) ? null : n
}
function formatPctOnBlur(s: string): string {
  const n = parsePctOrNull(s)
  if (n === null) return ''
  const c = Math.min(100, Math.max(0, n))
  return Number.isInteger(c) ? String(c) : String(Math.round(c * 100) / 100)
}

const inputCls = 'px-3 py-2 text-sm w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
const inputErrCls = 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/10'
const labelCls = 'text-xs font-medium text-[var(--color-text-muted)] mb-1 block'

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
  const [loadError, setLoadError] = useState<string | null>(null)
  const [trimesterOpen, setTrimesterOpen] = useState<Record<1 | 2 | 3, boolean>>({ 1: true, 2: true, 3: true })

  const fetchConfig = useCallback(async () => {
    setIsLoading(true); setLoadError(null)
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
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar configuração.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  const yearMaxPoints = parseIntOrNull(yearMaxStr)
  const t1Max = parseIntOrNull(t1MaxStr)
  const t2Max = parseIntOrNull(t2MaxStr)
  const t3Max = parseIntOrNull(t3MaxStr)
  const trimesterSum = useMemo(() => (t1Max ?? 0) + (t2Max ?? 0) + (t3Max ?? 0), [t1Max, t2Max, t3Max])
  const sumValid = yearMaxPoints !== null && trimesterSum === yearMaxPoints
  const yearValid = yearMaxPoints !== null && yearMaxPoints >= YEAR_MIN && yearMaxPoints <= YEAR_MAX

  const compositionByTrimester = useMemo(() => {
    const row = (max: number | null, provas: string, ativ: string, trab: string) => {
      const p = parseIntOrNull(provas), a = parseIntOrNull(ativ), tr = parseIntOrNull(trab)
      const sum = (p ?? 0) + (a ?? 0) + (tr ?? 0)
      const hasEmpty = p === null || a === null || tr === null
      const allPositive = p !== null && a !== null && tr !== null && p >= 1 && a >= 1 && tr >= 1
      const valid = max !== null && allPositive && sum === max
      let hint: string | null = null
      if (max !== null && !valid) {
        hint = hasEmpty || !allPositive
          ? 'Preencha todos os campos com valores maiores que zero.'
          : 'A soma deve ser igual à pontuação máxima deste trimestre.'
      }
      return { sum, valid, hint }
    }
    return {
      1: row(t1Max, t1ProvasStr, t1AtividadesStr, t1TrabalhosStr),
      2: row(t2Max, t2ProvasStr, t2AtividadesStr, t2TrabalhosStr),
      3: row(t3Max, t3ProvasStr, t3AtividadesStr, t3TrabalhosStr),
    }
  }, [t1Max, t1ProvasStr, t1AtividadesStr, t1TrabalhosStr, t2Max, t2ProvasStr, t2AtividadesStr, t2TrabalhosStr, t3Max, t3ProvasStr, t3AtividadesStr, t3TrabalhosStr])

  const compositionAllValid = compositionByTrimester[1].valid && compositionByTrimester[2].valid && compositionByTrimester[3].valid
  const canSave = yearValid && sumValid && compositionAllValid && !isSaving

  const handlePctChange = (e: ChangeEvent<HTMLInputElement>, setField: (v: string) => void) => setField(sanitizePctInput(e.target.value))
  const handlePctBlur = (s: string, setField: (v: string) => void) => {
    const n = parsePctOrNull(s)
    if (n === null) { setField(''); return }
    const c = Math.min(100, Math.max(0, n))
    setField(Number.isInteger(c) ? String(c) : String(Math.round(c * 100) / 100))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    const ym = parseIntOrNull(yearMaxStr), yp = parsePctOrNull(yearMinStr)
    const p1 = parsePctOrNull(t1MinStr), p2 = parsePctOrNull(t2MinStr), p3 = parsePctOrNull(t3MinStr)
    const t1p = parseIntOrNull(t1ProvasStr), t1a = parseIntOrNull(t1AtividadesStr), t1t = parseIntOrNull(t1TrabalhosStr)
    const t2p = parseIntOrNull(t2ProvasStr), t2a = parseIntOrNull(t2AtividadesStr), t2t = parseIntOrNull(t2TrabalhosStr)
    const t3p = parseIntOrNull(t3ProvasStr), t3a = parseIntOrNull(t3AtividadesStr), t3t = parseIntOrNull(t3TrabalhosStr)
    if ([ym, yp, t1Max, t2Max, t3Max, p1, p2, p3, t1p, t1a, t1t, t2p, t2a, t2t, t3p, t3a, t3t].some((v) => v === null)) {
      showToast('Preencha todos os campos.', 'error'); return
    }
    setIsSaving(true)
    try {
      const payload: GradingConfigData = {
        yearMaxPoints: ym!, yearMinPercentage: yp!,
        trimester1MaxPoints: t1Max!, trimester1MinPercentage: p1!, trimester1PointsProvas: t1p!, trimester1PointsAtividades: t1a!, trimester1PointsTrabalhos: t1t!,
        trimester2MaxPoints: t2Max!, trimester2MinPercentage: p2!, trimester2PointsProvas: t2p!, trimester2PointsAtividades: t2a!, trimester2PointsTrabalhos: t2t!,
        trimester3MaxPoints: t3Max!, trimester3MinPercentage: p3!, trimester3PointsProvas: t3p!, trimester3PointsAtividades: t3a!, trimester3PointsTrabalhos: t3t!,
      }
      await updateGradingConfig(payload)
      showToast('Configuração de notas salva com sucesso.', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao salvar configuração.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const trimesterData = [
    { idx: 1 as const, label: '1º Trimestre', maxStr: t1MaxStr, setMaxStr: setT1MaxStr, minStr: t1MinStr, setMinStr: setT1MinStr, provasStr: t1ProvasStr, setProvasStr: setT1ProvasStr, ativStr: t1AtividadesStr, setAtivStr: setT1AtividadesStr, trabStr: t1TrabalhosStr, setTrabStr: setT1TrabalhosStr },
    { idx: 2 as const, label: '2º Trimestre', maxStr: t2MaxStr, setMaxStr: setT2MaxStr, minStr: t2MinStr, setMinStr: setT2MinStr, provasStr: t2ProvasStr, setProvasStr: setT2ProvasStr, ativStr: t2AtividadesStr, setAtivStr: setT2AtividadesStr, trabStr: t2TrabalhosStr, setTrabStr: setT2TrabalhosStr },
    { idx: 3 as const, label: '3º Trimestre', maxStr: t3MaxStr, setMaxStr: setT3MaxStr, minStr: t3MinStr, setMinStr: setT3MinStr, provasStr: t3ProvasStr, setProvasStr: setT3ProvasStr, ativStr: t3AtividadesStr, setAtivStr: setT3AtividadesStr, trabStr: t3TrabalhosStr, setTrabStr: setT3TrabalhosStr },
  ]

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Configuração de Notas" back={<BackButton to="/" />} />

      <div className="flex-1 p-6">
        <StateBlock loading={isLoading} loadingText="Carregando..." error={loadError} onRetry={fetchConfig}>
          <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-5xl flex-col gap-6">

            {/* Annual section */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Ano letivo</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="yearMax" className={labelCls}>Pontuação máxima</label>
                  <input
                    id="yearMax"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={MAX_DIGITS_YEAR}
                    value={yearMaxStr}
                    onChange={(e) => setYearMaxStr(normalizePointsInput(e.target.value, YEAR_MAX))}
                    className={`${inputCls} ${yearMaxStr !== '' && !yearValid ? inputErrCls : ''}`}
                    disabled={isSaving}
                  />
                  {yearMaxStr !== '' && !yearValid && (
                    <p className="text-xs text-[var(--color-error)] mt-1">Entre {YEAR_MIN} e {YEAR_MAX}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="yearMin" className={labelCls}>Média mínima (%)</label>
                  <div className="relative">
                    <input
                      id="yearMin"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={yearMinStr}
                      onChange={(e) => handlePctChange(e, setYearMinStr)}
                      onBlur={() => handlePctBlur(yearMinStr, setYearMinStr)}
                      className={`${inputCls} pr-8`}
                      disabled={isSaving}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trimester sections */}
            {trimesterData.map((t) => {
              const idx = t.idx
              const comp = compositionByTrimester[idx]
              const tm = parseIntOrNull(t.maxStr)
              const hasTrimesterIssue = !( tm !== null && tm >= 1 && parsePctOrNull(t.minStr) !== null && comp.valid)
              const isOpen = trimesterOpen[idx]
              return (
                <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTrimesterOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-3 px-5 py-3.5 bg-transparent border-none cursor-pointer text-left"
                  >
                    <FiChevronDown
                      size={16}
                      className={`text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] flex-1">{t.label}</span>
                    {hasTrimesterIssue && (
                      <FiAlertCircle size={16} className="text-[var(--color-warning)]" title="Campos em falta ou inválidos" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 flex flex-col gap-4 border-t border-[var(--color-border)]">
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor={`t${idx}Max`} className={labelCls}>Pontuação máxima</label>
                          <input
                            id={`t${idx}Max`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={MAX_DIGITS_YEAR}
                            value={t.maxStr}
                            onChange={(e) => t.setMaxStr(normalizePointsInput(e.target.value, TRIMESTER_POINTS_MAX))}
                            className={inputCls}
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <label htmlFor={`t${idx}Pct`} className={labelCls}>Média mínima (%)</label>
                          <div className="relative">
                            <input
                              id={`t${idx}Pct`}
                              type="text"
                              inputMode="decimal"
                              autoComplete="off"
                              value={t.minStr}
                              onChange={(e) => handlePctChange(e, t.setMinStr)}
                              onBlur={() => handlePctBlur(t.minStr, t.setMinStr)}
                              className={`${inputCls} pr-8`}
                              disabled={isSaving}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-[var(--color-text-muted)]">Provas, atividades e trabalhos (pontos)</p>
                        <div className="grid gap-3 md:grid-cols-3">
                          {[
                            { id: `t${idx}Provas`, label: 'Provas', value: t.provasStr, set: t.setProvasStr },
                            { id: `t${idx}Ativ`, label: 'Atividades', value: t.ativStr, set: t.setAtivStr },
                            { id: `t${idx}Trab`, label: 'Trabalhos', value: t.trabStr, set: t.setTrabStr },
                          ].map((f) => (
                            <div key={f.id}>
                              <label htmlFor={f.id} className={labelCls}>{f.label}</label>
                              <input
                                id={f.id}
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={MAX_DIGITS_YEAR}
                                value={f.value}
                                onChange={(e) => f.set(normalizeCompositionPointsInput(e.target.value, TRIMESTER_POINTS_MAX))}
                                className={inputCls}
                                disabled={isSaving}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Composition sum indicator */}
                        <div className={[
                          'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium',
                          comp.valid
                            ? 'bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)]'
                            : 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 text-[var(--color-warning)]',
                        ].join(' ')}>
                          <span>Soma: {comp.sum} / {tm ?? '—'}</span>
                          {comp.valid ? <span>OK</span> : comp.hint ? <span>{comp.hint}</span> : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Annual sum indicator */}
            <div className={[
              'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium border',
              sumValid
                ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]'
                : 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30 text-[var(--color-warning)]',
            ].join(' ')}>
              <span>Soma dos trimestres: {trimesterSum} / {yearMaxPoints ?? '—'}</span>
              {sumValid ? <span>OK</span> : <span>A soma deve ser igual à pontuação do ano</span>}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!canSave} loading={isSaving}>
                Salvar configuração
              </Button>
            </div>
          </form>
        </StateBlock>
      </div>
    </div>
  )
}
