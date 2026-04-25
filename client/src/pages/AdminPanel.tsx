import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { showToast } from '../components/Toast';
import Skeleton from '../components/Skeleton';

type AdminTab = 'dashboard' | 'sellers' | 'users' | 'products' | 'orders';

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  pendingApprovals: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

interface ProductData {
  _id: string;
  productName: string;
  price: number;
  stockQuantity: number;
  images: string[];
  category: string;
  sellerId: { fullName: string; email: string };
  createdAt: string;
}

interface OrderItem {
  productId: { productName: string; price: number; images: string[] };
  quantity: number;
  priceAtPurchase: number;
}

interface OrderData {
  _id: string;
  buyerId: { fullName: string; email: string };
  orderItems: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingSellers, setPendingSellers] = useState<UserData[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const [statsRes, pendingRes, usersRes, productsRes, ordersRes] = await Promise.all([
      api.getAdminStats(),
      api.getPendingSellers(),
      api.getAllUsers(),
      api.getAllProducts(),
      api.getAllOrders(),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (pendingRes.success) setPendingSellers(pendingRes.data);
    if (usersRes.success) setAllUsers(usersRes.data);
    if (productsRes.success) setAllProducts(productsRes.data);
    if (ordersRes.success) setAllOrders(ordersRes.data);
    setLoading(false);
  };

  const handleApproveSeller = async (sellerId: string) => {
    const response = await api.approveSeller(sellerId);
    if (response.success) {
      setPendingSellers(pendingSellers.filter((s) => s._id !== sellerId));
      showToast('Seller approved', 'success');
    } else {
      showToast(response.error, 'error');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentIsActive: boolean) => {
    const response = await api.updateUserStatus(userId, !currentIsActive);
    if (response.success) {
      setAllUsers(allUsers.map((u) => u._id === userId ? { ...u, isActive: !currentIsActive } : u));
      showToast(currentIsActive ? 'User suspended' : 'User activated', 'success');
    } else {
      showToast(response.error, 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const response = await api.deleteUser(userId);
    if (response.success) {
      setAllUsers(allUsers.filter((u) => u._id !== userId));
      setPendingSellers(pendingSellers.filter((s) => s._id !== userId));
      setConfirmDeleteUser(null);
      showToast('User deleted', 'success');
    } else {
      showToast(response.error, 'error');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const response = await api.deleteProduct(productId);
    if (response.success) {
      setAllProducts(allProducts.filter((p) => p._id !== productId));
      showToast('Product deleted', 'success');
    } else {
      showToast(response.error, 'error');
    }
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'seller': return 'bg-blue-100 text-blue-800';
      case 'buyer': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = userFilter
    ? allUsers.filter((u) => u.role === userFilter)
    : allUsers;

  const tabs: { key: AdminTab; label: string; count?: number }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'sellers', label: 'Sellers', count: pendingSellers.length },
    { key: 'users', label: 'Users', count: allUsers.length },
    { key: 'products', label: 'Products', count: allProducts.length },
    { key: 'orders', label: 'Orders', count: allOrders.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* nav */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold gradient-brand bg-clip-text text-transparent">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {user?.fullName}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>

      {/* tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.key
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <Skeleton variant="stats" />
        ) : (
          <>
            {/* dashboard tab */}
            {activeTab === 'dashboard' && stats && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard label="Total Users" value={stats.totalUsers} gradient="from-violet-500 to-purple-600" />
                  <StatCard label="Sellers" value={stats.totalSellers} gradient="from-blue-500 to-indigo-600" />
                  <StatCard label="Buyers" value={stats.totalBuyers} gradient="from-emerald-500 to-teal-600" />
                  <StatCard label="Pending Approvals" value={stats.pendingApprovals} gradient="from-amber-500 to-orange-600" />
                  <StatCard label="Products" value={stats.totalProducts} gradient="from-pink-500 to-rose-600" />
                  <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} gradient="from-cyan-500 to-blue-600" />
                </div>
              </div>
            )}

            {/* sellers tab */}
            {activeTab === 'sellers' && (
              <div className="animate-fade-in space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Pending Seller Approvals</h2>
                {pendingSellers.length === 0 ? (
                  <EmptyState message="No pending seller applications" />
                ) : (
                  <div className="space-y-3">
                    {pendingSellers.map((seller) => (
                      <div key={seller._id} className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{seller.fullName}</h3>
                          <p className="text-sm text-gray-500">{seller.email}</p>
                          <p className="text-xs text-gray-400 mt-1">Applied {new Date(seller.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => handleApproveSeller(seller._id)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                        >
                          Approve
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* users tab */}
            {activeTab === 'users' && (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">User Management</h2>
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="">All Roles</option>
                    <option value="buyer">Buyers</option>
                    <option value="seller">Sellers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{u.fullName}</td>
                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => u.role !== 'admin' && handleToggleUserStatus(u._id, u.isActive)}
                                disabled={u.role === 'admin'}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  u.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                } ${u.role !== 'admin' ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                              >
                                {u.isActive ? 'Active' : 'Suspended'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => setConfirmDeleteUser(u._id)}
                                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* products tab */}
            {activeTab === 'products' && (
              <div className="animate-fade-in space-y-4">
                <h2 className="text-lg font-bold text-gray-800">All Products</h2>
                {allProducts.length === 0 ? (
                  <EmptyState message="No products on the platform" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allProducts.map((product) => (
                      <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.productName}
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e2e8f0" width="100" height="100"/><text fill="%2394a3b8" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12">No Image</text></svg>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold">{product.productName}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            by {product.sellerId?.fullName} | {product.category}
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="font-bold text-lg">${product.price}</span>
                            <span className="text-xs text-gray-500">{product.stockQuantity} in stock</span>
                          </div>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="mt-3 w-full text-red-600 border border-red-200 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 transition"
                          >
                            Remove Product
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* orders tab */}
            {activeTab === 'orders' && (
              <div className="animate-fade-in space-y-4">
                <h2 className="text-lg font-bold text-gray-800">All Orders</h2>
                {allOrders.length === 0 ? (
                  <EmptyState message="No orders placed yet" />
                ) : (
                  <div className="space-y-3">
                    {allOrders.map((order) => (
                      <div key={order._id} className="bg-white rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">{order.buyerId?.fullName}</p>
                            <p className="text-sm text-gray-500">{order.buyerId?.email}</p>
                            <p className="text-xs text-gray-400 mt-1">#{order._id.slice(-8)} | {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
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
            )}
          </>
        )}
      </div>

      {/* delete user modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-bold mb-2">Delete User</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete this user and all their products if they are a seller. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteUser(null)}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDeleteUser)}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, gradient }: { label: string; value: string | number; gradient: string }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-5 text-white shadow-lg`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl p-12 text-center shadow-sm">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

export default AdminPanel;
