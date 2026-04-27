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
    <div className="min-h-screen bg-white">
      {/* sticky header */}
      <nav className="bg-white border-b-2 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-black uppercase tracking-tight">PopMart</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">Hi, {user?.fullName}</span>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-gray-600 hover:text-black font-bold uppercase transition"
            >
              My Orders
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative text-sm text-gray-600 hover:text-black font-bold uppercase transition"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-black text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-600 font-bold uppercase border-2 border-red-600 px-3 py-1 hover:bg-red-600 hover:text-white transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* hero banner */}
      <div className="bg-black py-12 px-4 border-b-2 border-black">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-3">Discover Amazing Products</h2>
          <p className="text-gray-400 mb-6">Shop from sellers all around the world</p>

          {/* search bar */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full px-5 py-3 pl-12 bg-white border-2 border-white text-black placeholder-gray-400 focus:outline-none focus:border-gray-400 transition text-sm"
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className={`px-4 py-2 text-sm font-bold uppercase whitespace-nowrap transition border-2 ${
                selectedCategory === cat
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-300'
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
            <div className="w-20 h-20 mx-auto mb-4 border-2 border-gray-300 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg uppercase font-bold">No products found</p>
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
    <div className="bg-white border-2 border-black overflow-hidden group">
      {/* image area */}
      <div className="relative h-48 overflow-hidden bg-gray-100 border-b-2 border-black">
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black text-white w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-sm font-bold border border-black"
                >
                  &lt;
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-sm font-bold border border-black"
                >
                  &gt;
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_: string, i: number) => (
                    <div
                      key={i}
                      className={`w-2 h-2 ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm uppercase font-bold">
            No Image
          </div>
        )}

        {/* category badge */}
        <span className="absolute top-2 left-2 bg-white text-black text-xs px-2 py-1 font-bold uppercase border-2 border-black">
          {product.category || 'General'}
        </span>
      </div>

      {/* content */}
      <div className="p-4">
        <h3 className="font-bold truncate uppercase">{product.productName}</h3>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[8px] font-bold">
            {product.sellerId?.fullName?.[0] || 'S'}
          </span>
          {product.sellerId?.fullName || 'Seller'}
        </p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {product.description || 'No description'}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-black">${product.price}</span>
          <span className="text-xs text-gray-400">{product.stockQuantity} in stock</span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="mt-3 w-full bg-black text-white py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 active:scale-[0.98] transition flex items-center justify-center gap-2 border-2 border-black"
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
