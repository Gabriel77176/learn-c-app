import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { auth, db } from '../../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { submissionService } from '../../services/firebase';
import { UserRole } from '../../types';

const FirebaseDebug: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123');
  const [name, setName] = useState('Test User');
  const [role, setRole] = useState<UserRole>('student');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    addLog('Firebase Debug component loaded');
    addLog(`Auth instance: ${auth ? 'OK' : 'FAILED'}`);
    addLog(`DB instance: ${db ? 'OK' : 'FAILED'}`);
    addLog(`Firebase config: ${JSON.stringify(auth.app.options)}`);
  }, []);

  const testCreateUser = async () => {
    setLoading(true);
    try {
      addLog('Creating test user...');
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      addLog(`User created successfully: ${user.uid}`);
      
      // Create user document
      const userData = {
        name,
        email,
        role,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      addLog('User document created in Firestore');
      
    } catch (error: any) {
      addLog(`Error creating user: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      addLog('Attempting login...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      addLog(`Login successful: ${userCredential.user.uid}`);
      
      // Test Firestore access
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        addLog('User document found in Firestore');
        addLog(`User data: ${JSON.stringify(userDoc.data())}`);
      } else {
        addLog('User document not found in Firestore');
      }
      
    } catch (error: any) {
      addLog(`Login error: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const createTeacherPreset = () => {
    setEmail('teacher@example.com');
    setPassword('teacher123');
    setName('Professor Smith');
    setRole('teacher');
  };

  const createStudentPreset = () => {
    setEmail('student@example.com');
    setPassword('student123');
    setName('John Doe');
    setRole('student');
  };

  const createAdminPreset = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
    setName('Admin User');
    setRole('admin');
  };

  const cleanDuplicateNotions = async () => {
    setLoading(true);
    try {
      addLog('Starting cleanup of duplicate notions...');

      // Get all notions
      const notionsSnapshot = await getDocs(collection(db, 'notions'));
      const notions = notionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<{id: string, name: string, subjectId: string, createdAt?: any}>;

      addLog(`Found ${notions.length} notions total`);

      // Group by name and subjectId to find duplicates
      const notionGroups = new Map<string, typeof notions>();
      notions.forEach(notion => {
        const key = `${notion.name}_${notion.subjectId}`;
        if (!notionGroups.has(key)) {
          notionGroups.set(key, []);
        }
        notionGroups.get(key)!.push(notion);
      });

      let deletedCount = 0;

      // Delete duplicates (keep the first one)
      for (const [, group] of Array.from(notionGroups.entries())) {
        if (group.length > 1) {
          addLog(`Found ${group.length} duplicates for: ${group[0].name}`);

          // Sort by creation date and keep the oldest
          group.sort((a: any, b: any) => {
            const aDate = a.createdAt?.toDate?.() || new Date(0);
            const bDate = b.createdAt?.toDate?.() || new Date(0);
            return aDate.getTime() - bDate.getTime();
          });

          // Delete all except the first one
          for (let i = 1; i < group.length; i++) {
            await deleteDoc(doc(db, 'notions', group[i].id));
            deletedCount++;
            addLog(`Deleted duplicate notion: ${group[i].id}`);
          }
        }
      }

      addLog(`Cleanup completed. Deleted ${deletedCount} duplicate notions.`);

    } catch (error: any) {
      addLog(`Error during cleanup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSubmissions = async () => {
    setLoading(true);
    try {
      addLog('Testing submissions data...');

      // Get all submissions directly from Firestore
      const submissionsSnapshot = await getDocs(collection(db, 'submissions'));
      addLog(`Found ${submissionsSnapshot.docs.length} submissions in Firestore`);

      submissionsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        addLog(`Submission ${index + 1}: ID=${doc.id}, answerText=${data.answerText ? 'Present' : 'Missing'}, selectedOptions=${data.selectedOptions ? JSON.stringify(data.selectedOptions) : 'Missing'}`);
      });

      // Test with submission service
      if (submissionsSnapshot.docs.length > 0) {
        const firstSubmission = submissionsSnapshot.docs[0];
        const exerciseId = firstSubmission.data().exerciseId;
        addLog(`Testing submissionService.getSubmissionsByExercise for exerciseId: ${exerciseId}`);
        
        const submissions = await submissionService.getSubmissionsByExercise(exerciseId);
        addLog(`Service returned ${submissions.length} submissions`);
        
        submissions.forEach((submission, index) => {
          addLog(`Service submission ${index + 1}: answerText=${submission.answerText ? 'Present' : 'Missing'}, selectedOptions=${submission.selectedOptions ? JSON.stringify(submission.selectedOptions) : 'Missing'}`);
        });
      }

    } catch (error: any) {
      addLog(`Error testing submissions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Firebase Debug Panel
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Test Credentials
        </Typography>
        
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />
        
        <TextField
          fullWidth
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" onClick={createStudentPreset}>
            Student Preset
          </Button>
          <Button size="small" onClick={createTeacherPreset}>
            Teacher Preset
          </Button>
          <Button size="small" onClick={createAdminPreset}>
            Admin Preset
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={testCreateUser} 
            disabled={loading}
          >
            Create User
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={testLogin} 
            disabled={loading}
          >
            Test Login
          </Button>
          
          <Button onClick={clearLogs}>
            Clear Logs
          </Button>
          
          <Button 
            color="warning"
            onClick={cleanDuplicateNotions}
            disabled={loading}
          >
            Clean Duplicates
          </Button>
          
          <Button 
            color="info"
            onClick={testSubmissions}
            disabled={loading}
          >
            Test Submissions
          </Button>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Debug Logs
        </Typography>
        
        <Box sx={{ 
          height: 300, 
          overflow: 'auto', 
          bgcolor: 'grey.100', 
          p: 1, 
          fontFamily: 'monospace',
          fontSize: '0.8rem'
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default FirebaseDebug;
