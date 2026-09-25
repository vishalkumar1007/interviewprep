import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ExternalLink, Search } from 'lucide-react'
import { api } from '../api/client'
import { useProgress } from '../context/ProgressContext'
import type { ScheduleEntry, ScheduleIndex, Status } from '../types'
import { leetcodeUrl, youtubeSearchUrl } from '../components/ui'

export const BANK_NAV = [
  { key: 'dsa', label: 'DSA' },
  { key: 'go', label: 'Go' },
  { key: 'fundamentals', label: 'Fundamentals' },
  { key: 'networking', label: 'Networking' },
  { key: 'system-design', label: 'System design' },
  { key: 'communication', label: 'Communication' },
] as const

type BankItem = {
  id: string
  title: string
  difficulty?: string
  pattern?: string
  topic?: string
  kind?: string
  level?: string
  overview?: string
  instruction?: string
  practicePrompt?: string
  whyGoogle?: string
  youtubeSearch?: string
  leetcodeSlug?: string
  selfCheckQuestions?: string[]
  resources?: Array<{ label: string; url: string }>
  checklist?: string[]
}

function itemTopic(item: BankItem) {
  return item.difficulty || item.topic || item.kind || item.pattern || item.level || 'general'
}

function ScheduleTags({ entries }: { entries: ScheduleEntry[] }) {
  if (!entries?.length) return <small className="schedule-tags muted">Not scheduled in the 26-week plan yet</small>
  return (
    <div className="schedule-tags">
      {entries.slice(0, 4).map(e => (
        <span key={`${e.taskId}-${e.date}`} className="schedule-chip">
          W{e.week} · {e.date.slice(5)}
        </span>
      ))}
      {entries.length > 4 && <span className="schedule-chip more">+{entries.length - 4}</span>}
    </div>
  )
}

export function BanksIndexPage() {
  return <Navigate to="/banks/dsa" replace />
}

