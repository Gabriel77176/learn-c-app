import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { exerciseService, exerciseOptionService } from '../services/firebase';
import { Exercise, ExerciseType } from '../types';

const EditExercise: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'text' as ExerciseType,
    timeLimit: undefined as number | undefined
  });

  const [qcmOptions, setQcmOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);

  useEffect(() => {
    if (exerciseId) {
      loadExercise();
    }
  }, [exerciseId]);

  const loadExercise = async () => {
    if (!exerciseId) return;

    try {
      setLoading(true);
      const exerciseData = await exerciseService.getExercise(exerciseId);
      
      if (!exerciseData) {
        setError('Exercice non trouvé');
        return;
      }

      setExercise(exerciseData);
      setFormData({
        title: exerciseData.title,
        description: exerciseData.description,
        type: exerciseData.type,
        timeLimit: exerciseData.timeLimit
      });

      // Load options for QCM
      if (exerciseData.type === 'qcm') {
        const optionsData = await exerciseOptionService.getOptionsByExercise(exerciseId);
        
        // Convert to form format
        const formattedOptions = optionsData.map(option => ({
          text: option.optionText,
          isCorrect: option.isCorrect
        }));
        
        // Ensure at least 2 options
        while (formattedOptions.length < 2) {
          formattedOptions.push({ text: '', isCorrect: false });
        }
        
        setQcmOptions(formattedOptions);
      }
    } catch (error) {
      console.error('Error loading exercise:', error);
      setError('Erreur lors du chargement de l\'exercice');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exercise || !exerciseId) return;

    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (formData.timeLimit !== undefined && formData.timeLimit < 1) {
      setError('La durée doit être d\'au moins 1 minute');
      return;
    }

    if (formData.type === 'qcm') {
      const validOptions = qcmOptions.filter(opt => opt.text.trim() !== '');
      const correctOptions = validOptions.filter(opt => opt.isCorrect);
      
      if (validOptions.length < 2) {
        setError('Un QCM doit avoir au moins 2 options');
        return;
      }
      
      if (correctOptions.length === 0) {
        setError('Un QCM doit avoir au moins une bonne réponse');
        return;
      }
    }

    try {
      setSaving(true);
      setError('');

      // Update exercise
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        ...(formData.timeLimit !== undefined && { timeLimit: formData.timeLimit })
      };
      await exerciseService.updateExercise(exerciseId, updateData);

      // Update options for QCM
      if (formData.type === 'qcm') {
        const validOptions = qcmOptions
          .filter(opt => opt.text.trim() !== '')
          .map((opt, index) => ({
            id: `temp_${index}`, // Temporary ID for new options
            optionText: opt.text.trim(),
            isCorrect: opt.isCorrect
          }));

        await exerciseOptionService.updateOptions(exerciseId, validOptions);
      }

      alert('Exercice modifié avec succès !');
      navigate(`/lessons/${exercise.lessonId}`);
    } catch (error) {
      console.error('Error updating exercise:', error);
      setError('Erreur lors de la modification de l\'exercice');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    let value = e.target.value;
    
    // Handle timeLimit conversion
    if (field === 'timeLimit') {
      value = value === '' ? undefined : parseInt(value as string);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addQcmOption = () => {
    setQcmOptions(prev => [...prev, { text: '', isCorrect: false }]);
  };

  const removeQcmOption = (index: number) => {
    if (qcmOptions.length > 2) {
      setQcmOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateQcmOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setQcmOptions(prev => prev.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    ));
  };

  if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
    return (
      <Alert severity="error">
        Vous n'avez pas les permissions pour modifier des exercices.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !exercise) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
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
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          Modifier l'Exercice
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Titre de l'exercice"
            value={formData.title}
            onChange={handleInputChange('title')}
            required
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type d'exercice</InputLabel>
              <Select
                value={formData.type}
                label="Type d'exercice"
                onChange={handleInputChange('type')}
              >
                <MenuItem value="qcm">QCM</MenuItem>
                <MenuItem value="text">Texte</MenuItem>
                <MenuItem value="code">Code</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="Durée (minutes)"
              value={formData.timeLimit || ''}
              onChange={handleInputChange('timeLimit')}
              inputProps={{ min: 1, max: 180 }}
              placeholder="Optionnel"
              helperText="Laissez vide pour aucune limite de temps"
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description / Énoncé"
            value={formData.description}
            onChange={handleInputChange('description')}
            helperText="Vous pouvez utiliser la syntaxe Markdown"
            required
          />

          {/* QCM Options */}
          {formData.type === 'qcm' && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Options de réponse
              </Typography>
              
              {qcmOptions.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updateQcmOption(index, 'text', e.target.value)}
                    required
                  />
                  <FormControl>
                    <InputLabel>Correcte?</InputLabel>
                    <Select
                      value={option.isCorrect.toString()}
                      onChange={(e) => updateQcmOption(index, 'isCorrect', e.target.value === 'true')}
                      sx={{ minWidth: 100 }}
                    >
                      <MenuItem value="false">Non</MenuItem>
                      <MenuItem value="true">Oui</MenuItem>
                    </Select>
                  </FormControl>
                  {qcmOptions.length > 2 && (
                    <Button
                      color="error"
                      onClick={() => removeQcmOption(index)}
                    >
                      Supprimer
                    </Button>
                  )}
                </Box>
              ))}
              
              <Button onClick={addQcmOption} variant="outlined">
                Ajouter une option
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={saving}
            >
              {saving ? 'Modification...' : 'Modifier l\'Exercice'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditExercise;
