import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import Bodega from '@/pages/Bodega';
import Stand from '@/pages/Stand';

function Home() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={profile?.role === 'admin' ? '/admin' : '/bodega'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/stand" element={<Stand />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requireRole="admin">
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bodega"
        element={
          <ProtectedRoute>
            <Bodega />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
