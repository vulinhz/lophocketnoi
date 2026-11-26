import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DemoProvider, useDemo } from './context/DemoContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { ObservationsPage } from './pages/ObservationsPage';
import { CommentsPage } from './pages/CommentsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { StudentHubPage } from './pages/StudentHubPage';
import { DemoAdminPage } from './pages/DemoAdminPage';

function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { currentUser } = useDemo();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { currentUser } = useDemo();

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedShell>
            <DashboardPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedShell>
            <StudentsPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/students/:studentId"
        element={
          <ProtectedShell>
            <StudentProfilePage />
          </ProtectedShell>
        }
      />
      <Route
        path="/observations"
        element={
          <ProtectedShell>
            <ObservationsPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/comments"
        element={
          <ProtectedShell>
            <CommentsPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedShell>
            <AnnouncementsPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedShell>
            <FeedbackPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/student-hub"
        element={
          <ProtectedShell>
            <StudentHubPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/demo-admin"
        element={
          <ProtectedShell>
            <DemoAdminPage />
          </ProtectedShell>
        }
      />
      <Route path="*" element={<Navigate to={currentUser ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DemoProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DemoProvider>
    </ToastProvider>
  );
}
