import { Question, Topic, Paper } from './types';

// Subject -> Topic -> Subtopic
export const MOCK_TOPICS: Topic[] = [
  {
    id: 't1',
    name: 'Anatomy',
    questionCount: 450,
    children: [
      { 
        id: 't1-1', 
        name: 'Upper Limb', 
        parentId: 't1', 
        questionCount: 120,
        children: [
            { id: 't1-1-1', name: 'Shoulder & Axilla', parentId: 't1-1', questionCount: 40 },
            { id: 't1-1-2', name: 'Arm & Cubital Fossa', parentId: 't1-1', questionCount: 30 },
            { id: 't1-1-3', name: 'Forearm & Hand', parentId: 't1-1', questionCount: 50 },
        ]
      },
      { 
        id: 't1-2', 
        name: 'Thorax', 
        parentId: 't1', 
        questionCount: 150,
        children: [
            { id: 't1-2-1', name: 'Thoracic Wall', parentId: 't1-2', questionCount: 50 },
            { id: 't1-2-2', name: 'Heart & Pericardium', parentId: 't1-2', questionCount: 60 },
            { id: 't1-2-3', name: 'Lungs & Pleura', parentId: 't1-2', questionCount: 40 },
        ] 
      },
      { 
        id: 't1-3', 
        name: 'Abdomen', 
        parentId: 't1', 
        questionCount: 180,
        children: [
            { id: 't1-3-1', name: 'Anterior Abdominal Wall', parentId: 't1-3', questionCount: 40 },
            { id: 't1-3-2', name: 'Peritoneum', parentId: 't1-3', questionCount: 40 },
            { id: 't1-3-3', name: 'Viscera', parentId: 't1-3', questionCount: 100 },
        ] 
      },
    ]
  },
  {
    id: 't2',
    name: 'Physiology',
    questionCount: 300,
    children: [
      { 
        id: 't2-1', 
        name: 'Cardiovascular', 
        parentId: 't2', 
        questionCount: 100,
        children: [
             { id: 't2-1-1', name: 'Cardiac Cycle', parentId: 't2-1', questionCount: 30 },
             { id: 't2-1-2', name: 'Hemodynamics', parentId: 't2-1', questionCount: 40 },
             { id: 't2-1-3', name: 'Regulation of BP', parentId: 't2-1', questionCount: 30 },
        ]
      },
      { 
        id: 't2-2', 
        name: 'Respiratory', 
        parentId: 't2', 
        questionCount: 100,
        children: [
             { id: 't2-2-1', name: 'Mechanics of Breathing', parentId: 't2-2', questionCount: 40 },
             { id: 't2-2-2', name: 'Gas Exchange', parentId: 't2-2', questionCount: 60 },
        ]
      },
    ]
  },
  {
    id: 't3',
    name: 'Pathology',
    questionCount: 250,
    children: [
      { 
        id: 't3-1', 
        name: 'General Pathology', 
        parentId: 't3', 
        questionCount: 100,
        children: [
            { id: 't3-1-1', name: 'Cell Injury', parentId: 't3-1', questionCount: 50 },
            { id: 't3-1-2', name: 'Inflammation', parentId: 't3-1', questionCount: 50 },
        ]
      },
      { 
        id: 't3-2', 
        name: 'Systemic Pathology', 
        parentId: 't3', 
        questionCount: 150,
        children: [
            { id: 't3-2-1', name: 'CVS Pathology', parentId: 't3-2', questionCount: 75 },
            { id: 't3-2-2', name: 'Resp Pathology', parentId: 't3-2', questionCount: 75 },
        ]
      },
    ]
  }
];

