
import { doc, setDoc, deleteDoc, collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { FEATURES } from "../../config/features";
import { MockPaper } from "../../admin/services/mockPaperAdminService";

/**
 * Syncs a Mock Paper configuration to the student-side 'exams' collection.
 * This is used for compatibility with student-side logic that consumes from /exams.
 */
export const syncMockPaperToExam = async (paper: MockPaper) => {
  if (!FEATURES.mockPapersEnabled) return;

  // Check if /exams is a used collection in this environment to prevent cluttering unused collections
  const examsExist = await checkExamsCollectionActive();
  if (!examsExist) return;

  const examRef = doc(db, "exams", paper.id);

  if (paper.status === 'published') {
    // Upsert to exams collection
    await setDoc(examRef, {
      sourceType: "mockPaper",
      sourceId: paper.id,
      title: paper.title,
      description: paper.description || "",
      durationMinutes: paper.durationMinutes,
      totalQuestions: paper.totalQuestions,
      totalSections: paper.totalSections,
      targetProgramId: paper.targetProgramId || "",
      targetProgramName: paper.targetProgramName || "",
      instructions: paper.instructions || "",
      status: "published",
      updatedAt: Date.now(),
      // We store a copy of sections for student-side performance
      sections: paper.sections.map(s => ({
        id: s.id,
        title: s.title,
        questionCount: s.questionCount,
        durationMinutes: s.durationMinutes,
        negativeMarking: s.negativeMarking
      }))
    }, { merge: true });
  } else {
    // If unpublished or archived, remove from active exams list
    // This allows the admin to keep the paper draft but hide it from students
    await deleteDoc(examRef);
  }
};

/**
 * Simple check to see if the 'exams' collection actually has data.
 * Used to avoid creating a new collection if the system doesn't use /exams.
 */
const checkExamsCollectionActive = async (): Promise<boolean> => {
  try {
    const q = query(collection(db, "exams"), limit(1));
    const snap = await getDocs(q);
    // If it exists or is specifically allowed for this new bridge, return true
    return !snap.empty || FEATURES.mockPapersEnabled;
  } catch (e) {
    return false;
  }
};
