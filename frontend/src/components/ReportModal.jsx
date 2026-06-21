import React from 'react'
import { X, User, Mail, FileText, Star, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { getReport } from '../api/hiresense'

function RadialScore({ value, label, color }) {
  const r = 36, c = 2*Math.PI*r
  const dash = (value/100)*c
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7}/>
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          style={{ transition:'stroke-dasharray 1s ease' }}
        />
        <text x={45} y={50} textAnchor="middle" fill="white" fontSize={15} fontWeight={700} fontFamily="Space Grotesk">
          {value}%
        </text>
      </svg>
      <span style={{ fontSize:'0.72rem', color:'var(--text-secondary)', textAlign:'center' }}>{label}</span>
    </div>
  )
}

export default function ReportModal({ candidateId, onClose }) {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getReport(candidateId)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [candidateId])

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{
          padding:'24px 28px', borderBottom:'1px solid var(--border-glass)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'linear-gradient(135deg,rgba(108,99,255,0.08),rgba(0,212,255,0.04))',
          borderRadius:'var(--radius-xl) var(--radius-xl) 0 0',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:44, height:44, borderRadius:12,
              background:'linear-gradient(135deg,var(--violet),var(--cyan))',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <User size={20} color="#fff"/>
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.05rem' }}>
                {loading ? 'Loading...' : data?.name}
              </div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Candidate Report</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid var(--border-glass)', color:'var(--text-secondary)', cursor:'pointer', padding:8, borderRadius:'var(--radius-sm)' }}>
            <X size={16}/>
          </button>
        </div>

        {loading ? (
          <div style={{ padding:60, textAlign:'center', color:'var(--text-muted)' }}>
            <span className="spinner" style={{ width:32,height:32 }}/><br/><br/>Loading report...
          </div>
        ) : !data ? (
          <div style={{ padding:60, textAlign:'center', color:'var(--red)' }}>Failed to load report.</div>
        ) : (
          <div style={{ padding:'28px' }}>
            {/* Info row */}
            <div style={{ display:'flex', gap:24, marginBottom:24, flexWrap:'wrap' }}>
              {data.email && (
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.82rem', color:'var(--text-secondary)' }}>
                  <Mail size={14}/> {data.email}
                </div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.82rem', color:'var(--text-secondary)' }}>
                <FileText size={14}/> {data.filename}
              </div>
              <span className={`badge badge-${data.shortlisted ? 'green':'red'}`} style={{ marginLeft:'auto' }}>
                {data.shortlisted ? '✓ Shortlisted' : '✗ Not Shortlisted'}
              </span>
            </div>

            {/* Radial scores */}
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(5,1fr)',
              gap:12, padding:'20px', marginBottom:24,
              background:'rgba(255,255,255,0.02)',
              border:'1px solid var(--border-glass)',
              borderRadius:'var(--radius-lg)',
            }}>
              <RadialScore value={data.overall_score}    label="Overall"    color="url(#grad)"/>
              <RadialScore value={data.skills_score}     label="Skills"     color="var(--violet-light)"/>
              <RadialScore value={data.experience_score} label="Experience" color="var(--cyan)"/>
              <RadialScore value={data.education_score}  label="Education"  color="var(--green)"/>
              <RadialScore value={data.cert_score}       label="Certs"      color="var(--amber)"/>
              <svg width={0} height={0}>
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%">
                    <stop offset="0%" stopColor="var(--violet)"/>
                    <stop offset="100%" stopColor="var(--cyan)"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Matched Skills */}
            {data.matched_skills?.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, fontWeight:600, fontSize:'0.85rem', color:'var(--green)' }}>
                  <CheckCircle size={14}/> Matched Skills ({data.matched_skills.length})
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {data.matched_skills.map(s => <span key={s} className="chip matched">{s}</span>)}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {data.missing_skills?.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, fontWeight:600, fontSize:'0.85rem', color:'var(--red)' }}>
                  <XCircle size={14}/> Missing Skills ({data.missing_skills.length})
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {data.missing_skills.map(s => <span key={s} className="chip missing">{s}</span>)}
                </div>
              </div>
            )}

            {/* AI Recommendation */}
            {data.recommendation && (
              <div style={{
                padding:'16px 20px',
                background:'linear-gradient(135deg,rgba(108,99,255,0.08),rgba(0,212,255,0.04))',
                border:'1px solid rgba(108,99,255,0.2)',
                borderRadius:'var(--radius-md)',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, fontWeight:600, fontSize:'0.82rem', color:'var(--violet-light)' }}>
                  <TrendingUp size={14}/> AI Recommendation
                </div>
                <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
                  {data.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
