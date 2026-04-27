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
    <div className="min-h-screen gradient-brand flex items-center justify-center px-4 relative overflow-hidden">
      {/* floating shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="glass rounded-2xl p-8 w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">PopMart</h1>
          <p className="text-white/70 mt-2">Welcome back to the marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-brand-700 py-3 rounded-lg font-semibold hover:bg-white/90 disabled:opacity-50 transition mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-white/60">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
