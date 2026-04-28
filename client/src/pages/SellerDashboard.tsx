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
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="border-2 border-white p-8 w-full max-w-md text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-white flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase mb-3">Waiting for Approval</h2>
          <p className="text-gray-400 mb-2">Your seller account is pending admin review.</p>
          <p className="text-gray-500 text-sm mb-6">This usually takes 1-2 business days.</p>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-white text-sm uppercase font-bold transition">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r-2 border-black z-50 flex flex-col transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 border-b-2 border-black">
          <h1 className="text-lg font-black uppercase tracking-tight">Seller Dashboard</h1>
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
        <div className="p-3 border-t-2 border-black">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 font-bold uppercase border-2 border-red-600 hover:bg-red-600 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1 min-w-0">
        {/* top bar */}
        <div className="bg-white border-b-2 border-black sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-black"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-black uppercase tracking-tight">{activeTab}</h2>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="ml-auto text-sm text-red-600 font-bold uppercase border-2 border-red-600 px-3 py-1 hover:bg-red-600 hover:text-white transition lg:hidden"
          >
            Logout
          </button>
        </div>

        <div className="p-4 lg:p-6">
          {loading ? (
            <Skeleton variant="card" />
          ) : (
            <>
              {/* stats row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border-2 border-black p-4">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Products</p>
                  <p className="text-2xl font-black">{products.length}</p>
                </div>
                <div className="bg-white border-2 border-black p-4">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Active Orders</p>
                  <p className="text-2xl font-black">{activeOrders.length}</p>
                </div>
                <div className="bg-white border-2 border-black p-4">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Revenue</p>
                  <p className="text-2xl font-black">${totalRevenue.toFixed(2)}</p>
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
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition border-2 ${
        active ? 'bg-black text-white border-black' : 'text-gray-600 border-transparent hover:border-black'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={`text-xs px-2 py-0.5 border ${
        active ? 'bg-white text-black border-white' : 'bg-gray-100 text-gray-600 border-gray-300'
      }`}>
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setImageFiles([...imageFiles, ...newFiles]);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const response = await api.uploadImage(file);
      if (response.success) {
        uploadedUrls.push(response.data.url);
      } else {
        setError('Failed to upload one or more images');
        setUploading(false);
        return;
      }
    }

    const productResponse = await api.createProduct({
      productName: formData.productName,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      description: formData.description,
      images: uploadedUrls,
      category: formData.category,
    });

    setUploading(false);

    if (productResponse.success) {
      setProducts([...products, productResponse.data]);
      setFormData({ productName: '', price: '', stockQuantity: '', description: '', category: 'General' });
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImageFiles([]);
      setImagePreviews([]);
      setShowAddForm(false);
      showToast('Product added!', 'success');
    } else {
      setError(productResponse.error);
    }
  };

  const productCategories = ['General', 'Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Toys', 'Other'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black uppercase tracking-tight">My Products ({products.length})</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-black text-white px-4 py-2 text-sm font-bold uppercase tracking-wider border-2 border-black hover:bg-gray-800 transition"
        >
          {showAddForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-600 text-red-700 px-4 py-3 mb-4 text-sm font-bold uppercase">
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-white border-2 border-black p-6 mb-6 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="px-4 py-2.5 border-2 border-black bg-white text-sm focus:outline-none focus:bg-gray-100"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="px-4 py-2.5 border-2 border-black bg-white text-sm focus:outline-none focus:bg-gray-100"
              required
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              className="px-4 py-2.5 border-2 border-black bg-white text-sm focus:outline-none focus:bg-gray-100"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-2.5 border-2 border-black bg-white text-sm focus:outline-none focus:bg-gray-100"
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
            className="w-full px-4 py-2.5 border-2 border-black bg-white text-sm focus:outline-none focus:bg-gray-100 resize-none"
          />

          {/* image upload */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">Product Images</label>
            <div className="border-2 border-dashed border-black p-6 text-center hover:bg-gray-100 transition relative">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500 mb-2">Click to upload or drag images here</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* preview */}
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {imagePreviews.map((url, i) => (
                  <div key={i} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="w-16 h-16 object-cover border-2 border-black"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 text-xs font-bold flex items-center justify-center border-2 border-black"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={uploading} className="bg-black text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider border-2 border-black hover:bg-gray-800 transition disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Add Product'}
          </button>
        </form>
      )}

      {products.length === 0 ? (
        <div className="bg-white border-2 border-black p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-gray-300 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 uppercase font-bold">No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white border-2 border-black overflow-hidden hover:bg-gray-50 transition">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.productName}
                  className="w-full h-36 object-cover border-b-2 border-black"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect fill="%23e2e8f0" width="200" height="150"/><text fill="%2394a3b8" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12">No Image</text></svg>';
                  }}
                />
              ) : (
                <div className="w-full h-36 bg-gray-100 border-b-2 border-black flex items-center justify-center text-gray-400 text-sm uppercase font-bold">
                  No Image
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-bold truncate uppercase">{product.productName}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 border border-gray-300 uppercase font-bold">{product.category || 'General'}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description || 'No description'}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-black text-lg">${product.price}</span>
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
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-600';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-600';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-600';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-600';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-600';
      default: return 'bg-gray-100 text-gray-800 border-gray-600';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-black uppercase tracking-tight mb-4">Orders ({orders.length})</h3>
      {orders.length === 0 ? (
        <div className="bg-white border-2 border-black p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-gray-300 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 uppercase font-bold">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border-2 border-black p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold">{order.buyerId?.fullName}</p>
                  <p className="text-sm text-gray-500">{order.buyerId?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">#{order._id.slice(-8)} | {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold uppercase border-2 ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="border-t-2 border-black pt-3">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-1.5">
                    {item.productId?.images && item.productId.images.length > 0 ? (
                      <img
                        src={item.productId.images[0]}
                        alt={item.productId?.productName}
                        className="w-8 h-8 object-cover flex-shrink-0 border border-black"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{item.productId?.productName || 'Product'} x {item.quantity}</span>
                    </div>
                    <span className="text-sm font-bold">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-black mt-3 pt-3 flex justify-between font-black mb-3">
                <span>TOTAL</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>

              {getNextStatuses(order.orderStatus).length > 0 && (
                <div className="flex gap-2">
                  {getNextStatuses(order.orderStatus).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(order._id, status)}
                      className={`px-4 py-1.5 text-sm font-bold uppercase border-2 transition ${
                        status === 'cancelled'
                          ? 'bg-white text-red-700 hover:bg-red-600 hover:text-white border-red-600'
                          : 'bg-white text-black hover:bg-black hover:text-white border-black'
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
