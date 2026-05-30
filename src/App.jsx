import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar       from './components/Navbar';
import Home         from './pages/Home';
import MapPage      from './pages/MapPage';
import ReportDetail from './pages/ReportDetail';
import CreateReport from './pages/CreateReport';
import Login        from './pages/Login';
import Register     from './pages/Register';
import MyReports    from './pages/MyReports';
import AdminPanel   from './pages/AdminPanel';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading, isAuthority } = useAuth();
  if (loading) return null;
  return isAuthority ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/mapa"     element={<MapPage />} />
          <Route path="/reporte/:id" element={<ReportDetail />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/nuevo"    element={<CreateReport />} />
          <Route path="/mis-reportes" element={<PrivateRoute><MyReports /></PrivateRoute>} />
          <Route path="/admin"    element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}