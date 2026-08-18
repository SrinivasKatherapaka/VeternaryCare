import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClinicalOperationsPage } from './pages/ClinicalOperationsPage';
import { ControlsPage } from './pages/ControlsPage';
import { RisksIssuesPage } from './pages/RisksIssuesPage';
import { DecisionHistoryPage } from './pages/DecisionHistoryPage';
import { EvidenceMappingPage } from './pages/EvidenceMappingPage';
import { ControlGapsPage } from './pages/ControlGapsPage';
import { AuditPacksPage } from './pages/AuditPacksPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { UsersRolesPage } from './pages/UsersRolesPage';
import { AuditLogsSettingsPage } from './pages/AuditLogsSettingsPage';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes inside Main Layout */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
          <Route path="/clinical" element={<ProtectedRoute><MainLayout><ClinicalOperationsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/controls" element={<ProtectedRoute><MainLayout><ControlsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/risks-issues" element={<ProtectedRoute><MainLayout><RisksIssuesPage /></MainLayout></ProtectedRoute>} />
          <Route path="/decision-history" element={<ProtectedRoute><MainLayout><DecisionHistoryPage /></MainLayout></ProtectedRoute>} />
          <Route path="/evidence-mapping" element={<ProtectedRoute><MainLayout><EvidenceMappingPage /></MainLayout></ProtectedRoute>} />
          <Route path="/control-gaps" element={<ProtectedRoute><MainLayout><ControlGapsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/audit-packs" element={<ProtectedRoute><MainLayout><AuditPacksPage /></MainLayout></ProtectedRoute>} />
          <Route path="/reports-analytics" element={<ProtectedRoute><MainLayout><ReportsAnalyticsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><MainLayout><NotificationsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/users-roles" element={<ProtectedRoute><MainLayout><UsersRolesPage /></MainLayout></ProtectedRoute>} />
          <Route path="/audit-logs-settings" element={<ProtectedRoute><MainLayout><AuditLogsSettingsPage /></MainLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
