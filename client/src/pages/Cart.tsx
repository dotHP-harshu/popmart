import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { useState } from 'react';

function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    const cartItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const response = await api.createOrder(cartItems);
    setLoading(false);

    if (response.success) {
      clearCart();
      setSuccess(true);
      setTimeout(() => navigate('/orders'), 1500);
    } else {
      setError(response.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Shopping Cart</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/store')} className="text-sm text-blue-600 hover:underline">Back to Store</button>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Order placed successfully! Redirecting to your orders...
          </div>
        ) : null}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <button onClick={() => navigate('/store')} className="mt-4 text-blue-600 hover:underline">
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.productName}</h3>
                    <p className="text-sm text-gray-500">${item.price} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-4 w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:opacity-50 font-semibold"
              >
                {loading ? 'Placing order...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
