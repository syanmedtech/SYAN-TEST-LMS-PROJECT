
import { MOCK_QUESTIONS, MOCK_TOPICS, MOCK_PAPERS } from '../data';
import { Question, Topic, User, Paper, Course, Instructor, VideoProgress, UserStatistics, BookmarkItem, StudyTask, StudyGoal } from '../types';

const DELAY = 600;

// --- MOCK COURSE DATA ---

export const MOCK_COURSES: Course[] = [
    {
        id: 'c1',
        title: 'Medicine',
        examCategory: 'MBBS',
        author: 'Dr. Sarah Ahmed',
        thumbnailUrl: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg',
        stats: { videos: 120, quizzes: 45, notes: 30 },
        relatedTopicId: 't2', // Physiology (Example mapping)
        chapters: [
            {
                id: 'ch1',
                title: 'Respiratory System',
                topics: [
                    {
                        id: 't1-1',
                        title: 'Asthma Management',
                        duration: 900,
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        notesContent: `
                            <h1>Asthma Management</h1>
                            <p>Asthma is a chronic inflammatory disorder of the airways characterized by:</p>
                            <ul>
                                <li>Recurrent episodes of wheezing</li>
                                <li>Breathlessness</li>
                                <li>Chest tightness</li>
                                <li>Coughing</li>
                            </ul>
                            <h3>Treatment Steps:</h3>
                            <p>1. SABA (Short-acting beta agonists)</p>
                            <p>2. ICS (Inhaled Corticosteroids)</p>
                        `,
                        isPremium: false,
                        isCompleted: false
                    },
                    {
                        id: 't1-2',
                        title: 'COPD vs Asthma',
                        duration: 1200,
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                        notesContent: '<h1>COPD vs Asthma</h1><p>Key differences in onset, pathology, and reversibility.</p>',
                        isPremium: true,
                        isCompleted: false
                    },
                    {
                        id: 't1-3',
                        title: 'Pneumonia Classifications',
                        duration: 800,
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                        isPremium: false,
                        isCompleted: true
                    }
                ]
            },
            {
                id: 'ch2',
                title: 'Cardiovascular System',
                topics: [
                    {
                        id: 't2-1',
                        title: 'Heart Failure Guidelines',
                        duration: 1500,
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                        isPremium: true,
                        isCompleted: false
                    }
                ]
            }
        ]
    },
    {
        id: 'c2',
        title: 'Surgery',
        examCategory: 'MBBS',
        author: 'Dr. Bilal Khan',
        thumbnailUrl: 'https://img.freepik.com/free-vector/surgery-background-design_1212-364.jpg',
        stats: { videos: 85, quizzes: 20, notes: 85 },
        chapters: []
    },
    {
        id: 'c3',
        title: 'Anatomy',
        examCategory: 'FCPS',
        author: 'Dr. Ayesha Alvi',
        stats: { videos: 200, quizzes: 100, notes: 50 },
        chapters: []
    },
    {
        id: 'c4',
        title: 'Cardiology',
        examCategory: 'NRE',
        author: 'Dr. Steve Rogers',
        // Fix: Changed 'navigator' to 'notes' to match the Course interface defined in types.ts
        stats: { videos: 40, quizzes: 10, notes: 10 },
        chapters: []
    }
];

export const MOCK_VIDEO_PROGRESS: VideoProgress[] = [];

export const mockLogin = async (username: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock subscription logic
      const now = Date.now();
      const expiry = now + (1000 * 60 * 60 * 24 * 180); // 180 days from now
      const is_admin = username.toLowerCase().includes('admin');

      resolve({
        id: is_admin ? 'admin_001' : 'user_123',
        name: is_admin ? 'System Admin' : (username || 'Medical Student'),
        role: is_admin ? 'admin' : 'student',
        email: username.includes('@') ? username : `${username.replace(/\s+/g, '').toLowerCase()}@med.edu.pk`,
        token: 'mock_jwt_token',
        phone: '0300-1234567',
        cnic: '42101-1234567-1',
        city: 'Karachi',
        college: 'Dow University of Health Sciences',
        specialty: 'MBBS',
        graduationYear: '2025',
        gender: 'Male',
        address: 'Block 4, Clifton, Karachi',
        subscription: {
            planName: is_admin ? 'Admin Access' : 'Syan Elite Pack',
            expiryDate: expiry,
            status: 'active',
            autoRenew: true,
            billingCycle: 'yearly',
            price: 15000
        }
      });
    }, DELAY);
  });
};

export const getHierarchy = async (): Promise<Topic[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TOPICS);
    }, DELAY);
  });
};

export const getPapers = async (): Promise<Paper[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_PAPERS);
        }, DELAY);
    });
};

export const getQuestions = async (topicIds: string[]): Promise<Question[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_QUESTIONS);
    }, DELAY);
  });
};

export const getAllQuestions = async (): Promise<Question[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_QUESTIONS);
    }, DELAY);
  });
};

export const getCourses = async (): Promise<Course[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_COURSES), DELAY);
    });
};

export const getUserVideoProgress = async (): Promise<VideoProgress[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_VIDEO_PROGRESS), DELAY);
    });
};

