// Types based on the database schema
export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Notion {
  id: string;
  name: string;
  subjectId: string;
}

export interface Lesson {
  id: string;
  subjectId: string;
  title: string;
  createdBy: string;
  createdAt: Date;
  notions: string[]; // Array of notion IDs
}

export type ExerciseType = 'qcm' | 'text' | 'code';

export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  title: string;
  description: string;
  timeLimit?: number; // in minutes - optional
  createdAt: Date;
}

export interface ExerciseOption {
  id: string;
  exerciseId: string;
  optionText: string;
  isCorrect: boolean;
}

export interface Submission {
  id: string;
  exerciseId: string;
  studentId: string;
  submittedAt: Date;
  answerText?: string;
  duration: number; // in seconds
  selectedOptions?: string[]; // for QCM - optional field
}

export interface Grade {
  id: string;
  submissionId: string;
  teacherId: string;
  grade: number; // 1-5 stars
  feedback?: string;
  gradedAt: Date;
}

export interface TeacherNote {
  id: string;
  studentId: string;
  teacherId: string;
  noteText: string;
  createdAt: Date;
}

