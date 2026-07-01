import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useExport } from '../hooks/useExport'
import ExportPreviewModal from '../components/ExportPreviewModal'

const TYPE_LABELS = {
  assignment:    { label: 'Assignment',   color: 'bg-blue-50 text-blue-600'    },
  lessonPlan:    { label: 'Lesson Plan',  color: 'bg-green-50 text-green-600'  },
  conceptExplain:{ label: 'Concept',      color: 'bg-purple-50 text-purple-600' },
  resource:      { label: 'Resource',     color: 'bg-orange-50 text-orange-600' },
}

const FILTER_TABS = [
  { key: 'all',           label: 'All'          },
  { key: 'assignment',    label: 'Assignments'  },
  { key: 'lessonPlan',    label: 'Lesson Plans' },
  { key: 'conceptExplain',label: 'Concepts'     },
]

// ── Tag editor ───────────────────────────────────────────────────────────────

const TagEditor = ({ tags, onSave, onCancel }) => {
  const [input, setInput] = useState('')
  const [current, setCurrent] = useState(tags)

  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !current.includes(trimmed)) setCurrent([...current, trimmed])
    setInput('')
  }

  const remove = (tag) => setCurrent(current.filter((t) => t !== tag))

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {current.map((tag) => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
            {tag}
            <button onClick={() => remove(tag)} className="text-stone-600 hover:text-red-400 transition-colors leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Add tag..."
          className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta"
        />
        <button onClick={add}
          className="px-3 py-1.5 text-xs bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors">
          Add
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(current)}
          className="px-3 py-1.5 text-xs bg-slate text-white rounded-lg hover:bg-slate-dark transition-colors">
          Save
        </button>
        <button onClick={onCancel}
          className="px-3 py-1.5 text-xs border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Library card ─────────────────────────────────────────────────────────────

const LibraryCard = ({ item, onDelete, onTagsUpdate }) => {
  const [editingTags, setEditingTags] = useState(false)
  const [tags, setTags] = useState(item.tags || [])
  const [deleting, setDeleting] = useState(false)

  const contentId = item.contentId?._id || item.contentId
  const title = item.contentId?.output?.title
    || item.contentId?.output?.concept
    || item.title
    || 'Untitled'

  const { exportAs, exporting, preview, closePreview, downloadFromPreview } = useExport(contentId, title)

  const typeInfo = TYPE_LABELS[item.itemType] || { label: item.itemType, color: 'bg-stone-100 text-stone-700' }

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      await api.delete(`/library/${item._id}`)
      onDelete(item._id)
    } catch (err) {
      console.error('Delete failed', err)
      setDeleting(false)
    }
  }

  const handleSaveTags = async (newTags) => {
    try {
      await api.patch(`/library/${item._id}`, { tags: newTags })
      setTags(newTags)
      onTagsUpdate(item._id, newTags)
      setEditingTags(false)
    } catch (err) {
      console.error('Tag update failed', err)
    }
  }

  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-3">
      <ExportPreviewModal preview={preview} onClose={closePreview} onDownload={downloadFromPreview} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wide ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className="text-xs text-stone-600">{date}</span>
          </div>
          <h3 className="text-sm font-semibold text-black leading-snug">{title}</h3>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-stone-700 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
          title="Remove from library"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Tags */}
      {!editingTags ? (
        <div className="flex flex-wrap gap-1.5 items-center min-h-[24px]">
          {tags.length > 0
            ? tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs rounded-full">{tag}</span>
              ))
            : <span className="text-xs text-stone-700">No tags</span>
          }
          <button
            onClick={() => setEditingTags(true)}
            className="px-2 py-0.5 text-[10px] text-stone-600 hover:text-terracotta border border-dashed border-stone-200 hover:border-terracotta/40 rounded-full transition-colors"
          >
            {tags.length > 0 ? 'edit' : '+ tag'}
          </button>
        </div>
      ) : (
        <TagEditor
          tags={tags}
          onSave={handleSaveTags}
          onCancel={() => setEditingTags(false)}
        />
      )}

      {/* Export actions — only for AI-generated content */}
      {item.itemType !== 'resource' && contentId && (
        <div className="flex gap-2 pt-1 border-t border-stone-100">
          <button
            onClick={() => exportAs('pdf', false)}
            disabled={!!exporting}
            className="flex-1 py-1.5 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors disabled:opacity-50"
          >
            {exporting === 'pdf' ? 'Loading...' : 'PDF'}
          </button>
          {item.itemType === 'assignment' && (
            <button
              onClick={() => exportAs('pdf', true)}
              disabled={!!exporting}
              className="flex-1 py-1.5 text-xs font-medium border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors disabled:opacity-50"
            >
              PDF + Answers
            </button>
          )}
          <button
            onClick={() => exportAs('docx', false)}
            disabled={!!exporting}
            className="flex-1 py-1.5 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors disabled:opacity-50"
          >
            {exporting === 'docx' ? 'Exporting...' : 'Word'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const PersonalLibrary = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/library')
        setItems(res.data.data || [])
      } catch (err) {
        console.error('Failed to load library', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleDelete = (id) => setItems((prev) => prev.filter((i) => i._id !== id))

  const handleTagsUpdate = (id, newTags) =>
    setItems((prev) => prev.map((i) => i._id === id ? { ...i, tags: newTags } : i))

  const filtered = activeTab === 'all' ? items : items.filter((i) => i.itemType === activeTab)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-charcoal/75 hover:text-charcoal transition-colors mb-3 font-medium"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/85 mb-1.5">
            Tools
          </p>
          <h1 className="font-serif text-3xl text-charcoal">Personal Library</h1>
          <p className="text-sm text-charcoal/75 mt-1">Your saved assignments, lesson plans, and concept explanations</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {FILTER_TABS.map((tab) => {
            const count = tab.key === 'all' ? items.length : items.filter((i) => i.itemType === tab.key).length
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-black text-white'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-black'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 animate-pulse space-y-3">
                <div className="h-3 bg-stone-100 rounded w-1/3" />
                <div className="h-4 bg-stone-100 rounded w-2/3" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📚</div>
            <p className="text-sm font-medium text-stone-600">
              {activeTab === 'all' ? 'Your library is empty' : `No ${FILTER_TABS.find(t => t.key === activeTab)?.label} saved yet`}
            </p>
            <p className="text-xs text-stone-600 mt-1">
              Save generated content by clicking "Save to Library" on any result page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <LibraryCard
                key={item._id}
                item={item}
                onDelete={handleDelete}
                onTagsUpdate={handleTagsUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default PersonalLibrary
