import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Delete,
  Visibility,
  School,
  People,
  Assignment
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  lessonService,
  userService,
  submissionService,
  exerciseService
} from '../services/firebase';
import { Lesson, User, Submission } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

interface GroupedSubmission extends Submission {
  exerciseTitle: string;
  studentName: string;
  attemptCount: number;
  allSubmissionIds: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const TeacherManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(() => {
    // Check if we should open a specific tab from navigation state
    return location.state?.initialTab || 0;
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<GroupedSubmission[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; name: string }>({
    open: false,
    type: '',
    id: '',
    name: ''
  });

  useEffect(() => {
    if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      
      // Load lessons
      console.log('Loading lessons...');
      const lessonsData = await lessonService.getAllLessons();
      setLessons(lessonsData);
      
      // Load students
      console.log('Loading students...');
      const studentsData = await userService.getUsersByRole('student');
      setStudents(studentsData);
      
      // Load submissions with additional info and group by student+exercise
      console.log('Loading submissions...');
      const submissionGroups = new Map<string, GroupedSubmission>();
      
      for (const lesson of lessonsData) {
        const exercises = await exerciseService.getExercisesByLesson(lesson.id);
        for (const exercise of exercises) {
          const exerciseSubmissions = await submissionService.getSubmissionsByExercise(exercise.id);
          
          // Group submissions by student for this exercise
          const studentSubmissions = new Map<string, Submission[]>();
          for (const submission of exerciseSubmissions) {
            const studentId = submission.studentId;
            if (!studentSubmissions.has(studentId)) {
              studentSubmissions.set(studentId, []);
            }
            studentSubmissions.get(studentId)!.push(submission);
          }
          
          // Create grouped submissions (most recent per student+exercise)
          studentSubmissions.forEach((submissions, studentId) => {
            const student = studentsData.find(s => s.id === studentId);
            const sortedSubmissions = submissions.sort((a: Submission, b: Submission) => 
              b.submittedAt.getTime() - a.submittedAt.getTime()
            );
            const mostRecent = sortedSubmissions[0];
            
            const groupKey = `${studentId}-${exercise.id}`;
            submissionGroups.set(groupKey, {
              ...mostRecent,
              exerciseTitle: exercise.title,
              studentName: student?.name || 'Student inconnu',
              attemptCount: submissions.length,
              allSubmissionIds: submissions.map((s: Submission) => s.id)
            });
          });
        }
      }
      
      const submissionsData = Array.from(submissionGroups.values());
      console.log('Total submissions loaded:', submissionsData.length);
      setSubmissions(submissionsData);
      
    } catch (error) {
      console.error('Error loading teacher management data:', error);
    } finally {
      // Loading finished
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await lessonService.deleteLesson(lessonId);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
      alert('Leçon supprimée avec succès!');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Erreur lors de la suppression de la leçon');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      // Note: In a real app, you might want to handle this more carefully
      // as deleting a user might break references in other documents
      await userService.deleteUser(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
      alert('Étudiant supprimé avec succès!');
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Erreur lors de la suppression de l\'étudiant');
    }
  };


  if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
    return (
      <Alert severity="error">
        Vous n'avez pas les permissions pour accéder à cette page.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion Enseignant
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<School />} label="Leçons" />
          <Tab icon={<People />} label="Étudiants" />
          <Tab icon={<Assignment />} label="Soumissions" />
        </Tabs>

        {/* Lessons Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Gestion des Leçons ({lessons.length})
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Matière</TableCell>
                  <TableCell>Créé le</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>{lesson.title}</TableCell>
                    <TableCell>{lesson.subjectId}</TableCell>
                    <TableCell>{lesson.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => window.open(`/lessons/${lesson.id}`, '_blank')}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteDialog({
                          open: true,
                          type: 'lesson',
                          id: lesson.id,
                          name: lesson.title
                        })}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Students Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Gestion des Étudiants ({students.length})
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Inscrit le</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteDialog({
                          open: true,
                          type: 'student',
                          id: student.id,
                          name: student.name
                        })}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Submissions Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Soumissions à Corriger ({submissions.length})
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              {submissions.length === 0 && (
                <Alert severity="info">
                  Aucune soumission trouvée. Assurez-vous que des étudiants ont soumis des exercices.
                </Alert>
              )}
            </Box>
            <Button 
              variant="outlined" 
              onClick={loadData}
              startIcon={<School />}
            >
              Actualiser
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Exercice</TableCell>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Tentatives</TableCell>
                  <TableCell>Soumis le</TableCell>
                  <TableCell>Durée</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={`${submission.studentId}-${submission.exerciseId}`}>
                    <TableCell>{submission.exerciseTitle}</TableCell>
                    <TableCell>{submission.studentName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary">
                        {submission.attemptCount} tentative{submission.attemptCount > 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>{submission.submittedAt.toLocaleDateString()}</TableCell>
                    <TableCell>{Math.floor(submission.duration / 60)}min {submission.duration % 60}s</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/submission/${submission.id}`)}
                          title="Voir la dernière soumission"
                        >
                          <Visibility />
                        </IconButton>
                        {submission.attemptCount > 1 && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/exercise/${submission.exerciseId}/student/${submission.studentId}/submissions`)}
                          >
                            Voir toutes ({submission.attemptCount})
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: '', id: '', name: '' })}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer {deleteDialog.type === 'lesson' ? 'la leçon' : 'l\'étudiant'} "{deleteDialog.name}" ?
            {deleteDialog.type === 'lesson' && ' Tous les exercices associés seront également supprimés.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: '', id: '', name: '' })}>
            Annuler
          </Button>
          <Button
            color="error"
            onClick={() => deleteDialog.type === 'lesson' 
              ? handleDeleteLesson(deleteDialog.id) 
              : handleDeleteStudent(deleteDialog.id)
            }
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default TeacherManagement;
