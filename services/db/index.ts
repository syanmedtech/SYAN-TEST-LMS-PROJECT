
import * as mockService from '../mockService';
import * as firestoreService from './firestore';
import { DATA_SOURCE } from '../../config/dataSource';
import { Topic, Paper, Question, AppSettings } from '../../types';

/**
 * Unified Hierarchy Fetching
 */
export const dbGetHierarchy = async (): Promise<Topic[]> => {
  if (DATA_SOURCE === 'firestore') {
    try {
      return await firestoreService.fsGetHierarchy();
    } catch (e) {
      console.warn("Firestore failed, falling back to mock", e);
      return mockService.getHierarchy();
    }
  }
  return mockService.getHierarchy();
};

/**
 * Unified Papers/Mock Exams Fetching
 */
export const dbGetPapers = async (): Promise<Paper[]> => {
  if (DATA_SOURCE === 'firestore') {
    try {
      return await firestoreService.fsGetPapers();
    } catch (e) {
      console.warn("Firestore failed, falling back to mock", e);
      return mockService.getPapers();
    }
  }
  return mockService.getPapers();
};

/**
 * Fetch questions for a specific mock paper
 */
export const dbGetQuestionsByPaper = async (paperId: string): Promise<Question[]> => {
  if (DATA_SOURCE === 'firestore') {
    try {
      return await firestoreService.fsGetQuestionsByPaper(paperId);
    } catch (e) {
      console.warn("Firestore failed, falling back to mock", e);
      return mockService.getQuestions([paperId]);
    }
  }
  return mockService.getQuestions([paperId]);
};

/**
 * Fetch questions filtered by specific topic IDs
 */
export const dbGetQuestionsByFilters = async (topicIds: string[]): Promise<Question[]> => {
  if (DATA_SOURCE === 'firestore') {
    try {
      // Special case for 'random' mock logic often used in the app
      if (topicIds.includes('random')) {
         return mockService.getQuestions(['random']);
      }
      return await firestoreService.fsGetQuestionsByFilters(topicIds);
    } catch (e) {
      console.warn("Firestore failed, falling back to mock", e);
      return mockService.getQuestions(topicIds);
    }
  }
  return mockService.getQuestions(topicIds);
};

/**
 * Fetch all questions (Admin use)
 */
export const dbGetAllQuestions = async (): Promise<Question[]> => {
  if (DATA_SOURCE === 'firestore') {
    try {
      return await mockService.getAllQuestions(); 
    } catch (e) {
      return mockService.getAllQuestions();
    }
  }
  return mockService.getAllQuestions();
};

/**
 * Global App Settings
 */
export const dbGetAppSettings = async (): Promise<AppSettings> => {
  const defaultSettings: AppSettings = {
    maintenanceMode: false,
    allowAIQuestionGen: true,
    defaultDifficulty: 'Medium',
    updatedAt: Date.now()
  };

  if (DATA_SOURCE === 'firestore') {
    try {
      const remote = await firestoreService.fsGetAppSettings();
      return remote || defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  }
  
  const local = localStorage.getItem('app_settings');
  return local ? JSON.parse(local) : defaultSettings;
};

export const dbSaveAppSettings = async (settings: AppSettings) => {
  localStorage.setItem('app_settings', JSON.stringify(settings));
  
  if (DATA_SOURCE === 'firestore') {
    try {
      await firestoreService.fsSaveAppSettings(settings);
    } catch (e) {
      console.error("Failed to save remote settings", e);
    }
  }
};
