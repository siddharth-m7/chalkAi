// Shared domain types for the ChalkAI frontend.
// Modeled on the backend Mongoose models (see backend/src/models).

// ── User ─────────────────────────────────────────────────────────────────────
export interface UserProfile {
  school?: string
  subjects?: string[]
  gradeLevels?: string[]
  bio?: string
  photoUrl?: string
}

export interface User {
  _id?: string
  name: string
  email: string
  profile?: UserProfile
  createdAt?: string
  updatedAt?: string
}

// ── Generated content ────────────────────────────────────────────────────────
export type ContentType = 'assignment' | 'quiz' | 'lessonPlan' | 'conceptExplain'
export type LibraryItemType = ContentType | 'resource'

export type ExportFormat = 'pdf' | 'docx'

// Assignment
export interface AssignmentQuestion {
  id: string | number
  question: string
  marks: number
  options?: string[]
  answer?: string
  explanation?: string
}

export interface AssignmentOutput {
  title?: string
  subject?: string
  gradeLevel?: string
  difficulty?: string
  totalMarks?: number
  estimatedTime?: string
  dueDate?: string
  questions?: AssignmentQuestion[]
}

// Concept explainer
export interface ConceptExplanation {
  type: string
  label: string
  icon: string
  success: boolean
  title?: string
  content?: string
  keyPoints?: string[]
}

export interface ConceptOutput {
  concept: string
  subject?: string
  gradeLevel?: string
  explanations?: ConceptExplanation[]
}

// Lesson plan
export interface LessonPlanDay {
  day: number | string
  label: string
  topic: string
  objectives?: string[]
  warmUp?: string
  mainActivity?: string
  wrapUp?: string
  materials?: string[]
  homework?: string
}

export interface LessonPlanOutput {
  title?: string
  subject?: string
  gradeLevel?: string
  numberOfDays?: number
  classDuration?: string | number
  weekStartDate?: string
  overview?: string
  days?: LessonPlanDay[]
}

// A generated-content document as returned by the API.
export interface GeneratedContent<TOutput = unknown> {
  _id: string
  type?: ContentType
  output: TOutput
  createdAt?: string
  updatedAt?: string
}

// ── Personal library ─────────────────────────────────────────────────────────
// contentId may be an id string or a populated GeneratedContent document.
export interface LibraryItem {
  _id: string
  itemType: LibraryItemType
  title?: string
  tags?: string[]
  contentId?: string | GeneratedContent<Record<string, unknown>> | null
  resourceId?: string | null
  createdAt: string
  updatedAt?: string
}

// ── Resource (YouTube) ───────────────────────────────────────────────────────
export interface Resource {
  _id?: string
  title: string
  description?: string
  url: string
  source?: string
  type?: string
  subject?: string
  gradeLevel?: string[]
  topics?: string[]
  thumbnailUrl?: string
  channelTitle?: string
  publishedAt?: string
}
