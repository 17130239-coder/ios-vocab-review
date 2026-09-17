export interface CourseMetadata {
  course_title: string;
  course_id: string;
  total_lessons: number;
  day_range: {
    start: number;
    end: number;
  };
  summary: {
    total_lessons: number;
    total_vocabulary_words: number;
    total_attachments: number;
    total_audio_files: number;
    total_images: number;
    total_quizizz_games: number;
  };
}

export interface VocabularyAudio {
  name: string;
  url: string;
}

export interface VocabularyItem {
  index: number;
  word: string;
  pronunciation: string;
  part_of_speech: string;
  meaning: string;
  synonyms: string[];
  collocations: string[];
  examples: string[];
  audio: VocabularyAudio | null;
  raw_text: string;
}

export interface HomeworkExercise {
  question_number: number;
  content: string;
}

export interface Homework {
  instructions: string;
  form_url: string;
  exercises: HomeworkExercise[];
}

export interface Quizizz {
  title: string;
  url: string;
  deadline: string;
  reward: string;
  notes: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: "Image" | "Audio" | "Video" | "Google Forms" | string;
  url: string;
  thumbnail_url: string;
}

export interface Lesson {
  id: string;
  day_number: number;
  title: string;
  type: string;
  posted_date: string;
  due_date: string;
  status: string;
  classroom_url: string;
  schedule: string[];
  vocabulary: VocabularyItem[];
  homework: Homework;
  quizizz: Quizizz | null;
  attachments: Attachment[];
  raw_content: string;
}

export interface MaterialData {
  metadata: CourseMetadata;
  lessons: Lesson[];
}

export type ThemeColor = "blue" | "indigo" | "emerald" | "orange" | "purple";
export type AppearanceMode = "auto" | "light" | "dark";

export interface UserProgress {
  masteredWords: Record<string, boolean>; // key: `${dayNumber}_${word}`
  bookmarkedWords: Record<string, boolean>; // key: `${dayNumber}_${word}`
  completedExercises: Record<string, boolean>; // key: `${dayNumber}_${questionNumber}`
  completedDays: Record<number, boolean>;
  streak: number;
  lastActiveDate: string;
  themeColor: ThemeColor;
  appearance: AppearanceMode;
  soundEnabled: boolean;
  speechRate: number;
}
