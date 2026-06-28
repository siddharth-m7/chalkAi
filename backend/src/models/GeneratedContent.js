import mongoose from 'mongoose'

const generatedContentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['assignment', 'quiz', 'lessonPlan', 'conceptExplain'],
    required: true
  },
  input: { type: mongoose.Schema.Types.Mixed },
  output: { type: mongoose.Schema.Types.Mixed },
  tokensUsed: { type: Number, default: 0 },
  aiProvider: { type: String, enum: ['gemini', 'groq'] }
}, { timestamps: true })

generatedContentSchema.index({ userId: 1, type: 1 })
generatedContentSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('GeneratedContent', generatedContentSchema)
