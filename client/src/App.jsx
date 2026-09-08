import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Common Layout components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import MySkills from './pages/student/MySkills';
import Assessments from './pages/student/Assessments';
import TakeAssessment from './pages/student/TakeAssessment';
import AssessmentResultPage from './pages/student/AssessmentResultPage';
import Projects from './pages/student/Projects';
import DSATrackerPage from './pages/student/DSATrackerPage';
import ReadinessPage from './pages/student/ReadinessPage';
import JobMatchesPage from './pages/student/JobMatchesPage';
import RecommendationsPage from './pages/student/RecommendationsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageSkills from './pages/admin/ManageSkills';
import ManageAssessments from './pages/admin/ManageAssessments';
import ManageQuestions from './pages/admin/ManageQuestions';
import ManageJobs from './pages/admin/ManageJobs';

// Layout wrapper for authenticated routes
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <RoleRoute allowedRole="student">
                  <StudentDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <RoleRoute allowedRole="student">
                  <Profile />
                </RoleRoute>
              }
            />
            <Route
              path="/student/skills"
              element={
                <RoleRoute allowedRole="student">
                  <MySkills />
                </RoleRoute>
              }
            />
            <Route
              path="/student/assessments"
              element={
                <RoleRoute allowedRole="student">
                  <Assessments />
                </RoleRoute>
              }
            />
            <Route
              path="/student/assessments/:id"
              element={
                <RoleRoute allowedRole="student">
                  <TakeAssessment />
                </RoleRoute>
              }
            />
            <Route
              path="/student/results"
              element={
                <RoleRoute allowedRole="student">
                  <AssessmentResultPage />
                </RoleRoute>
              }
            />
            <Route
              path="/student/projects"
              element={
                <RoleRoute allowedRole="student">
                  <Projects />
                </RoleRoute>
              }
            />
            <Route
              path="/student/dsa"
              element={
                <RoleRoute allowedRole="student">
                  <DSATrackerPage />
                </RoleRoute>
              }
            />
            <Route
              path="/student/readiness"
              element={
                <RoleRoute allowedRole="student">
                  <ReadinessPage />
                </RoleRoute>
              }
            />
            <Route
              path="/student/jobs"
              element={
                <RoleRoute allowedRole="student">
                  <JobMatchesPage />
                </RoleRoute>
              }
            />
            <Route
              path="/student/recommendations"
              element={
                <RoleRoute allowedRole="student">
                  <RecommendationsPage />
                </RoleRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleRoute allowedRole="admin">
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <RoleRoute allowedRole="admin">
                  <ManageStudents />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/skills"
              element={
                <RoleRoute allowedRole="admin">
                  <ManageSkills />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/assessments"
              element={
                <RoleRoute allowedRole="admin">
                  <ManageAssessments />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/assessments/:id"
              element={
                <RoleRoute allowedRole="admin">
                  <ManageQuestions />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <RoleRoute allowedRole="admin">
                  <ManageJobs />
                </RoleRoute>
              }
            />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
