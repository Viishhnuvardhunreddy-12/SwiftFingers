
export interface EvaluationResult {
  generated_text: string;
  wpm: number;
  accuracy: number;
  errors: string[];
  mistyped_words: string[];
  missed_words: string[];
  extra_words: string[];
  charErrors: Record<string, number>; // New: specific char error counts
  score: number;
  feedback_summary: string;
  improvement_suggestions: string[];
}

export interface MistakeAnalysis {
  correction_paragraph: string;
  micro_drills: string[];
  pattern_explanation: string;
  improvement_goal: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  TYPING = 'TYPING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  GENERATING_ANALYSIS = 'GENERATING_ANALYSIS',
  ERROR = 'ERROR'
}

export type DifficultyMode = 'BEGINNER' | 'INTERMEDIATE' | 'HARD';

export type GameType = 'STANDARD' | 'FLOOD_ESCAPE' | 'BOMB_DEFUSE' | 'STICKMAN_SHOOTER' | 'DRIFT_RACING';

export interface ChartDataPoint {
  name: string;
  value: number;
  fullMark: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  minutes: number;
}

export interface WeakKeyStats {
  char: string;
  count: number;
}
