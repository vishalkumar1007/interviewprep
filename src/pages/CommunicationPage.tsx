import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { api } from '../api/client'
import { youtubeSearchUrl } from '../components/ui'

export function CommunicationPage() {
  const [guide, setGuide] = useState<any>(null)

  useEffect(() => {
    void api.getGoogleGuide().then(setGuide)
  }, [])

  if (!guide) return <p className="empty-state">Loading communication track…</p>
  const gy = guide.googleyness

  return (
    <div className="shell-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">ENGLISH + GOOGLENESS</p>
          <h1>Communication</h1>
          <p>Interview English, think-aloud fluency, and STAR-L stories for Googleyness & Leadership.</p>
        </div>
        <Link className="primary-button" to="/banks/communication">Open communication bank</Link>
      </section>

      <section className="panel">
        <p className="eyebrow">GOOGLE RESOURCES</p>
        <h2 className="inline-title">Official hiring pages</h2>
        <div className="resource-row">
          <a className="secondary-button" href="https://careers.google.com/how-we-hire/" target="_blank" rel="noreferrer">
            How we hire <ExternalLink size={12} />
          </a>
          <a className="secondary-button" href="https://careers.google.com/how-we-hire/interview/" target="_blank" rel="noreferrer">
            Interview process <ExternalLink size={12} />
          </a>
          <a className="secondary-button" href="https://careers.google.com/how-we-hire/prepare/" target="_blank" rel="noreferrer">
            Prepare <ExternalLink size={12} />
          </a>
          <a className="secondary-button" href={youtubeSearchUrl('Google coding interview think aloud')} target="_blank" rel="noreferrer">
            YouTube: think-aloud <ExternalLink size={12} />
          </a>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 17 }}>
        <p className="eyebrow">DELIVERY</p>
        <h2 className="inline-title">How to speak in a Google interview</h2>
        <ul className="bullets">
          {(gy.deliveryTips || []).map((t: string) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="split-grid" style={{ marginTop: 17 }}>
        <div className="panel">
          <p className="eyebrow">STAR-L STORY BANK</p>
          <h2 className="inline-title">Prepare 6–8 stories</h2>
          <div className="story-list">
            {(gy.storyPrompts || []).map((s: any) => (
              <article key={s.id} className="story-card">
                <b>{s.title}</b>
                <p>{s.prompt}</p>
                <small>Maps to: {(s.mapsTo || []).join(', ')}</small>
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <p className="eyebrow">ENGLISH PRACTICE</p>
          <h2 className="inline-title">Learn & watch</h2>
          <div className="story-list">
            {(gy.englishPractice || []).map((item: any) => (
              <article key={item.id} className="story-card">
                <b>{item.title}</b>
                <p>{item.instruction}</p>
                <p className="practice-prompt"><em>Practice:</em> {item.practicePrompt}</p>
                <a className="problem-link compact-link" href={youtubeSearchUrl(item.youtubeSearch)} target="_blank" rel="noreferrer">
                  Search YouTube: {item.youtubeSearch} <ExternalLink size={12} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 17 }}>
        <p className="eyebrow">RUBRICS</p>
        <div className="motivation-grid">
          <div>
            <h3>Googleyness</h3>
            <ul className="bullets">
              {(gy.rubrics || []).map((r: any) => <li key={r.id}><b>{r.title}</b> — {r.description}</li>)}
            </ul>
          </div>
          <div>
            <h3>Leadership</h3>
            <ul className="bullets">
              {(gy.leadershipRubrics || []).map((r: any) => <li key={r.id}><b>{r.title}</b> — {r.description}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
