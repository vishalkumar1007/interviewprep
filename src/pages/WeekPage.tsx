import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api/client'
import { useProgress } from '../context/ProgressContext'
import type { Plan, PlanTask, Status } from '../types'
import { TaskRow } from '../components/ui'

function addDaysIso(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatDayHeading(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function enrichTasks(list: PlanTask[], progressTasks: Record<string, Status>) {
  return list.map(t => ({ ...t, status: (progressTasks[t.id] || t.status) as Status }))
}

function isAssessKind(kind: string) {
  return kind === 'test' || kind === 'mock' || kind === 'assessment'
}

function CalDayCell({
  date,
  tasks,
  today,
  isSelected,
  disabled,
  onSelect,
}: {
  date: string
  tasks: PlanTask[]
  today: string
  isSelected: boolean
  disabled?: boolean
  onSelect: () => void
}) {
  const d = new Date(date + 'T12:00:00')
  const doneCount = tasks.filter(t => t.status === 'done').length
  const total = tasks.length
  const minutes = tasks.reduce((s, t) => s + (t.minutes || 0), 0)
  const isTest = tasks.some(t => isAssessKind(t.kind)) || d.getDay() === 6
  const isToday = date === today
  const allDone = total > 0 && doneCount === total

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isSelected}
      aria-current={isToday ? 'date' : undefined}
      className={[
        'calx-cell',
        disabled ? 'is-empty' : '',
        isToday ? 'is-today' : '',
        isSelected && isToday ? 'is-today-selected' : '',
        isSelected && !isToday ? 'is-picked' : '',
        isTest ? 'is-assess' : 'is-study',
        allDone ? 'is-complete' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => {
        if (disabled) return
        onSelect()
      }}
    >
      <div className="calx-cell-head">
        <span className="calx-dow">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
        {isToday ? <span className="calx-today-tag">Today</span> : null}
        {allDone ? (
          <span className="calx-check" aria-label="Day complete">✓</span>
        ) : null}
      </div>
      <div className="calx-num">{d.getDate()}</div>
      <div className="calx-stats">
        <span>{total ? `${doneCount}/{total} tasks` : 'No tasks'}</span>
        <span>{minutes ? `${minutes}m` : '—'}</span>
      </div>
      <ul className="calx-chips">
        {tasks.slice(0, 3).map(t => (
          <li key={t.id} className={t.status === 'done' ? 'done' : isAssessKind(t.kind) ? 'assess' : ''}>
            {t.skill}
          </li>
        ))}
        {tasks.length > 3 ? <li className="more">+{tasks.length - 3}</li> : null}
      </ul>
    </button>
  )
}

export function WeekPage() {
  const { progress, setTaskStatus } = useProgress()
  const [mode, setMode] = useState<'week' | 'month'>('week')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [week, setWeek] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [monthCursor, setMonthCursor] = useState<{ year: number; month: number } | null>(null)
  const [monthData, setMonthData] = useState<{
    year: number
    month: number
    days: Array<{ date: string; tasks: PlanTask[]; week: number | null }>
  } | null>(null)
  const [problems, setProblems] = useState<Record<string, { title: string; leetcodeSlug: string; difficulty: string }>>({})
  const dayPanelRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    void api.getDsa().then(d => {
      const map: Record<string, { title: string; leetcodeSlug: string; difficulty: string }> = {}
      d.problems.forEach(p => { map[p.id] = p })
      setProblems(map)
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    void api.getPlan(week ?? undefined).then(p => {
      setPlan(p)
      if (week == null) setWeek(p.weekIndex)
      if (!monthCursor) {
        const [y, m] = p.today.split('-').map(Number)
        setMonthCursor({ year: y, month: m })
      }
      const weekStart = p.weekStart
      const weekDates = Array.from({ length: 7 }, (_, i) => addDaysIso(weekStart, i))
      setSelectedDate(prev => {
        if (prev && (mode === 'month' || weekDates.includes(prev))) return prev
        if (weekDates.includes(p.today)) return p.today
        return weekStart
      })
    })
  }, [week, progress.tasks, mode])

  useEffect(() => {
    if (mode !== 'month' || !monthCursor) return
    void api.getMonth(monthCursor.year, monthCursor.month).then(setMonthData)
  }, [mode, monthCursor, progress.tasks])

  const tasks = useMemo(() => {
    if (!plan) return []
    return enrichTasks(plan.weekTasks, progress.tasks as Record<string, Status>)
  }, [plan, progress.tasks])

  const weekDates = useMemo(() => {
    if (!plan?.weekStart) return []
    return Array.from({ length: 7 }, (_, i) => addDaysIso(plan.weekStart, i))
  }, [plan?.weekStart])

  const byDate = useMemo(() => {
    const map = new Map<string, PlanTask[]>()
    for (const t of tasks) {
      const list = map.get(t.date) || []
      list.push(t)
      map.set(t.date, list)
    }
    return map
  }, [tasks])

  const monthTasksByDate = useMemo(() => {
    const map = new Map<string, PlanTask[]>()
    if (!monthData) return map
    for (const day of monthData.days) {
      map.set(day.date, enrichTasks(day.tasks, progress.tasks as Record<string, Status>))
    }
    return map
  }, [monthData, progress.tasks])

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return []
    if (mode === 'month') {
      const fromMonth = monthTasksByDate.get(selectedDate)
      if (fromMonth) return fromMonth
    }
    return byDate.get(selectedDate) || tasks.filter(t => t.date === selectedDate)
  }, [selectedDate, mode, monthTasksByDate, byDate, tasks])

  const done = tasks.filter(t => t.status === 'done').length
  const backlog = (plan?.backlog || []).map(t => ({ ...t, status: (progress.tasks[t.id] || t.status) as Status }))
  const aheadDone = (plan?.aheadDone || []).map(t => ({
    ...t,
    status: (progress.tasks[t.id] || t.status) as Status,
  }))
  const jumpWarning = backlog.length > 0 && aheadDone.length > 0

  const selectDate = (date: string, weekNum?: number | null, opts?: { keepMode?: boolean }) => {
    setSelectedDate(date)
    if (weekNum) setWeek(weekNum)
    if (!opts?.keepMode) {
      // stay in current mode unless jumping from backlog
    }
    requestAnimationFrame(() => {
      dayPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const shiftMonth = (delta: number) => {
    if (!monthCursor || !plan) return
    const d = new Date(monthCursor.year, monthCursor.month - 1 + delta, 1)
    const start = plan.startDate
    const end = plan.endDate || addDaysIso(plan.startDate, (plan.totalWeeks || 26) * 7 - 1)
    const cursorIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
    const endMonth = end.slice(0, 7) + '-01'
    const startMonth = start.slice(0, 7) + '-01'
    if (cursorIso < startMonth || cursorIso > endMonth) return
    setMonthCursor({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }

  const jumpToTask = (t: PlanTask) => {
    setMode('week')
    setWeek(t.week)
    setSelectedDate(t.date)
  }

  const goToToday = () => {
    if (!plan) return
    setMode('week')
    setWeek(plan.weekIndex)
    setSelectedDate(plan.today)
    const [y, m] = plan.today.split('-').map(Number)
    setMonthCursor({ year: y, month: m })
  }

  if (!plan || week == null) return <p className="empty-state">Loading week plan…</p>

  const totalWeeks = plan.totalWeeks || 26
  const selectedIsToday = selectedDate === plan.today
  const selectedIsAssess = selectedTasks.some(t => isAssessKind(t.kind))
  const selectedDow = selectedDate ? new Date(selectedDate + 'T12:00:00').getDay() : -1

  return (
    <div className="shell-page week-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">DASHBOARD</p>
          <h1>Week plan</h1>
          <p>
            Week {week} of {totalWeeks} · {plan.theme}. Study Sun–Fri · tests & mocks Saturday only.
          </p>
        </div>
        <div className="cal-heading-actions">
          <button type="button" className="secondary-button compact" onClick={goToToday}>
            Today · {plan.today.slice(5)}
          </button>
          <div className="segmented">
            <button type="button" className={mode === 'week' ? 'active' : ''} onClick={() => setMode('week')}>Week</button>
            <button type="button" className={mode === 'month' ? 'active' : ''} onClick={() => setMode('month')}>Month</button>
          </div>
        </div>
      </section>

      {jumpWarning && (
        <p className="form-error week-warning">You have backlog open while also completing ahead days — clear past work when you can.</p>
      )}

      <section className="calx" aria-label="Plan calendar">
        <header className="calx-toolbar">
          <div className="calx-nav">
            {mode === 'week' ? (
              <>
                <button type="button" className="calx-arrow" aria-label="Previous week" onClick={() => setWeek(w => Math.max(1, (w || 1) - 1))}>‹</button>
                <div className="calx-title">
                  <b>Week {week}</b>
                  <small>{plan.weekStart} – {addDaysIso(plan.weekStart, 6)}</small>
                </div>
                <button type="button" className="calx-arrow" aria-label="Next week" onClick={() => setWeek(w => Math.min(totalWeeks, (w || 1) + 1))}>›</button>
              </>
            ) : (
              <>
                <button type="button" className="calx-arrow" aria-label="Previous month" onClick={() => shiftMonth(-1)}>‹</button>
                <div className="calx-title">
                  <b>{monthCursor ? monthLabel(monthCursor.year, monthCursor.month) : 'Month'}</b>
                  <small>Click a date to load its tasks</small>
                </div>
                <button type="button" className="calx-arrow" aria-label="Next month" onClick={() => shiftMonth(1)}>›</button>
              </>
            )}
          </div>
          <p className="calx-status">
            {mode === 'week' ? `${done}/${tasks.length} complete` : plan.phase}
          </p>
        </header>

        <div className="calx-legend" aria-hidden>
          <span><i className="calx-swatch today" /> Today</span>
          <span><i className="calx-swatch pick" /> Selected</span>
          <span><i className="calx-swatch done" /> Complete</span>
        </div>

        {mode === 'week' ? (
          <div className="calx-week">
            {weekDates.map(date => (
              <CalDayCell
                key={date}
                date={date}
                tasks={byDate.get(date) || []}
                today={plan.today}
                isSelected={selectedDate === date}
                onSelect={() => selectDate(date, week)}
              />
            ))}
          </div>
        ) : (
          <div className="calx-week calx-month-grid">
            {(() => {
              if (!monthData) return <p className="empty-state calx-loading">Loading month…</p>
              const first = monthData.days[0]?.date
              if (!first) return null
              const startPad = new Date(first + 'T12:00:00').getDay()
              const pads = Array.from({ length: startPad }, (_, i) => (
                <div key={`pad-${i}`} className="calx-cell is-empty" />
              ))
              const cells = monthData.days.map(day => {
                const enriched = enrichTasks(day.tasks, progress.tasks as Record<string, Status>)
                const inSyllabus = day.week != null
                return (
                  <CalDayCell
                    key={day.date}
                    date={day.date}
                    tasks={enriched}
                    today={plan.today}
                    isSelected={selectedDate === day.date}
                    disabled={!inSyllabus}
                    onSelect={() => selectDate(day.date, day.week, { keepMode: true })}
                  />
                )
              })
              return [...pads, ...cells]
            })()}
          </div>
        )}
      </section>

      <div className="schedule-layout">
        <section
          className={`panel day-schedule-panel ${selectedIsToday ? 'is-today' : selectedDate ? 'is-picked' : ''}`}
          ref={dayPanelRef}
        >
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                {selectedDate ? formatDayHeading(selectedDate) : 'Pick a day'}
                {selectedIsToday ? ' · Today' : ''}
                {selectedDow === 6 ? ' · Saturday assess' : selectedDow >= 0 ? ' · Study day' : ''}
              </p>
              <h2>{selectedIsToday ? "Today's schedule" : 'Day schedule'}</h2>
              <p className="day-panel-sub">
                {selectedIsAssess
                  ? 'Assessment / mock block — timed work only.'
                  : 'Study sessions for this date. Click another calendar day to switch.'}
              </p>
            </div>
            <span className={`day-pill ${selectedIsAssess ? 'assess' : ''}`}>
              {selectedTasks.filter(t => t.status === 'done').length}/{selectedTasks.length}
            </span>
          </div>
          <div className="task-list">
            {!selectedDate ? (
              <p className="empty-state">Select a date on the calendar to see its tasks.</p>
            ) : selectedTasks.length === 0 ? (
              <p className="empty-state">No tasks mapped to this day.</p>
            ) : (
              selectedTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={status => setTaskStatus(task.id, status)}
                  problems={problems}
                  showStartLinks
                />
              ))
            )}
          </div>
        </section>
        <aside className="plan-sidebar">
          <div className="panel">
            <p className="eyebrow">BACKLOG</p>
            <h3>{backlog.length} incomplete</h3>
            <p>Past sessions still open.</p>
            <div className="mini-list">
              {backlog.length === 0 ? (
                <p className="empty-state">Backlog clear.</p>
              ) : (
                backlog.slice(0, 8).map(t => (
                  <button key={t.id} type="button" className="mini-item" onClick={() => jumpToTask(t)}>
                    <b>{t.title}</b>
                    <small>{t.date} · W{t.week}</small>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="panel">
            <p className="eyebrow">AHEAD DONE</p>
            <h3>{aheadDone.length} advanced</h3>
            <p>Completed before their calendar day.</p>
            <div className="mini-list">
              {aheadDone.length === 0 ? (
                <p className="empty-state">No ahead completions yet.</p>
              ) : (
                aheadDone.slice(0, 8).map(t => (
                  <button key={t.id} type="button" className="mini-item" onClick={() => jumpToTask(t)}>
                    <b>{t.title}</b>
                    <small>{t.date} · W{t.week}</small>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
