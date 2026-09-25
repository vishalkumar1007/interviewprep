import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useProgress } from '../context/ProgressContext'
import type { Plan } from '../types'

export function ProgressPage() {
  const { progress } = useProgress()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [dsaTotal, setDsaTotal] = useState(0)
  const [patterns, setPatterns] = useState<Array<{ name: string; pct: number; weight: number }>>([])

  useEffect(() => {
    void api.getPlan().then(setPlan)
    void api.getDsa().then(d => {
      setDsaTotal(d.problems.length)
      const rows = d.patterns.map(pat => {
        const list = d.problems.filter(p => p.pattern === pat.id)
        const done = list.filter(p => progress.problems[p.id] === 'done').length
        return {
          name: pat.name,
          weight: pat.googleWeight,
          pct: list.length ? Math.round(done / list.length * 100) : 0,
        }
      }).filter(r => r.pct >= 0).sort((a, b) => b.weight - a.weight).slice(0, 8)
      setPatterns(rows)
    })
  }, [progress])

  if (!plan) return <p className="empty-state">Loading progress…</p>

  const weekDone = plan.weekTasks.filter(t => (progress.tasks[t.id] || t.status) === 'done').length
  const weekPct = plan.weekTasks.length ? Math.round(weekDone / plan.weekTasks.length * 100) : 0
  const dsaDone = Object.values(progress.problems).filter(s => s === 'done').length
  const moduleDone = Object.values(progress.modules).filter(s => s === 'done').length
  const minutes = plan.weekTasks
    .filter(t => (progress.tasks[t.id] || t.status) === 'done')
    .reduce((s, t) => s + t.minutes, 0)
  const skills = [...new Set(plan.weekTasks.map(t => t.skill))]
  const skillBars = skills.map(skill => {
    const list = plan.weekTasks.filter(t => t.skill === skill)
    const done = list.filter(t => (progress.tasks[t.id] || t.status) === 'done').length
    return { skill, pct: list.length ? Math.round(done / list.length * 100) : 0 }
  })

  const chartPoints = patterns.map((p, i) => {
    const x = 40 + i * 70
    const y = 160 - (p.pct / 100) * 120
    return `${x},${y}`
  }).join(' ')

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">METRICS</p>
          <h1>Progress</h1>
          <p>Week completion, DSA coverage, and skill bars synced from your account.</p>
        </div>
        <div className="week-score">{weekPct}%<small>This week</small></div>
      </section>

      <section className="progress-overview">
        <div className="panel overall-progress">
          <p className="eyebrow">WEEK {plan.weekIndex}</p>
          <div className="big-progress"><b>{weekPct}</b><span>% complete</span></div>
          <div className="progress-line"><i style={{ width: `${weekPct}%` }} /></div>
          <p>{weekDone} of {plan.weekTasks.length} weekly targets · {Math.floor(minutes / 60)}h {minutes % 60}m logged</p>
        </div>
        <div className="panel score-card">
          <p className="eyebrow">DSA BANK</p>
          <b>{dsaDone}</b>
          <span>of {dsaTotal} curated problems</span>
          <div className="progress-line" style={{ marginTop: 14 }}><i style={{ width: `${dsaTotal ? Math.round(dsaDone / dsaTotal * 100) : 0}%` }} /></div>
          <p className="muted" style={{ marginTop: 12 }}>{moduleDone} curriculum modules marked complete</p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 17 }}>
        <p className="eyebrow">PATTERN HEAT (GOOGLE WEIGHT)</p>
        <h2 className="inline-title">Coverage chart</h2>
        <svg className="chart" viewBox="0 0 600 200" role="img" aria-label="Pattern coverage chart">
          <polyline fill="none" stroke="var(--accent)" strokeWidth="3" points={chartPoints || '40,160'} />
          {patterns.map((p, i) => {
            const x = 40 + i * 70
            const y = 160 - (p.pct / 100) * 120
            return <circle key={p.name} cx={x} cy={y} r="5" fill="var(--accent)" />
          })}
          {patterns.map((p, i) => (
            <text key={p.name} x={40 + i * 70} y="190" textAnchor="middle" fontSize="9" fill="var(--muted)">{p.name.split(' ')[0]}</text>
          ))}
        </svg>
      </section>

      <section className="panel skill-progress">
        <p className="eyebrow">THIS WEEK BY SKILL</p>
        {skillBars.map(row => (
          <div className="skill-progress-row" key={row.skill}>
            <div><b>{row.skill}</b></div>
            <div className="bar"><i style={{ width: `${row.pct}%` }} /></div>
            <span>{row.pct}%</span>
          </div>
        ))}
      </section>
    </>
  )
}
