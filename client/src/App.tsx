import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import WelcomePage from './pages/WelcomePage';
import StudentNamePage from './pages/student/StudentNamePage';
import StudentWaitPage from './pages/student/StudentWaitPage';
import StudentPollPage from './pages/student/StudentPollPage';
import StudentResultPage from './pages/student/StudentResultPage';
import KickedPage from './pages/student/KickedPage';
import CreatePollPage from './pages/teacher/CreatePollPage';
import TeacherDashboard from './pages/teacher/TeacherDashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Role Selection */}
          <Route path="/" element={<WelcomePage />} />

          {/* Student Flow */}
          <Route path="/student/name" element={<StudentNamePage />} />
          <Route path="/student/wait" element={<StudentWaitPage />} />
          <Route path="/student/poll" element={<StudentPollPage />} />
          <Route path="/student/results" element={<StudentResultPage />} />
          <Route path="/student/kicked" element={<KickedPage />} />

          {/* Teacher Flow */}
          <Route path="/teacher/create" element={<CreatePollPage />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
