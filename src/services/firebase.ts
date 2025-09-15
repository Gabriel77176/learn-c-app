import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  User,
  Subject,
  Lesson,
  Notion,
  Exercise,
  ExerciseOption,
  Submission,
  Grade
} from '../types';

// Collections references
const COLLECTIONS = {
  USERS: 'users',
  SUBJECTS: 'subjects',
  LESSONS: 'lessons',
  NOTIONS: 'notions',
  EXERCISES: 'exercises',
  EXERCISE_OPTIONS: 'exerciseOptions',
  SUBMISSIONS: 'submissions',
  GRADES: 'grades',
  TEACHER_NOTES: 'teacherNotes'
};

// User Services
export const userService = {
  async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        ...data,
        createdAt: data.createdAt.toDate()
      } as User;
    }
    return null;
  },

  async getAllUsers(): Promise<User[]> {
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as User));
  },

  async getUsersByRole(role: string): Promise<User[]> {
    const q = query(collection(db, COLLECTIONS.USERS), where('role', '==', role));
    const usersSnapshot = await getDocs(q);
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as User));
  },

  async deleteUser(userId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  }
};

// Subject Services
export const subjectService = {
  async createSubject(name: string): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.SUBJECTS), { name });
    return docRef.id;
  },

  async getAllSubjects(): Promise<Subject[]> {
    const subjectsSnapshot = await getDocs(collection(db, COLLECTIONS.SUBJECTS));
    return subjectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Subject));
  },

  async updateSubject(subjectId: string, name: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.SUBJECTS, subjectId), { name });
  },

  async deleteSubject(subjectId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.SUBJECTS, subjectId));
  }
};

// Notion Services
export const notionService = {
  async createNotion(name: string, subjectId: string): Promise<string> {
    try {
      console.log('Creating notion in Firestore:', { name, subjectId });
      
      // Use addDoc to let Firestore generate a unique ID automatically
      const docRef = await addDoc(collection(db, COLLECTIONS.NOTIONS), {
        name,
        subjectId,
        createdAt: Timestamp.now()
      });
      
      console.log('Notion created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error in notionService.createNotion:', error);
      throw error;
    }
  },

  async getNotionsBySubject(subjectId: string): Promise<Notion[]> {
    const q = query(collection(db, COLLECTIONS.NOTIONS), where('subjectId', '==', subjectId));
    const notionsSnapshot = await getDocs(q);
    return notionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notion));
  },

  async updateNotion(notionId: string, name: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.NOTIONS, notionId), { name });
  },

  async deleteNotion(notionId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.NOTIONS, notionId));
  }
};

// Lesson Services
export const lessonService = {
  async createLesson(lesson: Omit<Lesson, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.LESSONS), {
      ...lesson,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  async getAllLessons(): Promise<Lesson[]> {
    // Simplified query without orderBy to avoid index requirement
    const lessonsSnapshot = await getDocs(collection(db, COLLECTIONS.LESSONS));
    const lessons = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as Lesson));
    
    // Sort in JavaScript instead of Firestore (descending order)
    return lessons.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getLessonsBySubject(subjectId: string): Promise<Lesson[]> {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, COLLECTIONS.LESSONS),
      where('subjectId', '==', subjectId)
    );
    const lessonsSnapshot = await getDocs(q);
    const lessons = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as Lesson));
    
    // Sort in JavaScript instead of Firestore (descending order)
    return lessons.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getLesson(lessonId: string): Promise<Lesson | null> {
    const lessonDoc = await getDoc(doc(db, COLLECTIONS.LESSONS, lessonId));
    if (lessonDoc.exists()) {
      const data = lessonDoc.data();
      return {
        id: lessonDoc.id,
        ...data,
        createdAt: data.createdAt.toDate()
      } as Lesson;
    }
    return null;
  },

  async updateLesson(lessonId: string, updates: Partial<Omit<Lesson, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.LESSONS, lessonId), updates);
  },

  async deleteLesson(lessonId: string): Promise<void> {
    // Delete associated exercises first
    const exercisesSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.EXERCISES), where('lessonId', '==', lessonId))
    );
    
    const batch = writeBatch(db);
    exercisesSnapshot.docs.forEach(exerciseDoc => {
      batch.delete(exerciseDoc.ref);
    });
    
    // Delete the lesson
    batch.delete(doc(db, COLLECTIONS.LESSONS, lessonId));
    await batch.commit();
  }
};

