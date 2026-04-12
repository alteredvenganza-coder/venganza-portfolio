import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { StoreProvider, useStore } from './hooks/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ClientDetail from './pages/ClientDetail';
import ProjectDetail from './pages/ProjectDetail';
import LoginPage from './pages/LoginPage';

// ── Loading screen ─────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="label-meta">Caricamento…</p>
    </div>
  );
}

// ── Inner app (needs StoreContext) ─────────────────────────────────────────────
function AppContent() {
  const { loading } = useStore();
  if (loading) return <Spinner />;

  return (
    <Layout>
      <Routes>
        <Route path="/"              element={<Dashboard />} />
        <Route path="/clients"       element={<ClientsPage />} />
        <Route path="/clients/:id"   element={<ClientDetail />} />
        <Route path="/projects/:id"  element={<ProjectDetail />} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

// ── Protected area ─────────────────────────────────────────────────────────────
function ProtectedApp() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;

  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*"     element={<ProtectedApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
