import { QuestionBankItem, CourseQuestionStats } from '../types';
import { coursesApi } from './api';

const STORAGE_KEY = 'cf_question_bank_v1';

const INITIAL_QUESTIONS: QuestionBankItem[] = [
  // ==========================================
  // COURSE 1: Banking & Financial Services
  // ==========================================
  {
    id: 'qb-bfs-001',
    courseId: 'crs-01',
    courseName: 'Banking & Financial Services',
    subject: 'Quantitative Aptitude',
    topic: 'Compound Interest & Annuities',
    questionText: 'A sum of money invested at compound interest doubles itself in 4 years. In how many years will it amount to 8 times itself at the same annual interest rate?',
    questionType: 'MCQ',
    options: ['8 years', '12 years', '16 years', '20 years'],
    correctOptionIndex: 1, // 12 years: 2^3 = 8 -> 4 * 3 = 12
    difficulty: 'MEDIUM',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'If a sum doubles (2^1) in 4 years, it becomes 2^n times in 4*n years. For 8 times (2^3), time taken = 4 * 3 = 12 years.',
    addedBy: 'Prof. Sarah Mathews',
    creatorRole: 'TEACHER',
    createdAt: '2026-03-01T10:00:00Z',
    status: 'ACTIVE',
    usageCount: 142,
    accuracyRate: 78.5,
  },
  {
    id: 'qb-bfs-002',
    courseId: 'crs-01',
    courseName: 'Banking & Financial Services',
    subject: 'Financial Awareness',
    topic: 'Monetary Policy & RBI Regulations',
    questionText: 'Which committee of the Reserve Bank of India (RBI) is statutorily mandated to fix the benchmark policy repo rate in India?',
    questionType: 'MCQ',
    options: [
      'Financial Stability and Development Council (FSDC)',
      'Monetary Policy Committee (MPC)',
      'Board for Financial Supervision (BFS)',
      'Urjit Patel Advisory Commission',
    ],
    correctOptionIndex: 1,
    difficulty: 'EASY',
    marks: 1,
    negativeMarks: 0.25,
    explanation: 'Under Section 45ZB of the amended RBI Act 1934, the 6-member Monetary Policy Committee (MPC) fixes the benchmark repo rate.',
    addedBy: 'Dr. Anand Raman',
    creatorRole: 'ADMIN',
    createdAt: '2026-03-02T11:30:00Z',
    status: 'ACTIVE',
    usageCount: 198,
    accuracyRate: 88.0,
  },
  {
    id: 'qb-bfs-003',
    courseId: 'crs-01',
    courseName: 'Banking & Financial Services',
    subject: 'Logical & Financial Reasoning',
    topic: 'Linear & Circular Seating Arrangement',
    questionText: 'Eight bank managers (A, B, C, D, E, F, G, H) are seated around a circular conference table facing the center. A sits third to the right of B, while G sits second to the left of A. Who sits directly opposite B?',
    questionType: 'MCQ',
    options: ['Manager D', 'Manager F', 'Manager G', 'Manager E'],
    correctOptionIndex: 1,
    difficulty: 'HARD',
    marks: 3,
    negativeMarks: 0.75,
    explanation: 'Placing B at pos 1 facing center: A is at pos 4. G is 2 positions counter-clockwise from A -> pos 2. Completing relative constraints places Manager F at pos 5 (directly opposite pos 1).',
    addedBy: 'Prof. Sarah Mathews',
    creatorRole: 'TEACHER',
    createdAt: '2026-03-05T09:15:00Z',
    status: 'ACTIVE',
    usageCount: 89,
    accuracyRate: 61.2,
  },
  {
    id: 'qb-bfs-004',
    courseId: 'crs-01',
    courseName: 'Banking & Financial Services',
    subject: 'Quantitative Aptitude',
    topic: 'Time, Speed & Distance (Trains)',
    questionText: 'A 240 m long train moving at 72 km/h crosses a railway platform in 26 seconds. What is the length of the platform?',
    questionType: 'MCQ',
    options: ['260 m', '280 m', '300 m', '320 m'],
    correctOptionIndex: 1, // 72 km/h = 20 m/s. Total distance = 20 * 26 = 520 m. Platform = 520 - 240 = 280 m.
    difficulty: 'EASY',
    marks: 1,
    negativeMarks: 0.25,
    explanation: 'Speed = 72 * (5/18) = 20 m/s. Total distance traversed = 20 * 26 = 520 m. Length of platform = 520 - 240 = 280 m.',
    addedBy: 'Dr. Anand Raman',
    creatorRole: 'ADMIN',
    createdAt: '2026-03-08T14:20:00Z',
    status: 'ACTIVE',
    usageCount: 165,
    accuracyRate: 84.6,
  },
  {
    id: 'qb-bfs-005',
    courseId: 'crs-01',
    courseName: 'Banking & Financial Services',
    subject: 'Financial Awareness',
    topic: 'Basel Accords & Capital Adequacy',
    questionText: 'Under Basel III regulatory framework, what is the mandatory Minimum Common Equity Tier 1 (CET1) capital ratio required for scheduled commercial banks in India (excluding CCB)?',
    questionType: 'MCQ',
    options: ['4.5%', '5.5%', '7.0%', '9.0%'],
    correctOptionIndex: 1,
    difficulty: 'HARD',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'RBI mandates a minimum CET1 ratio of 5.5% of risk-weighted assets for Indian scheduled commercial banks (higher than the Basel global minimum of 4.5%).',
    addedBy: 'Prof. Sarah Mathews',
    creatorRole: 'TEACHER',
    createdAt: '2026-03-12T16:00:00Z',
    status: 'ACTIVE',
    usageCount: 76,
    accuracyRate: 54.0,
  },

  // ==========================================
  // COURSE 2: Data Analytics & AI Operations
  // ==========================================
  {
    id: 'qb-dai-001',
    courseId: 'crs-02',
    courseName: 'Data Analytics & AI Operations',
    subject: 'Applied Statistics & Probability',
    topic: 'Central Limit Theorem & Normal Distribution',
    questionText: 'According to the Central Limit Theorem (CLT), what happens to the sampling distribution of the sample mean as the sample size (n) increases, regardless of the underlying population shape?',
    questionType: 'MCQ',
    options: [
      'It becomes skewed towards the population mode.',
      'It converges towards a normal distribution with variance sigma^2/n.',
      'It mirrors the exact distribution of the population variance.',
      'Its standard deviation remains constant regardless of n.',
    ],
    correctOptionIndex: 1,
    difficulty: 'MEDIUM',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'The Central Limit Theorem proves that the distribution of sample means approaches a normal distribution N(mu, sigma^2/n) as sample size n becomes large (n >= 30).',
    addedBy: 'Dr. Anand Raman',
    creatorRole: 'ADMIN',
    createdAt: '2026-03-04T12:00:00Z',
    status: 'ACTIVE',
    usageCount: 120,
    accuracyRate: 72.5,
  },
  {
    id: 'qb-dai-002',
    courseId: 'crs-02',
    courseName: 'Data Analytics & AI Operations',
    subject: 'Python & SQL Analytics',
    topic: 'SQL Window Functions & Aggregation',
    questionText: 'Which SQL clause is used to filter records AFTER an aggregation operation using GROUP BY has already been computed?',
    questionType: 'MCQ',
    options: ['WHERE', 'HAVING', 'FILTER BY', 'QUALIFY'],
    correctOptionIndex: 1,
    difficulty: 'EASY',
    marks: 1,
    negativeMarks: 0.25,
    explanation: 'The HAVING clause is evaluated after GROUP BY aggregation to filter aggregated metric conditions, whereas WHERE filters row-level data prior to grouping.',
    addedBy: 'Dr. Anand Raman',
    creatorRole: 'ADMIN',
    createdAt: '2026-03-06T15:10:00Z',
    status: 'ACTIVE',
    usageCount: 210,
    accuracyRate: 91.4,
  },
  {
    id: 'qb-dai-003',
    courseId: 'crs-02',
    courseName: 'Data Analytics & AI Operations',
    subject: 'Machine Learning & Neural Nets',
    topic: 'Evaluation Metrics & Precision-Recall',
    questionText: 'In a medical fraud detection scenario where fraudulent transactions are extremely rare (0.1%), which evaluation metric is MOST reliable to evaluate a classification model?',
    questionType: 'MCQ',
    options: [
      'Standard Classification Accuracy',
      'PR-AUC (Precision-Recall Area Under Curve) / F1-Score',
      'Mean Squared Error (MSE)',
      'Adjusted R-squared',
    ],
    correctOptionIndex: 1,
    difficulty: 'MEDIUM',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'On highly imbalanced datasets, Accuracy gives a false sense of success (predicting all negative gives 99.9% accuracy). PR-AUC and F1-score specifically quantify performance on the rare positive class.',
    addedBy: 'Prof. Sarah Mathews',
    creatorRole: 'TEACHER',
    createdAt: '2026-03-09T17:40:00Z',
    status: 'ACTIVE',
    usageCount: 95,
    accuracyRate: 69.8,
  },
  {
    id: 'qb-dai-004',
    courseId: 'crs-02',
    courseName: 'Data Analytics & AI Operations',
    subject: 'Machine Learning & Neural Nets',
    topic: 'Regularization & Bias-Variance Tradeoff',
    questionText: 'What is the principal operational difference between L1 (Lasso) and L2 (Ridge) regularization penalty terms in linear models?',
    questionType: 'MCQ',
    options: [
      'L1 shrinks coefficients to exact zero (feature selection), while L2 shrinks coefficients asymptotically towards zero.',
      'L2 shrinks coefficients to exact zero, while L1 maintains all feature weights.',
      'L1 operates solely on non-linear neural activations, while L2 is restricted to linear regressions.',
      'Both apply identical square penalties but differ in learning rate adaptation.',
    ],
    correctOptionIndex: 0,
    difficulty: 'HARD',
    marks: 3,
    negativeMarks: 0.75,
    explanation: 'L1 regularization introduces a diamond-shaped constraint boundary that drives non-informative weights directly to zero, performing intrinsic feature selection.',
    addedBy: 'Prof. Sarah Mathews',
    creatorRole: 'TEACHER',
    createdAt: '2026-03-14T11:20:00Z',
    status: 'ACTIVE',
    usageCount: 68,
    accuracyRate: 58.0,
  },

  // ==========================================
  // COURSE 3: Civil Services Foundation
  // ==========================================
  {
    id: 'qb-csf-001',
    courseId: 'crs-03',
    courseName: 'Civil Services Foundation',
    subject: 'Indian Polity & Governance',
    topic: 'Fundamental Rights & Judicial Review',
    questionText: 'Which Article of the Constitution of India provides constitutional remedies to citizens to approach the Supreme Court directly for the enforcement of Fundamental Rights?',
    questionType: 'MCQ',
    options: ['Article 19', 'Article 21', 'Article 32', 'Article 226'],
    correctOptionIndex: 2,
    difficulty: 'EASY',
    marks: 1,
    negativeMarks: 0.33,
    explanation: 'Dr. B.R. Ambedkar described Article 32 as the "Heart and Soul" of the Indian Constitution as it guarantees the right to constitutional remedies via prerogative writs directly from the Supreme Court.',
    addedBy: 'Dr. Anand Raman',
    creatorRole: 'ADMIN',
    createdAt: '2026-03-03T10:15:00Z',
    status: 'ACTIVE',
    usageCount: 230,
    accuracyRate: 92.0,
  },
  {
    id: 'qb-csf-002',
    courseId: 'crs-03',
    courseName: 'Civil Services Foundation',
    subject: 'Modern Indian History',
    topic: 'National Freedom Movement',
    questionText: 'The historic "Poona Pact" of 1932 was signed between Mahatma Gandhi and which prominent national leader regarding political representation?',
    questionType: 'MCQ',
    options: [
      'Jawaharlal Nehru',
      'Dr. B. R. Ambedkar',
      'Subhash Chandra Bose',
      'Sardar Vallabhbhai Patel',
    ],
    correctOptionIndex: 1,
    difficulty: 'EASY',
    marks: 1,
    negativeMarks: 0.33,
    explanation: 'Signed in Yerwada Central Jail on September 24, 1932, between Dr. B.R. Ambedkar and Mahatma Gandhi, retaining joint electorates while increasing reserved legislative seats for the Depressed Classes.',
    addedBy: 'Prof. Sarah Mathews',
    creatorRole: 'TEACHER',
    createdAt: '2026-03-07T13:45:00Z',
    status: 'ACTIVE',
    usageCount: 185,
    accuracyRate: 86.5,
  },
  {
    id: 'qb-csf-003',
    courseId: 'crs-03',
    courseName: 'Civil Services Foundation',
    subject: 'Environment & Ecology',
    topic: 'Biodiversity Hotspots & Conservation',
    questionText: 'Which of the following mountain ranges in South India is officially recognized as a UNESCO World Heritage Site and one of the world\'s top "Hottest Biodiversity Hotspots"?',
    questionType: 'MCQ',
    options: ['Aravalli Range', 'Vindhya Range', 'Western Ghats (Sahyadri)', 'Satpura Range'],
    correctOptionIndex: 2,
    difficulty: 'EASY',
    marks: 1,
    negativeMarks: 0.33,
    explanation: 'The Western Ghats (Sahyadri) is one of the world’s eight "Hottest Hotspots" of biological diversity, harboring immense endemic flora and fauna across 160,000 sq km.',
    addedBy: 'Dr. Anand Raman',
    creatorRole: 'ADMIN',
    createdAt: '2026-03-10T14:00:00Z',
    status: 'ACTIVE',
    usageCount: 175,
    accuracyRate: 90.2,
  },
  {
    id: 'qb-csf-004',
    courseId: 'crs-03',
    courseName: 'Civil Services Foundation',
    subject: 'Indian Polity & Governance',
    topic: 'Basic Structure Doctrine & Kesavananda Bharati',
    questionText: 'In the landmark Kesavananda Bharati v. State of Kerala (1973) judgment, what historic constitutional principle did the 13-judge bench establish regarding parliamentary amendatory powers under Article 368?',
    questionType: 'MCQ',
    options: [
      'Parliament possesses unlimited and unreviewable authority to rewrite the entire text of the Constitution.',
      'Parliament can amend any part of the Constitution, but cannot alter or abrogate its "Basic Structure".',
      'The President retains absolute veto powers over all Constitutional Amendment Bills passed by Parliament.',
      'Fundamental rights can never be altered under any legislative circumstances.',
    ],
    correctOptionIndex: 1,
    difficulty: 'MEDIUM',
    marks: 2,
    negativeMarks: 0.66,
    explanation: 'By a 7:6 majority, the Supreme Court ruled that while Parliament has wide powers to amend the Constitution under Article 368, it cannot alter its foundational "Basic Structure".',
    addedBy: 'Dr. Anand Raman',
    creatorRole: 'ADMIN',
    createdAt: '2026-03-11T16:30:00Z',
    status: 'ACTIVE',
    usageCount: 135,
    accuracyRate: 74.0,
  },
  {
    id: 'qb-csf-005',
    courseId: 'crs-03',
    courseName: 'Civil Services Foundation',
    subject: 'Economic & Social Development',
    topic: 'Fiscal Policy & FRBM Act',
    questionText: 'Under the Fiscal Responsibility and Budget Management (FRBM) Review Committee recommendations headed by N.K. Singh, what target was recommended for the General Government Debt-to-GDP ratio by FY 2023?',
    questionType: 'MCQ',
    options: ['40%', '60% (40% Central + 20% States)', '75%', '50%'],
    correctOptionIndex: 1,
    difficulty: 'HARD',
    marks: 3,
    negativeMarks: 1.0,
    explanation: 'The N.K. Singh Committee recommended a Debt-to-GDP ratio ceiling of 60% for the general government (40% for the Central Government and 20% for the State Governments).',
    addedBy: 'Prof. Sarah Mathews',
    creatorRole: 'TEACHER',
    createdAt: '2026-03-15T09:00:00Z',
    status: 'ACTIVE',
    usageCount: 52,
    accuracyRate: 46.2,
  },
];

