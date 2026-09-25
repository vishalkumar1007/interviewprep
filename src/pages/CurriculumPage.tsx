import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ChevronDown, ExternalLink } from 'lucide-react'
import { api } from '../api/client'
import { useProgress } from '../context/ProgressContext'
import type { CurriculumModule, CurriculumSkill, DsaProblem, Status } from '../types'
import { leetcodeUrl, youtubeSearchUrl } from '../components/ui'

export function CurriculumPage() {
  const [skills, setSkills] = useState<CurriculumSkill[]>([])
  const [selected, setSelected] = useState('DSA')
  const { progress } = useProgress()
  const navigate = useNavigate()

  useEffect(() => {
    void api.getCurriculum().then(d => {
      setSkills(d.skills)
      if (d.skills[0]) setSelected(d.skills[0].skill)
    })
  }, [])

  const track = skills.find(s => s.skill === selected)
  if (!track) return <p className="empty-state">Loading curriculum…</p>

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">24-WEEK INTERVIEW SPRINT</p>
          <h1>Curriculum</h1>
          <p>Skill-wise depth aligned to the Google SWE bar. Open a module to learn what and why.</p>
        </div>
        <Link className="secondary-button" to="/dsa">Open DSA bank</Link>
      </section>
      <section className="curriculum-layout">
        <aside className="track-nav">
          {skills.map(item => (
            <button key={item.skill} className={selected === item.skill ? 'active' : ''} onClick={() => setSelected(item.skill)}>
              <span className={`dot ${item.color}`} />
              <span>{item.skill}</span>
              <ChevronDown size={15} />
            </button>
          ))}
        </aside>
        <div className="course-panel">
          <div className="course-top">
            <div>
              <span className={`skill-tag ${track.color}`}>{track.skill}</span>
              <h2>{track.skill}</h2>
              <p>{track.description}</p>
            </div>
            <div className="course-target">
              <span>SPRINT TARGET</span>
              <b>{track.target}</b>
            </div>
          </div>
          <div className="module-grid">
            {track.modules.map((module, index) => {
              const status = progress.modules[`${track.skill}:${module.slug}`] || 'not_started'
              return (
                <article className="module-card" key={module.slug}>
                  <span className="module-number">MODULE {String(index + 1).padStart(2, '0')}</span>
                  <h3>{module.title}</h3>
                  <ul>
                    {module.learnItems.slice(0, 4).map(item => (
                      <li key={item}><CheckCircle2 size={12} />{item}</li>
                    ))}
                  </ul>
                  <div className="module-meta">
                    <span className={`status-pill ${status}`}>{status.replace('_', ' ')}</span>
                    <button onClick={() => navigate(`/curriculum/${encodeURIComponent(track.skill)}/${module.slug}`)}>
                      Open module <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export function ModulePage() {
  const { skill = '', moduleSlug = '' } = useParams()
  const decodedSkill = decodeURIComponent(skill)
  const { progress, setModuleStatus, setProblemStatus } = useProgress()
  const [module, setModule] = useState<CurriculumModule | null>(null)
  const [color, setColor] = useState('violet')
  const [problems, setProblems] = useState<DsaProblem[]>([])

  useEffect(() => {
    void Promise.all([api.getCurriculum(), api.getDsa()]).then(([curr, dsa]) => {
      const track = curr.skills.find(s => s.skill === decodedSkill)
      const mod = track?.modules.find((m: CurriculumModule) => m.slug === moduleSlug) || null
      setModule(mod)
      setColor(track?.color || 'violet')
      const ids = new Set(mod?.linkedProblemIds || [])
      setProblems(dsa.problems.filter(p => ids.has(p.id)))
    })
  }, [decodedSkill, moduleSlug])

  if (!module) return <p className="empty-state">Loading module…</p>
  const key = `${decodedSkill}:${module.slug}`
  const status = (progress.modules[key] || 'not_started') as Status

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">{decodedSkill}</p>
          <h1>{module.title}</h1>
          <p>{module.overview}</p>
        </div>
        <Link className="secondary-button" to="/curriculum">Back</Link>
      </section>
      <div className="split-grid">
        <section className="panel">
          <span className={`skill-tag ${color}`}>{decodedSkill}</span>
          <h2 className="inline-title">Why Google asks this</h2>
          <p>{module.whyGoogle}</p>
          <h3>Learn</h3>
          <ul className="bullets">{module.learnItems.map(i => <li key={i}>{i}</li>)}</ul>
          <h3>Checklist</h3>
          <ul className="bullets">{module.checklist.map(i => <li key={i}>{i}</li>)}</ul>
          <a className="problem-link" href={youtubeSearchUrl(module.youtubeSearch)} target="_blank" rel="noreferrer">
            Search on YouTube <ExternalLink size={14} />
          </a>
          <div className="form-actions">
            <button className="secondary-button" onClick={() => setModuleStatus(key, 'in_progress')}>Mark in progress</button>
            <button className="primary-button" onClick={() => setModuleStatus(key, status === 'done' ? 'not_started' : 'done')}>
              {status === 'done' ? 'Mark incomplete' : 'Mark complete'}
            </button>
          </div>
        </section>
        <section className="panel">
          <p className="eyebrow">LINKED PROBLEMS</p>
          <h2 className="inline-title">Practice</h2>
          {problems.length === 0 ? <p className="empty-state">No linked problems — see DSA bank.</p> : (
            <div className="mini-list">
              {problems.map(p => {
                const ps = progress.problems[p.id] || 'not_started'
                return (
                  <div key={p.id} className="mini-item row">
                    <div>
                      <b>{p.title}</b>
                      <small>{p.difficulty} · {p.pattern}</small>
                    </div>
                    <div className="setting-actions">
                      <a href={leetcodeUrl(p.leetcodeSlug)} target="_blank" rel="noreferrer" className="secondary-button compact">LeetCode</a>
                      <button className="primary-button compact" onClick={() => setProblemStatus(p.id, ps === 'done' ? 'not_started' : 'done')}>
                        {ps === 'done' ? 'Undo' : 'Done'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
