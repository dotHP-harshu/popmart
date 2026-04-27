import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { useState } from 'react';
import { showToast } from '../components/Toast';

function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setLoading(true);

    const cartItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const response = await api.createOrder(cartItems);
    setLoading(false);

    if (response.success) {
      clearCart();
      setSuccess(true);
      showToast('Order placed successfully!', 'success');
      setTimeout(() => navigate('/orders'), 1500);
    } else {
      showToast(response.error, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b-2 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-black uppercase tracking-tight">Shopping Cart</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/store')} className="text-sm text-gray-600 hover:text-black font-bold uppercase transition">
              Continue Shopping
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-600 font-bold uppercase border-2 border-red-600 px-3 py-1 hover:bg-red-600 hover:text-white transition">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {success && (
          <div className="bg-emerald-100 border-2 border-emerald-600 text-emerald-700 px-6 py-4 mb-6 animate-fade-in text-center font-bold uppercase">
            Order placed! Redirecting to your orders...
          </div>
        )}

        {items.length === 0 && !success ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 border-2 border-gray-300 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2 uppercase font-bold">Your cart is empty</p>
            <button onClick={() => navigate('/store')} className="text-black font-bold uppercase hover:underline">
              Start Shopping
            </button>
          </div>
        ) : items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* cart items */}
            <div className="flex-1 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="bg-white border-2 border-black p-4 flex gap-4 animate-fade-in">
                  {/* thumbnail */}
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.productName}
                      className="w-16 h-16 object-cover flex-shrink-0 border-2 border-black"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate uppercase">{item.productName}</h3>
                    <p className="text-sm text-gray-500">${item.price} each</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center border-2 border-black">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition font-bold"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-black w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-gray-400 hover:text-red-600 transition p-1 border-2 border-transparent hover:border-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* order summary sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white border-2 border-black p-6 lg:sticky lg:top-20">
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                    <span className="font-bold">${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-bold">Free</span>
                  </div>
                  <div className="border-t-2 border-black pt-3 mt-3 flex justify-between font-black text-lg">
                    <span>TOTAL</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="mt-4 w-full bg-black text-white py-3 font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition border-2 border-black"
                >
                  {loading ? 'Placing order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Cart;
