import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, default: '' },
  url:          { type: String, required: true, unique: true },
  source:       { type: String, enum: ['youtube', 'other'], default: 'youtube' },
  type:         { type: String, enum: ['video', 'article'], default: 'video' },
  subject:      { type: String, default: '' },
  gradeLevel:   [{ type: String }],
  topics:       [{ type: String }],
  thumbnailUrl: { type: String, default: '' },
  channelTitle: { type: String, default: '' },
  publishedAt:  { type: String, default: '' },
  indexedAt:    { type: Date, default: Date.now },
})

resourceSchema.index({ title: 'text', description: 'text', topics: 'text' })
resourceSchema.index({ subject: 1 })

export default mongoose.model('Resource', resourceSchema)
