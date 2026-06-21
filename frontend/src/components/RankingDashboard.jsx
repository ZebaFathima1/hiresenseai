import React from 'react'
import { Trophy, Search, Download, RefreshCw, ChevronUp, ChevronDown, Eye } from 'lucide-react'
import { getCandidates, resetJob } from '../api/hiresense'
import ReportModal from './ReportModal'

function ScoreBar({ value, size = 'md' }) {
  const cls = value >= 70 ? 'high' : value >= 50 ? 'medium' : 'low'
  const h = size === 'sm' ? 5 : 8
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div className="score-bar-wrap" style={{ height:h }}>
        <div className="score-bar-fill" style={{ width:`${value}%` }} data-cls={cls}
          onLoad={e => e.target.className = `score-bar-fill ${cls}`}
          ref={el => { if (el) { el.className = `score-bar-fill ${cls}` } }}
        />
      </div>
      <span style={{ fontSize:'0.8rem', fontWeight:600, width:36, textAlign:'right', color: value>=70?'var(--green)':value>=50?'var(--amber)':'var(--red)' }}>
        {value}%
      </span>
    </div>
  )
}

function RankBadge({ rank }) {
  const colors = { 1:'#FFD700', 2:'#C0C0C0', 3:'#CD7F32' }
  return (
    <div style={{
      width:32, height:32, borderRadius:'50%',
      background: colors[rank] ? `rgba(${rank===1?'255,215,0':rank===2?'192,192,192':'205,127,50'},0.15)` : 'rgba(255,255,255,0.06)',
      border:`2px solid ${colors[rank] || 'rgba(255,255,255,0.1)'}`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:'0.75rem', fontWeight:700, color: colors[rank] || 'var(--text-muted)',
      flexShrink:0,
    }}>
      {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
    </div>
  )
}

export default function RankingDashboard({ jobId, refreshTrigger }) {
  const [candidates, setCandidates] = React.useState([])
  const [loading, setLoading]       = React.useState(false)
  const [search, setSearch]         = React.useState('')
  const [filterShort, setFilterShort] = React.useState(false)
  const [sortField, setSortField]   = React.useState('overall_score')
  const [sortDir, setSortDir]       = React.useState('desc')
  const [selected, setSelected]     = React.useState(null)

  const load = React.useCallback(async () => {
    if (!jobId) return
    setLoading(true)
    try {
      const res = await getCandidates(jobId)
      setCandidates(res.data)
    } catch (e) { /* silent */ }
    finally { setLoading(false) }
  }, [jobId])

  React.useEffect(() => { load() }, [load, refreshTrigger])

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>
  }

  const filtered = candidates
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
    .filter(c => filterShort ? c.shortlisted : true)
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1
      return (a[sortField] - b[sortField]) * mult
    })

  const exportCSV = () => {
    const header = 'Rank,Name,Email,Overall,Skills,Experience,Education,Certs,Shortlisted'
    const rows = filtered.map(c =>
      `${c.rank},${c.name},${c.email},${c.overall_score},${c.skills_score},${c.experience_score},${c.education_score},${c.cert_score},${c.shortlisted}`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='hiresense_rankings.csv'; a.click()
  }

  return (
    <section id="rankings" className="section">
      <div className="container">
        <div className="section-label"><Trophy size={14}/> Step 3</div>
        <h2 className="section-title">Candidate <span className="gradient-text">Rankings</span></h2>
        <p className="section-desc">AI-ranked leaderboard sorted by match score. Click any candidate to view their detailed report.</p>

        <div className="divider"/>

        {/* Controls */}
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:20, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
            <input
              className="input-field"
              style={{ paddingLeft:36 }}
              placeholder="Search candidates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            className={`btn ${filterShort ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilterShort(p => !p)}
          >
            {filterShort ? '✓ Shortlisted Only' : 'All Candidates'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={14}/> Refresh
          </button>
          {filtered.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
              <Download size={14}/> Export CSV
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
            <span className="spinner" style={{ width:32, height:32 }}/><br/><br/>Loading candidates...
          </div>
        ) : !jobId ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)', fontSize:'0.9rem' }}>
            💡 Save a job description and upload resumes to see rankings here.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)', fontSize:'0.9rem' }}>
            No candidates found. Upload resumes in Step 2.
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="hs-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Candidate</th>
                  {[
                    ['overall_score','Overall'],
                    ['skills_score','Skills'],
                    ['experience_score','Experience'],
                    ['education_score','Education'],
                    ['cert_score','Certs'],
                  ].map(([f, label]) => (
                    <th key={f} style={{ cursor:'pointer', userSelect:'none' }} onClick={() => handleSort(f)}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                        {label} <SortIcon field={f}/>
                      </span>
                    </th>
                  ))}
                  <th>Status</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.candidate_id} style={{ animationDelay:`${i * 0.05}s` }}>
                    <td><RankBadge rank={c.rank}/></td>
                    <td>
                      <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{c.name}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{c.email || c.filename}</div>
                    </td>
                    <td><ScoreBar value={c.overall_score}/></td>
                    <td><ScoreBar value={c.skills_score} size="sm"/></td>
                    <td><ScoreBar value={c.experience_score} size="sm"/></td>
                    <td><ScoreBar value={c.education_score} size="sm"/></td>
                    <td><ScoreBar value={c.cert_score} size="sm"/></td>
                    <td>
                      <span className={`badge badge-${c.shortlisted ? 'green' : 'red'}`}>
                        {c.shortlisted ? '✓ Shortlisted' : '✗ Rejected'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelected(c.candidate_id)}
                        style={{ gap:4 }}
                      >
                        <Eye size={13}/> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <ReportModal candidateId={selected} onClose={() => setSelected(null)}/>
        )}
      </div>
    </section>
  )
}
