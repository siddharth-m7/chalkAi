import PDFDocument from 'pdfkit'
import { Document, Packer, Paragraph, TextRun, BorderStyle } from 'docx'
import { Request, Response, NextFunction } from 'express'
import GeneratedContent from '../models/GeneratedContent'

const ORANGE = '#FF5841'
const BLACK  = '#111111'
const GREY   = '#666666'
const BLUE   = '#2563EB'

const safeFilename = (title: unknown): string =>
  (String(title || 'export')).replace(/[^a-z0-9_\-\s]/gi, '').trim().replace(/\s+/g, '_') || 'export'

// ─── Shared PDF helpers ──────────────────────────────────────────────────────

const W = 495
const L = 50

const hline = (doc: PDFKit.PDFDocument, y: number, color = '#e0e0e0'): void => {
  doc.moveTo(L, y).lineTo(L + W, y).strokeColor(color).lineWidth(0.5).stroke()
}

interface InfoField { label: string; lineEnd: number }

const infoRow = (doc: PDFKit.PDFDocument, fields: InfoField[], y: number): void => {
  doc.fontSize(9).font('Helvetica')
  let x = L
  fields.forEach(({ label, lineEnd }) => {
    const labelW = doc.widthOfString(label)
    doc.fillColor(BLACK).text(label, x, y)
    doc.moveTo(x + labelW + 2, y + 11).lineTo(lineEnd, y + 11).strokeColor('#aaaaaa').lineWidth(0.5).stroke()
    x = lineEnd + 20
  })
}

// ─── Assignment PDF ──────────────────────────────────────────────────────────

type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'numerical' | 'long_answer'

interface Question {
  id: number
  type: QuestionType
  question: string
  options?: string[] | null
  answer: string
  marks: number
  explanation?: string
}

interface AssignmentOutput {
  title?: string
  subject?: string
  gradeLevel?: string
  totalMarks?: number
  estimatedTime?: string
  dueDate?: string
  difficulty?: string
  questions?: Question[]
}

const SECTION_ORDER: QuestionType[] = ['mcq', 'true_false', 'short_answer', 'numerical', 'long_answer']
const SECTION_NAMES: Record<QuestionType, string> = {
  mcq:          'Multiple Choice Questions',
  true_false:   'True / False',
  short_answer: 'Short Answer Questions',
  numerical:    'Numerical Problems',
  long_answer:  'Long Answer Questions',
}

const groupByType = (questions: Question[] = {}  as unknown as Question[]): Record<string, Question[]> => {
  const map: Record<string, Question[]> = {}
  ;(questions as Question[]).forEach((q) => {
    if (!map[q.type]) map[q.type] = []
    map[q.type].push(q)
  })
  return map
}

