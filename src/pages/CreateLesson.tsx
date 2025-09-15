import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { lessonService, subjectService, notionService } from '../services/firebase';
import { Subject, Notion } from '../types';

const CreateLesson: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    notions: [] as string[]
  });
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notions, setNotions] = useState<Notion[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingNotion, setCreatingNotion] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (formData.subjectId) {
      loadNotions(formData.subjectId);
    } else {
      setNotions([]);
      setFormData(prev => ({ ...prev, notions: [] }));
    }
  }, [formData.subjectId]);

  const loadSubjects = async () => {
    try {
      const subjectsData = await subjectService.getAllSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError('Erreur lors du chargement des matières');
    }
  };

  const loadNotions = async (subjectId: string) => {
    try {
      const notionsData = await notionService.getNotionsBySubject(subjectId);
      setNotions(notionsData);
    } catch (error) {
      console.error('Error loading notions:', error);
      setError('Erreur lors du chargement des notions');
    }
  };

  const handleFormChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return false;
    }
    
    if (!formData.subjectId) {
      setError('La matière est requise');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      const lessonId = await lessonService.createLesson({
        title: formData.title,
        subjectId: formData.subjectId,
        createdBy: currentUser.id,
        notions: formData.notions
      });
      
      navigate(`/lessons/${lessonId}`);
    } catch (error) {
      console.error('Error creating lesson:', error);
      setError('Erreur lors de la création de la leçon');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    const subjectName = prompt('Nom de la nouvelle matière:');
    if (subjectName && subjectName.trim()) {
      try {
        await subjectService.createSubject(subjectName.trim());
        loadSubjects();
      } catch (error) {
        console.error('Error creating subject:', error);
        alert('Erreur lors de la création de la matière');
      }
    }
  };

  const handleCreateNotion = async () => {
    if (!formData.subjectId) {
      alert('Veuillez d\'abord sélectionner une matière');
      return;
    }
    
    if (creatingNotion) {
      console.log('Creation already in progress, ignoring duplicate request');
      return;
    }
    
    const notionName = prompt('Nom de la nouvelle notion:');
    if (!notionName || !notionName.trim()) {
      return;
    }
    
    const trimmedName = notionName.trim();
    
    // Check if notion with same name already exists
    const existingNotion = notions.find(notion => 
      notion.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingNotion) {
      alert('Une notion avec ce nom existe déjà pour cette matière');
      return;
    }
    
    setCreatingNotion(true);
    try {
      console.log('Creating notion:', trimmedName, 'for subject:', formData.subjectId);
      const notionId = await notionService.createNotion(trimmedName, formData.subjectId);
      console.log('Notion created successfully with ID:', notionId);
      await loadNotions(formData.subjectId);
      alert('Notion créée avec succès !');
    } catch (error: any) {
      console.error('Error creating notion:', error);
      
      if (error.code === 'already-exists') {
        alert('Cette notion existe déjà. Veuillez réessayer.');
      } else if (error.code === 'permission-denied') {
        alert('Vous n\'avez pas les permissions pour créer une notion.');
      } else {
        alert('Erreur lors de la création de la notion. Veuillez réessayer.');
      }
    } finally {
      setCreatingNotion(false);
    }
  };

  if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
    return (
      <Alert severity="error">
        Vous n'avez pas les permissions pour créer des leçons.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
        >
          Retour
        </Button>
        <Typography variant="h4">
          Créer une leçon
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Informations de la leçon
              </Typography>
            </Grid>
            
            <Grid size={12}>
              <TextField
                fullWidth
                label="Titre de la leçon"
                value={formData.title}
                onChange={handleFormChange('title')}
                required
                placeholder="Ex: Introduction aux pointeurs en C"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 8 }}>
              <FormControl fullWidth>
                <InputLabel>Matière</InputLabel>
                <Select
                  value={formData.subjectId}
                  label="Matière"
                  onChange={handleFormChange('subjectId')}
                  required
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCreateSubject}
                sx={{ height: 56 }}
              >
                Nouvelle matière
              </Button>
            </Grid>
            
            {formData.subjectId && (
              <>
                <Grid size={{ xs: 12, md: 8 }}>
                  <FormControl fullWidth>
                    <InputLabel>Notions abordées (optionnel)</InputLabel>
                    <Select
                      multiple
                      value={formData.notions}
                      onChange={handleFormChange('notions')}
                      input={<OutlinedInput label="Notions abordées (optionnel)" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const notion = notions.find(n => n.id === value);
                            return (
                              <Chip 
                                key={value} 
                                label={notion?.name || value} 
                                size="small" 
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {notions.map((notion) => (
                        <MenuItem key={notion.id} value={notion.id}>
                          <Checkbox checked={formData.notions.indexOf(notion.id) > -1} />
                          <ListItemText primary={notion.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCreateNotion}
                    sx={{ height: 56 }}
                  >
                    Nouvelle notion
                  </Button>
                </Grid>
              </>
            )}
            
            <Grid size={12}>
              <Alert severity="info">
                Les notions permettent de catégoriser les concepts abordés dans cette leçon 
                (ex: pointeurs, structures, allocation mémoire...). 
                Vous pourrez créer des exercices spécifiques à ces notions.
              </Alert>
            </Grid>
            
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer la leçon'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateLesson;
