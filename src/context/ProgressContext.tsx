import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { Progress, Status } from '../types'
import { useAuth } from './AuthContext'

type ProgressState = {
  progress: Progress
  loading: boolean
  setTaskStatus: (id: string, status: Status) => void
  setProblemStatus: (id: string, status: Status) => void
  setModuleStatus: (id: string, status: Status) => void
  setBankItemStatus: (id: string, status: Status) => void
  setAssessmentStatus: (id: string, status: Status) => void
  refresh: () => Promise<void>
}

const empty: Progress = { tasks: {}, problems: {}, modules: {}, bankItems: {}, assessments: {}, notes: {} }
const ProgressContext = createContext<ProgressState | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<Progress>(empty)
  const [loading, setLoading] = useState(false)
  const timer = useRef<number | null>(null)

  const persist = useCallback((next: Progress) => {
    setProgress(next)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      void api.putProgress(next).catch(() => undefined)
    }, 400)
  }, [])

  const refresh = useCallback(async () => {
    if (!user) {
      setProgress(empty)
      return
    }
    setLoading(true)
    try {
      const data = await api.getProgress()
      setProgress({
        tasks: data.tasks || {},
        problems: data.problems || {},
        modules: data.modules || {},
        bankItems: data.bankItems || {},
        assessments: data.assessments || {},
        notes: data.notes || {},
        weekStart: data.weekStart,
        updatedAt: data.updatedAt,
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setTaskStatus = (id: string, status: Status) => {
    persist({ ...progress, tasks: { ...progress.tasks, [id]: status } })
  }
  const setProblemStatus = (id: string, status: Status) => {
    persist({ ...progress, problems: { ...progress.problems, [id]: status } })
  }
  const setModuleStatus = (id: string, status: Status) => {
    persist({ ...progress, modules: { ...progress.modules, [id]: status } })
  }
  const setBankItemStatus = (id: string, status: Status) => {
    persist({ ...progress, bankItems: { ...progress.bankItems, [id]: status } })
  }
  const setAssessmentStatus = (id: string, status: Status) => {
    persist({ ...progress, assessments: { ...progress.assessments, [id]: status } })
  }

  return (
    <ProgressContext.Provider value={{
      progress, loading, setTaskStatus, setProblemStatus, setModuleStatus,
      setBankItemStatus, setAssessmentStatus, refresh,
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress requires ProgressProvider')
  return ctx
}
