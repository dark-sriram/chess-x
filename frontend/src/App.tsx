import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import TournamentDetailPage from '@/pages/TournamentDetailPage';
import AnalysisPage from '@/pages/AnalysisPage';
import CalculatorPage from '@/pages/CalculatorPage';
import PlayerProfilePage from '@/pages/PlayerProfilePage';
import AdminPage from '@/pages/AdminPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tournaments/:slug" element={<TournamentDetailPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/player/:username" element={<PlayerProfilePage />} />
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