const generateAssignmentPDF = (
  doc: PDFKit.PDFDocument,
  rawOutput: Record<string, unknown>,
  includeAnswers: boolean,
  schoolName: string
): void => {
  const output = rawOutput as unknown as AssignmentOutput
  const sections = groupByType(output.questions as Question[])
  const presentSections = SECTION_ORDER.filter((t) => sections[t]?.length)

  let y = 50

  if (schoolName) {
    doc.fontSize(15).font('Helvetica-Bold').fillColor(BLACK)
      .text(schoolName, L, y, { width: W, align: 'center' })
    y = doc.y + 2
  }

  const titleText = output.title || `${output.subject || 'Assignment'} Paper`
  doc.fontSize(schoolName ? 11 : 14).font(schoolName ? 'Helvetica' : 'Helvetica-Bold').fillColor(BLACK)
    .text(titleText, L, y, { width: W, align: 'center' })
  y = doc.y + 2

  const subLine = [
    output.subject    ? `Subject: ${output.subject}`   : null,
    output.gradeLevel ? `Class: ${output.gradeLevel}`  : null,
  ].filter(Boolean).join('     ')
  doc.fontSize(10).font('Helvetica').fillColor(GREY)
    .text(subLine, L, y, { width: W, align: 'center' })
  y = doc.y + 6

  hline(doc, y)
  y += 10

  doc.fontSize(9).font('Helvetica').fillColor(BLACK)
    .text(`Time Allowed: ${output.estimatedTime || '—'}`, L, y)
  doc.fontSize(9).font('Helvetica').fillColor(BLACK)
    .text(`Maximum Marks: ${output.totalMarks || '—'}`, L, y, { align: 'right', width: W })
  y += 16

  doc.fontSize(8.5).font('Helvetica').fillColor(GREY)
    .text('All questions are compulsory unless stated otherwise.', L, y, { width: W })
  y = doc.y + 12

  infoRow(doc, [
    { label: 'Name:',        lineEnd: L + 215 },
    { label: 'Roll Number:', lineEnd: L + W   },
  ], y)
  y += 22
  infoRow(doc, [
    { label: 'Class:',   lineEnd: L + 180 },
    { label: 'Section:', lineEnd: L + W   },
  ], y)
  y += 22

  hline(doc, y)
  y += 12
  doc.y = y

  let globalNum = 1
  presentSections.forEach((type, secIdx) => {
    const qs = sections[type]
    const marksEach = qs[0]?.marks || 1
    const instruction = `Attempt all questions. Each question carries ${marksEach} mark${marksEach > 1 ? 's' : ''}`

    if (doc.y > doc.page.height - 120) doc.addPage()

    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica-Bold').fillColor(BLACK)
      .text(`Section ${String.fromCharCode(65 + secIdx)}: ${SECTION_NAMES[type]}`, L, doc.y, { width: W, align: 'center' })
    doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(GREY)
      .text(instruction, L, doc.y + 1, { width: W, align: 'center' })
    doc.moveDown(0.6)

    qs.forEach((q) => {
      if (doc.y > doc.page.height - 100) doc.addPage()

      const qY = doc.y
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(ORANGE)
        .text(`${globalNum}.`, L, qY, { width: 18 })
      doc.fontSize(9.5).font('Helvetica').fillColor(BLACK)
        .text(q.question, L + 18, qY, { width: W - 60 })
      const afterQ = doc.y
      doc.fontSize(8.5).font('Helvetica').fillColor(GREY)
        .text(`[${q.marks} Mark${q.marks > 1 ? 's' : ''}]`, L, qY, { align: 'right', width: W })
      doc.y = afterQ
      doc.moveDown(0.2)

      if (q.options?.length) {
        const cols = 2
        const colW = (W - 20) / cols
        const rowCount = Math.ceil(q.options.length / cols)
        for (let row = 0; row < rowCount; row++) {
          const rowY = doc.y
          for (let col = 0; col < cols; col++) {
            const idx = row * cols + col
            if (idx >= (q.options as string[]).length) break
            doc.fontSize(9).font('Helvetica').fillColor('#333333')
              .text(`${String.fromCharCode(65 + idx)}.  ${(q.options as string[])[idx]}`,
                L + 18 + col * colW, rowY, { width: colW - 10 })
          }
          doc.y = rowY + 15
        }
        doc.moveDown(0.3)
      }

      doc.moveDown(0.55)
      globalNum++
    })

    doc.moveDown(0.3)
  })

  doc.moveDown(0.5)
  hline(doc, doc.y)
  doc.moveDown(0.6)
  doc.fontSize(9).font('Helvetica').fillColor(GREY)
    .text('End of Question Paper', L, doc.y, { width: W, align: 'center' })

  if (includeAnswers) {
    doc.addPage()
    let akY = 50
    doc.fontSize(14).font('Helvetica-Bold').fillColor(BLACK)
      .text('Answer Key', L, akY, { width: W, align: 'center' })
    akY = doc.y + 2
    doc.fontSize(9.5).font('Helvetica').fillColor(GREY)
      .text(titleText, L, akY, { width: W, align: 'center' })
    akY = doc.y + 6
    hline(doc, akY)
    doc.y = akY + 14

    let ansNum = 1
    presentSections.forEach((type, secIdx) => {
      const qs = sections[type]

      doc.fontSize(10).font('Helvetica-Bold').fillColor(BLACK)
        .text(`Section ${String.fromCharCode(65 + secIdx)}: ${SECTION_NAMES[type]}`, L, doc.y)
      doc.moveDown(0.15)
      hline(doc, doc.y, '#e0e0e0')
      doc.moveDown(0.5)

      qs.forEach((q) => {
        if (doc.y > doc.page.height - 100) doc.addPage()

        const qY = doc.y
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor(GREY)
          .text(`${ansNum}.`, L, qY, { width: 18 })
        doc.fontSize(8.5).font('Helvetica').fillColor(GREY)
          .text(q.question, L + 18, qY, { width: W - 60 })
        const afterQ = doc.y
        doc.fontSize(8).font('Helvetica').fillColor(GREY)
          .text(`[${q.marks}m]`, L, qY, { align: 'right', width: W })
        doc.y = afterQ
        doc.moveDown(0.25)

        doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLUE)
          .text('Answer: ', L + 18, doc.y, { continued: true })
        doc.font('Helvetica').text(q.answer || '—')

        if (q.explanation) {
          doc.moveDown(0.15)
          doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(GREY)
            .text(q.explanation, L + 18, doc.y, { width: W - 18 })
        }

        doc.moveDown(0.6)
        ansNum++
      })
      doc.moveDown(0.5)
    })
  }
}

