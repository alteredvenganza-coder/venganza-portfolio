import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Component } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { StoreProvider, useStore } from './hooks/useStore';

// ── Error boundary ─────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6">
          <div className="bg-white border border-border rounded-lg p-6 max-w-lg shadow-card">
            <p className="label-meta text-burgundy mb-2">Errore di configurazione</p>
            <p className="text-sm text-ink font-mono whitespace-pre-wrap">{this.state.error.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
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
    <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*"     element={<ProtectedApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
