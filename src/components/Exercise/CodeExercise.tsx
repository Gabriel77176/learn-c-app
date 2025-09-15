import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { Exercise } from '../../types';

interface CodeExerciseProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  isSubmitted: boolean;
  initialAnswer?: string;
}

const CodeExercise: React.FC<CodeExerciseProps> = ({
  exercise,
  onSubmit,
  isSubmitted,
  initialAnswer = ''
}) => {
  const [code, setCode] = useState(initialAnswer || '// Écrivez votre code ici\n');
  const [language, setLanguage] = useState('javascript');

  const handleSubmit = () => {
    if (code.trim().length === 0) {
      alert('Veuillez écrire du code');
      return;
    }
    onSubmit(`[${language}]\n${code}`);
  };

  const getDefaultCode = (lang: string) => {
    const defaults = {
      javascript: '// Écrivez votre code JavaScript ici\nfunction solution() {\n    // Votre code ici\n    return "Hello World";\n}',
      python: '# Écrivez votre code Python ici\ndef solution():\n    # Votre code ici\n    return "Hello World"',
      java: '// Écrivez votre code Java ici\npublic class Solution {\n    public static String solution() {\n        // Votre code ici\n        return "Hello World";\n    }\n}',
      cpp: '// Écrivez votre code C++ ici\n#include <iostream>\n#include <string>\n\nstd::string solution() {\n    // Votre code ici\n    return "Hello World";\n}',
      c: '// Écrivez votre code C ici\n#include <stdio.h>\n#include <string.h>\n\nchar* solution() {\n    // Votre code ici\n    return "Hello World";\n}'
    };
    return defaults[lang as keyof typeof defaults] || defaults.javascript;
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (!initialAnswer) {
      setCode(getDefaultCode(newLanguage));
    }
  };

  const lineCount = code.split('\n').length;
  const charCount = code.length;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {exercise.title}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <ReactMarkdown>{exercise.description}</ReactMarkdown>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Écrivez votre code dans l'éditeur ci-dessous. 
        Vous pouvez changer le langage de programmation si nécessaire.
      </Alert>

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Langage</InputLabel>
          <Select
            value={language}
            label="Langage"
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={isSubmitted}
          >
            <MenuItem value="javascript">JavaScript</MenuItem>
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="cpp">C++</MenuItem>
            <MenuItem value="c">C</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            readOnly: isSubmitted,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on'
          }}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Lignes: {lineCount} | Caractères: {charCount}
        </Typography>
        
        {!isSubmitted && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            size="large"
          >
            Soumettre le Code
          </Button>
        )}
      </Box>

      {isSubmitted && (
        <Alert severity="success">
          Votre code a été soumis avec succès !
        </Alert>
      )}
    </Paper>
  );
};

export default CodeExercise;