// ─── Lesson Plan PDF ─────────────────────────────────────────────────────────

interface DayPlan {
  day: number
  label: string
  topic: string
  objectives?: string[]
  warmUp?: string
  mainActivity?: string
  wrapUp?: string
  materials?: string[]
  homework?: string
}

interface LessonPlanOutput {
  title?: string
  subject?: string
  gradeLevel?: string
  numberOfDays?: number
  classDuration?: string
  weekStartDate?: string
  overview?: string
  days?: DayPlan[]
}

const generateLessonPlanPDF = (doc: PDFKit.PDFDocument, rawOutput: Record<string, unknown>): void => {
  const output = rawOutput as unknown as LessonPlanOutput
  let y = 50

  doc.fontSize(16).font('Helvetica-Bold').fillColor(BLACK)
    .text(output.title || 'Lesson Plan', L, y, { width: W, align: 'center' })
  y = doc.y + 2

  const subLine = [output.subject, output.gradeLevel].filter(Boolean).join('  ·  ')
  if (subLine) {
    doc.fontSize(10).font('Helvetica').fillColor(GREY).text(subLine, L, y, { width: W, align: 'center' })
    y = doc.y + 2
  }

  const meta = [
    { label: 'Days',      value: `${output.numberOfDays || '—'}` },
    { label: 'Per class', value: output.classDuration || '—' },
    output.weekStartDate ? { label: 'Week of', value: output.weekStartDate } : null,
  ].filter((m): m is { label: string; value: string } => m !== null)

  if (meta.length) {
    y += 4
    const metaLine = meta.map((m) => `${m.label}: ${m.value}`).join('   ·   ')
    doc.fontSize(8.5).font('Helvetica').fillColor(GREY).text(metaLine, L, y, { width: W, align: 'center' })
    y = doc.y + 4
  }

  hline(doc, y + 2)
  doc.y = y + 10

  if (output.overview) {
    doc.fontSize(8.5).font('Helvetica').fillColor('#444444')
      .text(output.overview, L + 10, doc.y, { width: W - 10 })
    doc.moveDown(0.8)
    hline(doc, doc.y)
    doc.moveDown(0.5)
  }

  output.days?.forEach((day) => {
    if (doc.y > doc.page.height - 140) doc.addPage()

    const dayY = doc.y
    doc.circle(L + 12, dayY + 10, 12).fill(ORANGE)
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff')
      .text(`${day.day}`, L + 7, dayY + 5, { width: 14, align: 'center' })

    doc.fontSize(11).font('Helvetica-Bold').fillColor(BLACK)
      .text(`${day.label}`, L + 30, dayY + 2)
    doc.fontSize(8.5).font('Helvetica').fillColor(GREY)
      .text(day.topic, L + 30, dayY + 15)

    doc.y = dayY + 32
    doc.moveDown(0.2)

    if (day.objectives?.length) {
      doc.fontSize(6.5).font('Helvetica-Bold').fillColor(ORANGE).text('OBJECTIVES')
      day.objectives.forEach((obj) => {
        doc.fontSize(8).font('Helvetica').fillColor('#333333')
          .text(`• ${obj}`, L + 8, doc.y, { width: W - 8 })
      })
      doc.moveDown(0.3)
    }

    const acts: Array<{ label: string; value?: string }> = [
      { label: 'WARM UP',       value: day.warmUp },
      { label: 'MAIN ACTIVITY', value: day.mainActivity },
      { label: 'WRAP UP',       value: day.wrapUp },
    ]
    acts.forEach(({ label, value }) => {
      if (!value) return
      if (doc.y > doc.page.height - 80) doc.addPage()
      doc.rect(L, doc.y, W, 14).fill('#f8f8f8')
      doc.fontSize(6.5).font('Helvetica-Bold').fillColor(ORANGE).text(label, L + 6, doc.y + 4)
      doc.y += 16
      doc.fontSize(8).font('Helvetica').fillColor('#333333').text(value, L + 6, doc.y, { width: W - 12 })
      doc.moveDown(0.4)
    })

    if (day.materials?.length) {
      doc.fontSize(6.5).font('Helvetica-Bold').fillColor(ORANGE).text('MATERIALS')
      doc.fontSize(8).font('Helvetica').fillColor('#555555').text(day.materials.join('  ·  '))
      doc.moveDown(0.3)
    }

    if (day.homework) {
      doc.rect(L, doc.y, W, 14).fill('#fff3f2')
      doc.fontSize(6.5).font('Helvetica-Bold').fillColor(ORANGE).text('HOMEWORK', L + 6, doc.y + 4)
      doc.y += 16
      doc.fontSize(8).font('Helvetica').fillColor('#333333').text(day.homework, L + 6, doc.y, { width: W - 12 })
      doc.moveDown(0.3)
    }

    doc.moveDown(0.3)
    hline(doc, doc.y)
    doc.moveDown(0.5)
  })
}

