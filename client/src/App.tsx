import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import ToastContainer from './components/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Storefront from './pages/Storefront';
import SellerDashboard from './pages/SellerDashboard';
import AdminPanel from './pages/AdminPanel';
import Cart from './pages/Cart';
import BuyerOrders from './pages/BuyerOrders';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: string }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== allowedRole) return <Navigate to="/" />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'seller') return <Navigate to="/seller" />;
  return <Navigate to="/store" />;
}

function App() {
  const { loadUser, _isLoaded } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (!_isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/store" element={<ProtectedRoute allowedRole="buyer"><Storefront /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute allowedRole="buyer"><Cart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRole="buyer"><BuyerOrders /></ProtectedRoute>} />
        <Route path="/seller" element={<ProtectedRoute allowedRole="seller"><SellerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminPanel /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
