import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <span className="text-[#888] text-sm font-mono tracking-widest uppercase">Loading…</span>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return children;
}
