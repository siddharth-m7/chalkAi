import axios from 'axios'
import Resource from '../models/Resource'
import { logger } from '../config/logger'

interface YouTubeItem {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    channelTitle: string
    publishedAt: string
    thumbnails: { medium: { url: string } }
  }
}

export const fetchYouTubeResources = async (
  query: string,
  subject: string,
  gradeLevel: string
): Promise<typeof Resource[]> => {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    logger.warn('YOUTUBE_API_KEY not set — skipping YouTube fetch')
    return []
  }

  const searchQuery = [query, subject, gradeLevel].filter(Boolean).join(' ')

  const response = await axios.get<{ items: YouTubeItem[] }>(
    'https://www.googleapis.com/youtube/v3/search',
    {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: 12,
        relevanceLanguage: 'en',
        key: apiKey,
      },
    }
  )

  const videos = response.data.items.map((item) => ({
    title:        item.snippet.title,
    description:  item.snippet.description,
    url:          `https://www.youtube.com/watch?v=${item.id.videoId}`,
    source:       'youtube' as const,
    type:         'video' as const,
    subject:      subject || '',
    gradeLevel:   gradeLevel ? [gradeLevel] : [],
    topics:       [query],
    thumbnailUrl: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt:  item.snippet.publishedAt,
  }))

  const saved = await Promise.all(
    videos.map((v) =>
      Resource.findOneAndUpdate({ url: v.url }, v, { upsert: true, returnDocument: 'after' })
    )
  )

  return saved.filter(Boolean) as typeof Resource[]
}
