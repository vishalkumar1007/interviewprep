import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { api } from '../api/client'

export function SyllabusPage() {
  const [syllabus, setSyllabus] = useState<any>(null)

  useEffect(() => {
    void api.getSyllabus().then(setSyllabus)
  }, [])

  if (!syllabus) return <p className="empty-state">Loading syllabus…</p>

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">{syllabus.horizonWeeks}-WEEK GOOGLE SWE PATH</p>
          <h1>Syllabus</h1>
          <p>{syllabus.goal}</p>
        </div>
        <Link className="primary-button" to="/today">Start today <ArrowRight size={14} /></Link>
      </section>

      <section className="panel ai-rule">
        <p className="eyebrow">RULE</p>
        <h2 className="inline-title">AI is reviewer, not coder</h2>
        <p>{syllabus.aiRule}</p>
        <p className="muted">Capacity: {syllabus.capacity?.weekdayMinutes}m weekdays · {syllabus.capacity?.weekendMinutes}m weekends (editable in Profile).</p>
      </section>

      <section className="panel" style={{ marginTop: 17 }}>
        <p className="eyebrow">WEEKLY RHYTHM</p>
        <ul className="bullets">
          <li><b>Weekday:</b> {syllabus.weeklyRhythm?.weekday}</li>
          <li><b>Weekend:</b> {syllabus.weeklyRhythm?.weekend}</li>
          <li><b>Assessment:</b> {syllabus.weeklyRhythm?.assessment}</li>
        </ul>
      </section>

      <section className="panel" style={{ marginTop: 17 }}>
        <p className="eyebrow">SKILL TARGETS</p>
        <div className="coverage-grid">
          {(syllabus.skillTargets || []).map((s: any) => (
            <div key={s.skill} className="coverage-item story-card">
              <div className="coverage-top"><b>{s.skill}</b></div>
              <p>{s.target}</p>
              <small>{(s.problemsOrTopics || []).join(' · ')}</small>
              <Link className="text-button" to={s.skill === 'DSA' ? '/dsa' : `/banks/${encodeURIComponent(
                s.skill === 'System Design' ? 'system-design' : s.skill.toLowerCase()
              )}`}>Open bank <ArrowRight size={12} /></Link>
            </div>
          ))}
        </div>
      </section>

      <section className="roadmap-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PHASES</p>
            <h2>Your 26-week spine</h2>
          </div>
          <Link className="text-button" to="/tests">Open tests <ArrowRight size={14} /></Link>
        </div>
        <div className="phase-list">
          {(syllabus.phases || []).map((p: any) => (
            <article key={p.id} className="panel phase-card">
              <span className="eyebrow">WEEKS {p.weeks?.[0]}–{p.weeks?.[1]}</span>
              <h3>{p.title}</h3>
              <p>{p.focus}</p>
              <ul className="bullets">
                {(p.outcomes || []).map((o: string) => <li key={o}>{o}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
