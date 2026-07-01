interface QuestionSection {
  type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false' | 'numerical'
  count: number
  marksPerQuestion: number
}

interface AssignmentInput {
  title?: string
  subject: string
  gradeLevel: string
  chapter?: string
  topic?: string
  dueDate?: string | Date
  difficulty: string
  questionSections: QuestionSection[]
  additionalInfo?: string
}

const TYPE_LABELS: Record<string, string> = {
  mcq:          'Multiple Choice',
  short_answer: 'Short Answer',
  long_answer:  'Long Answer',
  true_false:   'True/False',
  numerical:    'Numerical Problems'
}

export const buildAssignmentSystemPrompt = (): string => `
You are an expert educator AI that generates high-quality academic assignments.
Always respond with valid JSON only. No markdown, no explanation, no extra text outside the JSON object.
`.trim()

export const buildAssignmentUserPrompt = (input: AssignmentInput): string => {
  const { title, subject, gradeLevel, chapter, topic, dueDate, difficulty, questionSections, additionalInfo } = input

  const totalQuestions = questionSections.reduce((sum, s) => sum + s.count, 0)
  const totalMarks     = questionSections.reduce((sum, s) => sum + s.count * s.marksPerQuestion, 0)
  const sectionList    = questionSections
    .map((s) => `- ${s.count} ${TYPE_LABELS[s.type]} question(s), ${s.marksPerQuestion} mark(s) each`)
    .join('\n')

  const autoTitle    = title || `${subject} Assignment${chapter ? ' – ' + chapter : ''}`
  const formattedDue = dueDate ? new Date(dueDate).toLocaleDateString('en-GB') : ''

  return `Generate an assignment with the following details:
- Subject: ${subject}
- Grade Level: ${gradeLevel}
${chapter ? `- Chapter: ${chapter}` : ''}
${topic ? `- Topic: ${topic}` : ''}
- Difficulty: ${difficulty}
${formattedDue ? `- Due Date: ${formattedDue}` : ''}
${additionalInfo ? `- Additional Instructions: ${additionalInfo}` : ''}

Question Sections:
${sectionList}

Total Questions: ${totalQuestions}
Total Marks: ${totalMarks}

Return a JSON object with this exact structure:
{
  "title": "${autoTitle}",
  "subject": "${subject}",
  "gradeLevel": "${gradeLevel}",
  "dueDate": "${formattedDue}",
  "totalMarks": ${totalMarks},
  "estimatedTime": "string (e.g. '45 minutes')",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "type": "mcq | short_answer | long_answer | true_false | numerical",
      "question": "string",
      "options": ["string"] or null,
      "answer": "string",
      "marks": number,
      "explanation": "string"
    }
  ]
}

Rules:
- mcq: "options" must be an array of exactly 4 choices
- true_false: "options" must be ["True", "False"]
- short_answer, long_answer, numerical: set "options" to null
- numerical: include step-by-step solution in "explanation"
- Generate EXACTLY the number of questions specified per section
- Keep questions ordered by section type`
}
