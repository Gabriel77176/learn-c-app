import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Grid,
  IconButton,
  Divider,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Add, Delete, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { exerciseService, exerciseOptionService, lessonService } from '../services/firebase';
import { ExerciseType, Lesson } from '../types';

interface ExerciseOption {
  optionText: string;
  isCorrect: boolean;
}

const CreateExercise: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'text' as ExerciseType,
    timeLimit: undefined as number | undefined
  });
  
  const [options, setOptions] = useState<ExerciseOption[]>([
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false }
  ]);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    if (!lessonId) return;
    
    try {
      const lessonData = await lessonService.getLesson(lessonId);
      if (lessonData) {
        setLesson(lessonData);
      } else {
        setError('Leçon non trouvée');
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      setError('Erreur lors du chargement de la leçon');
    }
  };

  const handleFormChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleAddOption = () => {
    setOptions(prev => [...prev, { optionText: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, field: 'optionText' | 'isCorrect') => (e: any) => {
    setOptions(prev => prev.map((option, i) => 
      i === index 
        ? { ...option, [field]: field === 'isCorrect' ? e.target.checked : e.target.value }
        : option
    ));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('La description est requise');
      return false;
    }
    
    if (formData.timeLimit !== undefined && formData.timeLimit < 1) {
      setError('La durée doit être d\'au moins 1 minute');
      return false;
    }
    
    if (formData.type === 'qcm') {
      const validOptions = options.filter(opt => opt.optionText.trim());
      if (validOptions.length < 2) {
        setError('Au moins 2 options sont requises pour un QCM');
        return false;
      }
      
      const correctOptions = validOptions.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) {
        setError('Au moins une option doit être marquée comme correcte');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !lessonId) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Create exercise
      const exerciseData = {
        lessonId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        ...(formData.timeLimit !== undefined && { timeLimit: formData.timeLimit })
      };
      const exerciseId = await exerciseService.createExercise(exerciseData);
      
      // Create options for QCM
      if (formData.type === 'qcm') {
        const validOptions = options.filter(opt => opt.optionText.trim());
        if (validOptions.length > 0) {
          await exerciseOptionService.createOptions(exerciseId, validOptions);
        }
      }
      
      navigate(`/lessons/${lessonId}`);
    } catch (error) {
      console.error('Error creating exercise:', error);
      setError('Erreur lors de la création de l\'exercice');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
    return (
      <Alert severity="error">
        Vous n'avez pas les permissions pour créer des exercices.
      </Alert>
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
        <Typography variant="h4">
          Créer un exercice
        </Typography>
      </Box>

      {lesson && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Leçon: {lesson.title}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Titre de l'exercice"
                value={formData.title}
                onChange={handleFormChange('title')}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Type d'exercice</InputLabel>
                <Select
                  value={formData.type}
                  label="Type d'exercice"
                  onChange={handleFormChange('type')}
                >
                  <MenuItem value="text">Texte libre</MenuItem>
                  <MenuItem value="qcm">QCM</MenuItem>
                  <MenuItem value="code">Code</MenuItem>
                  <MenuItem value="file">Fichier</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description/Énoncé"
                value={formData.description}
                onChange={handleFormChange('description')}
                required
                placeholder="Décrivez l'exercice, les consignes, ce qui est attendu..."
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Durée (minutes)"
                value={formData.timeLimit || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    timeLimit: value === '' ? undefined : parseInt(value)
                  }));
                }}
                inputProps={{ min: 1, max: 300 }}
                placeholder="Optionnel"
                helperText="Laissez vide pour aucune limite de temps"
              />
            </Grid>

            {/* QCM Options */}
            {formData.type === 'qcm' && (
              <>
                <Grid size={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Options de réponse
                    </Typography>
                    <Button
                      startIcon={<Add />}
                      onClick={handleAddOption}
                      variant="outlined"
                      size="small"
                    >
                      Ajouter une option
                    </Button>
                  </Box>
                </Grid>
                
                {options.map((option, index) => (
                  <Grid size={12} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TextField
                        fullWidth
                        label={`Option ${index + 1}`}
                        value={option.optionText}
                        onChange={handleOptionChange(index, 'optionText')}
                        placeholder="Texte de l'option..."
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={option.isCorrect}
                            onChange={handleOptionChange(index, 'isCorrect')}
                            color="primary"
                          />
                        }
                        label="Correcte"
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveOption(index)}
                        disabled={options.length <= 2}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
                
                <Grid size={12}>
                  <Alert severity="info">
                    Cochez les cases "Correcte" pour indiquer les bonnes réponses. 
                    Plusieurs réponses peuvent être correctes.
                  </Alert>
                </Grid>
              </>
            )}


            {/* Code Exercise Info */}
            {formData.type === 'code' && (
              <Grid size={12}>
                <Alert severity="info">
                  Les étudiants pourront saisir leur code dans une zone de texte. 
                  Idéal pour des exercices de programmation courts.
                </Alert>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer l\'exercice'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateExercise;
