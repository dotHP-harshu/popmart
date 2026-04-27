import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import Skeleton from '../components/Skeleton';

interface OrderItem {
  productId: { productName: string; images: string[] };
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

const statusSteps = ['pending', 'approved', 'shipped', 'delivered'];

function BuyerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuthStore();
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
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return statusSteps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold gradient-brand bg-clip-text text-transparent">My Orders</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/store')} className="text-sm text-gray-600 hover:text-brand-600 transition">
              Back to Store
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Order History</h2>
        {loading ? (
          <Skeleton variant="list" />
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">No orders yet</p>
            <button onClick={() => navigate('/store')} className="text-brand-600 font-medium hover:underline">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const currentStep = getStepIndex(order.orderStatus);
              const isCancelled = order.orderStatus === 'cancelled';

              return (
                <div key={order._id} className="bg-white rounded-xl p-6 shadow-sm animate-fade-in">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* progress bar */}
                  {!isCancelled && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200" />
                        <div
                          className="absolute left-0 top-3 h-0.5 bg-emerald-500 transition-all duration-500"
                          style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                        />
                        {statusSteps.map((step, i) => (
                          <div key={step} className="relative z-10 flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              i <= currentStep ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {i <= currentStep ? '✓' : i + 1}
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 capitalize">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* items */}
                  <div className="border-t pt-3">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-2">
                        {item.productId?.images && item.productId.images.length > 0 ? (
                          <img
                            src={item.productId.images[0]}
                            alt={item.productId?.productName}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.productId?.productName || 'Product'}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerOrders;
