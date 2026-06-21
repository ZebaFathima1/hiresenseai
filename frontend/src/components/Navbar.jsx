import React from 'react'
import { Brain } from 'lucide-react'

const sections = [
  { label: 'Features', href: '#jd' },
  { label: 'Upload',   href: '#upload' },
  { label: 'Rankings', href: '#rankings' },
  { label: 'Analytics',href: '#analytics' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
      padding: '14px 0',
      background: scrolled ? 'rgba(6,11,24,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#6C63FF,#00D4FF)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 20px rgba(108,99,255,0.4)',
          }}>
            <Brain size={18} color="#fff" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.15rem' }}>
            Hire<span className="gradient-text">Sense</span> <span style={{color:'var(--text-secondary)', fontWeight:400}}>AI</span>
          </span>
        </div>

        {/* Links */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {sections.map(s => (
            <a key={s.label} href={s.href} style={{
              padding:'8px 16px', borderRadius:'var(--radius-full)',
              color:'var(--text-secondary)', fontSize:'0.875rem', fontWeight:500,
              textDecoration:'none', transition:'var(--transition)',
            }}
            onMouseEnter={e => { e.target.style.color='var(--text-primary)'; e.target.style.background='rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { e.target.style.color='var(--text-secondary)'; e.target.style.background='transparent' }}
            >{s.label}</a>
          ))}
          <a href="#jd" className="btn btn-primary btn-sm" style={{ marginLeft:8 }}>
            Get Started
          </a>
        </div>
      </div>
    </nav>
  )
}
