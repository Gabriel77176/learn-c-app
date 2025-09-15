import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Exercise } from '../../types';

interface TextExerciseProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  isSubmitted: boolean;
  initialAnswer?: string;
}

const TextExercise: React.FC<TextExerciseProps> = ({
  exercise,
  onSubmit,
  isSubmitted,
  initialAnswer = ''
}) => {
  const [answer, setAnswer] = useState(initialAnswer);

  const handleSubmit = () => {
    if (answer.trim().length === 0) {
      alert('Veuillez saisir une réponse');
      return;
    }
    onSubmit(answer.trim());
  };

  const wordCount = answer.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = answer.length;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {exercise.title}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <ReactMarkdown>{exercise.description}</ReactMarkdown>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Rédigez votre réponse dans la zone de texte ci-dessous. 
        Prenez le temps de bien structurer votre réponse.
      </Alert>

      <TextField
        fullWidth
        multiline
        rows={8}
        variant="outlined"
        label="Votre réponse"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={isSubmitted}
        placeholder="Saisissez votre réponse ici..."
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {wordCount} mot{wordCount !== 1 ? 's' : ''} • {charCount} caractère{charCount !== 1 ? 's' : ''}
        </Typography>
        
        {!isSubmitted && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={answer.trim().length === 0}
          >
            Soumettre la réponse
          </Button>
        )}
      </Box>

      {isSubmitted && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Votre réponse a été soumise avec succès. Elle sera évaluée par votre enseignant.
        </Alert>
      )}
    </Paper>
  );
};

export default TextExercise;
