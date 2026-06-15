import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import ReportIssue   from './pages/ReportIssue';
import TrackStatus   from './pages/TrackStatus';
import MyDashboard   from './pages/MyDashboard';
import AdminPanel    from './pages/AdminPanel';
import PublicScores  from './pages/PublicScores';
import ReportSuccess from './pages/ReportSuccess';
import NotFound      from './pages/NotFound';
import RecentComplaints from './pages/RecentComplaints';

import { CitizenLayout, AdminLayout } from './components/Layouts';

// ── Route Guards ─────────────────────────────────────────────────────────────

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    const path = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(path)}`} replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/report" replace />;
  return children;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Admin — deep navy layout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminPanel />
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* Public + Citizen — standard layout */}
        <Route element={<CitizenLayout />}>
          <Route path="/"          element={<Home />} />
          <Route path="/scores"    element={<PublicScores />} />
          <Route path="/recent"    element={<RecentComplaints />} />
          <Route path="/track"     element={<TrackStatus />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />

          {/* Protected */}
          <Route path="/report"
            element={<ProtectedRoute><ReportIssue /></ProtectedRoute>}
          />
          <Route path="/report/complete"
            element={<ProtectedRoute><ReportSuccess /></ProtectedRoute>}
          />
          <Route path="/dashboard"
            element={<ProtectedRoute><MyDashboard /></ProtectedRoute>}
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}