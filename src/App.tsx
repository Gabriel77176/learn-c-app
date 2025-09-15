import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import ExercisePage from './pages/ExercisePage';
import LessonPage from './pages/LessonPage';
import CreateExercise from './pages/CreateExercise';
import CreateLesson from './pages/CreateLesson';
// import FirebaseDebug from './components/Debug/FirebaseDebug';
import SubmissionTest from './components/Debug/SubmissionTest';
import TeacherManagement from './pages/TeacherManagement';
import AllLessons from './pages/AllLessons';
import EditExercise from './pages/EditExercise';
import SubmissionReview from './pages/SubmissionReview';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={currentUser ? <Navigate to="/" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={currentUser ? <Navigate to="/" /> : <Register />} 
      />
      {/* <Route path="/debug" element={<FirebaseDebug />} /> */}
      <Route path="/test-submission" element={<SubmissionTest />} />
      
      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/lessons/new" element={<CreateLesson />} />
                <Route path="/lessons/:lessonId" element={<LessonPage />} />
                <Route path="/lessons/:lessonId/exercises/new" element={<CreateExercise />} />
                <Route path="/exercise/:exerciseId" element={<ExercisePage />} />
                <Route path="/exercise/:exerciseId/edit" element={<EditExercise />} />
                <Route path="/all-lessons" element={<AllLessons />} />
                <Route path="/submission/:submissionId" element={<SubmissionReview />} />
                <Route path="/teacher-management" element={<TeacherManagement />} />
                {/* Add more protected routes here */}
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
