import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import { logger } from '../config/logger.js'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const generateWithAI = async (systemPrompt, userPrompt) => {
  try {
    const model = gemini.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt
    })
    const result = await model.generateContent(userPrompt)
    const text = result.response.text()
    logger.info('AI response from gemini')
    return { text, provider: 'gemini' }
  } catch (err) {
    logger.warn(`Gemini failed, falling back to Groq: ${err.message}`)

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
    const text = completion.choices[0].message.content
    logger.info('AI response from groq')
    return { text, provider: 'groq' }
  }
}

export const parseJsonFromAI = (text) => {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}
