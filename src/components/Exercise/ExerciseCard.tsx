import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import {
  Quiz,
  Description,
  Code,
  Edit,
  Delete,
  PlayArrow,
  AccessTime
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
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onStart,
  onEdit,
  onDelete,
  isCompleted = false,
  userGrade
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

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {exercise.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AccessTime fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Durée: {formatDuration(exercise.timeLimit)}
          </Typography>
        </Box>

        {isCompleted && userGrade !== undefined && (
          <Chip
            label={`Note: ${userGrade}/20`}
            color={userGrade >= 10 ? 'success' : 'error'}
            size="small"
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box>
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
            <Chip
              label="Terminé"
              color="success"
              size="small"
              variant="outlined"
            />
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
