import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PremadesPage from './pages/PremadesPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/premades" element={<PremadesPage />} />
    </Routes>
  );
}

export default App;
