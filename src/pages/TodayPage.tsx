import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, ListChecks } from 'lucide-react'
import { api } from '../api/client'
import { useProgress } from '../context/ProgressContext'
import type { Plan, Status } from '../types'
import { TaskRow, leetcodeUrl } from '../components/ui'

function withStatus(tasks: Plan['todayTasks'], progress: Record<string, Status>) {
  return tasks.map(t => ({ ...t, status: (progress[t.id] || t.status) as Status }))
}

export function TodayPage() {
  const { setTaskStatus, progress } = useProgress()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [problems, setProblems] = useState<Record<string, { title: string; leetcodeSlug: string; difficulty: string }>>({})

  useEffect(() => {
    void api.getPlan().then(setPlan).catch(() => undefined)
    void api.getDsa().then(d => {
      const map: Record<string, { title: string; leetcodeSlug: string; difficulty: string }> = {}
      d.problems.forEach(p => { map[p.id] = p })
      setProblems(map)
    }).catch(() => undefined)
  }, [progress.tasks])

  const todayTasks = useMemo(
    () => (plan ? withStatus(plan.todayTasks, progress.tasks) : []),
    [plan, progress.tasks],
  )

  const learnTasks = todayTasks.filter(t => t.kind !== 'test' && t.kind !== 'mock' && t.kind !== 'assessment')
  const assessTasks = useMemo(() => {
    if (!plan) return []
    const source = plan.todayAssessments?.length
      ? withStatus(plan.todayAssessments, progress.tasks)
      : todayTasks.filter(t => t.kind === 'test' || t.kind === 'mock' || t.kind === 'assessment')
    return source
  }, [plan, progress.tasks, todayTasks])

  const doneCount = todayTasks.filter(t => t.status === 'done').length
  const totalMinutes = todayTasks.reduce((s, t) => s + t.minutes, 0)
  const doneMinutes = todayTasks.filter(t => t.status === 'done').reduce((s, t) => s + t.minutes, 0)
  const pct = todayTasks.length ? Math.round((doneCount / todayTasks.length) * 100) : 0
  const dow = plan ? new Date(plan.today + 'T12:00:00').getDay() : -1
  const isSaturday = dow === 6
  const capacityTarget = plan
    ? (isSaturday ? (plan.weekendMinutes || 240) : (plan.weekdayMinutes || 120))
    : 120

  if (!plan) return <p className="empty-state">Loading today’s plan…</p>

  return (
    <div className="today-page">
      <header className="today-hero">
        <div className="today-hero-copy">
          <p className="eyebrow">WEEK {plan.weekIndex} OF {plan.totalWeeks} · {plan.phase}</p>
          <h1>Today</h1>
          <p className="today-focus">{plan.theme}</p>
          <p className="today-sub">{plan.focus}</p>
        </div>
        <div className="today-progress-card" aria-label={`${pct}% of today’s tasks done`}>
          <div className="today-ring" style={{ background: `conic-gradient(var(--accent) ${pct}%, var(--bg-muted) 0)` }}>
            <div className="today-ring-inner">
              <b>{pct}%</b>
              <span>done</span>
            </div>
          </div>
          <div className="today-progress-meta">
            <p><ListChecks size={14} /> {doneCount}/{todayTasks.length || 0} tasks</p>
            <p><Clock3 size={14} /> {doneMinutes}/{totalMinutes} min</p>
            <p className="today-capacity">
              Plan target {capacityTarget}m · {isSaturday ? 'Saturday assess' : 'study day'}
            </p>
            <Link className="primary-button compact" to="/today/target">
              Focus mode <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {plan.backlog.length > 0 && (
        <Link className="today-backlog-chip" to="/week">
          {plan.backlog.length} backlog item{plan.backlog.length === 1 ? '' : 's'} — clear in Week plan
          <ArrowRight size={14} />
        </Link>
      )}

      <div className="today-stack">
        <section className="today-main panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR SESSIONS</p>
              <h2>What to cover today</h2>
            </div>
            <span className="day-pill">{plan.today}</span>
          </div>

          {learnTasks.length === 0 && assessTasks.length === 0 ? (
            <div className="today-empty">
              <p>No sessions for today.</p>
              <div className="today-empty-actions">
                <Link className="secondary-button" to="/week">Browse week</Link>
                <Link className="primary-button" to="/tests">Open tests</Link>
              </div>
            </div>
          ) : learnTasks.length === 0 ? (
            <p className="today-empty">No learning sessions — check today’s assessment below.</p>
          ) : (
            <div className="today-session-list">
              {learnTasks.map((task, index) => (
                <article key={task.id} className={`today-session ${task.status === 'done' ? 'is-done' : ''}`}>
                  <div className="today-session-index">{String(index + 1).padStart(2, '0')}</div>
                  <div className="today-session-body">
                    <TaskRow
                      task={task}
                      onToggle={status => setTaskStatus(task.id, status)}
                      problems={problems}
                      showStartLinks
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {assessTasks.length > 0 && (
          <section className="panel today-assess">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">TODAY’S CHECK</p>
                <h2>Assessment</h2>
              </div>
              <Link className="text-button" to="/tests">All tests <ArrowRight size={14} /></Link>
            </div>
            <div className="today-assess-list">
              {assessTasks.map((task, index) => (
                <article key={task.id} className={`today-assess-item ${task.status === 'done' ? 'is-done' : ''}`}>
                  <div className="today-session-index">{String(index + 1).padStart(2, '0')}</div>
                  <div className="today-assess-body">
                    <TaskRow
                      task={task}
                      onToggle={status => setTaskStatus(task.id, status)}
                      problems={problems}
                      showStartLinks
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <p className="today-hint">Attempt first. Use AI only as a reviewer after you finish.</p>
    </div>
  )
}

export function TodayTargetPage() {
  const { setTaskStatus, progress } = useProgress()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [problems, setProblems] = useState<Record<string, { title: string; leetcodeSlug: string; difficulty: string }>>({})

  useEffect(() => {
    void api.getPlan().then(setPlan)
    void api.getDsa().then(d => {
      const map: Record<string, { title: string; leetcodeSlug: string; difficulty: string }> = {}
      d.problems.forEach(p => { map[p.id] = p })
      setProblems(map)
    })
  }, [progress.tasks])

  if (!plan) return <p className="empty-state">Loading…</p>
  const tasks = withStatus(plan.todayTasks, progress.tasks)
  const done = tasks.filter(t => t.status === 'done').length

  return (
    <div className="today-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">FOCUS MODE · WEEK {plan.weekIndex}</p>
          <h1>Today’s learning</h1>
          <p>{plan.focus} · {done}/{tasks.length} complete</p>
        </div>
        <Link className="secondary-button" to="/today">Back to Today</Link>
      </section>

      <div className="panel today-main">
        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className="target-block">
              <TaskRow
                task={task}
                onToggle={status => setTaskStatus(task.id, status)}
                problems={problems}
                showStartLinks
              />
              {!!task.problemIds?.length && (
                <div className="problem-chips">
                  {task.problemIds.map(id => {
                    const p = problems[id]
                    if (!p) return null
                    return (
                      <a key={id} className="problem-link compact-link" href={leetcodeUrl(p.leetcodeSlug)} target="_blank" rel="noreferrer">
                        {p.title} · {p.difficulty}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