// ─── Concept Explainer PDF ───────────────────────────────────────────────────

interface Explanation {
  label: string
  title?: string
  content?: string
  keyPoints?: string[]
  success: boolean
}

interface ConceptOutput {
  concept?: string
  subject?: string
  gradeLevel?: string
  explanations?: Explanation[]
}

const generateConceptPDF = (doc: PDFKit.PDFDocument, rawOutput: Record<string, unknown>): void => {
  const output = rawOutput as unknown as ConceptOutput
  let y = 50

  doc.fontSize(18).font('Helvetica-Bold').fillColor(BLACK)
    .text(output.concept || 'Concept', L, y, { width: W, align: 'center' })
  y = doc.y + 2

  const metaItems = [output.subject, output.gradeLevel].filter(Boolean)
  if (metaItems.length) {
    doc.fontSize(10).font('Helvetica').fillColor(GREY)
      .text(metaItems.join('  ·  '), L, y, { width: W, align: 'center' })
    y = doc.y + 2
  }

  hline(doc, y + 4)
  doc.y = y + 12

  const successful = output.explanations?.filter((e) => e.success) || []

  successful.forEach((exp) => {
    if (doc.y > doc.page.height - 120) doc.addPage()

    const cardY = doc.y
    doc.rect(L, cardY, 3, 18).fill(ORANGE)
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(ORANGE)
      .text(exp.label.toUpperCase(), L + 10, cardY + 5)
    doc.y = cardY + 22

    if (exp.title) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor(BLACK).text(exp.title, L, doc.y, { width: W })
      doc.moveDown(0.2)
    }

    doc.fontSize(9).font('Helvetica').fillColor('#333333').text(exp.content || '', L, doc.y, { width: W })
    doc.moveDown(0.4)

    if (exp.keyPoints?.length) {
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GREY).text('KEY POINTS')
      doc.moveDown(0.2)
      exp.keyPoints.forEach((pt, j) => {
        const ptY = doc.y
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor(ORANGE).text(`${j + 1}.`, L, ptY, { width: 14 })
        doc.fontSize(8.5).font('Helvetica').fillColor('#333333').text(pt, L + 14, ptY, { width: W - 14 })
        doc.moveDown(0.3)
      })
    }

    doc.moveDown(0.4)
    hline(doc, doc.y)
    doc.moveDown(0.6)
  })
}

