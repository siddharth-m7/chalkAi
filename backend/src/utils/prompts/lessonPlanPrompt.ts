export interface LessonPlanInput {
  subject: string
  gradeLevel: string
  chapter?: string
  topic?: string
  weekStartDate?: string | Date
  numberOfDays: number
  classDuration: number
  learningObjectives?: string
  additionalInfo?: string
}

export const buildLessonPlanSystemPrompt = (): string => `
You are an expert educator AI that creates detailed, practical lesson plans.
Always respond with valid JSON only. No markdown, no explanation, no extra text outside the JSON object.
`.trim()

export const buildLessonPlanUserPrompt = (input: LessonPlanInput): string => {
  const { subject, gradeLevel, chapter, topic, weekStartDate, numberOfDays, classDuration, learningObjectives, additionalInfo } = input

  const formattedDate = weekStartDate ? new Date(weekStartDate).toLocaleDateString('en-GB') : ''

  return `Create a ${numberOfDays}-day lesson plan with the following details:
- Subject: ${subject}
- Grade Level: ${gradeLevel}
${chapter ? `- Chapter: ${chapter}` : ''}
${topic ? `- Topic: ${topic}` : ''}
- Class Duration: ${classDuration} minutes per session
${formattedDate ? `- Week Starting: ${formattedDate}` : ''}
${learningObjectives ? `- Learning Objectives: ${learningObjectives}` : ''}
${additionalInfo ? `- Additional Instructions: ${additionalInfo}` : ''}

Return a JSON object with this exact structure:
{
  "title": "string",
  "subject": "${subject}",
  "gradeLevel": "${gradeLevel}",
  "weekStartDate": "${formattedDate}",
  "numberOfDays": ${numberOfDays},
  "classDuration": "${classDuration} minutes",
  "overview": "string (2-3 sentence summary of what will be covered this week)",
  "days": [
    {
      "day": 1,
      "label": "Day 1",
      "topic": "string",
      "objectives": ["string"],
      "warmUp": "string (5-10 min activity to open the class)",
      "mainActivity": "string (detailed description of the main lesson content and teaching approach)",
      "wrapUp": "string (5 min recap or closing activity)",
      "materials": ["string"],
      "homework": "string or null"
    }
  ]
}

Generate exactly ${numberOfDays} day entries. Make activities practical and age-appropriate for ${gradeLevel}.`
}
