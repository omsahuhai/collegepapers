import { GoogleGenAI, Type, Schema } from '@google/genai';

// Initialize the GenAI client (requires GEMINI_API_KEY in environment variables)
const ai = new GoogleGenAI({});

export async function analyzePaper(paperText, subjectName) {
  // Define the strict output schema for the paper intelligence
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      paper_intelligence: {
        type: Type.OBJECT,
        properties: {
          syllabus_mapping: {
            type: Type.OBJECT,
            description: "Map of syllabus units to their percentage weightage based on marks. E.g. {'Unit I': 35, 'Unit II': 25}",
          },
          key_topics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3-5 core recurring topics from the paper.",
          }
        },
        required: ["syllabus_mapping", "key_topics"],
      },
      paper_questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            section: { type: Type.STRING, description: "Section name, e.g. 'A' or 'B'" },
            question_type: { type: Type.STRING, description: "'MCQ', 'Short Answer', or 'Descriptive'" },
            question_text: { type: Type.STRING, description: "The full question text." },
            marks: { type: Type.INTEGER, description: "Marks allocated to this question." },
            syllabus_unit: { type: Type.STRING, description: "The primary syllabus unit this question belongs to, e.g. 'Unit I'" },
            model_answer: { 
              type: Type.OBJECT, 
              description: "Structured model answer. For MCQ: { answer, explanation }. For others: { points: [], diagrams: [], conclusion: '' }" 
            }
          },
          required: ["section", "question_type", "question_text", "marks", "syllabus_unit", "model_answer"]
        }
      }
    },
    required: ["paper_intelligence", "paper_questions"],
  };

  const prompt = `
You are an expert university examiner for the subject: ${subjectName}.
Analyze the following raw text extracted from a past university exam paper.
Extract all questions, assign them to syllabus units based on standard computer science curriculum, and generate precise marking-scheme compliant model answers.

For MCQs, provide the correct option and a brief explanation.
For Short Answers, provide 100-word structured points.
For Descriptive Answers, provide 350-word detailed structures with key points and diagram suggestions if applicable.

Paper Text:
${paperText}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2, // Low temp for more deterministic, structured output
      }
    });

    return JSON.parse(response.text());
  } catch (error) {
    console.error("AI Extractor Error:", error);
    throw error;
  }
}
