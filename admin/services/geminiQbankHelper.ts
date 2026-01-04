import { GoogleGenAI, Type } from "@google/genai";
import { QBankQuestion } from "./qbankAdminService";

/* Fixed initialization to use process.env.API_KEY directly per guidelines */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const helperSchema = {
  type: Type.OBJECT,
  properties: {
    stem: { type: Type.STRING, description: "The improved or paraphrased clinical scenario." },
    explanation: { type: Type.STRING, description: "The improved clinical explanation." },
  },
};

export const runAiMedicalAssistant = async (
  task: 'improve_explanation' | 'paraphrase_stem',
  question: Partial<QBankQuestion>
) => {
  if (!process.env.API_KEY) {
    throw new Error("AI Assistant requires a valid API key. Please configure the system environment.");
  }

  const prompt = task === 'improve_explanation'
    ? `You are an expert medical professor and editor for a high-stakes question bank (USMLE/PLAB/NEET PG).
       Improve the "explanation" for the medical question provided below.
       - Ensure the explanation follows a clinical reasoning path.
       - Explain why the correct answer is the best choice.
       - Briefly mention why the distractors are incorrect if applicable.
       - Maintain a professional, academic tone.
       - DO NOT change the medical facts or the correct answer.

       STEM: ${question.stem}
       OPTIONS: ${JSON.stringify(question.options)}
       CURRENT EXPLANATION: ${question.explanation}`
    : `You are an expert medical scenario author. 
       Paraphrase the "stem" of the medical question provided below.
       - Use a standard board-style structure (Demographics, Chief Complaint, HPI, PE, Labs/Imaging).
       - Make it more concise and professional.
       - Maintain all relevant clinical findings and the core concept being tested.
       - DO NOT change the diagnostic outcome or the correct answer requirement.

       CURRENT STEM: ${question.stem}`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: helperSchema,
        temperature: 0.4,
      },
    });

    const data = JSON.parse(result.text || "{}");
    return data;
  } catch (error) {
    console.error("Gemini QBank Helper Error:", error);
    throw error;
  }
};