import React from 'react'
import { BarChart2, Users, TrendingUp, Award, RefreshCw } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getAnalytics, getCandidates } from '../api/hiresense'

const PIE_COLORS = ['#6C63FF','#10B981']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#0f1729', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', fontSize:'0.8rem' }}>
      <div style={{ color:'var(--text-secondary)', marginBottom:4 }}>{label || payload[0].name}</div>
      <div style={{ color:'var(--violet-light)', fontWeight:700 }}>{payload[0].value} candidate{payload[0].value !== 1 ? 's' : ''}</div>
    </div>
  )
}

export default function AnalyticsSection({ jobId, refreshTrigger }) {
  const [analytics, setAnalytics] = React.useState(null)
  const [top3, setTop3]           = React.useState([])
  const [loading, setLoading]     = React.useState(false)

  const load = React.useCallback(async () => {
    if (!jobId) return
    setLoading(true)
    try {
      const [aRes, cRes] = await Promise.all([getAnalytics(jobId), getCandidates(jobId)])
      setAnalytics(aRes.data)
      setTop3(cRes.data.slice(0, 3))
    } catch (e) { /* silent */ }
    finally { setLoading(false) }
  }, [jobId])

  React.useEffect(() => { load() }, [load, refreshTrigger])

  const pieData = analytics ? [
    { name: 'Shortlisted', value: analytics.shortlisted },
    { name: 'Not Shortlisted', value: analytics.total - analytics.shortlisted },
  ] : []

  const kpis = analytics ? [
    { label:'Total Resumes',     value:analytics.total,        color:'var(--violet-light)', icon:<Users size={20}/> },
    { label:'Avg Match Score',   value:`${analytics.avg_score}%`, color:'var(--cyan)',      icon:<TrendingUp size={20}/> },
    { label:'Shortlisted',       value:analytics.shortlisted,  color:'var(--green)',        icon:<Award size={20}/> },
    { label:'Top Score',         value:`${analytics.top_score}%`, color:'var(--amber)',     icon:<BarChart2 size={20}/> },
  ] : []

  return (
    <section id="analytics" className="section" style={{ background:'linear-gradient(180deg, transparent, rgba(0,212,255,0.03), transparent)' }}>
      <div className="container">
        <div className="section-label"><BarChart2 size={14}/> Analytics</div>
        <h2 className="section-title">Hiring <span className="gradient-text">Insights</span></h2>
        <p className="section-desc">Visualize candidate distribution, match scores, and key hiring metrics at a glance.</p>

        <div className="divider"/>

        {!jobId ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
            💡 Analytics will appear after you analyze resumes.
          </div>
        ) : loading ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <span className="spinner" style={{ width:32,height:32 }}/>
          </div>
        ) : !analytics || analytics.total === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
            No data yet. Upload and analyze resumes first.
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
              {kpis.map(k => (
                <div key={k.label} className="kpi-card fade-up">
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div className="kpi-label">{k.label}</div>
                    <div style={{ color:k.color, opacity:0.7 }}>{k.icon}</div>
                  </div>
                  <div className="kpi-value" style={{ color:k.color }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr', gap:20, marginBottom:24 }}>
              {/* Bar Chart */}
              <div className="glass-card" style={{ padding:24 }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                  <BarChart2 size={16} style={{ color:'var(--violet-light)' }}/> Score Distribution
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.distribution} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="range" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="count" radius={[6,6,0,0]}>
                      {analytics.distribution.map((_, i) => (
                        <Cell key={i} fill={`hsl(${250 + i*15},80%,${55+i*5}%)`}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="glass-card" style={{ padding:24 }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                  <Award size={16} style={{ color:'var(--cyan)' }}/> Shortlist Ratio
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
                    </Pie>
                    <Legend
                      formatter={(v) => <span style={{ color:'var(--text-secondary)', fontSize:'0.78rem' }}>{v}</span>}
                    />
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top 3 Candidates */}
            {top3.length > 0 && (
              <div className="glass-card" style={{ padding:24 }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                  <Award size={16} style={{ color:'var(--amber)' }}/> Top Candidates
                </div>
                <div style={{ display:'flex', gap:16 }}>
                  {top3.map((c, i) => {
                    const medals = ['🥇','🥈','🥉']
                    const colors = ['#FFD700','#C0C0C0','#CD7F32']
                    return (
                      <div key={c.candidate_id} style={{
                        flex:1, padding:'20px',
                        background:'rgba(255,255,255,0.03)',
                        border:`1px solid ${colors[i]}33`,
                        borderRadius:'var(--radius-md)',
                        position:'relative',
                        overflow:'hidden',
                      }}>
                        <div style={{ position:'absolute', top:-8, right:-8, fontSize:'3rem', opacity:0.1 }}>{medals[i]}</div>
                        <div style={{ fontSize:'1.8rem', marginBottom:8 }}>{medals[i]}</div>
                        <div style={{ fontWeight:600, marginBottom:4 }}>{c.name}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:12 }}>{c.email || c.filename}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="score-bar-wrap" style={{ flex:1 }}>
                            <div className="score-bar-fill high" style={{ width:`${c.overall_score}%` }}/>
                          </div>
                          <span style={{ fontSize:'0.9rem', fontWeight:700, color:colors[i] }}>{c.overall_score}%</span>
                        </div>
                        <span className={`badge badge-${c.shortlisted?'green':'red'}`} style={{ marginTop:8, fontSize:'0.65rem' }}>
                          {c.shortlisted ? '✓ Shortlisted' : 'Not Shortlisted'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {jobId && (
          <div style={{ marginTop:16, textAlign:'right' }}>
            <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
              <RefreshCw size={13}/> Refresh Analytics
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
