import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { showToast } from '../components/Toast';
import Skeleton from '../components/Skeleton';

interface Product {
  _id: string;
  productName: string;
  price: number;
  stockQuantity: number;
  description: string;
  images: string[];
  category: string;
}

interface OrderItem {
  productId: { productName: string; images: string[] };
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

type SellerTab = 'products' | 'orders';

function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<SellerTab>('products');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.orderStatus));

  if (user && !user.isApproved) {
    return (
      <div className="min-h-screen gradient-cool flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full animate-float" style={{ animationDelay: '3s' }} />

        <div className="glass rounded-2xl p-8 w-full max-w-md text-center relative z-10 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Waiting for Approval</h2>
          <p className="text-white/70 mb-2">Your seller account is pending admin review.</p>
          <p className="text-white/50 text-sm mb-6">This usually takes 1-2 business days.</p>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-white/60 hover:text-white text-sm transition">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white shadow-sm z-50 flex flex-col transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 border-b">
          <h1 className="text-lg font-bold gradient-brand bg-clip-text text-transparent">Seller Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1 truncate">{user?.fullName}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <SidebarButton
            active={activeTab === 'products'}
            onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            label="My Products"
            count={products.length}
          />
          <SidebarButton
            active={activeTab === 'orders'}
            onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            label="Orders"
            count={orders.length}
          />
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1 min-w-0">
        {/* top bar */}
        <div className="bg-white shadow-sm sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800 capitalize">{activeTab}</h2>
        </div>

        <div className="p-4 lg:p-6">
          {loading ? (
            <Skeleton variant="card" />
          ) : (
            <>
              {/* stats row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Products</p>
                  <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-800">{activeOrders.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              {activeTab === 'products' ? (
                <ProductsTab
                  products={products}
                  setProducts={setProducts}
                  showAddForm={showAddForm}
                  setShowAddForm={setShowAddForm}
                />
              ) : (
                <OrdersTab orders={orders} setOrders={setOrders} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarButton({ active, onClick, icon, label, count }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
        active ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-brand-100' : 'bg-gray-100'}`}>
        {count}
      </span>
    </button>
  );
}

function ProductsTab({ products, setProducts, showAddForm, setShowAddForm }: {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showAddForm: boolean;
  setShowAddForm: (v: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    stockQuantity: '',
    description: '',
    category: 'General',
  });
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [error, setError] = useState('');

  const handleAddImageField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImageField = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validImages = imageUrls.filter((url) => url.trim() !== '');

    const response = await api.createProduct({
      productName: formData.productName,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      description: formData.description,
      images: validImages,
      category: formData.category,
    });

    if (response.success) {
      setProducts([...products, response.data]);
      setFormData({ productName: '', price: '', stockQuantity: '', description: '', category: 'General' });
      setImageUrls(['']);
      setShowAddForm(false);
      showToast('Product added!', 'success');
    } else {
      setError(response.error);
    }
  };

  const productCategories = ['General', 'Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Toys', 'Other'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">My Products ({products.length})</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          {showAddForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {productCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
          />

          {/* image URL inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageField(index)}
                      className="px-3 text-gray-400 hover:text-red-600 transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddImageField}
              className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              + Add another image
            </button>

            {/* preview */}
            {imageUrls.some((url) => url.trim() !== '') && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {imageUrls.filter((url) => url.trim() !== '').map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preview ${i + 1}`}
                    className="w-16 h-16 rounded-lg object-cover border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="%23fee2e2" width="64" height="64"/><text fill="%23ef4444" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="8">Invalid</text></svg>';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition">
            Add Product
          </button>
        </form>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500">No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.productName}
                  className="w-full h-36 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect fill="%23e2e8f0" width="200" height="150"/><text fill="%2394a3b8" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12">No Image</text></svg>';
                  }}
                />
              ) : (
                <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{product.productName}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.category || 'General'}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description || 'No description'}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-lg">${product.price}</span>
                  <span className="text-sm text-gray-500">{product.stockQuantity} in stock</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersTab({ orders, setOrders }: {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}) {
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const response = await api.updateOrderStatus(orderId, newStatus);
    if (response.success) {
      setOrders(orders.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      showToast(`Order marked as ${newStatus}`, 'success');
    } else {
      showToast(response.error, 'error');
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
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Orders ({orders.length})</h3>
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{order.buyerId?.fullName}</p>
                  <p className="text-sm text-gray-500">{order.buyerId?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">#{order._id.slice(-8)} | {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="border-t pt-3">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-1.5">
                    {item.productId?.images && item.productId.images.length > 0 ? (
                      <img
                        src={item.productId.images[0]}
                        alt={item.productId?.productName}
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{item.productId?.productName || 'Product'} x {item.quantity}</span>
                    </div>
                    <span className="text-sm font-medium">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
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
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                        status === 'cancelled'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
