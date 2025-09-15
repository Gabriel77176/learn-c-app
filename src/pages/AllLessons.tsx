import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add,
  School,
  Delete,
  Edit,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { lessonService, subjectService } from '../services/firebase';
import { Lesson, Subject } from '../types';

const AllLessons: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; lesson: Lesson | null }>({
    open: false,
    lesson: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading all lessons and subjects...');
      
      const [lessonsData, subjectsData] = await Promise.all([
        lessonService.getAllLessons(),
        subjectService.getAllSubjects()
      ]);
      
      console.log('Lessons loaded:', lessonsData.length);
      console.log('Subjects loaded:', subjectsData.length);
      
      setLessons(lessonsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Matière inconnue';
  };

  const handleDeleteLesson = async () => {
    if (!deleteDialog.lesson) return;

    try {
      await lessonService.deleteLesson(deleteDialog.lesson.id);
      setLessons(prev => prev.filter(l => l.id !== deleteDialog.lesson!.id));
      setDeleteDialog({ open: false, lesson: null });
      alert('Leçon supprimée avec succès!');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Erreur lors de la suppression de la leçon');
    }
  };

  if (!currentUser) {
    return (
      <Alert severity="error">
        Vous devez être connecté pour voir cette page.
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Toutes les Leçons ({lessons.length})
        </Typography>
        
        {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/lessons/new')}
          >
            Nouvelle Leçon
          </Button>
        )}
      </Box>

      {lessons.length === 0 ? (
        <Alert severity="info">
          Aucune leçon disponible. 
          {(currentUser.role === 'teacher' || currentUser.role === 'admin') && 
            ' Créez votre première leçon !'
          }
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          {lessons.map((lesson) => (
            <Card 
              key={lesson.id}
              elevation={2}
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  elevation: 4
                }
              }}
            >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {lesson.title}
                  </Typography>
                  
                  <Chip
                    icon={<School />}
                    label={getSubjectName(lesson.subjectId)}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary">
                    Créé le {lesson.createdAt.toLocaleDateString()}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {lesson.notions.length} notion(s)
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/lessons/${lesson.id}`)}
                  >
                    Voir
                  </Button>
                  
                  {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                    <>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/lessons/${lesson.id}/edit`)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setDeleteDialog({ open: true, lesson })}
                      >
                        Supprimer
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, lesson: null })}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer la leçon "{deleteDialog.lesson?.title}" ?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Tous les exercices associés seront également supprimés.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, lesson: null })}>
            Annuler
          </Button>
          <Button color="error" onClick={handleDeleteLesson}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllLessons;
