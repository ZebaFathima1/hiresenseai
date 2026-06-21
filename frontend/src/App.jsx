import React from 'react'
import Navbar           from './components/Navbar'
import HeroSection      from './components/HeroSection'
import JDPanel          from './components/JDPanel'
import UploadSection    from './components/UploadSection'
import RankingDashboard from './components/RankingDashboard'
import AnalyticsSection from './components/AnalyticsSection'
import { Brain, Code2, MessageCircle, Briefcase } from 'lucide-react'

function Footer() {
  return (
    <footer style={{
      padding:'40px 0 24px',
      borderTop:'1px solid var(--border-glass)',
      background:'rgba(0,0,0,0.3)',
    }}>
      <div className="container">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:8,
              background:'linear-gradient(135deg,#6C63FF,#00D4FF)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Brain size={16} color="#fff"/>
            </div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>
              Hire<span style={{ background:'linear-gradient(135deg,#6C63FF,#00D4FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Sense</span> AI
            </span>
          </div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
            AI-Powered Resume Ranking & Candidate Screening Platform
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {[Code2, MessageCircle, Briefcase].map((Icon, i) => (
              <button key={i} style={{
                width:34, height:34, borderRadius:8,
                background:'rgba(255,255,255,0.04)',
                border:'1px solid var(--border-glass)',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', color:'var(--text-muted)',
                transition:'var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.color='var(--violet-light)'; e.currentTarget.style.borderColor='rgba(108,99,255,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border-glass)' }}
              >
                <Icon size={15}/>
              </button>
            ))}
          </div>
        </div>
        <div style={{ textAlign:'center', fontSize:'0.75rem', color:'var(--text-muted)', paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.04)' }}>
          © 2025 HireSense AI · Built with Python, Flask, NLP & React · All rights reserved
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const [jobId, setJobId]             = React.useState(null)
  const [refreshTrigger, setRefresh]  = React.useState(0)

  const handleJobCreated = (id) => {
    setJobId(id)
    setRefresh(p => p + 1)
  }

  const handleUploadComplete = () => {
    setRefresh(p => p + 1)
  }

  return (
    <>
      {/* Animated background orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1"/>
        <div className="orb orb-2"/>
        <div className="orb orb-3"/>
      </div>

      <div style={{ position:'relative', zIndex:1 }}>
        <Navbar/>
        <HeroSection/>
        <JDPanel        onJobCreated={handleJobCreated}/>
        <UploadSection  jobId={jobId} onUploadComplete={handleUploadComplete}/>
        <RankingDashboard jobId={jobId} refreshTrigger={refreshTrigger}/>
        <AnalyticsSection jobId={jobId} refreshTrigger={refreshTrigger}/>
        <Footer/>
      </div>
    </>
  )
}
