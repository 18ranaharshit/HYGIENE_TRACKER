import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { PrivateRoute } from '@/components/ui/PrivateRoute';
import Dashboard from '@/pages/Dashboard';
import MapLocator from '@/pages/MapLocator';
import HygieneAnalysis from '@/pages/HygieneAnalysis';
import ExpenseTracker from '@/pages/ExpenseTracker';
import AdminPanel from '@/pages/AdminPanel';
import RatingSystem from '@/pages/RatingSystem';
import Analytics from '@/pages/Analytics';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

/**
 * App — Root component with routing configuration and global providers.
 * Public routes: /login, /register
 * Protected routes (PrivateRoute): all others
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<MapLocator />} />
              <Route path="/analysis" element={<HygieneAnalysis />} />
              <Route path="/expenses" element={<ExpenseTracker />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/rate" element={<RatingSystem />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#222a3d',
              color: '#dae2fd',
              border: '1px solid #2d3449',
              borderRadius: '10px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#14b8a6', secondary: '#003731' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1c0506' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
