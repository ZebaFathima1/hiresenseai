import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const api = axios.create({ baseURL: `${BASE_URL}/api` })

export const checkHealth       = ()              => api.get('/health')
export const createJob         = (data)          => api.post('/job', data)
export const getJob            = (id)            => api.get(`/job/${id}`)
export const uploadResumes     = (jobId, files)  => {
  const form = new FormData()
  form.append('job_id', jobId)
  files.forEach(f => form.append('resumes', f))
  return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const getCandidates     = (jobId)         => api.get(`/candidates/${jobId}`)
export const getAnalytics      = (jobId)         => api.get(`/analytics/${jobId}`)
export const getReport         = (candidateId)   => api.get(`/report/${candidateId}`)
export const resetJob          = (jobId)         => api.delete(`/reset/${jobId}`)
