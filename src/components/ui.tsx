import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle, ExternalLink } from 'lucide-react'
import type { PlanTask, Status } from '../types'

const skillColor: Record<string, string> = {
  DSA: 'violet',
  Go: 'sky',
  Fundamentals: 'amber',
  Networking: 'rose',
  'System design': 'emerald',
  Communication: 'blue',
  'Mock interview': 'slate',
}

export const SKILL_BANK_KEY: Record<string, string> = {
  DSA: 'dsa',
  Go: 'go',
  Fundamentals: 'fundamentals',
  Networking: 'networking',
  'System design': 'system-design',
  Communication: 'communication',
}

export function leetcodeUrl(slug: string) {
  return `https://leetcode.com/problems/${slug}/`
}

export function youtubeSearchUrl(q: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
}

export function bankPathForSkill(skill: string, itemId?: string) {
  const key = SKILL_BANK_KEY[skill] || 'dsa'
  return itemId ? `/banks/${key}?item=${encodeURIComponent(itemId)}` : `/banks/${key}`
}

type ProblemMeta = { title: string; leetcodeSlug: string; difficulty?: string }

/** Primary + secondary links so the user can open the material and start work. */
export function TaskStartLinks({
  task,
  problems,
}: {
  task: PlanTask
  problems?: Record<string, ProblemMeta>
}) {
  const links: Array<{ key: string; label: string; to?: string; href?: string; primary?: boolean }> = []
  const bankKey = SKILL_BANK_KEY[task.skill]
  const firstBank = task.bankItemIds?.[0]
  const firstProblem = task.problemIds?.[0]

  if (task.assessmentId) {
    links.push({ key: 'assess', label: 'Start assessment', to: `/tests/${task.assessmentId}`, primary: true })
  } else if (task.kind === 'test' || task.kind === 'mock' || task.kind === 'assessment') {
    links.push({ key: 'tests', label: 'Open tests', to: '/tests', primary: true })
  }

  if (firstProblem) {
    const meta = problems?.[firstProblem]
    if (meta?.leetcodeSlug) {
      links.push({
        key: `lc-${firstProblem}`,
        label: `LeetCode: ${meta.title}`,
        href: leetcodeUrl(meta.leetcodeSlug),
        primary: !links.some(l => l.primary),
      })
    }
    links.push({
      key: `dsa-${firstProblem}`,
      label: 'Open in DSA bank',
      to: bankPathForSkill('DSA', firstProblem),
      primary: !links.some(l => l.primary),
    })
  }

  if (firstBank && bankKey) {
    links.push({
      key: `bank-${firstBank}`,
      label: `Open ${task.skill} topic`,
      to: bankPathForSkill(task.skill, firstBank),
      primary: !links.some(l => l.primary),
    })
  } else if (bankKey && !firstProblem) {
    links.push({
      key: `bank-${bankKey}`,
      label: `Browse ${task.skill} bank`,
      to: bankPathForSkill(task.skill),
      primary: !links.some(l => l.primary),
    })
  }

  // Extra problem chips (beyond first)
  for (const id of (task.problemIds || []).slice(1, 4)) {
    const meta = problems?.[id]
    if (meta?.leetcodeSlug) {
      links.push({ key: `lc2-${id}`, label: meta.title, href: leetcodeUrl(meta.leetcodeSlug) })
    } else {
      links.push({ key: `p-${id}`, label: id, to: bankPathForSkill('DSA', id) })
    }
  }

  for (const id of (task.bankItemIds || []).slice(1, 3)) {
    links.push({
      key: `b2-${id}`,
      label: id,
      to: bankPathForSkill(task.skill, id),
    })
  }

  if (!links.length) {
    links.push({ key: 'week', label: 'View in week plan', to: '/week' })
  }

  return (
    <div className="task-start-links">
      {links.map(link => {
        const className = link.primary ? 'primary-button compact' : 'secondary-button compact'
        if (link.href) {
          return (
            <a key={link.key} className={className} href={link.href} target="_blank" rel="noreferrer">
              {link.label} <ExternalLink size={12} />
            </a>
          )
        }
        return (
          <Link key={link.key} className={className} to={link.to || '/today'}>
            {link.label} <ArrowRight size={12} />
          </Link>
        )
      })}
    </div>
  )
}

export function TaskRow({
  task,
  onToggle,
  onOpen,
  problems,
  showStartLinks = false,
}: {
  task: PlanTask
  onToggle: (status: Status) => void
  onOpen?: () => void
  problems?: Record<string, ProblemMeta>
  showStartLinks?: boolean
}) {
  const done = task.status === 'done'
  return (
    <div className={`task-row ${done ? 'completed' : ''}`}>
      <button
        className="check-button"
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        onClick={() => onToggle(done ? 'not_started' : 'done')}
      >
        {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>
      <div className="task-copy">
        <div>
          <span className={`skill-tag ${skillColor[task.skill] || 'slate'}`}>{task.skill}</span>
          <span className="task-time">{task.minutes}m · {task.kind}</span>
        </div>
        <b>{task.title}</b>
        <p>{task.detail}</p>
        {onOpen && (
          <button className="start-button" onClick={onOpen}>Open details</button>
        )}
        {showStartLinks && <TaskStartLinks task={task} problems={problems} />}
      </div>
    </div>
  )
}

export function Metric({ icon, label, value, sub, tone }: { icon: ReactNode; label: string; value: string; sub: string; tone: string }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <b>{value}</b>
        <small>{sub}</small>
      </div>
    </div>
  )
}
