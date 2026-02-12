
import { GoogleGenAI, Type } from "@google/genai";
import { ExamData } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeExamFile = async (base64Data: string, mimeType: string): Promise<ExamData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Extract all MCQs and Subjective questions from this exam paper. Format as JSON. For MCQs, ensure you identify the correct answer. For subjective questions, provide key points that should be in the answer and a model answer."
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          mcqs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["id", "question", "options", "correctAnswer"],
            },
          },
          subjective: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                modelAnswer: { type: Type.STRING },
              },
              required: ["id", "question", "keyPoints", "modelAnswer"],
            },
          },
        },
        required: ["title", "mcqs", "subjective"],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}') as ExamData;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Invalid response format from AI");
  }
};

export const evaluateSubjectiveAnswer = async (question: string, modelAnswer: string, transcript: string): Promise<{ score: number; feedback: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Evaluate this student's spoken answer for the following question.
      Question: ${question}
      Model Answer: ${modelAnswer}
      Student Transcript: ${transcript}
      
      Give a score from 0 to 100 based on accuracy and completeness. Provide helpful feedback.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
        },
        required: ["score", "feedback"],
      },
    },
  });

  return JSON.parse(response.text || '{"score": 0, "feedback": "Evaluation failed"}');
};
