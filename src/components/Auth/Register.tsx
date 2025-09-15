import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { UserRole } from '../../types';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(formData.email, formData.password, formData.name, formData.role);
      navigate('/');
    } catch (error: any) {
      setError('Échec de la création du compte. Vérifiez vos informations.');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'grey.100'
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Inscription
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nom complet"
            value={formData.name}
            onChange={handleChange('name')}
            margin="normal"
            required
            autoFocus
          />
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            margin="normal"
            required
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Rôle</InputLabel>
            <Select
              value={formData.role}
              label="Rôle"
              onChange={handleChange('role')}
            >
              <MenuItem value="student">Étudiant</MenuItem>
              <MenuItem value="teacher">Enseignant</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            margin="normal"
            required
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer le compte'}
          </Button>
          
          <Box textAlign="center">
            <Link component={RouterLink} to="/login" variant="body2">
              Déjà un compte ? Se connecter
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
