import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack, PlayArrow } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  exerciseService,
  exerciseOptionService,
  submissionService
} from '../services/firebase';
import { Exercise, ExerciseOption, Submission } from '../types';
import Timer from '../components/Timer/Timer';
import QCMExercise from '../components/Exercise/QCMExercise';
import TextExercise from '../components/Exercise/TextExercise';
import CodeExercise from '../components/Exercise/CodeExercise';

const ExercisePage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [options, setOptions] = useState<ExerciseOption[]>([]);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    if (exerciseId) {
      loadExerciseData();
    }
  }, [exerciseId]);

  const loadExerciseData = async () => {
    try {
      setLoading(true);
      
      if (!exerciseId) return;
      
      // Load exercise
      const exerciseData = await exerciseService.getExercise(exerciseId);
      if (!exerciseData) {
        navigate('/');
        return;
      }
      setExercise(exerciseData);

      // Load options for QCM
      if (exerciseData.type === 'qcm') {
        const optionsData = await exerciseOptionService.getOptionsByExercise(exerciseId);
        setOptions(optionsData);
      }

      // Check if student has already submitted
      if (currentUser?.role === 'student') {
        const submissions = await submissionService.getSubmissionsByExercise(exerciseId);
        const userSubmission = submissions.find(s => s.studentId === currentUser.id);
        if (userSubmission) {
          setSubmission(userSubmission);
        }
      }
    } catch (error) {
      console.error('Error loading exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = () => {
    setConfirmDialog(true);
  };

  const confirmStartExercise = () => {
    setExerciseStarted(true);
    setStartTime(new Date());
    setConfirmDialog(false);
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    if (exerciseStarted && !submission) {
      // Auto-submit empty answer when time is up
      handleSubmitAnswer('');
    }
  };

  const calculateDuration = (): number => {
    if (!startTime) return 0;
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  };

  const handleSubmitAnswer = async (answer: string | string[]) => {
    if (!exercise || !currentUser || !startTime) {
      console.error('Missing required data for submission');
      return;
    }

    try {
      const duration = calculateDuration();
      let answerText = '';

      if (Array.isArray(answer)) {
        // QCM answers
        answerText = answer.join(',');
      } else {
        // Text answer
        answerText = answer;
      }

      const submissionData: Omit<Submission, 'id' | 'submittedAt'> = {
        exerciseId: exercise.id,
        studentId: currentUser.id,
        answerText,
        duration,
        ...(Array.isArray(answer) && { selectedOptions: answer })
      };
      
      const submissionId = await submissionService.createSubmission(submissionData);
      
      // Reload submission data
      const newSubmission = await submissionService.getSubmission(submissionId);
      setSubmission(newSubmission);
      setExerciseStarted(false);
      
      alert('Votre réponse a été soumise avec succès!');
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      alert(`Erreur lors de la soumission de votre réponse: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!exercise) {
    return (
      <Box>
        <Alert severity="error">Exercice non trouvé</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const hasSubmitted = submission !== null;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
        
        {exerciseStarted && (
          <Timer
            duration={exercise.timeLimit}
            isActive={exerciseStarted && !hasSubmitted && !timeUp}
            onTimeUp={handleTimeUp}
          />
        )}
      </Box>

      {/* Exercise Status */}
      {hasSubmitted && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => navigate(`/submission/${submission?.id}`)}
            >
              Voir ma soumission
            </Button>
          }
        >
          Vous avez déjà soumis votre réponse pour cet exercice.
          Durée: {Math.floor((submission?.duration || 0) / 60)}min {(submission?.duration || 0) % 60}s
        </Alert>
      )}

      {timeUp && !hasSubmitted && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Le temps est écoulé! Votre réponse a été automatiquement soumise.
        </Alert>
      )}

      {/* Start Exercise Button */}
      {!exerciseStarted && !hasSubmitted && currentUser?.role === 'student' && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            {exercise.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {exercise.description}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Durée: {exercise.timeLimit} minutes
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleStartExercise}
          >
            Commencer l'exercice
          </Button>
        </Box>
      )}

      {/* Exercise Content */}
      {(exerciseStarted || hasSubmitted || isTeacher) && (
        <Box>
          {exercise.type === 'qcm' && (
            <QCMExercise
              exercise={exercise}
              options={options}
              onSubmit={(selectedOptions) => handleSubmitAnswer(selectedOptions)}
              isSubmitted={hasSubmitted}
              showResults={isTeacher || hasSubmitted}
              userAnswers={submission?.selectedOptions}
            />
          )}

          {exercise.type === 'text' && (
            <TextExercise
              exercise={exercise}
              onSubmit={(answer) => handleSubmitAnswer(answer)}
              isSubmitted={hasSubmitted}
              initialAnswer={submission?.answerText}
            />
          )}


          {exercise.type === 'code' && (
            <CodeExercise
              exercise={exercise}
              onSubmit={(answer) => handleSubmitAnswer(answer)}
              isSubmitted={hasSubmitted}
              initialAnswer={submission?.answerText}
            />
          )}
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Commencer l'exercice</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous prêt à commencer cet exercice ? Le chronomètre démarrera immédiatement.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Durée: {exercise.timeLimit} minutes
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Annuler
          </Button>
          <Button onClick={confirmStartExercise} variant="contained">
            Commencer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExercisePage;