function getStoredQuestions(): QuestionBankItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...INITIAL_QUESTIONS];
}

function persistQuestions(items: QuestionBankItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export const questionBankApi = {
  async getAll(filters?: {
    courseId?: string;
    subject?: string;
    difficulty?: string;
    search?: string;
    status?: string;
  }): Promise<QuestionBankItem[]> {
    await new Promise((r) => setTimeout(r, 200));
    let items = getStoredQuestions();

    if (filters?.courseId) {
      items = items.filter((q) => q.courseId === filters.courseId);
    }
    if (filters?.subject) {
      items = items.filter((q) => q.subject.toLowerCase() === filters.subject?.toLowerCase());
    }
    if (filters?.difficulty) {
      items = items.filter((q) => q.difficulty === filters.difficulty);
    }
    if (filters?.status) {
      items = items.filter((q) => q.status === filters.status);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase().trim();
      items = items.filter(
        (q) =>
          q.questionText.toLowerCase().includes(s) ||
          q.topic.toLowerCase().includes(s) ||
          q.subject.toLowerCase().includes(s) ||
          q.courseName.toLowerCase().includes(s)
      );
    }

    return items;
  },

  async getById(id: string): Promise<QuestionBankItem | null> {
    const items = getStoredQuestions();
    return items.find((q) => q.id === id) || null;
  },

  async create(data: Partial<QuestionBankItem>): Promise<QuestionBankItem> {
    await new Promise((r) => setTimeout(r, 300));
    const items = getStoredQuestions();
    const newId = `qb-${Date.now().toString().slice(-6)}`;

    const newItem: QuestionBankItem = {
      id: newId,
      courseId: data.courseId || 'crs-01',
      courseName: data.courseName || 'Banking & Financial Services',
      subject: data.subject || 'General Knowledge',
      topic: data.topic || 'General Overview',
      questionText: data.questionText || '',
      questionType: data.questionType || 'MCQ',
      options: data.options && data.options.length >= 2 ? data.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: data.correctOptionIndex ?? 0,
      difficulty: data.difficulty || 'MEDIUM',
      marks: data.marks ?? 1,
      negativeMarks: data.negativeMarks ?? 0.25,
      explanation: data.explanation || 'Solution and detailed rationale provided by faculty reviewer.',
      addedBy: data.addedBy || 'Chief Academic Evaluator',
      creatorRole: data.creatorRole || 'ADMIN',
      createdAt: new Date().toISOString(),
      status: data.status || 'ACTIVE',
      usageCount: 0,
      accuracyRate: 0,
    };

    items.unshift(newItem);
    persistQuestions(items);
    return newItem;
  },

  async update(id: string, updates: Partial<QuestionBankItem>): Promise<QuestionBankItem> {
    await new Promise((r) => setTimeout(r, 250));
    const items = getStoredQuestions();
    const idx = items.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error(`Question ${id} not found.`);

    const updated = {
      ...items[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    items[idx] = updated;
    persistQuestions(items);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 200));
    let items = getStoredQuestions();
    items = items.filter((q) => q.id !== id);
    persistQuestions(items);
    return true;
  },

  async getCourseMonitoringStats(): Promise<CourseQuestionStats[]> {
    const [courses, questions] = await Promise.all([
      coursesApi.getAll().catch(() => [
        { id: 'crs-01', name: 'Banking & Financial Services' },
        { id: 'crs-02', name: 'Data Analytics & AI Operations' },
        { id: 'crs-03', name: 'Civil Services Foundation' },
      ]),
      getStoredQuestions(),
    ]);

    return courses.map((course) => {
      const courseQs = questions.filter((q) => q.courseId === course.id);
      const total = courseQs.length;
      const easy = courseQs.filter((q) => q.difficulty === 'EASY').length;
      const med = courseQs.filter((q) => q.difficulty === 'MEDIUM').length;
      const hard = courseQs.filter((q) => q.difficulty === 'HARD').length;

      const subjects = new Set(courseQs.map((q) => q.subject));
      const topics = new Set(courseQs.map((q) => q.topic));

      const totalAttempts = courseQs.reduce((acc, q) => acc + (q.usageCount || 0), 0);
      const avgAcc =
        total > 0
          ? Math.round(
              courseQs.reduce((acc, q) => acc + (q.accuracyRate || 0), 0) / total
            )
          : 0;

      let coverageStatus: 'OPTIMAL' | 'MODERATE' | 'NEEDS_QUESTIONS' = 'NEEDS_QUESTIONS';
      if (total >= 10) coverageStatus = 'OPTIMAL';
      else if (total >= 4) coverageStatus = 'MODERATE';

      return {
        courseId: course.id,
        courseName: course.name,
        totalQuestions: total,
        easyCount: easy,
        mediumCount: med,
        hardCount: hard,
        subjectsCount: subjects.size,
        uniqueTopicsCount: topics.size,
        totalAttempts,
        avgAccuracy: avgAcc,
        coverageStatus,
        lastUpdated: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });
  },

  async recordAnswerAttempt(questionId: string, isCorrect: boolean): Promise<void> {
    const items = getStoredQuestions();
    const idx = items.findIndex((q) => q.id === questionId);
    if (idx !== -1) {
      const q = items[idx];
      const prevTotal = q.usageCount || 0;
      const prevCorrect = Math.round((prevTotal * (q.accuracyRate || 0)) / 100);
      const newTotal = prevTotal + 1;
      const newCorrect = prevCorrect + (isCorrect ? 1 : 0);
      q.usageCount = newTotal;
      q.accuracyRate = Math.round((newCorrect / newTotal) * 100);
      persistQuestions(items);
    }
  },

  async bulkImport(courseId: string, courseName: string, itemsList: Partial<QuestionBankItem>[]): Promise<number> {
    const existing = getStoredQuestions();
    const created: QuestionBankItem[] = itemsList.map((item, i) => ({
      id: `qb-bulk-${Date.now()}-${i}`,
      courseId,
      courseName,
      subject: item.subject || 'Core Curriculum',
      topic: item.topic || 'General Topic',
      questionText: item.questionText || '',
      questionType: item.questionType || 'MCQ',
      options: item.options && item.options.length >= 2 ? item.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: item.correctOptionIndex ?? 0,
      difficulty: item.difficulty || 'MEDIUM',
      marks: item.marks ?? 1,
      negativeMarks: item.negativeMarks ?? 0.25,
      explanation: item.explanation || 'Imported curriculum test item with standard verified rubric.',
      addedBy: item.addedBy || 'Bulk Importer',
      creatorRole: item.creatorRole || 'ADMIN',
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      usageCount: 0,
      accuracyRate: 0,
    }));

    persistQuestions([...created, ...existing]);
    return created.length;
  },
};
