import mongoose, { Document, Schema, Types } from 'mongoose'
import { ContentType } from './GeneratedContent'

export type LibraryItemType = ContentType | 'resource'

export interface IPersonalLibrary extends Document {
  userId: Types.ObjectId
  contentId:  Types.ObjectId | null
  resourceId: Types.ObjectId | null
  itemType: LibraryItemType
  title: string
  tags: string[]
  notes: string
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

const personalLibrarySchema = new Schema<IPersonalLibrary>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contentId:  { type: Schema.Types.ObjectId, ref: 'GeneratedContent', default: null },
    resourceId: { type: Schema.Types.ObjectId, ref: 'Resource', default: null },
    itemType:   { type: String, enum: ['assignment', 'quiz', 'lessonPlan', 'conceptExplain', 'resource'], required: true },
    title:      { type: String, required: true },
    tags:       [{ type: String }],
    notes:      { type: String, default: '' },
    usageCount: { type: Number, default: 0 }
  },
  { timestamps: true }
)

personalLibrarySchema.index({ userId: 1, itemType: 1 })
personalLibrarySchema.index({ userId: 1, tags: 1 })

export default mongoose.model<IPersonalLibrary>('PersonalLibrary', personalLibrarySchema)
