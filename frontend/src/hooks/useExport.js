import { useState } from 'react'
import api from '../api/axios'

export const useExport = (contentId, title) => {
  const [exporting, setExporting] = useState(null) // 'pdf' | 'docx' | null
  const [preview, setPreview] = useState(null) // { url, filename } | null

  const safeName = (title || 'export').replace(/[^a-z0-9_\-\s]/gi, '').trim().replace(/\s+/g, '_')

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAs = async (format, includeAnswers = false, { direct = false } = {}) => {
    if (!contentId || exporting) return
    setExporting(format)
    try {
      const res = await api.post(
        `/export/${format}`,
        { contentId, includeAnswers },
        { responseType: 'blob' }
      )
      const filename = `${safeName}${includeAnswers ? '_with_answers' : ''}.${format}`
      if (format === 'pdf' && !direct) {
        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
        setPreview({ url, filename })
      } else {
        triggerDownload(res.data, filename)
      }
    } catch (err) {
      console.error(`Export as ${format} failed`, err)
    } finally {
      setExporting(null)
    }
  }

  const closePreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url)
    setPreview(null)
  }

  const downloadFromPreview = () => {
    if (!preview) return
    const a = document.createElement('a')
    a.href = preview.url
    a.download = preview.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return { exportAs, exporting, preview, closePreview, downloadFromPreview }
}
