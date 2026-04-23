const API_BASE = '/api';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('popmart_token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    return { success: false, error: data.error || 'Something went wrong' };
  }
  return data;
}

export const api = {
  // --- auth ---

  async register(fullName: string, email: string, password: string, role: string) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, role }),
    });
    return handleResponse(response);
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  // --- admin ---

  async getAdminStats() {
    const response = await fetch(`${API_BASE}/admin/stats`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  async getPendingSellers() {
    const response = await fetch(`${API_BASE}/admin/pending-sellers`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  async approveSeller(sellerId: string) {
    const response = await fetch(`${API_BASE}/admin/sellers/${sellerId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getAllUsers(role?: string, isActive?: boolean) {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (isActive !== undefined) params.set('isActive', String(isActive));
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE}/admin/users${query}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  async updateUserStatus(userId: string, isActive: boolean) {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(response);
  },

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getAllProducts() {
    const response = await fetch(`${API_BASE}/admin/products`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  async deleteProduct(productId: string) {
    const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getAllOrders() {
    const response = await fetch(`${API_BASE}/admin/orders`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  // --- seller ---

  async getSellerProducts() {
    const response = await fetch(`${API_BASE}/seller/products`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  async createProduct(productData: {
    productName: string;
    price: number;
    stockQuantity: number;
    description: string;
    images?: string[];
    category?: string;
  }) {
    const response = await fetch(`${API_BASE}/seller/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  async updateProduct(productId: string, productData: Record<string, unknown>) {
    const response = await fetch(`${API_BASE}/seller/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  async getSellerOrders() {
    const response = await fetch(`${API_BASE}/seller/orders`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  async updateOrderStatus(orderId: string, newStatus: string) {
    const response = await fetch(`${API_BASE}/seller/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ newStatus }),
    });
    return handleResponse(response);
  },

  // --- buyer ---

  async getBuyerProducts() {
    const response = await fetch(`${API_BASE}/buyer/products`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  async createOrder(cartItems: { productId: string; quantity: number }[]) {
    const response = await fetch(`${API_BASE}/buyer/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ cartItems }),
    });
    return handleResponse(response);
  },

  async getBuyerOrders() {
    const response = await fetch(`${API_BASE}/buyer/orders`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
};
