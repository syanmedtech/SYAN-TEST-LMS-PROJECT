
import { collectionGroup, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { fsGetDetailedStats } from "../../services/db/firestore";

export interface AnalyticsSummary {
  totalAttempts: number;
  avgScore: number;
  activeUsers: number;
  dailyAttempts: { date: string; count: number; avgScore: number }[];
  topExams: { name: string; count: number }[];
}

export interface DetailedAnalytics {
  avgTimePerQuestion: number;
  avgConfidence: number;
  timeVsCorrectness: { correct: number; incorrect: number }; // Avg seconds
  confidenceVsCorrectness: { correct: number; incorrect: number }; // Avg level
  slowestTopics: { id: string; avgTime: number }[];
  lowestAccuracyTopics: { id: string; accuracy: number; total: number }[];
}

export interface ExamMetric {
  id: string;
  name: string;
  attempts: number;
  avgScore: number;
  passRate: number;
  medianTimeMinutes: number;
}

export const fetchAnalyticsOverview = async (days: number): Promise<AnalyticsSummary> => {
  try {
    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const q = query(
      collectionGroup(db, "attempts"),
      where("timestamp", ">=", startTime),
      orderBy("timestamp", "asc")
    );

    const snap = await getDocs(q);
    const attempts = snap.docs.map(doc => doc.data());

    if (attempts.length === 0) {
      return { totalAttempts: 0, avgScore: 0, activeUsers: 0, dailyAttempts: [], topExams: [] };
    }

    // Aggregates
    const uniqueUsers = new Set(attempts.map(a => a.userId || 'anon')).size;
    const totalScore = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    
    // Daily Trends
    const dailyMap: Record<string, { count: number; totalScore: number }> = {};
    const examMap: Record<string, number> = {};

    attempts.forEach(a => {
      const date = new Date(a.timestamp).toISOString().split('T')[0];
      if (!dailyMap[date]) dailyMap[date] = { count: 0, totalScore: 0 };
      dailyMap[date].count++;
      dailyMap[date].totalScore += (a.percentage || 0);

      const examName = a.title || 'General Practice';
      examMap[examName] = (examMap[examName] || 0) + 1;
    });

    const dailyAttempts = Object.entries(dailyMap).map(([date, data]) => ({
      date,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count)
    }));

    const topExams = Object.entries(examMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalAttempts: attempts.length,
      avgScore: Math.round(totalScore / attempts.length),
      activeUsers: uniqueUsers,
      dailyAttempts,
      topExams
    };
  } catch (error) {
    console.error("Fetch Analytics Error:", error);
    throw error;
  }
};

export const fetchDetailedAnalytics = async (days: number): Promise<DetailedAnalytics> => {
  try {
    const details = await fsGetDetailedStats(days);
    
    if (details.length === 0) {
      return {
        avgTimePerQuestion: 0,
        avgConfidence: 0,
        timeVsCorrectness: { correct: 0, incorrect: 0 },
        confidenceVsCorrectness: { correct: 0, incorrect: 0 },
        slowestTopics: [],
        lowestAccuracyTopics: []
      };
    }

    let totalTime = 0;
    let totalConfidence = 0;
    let validConfidenceCount = 0;
    
    const splitTime = { c: 0, cCount: 0, i: 0, iCount: 0 };
    const splitConf = { c: 0, cCount: 0, i: 0, iCount: 0 };
    const topicMap: Record<string, { time: number; correct: number; total: number }> = {};

    details.forEach(d => {
      const time = d.timeSpentSeconds || 0;
      totalTime += time;
      
      if (d.confidenceLevel) {
        totalConfidence += d.confidenceLevel;
        validConfidenceCount++;
      }

      if (d.isCorrect) {
        splitTime.c += time;
        splitTime.cCount++;
        if (d.confidenceLevel) { splitConf.c += d.confidenceLevel; splitConf.cCount++; }
      } else {
        splitTime.i += time;
        splitTime.iCount++;
        if (d.confidenceLevel) { splitConf.i += d.confidenceLevel; splitConf.iCount++; }
      }

      if (d.topicId) {
        if (!topicMap[d.topicId]) topicMap[d.topicId] = { time: 0, correct: 0, total: 0 };
        topicMap[d.topicId].time += time;
        topicMap[d.topicId].total++;
        if (d.isCorrect) topicMap[d.topicId].correct++;
      }
    });

    const slowestTopics = Object.entries(topicMap)
      .map(([id, stats]) => ({ id, avgTime: Math.round(stats.time / stats.total) }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    const lowestAccuracyTopics = Object.entries(topicMap)
      .map(([id, stats]) => ({ id, accuracy: Math.round((stats.correct / stats.total) * 100), total: stats.total }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    return {
      avgTimePerQuestion: Math.round(totalTime / details.length),
      avgConfidence: validConfidenceCount > 0 ? parseFloat((totalConfidence / validConfidenceCount).toFixed(1)) : 0,
      timeVsCorrectness: {
        correct: splitTime.cCount > 0 ? Math.round(splitTime.c / splitTime.cCount) : 0,
        incorrect: splitTime.iCount > 0 ? Math.round(splitTime.i / splitTime.iCount) : 0
      },
      confidenceVsCorrectness: {
        correct: splitConf.cCount > 0 ? parseFloat((splitConf.c / splitConf.cCount).toFixed(1)) : 0,
        incorrect: splitConf.iCount > 0 ? parseFloat((splitConf.i / splitConf.iCount).toFixed(1)) : 0
      },
      slowestTopics,
      lowestAccuracyTopics
    };
  } catch (error) {
    console.error("Fetch Detailed Analytics Error:", error);
    throw error;
  }
};

export const fetchExamsPerformance = async (days: number): Promise<ExamMetric[]> => {
  try {
    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const q = query(
      collectionGroup(db, "attempts"),
      where("timestamp", ">=", startTime)
    );

    const snap = await getDocs(q);
    const attempts = snap.docs.map(doc => doc.data());

    const grouped: Record<string, any[]> = {};
    attempts.forEach(a => {
      const name = a.title || 'General Practice';
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(a);
    });

    return Object.entries(grouped).map(([name, list]) => {
      const avg = list.reduce((acc, curr) => acc + curr.percentage, 0) / list.length;
      const passed = list.filter(a => a.percentage >= 50).length;
      return {
        id: name, // Using name as ID for simplicity in mock/minimal mode
        name,
        attempts: list.length,
        avgScore: Math.round(avg),
        passRate: Math.round((passed / list.length) * 100),
        medianTimeMinutes: 45 // Dummy for now
      };
    });
  } catch (error) {
    console.error("Fetch Exams Metrics Error:", error);
    return [];
  }
};
