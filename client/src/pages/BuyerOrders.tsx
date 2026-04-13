import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface OrderItem {
  productId: { productName: string };
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

function BuyerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await api.getBuyerOrders();
      if (response.success) {
        setOrders(response.data);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">My Orders</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/store')} className="text-sm text-blue-600 hover:underline">Back to Store</button>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Order History</h2>
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="border-t pt-3">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span>{item.productId?.productName || 'Product'} x {item.quantity}</span>
                      <span>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerOrders;