export function SkillBankPage() {
  const { skill = 'dsa' } = useParams()
  const [searchParams] = useSearchParams()
  const focusItem = searchParams.get('item')
  const { progress, setBankItemStatus, setProblemStatus } = useProgress()
  const [data, setData] = useState<{ skill: string; key: string; items: BankItem[]; patterns?: unknown[] } | null>(null)
  const [schedule, setSchedule] = useState<ScheduleIndex | null>(null)
  const [q, setQ] = useState('')
  const [topic, setTopic] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'todo'>('all')

  useEffect(() => {
    void api.getBank(skill).then(setData).catch(() => setData(null))
    void api.getSchedule().then(setSchedule).catch(() => undefined)
  }, [skill])

  const topics = useMemo(() => {
    if (!data) return []
    return [...new Set(data.items.map(itemTopic))].sort()
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.items.filter(item => {
      if (focusItem && item.id === focusItem) return true
      const status = (skill === 'dsa'
        ? progress.problems[item.id]
        : progress.bankItems[item.id]) || 'not_started'
      if (statusFilter === 'done' && status !== 'done') return false
      if (statusFilter === 'todo' && status === 'done') return false
      if (topic !== 'all' && itemTopic(item) !== topic) return false
      if (q.trim()) {
        const hay = `${item.title} ${item.overview || ''} ${item.instruction || ''} ${item.practicePrompt || ''} ${itemTopic(item)}`.toLowerCase()
        if (!hay.includes(q.trim().toLowerCase())) return false
      }
      return true
    })
  }, [data, progress, q, topic, statusFilter, skill, focusItem])

  useEffect(() => {
    if (!focusItem || !data) return
    const t = window.setTimeout(() => {
      document.getElementById(`bank-item-${focusItem}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
    return () => window.clearTimeout(t)
  }, [focusItem, data, filtered])

  const doneCount = useMemo(() => {
    if (!data) return 0
    return data.items.filter(item => {
      const status = skill === 'dsa' ? progress.problems[item.id] : progress.bankItems[item.id]
      return status === 'done'
    }).length
  }, [data, progress, skill])

  if (!BANK_NAV.some(b => b.key === skill)) {
    return <Navigate to="/banks/dsa" replace />
  }

  if (!data) return <p className="empty-state">Loading bank…</p>

  const toggle = (item: BankItem, status: Status) => {
    const next = status === 'done' ? 'not_started' : 'done'
    if (skill === 'dsa') setProblemStatus(item.id, next as Status)
    else setBankItemStatus(item.id, next as Status)
  }

  const entriesFor = (item: BankItem) => {
    if (!schedule) return []
    if (skill === 'dsa') return schedule.byProblem[item.id] || []
    return schedule.byBankItem[item.id] || []
  }

  return (
    <div className="shell-page bank-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">SKILL BANK</p>
          <h1>{data.skill}</h1>
          <p>{doneCount} / {data.items.length} complete · attempt yourself before using AI as reviewer.</p>
        </div>
        <div className="bank-progress-pill">
          <b>{data.items.length ? Math.round(doneCount / data.items.length * 100) : 0}%</b>
          <span>coverage</span>
        </div>
      </section>

      <div className="bank-tabs">
        {BANK_NAV.map(s => (
          <Link key={s.key} className={`bank-tab ${s.key === skill ? 'active' : ''}`} to={`/banks/${s.key}`}>
            {s.label}
          </Link>
        ))}
      </div>

      <div className="bank-toolbar">
        <label className="bank-search">
          <Search size={15} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search questions or topics…"
            aria-label="Search bank"
          />
        </label>
        <select value={topic} onChange={e => setTopic(e.target.value)} aria-label="Filter topic">
          <option value="all">All topics</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} aria-label="Filter status">
          <option value="all">All status</option>
          <option value="todo">To do</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="problem-table">
        {filtered.length === 0 ? (
          <p className="empty-state">No items match your filters.</p>
        ) : filtered.map(item => {
          const status = ((skill === 'dsa' ? progress.problems[item.id] : progress.bankItems[item.id]) || 'not_started') as Status
          const focused = focusItem === item.id
          return (
            <article
              key={item.id}
              id={`bank-item-${item.id}`}
              className={`problem-row bank-row ${status}${focused ? ' bank-row-focus' : ''}`}
            >
              <div>
                <div className="problem-head">
                  <span className={`diff ${(item.difficulty || 'medium').toLowerCase()}`}>{itemTopic(item)}</span>
                  <b>{item.title}</b>
                </div>
                <p>{item.overview || item.instruction || item.practicePrompt || item.whyGoogle}</p>
                {item.practicePrompt && item.overview && <small>Practice: {item.practicePrompt}</small>}
                {item.selfCheckQuestions && (
                  <ul className="bullets tight">{item.selfCheckQuestions.map(question => <li key={question}>{question}</li>)}</ul>
                )}
                <ScheduleTags entries={entriesFor(item)} />
              </div>
              <div className="problem-actions">
                {item.leetcodeSlug && (
                  <a className="secondary-button compact" href={leetcodeUrl(item.leetcodeSlug)} target="_blank" rel="noreferrer">
                    LeetCode <ExternalLink size={12} />
                  </a>
                )}
                {item.youtubeSearch && (
                  <a className="secondary-button compact" href={youtubeSearchUrl(item.youtubeSearch)} target="_blank" rel="noreferrer">
                    YouTube <ExternalLink size={12} />
                  </a>
                )}
                {item.resources?.map(r => (
                  <a key={r.url} className="secondary-button compact" href={r.url} target="_blank" rel="noreferrer">
                    {r.label} <ExternalLink size={12} />
                  </a>
                ))}
                <button className="primary-button compact" type="button" onClick={() => toggle(item, status)}>
                  {status === 'done' ? 'Undo' : 'Done'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
