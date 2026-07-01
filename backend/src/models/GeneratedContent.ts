import mongoose, { Document, Schema, Types } from 'mongoose'

export type ContentType = 'assignment' | 'quiz' | 'lessonPlan' | 'conceptExplain'
export type AIProvider  = 'gemini' | 'groq'

export interface IGeneratedContent extends Document {
  userId: Types.ObjectId
  type: ContentType
  input: Record<string, unknown>
  output: Record<string, unknown>
  tokensUsed: number
  aiProvider?: AIProvider
  createdAt: Date
  updatedAt: Date
}

const generatedContentSchema = new Schema<IGeneratedContent>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:       { type: String, enum: ['assignment', 'quiz', 'lessonPlan', 'conceptExplain'], required: true },
    input:      { type: Schema.Types.Mixed },
    output:     { type: Schema.Types.Mixed },
    tokensUsed: { type: Number, default: 0 },
    aiProvider: { type: String, enum: ['gemini', 'groq'] }
  },
  { timestamps: true }
)

generatedContentSchema.index({ userId: 1, type: 1 })
generatedContentSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model<IGeneratedContent>('GeneratedContent', generatedContentSchema)
