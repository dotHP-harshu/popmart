import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

interface Product {
  _id: string;
  productName: string;
  price: number;
  stockQuantity: number;
  description: string;
  sellerId: { fullName: string };
}

function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await api.getBuyerProducts();
      if (response.success) {
        setProducts(response.data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({ productId: product._id, productName: product.productName, price: product.price });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">PopMart Store</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {user?.fullName}</span>
            <button onClick={() => navigate('/cart')} className="text-sm text-blue-600 hover:underline">Cart</button>
            <button onClick={() => navigate('/orders')} className="text-sm text-blue-600 hover:underline">My Orders</button>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Available Products</h2>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg">{product.productName}</h3>
                <p className="text-sm text-gray-500 mt-1">by {product.sellerId?.fullName}</p>
                <p className="text-sm text-gray-600 mt-2">{product.description || 'No description'}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-bold">${product.price}</span>
                  <span className="text-sm text-gray-500">{product.stockQuantity} in stock</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Storefront;
