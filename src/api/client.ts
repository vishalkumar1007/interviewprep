import type { Account, CurriculumSkill, DsaPattern, DsaProblem, Plan, PlanTask, Progress, ScheduleIndex } from '../types'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Request failed')
  return data as T
}

export const api = {
  health: () => request<{ ok: boolean }>('/api/health'),
  me: () => request<Account>('/api/auth/me'),
  signup: (body: Record<string, unknown>) =>
    request<Account>('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<Account>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  updateProfile: (body: Record<string, unknown>) =>
    request<Account>('/api/profile', { method: 'PUT', body: JSON.stringify(body) }),
  getProgress: () => request<Progress>('/api/progress'),
  putProgress: (body: Progress) =>
    request<Progress>('/api/progress', { method: 'PUT', body: JSON.stringify(body) }),
  getPlan: (week?: number) =>
    request<Plan>(week ? `/api/plan?week=${week}` : '/api/plan'),
  getMonth: (year: number, month: number) =>
    request<{ year: number; month: number; days: Array<{ date: string; tasks: PlanTask[]; week: number | null }> }>(
      `/api/plan/month?year=${year}&month=${month}`,
    ),
  getSchedule: () => request<ScheduleIndex>('/api/plan/schedule'),
  getCurriculum: () => request<{ skills: CurriculumSkill[] }>('/api/curriculum'),
  getDsa: () =>
    request<{ patterns: DsaPattern[]; problems: DsaProblem[] }>('/api/dsa'),
  getBanks: () => request<{ skills: Array<{ key: string; skill: string; count: number }> }>('/api/banks'),
  getBank: (skill: string) =>
    request<{ skill: string; key: string; items: any[]; patterns?: DsaPattern[] }>(`/api/banks/${skill}`),
  getSyllabus: () => request<any>('/api/syllabus'),
  getAssessments: () => request<{ platforms: any[]; items: any[] }>('/api/assessments'),
  getGoogleGuide: () => request<{ process: Record<string, unknown>; googleyness: Record<string, unknown> }>('/api/google-guide'),
}
