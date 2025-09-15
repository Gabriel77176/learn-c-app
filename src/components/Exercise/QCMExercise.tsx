import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Paper,
  Alert
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Exercise, ExerciseOption } from '../../types';

interface QCMExerciseProps {
  exercise: Exercise;
  options: ExerciseOption[];
  onSubmit: (selectedOptions: string[]) => void;
  isSubmitted: boolean;
  showResults?: boolean;
  userAnswers?: string[];
}

const QCMExercise: React.FC<QCMExerciseProps> = ({
  exercise,
  options,
  onSubmit,
  isSubmitted,
  showResults = false,
  userAnswers = []
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(userAnswers);
  const correctOptions = options.filter(option => option.isCorrect);
  const isMultipleChoice = correctOptions.length > 1;

  const handleOptionChange = (optionId: string) => {
    if (isSubmitted) return;

    if (isMultipleChoice) {
      setSelectedOptions(prev => 
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0) {
      alert('Veuillez sélectionner au moins une réponse');
      return;
    }
    onSubmit(selectedOptions);
  };

  const getOptionColor = (option: ExerciseOption) => {
    if (!showResults) return 'default';
    
    const isSelected = selectedOptions.includes(option.id);
    const isCorrect = option.isCorrect;
    
    if (isSelected && isCorrect) return 'success';
    if (isSelected && !isCorrect) return 'error';
    if (!isSelected && isCorrect) return 'warning';
    return 'default';
  };

  const getOptionLabel = (option: ExerciseOption) => {
    if (!showResults) return option.optionText;
    
    const isSelected = selectedOptions.includes(option.id);
    const isCorrect = option.isCorrect;
    
    let label = option.optionText;
    if (isCorrect) label += ' ✓';
    if (isSelected && !isCorrect) label += ' ✗';
    
    return label;
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {exercise.title}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <ReactMarkdown>{exercise.description}</ReactMarkdown>
      </Box>

      {isMultipleChoice && !isSubmitted && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Plusieurs réponses sont possibles pour cette question.
        </Alert>
      )}

      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">
          {isMultipleChoice ? 'Sélectionnez une ou plusieurs réponses:' : 'Sélectionnez une réponse:'}
        </FormLabel>
        
        {isMultipleChoice ? (
          <Box sx={{ mt: 2 }}>
            {options.map((option) => (
              <FormControlLabel
                key={option.id}
                control={
                  <Checkbox
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => handleOptionChange(option.id)}
                    disabled={isSubmitted}
                    color={getOptionColor(option) as any}
                  />
                }
                label={getOptionLabel(option)}
                sx={{
                  display: 'block',
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: showResults && selectedOptions.includes(option.id) 
                    ? option.isCorrect ? 'success.light' : 'error.light'
                    : showResults && option.isCorrect && !selectedOptions.includes(option.id)
                    ? 'warning.light'
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isSubmitted ? undefined : 'action.hover'
                  }
                }}
              />
            ))}
          </Box>
        ) : (
          <RadioGroup
            value={selectedOptions[0] || ''}
            onChange={(e) => handleOptionChange(e.target.value)}
            sx={{ mt: 2 }}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.id}
                control={
                  <Radio 
                    disabled={isSubmitted}
                    color={getOptionColor(option) as any}
                  />
                }
                label={getOptionLabel(option)}
                sx={{
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: showResults && selectedOptions.includes(option.id) 
                    ? option.isCorrect ? 'success.light' : 'error.light'
                    : showResults && option.isCorrect && !selectedOptions.includes(option.id)
                    ? 'warning.light'
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isSubmitted ? undefined : 'action.hover'
                  }
                }}
              />
            ))}
          </RadioGroup>
        )}
      </FormControl>

      {!isSubmitted && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={selectedOptions.length === 0}
          >
            Soumettre la réponse
          </Button>
        </Box>
      )}

      {showResults && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Résultats:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Réponses correctes: {correctOptions.map(opt => opt.optionText).join(', ')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default QCMExercise;
