import { useEffect, useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { api } from '../api/client'
import { useProgress } from '../context/ProgressContext'
import type { DsaPattern, DsaProblem } from '../types'
import { leetcodeUrl, youtubeSearchUrl } from '../components/ui'

export function DsaPage() {
  const { progress, setProblemStatus } = useProgress()
  const [patterns, setPatterns] = useState<DsaPattern[]>([])
  const [problems, setProblems] = useState<DsaProblem[]>([])
  const [pattern, setPattern] = useState('all')
  const [difficulty, setDifficulty] = useState('all')

  useEffect(() => {
    void api.getDsa().then(d => {
      setPatterns(d.patterns)
      setProblems(d.problems)
    })
  }, [])

  const filtered = useMemo(() => problems.filter(p => {
    if (pattern !== 'all' && p.pattern !== pattern) return false
    if (difficulty !== 'all' && p.difficulty !== difficulty) return false
    return true
  }), [problems, pattern, difficulty])

  const doneCount = problems.filter(p => progress.problems[p.id] === 'done').length
  const byPattern = patterns.map(pat => {
    const list = problems.filter(p => p.pattern === pat.id)
    const done = list.filter(p => progress.problems[p.id] === 'done').length
    return { ...pat, total: list.length, done, pct: list.length ? Math.round(done / list.length * 100) : 0 }
  }).filter(p => p.total > 0)

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">GOOGLE-WEIGHTED BANK</p>
          <h1>DSA problems</h1>
          <p>{doneCount} / {problems.length} complete · graphs, DP, and binary-search-on-answer weighted higher.</p>
        </div>
      </section>

      <section className="panel coverage-panel">
        <p className="eyebrow">PATTERN COVERAGE</p>
        <div className="coverage-grid">
          {byPattern.slice(0, 12).map(p => (
            <div key={p.id} className="coverage-item">
              <div className="coverage-top"><b>{p.name}</b><span>{p.pct}%</span></div>
              <div className="bar"><i style={{ width: `${p.pct}%` }} /></div>
              <small>weight {p.googleWeight}/5 · {p.done}/{p.total}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="filters">
        <select value={pattern} onChange={e => setPattern(e.target.value)}>
          <option value="all">All patterns</option>
          {patterns.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value="all">All difficulties</option>
          {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="problem-table">
        {filtered.map(p => {
          const status = progress.problems[p.id] || 'not_started'
          return (
            <article key={p.id} className={`problem-row ${status}`}>
              <div>
                <div className="problem-head">
                  <span className={`diff ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                  <b>{p.title}</b>
                </div>
                <p>{p.whyGoogle}</p>
                <small>Follow-up: {p.followUpIdea}</small>
              </div>
              <div className="problem-actions">
                <a href={leetcodeUrl(p.leetcodeSlug)} target="_blank" rel="noreferrer" className="secondary-button compact">LeetCode <ExternalLink size={12} /></a>
                <a href={youtubeSearchUrl(p.youtubeSearch)} target="_blank" rel="noreferrer" className="secondary-button compact">YouTube</a>
                <button className="primary-button compact" onClick={() => setProblemStatus(p.id, status === 'done' ? 'not_started' : 'done')}>
                  {status === 'done' ? 'Undo' : 'Done'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
