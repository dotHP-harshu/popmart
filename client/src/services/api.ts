const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('popmart_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async register(fullName: string, email: string, password: string, role: string) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, role }),
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getPendingSellers() {
    const response = await fetch(`${API_BASE}/admin/pending-sellers`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async approveSeller(sellerId: string) {
    const response = await fetch(`${API_BASE}/admin/sellers/${sellerId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async getSellerProducts() {
    const response = await fetch(`${API_BASE}/seller/products`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createProduct(productData: { productName: string; price: number; stockQuantity: number; description: string }) {
    const response = await fetch(`${API_BASE}/seller/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  async updateProduct(productId: string, productData: Record<string, unknown>) {
    const response = await fetch(`${API_BASE}/seller/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  async getSellerOrders() {
    const response = await fetch(`${API_BASE}/seller/orders`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async updateOrderStatus(orderId: string, newStatus: string) {
    const response = await fetch(`${API_BASE}/seller/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ newStatus }),
    });
    return response.json();
  },

  async getBuyerProducts() {
    const response = await fetch(`${API_BASE}/buyer/products`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createOrder(cartItems: { productId: string; quantity: number }[]) {
    const response = await fetch(`${API_BASE}/buyer/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ cartItems }),
    });
    return response.json();
  },

  async getBuyerOrders() {
    const response = await fetch(`${API_BASE}/buyer/orders`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
