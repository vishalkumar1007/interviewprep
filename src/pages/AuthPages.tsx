import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { user, setAccount } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/today" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const account = await api.login({ email, password })
      setAccount(account)
      navigate('/today')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gate-page">
      <form className="gate-card" onSubmit={onSubmit}>
        <div className="gate-logo"><span className="brand-mark">P</span>Prepbase</div>
        <div className="gate-heading">
          <div className="gate-icon"><Lock size={18} /></div>
          <h1>Welcome back</h1>
          <p>Sign in to continue your Google SWE interview journey from your start date.</p>
        </div>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="gate-footnote">New here? <Link to="/signup">Create an account</Link></p>
      </form>
    </div>
  )
}

export function SignupPage() {
  const { user, setAccount } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    yearsExperience: '1',
    primaryLanguage: 'Go',
    targetLevel: 'L4',
    targetRole: 'Google SWE',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/today" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const account = await api.signup({
        ...form,
        yearsExperience: Number(form.yearsExperience),
      })
      setAccount(account)
      navigate('/today')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gate-page">
      <form className="gate-card gate-wide" onSubmit={onSubmit}>
        <div className="gate-logo"><span className="brand-mark">P</span>Prepbase</div>
        <div className="gate-heading">
          <div className="gate-icon"><Lock size={18} /></div>
          <h1>Start your journey</h1>
          <p>Your 24-week Google-aligned plan begins the day you create this account.</p>
        </div>
        <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
        <label>Password (min 8)<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} /></label>
        <div className="form-grid">
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
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button wide" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="gate-footnote">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  )
}
