import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import { logger } from '../config/logger'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export interface AIResult {
  text: string
  provider: 'gemini' | 'groq'
}

export const generateWithAI = async (systemPrompt: string, userPrompt: string): Promise<AIResult> => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
    const text = completion.choices[0].message.content ?? ''
    logger.info('AI response from groq')
    return { text, provider: 'groq' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.warn(`Groq failed, falling back to Gemini: ${message}`)

    const model = gemini.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: systemPrompt
    })
    const result = await model.generateContent(userPrompt)
    const text = result.response.text()
    logger.info('AI response from gemini')
    return { text, provider: 'gemini' }
  }
}

export const parseJsonFromAI = (text: string): Record<string, unknown> => {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}
