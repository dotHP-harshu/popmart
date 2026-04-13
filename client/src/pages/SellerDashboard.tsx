import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface Product {
  _id: string;
  productName: string;
  price: number;
  stockQuantity: number;
  description: string;
}

interface OrderItem {
  productId: { productName: string };
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  _id: string;
  buyerId: { fullName: string; email: string };
  orderItems: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ productName: '', price: '', stockQuantity: '', description: '' });
  const [error, setError] = useState('');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, ordersRes] = await Promise.all([
      api.getSellerProducts(),
      api.getSellerOrders(),
    ]);
    if (productsRes.success) setProducts(productsRes.data);
    if (ordersRes.success) setOrders(ordersRes.data);
    setLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await api.createProduct({
      productName: formData.productName,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      description: formData.description,
    });

    if (response.success) {
      setProducts([...products, response.data]);
      setFormData({ productName: '', price: '', stockQuantity: '', description: '' });
      setShowAddForm(false);
    } else {
      setError(response.error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const response = await api.updateOrderStatus(orderId, newStatus);
    if (response.success) {
      setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    } else {
      alert(response.error);
    }
  };

  const getNextStatuses = (currentStatus: string) => {
    const transitions: Record<string, string[]> = {
      pending: ['approved', 'cancelled'],
      approved: ['shipped', 'cancelled'],
      shipped: ['delivered'],
    };
    return transitions[currentStatus] || [];
  };

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

  if (user && !user.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Waiting for Approval</h2>
          <p className="text-gray-600 mb-4">Your seller account is pending admin approval.</p>
          <p className="text-sm text-gray-500">You'll be able to list products once approved.</p>
          <button onClick={() => { logout(); navigate('/login'); }} className="mt-6 text-red-600 hover:underline">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Seller Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {user?.fullName}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-md ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            My Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : activeTab === 'products' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Products</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {showAddForm ? 'Cancel' : 'Add Product'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {showAddForm && (
              <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                  Add Product
                </button>
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold">{product.productName}</h3>
                  <p className="text-sm text-gray-500 mt-1">{product.description || 'No description'}</p>
                  <div className="mt-3 flex justify-between">
                    <span className="font-bold">${product.price}</span>
                    <span className="text-sm text-gray-500">{product.stockQuantity} in stock</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{order.buyerId?.fullName}</p>
                        <p className="text-sm text-gray-500">{order.buyerId?.email}</p>
                        <p className="text-sm text-gray-500">#{order._id.slice(-8)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span>{item.productId?.productName} x {item.quantity}</span>
                          <span>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-3 flex justify-between font-bold mb-3">
                      <span>Total</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                    {getNextStatuses(order.orderStatus).length > 0 && (
                      <div className="flex gap-2">
                        {getNextStatuses(order.orderStatus).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(order._id, status)}
                            className={`px-3 py-1 rounded text-sm ${
                              status === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            Mark as {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;
