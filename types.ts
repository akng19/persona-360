
export interface Question {
  id: number;
  text: string;
  options: string[];
}

export interface Answer {
  questionId: number;
  questionText: string;
  answer: string;
}

export interface Survey {
  slug: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Demographics {
  gender: string;
}