import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { submissionService } from '../../services/firebase';

const SubmissionTest: React.FC = () => {
  const { currentUser } = useAuth();
  const [exerciseId, setExerciseId] = useState('');
  const [answerText, setAnswerText] = useState('Test answer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testSubmission = async () => {
    if (!currentUser) {
      setResult('Error: No current user');
      return;
    }

    if (!exerciseId.trim()) {
      setResult('Error: Please enter an exercise ID');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      console.log('Testing submission with:', {
        exerciseId: exerciseId.trim(),
        studentId: currentUser.id,
        answerText,
        duration: 60
      });

      const submissionData = {
        exerciseId: exerciseId.trim(),
        studentId: currentUser.id,
        answerText,
        duration: 60
        // selectedOptions is omitted for text exercises
      };

      const submissionId = await submissionService.createSubmission(submissionData);
      setResult(`Success! Submission created with ID: ${submissionId}`);

      // Try to fetch it back
      const fetchedSubmission = await submissionService.getSubmission(submissionId);
      console.log('Fetched submission:', fetchedSubmission);

    } catch (error: any) {
      console.error('Submission test error:', error);
      setResult(`Error: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Submission Test
      </Typography>

      {currentUser && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Current user: {currentUser.name} ({currentUser.role})
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Exercise ID"
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          margin="normal"
          placeholder="Enter an existing exercise ID"
        />

        <TextField
          fullWidth
          label="Answer Text"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />

        <Button
          variant="contained"
          onClick={testSubmission}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Testing...' : 'Test Submission'}
        </Button>
      </Paper>

      {result && (
        <Paper sx={{ p: 2, bgcolor: result.startsWith('Success') ? 'success.light' : 'error.light' }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {result}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SubmissionTest;
