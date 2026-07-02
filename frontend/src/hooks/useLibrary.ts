import { useState } from 'react'
import axios from 'axios'
import api from '../api/axios'

// Pass contentId once the generated result is available.
// saved: whether this item is currently in the library.
// libraryItemId: the PersonalLibrary _id (needed for delete/update from the library page).
export const useLibrary = (contentId: string | undefined) => {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [libraryItemId, setLibraryItemId] = useState<string | null>(null)

  const save = async () => {
    if (!contentId || saving || saved) return
    setSaving(true)
    try {
      const res = await api.post('/library', { contentId })
      setSaved(true)
      setLibraryItemId(res.data.data._id)
    } catch (err) {
      // 409 means already saved — treat as saved
      if (axios.isAxiosError(err) && err.response?.status === 409) setSaved(true)
      else console.error('Save to library failed', err)
    } finally {
      setSaving(false)
    }
  }

  const unsave = async () => {
    if (!libraryItemId || saving) return
    setSaving(true)
    try {
      await api.delete(`/library/${libraryItemId}`)
      setSaved(false)
      setLibraryItemId(null)
    } catch (err) {
      console.error('Remove from library failed', err)
    } finally {
      setSaving(false)
    }
  }

  const toggle = () => (saved ? unsave() : save())

  return { saved, saving, toggle }
}
