export interface Question {
  id: string;
  grade: string;
  group?: 'primary' | 'junior' | 'both';
  type: 'single' | 'multiple' | 'boolean' | 'fill_in_the_blanks' | 'short_answer';
  question: string;
  options?: Record<string, string>;
  answer: string | string[];
  points: number;
}

export interface AuthStatus {
  code: string;
  type: 'FREE' | 'PAID_5' | 'UNLIMITED_1Y' | 'ADMIN';
  remaining: number;
}
