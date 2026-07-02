interface ExportPreview {
  url: string
  filename: string
}

interface ExportPreviewModalProps {
  preview: ExportPreview | null
  onClose: () => void
  onDownload: () => void
}

const ExportPreviewModal = ({ preview, onClose, onDownload }: ExportPreviewModalProps) => {
  if (!preview) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-sand rounded-lg shadow-md w-full max-w-4xl flex flex-col" style={{ height: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-sand shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-charcoal">PDF Preview</h3>
            <p className="font-mono text-[11px] text-charcoal/85 mt-0.5">{preview.filename}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onDownload}
              className="h-8 px-4 bg-slate text-white text-xs font-medium rounded-md hover:bg-slate-dark transition-colors">
              Download PDF
            </button>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-charcoal/85 hover:text-charcoal hover:bg-sand/60 rounded-md transition-colors text-lg leading-none">
              ×
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <iframe src={preview.url} className="flex-1 w-full rounded-b-xl" title="PDF Preview" />
      </div>
    </div>
  )
}

export default ExportPreviewModal
