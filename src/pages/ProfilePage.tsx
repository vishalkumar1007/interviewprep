import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export function ProfilePage() {
  const { user, profile, setAccount } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    yearsExperience: String(profile?.years_experience ?? 1),
    primaryLanguage: profile?.primary_language || 'Go',
    targetRole: profile?.target_role || 'Google SWE',
    targetLevel: profile?.target_level || 'L4',
    startDate: profile?.start_date || '',
    weekdayMinutes: String(profile?.weekly_weekday_minutes ?? 120),
    weekendMinutes: String(profile?.weekly_weekend_minutes ?? 240),
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const account = await api.updateProfile({
        name: form.name,
        yearsExperience: Number(form.yearsExperience),
        primaryLanguage: form.primaryLanguage,
        targetRole: form.targetRole,
        targetLevel: form.targetLevel,
        startDate: form.startDate,
        weekdayMinutes: Number(form.weekdayMinutes),
        weekendMinutes: Number(form.weekendMinutes),
      })
      setAccount(account)
      setMessage('Profile saved. Your journey dates use start date for week math.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    }
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">ACCOUNT</p>
          <h1>Profile</h1>
          <p>Signed in as {user?.email}. Changing start date shifts your entire 24-week calendar.</p>
        </div>
      </section>
      <form className="panel profile-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Start date
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
            <small className="field-hint">Plan weeks run Sunday–Saturday. Tests/mocks are Saturday only; study is Sun–Fri.</small>
          </label>
          <label>Years experience<input type="number" min="0" step="0.5" value={form.yearsExperience} onChange={e => setForm({ ...form, yearsExperience: e.target.value })} /></label>
          <label>Primary language
            <select value={form.primaryLanguage} onChange={e => setForm({ ...form, primaryLanguage: e.target.value })}>
              {['Go', 'Python', 'Java', 'C++', 'TypeScript'].map(l => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label>Target level
            <select value={form.targetLevel} onChange={e => setForm({ ...form, targetLevel: e.target.value })}>
              {['L3', 'L4', 'L5'].map(l => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label>Target role<input value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })} /></label>
          <label>Weekday minutes<input type="number" value={form.weekdayMinutes} onChange={e => setForm({ ...form, weekdayMinutes: e.target.value })} /></label>
          <label>Weekend minutes<input type="number" value={form.weekendMinutes} onChange={e => setForm({ ...form, weekendMinutes: e.target.value })} /></label>
        </div>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <div className="form-actions">
          <button className="primary-button" type="submit">Save profile</button>
        </div>
      </form>
    </>
  )
}