export const MOCK_PAPERS: Paper[] = [
    { id: 'p1', title: 'NEET PG 2024 - Mock 1', description: 'Comprehensive full syllabus mock exam focusing on clinical scenarios.', durationMins: 180, questionCount: 200, difficulty: 'Hard' },
    { id: 'p2', title: 'USMLE Step 1 - Anatomy Block', description: 'High-yield anatomy questions covering Upper Limb and Thorax.', durationMins: 60, questionCount: 40, difficulty: 'Medium' },
    { id: 'p3', title: 'Physiology Grand Test', description: 'Complete physiology assessment.', durationMins: 120, questionCount: 100, difficulty: 'Medium' },
    { id: 'p4', title: 'Pathology Rapid Review', description: 'Quick fire questions on General Pathology.', durationMins: 30, questionCount: 25, difficulty: 'Easy' },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'A 24-year-old male presents with inability to abduct his arm beyond 15 degrees. Which nerve is most likely injured?',
    topicId: 't1-1-1',
    options: [
      { id: 'a', text: 'Axillary nerve' },
      { id: 'b', text: 'Suprascapular nerve' },
      { id: 'c', text: 'Long thoracic nerve' },
      { id: 'd', text: 'Musculocutaneous nerve' }
    ],
    correctAnswer: 'a',
    explanation: 'The axillary nerve innervates the deltoid muscle, which is responsible for abduction of the arm beyond the initial 15 degrees (which is initiated by the supraspinatus).',
    communityStats: { a: 65, b: 20, c: 10, d: 5 },
    difficulty: 'Medium',
    totalAttempts: 12543
  },
  {
    id: 'q2',
    text: 'Which of the following structures passes through the quadrangular space?',
    topicId: 't1-1-1',
    options: [
      { id: 'a', text: 'Radial nerve' },
      { id: 'b', text: 'Axillary nerve' },
      { id: 'c', text: 'Ulnar nerve' },
      { id: 'd', text: 'Median nerve' }
    ],
    correctAnswer: 'b',
    explanation: 'The axillary nerve and the posterior circumflex humeral artery pass through the quadrangular space.',
    communityStats: { a: 15, b: 75, c: 5, d: 5 },
    difficulty: 'Hard',
    totalAttempts: 8432
  },
  {
    id: 'q3',
    text: 'During the cardiac cycle, which phase immediately follows the closure of the AV valves?',
    topicId: 't2-1-1',
    options: [
      { id: 'a', text: 'Isovolumetric relaxation' },
      { id: 'b', text: 'Rapid ejection' },
      { id: 'c', text: 'Isovolumetric contraction' },
      { id: 'd', text: 'Reduced filling' }
    ],
    correctAnswer: 'c',
    explanation: 'Closure of the AV valves (S1) marks the beginning of systole. Since the semilunar valves have not yet opened, the ventricle contracts with no change in volume, known as isovolumetric contraction.',
    communityStats: { a: 20, b: 10, c: 60, d: 10 },
    difficulty: 'Medium',
    totalAttempts: 15678
  },
  {
    id: 'q4',
    text: 'Which of the following is the primary pacemaker of the heart in a healthy individual?',
    topicId: 't2-1-1',
    options: [
      { id: 'a', text: 'AV Node' },
      { id: 'b', text: 'Bundle of His' },
      { id: 'c', text: 'SA Node' },
      { id: 'd', text: 'Purkinje Fibers' }
    ],
    correctAnswer: 'c',
    explanation: 'The Sinoatrial (SA) node has the highest intrinsic rate of depolarization and thus sets the heart rate in a healthy heart.',
    communityStats: { a: 5, b: 5, c: 85, d: 5 },
    difficulty: 'Easy',
    totalAttempts: 22100
  },
  {
    id: 'q5',
    text: 'A patient with winging of the scapula likely has injury to which nerve?',
    topicId: 't1-1-1',
    options: [
      { id: 'a', text: 'Dorsal scapular nerve' },
      { id: 'b', text: 'Thoracodorsal nerve' },
      { id: 'c', text: 'Long thoracic nerve' },
      { id: 'd', text: 'Accessory nerve' }
    ],
    correctAnswer: 'c',
    explanation: 'The long thoracic nerve innervates the serratus anterior muscle. Paralysis of this muscle leads to the medial border of the scapula pulling away from the thoracic wall (winging).',
    communityStats: { a: 10, b: 15, c: 70, d: 5 },
    difficulty: 'Medium',
    totalAttempts: 9876
  }
];