import { Request, Response, NextFunction } from 'express'
import Resource from '../models/Resource'
import { fetchYouTubeResources } from '../services/resourceService'

const DEFAULT_QUERY      = 'Photosynthesis'
const DEFAULT_SUBJECT    = 'Biology'
const DEFAULT_GRADELEVEL = 'Grade 8'

// GET /api/v1/resources/default
// Returns pre-seeded photosynthesis results from DB, fetching from YouTube on first call
export const getDefaultResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cached = await Resource.find({
      $text: { $search: DEFAULT_QUERY },
      subject: DEFAULT_SUBJECT,
    }).sort({ indexedAt: -1 }).limit(12)

    if (cached.length >= 3) {
      res.json({ success: true, data: cached, source: 'cache' })
      return
    }

    const resources = await fetchYouTubeResources(DEFAULT_QUERY, DEFAULT_SUBJECT, DEFAULT_GRADELEVEL)
    res.json({ success: true, data: resources, source: 'youtube' })
  } catch (err) {
    next(err)
  }
}

// GET /api/v1/resources?q=&subject=&gradeLevel=&page=&limit=
export const searchResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, subject, gradeLevel, page = '1', limit = '12' } = req.query as Record<string, string>
    const filter: Record<string, unknown> = {}

    if (q)          filter.$text       = { $search: q }
    if (subject)    filter.subject     = subject
    if (gradeLevel) filter.gradeLevel  = gradeLevel

    const skip  = (Number(page) - 1) * Number(limit)
    const sort  = q ? { score: { $meta: 'textScore' } } : { indexedAt: -1 }

    const [resources, total] = await Promise.all([
      Resource.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Resource.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: resources,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/v1/resources/youtube
// Body: { query, subject, gradeLevel }
export const fetchFromYouTube = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { query, subject = '', gradeLevel = '' } = req.body as {
      query: string
      subject?: string
      gradeLevel?: string
    }

    if (!query?.trim()) {
      res.status(400).json({ success: false, message: 'query is required' })
      return
    }

    const resources = await fetchYouTubeResources(query.trim(), subject, gradeLevel)

    // If YouTube key is missing we still return existing DB results for the query
    if (resources.length === 0) {
      const filter: Record<string, unknown> = { $text: { $search: query } }
      if (subject)    filter.subject    = subject
      if (gradeLevel) filter.gradeLevel = gradeLevel

      const existing = await Resource.find(filter).sort({ indexedAt: -1 }).limit(12)
      res.json({ success: true, data: existing, source: 'cache' })
      return
    }

    res.json({ success: true, data: resources, source: 'youtube' })
  } catch (err) {
    next(err)
  }
}
