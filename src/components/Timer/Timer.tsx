import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import { AccessTime } from '@mui/icons-material';

interface TimerProps {
  duration: number; // in minutes
  onTimeUp?: () => void;
  isActive: boolean;
  onTick?: (remainingSeconds: number) => void;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, isActive, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const totalSeconds = duration * 60;

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        if (onTick) {
          onTick(newTime);
        }
        
        if (newTime <= 0) {
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, onTick]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (): 'primary' | 'warning' | 'error' => {
    const percentage = (timeLeft / totalSeconds) * 100;
    if (percentage > 50) return 'primary';
    if (percentage > 20) return 'warning';
    return 'error';
  };

  const getTextColor = (): string => {
    const percentage = (timeLeft / totalSeconds) * 100;
    if (percentage > 20) return 'text.primary';
    return 'error.main';
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        bgcolor: timeLeft <= 60 ? 'error.light' : 'background.paper'
      }}
    >
      <AccessTime color={timeLeft <= 60 ? 'error' : 'primary'} />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ color: getTextColor() }}>
          {formatTime(timeLeft)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(timeLeft / totalSeconds) * 100}
          color={getProgressColor()}
          sx={{ mt: 1 }}
        />
      </Box>
      {timeLeft <= 60 && timeLeft > 0 && (
        <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
          ATTENTION: Temps presque écoulé!
        </Typography>
      )}
      {timeLeft === 0 && (
        <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
          TEMPS ÉCOULÉ!
        </Typography>
      )}
    </Paper>
  );
};

export default Timer;
