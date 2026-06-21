import React from 'react'
import { Upload, X, FileText, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { uploadResumes } from '../api/hiresense'

function FileItem({ file, status }) {
  const icon = status === 'done'
    ? <CheckCircle size={16} style={{ color:'var(--green)' }}/>
    : status === 'error'
    ? <AlertCircle size={16} style={{ color:'var(--red)' }}/>
    : <span className="spinner"/>

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'12px 16px',
      background:'rgba(255,255,255,0.03)',
      border:'1px solid var(--border-glass)',
      borderRadius:'var(--radius-md)',
    }}>
      <FileText size={18} style={{ color:'var(--violet-light)', flexShrink:0 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'0.85rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {file.name}
        </div>
        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>
          {(file.size / 1024).toFixed(1)} KB
        </div>
      </div>
      {icon}
    </div>
  )
}

export default function UploadSection({ jobId, onUploadComplete }) {
  const [files, setFiles]     = React.useState([])
  const [statuses, setStatus] = React.useState({}) // filename → 'pending'|'done'|'error'
  const [uploading, setUploading] = React.useState(false)
  const [dragging, setDragging]   = React.useState(false)
  const [results, setResults]     = React.useState(null)
  const [error, setError]         = React.useState('')
  const inputRef = React.useRef()

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f =>
      f.name.match(/\.(pdf|docx|doc)$/i)
    )
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...valid.filter(f => !names.has(f.name))]
    })
  }

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name))

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleUpload = async () => {
    if (!jobId) { setError('Please save a Job Description first (Step 1).'); return }
    if (files.length === 0) { setError('Please add at least one resume.'); return }
    setError('')
    setUploading(true)
    const init = {}
    files.forEach(f => { init[f.name] = 'pending' })
    setStatus(init)

    try {
      const res = await uploadResumes(jobId, files)
      const updated = { ...init }
      res.data.results.forEach(r => { updated[r.filename] = 'done' })
      setStatus(updated)
      setResults(res.data)
      onUploadComplete && onUploadComplete()
    } catch (e) {
      const updated = { ...init }
      files.forEach(f => { updated[f.name] = 'error' })
      setStatus(updated)
      setError('Upload failed. Make sure Flask backend is running and a job is saved.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section id="upload" className="section" style={{ background:'linear-gradient(180deg, transparent, rgba(108,99,255,0.04), transparent)' }}>
      <div className="container">
        <div className="section-label"><Upload size={14}/> Step 2</div>
        <h2 className="section-title">Resume <span className="gradient-text">Upload</span></h2>
        <p className="section-desc">Upload one or more resumes in PDF or DOCX format. Our engine will extract, parse, and score each candidate instantly.</p>

        <div className="divider"/>

        <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:24 }}>
          {/* Drag & Drop */}
          <div>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current.click()}
              style={{
                border:`2px dashed ${dragging ? 'var(--violet)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius:'var(--radius-lg)',
                padding:'48px 32px',
                textAlign:'center',
                cursor:'pointer',
                background: dragging ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.02)',
                transition:'var(--transition)',
                marginBottom:16,
              }}
            >
              <div style={{
                width:64, height:64, borderRadius:16,
                background:'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(0,212,255,0.1))',
                border:'1px solid rgba(108,99,255,0.2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 16px',
              }}>
                <Upload size={28} style={{ color:'var(--violet-light)' }}/>
              </div>
              <div style={{ fontWeight:600, marginBottom:6 }}>
                {dragging ? 'Drop resumes here!' : 'Drag & drop resumes here'}
              </div>
              <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:16 }}>
                or click to browse files
              </div>
              <span className="badge badge-violet">PDF, DOCX, DOC supported</span>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc"
                style={{ display:'none' }}
                onChange={e => addFiles(e.target.files)}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {files.map(f => (
                  <div key={f.name} style={{ position:'relative' }}>
                    <FileItem file={f} status={statuses[f.name] || 'idle'}/>
                    {!uploading && !statuses[f.name] && (
                      <button
                        onClick={() => removeFile(f.name)}
                        style={{
                          position:'absolute', top:8, right:8,
                          background:'transparent', border:'none', cursor:'pointer',
                          color:'var(--text-muted)', padding:4,
                          borderRadius:'var(--radius-sm)',
                        }}
                      >
                        <X size={14}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="glass-card" style={{ padding:24, flex:1 }}>
              <div style={{ fontSize:'0.875rem', fontWeight:600, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <Zap size={16} style={{ color:'var(--amber)' }}/> Upload Status
              </div>

              {files.length === 0 ? (
                <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', textAlign:'center', padding:'32px 0' }}>
                  No resumes added yet
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {[
                      { label:'Total Files',    value:files.length, color:'var(--violet-light)' },
                      { label:'Ready',          value:Object.values(statuses).filter(s=>s==='done').length, color:'var(--green)' },
                    ].map(s => (
                      <div key={s.label} style={{ padding:'14px', background:'rgba(255,255,255,0.03)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-glass)', textAlign:'center' }}>
                        <div style={{ fontSize:'1.6rem', fontWeight:700, fontFamily:'var(--font-display)', color:s.color }}>{s.value}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {!jobId && (
                    <div style={{ padding:'10px 14px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'var(--radius-md)', fontSize:'0.78rem', color:'var(--amber)' }}>
                      ⚠ Save a Job Description first before uploading
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div style={{ padding:'12px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'var(--radius-md)', fontSize:'0.8rem', color:'var(--red)' }}>
                ⚠ {error}
              </div>
            )}

            {results && (
              <div style={{ padding:'14px 16px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'var(--radius-md)', fontSize:'0.85rem', color:'var(--green)' }}>
                ✓ {results.uploaded} resume(s) processed successfully! Scroll down to view rankings.
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ justifyContent:'center', padding:'14px' }}
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading
                ? <><span className="spinner"/> Analyzing Resumes...</>
                : <><Zap size={16}/> Analyze & Score {files.length > 0 ? `(${files.length})` : ''} Resumes</>
              }
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