// ─── DOCX generators ─────────────────────────────────────────────────────────

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'ffffff' }

const p = (text: string, opts: Record<string, unknown> = {}): Paragraph =>
  new Paragraph({ children: [new TextRun({ text: text || '', ...opts } as unknown as ConstructorParameters<typeof TextRun>[0])] })

const gap = (): Paragraph => new Paragraph({})

const generateAssignmentDOCX = (rawOutput: Record<string, unknown>, includeAnswers: boolean): Document => {
  const output = rawOutput as unknown as AssignmentOutput
  const sections = groupByType(output.questions as Question[])
  const presentSections = SECTION_ORDER.filter((t) => sections[t]?.length)

  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: output.title || 'Assignment', bold: true, size: 36 })] }),
    new Paragraph({ children: [new TextRun({ text: [output.subject, output.gradeLevel, `${output.totalMarks} marks`, output.estimatedTime, output.dueDate ? `Due: ${output.dueDate}` : null].filter(Boolean).join('  ·  '), color: '777777', size: 18 })] }),
    gap(),
    p('Instructions: Attempt all questions. Show all working where applicable.', { italics: true, color: '555555', size: 18 }),
    gap(),
  ]

  let globalNum = 1
  presentSections.forEach((type, secIdx) => {
    const qs = sections[type]
    const sectionMarks = qs.reduce((s, q) => s + (q.marks || 0), 0)
    children.push(new Paragraph({ children: [new TextRun({ text: `Section ${String.fromCharCode(65 + secIdx)}: ${SECTION_NAMES[type]}  (${sectionMarks} marks)`, bold: true, color: 'FF5841', size: 22 })] }))
    children.push(gap())

    qs.forEach((q) => {
      children.push(new Paragraph({ children: [new TextRun({ text: `${globalNum}. `, bold: true }), new TextRun({ text: q.question }), new TextRun({ text: `  [${q.marks}m]`, color: '888888', size: 16 })] }))
      q.options?.forEach((opt, j) => children.push(p(`     ${String.fromCharCode(65 + j)}.  ${opt}`, { color: '444444', size: 18 })))
      children.push(gap())
      globalNum++
    })
    children.push(gap())
  })

  if (includeAnswers) {
    children.push(new Paragraph({ children: [new TextRun({ text: 'Answer Key', bold: true, size: 32, color: 'FF5841' })] }))
    children.push(gap())
    let ansNum = 1
    presentSections.forEach((type, secIdx) => {
      children.push(new Paragraph({ children: [new TextRun({ text: `Section ${String.fromCharCode(65 + secIdx)} — ${SECTION_NAMES[type]}`, bold: true, size: 20 })] }))
      sections[type].forEach((q) => {
        children.push(new Paragraph({ children: [new TextRun({ text: `${ansNum}. `, bold: true }), new TextRun({ text: q.answer || '—', color: '2563EB' })] }))
        if (q.explanation) children.push(p(`   ${q.explanation}`, { color: '555555', size: 16, italics: true }))
        ansNum++
      })
      children.push(gap())
    })
  }

  return new Document({ sections: [{ children }] })
}

