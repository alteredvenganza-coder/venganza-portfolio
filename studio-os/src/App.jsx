import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Component } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { UserProfileProvider, useUserProfile } from './hooks/useUserProfile';
import { StoreProvider, useStore } from './hooks/useStore';
import { supabaseConfigured } from './lib/supabase';
import { I18nProvider } from './lib/i18n';

// ── Error boundary ─────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="glass rounded-lg p-6 max-w-lg shadow-card">
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
import GuestLayout from './components/GuestLayout';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ClientCanvasHub from './pages/ClientCanvasHub';
import ProjectDetail from './pages/ProjectDetail';
import PricingMemoryPage from './pages/PricingMemoryPage';
import CashflowPage from './pages/CashflowPage';
import LoginPage from './pages/LoginPage';
import GuestSignupPage from './pages/GuestSignupPage';
import DeliveryPage from './pages/DeliveryPage';
import TransferPage from './pages/TransferPage';
import SendFilePage from './pages/SendFilePage';
import CalendarPage from './pages/CalendarPage';
import AdminInvitesPage from './pages/AdminInvitesPage';
import CanvasView from './pages/CanvasView';

// ── Loading screen ─────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7b1f24', fontFamily: 'sans-serif' }}>Caricamento…</p>
    </div>
  );
}

// ── Guest app (only /send and /transfer) ──────────────────────────────────────
function GuestApp() {
  return (
    <GuestLayout>
      <Routes>
        <Route path="/send"          element={<SendFilePage />} />
        <Route path="*"              element={<Navigate to="/send" replace />} />
      </Routes>
    </GuestLayout>
  );
}

// ── Admin app (full CRM) ──────────────────────────────────────────────────────
function AdminContent() {
  const { loading } = useStore();
  if (loading) return <Spinner />;

  return (
    <Routes>
      {/* Full-screen canvas routes — NO Layout wrapper */}
      <Route path="/canvas/:canvasId"                 element={<CanvasView />} />
      <Route path="/clients/:id/canvas/:canvasId"     element={<CanvasView />} />

      {/* All other routes wrapped in Layout */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/canvas-home"   element={<HomePage />} />
            <Route path="/clients"       element={<ClientsPage />} />
            <Route path="/clients/:id"   element={<ClientCanvasHub />} />
            <Route path="/projects/:id"  element={<ProjectDetail />} />
            <Route path="/pricing"       element={<PricingMemoryPage />} />
            <Route path="/cashflow"      element={<CashflowPage />} />
            <Route path="/calendario"    element={<CalendarPage />} />
            <Route path="/send"          element={<SendFilePage />} />
            <Route path="/inviti"        element={<AdminInvitesPage />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}

// ── Protected area — routes based on role ─────────────────────────────────────
function ProtectedApp() {
  const { user, loading: authLoading } = useAuth();
  const { isGuest, loading: profileLoading } = useUserProfile();

  if (authLoading || profileLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  // Guest users only get the transfer UI
  if (isGuest) {
    return <GuestApp />;
  }

  // Admin/default users get the full CRM
  return (
    <StoreProvider>
      <AdminContent />
    </StoreProvider>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  if (!supabaseConfigured) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: '8px', padding: '24px', maxWidth: '480px', width: '100%' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7b1f24', marginBottom: '8px' }}>Configurazione mancante</p>
          <p style={{ fontSize: '14px', color: '#1a1a1a', lineHeight: 1.6 }}>
            Le variabili <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> non sono impostate.<br /><br />
            Vai su <strong>Vercel → Settings → Environment Variables</strong>, aggiungile e rideploya.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <I18nProvider>
    <AuthProvider>
    <UserProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/signup"          element={<GuestSignupPage />} />
          <Route path="/consegna/:token" element={<DeliveryPage />} />
          <Route path="/transfer/:token" element={<TransferPage />} />
          <Route path="/*"               element={<ProtectedApp />} />
        </Routes>
      </BrowserRouter>
    </UserProfileProvider>
    </AuthProvider>
    </I18nProvider>
    </ErrorBoundary>
  );
}
