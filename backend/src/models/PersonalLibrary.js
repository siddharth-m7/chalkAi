import mongoose from 'mongoose'

const personalLibrarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'GeneratedContent', default: null },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', default: null },
  itemType: {
    type: String,
    enum: ['assignment', 'quiz', 'lessonPlan', 'conceptExplain', 'resource'],
    required: true
  },
  title: { type: String, required: true },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true })

personalLibrarySchema.index({ userId: 1, itemType: 1 })
personalLibrarySchema.index({ userId: 1, tags: 1 })

export default mongoose.model('PersonalLibrary', personalLibrarySchema)