export const getStatistics = async (): Promise<UserStatistics> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                totalQuestions: 1450,
                totalCorrect: 980,
                accuracy: 67.5,
                totalTimeSeconds: 54000, // 15 hours
                averageSpeedSeconds: 45,
                categoryPerformance: [
                    { category: 'Anatomy', correct: 180, total: 200, percentage: 90 },
                    { category: 'Physiology', correct: 150, total: 250, percentage: 60 },
                    { category: 'Pathology', correct: 200, total: 300, percentage: 66 },
                    { category: 'Pharmacology', correct: 100, total: 200, percentage: 50 },
                    { category: 'Medicine', correct: 250, total: 350, percentage: 71 },
                    { category: 'Surgery', correct: 100, total: 150, percentage: 66 },
                ],
                weakAreas: ['Renal Physiology', 'Neuroanatomy', 'Anti-arrhythmic Drugs'],
                streak: {
                    currentStreak: 5,
                    maxStreak: 14,
                    lastStudyDate: Date.now(),
                    activityMap: Array.from({length: 30}, (_, i) => ({
                        date: new Date(Date.now() - (29-i)*86400000).toISOString(),
                        count: Math.random() > 0.3 ? Math.floor(Math.random() * 50) : 0
                    }))
                },
                difficultyStats: {
                    easy: 85,
                    medium: 65,
                    hard: 45
                },
                monthlyProgress: [
                    { month: 'Jan', score: 45 },
                    { month: 'Feb', score: 52 },
                    { month: 'Mar', score: 58 },
                    { month: 'Apr', score: 62 },
                    { month: 'May', score: 68 },
                    { month: 'Jun', score: 67 }
                ]
            });
        }, DELAY);
    });
};

export const getBookmarks = async (): Promise<BookmarkItem[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { 
                    id: 'b1', 
                    type: 'QUESTION', 
                    title: 'A 24-year-old male presents with inability to abduct his arm beyond 15 degrees.', 
                    subtitle: 'Anatomy > Upper Limb', 
                    dateAdded: Date.now() - 86400000, 
                    referenceId: 'q1' 
                },
                { 
                    id: 'b2', 
                    type: 'VIDEO', 
                    title: 'Asthma Management Guidelines', 
                    subtitle: 'Medicine > Respiratory', 
                    dateAdded: Date.now() - 172800000, 
                    referenceId: 't1-1',
                    contextId: 'c1'
                },
                { 
                    id: 'b3', 
                    type: 'QUESTION', 
                    title: 'Which of the following passes through the quadrangular space?', 
                    subtitle: 'Anatomy > Upper Limb', 
                    dateAdded: Date.now() - 250000000, 
                    referenceId: 'q2' 
                }
            ]);
        }, DELAY);
    });
};

export const getStudyTasks = async (): Promise<StudyTask[]> => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: '1', title: 'Review Anatomy - Upper Limb', date: today, type: 'READING', durationMins: 45, isCompleted: true, priority: 'HIGH', category: 'Topic revision' },
                { id: '2', title: 'Watch Asthma Video', date: today, type: 'VIDEO', durationMins: 20, isCompleted: false, priority: 'MEDIUM', category: 'Video lecture' },
                { id: '3', title: 'Solve 20 MCQs on CVS', date: today, type: 'QUIZ', durationMins: 30, isCompleted: false, priority: 'HIGH', category: 'QBank practice' },
                { id: '4', title: 'Physiology Flashcards', date: tomorrow, type: 'REVISION', durationMins: 15, isCompleted: false, priority: 'LOW', category: 'Flashcards' },
            ]);
        }, DELAY);
    });
};

export const getStudyGoals = async (): Promise<StudyGoal[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'g1', title: 'Finish Respiratory Module', deadline: '2024-12-31', targetPercent: 100, currentPercent: 65, type: 'MONTHLY', subject: 'Medicine' },
                { id: 'g2', title: 'Daily 50 MCQs', deadline: '2024-10-25', targetPercent: 50, currentPercent: 20, type: 'DAILY' },
                { id: 'g3', title: 'FCPS Part 1 Prep', deadline: '2025-06-01', targetPercent: 100, currentPercent: 15, type: 'EXAM' }
            ]);
        }, DELAY);
    });
};

export const generateSmartStudyPlan = async (examType: string, hours: number): Promise<StudyTask[]> => {
    // Simulating AI generation
    const today = new Date();
    const tasks: StudyTask[] = [];
    
    // Generate 3 days of tasks
    for(let i=0; i<3; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        
        tasks.push({
            id: `ai_plan_${i}_1`,
            title: `Review ${examType} High Yield Topics`,
            date: dateStr,
            type: 'READING',
            durationMins: 60,
            isCompleted: false,
            priority: 'HIGH',
            category: 'Smart Plan'
        });
        tasks.push({
            id: `ai_plan_${i}_2`,
            title: `Practice Quiz: ${i === 0 ? 'Anatomy' : i === 1 ? 'Physiology' : 'Pathology'}`,
            date: dateStr,
            type: 'QUIZ',
            durationMins: 45,
            isCompleted: false,
            priority: 'MEDIUM',
            category: 'Smart Plan'
        });
    }
    
    return new Promise(resolve => setTimeout(() => resolve(tasks), 1500));
};
