import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Rating
} from '@mui/material';
import {
  Quiz,
  Description,
  Code,
  Edit,
  Delete,
  PlayArrow,
  AccessTime,
  Refresh,
  Visibility
} from '@mui/icons-material';
import { Exercise } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ExerciseCardProps {
  exercise: Exercise;
  onStart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isCompleted?: boolean;
  userGrade?: number;
  submissionCount?: number;
  lastSubmissionId?: string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onStart,
  onEdit,
  onDelete,
  isCompleted = false,
  userGrade,
  submissionCount = 0,
  lastSubmissionId
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'qcm':
        return <Quiz />;
      case 'text':
        return <Description />;
      case 'code':
        return <Code />;
      default:
        return <Description />;
    }
  };

  const getExerciseTypeLabel = (type: string) => {
    switch (type) {
      case 'qcm':
        return 'QCM';
      case 'text':
        return 'Texte';
      case 'code':
        return 'Code';
      default:
        return 'Exercice';
    }
  };

  const getExerciseTypeColor = (type: string) => {
    switch (type) {
      case 'qcm':
        return 'primary';
      case 'text':
        return 'secondary';
      case 'code':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        opacity: isCompleted ? 0.8 : 1,
        border: isCompleted ? '2px solid #4caf50' : 'none'
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getExerciseIcon(exercise.type)}
          <Typography variant="h6" component="h3" sx={{ ml: 1, flexGrow: 1 }}>
            {exercise.title}
          </Typography>
          <Chip
            label={getExerciseTypeLabel(exercise.type)}
            color={getExerciseTypeColor(exercise.type) as any}
            size="small"
          />
        </Box>


        {exercise.timeLimit && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Durée: {formatDuration(exercise.timeLimit)}
            </Typography>
          </Box>
        )}

        {isCompleted && userGrade !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Note:
            </Typography>
            <Rating
              value={userGrade}
              max={5}
              size="small"
              readOnly
            />
            <Typography variant="body2" color="text.secondary">
              ({userGrade}/5)
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Student Actions */}
          {currentUser?.role === 'student' && (
            <>
              {!isCompleted && onStart && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={onStart}
                  size="small"
                >
                  Commencer
                </Button>
              )}
              {isCompleted && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip
                    label={`${submissionCount} tentative${submissionCount > 1 ? 's' : ''}`}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={onStart}
                      size="small"
                    >
                      Réessayer
                    </Button>
                    {lastSubmissionId && (
                      <Button
                        variant="text"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/submission/${lastSubmissionId}`)}
                        size="small"
                      >
                        Dernière
                      </Button>
                    )}
                    {submissionCount > 1 && (
                      <Button
                        variant="text"
                        onClick={() => navigate(`/exercise/${exercise.id}/submissions`)}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Toutes ({submissionCount})
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>

        {isTeacher && (
          <Box>
            <IconButton 
              size="small" 
              onClick={onEdit || (() => navigate(`/exercise/${exercise.id}/edit`))} 
              color="primary"
            >
              <Edit />
            </IconButton>
            {onDelete && (
              <IconButton size="small" onClick={onDelete} color="error">
                <Delete />
              </IconButton>
            )}
          </Box>
        )}
      </CardActions>
    </Card>
  );
};

export default ExerciseCard;
