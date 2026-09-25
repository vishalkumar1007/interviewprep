import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { api } from '../api/client'
import { useProgress } from '../context/ProgressContext'

type AssessmentItem = {
  id: string
  weekHint: number
  title: string
  type: string
  skill: string
  minutes: number
  topic: string
  instructions: string
  platformIds?: string[]
  externalUrl?: string
  coverChecklist?: string[]
}

type Platform = {
  id: string
  name: string
  url: string
  bestFor: string
}

export function TestsPage() {
  const navigate = useNavigate()
  const { progress, setAssessmentStatus } = useProgress()
  const [data, setData] = useState<{ platforms: Platform[]; items: AssessmentItem[] } | null>(null)
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'mock'>('all')

  useEffect(() => {
    void api.getAssessments().then(setData)
  }, [])

  const items = useMemo(() => {
    if (!data) return []
    return data.items.filter(i => filter === 'all' || i.type === filter)
  }, [data, filter])

  if (!data) return <p className="empty-state">Loading assessments…</p>

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">VERIFY YOURSELF</p>
          <h1>Tests & mocks</h1>
          <p>Topic-based assessments with links to external platforms. Mark done after you complete the mock.</p>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">PLATFORMS</p>
        <div className="platform-grid">
          {data.platforms.map(p => (
            <a key={p.id} className="platform-card" href={p.url} target="_blank" rel="noreferrer">
              <b>{p.name}</b>
              <span>{p.bestFor}</span>
              <ExternalLink size={14} />
            </a>
          ))}
        </div>
      </section>

      <div className="filters" style={{ marginTop: 16 }}>
        {(['all', 'daily', 'weekly', 'mock'] as const).map(f => (
          <button key={f} className={`secondary-button compact ${filter === f ? 'active-filter' : ''}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="problem-table">
        {items.map(item => {
          const status = progress.assessments[item.id] || 'not_started'
          return (
            <article key={item.id} className={`problem-row ${status}`}>
              <div>
                <div className="problem-head">
                  <span className="diff medium">{item.type}</span>
                  <span className="skill-tag slate">W{item.weekHint}</span>
                  <b>{item.title}</b>
                </div>
                <p>{item.instructions}</p>
                <small>{item.minutes}m · {item.skill} · {item.topic}</small>
              </div>
              <div className="problem-actions">
                <button className="secondary-button compact" onClick={() => navigate(`/tests/${item.id}`)}>
                  Open details <ArrowRight size={12} />
                </button>
                <button className="primary-button compact" onClick={() => setAssessmentStatus(item.id, status === 'done' ? 'not_started' : 'done')}>
                  {status === 'done' ? 'Undo' : 'Mark done'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

export function AssessmentDetailPage() {
  const { id = '' } = useParams()
  const { progress, setAssessmentStatus } = useProgress()
  const [item, setItem] = useState<AssessmentItem | null>(null)
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    void api.getAssessments().then(data => {
      const found = data.items.find((a: AssessmentItem) => a.id === id) || null
      setItem(found)
      setPlatforms(data.platforms || [])
      setMissing(!found)
    })
  }, [id])

  if (missing) {
    return (
      <div className="empty-state">
        <p>Assessment not found.</p>
        <Link className="secondary-button" to="/tests">Back to tests</Link>
      </div>
    )
  }

  if (!item) return <p className="empty-state">Loading assessment…</p>

  const status = progress.assessments[item.id] || 'not_started'
  const linkedPlatforms = platforms.filter(p => item.platformIds?.includes(p.id))

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">{item.type.toUpperCase()} · WEEK {item.weekHint}</p>
          <h1>{item.title}</h1>
          <p>{item.minutes}m · {item.skill} · {item.topic}</p>
        </div>
        <Link className="secondary-button" to="/tests">Back to tests</Link>
      </section>

      <div className="split-grid">
        <section className="panel">
          <p className="eyebrow">INSTRUCTIONS</p>
          <h2 className="inline-title">How to run this check</h2>
          <p>{item.instructions}</p>
          {item.coverChecklist && item.coverChecklist.length > 0 && (
            <>
              <h3>Cover checklist</h3>
              <ul className="bullets">
                {item.coverChecklist.map(c => <li key={c}>{c}</li>)}
              </ul>
            </>
          )}
          <div className="form-actions">
            <Link className="secondary-button" to="/today">Back to Today</Link>
            <button
              className="primary-button"
              onClick={() => setAssessmentStatus(item.id, status === 'done' ? 'not_started' : 'done')}
            >
              {status === 'done' ? 'Mark incomplete' : 'Mark complete'}
            </button>
          </div>
        </section>

        <section className="panel">
          <p className="eyebrow">PLATFORMS</p>
          <h2 className="inline-title">Open mock</h2>
          {item.externalUrl && (
            <a className="primary-button" href={item.externalUrl} target="_blank" rel="noreferrer" style={{ marginBottom: 14 }}>
              Start on platform <ExternalLink size={14} />
            </a>
          )}
          {linkedPlatforms.length === 0 ? (
            <p className="empty-state">No linked platforms for this assessment.</p>
          ) : (
            <div className="mini-list">
              {linkedPlatforms.map(p => (
                <a key={p.id} className="mini-item row" href={p.url} target="_blank" rel="noreferrer">
                  <div>
                    <b>{p.name}</b>
                    <small>{p.bestFor}</small>
                  </div>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          )}
          <p className="today-hint" style={{ textAlign: 'left', marginTop: 16 }}>
            Status: <span className={`status-pill ${status}`}>{status.replace('_', ' ')}</span>
          </p>
        </section>
      </div>
    </>
  )
}
