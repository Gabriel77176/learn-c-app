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
  Rating
} from '@mui/material';
import { ArrowBack, Visibility, AccessTime } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  exerciseService,
  submissionService,
  gradeService
} from '../services/firebase';
import { Exercise, Submission, Grade } from '../types';

interface SubmissionWithGrade extends Submission {
  grade?: Grade | null;
}

const ExerciseSubmissions: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (exerciseId && currentUser) {
      loadSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId, currentUser]); // loadSubmissions is stable and doesn't need to be in deps

  const loadSubmissions = async () => {
    if (!exerciseId || !currentUser) return;

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

      // Load user's submissions for this exercise
      const allSubmissions = await submissionService.getSubmissionsByExercise(exerciseId);
      const userSubmissions = allSubmissions.filter(s => s.studentId === currentUser.id);

      // Load grades for each submission
      const submissionsWithGrades = await Promise.all(
        userSubmissions.map(async (submission) => {
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
      console.error('Error loading submissions:', error);
      setError('Erreur lors du chargement des soumissions');
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
      return submission.answerText.length > 100 
        ? `${submission.answerText.substring(0, 100)}...`
        : submission.answerText;
    }
    if (submission.selectedOptions && submission.selectedOptions.length > 0) {
      return `QCM: ${submission.selectedOptions.join(', ')}`;
    }
    return 'Pas de réponse';
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

  if (!exercise) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Exercice non trouvé
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
            Historique des soumissions
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {exercise.title}
          </Typography>
        </Box>
      </Box>

      {/* Summary */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Vous avez effectué {submissions.length} tentative{submissions.length > 1 ? 's' : ''} pour cet exercice.
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

                  {submission.grade && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="body2">Note:</Typography>
                      <Rating
                        value={submission.grade.grade}
                        max={5}
                        size="small"
                        readOnly
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({submission.grade.grade}/5)
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" sx={{ 
                    backgroundColor: 'grey.100', 
                    p: 1, 
                    borderRadius: 1,
                    fontStyle: 'italic'
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
                  >
                    Voir en détail
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
          Aucune soumission trouvée pour cet exercice.
        </Alert>
      )}

      {/* Quick Actions */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => navigate(`/exercise/${exerciseId}`)}
        >
          Nouvelle tentative
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          Retour à la leçon
        </Button>
      </Box>
    </Box>
  );
};

export default ExerciseSubmissions;
