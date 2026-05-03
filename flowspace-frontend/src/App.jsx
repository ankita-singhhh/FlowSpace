import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import RemindersPage from './pages/RemindersPage';
import PlannerPage from './pages/PlannerPage';
import HabitsPage from './pages/HabitsPage';
import NotesPage from './pages/NotesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import InstallPrompt from './components/shared/InstallPrompt';
// import { WebSocketProvider } from './context/WebSocketContext';

// A simple protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  return (
    <ThemeProvider>
      <NotificationProvider>
        <ToastProvider>
          {/* <WebSocketProvider> */}
            <Router>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  border: '1px solid #e5e7eb'
                }
              }}
            />
            <InstallPrompt />
          
            <Routes>
              <Route 
                path="/login" 
                element={!isLoading && user ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
              />
          
          {/* Protected App Routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          {/* Default route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
          
            </Router>
          {/* </WebSocketProvider> */}
        </ToastProvider>
      </NotificationProvider>
      </ThemeProvider>
  );
}

export default App;