// Exercise Services
export const exerciseService = {
  async createExercise(exercise: Omit<Exercise, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.EXERCISES), {
      ...exercise,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  async getExercisesByLesson(lessonId: string): Promise<Exercise[]> {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, COLLECTIONS.EXERCISES),
      where('lessonId', '==', lessonId)
    );
    const exercisesSnapshot = await getDocs(q);
    const exercises = exercisesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as Exercise));
    
    // Sort in JavaScript instead of Firestore
    return exercises.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },

  async getExercise(exerciseId: string): Promise<Exercise | null> {
    const exerciseDoc = await getDoc(doc(db, COLLECTIONS.EXERCISES, exerciseId));
    if (exerciseDoc.exists()) {
      const data = exerciseDoc.data();
      return {
        id: exerciseDoc.id,
        ...data,
        createdAt: data.createdAt.toDate()
      } as Exercise;
    }
    return null;
  },

  async updateExercise(exerciseId: string, updates: Partial<Omit<Exercise, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.EXERCISES, exerciseId), updates);
  },

  async deleteExercise(exerciseId: string): Promise<void> {
    // Delete associated options and submissions
    const batch = writeBatch(db);
    
    // Delete options
    const optionsSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.EXERCISE_OPTIONS), where('exerciseId', '==', exerciseId))
    );
    optionsSnapshot.docs.forEach(optionDoc => {
      batch.delete(optionDoc.ref);
    });
    
    // Delete submissions
    const submissionsSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.SUBMISSIONS), where('exerciseId', '==', exerciseId))
    );
    submissionsSnapshot.docs.forEach(submissionDoc => {
      batch.delete(submissionDoc.ref);
    });
    
    // Delete the exercise
    batch.delete(doc(db, COLLECTIONS.EXERCISES, exerciseId));
    await batch.commit();
  }
};

// Exercise Options Services
export const exerciseOptionService = {
  async createOptions(exerciseId: string, options: Omit<ExerciseOption, 'id' | 'exerciseId'>[]): Promise<void> {
    const batch = writeBatch(db);
    
    options.forEach(option => {
      const docRef = doc(collection(db, COLLECTIONS.EXERCISE_OPTIONS));
      batch.set(docRef, {
        ...option,
        exerciseId
      });
    });
    
    await batch.commit();
  },

  async getOptionsByExercise(exerciseId: string): Promise<ExerciseOption[]> {
    const q = query(collection(db, COLLECTIONS.EXERCISE_OPTIONS), where('exerciseId', '==', exerciseId));
    const optionsSnapshot = await getDocs(q);
    return optionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ExerciseOption));
  },

  async updateOptions(exerciseId: string, options: Omit<ExerciseOption, 'exerciseId'>[]): Promise<void> {
    // Delete existing options
    const existingOptions = await this.getOptionsByExercise(exerciseId);
    const batch = writeBatch(db);
    
    existingOptions.forEach(option => {
      batch.delete(doc(db, COLLECTIONS.EXERCISE_OPTIONS, option.id));
    });
    
    // Add new options
    options.forEach(option => {
      const docRef = doc(collection(db, COLLECTIONS.EXERCISE_OPTIONS));
      batch.set(docRef, {
        ...option,
        exerciseId
      });
    });
    
    await batch.commit();
  }
};

// Submission Services
export const submissionService = {
  async createSubmission(submission: Omit<Submission, 'id' | 'submittedAt'>): Promise<string> {
    try {
      const submissionWithTimestamp = {
        ...submission,
        submittedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.SUBMISSIONS), submissionWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Error in submissionService.createSubmission:', error);
      throw error;
    }
  },

  async getSubmissionsByExercise(exerciseId: string): Promise<Submission[]> {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, COLLECTIONS.SUBMISSIONS),
      where('exerciseId', '==', exerciseId)
    );
    const submissionsSnapshot = await getDocs(q);
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt.toDate()
    } as Submission));
    
    // Sort in JavaScript instead of Firestore (descending order)
    return submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  },

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    // Simplified query without orderBy to avoid index requirement  
    const q = query(
      collection(db, COLLECTIONS.SUBMISSIONS),
      where('studentId', '==', studentId)
    );
    const submissionsSnapshot = await getDocs(q);
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt.toDate()
    } as Submission));
    
    // Sort in JavaScript instead of Firestore (descending order)
    return submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  },

  async getSubmission(submissionId: string): Promise<Submission | null> {
    const submissionDoc = await getDoc(doc(db, COLLECTIONS.SUBMISSIONS, submissionId));
    if (submissionDoc.exists()) {
      const data = submissionDoc.data();
      return {
        id: submissionDoc.id,
        ...data,
        submittedAt: data.submittedAt.toDate()
      } as Submission;
    }
    return null;
  },

  async getSubmissionsByStudentAndExercise(studentId: string, exerciseId: string): Promise<Submission[]> {
    const q = query(
      collection(db, COLLECTIONS.SUBMISSIONS),
      where('studentId', '==', studentId),
      where('exerciseId', '==', exerciseId)
    );
    const submissionsSnapshot = await getDocs(q);
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt.toDate()
    } as Submission));
    
    // Sort by submission date (most recent first)
    return submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }
};

// Grade Services
export const gradeService = {
  async createGrade(grade: Omit<Grade, 'id' | 'gradedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.GRADES), {
      ...grade,
      gradedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async getGradeBySubmission(submissionId: string): Promise<Grade | null> {
    const q = query(collection(db, COLLECTIONS.GRADES), where('submissionId', '==', submissionId));
    const gradesSnapshot = await getDocs(q);
    if (!gradesSnapshot.empty) {
      const doc = gradesSnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        gradedAt: data.gradedAt.toDate()
      } as Grade;
    }
    return null;
  },

  async updateGrade(gradeId: string, updates: Partial<Omit<Grade, 'id' | 'gradedAt'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.GRADES, gradeId), updates);
  }
};

