import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Rating,
  Divider
} from '@mui/material';
import { ArrowBack, Visibility, AccessTime, Person, Assignment } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  exerciseService,
  submissionService,
  gradeService,
  userService
} from '../services/firebase';
import { Exercise, Submission, Grade, User } from '../types';

interface SubmissionWithGrade extends Submission {
  grade?: Grade | null;
}

const StudentSubmissions: React.FC = () => {
  const { exerciseId, studentId } = useParams<{ exerciseId: string; studentId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  useEffect(() => {
    if (exerciseId && studentId && currentUser && isTeacher) {
      loadData();
    } else if (!isTeacher) {
      setError('Accès non autorisé');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId, studentId, currentUser, isTeacher]);

  const loadData = async () => {
    if (!exerciseId || !studentId) return;

    try {
      setLoading(true);
      setError('');

      // Load exercise details
      const exerciseData = await exerciseService.getExercise(exerciseId);
      if (!exerciseData) {
        setError('Exercice non trouvé');
        return;
      }
      setExercise(exerciseData);

      // Load student details
      const studentData = await userService.getUser(studentId);
      if (!studentData) {
        setError('Étudiant non trouvé');
        return;
      }
      setStudent(studentData);

      // Load student's submissions for this exercise
      const studentSubmissions = await submissionService.getSubmissionsByStudentAndExercise(studentId, exerciseId);

      // Load grades for each submission
      const submissionsWithGrades = await Promise.all(
        studentSubmissions.map(async (submission) => {
          try {
            const grade = await gradeService.getGradeBySubmission(submission.id);
            return { ...submission, grade };
          } catch (error) {
            console.error('Error loading grade for submission:', submission.id, error);
            return submission;
          }
        })
      );

      setSubmissions(submissionsWithGrades);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}min ${remainingSeconds}s`;
  };

  const getSubmissionPreview = (submission: Submission) => {
    if (submission.answerText) {
      return submission.answerText.length > 150 
        ? `${submission.answerText.substring(0, 150)}...`
        : submission.answerText;
    }
    if (submission.selectedOptions && submission.selectedOptions.length > 0) {
      return `QCM: ${submission.selectedOptions.join(', ')}`;
    }
    return 'Pas de réponse';
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 4) return 'success';
    if (grade >= 3) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </Box>
    );
  }

  if (!exercise || !student) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Données non trouvées
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
        <Box>
          <Typography variant="h4">
            Soumissions de l'étudiant
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person color="primary" />
              <Typography variant="h6" color="primary">
                {student.name}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment color="secondary" />
              <Typography variant="h6" color="secondary">
                {exercise.title}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Summary */}
      <Alert 
        severity={submissions.length > 0 ? "info" : "warning"} 
        sx={{ mb: 3 }}
      >
        {submissions.length > 0 
          ? `L'étudiant a effectué ${submissions.length} tentative${submissions.length > 1 ? 's' : ''} pour cet exercice.`
          : "L'étudiant n'a pas encore soumis de réponse pour cet exercice."
        }
      </Alert>

      {/* Submissions Grid */}
      {submissions.length > 0 ? (
        <Grid container spacing={3}>
          {submissions.map((submission, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={submission.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: index === 0 ? '2px solid' : '1px solid',
                  borderColor: index === 0 ? 'primary.main' : 'divider',
                  backgroundColor: index === 0 ? 'primary.50' : 'background.paper'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Tentative #{submissions.length - index}
                    </Typography>
                    {index === 0 && (
                      <Chip
                        label="Plus récente"
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <AccessTime fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {submission.submittedAt.toLocaleDateString()} à {submission.submittedAt.toLocaleTimeString()}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Durée: {formatDuration(submission.duration)}
                  </Typography>

                  {submission.grade ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="body2">Note:</Typography>
                      <Rating
                        value={submission.grade.grade}
                        max={5}
                        size="small"
                        readOnly
                      />
                      <Chip
                        label={`${submission.grade.grade}/5`}
                        color={getGradeColor(submission.grade.grade)}
                        size="small"
                      />
                    </Box>
                  ) : (
                    <Chip
                      label="Non noté"
                      color="default"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Typography variant="body2" sx={{ 
                    backgroundColor: 'grey.100', 
                    p: 1, 
                    borderRadius: 1,
                    fontStyle: 'italic',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {getSubmissionPreview(submission)}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/submission/${submission.id}`)}
                    size="small"
                    fullWidth
                    variant={submission.grade ? "outlined" : "contained"}
                  >
                    {submission.grade ? "Voir / Modifier note" : "Corriger"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune soumission
          </Typography>
          <Typography variant="body2" color="text.secondary">
            L'étudiant n'a pas encore soumis de réponse pour cet exercice.
          </Typography>
        </Box>
      )}

      {/* Quick Actions */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/teacher-management')}
        >
          Gestion des étudiants
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </Box>
    </Box>
  );
};

export default StudentSubmissions;