const generateLessonPlanDOCX = (rawOutput: Record<string, unknown>): Document => {
  const output = rawOutput as unknown as LessonPlanOutput
  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: output.title || 'Lesson Plan', bold: true, size: 36 })] }),
    p([output.subject, output.gradeLevel, `${output.numberOfDays} days`, output.classDuration].filter(Boolean).join(' · '), { color: '777777', size: 18 }),
    gap(),
  ]
  if (output.overview) { children.push(p(output.overview, { color: '444444', italics: true })); children.push(gap()) }

  output.days?.forEach((day) => {
    children.push(new Paragraph({ children: [new TextRun({ text: `Day ${day.day}  —  ${day.topic}`, bold: true, size: 26, color: 'FF5841' })] }))
    if (day.objectives?.length) {
      children.push(p('Objectives', { bold: true, color: '888888', size: 16 }))
      day.objectives.forEach((obj) => children.push(p(`• ${obj}`, { size: 18 })))
    }
    const acts: Array<[string, string | undefined]> = [
      ['Warm Up', day.warmUp],
      ['Main Activity', day.mainActivity],
      ['Wrap Up', day.wrapUp],
    ]
    acts.forEach(([label, value]) => {
      if (!value) return
      children.push(p(label, { bold: true, color: 'FF5841', size: 16 }))
      children.push(p(value, { size: 18 }))
    })
    if (day.materials?.length) {
      children.push(p('Materials', { bold: true, color: '888888', size: 16 }))
      children.push(p(day.materials.join(' · '), { size: 16 }))
    }
    if (day.homework) {
      children.push(p('Homework', { bold: true, color: 'FF5841', size: 16 }))
      children.push(p(day.homework, { size: 18 }))
    }
    children.push(gap())
  })

  return new Document({ sections: [{ children }] })
}

const generateConceptDOCX = (rawOutput: Record<string, unknown>): Document => {
  const output = rawOutput as unknown as ConceptOutput
  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: output.concept || 'Concept', bold: true, size: 40 })] }),
    p([output.subject, output.gradeLevel].filter(Boolean).join(' · '), { color: '777777', size: 18 }),
    gap(),
  ]
  output.explanations?.filter((e) => e.success).forEach((exp) => {
    children.push(new Paragraph({ children: [new TextRun({ text: exp.label, bold: true, size: 26, color: 'FF5841' })] }))
    if (exp.title) children.push(new Paragraph({ children: [new TextRun({ text: exp.title, bold: true, size: 22 })] }))
    if (exp.content) children.push(p(exp.content, { size: 18 }))
    exp.keyPoints?.forEach((pt, i) => children.push(p(`${i + 1}.  ${pt}`, { size: 16, color: '444444' })))
    children.push(gap())
  })
  return new Document({ sections: [{ children }] })
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export const exportPDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { contentId, includeAnswers = false } = req.body
    const content = await GeneratedContent.findOne({ _id: contentId, userId: req.user._id })
    if (!content) {
      res.status(404).json({ success: false, message: 'Content not found' })
      return
    }

    const output = content.output as Record<string, unknown>
    const filename = `${safeFilename(output?.title ?? output?.concept)}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`)

    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    doc.pipe(res)

    const input = content.input as Record<string, unknown>
    if (content.type === 'assignment')     generateAssignmentPDF(doc, output, includeAnswers, (input?.schoolName as string) || '')
    else if (content.type === 'lessonPlan')    generateLessonPlanPDF(doc, output)
    else if (content.type === 'conceptExplain') generateConceptPDF(doc, output)

    doc.end()
  } catch (err) {
    next(err)
  }
}

export const exportDOCX = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { contentId, includeAnswers = false } = req.body
    const content = await GeneratedContent.findOne({ _id: contentId, userId: req.user._id })
    if (!content) {
      res.status(404).json({ success: false, message: 'Content not found' })
      return
    }

    const output = content.output as Record<string, unknown>
    let docxDoc: Document | undefined

    if (content.type === 'assignment')        docxDoc = generateAssignmentDOCX(output, includeAnswers)
    else if (content.type === 'lessonPlan')   docxDoc = generateLessonPlanDOCX(output)
    else if (content.type === 'conceptExplain') docxDoc = generateConceptDOCX(output)
    else {
      res.status(400).json({ success: false, message: 'Export not supported for this type' })
      return
    }

    const buffer = await Packer.toBuffer(docxDoc)
    const filename = `${safeFilename(output?.title ?? output?.concept)}.docx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  } catch (err) {
    next(err)
  }
}

// suppress unused import warning
void noBorder
