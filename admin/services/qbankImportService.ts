
import { QBankQuestion, QuestionType, QuestionDifficulty, QuestionStatus } from "./qbankAdminService";

export interface ColumnMapping {
  stem: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
  difficulty: string;
  subject: string;
  topic: string;
  subtopic: string;
  tags: string;
  uniqueId?: string;
  status?: string;
}

export const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.split(/\r?\n/);
  return lines
    .map(line => {
      // Basic CSV parser that handles quoted values
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    })
    .filter(row => row.length > 1 || (row.length === 1 && row[0] !== ''));
};

export const mapRowToQuestion = (
  row: Record<string, string>, 
  mapping: ColumnMapping
): Partial<QBankQuestion> => {
  const options = [
    { text: row[mapping.optionA] || "", isCorrect: false },
    { text: row[mapping.optionB] || "", isCorrect: false },
    { text: row[mapping.optionC] || "", isCorrect: false },
    { text: row[mapping.optionD] || "", isCorrect: false },
  ].filter(o => o.text !== "");

  // Correct option handling (e.g., 'A', '1', or actual text)
  const correctVal = (row[mapping.correctOption] || "").toUpperCase();
  const correctIdx = ['A', 'B', 'C', 'D'].indexOf(correctVal[0]);
  
  if (correctIdx !== -1 && options[correctIdx]) {
    options[correctIdx].isCorrect = true;
  } else {
    // Try matching by text if direct index fails
    const match = options.find(o => o.text.toUpperCase() === correctVal);
    if (match) match.isCorrect = true;
  }

  const tags = (row[mapping.tags] || "").split(',').map(t => t.trim()).filter(t => t !== "");

  return {
    id: mapping.uniqueId ? row[mapping.uniqueId] : undefined,
    stem: row[mapping.stem] || "",
    options,
    explanation: row[mapping.explanation] || "",
    type: "mcq",
    difficulty: (row[mapping.difficulty]?.toLowerCase() as QuestionDifficulty) || "medium",
    status: (row[mapping.status]?.toLowerCase() as QuestionStatus) || "draft",
    subjectName: row[mapping.subject] || "",
    topicName: row[mapping.topic] || "",
    subtopicName: row[mapping.subtopic] || "",
    tags,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
};

export const saveMappingPreset = (mapping: ColumnMapping) => {
  localStorage.setItem("qbankImportMapping", JSON.stringify(mapping));
};

export const getMappingPreset = (): ColumnMapping | null => {
  const saved = localStorage.getItem("qbankImportMapping");
  return saved ? JSON.parse(saved) : null;
};
