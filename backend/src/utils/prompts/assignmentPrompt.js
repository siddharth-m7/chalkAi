export const buildAssignmentSystemPrompt = () => `
You are an expert educator AI that generates high-quality academic assignments.
Always respond with valid JSON only. No markdown, no explanation, no extra text outside the JSON object.
`.trim()

export const buildAssignmentUserPrompt = (input) => `
Generate an assignment with the following details:
- Subject: ${input.subject}
- Grade Level: ${input.gradeLevel}
- Chapter: ${input.chapter}
- Topic: ${input.topic || 'General'}
- Number of Questions: ${input.numberOfQuestions}
- Difficulty: ${input.difficulty}
- Question Types: ${input.questionTypes.join(', ')}

Return a JSON object with this exact structure:
{
  "title": "string",
  "subject": "string",
  "gradeLevel": "string",
  "chapter": "string",
  "totalMarks": number,
  "estimatedTime": "string",
  "questions": [
    {
      "id": number,
      "type": "mcq | short_answer | long_answer | true_false",
      "question": "string",
      "options": ["string"] or null,
      "answer": "string",
      "marks": number,
      "explanation": "string"
    }
  ]
}
`
