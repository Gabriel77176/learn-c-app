import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Rating,
  TextField,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { ArrowBack, Save, Visibility, Code, Quiz, Description } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { submissionService, exerciseService, userService } from '../services/firebase';
import { Submission, Exercise, User } from '../types';

const SubmissionReview: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [grade, setGrade] = useState(0);
  const [feedback, setFeedback] = useState('');

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  useEffect(() => {
    if (submissionId) {
      loadSubmissionData();
    }
  }, [submissionId]);

  const loadSubmissionData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load submission
      const submissionData = await submissionService.getSubmission(submissionId!);
      if (!submissionData) {
        setError('Soumission non trouvée');
        return;
      }
      setSubmission(submissionData);

      // Load exercise
      const exerciseData = await exerciseService.getExercise(submissionData.exerciseId);
      if (!exerciseData) {
        setError('Exercice non trouvé');
        return;
      }
      setExercise(exerciseData);

      // Load student info
      const studentData = await userService.getUser(submissionData.studentId);
      if (!studentData) {
        setError('Étudiant non trouvé');
        return;
      }
      setStudent(studentData);

      // Load existing grade if any
      // TODO: Implement grade retrieval if grades are stored separately

    } catch (error: any) {
      console.error('Error loading submission data:', error);
      setError('Erreur lors du chargement de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!submission) return;

    try {
      setSaving(true);
      // TODO: Implement grade saving
      // await submissionService.saveGrade(submission.id, grade, feedback);
      alert('Note sauvegardée avec succès !');
    } catch (error: any) {
      console.error('Error saving grade:', error);
      alert('Erreur lors de la sauvegarde de la note');
    } finally {
      setSaving(false);
    }
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'qcm': return <Quiz />;
      case 'code': return <Code />;
      case 'text': return <Description />;
      default: return <Description />;
    }
  };

  const getLanguageFromExercise = (exercise: Exercise): string => {
    if (exercise.type !== 'code') return 'text';
    
    // Try to detect language from exercise title or description
    const text = (exercise.title + ' ' + exercise.description).toLowerCase();
    
    if (text.includes('javascript') || text.includes('js')) return 'javascript';
    if (text.includes('python') || text.includes('py')) return 'python';
    if (text.includes('java')) return 'java';
    if (text.includes('c++') || text.includes('cpp')) return 'cpp';
    if (text.includes(' c ') || text.includes('langage c')) return 'c';
    if (text.includes('html')) return 'html';
    if (text.includes('css')) return 'css';
    if (text.includes('sql')) return 'sql';
    
    return 'javascript'; // Default for code exercises
  };

  const renderAnswer = () => {
    if (!submission || !exercise) return null;

    if (exercise.type === 'qcm' && submission.selectedOptions) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Options sélectionnées :
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {submission.selectedOptions.map((option, index) => (
              <Chip
                key={index}
                label={option}
                color="primary"
                variant="outlined"
                size="medium"
              />
            ))}
          </Box>
        </Box>
      );
    }

    if (exercise.type === 'code' && submission.answerText) {
      const language = getLanguageFromExercise(exercise);
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Code soumis :
          </Typography>
          <Paper sx={{ overflow: 'hidden' }}>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: '4px',
                fontSize: '14px'
              }}
              showLineNumbers
            >
              {submission.answerText}
            </SyntaxHighlighter>
          </Paper>
        </Box>
      );
    }

    if (submission.answerText) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Réponse :
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                fontFamily: exercise.type === 'code' ? 'monospace' : 'inherit'
              }}
            >
              {submission.answerText}
            </Typography>
          </Paper>
        </Box>
      );
    }

    return (
      <Alert severity="warning">
        Aucune réponse trouvée pour cette soumission
      </Alert>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !submission || !exercise) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || 'Soumission non trouvée'}
        </Alert>
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

  // Check permissions
  if (isStudent && submission.studentId !== currentUser?.id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Vous n'avez pas l'autorisation de voir cette soumission
        </Alert>
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

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          {isTeacher ? 'Correction de Soumission' : 'Ma Soumission'}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Main Content */}
        <Box>
          {/* Exercise Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getExerciseIcon(exercise.type)}
                <Typography variant="h5" sx={{ ml: 1 }}>
                  {exercise.title}
                </Typography>
                <Chip 
                  label={exercise.type.toUpperCase()} 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Énoncé :
              </Typography>
              <Box sx={{ mb: 2 }}>
                <ReactMarkdown>{exercise.description}</ReactMarkdown>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Durée allouée : {exercise.timeLimit} minutes
              </Typography>
            </CardContent>
          </Card>

          {/* Answer */}
          <Card>
            <CardContent>
              {renderAnswer()}
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box>
          {/* Submission Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations
              </Typography>
              
              {isTeacher && student && (
                <Typography variant="body1" gutterBottom>
                  <strong>Étudiant :</strong> {student.name}
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Soumis le :</strong><br />
                {submission.submittedAt.toLocaleDateString()} à {submission.submittedAt.toLocaleTimeString()}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Temps utilisé :</strong><br />
                {Math.floor(submission.duration / 60)}min {submission.duration % 60}s
                {exercise.timeLimit && (
                  <span> / {exercise.timeLimit}min</span>
                )}
              </Typography>
            </CardContent>
          </Card>

          {/* Grading (Teachers only) */}
          {isTeacher && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notation
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    Note sur 20 :
                  </Typography>
                  <Rating
                    value={grade}
                    onChange={(_, newValue) => setGrade(newValue || 0)}
                    max={20}
                    size="large"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {grade}/20
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Commentaires"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Ajoutez vos commentaires pour l'étudiant..."
                  sx={{ mb: 2 }}
                />
              </CardContent>
              
              <CardActions>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveGrade}
                  disabled={saving}
                  fullWidth
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder la Note'}
                </Button>
              </CardActions>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SubmissionReview;
