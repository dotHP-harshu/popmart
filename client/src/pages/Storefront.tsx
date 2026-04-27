import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
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
  sellerId: { fullName: string };
}

function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, logout } = useAuthStore();
  const { addItem, items } = useCartStore();
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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category || 'General')))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = debouncedSearch === '' ||
      product.productName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(debouncedSearch.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product._id,
      productName: product.productName,
      price: product.price,
      images: product.images,
    });
    showToast(`Added ${product.productName} to cart`, 'success');
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* sticky header */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold gradient-brand bg-clip-text text-transparent">PopMart</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">Hi, {user?.fullName}</span>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-gray-600 hover:text-brand-600 transition"
            >
              My Orders
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative text-sm text-gray-600 hover:text-brand-600 transition"
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-brand-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-600 hover:underline">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* hero banner */}
      <div className="gradient-brand py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Discover Amazing Products</h2>
          <p className="text-white/70 mb-6">Shop from sellers all around the world</p>

          {/* search bar */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full px-5 py-3 pl-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* category chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* products grid */}
        {loading ? (
          <Skeleton variant="card" />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.images && product.images.length > 0 ? product.images : [];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      {/* image area */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={product.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23e2e8f0" width="200" height="200"/><text fill="%2394a3b8" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="14">No Image</text></svg>';
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-sm"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-sm"
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_: string, i: number) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}

        {/* category badge */}
        <span className="absolute top-2 left-2 bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
          {product.category || 'General'}
        </span>
      </div>

      {/* content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{product.productName}</h3>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <span className="w-4 h-4 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-[8px] font-bold">
            {product.sellerId?.fullName?.[0] || 'S'}
          </span>
          {product.sellerId?.fullName || 'Seller'}
        </p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {product.description || 'No description'}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">${product.price}</span>
          <span className="text-xs text-gray-400">{product.stockQuantity} in stock</span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="mt-3 w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default Storefront;
