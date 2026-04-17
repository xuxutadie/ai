export interface SubQuestion {
  id: string;
  type: 'single' | 'multiple' | 'fill_in_the_blanks';
  question: string;
  options?: Record<string, string>;
  answer: string | string[];
  points: number;
}

export interface Question {
  id: string;
  grade: string;
  group?: 'primary' | 'junior' | 'both' | 'track1_primary' | 'track1_junior' | 'track3_primary' | 'track3_junior';
  type: 'single' | 'multiple' | 'boolean' | 'fill_in_the_blanks' | 'short_answer' | 'comprehensive';
  question: string;
  scenario?: string; // For comprehensive questions
  subQuestions?: SubQuestion[]; // For comprehensive questions
  options?: Record<string, string>;
  answer: string | string[];
  points: number;
}

export interface AuthStatus {
  code: string;
  type: 'FREE' | 'PAID_5' | 'UNLIMITED_1Y' | 'UNLIMITED' | 'ADMIN' | 'PK_SPECIAL';
  remaining: number;
}

export type PKPlayer = 'left' | 'right';

export interface PKState {
  currentPlayer: PKPlayer;
  leftScore: number;
  rightScore: number;
  leftTime: number;
  rightTime: number;
  isPaused: boolean;
  questionTimeLeft: number | null; // 填空/简答限时
}
