const ExportPreviewModal = ({ preview, onClose, onDownload }) => {
  if (!preview) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ height: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-black">PDF Preview</h3>
            <p className="text-xs text-stone-400 mt-0.5">{preview.filename}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-[#FF5841] text-white text-xs font-medium rounded-lg hover:bg-[#e04d38] transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-black hover:bg-stone-100 rounded-lg transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <iframe
          src={preview.url}
          className="flex-1 w-full rounded-b-2xl"
          title="PDF Preview"
        />
      </div>
    </div>
  )
}

export default ExportPreviewModal
