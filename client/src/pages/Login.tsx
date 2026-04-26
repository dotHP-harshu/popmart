import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { showToast } from '../components/Toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await api.login(email, password);
    setLoading(false);

    if (response.success) {
      login(response.data.user, response.data.token);
      showToast('Welcome back!', 'success');
      const role = response.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'seller') navigate('/seller');
      else navigate('/store');
    } else {
      showToast(response.error, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="border-2 border-black p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black uppercase tracking-tight">PopMart</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back to the marketplace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black bg-white text-black placeholder-gray-400 focus:outline-none focus:bg-gray-100 transition text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black bg-white text-black placeholder-gray-400 focus:outline-none focus:bg-gray-100 transition text-sm"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 font-bold uppercase tracking-wider text-sm hover:bg-gray-800 disabled:opacity-50 transition border-2 border-black mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-black font-bold uppercase hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
