import { Navigate, Route, Routes } from 'react-router-dom';
import { MenuPage } from './pages/MenuPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/indomito" element={<MenuPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
