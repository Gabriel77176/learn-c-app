import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Fab,
  Button,
  Chip,
  Avatar
} from '@mui/material';
import {
  Add,
  School,
  Assignment,
  Grade,
  People
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { lessonService, exerciseService, submissionService, userService } from '../services/firebase';
import { Lesson, Exercise, Submission } from '../types';

interface DashboardStats {
  totalLessons: number;
  totalExercises: number;
  totalSubmissions: number;
  totalStudents: number;
  recentLessons: Lesson[];
  recentExercises: Exercise[];
  recentSubmissions: Submission[];
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalLessons: 0,
    totalExercises: 0,
    totalSubmissions: 0,
    totalStudents: 0,
    recentLessons: [],
    recentExercises: [],
    recentSubmissions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (currentUser?.role === 'student') {
        // Student dashboard
        const submissions = await submissionService.getSubmissionsByStudent(currentUser.id);
        const lessons = await lessonService.getAllLessons();
        
        setStats({
          totalLessons: lessons.length,
          totalExercises: 0, // Will be calculated from lessons
          totalSubmissions: submissions.length,
          totalStudents: 0,
          recentLessons: lessons.slice(0, 5),
          recentExercises: [],
          recentSubmissions: submissions.slice(0, 5)
        });
      } else {
        // Teacher/Admin dashboard
        console.log('Loading all lessons for teacher dashboard...');
        const lessons = await lessonService.getAllLessons();
        console.log('Lessons loaded:', lessons.length);
        const students = await userService.getUsersByRole('student');
        
        let totalExercises = 0;
        let allSubmissions: Submission[] = [];
        
        // Get exercises and submissions for all lessons
        for (const lesson of lessons) {
          const exercises = await exerciseService.getExercisesByLesson(lesson.id);
          totalExercises += exercises.length;
          
          for (const exercise of exercises) {
            const submissions = await submissionService.getSubmissionsByExercise(exercise.id);
            allSubmissions = [...allSubmissions, ...submissions];
          }
        }
        
        setStats({
          totalLessons: lessons.length,
          totalExercises,
          totalSubmissions: allSubmissions.length,
          totalStudents: students.length,
          recentLessons: lessons.slice(0, 5),
          recentExercises: [], // Could add recent exercises here
          recentSubmissions: allSubmissions.slice(0, 5)
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({
    title,
    value,
    icon,
    color
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#f44336';
      case 'teacher':
        return '#2196f3';
      case 'student':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Tableau de bord
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" color="text.secondary">
              Bienvenue, {currentUser?.name}
            </Typography>
            <Chip
              label={currentUser?.role.toUpperCase()}
              sx={{
                bgcolor: getRoleColor(currentUser?.role || ''),
                color: 'white',
                fontWeight: 'bold'
              }}
              size="small"
            />
          </Box>
        </Box>
        
        {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/lessons/new')}
          >
            Nouvelle leçon
          </Button>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Leçons"
            value={stats.totalLessons}
            icon={<School />}
            color="#2196f3"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Exercices"
            value={stats.totalExercises}
            icon={<Assignment />}
            color="#4caf50"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Soumissions"
            value={stats.totalSubmissions}
            icon={<Grade />}
            color="#ff9800"
          />
        </Grid>
        {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Étudiants"
              value={stats.totalStudents}
              icon={<People />}
              color="#9c27b0"
            />
          </Grid>
        )}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Lessons */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leçons récentes
              </Typography>
              {stats.recentLessons.length > 0 ? (
                stats.recentLessons.map((lesson) => (
                  <Box
                    key={lesson.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => navigate(`/lessons/${lesson.id}`)}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      {lesson.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lesson.createdAt.toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">
                  Aucune leçon disponible
                </Typography>
              )}
              <Button
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/lessons')}
              >
                Voir toutes les leçons
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Submissions (for teachers) or My Submissions (for students) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {currentUser?.role === 'student' ? 'Mes soumissions récentes' : 'Soumissions récentes'}
                </Typography>
                {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Grade />}
                    onClick={() => navigate('/teacher-management', { state: { initialTab: 2 } })}
                  >
                    Corriger tout
                  </Button>
                )}
              </Box>
              
              {stats.recentSubmissions.length > 0 ? (
                stats.recentSubmissions.map((submission) => (
                  <Box
                    key={submission.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => {
                      if (currentUser?.role === 'student' && submission.studentId === currentUser.id) {
                        // Students can view their own submissions
                        navigate(`/submission/${submission.id}`);
                      } else if (currentUser?.role === 'teacher' || currentUser?.role === 'admin') {
                        // Teachers can view any submission
                        navigate(`/submission/${submission.id}`);
                      }
                    }}
                  >
                    <Typography variant="subtitle2">
                      Exercice ID: {submission.exerciseId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {submission.submittedAt.toLocaleDateString()} - 
                      Durée: {Math.floor(submission.duration / 60)}min {submission.duration % 60}s
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">
                  Aucune soumission disponible
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions FAB */}
      {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => navigate('/exercises/new')}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default Dashboard;
