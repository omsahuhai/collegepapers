import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(request) {
  try {
    const { paper_id, exam, studyHours, completed, goal } = await request.json();

    if (!paper_id || !exam || typeof studyHours !== 'number' || typeof completed !== 'number' || !goal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch Paper details
    const { data: paperData, error: paperError } = await supabase
      .from('papers')
      .select('subject_name, subject_code')
      .eq('id', paper_id)
      .single();

    if (paperError || !paperData) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // 2. Fetch Intelligence and Questions
    const { data: intelligence } = await supabase
      .from('paper_intelligence')
      .select('syllabus_mapping, key_topics')
      .eq('paper_id', paper_id)
      .single();

    const { data: questions } = await supabase
      .from('paper_questions')
      .select('question_text, marks, syllabus_unit')
      .eq('paper_id', paper_id);

    // 3. Prepare Gemini API
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Define Schema
    const strategySchema = {
      type: Type.OBJECT,
      properties: {
        strategyTitle: { type: Type.STRING, description: "Catchy title for the plan, e.g. '6-Hour Survival Plan'" },
        confidence: { type: Type.INTEGER, description: "Percentage probability of passing (0-100)" },
        expectedMarks: {
          type: Type.OBJECT,
          properties: {
            minimum: { type: Type.INTEGER },
            maximum: { type: Type.INTEGER }
          }
        },
        riskLevel: { type: Type.STRING, description: "'Low', 'Medium', or 'High'" },
        focusTopics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3-5 topics to focus on" },
        skipTopics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Topics to completely ignore" },
        memorizeQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 high-yield questions to memorize" },
        revisionTimeline: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "e.g., 'Hour 1-2' or '6:00-7:00'" },
              task: { type: Type.STRING, description: "Actionable study task" }
            }
          }
        },
        examHallStrategy: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 actionable tips for writing the exam" },
        motivation: { type: Type.STRING, description: "A final emotional, encouraging quote or thought." }
      },
      required: ["strategyTitle", "confidence", "expectedMarks", "riskLevel", "focusTopics", "skipTopics", "memorizeQuestions", "revisionTimeline", "examHallStrategy", "motivation"]
    };

    const prompt = `
You are an experienced university professor and exam strategist.
The student is preparing only a few hours before the examination. Their objective is to maximize marks within the available time, not to study the complete syllabus.

Student Profile:
- Exam Timing: ${exam}
- Available Study Hours: ${studyHours} hours
- Completed Syllabus: ${completed}%
- Target Goal: ${goal}

Subject: ${paperData.subject_name} (${paperData.subject_code})

Provided Context:
- Syllabus Weightage: ${JSON.stringify(intelligence?.syllabus_mapping || {})}
- Recurring Key Topics: ${JSON.stringify(intelligence?.key_topics || [])}
- Past Questions Sample: ${JSON.stringify(questions?.slice(0, 10).map(q => q.question_text) || [])}

Produce a realistic, high-impact revision strategy.
Prioritize topics that provide the highest expected marks per hour of study based on the weightage. 
Recommend what to study, what to postpone, what questions to memorize, and how to spend the remaining ${studyHours} hours.
Avoid suggesting that the student study everything. Be honest about uncertainty.
Return only valid JSON matching the provided schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: strategySchema,
        temperature: 0.2, // low temperature for structured logic
      }
    });

    const resultText = response.text;
    const strategyData = JSON.parse(resultText);

    return NextResponse.json({ strategy: strategyData }, { status: 200 });

  } catch (err) {
    console.error("Pass Strategy Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
