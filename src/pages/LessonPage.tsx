import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Fab,
  Chip
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  lessonService,
  exerciseService,
  submissionService,
  subjectService,
  notionService
} from '../services/firebase';
import { Lesson, Exercise, Subject, Notion } from '../types';
import ExerciseCard from '../components/Exercise/ExerciseCard';

interface ExerciseWithSubmission extends Exercise {
  isCompleted: boolean;
  userGrade?: number;
  submissionCount: number;
  lastSubmissionId?: string;
}

const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [notions, setNotions] = useState<Notion[]>([]);
  const [exercises, setExercises] = useState<ExerciseWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      loadLessonData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, currentUser]); // loadLessonData is stable and doesn't need to be in deps

  const loadLessonData = async () => {
    try {
      setLoading(true);
      
      if (!lessonId) return;
      
      // Load lesson
      const lessonData = await lessonService.getLesson(lessonId);
      if (!lessonData) {
        navigate('/');
        return;
      }
      setLesson(lessonData);

      // Load subject
      const subjectData = await subjectService.getAllSubjects();
      const lessonSubject = subjectData.find(s => s.id === lessonData.subjectId);
      if (lessonSubject) {
        setSubject(lessonSubject);
      }

      // Load notions
      if (lessonData.notions && lessonData.notions.length > 0) {
        const allNotions = await notionService.getNotionsBySubject(lessonData.subjectId);
        const lessonNotions = allNotions.filter(notion => 
          lessonData.notions.includes(notion.id)
        );
        setNotions(lessonNotions);
      }

      // Load exercises
      const exercisesData = await exerciseService.getExercisesByLesson(lessonId);
      
      // Check completion status for students
      if (currentUser?.role === 'student') {
        const exercisesWithStatus = await Promise.all(
          exercisesData.map(async (exercise) => {
            const submissions = await submissionService.getSubmissionsByExercise(exercise.id);
            const userSubmissions = submissions.filter(s => s.studentId === currentUser.id);
            
            return {
              ...exercise,
              isCompleted: userSubmissions.length > 0,
              userGrade: undefined, // TODO: Load grade if exists
              submissionCount: userSubmissions.length,
              lastSubmissionId: userSubmissions.length > 0 ? userSubmissions[0].id : undefined
            };
          })
        );
        setExercises(exercisesWithStatus);
      } else {
        setExercises(exercisesData.map(ex => ({ 
          ...ex, 
          isCompleted: false, 
          submissionCount: 0,
          lastSubmissionId: undefined 
        })));
      }
    } catch (error) {
      console.error('Error loading lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };

  const handleEditExercise = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}/edit`);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
      try {
        await exerciseService.deleteExercise(exerciseId);
        // Reload exercises
        loadLessonData();
      } catch (error) {
        console.error('Error deleting exercise:', error);
        alert('Erreur lors de la suppression de l\'exercice');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box>
        <Alert severity="error">Leçon non trouvée</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Retour au tableau de bord
        </Button>
      </Box>
    );
  }

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const completedExercises = exercises.filter(ex => ex.isCompleted).length;
  const progressPercentage = exercises.length > 0 ? (completedExercises / exercises.length) * 100 : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Retour au tableau de bord
          </Button>
          
          <Typography variant="h4" gutterBottom>
            {lesson.title}
          </Typography>
          
          {subject && (
            <Chip
              label={subject.name}
              color="primary"
              sx={{ mb: 2 }}
            />
          )}
          
          {notions.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Notions abordées:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {notions.map((notion) => (
                  <Chip
                    key={notion.id}
                    label={notion.name}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
        
        {isTeacher && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate(`/lessons/${lessonId}/exercises/new`)}
          >
            Nouvel exercice
          </Button>
        )}
      </Box>

      {/* Progress for students */}
      {currentUser?.role === 'student' && exercises.length > 0 && (
        <Alert 
          severity={progressPercentage === 100 ? 'success' : 'info'} 
          sx={{ mb: 3 }}
        >
          Progression: {completedExercises}/{exercises.length} exercices terminés 
          ({Math.round(progressPercentage)}%)
        </Alert>
      )}

      {/* Exercises Grid */}
      {exercises.length > 0 ? (
        <Grid container spacing={3}>
          {exercises.map((exercise) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={exercise.id}>
              <ExerciseCard
                exercise={exercise}
                onStart={() => handleStartExercise(exercise.id)}
                onEdit={isTeacher ? () => handleEditExercise(exercise.id) : undefined}
                onDelete={isTeacher ? () => handleDeleteExercise(exercise.id) : undefined}
                isCompleted={exercise.isCompleted}
                userGrade={exercise.userGrade}
                submissionCount={exercise.submissionCount}
                lastSubmissionId={exercise.lastSubmissionId}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucun exercice disponible
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isTeacher 
              ? 'Créez le premier exercice pour cette leçon'
              : 'Les exercices seront bientôt disponibles'
            }
          </Typography>
          {isTeacher && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(`/lessons/${lessonId}/exercises/new`)}
              sx={{ mt: 2 }}
            >
              Créer un exercice
            </Button>
          )}
        </Box>
      )}

      {/* Floating Action Button for teachers */}
      {isTeacher && exercises.length > 0 && (
        <Fab
          color="primary"
          aria-label="add exercise"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => navigate(`/lessons/${lessonId}/exercises/new`)}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default LessonPage;
