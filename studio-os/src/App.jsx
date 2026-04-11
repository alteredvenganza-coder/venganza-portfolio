import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ClientDetail from './pages/ClientDetail';
import ProjectDetail from './pages/ProjectDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/clients"       element={<ClientsPage />} />
          <Route path="/clients/:id"   element={<ClientDetail />} />
          <Route path="/projects/:id"  element={<ProjectDetail />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
