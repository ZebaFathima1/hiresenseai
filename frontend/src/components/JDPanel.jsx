import React from 'react'
import { FileText, Tag, Loader2, ChevronRight, X } from 'lucide-react'
import { createJob } from '../api/hiresense'

export default function JDPanel({ onJobCreated }) {
  const [title, setTitle]       = React.useState('')
  const [desc, setDesc]         = React.useState('')
  const [loading, setLoading]   = React.useState(false)
  const [keywords, setKeywords] = React.useState([])
  const [jobId, setJobId]       = React.useState(null)
  const [error, setError]       = React.useState('')

  const sampleJD = `We are looking for a Senior Python Developer with 4+ years of experience in backend development.

Requirements:
• Proficiency in Python, Django/Flask, and REST API design
• Strong knowledge of SQL (PostgreSQL) and NoSQL (MongoDB) databases
• Experience with Docker, Kubernetes, and CI/CD pipelines (Jenkins, GitHub Actions)
• Familiarity with AWS or GCP cloud services
• Understanding of machine learning concepts and scikit-learn
• Excellent communication and problem-solving skills

Nice to have:
• AWS Certified Developer certification
• Experience with Kafka or RabbitMQ
• Knowledge of React.js for full-stack development

Education: Bachelor's degree in Computer Science or equivalent`

  const handleExtract = async () => {
    if (!desc.trim()) { setError('Please enter a job description.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await createJob({ title: title || 'Untitled Position', description: desc })
      setKeywords(res.data.keywords || [])
      setJobId(res.data.id)
      onJobCreated && onJobCreated(res.data.id)
    } catch (e) {
      setError('Failed to connect to backend. Make sure Flask is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="jd" className="section">
      <div className="container">
        <div className="section-label"><FileText size={14}/> Step 1</div>
        <h2 className="section-title">Job Description <span className="gradient-text">Analyzer</span></h2>
        <p className="section-desc">Paste your job description. Our AI will extract key skills and requirements to match against resumes.</p>

        <div className="divider"/>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          {/* Left – Input */}
          <div className="glass-card" style={{ padding:28 }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, display:'block', marginBottom:8 }}>
                Job Title (optional)
              </label>
              <input
                className="input-field"
                placeholder="e.g. Senior Python Developer"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600 }}>
                  Job Description *
                </label>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize:'0.72rem', padding:'4px 10px' }}
                  onClick={() => setDesc(sampleJD)}
                >
                  Load Sample
                </button>
              </div>
              <textarea
                className="textarea-field"
                rows={14}
                placeholder="Paste your full job description here..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            {error && (
              <div style={{ color:'var(--red)', fontSize:'0.8rem', marginBottom:12, padding:'10px 14px', background:'rgba(239,68,68,0.08)', borderRadius:'var(--radius-sm)', border:'1px solid rgba(239,68,68,0.2)' }}>
                ⚠ {error}
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width:'100%', justifyContent:'center' }}
              onClick={handleExtract}
              disabled={loading}
            >
              {loading ? <><span className="spinner"/> Analyzing...</> : <><ChevronRight size={16}/> Extract Keywords & Save JD</>}
            </button>

            {jobId && (
              <div style={{ marginTop:12, textAlign:'center', fontSize:'0.78rem', color:'var(--green)' }}>
                ✓ Job saved (ID: {jobId}) — proceed to upload resumes
              </div>
            )}
          </div>

          {/* Right – Keywords */}
          <div className="glass-card" style={{ padding:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <Tag size={16} style={{ color:'var(--cyan)' }}/>
              <span style={{ fontWeight:600, fontSize:'0.9rem' }}>Extracted Keywords</span>
              {keywords.length > 0 && (
                <span className="badge badge-cyan" style={{ marginLeft:'auto' }}>{keywords.length} found</span>
              )}
            </div>

            {keywords.length === 0 ? (
              <div style={{
                height:300, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:12,
                color:'var(--text-muted)', fontSize:'0.85rem',
              }}>
                <div style={{
                  width:64, height:64, borderRadius:16,
                  background:'rgba(255,255,255,0.04)',
                  border:'1px dashed var(--border-glass)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Tag size={24} color="var(--text-muted)"/>
                </div>
                Keywords will appear here after analysis
              </div>
            ) : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {keywords.map((kw, i) => (
                  <span key={i} className="chip" style={{ animationDelay:`${i*0.03}s` }}>
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {keywords.length > 0 && (
              <div style={{ marginTop:20, padding:'14px 16px', background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.15)', borderRadius:'var(--radius-md)' }}>
                <div style={{ fontSize:'0.78rem', color:'var(--cyan)', fontWeight:600, marginBottom:4 }}>💡 AI Insight</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.6 }}>
                  {keywords.length} keywords extracted. Top skills will be weighted heavily during candidate matching.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
