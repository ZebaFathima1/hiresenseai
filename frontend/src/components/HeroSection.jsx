import React from 'react'
import { Sparkles, ArrowRight, Users, Zap, BarChart3, ShieldCheck } from 'lucide-react'

const pills = [
  { icon: <Zap size={14}/>, label: 'TF-IDF Engine' },
  { icon: <Users size={14}/>, label: 'Multi-Resume Upload' },
  { icon: <BarChart3 size={14}/>, label: 'Smart Rankings' },
  { icon: <ShieldCheck size={14}/>, label: 'AI Recommendations' },
]

const stats = [
  { value: '95%', label: 'Accuracy Rate' },
  { value: '10x', label: 'Faster Screening' },
  { value: '100+', label: 'Skill Categories' },
]

export default function HeroSection() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--grad-hero)',
    }}>
      {/* Animated grid overlay */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`
          linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize:'50px 50px',
        pointerEvents:'none',
      }}/>

      {/* Glowing circle */}
      <div style={{
        position:'absolute',
        width:700, height:700,
        borderRadius:'50%',
        background:'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
        top:'50%', left:'50%',
        transform:'translate(-50%,-55%)',
        pointerEvents:'none',
      }}/>

      <div className="container" style={{ position:'relative', zIndex:1, paddingTop:100, paddingBottom:80 }}>
        <div style={{ maxWidth:760, margin:'0 auto', textAlign:'center' }}>

          {/* Badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(108,99,255,0.12)',
            border:'1px solid rgba(108,99,255,0.25)',
            borderRadius:'var(--radius-full)',
            padding:'6px 16px', marginBottom:32,
            fontSize:'0.8rem', color:'var(--violet-light)', fontWeight:600,
            animation:'fade-up 0.5s ease forwards',
          }}>
            <Sparkles size={14} /> AI-Powered Recruitment Platform
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily:'var(--font-display)',
            fontSize:'clamp(2.8rem, 6vw, 4.5rem)',
            fontWeight:800,
            lineHeight:1.08,
            letterSpacing:'-0.02em',
            marginBottom:24,
            animation:'fade-up 0.5s 0.1s ease both',
          }}>
            Smart Hiring
            <br/>
            <span className="gradient-text">Starts Here</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize:'clamp(1rem,2vw,1.2rem)',
            color:'var(--text-secondary)',
            lineHeight:1.7,
            marginBottom:40,
            maxWidth:580, margin:'0 auto 40px',
            animation:'fade-up 0.5s 0.2s ease both',
          }}>
            Automatically rank, evaluate, and shortlist candidates using
            NLP & machine learning. Reduce screening time by{' '}
            <strong style={{color:'var(--cyan)'}}>10× faster</strong> with intelligent AI matching.
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:48, animation:'fade-up 0.5s 0.3s ease both' }}>
            <a href="#jd" className="btn btn-primary btn-lg">
              Start Screening <ArrowRight size={18}/>
            </a>
            <a href="#rankings" className="btn btn-secondary btn-lg">
              View Rankings
            </a>
          </div>

          {/* Feature pills */}
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:56, animation:'fade-up 0.5s 0.4s ease both' }}>
            {pills.map(p => (
              <span key={p.label} style={{
                display:'inline-flex', alignItems:'center', gap:6,
                padding:'6px 14px',
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:'var(--radius-full)',
                fontSize:'0.78rem', color:'var(--text-secondary)',
              }}>
                <span style={{color:'var(--cyan)'}}>{p.icon}</span> {p.label}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(3,1fr)',
            gap:1,
            background:'rgba(255,255,255,0.06)',
            borderRadius:'var(--radius-lg)',
            border:'1px solid var(--border-glass)',
            overflow:'hidden',
            animation:'fade-up 0.5s 0.5s ease both',
          }}>
            {stats.map((s,i) => (
              <div key={i} style={{
                padding:'24px 16px',
                background:'var(--bg-card)',
                textAlign:'center',
                borderRight: i < stats.length-1 ? '1px solid var(--border-glass)' : 'none',
              }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800 }} className="gradient-text">
                  {s.value}
                </div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
