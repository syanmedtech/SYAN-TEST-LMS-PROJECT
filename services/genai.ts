
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Question, StudyPreferences, StudyTask } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for generating strict JSON questions
const questionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING, description: "The clinical vignette or question text." },
      options: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, enum: ["a", "b", "c", "d"] },
            text: { type: Type.STRING }
          },
          required: ["id", "text"]
        }
      },
      correctAnswer: { type: Type.STRING, enum: ["a", "b", "c", "d"] },
      explanation: { type: Type.STRING, description: "Detailed medical explanation of why the correct answer is right and others are wrong." },
      difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
    },
    required: ["text", "options", "correctAnswer", "explanation", "difficulty"]
  }
};

export const generateQuizQuestions = async (
  topics: string[], 
  count: number = 5,
  difficulties: string[] = ['Easy', 'Medium', 'Hard']
): Promise<Question[]> => {
  try {
    const topicStr = topics.join(", ");
    const difficultyStr = difficulties.join(", ");
    
    const prompt = `Generate ${count} multiple-choice medical questions for a medical student specializing in: ${topicStr}. 
    Difficulty Level: ${difficultyStr}.
    Focus on clinical scenarios, high-yield concepts, and board-style questions (USMLE/PLAB/NEET PG style).`;

    // Fix: Using gemini-3-pro-preview for complex medical question generation task
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.7,
      },
    });

    const rawQuestions = JSON.parse(response.text || "[]");

    // Map to our internal Question type, adding IDs and mock stats
    return rawQuestions.map((q: any, index: number) => ({
      id: `ai_${Date.now()}_${index}`,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      topicId: topics[0] || 'general',
      isAiGenerated: true,
      difficulty: q.difficulty || 'Medium',
      totalAttempts: Math.floor(Math.random() * 10000) + 500, // Random attempts for realism
      // AI cannot generate real community stats, so we mock plausible distribution favoring the correct answer slightly
      communityStats: {
        a: q.correctAnswer === 'a' ? 65 : 10,
        b: q.correctAnswer === 'b' ? 65 : 10,
        c: q.correctAnswer === 'c' ? 65 : 10,
        d: q.correctAnswer === 'd' ? 65 : 10,
      }
    }));
  } catch (error) {
    console.error("GenAI Error:", error);
    throw new Error("Failed to generate questions. Please try again.");
  }
};

export const createTutorChat = (question: Question, userAnswer?: string): Chat => {
  const systemPrompt = `You are an expert medical professor and tutor. 
  The student is reviewing a question they just answered.
  
  Question: "${question.text}"
  Options: ${JSON.stringify(question.options)}
  Correct Answer: ${question.correctAnswer}
  Explanation: ${question.explanation}
  Student's Answer: ${userAnswer || "Not answered"}

  Your goal is to help the student understand the underlying concepts. 
  Be encouraging, precise, and clinical. If they got it wrong, help them understand the gap in their knowledge without just repeating the explanation.
  Keep responses concise (under 150 words) unless asked for deep detail.`;

  // Fix: Using gemini-3-pro-preview for complex medical tutoring chat
  return ai.chats.create({
    model: "gemini-3-pro-preview",
    config: {
      systemInstruction: systemPrompt,
    }
  });
};

const studyPlanSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['QUIZ', 'VIDEO', 'READING', 'REVISION'] },
      durationMins: { type: Type.NUMBER },
      priority: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
      date: { type: Type.STRING, description: "YYYY-MM-DD" },
      notes: { type: Type.STRING }
    },
    required: ['title', 'type', 'durationMins', 'priority', 'date']
  }
};

export const generateAiStudyPlan = async (
    examName: string,
    daysLeft: number,
    topicsRemaining: string[],
    quizzesRemaining: number,
    dailyHours: number,
    isExamMode: boolean,
    focusAreas: string[]
): Promise<StudyTask[]> => {
  try {
    const topicList = topicsRemaining.join(', ');
    const modeInstruction = isExamMode 
        ? "URGENT: Exam is in less than 2 weeks. Focus on high-yield revision, rapid fire quizzes, and exam simulation. Do not schedule long reading sessions." 
        : "Standard preparation mode. Balance concept learning (Reading/Video) with practice (Quizzes).";

    const prompt = `Create a daily study plan for today and tomorrow for a student preparing for ${examName}.
    
    Context:
    - Days until exam: ${daysLeft}
    - Topics to cover: ${topicList}
    - Quizzes remaining to solve: ${quizzesRemaining}
    - Daily Study Budget: ${dailyHours} hours
    - Identified Weak Areas: ${focusAreas.join(', ')}

    Instructions:
    - ${modeInstruction}
    - Allocate time based on priority. Weak areas get more time.
    - If quizzes are remaining, schedule at least one quiz block.
    - Suggest break intervals (e.g. Pomodoro 25m/5m).
    
    Output strictly JSON array of tasks.`;

    // Fix: Using gemini-3-flash-preview for basic text reasoning task (study planning)
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: studyPlanSchema,
        temperature: 0.7,
      },
    });

    const rawTasks = JSON.parse(response.text || "[]");
    
    return rawTasks.map((t: any, i: number) => ({
      ...t,
      id: `ai_smart_plan_${Date.now()}_${i}`,
      isCompleted: false,
      category: 'Smart Schedule'
    }));
  } catch (error) {
    console.error("GenAI Plan Error:", error);
    return [];
  }
};
