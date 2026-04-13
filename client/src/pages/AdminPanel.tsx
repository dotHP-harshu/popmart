import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface PendingSeller {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

function AdminPanel() {
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const fetchPendingSellers = async () => {
    const response = await api.getPendingSellers();
    if (response.success) {
      setPendingSellers(response.data);
    }
    setLoading(false);
  };

  const handleApprove = async (sellerId: string) => {
    const response = await api.approveSeller(sellerId);
    if (response.success) {
      setPendingSellers(pendingSellers.filter(s => s._id !== sellerId));
    } else {
      alert(response.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {user?.fullName}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Pending Seller Applications</h2>
        {loading ? (
          <p>Loading...</p>
        ) : pendingSellers.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">No pending seller applications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSellers.map((seller) => (
              <div key={seller._id} className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{seller.fullName}</h3>
                  <p className="text-sm text-gray-500">{seller.email}</p>
                  <p className="text-sm text-gray-400">Applied: {new Date(seller.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleApprove(seller._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
