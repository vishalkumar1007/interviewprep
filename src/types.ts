export type Status = 'not_started' | 'in_progress' | 'done' | 'skipped'

export type Profile = {
  years_experience: number
  primary_language: string
  target_role: string
  target_level: string
  start_date: string
  weekly_weekday_minutes: number
  weekly_weekend_minutes: number
}

export type User = { id: number; name: string; email: string }

export type Account = { user: User; profile: Profile; token?: string }


export type Progress = {
  tasks: Record<string, Status>
  problems: Record<string, Status>
  modules: Record<string, Status>
  bankItems: Record<string, Status>
  assessments: Record<string, Status>
  notes: Record<string, string>
  weekStart?: string
  updatedAt?: string
}

export type PlanTask = {
  id: string
  week: number
  dayOffset: number
  date: string
  title: string
  detail: string
  skill: string
  minutes: number
  kind: string
  problemIds: string[]
  bankItemIds?: string[]
  assessmentId?: string | null
  status: Status
}

export type Plan = {
  startDate: string
  endDate?: string
  today: string
  weekIndex: number
  totalWeeks: number
  phase: string
  theme: string
  focus: string
  weekStart: string
  weekdayMinutes?: number
  weekendMinutes?: number
  todayTasks: PlanTask[]
  todayAssessments?: PlanTask[]
  weekTasks: PlanTask[]
  backlog: PlanTask[]
  ahead?: PlanTask[]
  aheadDone?: PlanTask[]
  upcoming: PlanTask[]
  allowAhead?: boolean
  aiRule?: string
  roadmap: Array<{ week: number; phase: string; theme: string; focus: string }>
}

export type ScheduleEntry = {
  week: number
  date: string
  dayOffset: number
  taskId: string
  title: string
  skill: string
}

export type ScheduleIndex = {
  startDate: string
  totalWeeks: number
  byProblem: Record<string, ScheduleEntry[]>
  byBankItem: Record<string, ScheduleEntry[]>
}

export type DsaProblem = {
  id: string
  title: string
  leetcodeSlug: string
  difficulty: string
  pattern: string
  weekHint: number
  whyGoogle: string
  followUpIdea: string
  youtubeSearch: string
}

export type DsaPattern = {
  id: string
  name: string
  googleWeight: number
  whenToUse: string
  whyGoogle: string
}

export type CurriculumModule = {
  slug: string
  title: string
  overview: string
  whyGoogle: string
  learnItems: string[]
  checklist: string[]
  youtubeSearch: string
  linkedProblemIds?: string[]
}

export type CurriculumSkill = {
  skill: string
  description: string
  target: string
  color: string
  modules: CurriculumModule[]
}
