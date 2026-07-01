export interface ExplanationType {
  type: string
  label: string
  icon: string
}

export const EXPLANATION_TYPES: ExplanationType[] = [
  { type: 'simple',    label: 'Simple',     icon: '💬' },
  { type: 'analogy',   label: 'Analogy',    icon: '🔗' },
  { type: 'example',   label: 'Real-world', icon: '🌍' },
  { type: 'story',     label: 'Story',      icon: '📖' },
  { type: 'technical', label: 'Technical',  icon: '⚙️'  },
]

const TYPE_INSTRUCTIONS: Record<string, string> = {
  simple:    'Explain this concept in the simplest possible plain language. Avoid jargon. Write as if explaining to a curious student with no prior knowledge.',
  analogy:   'Explain this concept using a clever, memorable analogy that compares it to something from everyday life. Make the analogy vivid and easy to picture.',
  example:   'Explain this concept through a concrete, real-world example or practical application that a student would find relevant and interesting.',
  story:     'Explain this concept through a short, engaging story or narrative (150-200 words). The story should naturally illustrate how the concept works.',
  technical: 'Explain this concept in technical depth. Include precise terminology, underlying mechanisms, and nuance appropriate for a serious learner.',
}

export const buildConceptSystemPrompt = (): string => `
You are an expert educator AI. Explain concepts clearly and engagingly.
Always respond with valid JSON only. No markdown, no explanation, no extra text outside the JSON object.
`.trim()

export const buildConceptUserPrompt = (
  concept: string,
  subject: string,
  gradeLevel: string,
  type: string,
  additionalContext: string
): string => `
Explain the concept "${concept}" using the following approach:
${TYPE_INSTRUCTIONS[type]}

${subject ? `Subject area: ${subject}` : ''}
${gradeLevel ? `Target audience: ${gradeLevel} students` : ''}
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Return a JSON object with this exact structure:
{
  "title": "string (a short, catchy title for this explanation)",
  "content": "string (the full explanation, 100-200 words)",
  "keyPoints": ["string", "string", "string"]
}

keyPoints should be 3 concise bullet points summarising the core takeaways.
`
