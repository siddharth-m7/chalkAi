import PersonalLibrary from '../models/PersonalLibrary.js'
import GeneratedContent from '../models/GeneratedContent.js'

export const saveToLibrary = async (req, res, next) => {
  try {
    const { contentId, title } = req.body
    if (!contentId) return res.status(400).json({ success: false, message: 'contentId is required' })

    const content = await GeneratedContent.findOne({ _id: contentId, userId: req.user._id })
    if (!content) return res.status(404).json({ success: false, message: 'Content not found' })

    const existing = await PersonalLibrary.findOne({ userId: req.user._id, contentId })
    if (existing) return res.status(409).json({ success: false, message: 'Already saved to library' })

    const item = await PersonalLibrary.create({
      userId: req.user._id,
      contentId,
      itemType: content.type,
      title: title || content.output?.title || 'Untitled'
    })

    res.status(201).json({ success: true, data: item })
  } catch (err) {
    next(err)
  }
}

export const listLibrary = async (req, res, next) => {
  try {
    const items = await PersonalLibrary.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('contentId', 'type output createdAt')
    res.json({ success: true, data: items })
  } catch (err) {
    next(err)
  }
}

export const removeFromLibrary = async (req, res, next) => {
  try {
    const item = await PersonalLibrary.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
