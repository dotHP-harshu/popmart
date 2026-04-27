import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { showToast } from '../components/Toast';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const passwordStrength = (pw: string) => {
    if (pw.length < 4) return { level: 0, text: '', color: '' };
    if (pw.length < 8) return { level: 1, text: 'Weak', color: 'bg-red-500' };
    if (pw.length < 12 && !/[A-Z]/.test(pw)) return { level: 2, text: 'Fair', color: 'bg-amber-500' };
    if (pw.length < 12 || !/[0-9]/.test(pw)) return { level: 3, text: 'Good', color: 'bg-blue-500' };
    return { level: 4, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await api.register(fullName, email, password, role);
    setLoading(false);

    if (response.success) {
      login(response.data.user, response.data.token);
      showToast('Account created!', 'success');
      const userRole = response.data.user.role;
      if (userRole === 'seller') navigate('/seller');
      else navigate('/store');
    } else {
      showToast(response.error, 'error');
    }
  };

  return (
    <div className="min-h-screen gradient-warm flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-10 right-20 w-80 h-80 bg-white/5 rounded-full animate-float" />
      <div className="absolute bottom-10 left-20 w-64 h-64 bg-white/5 rounded-full animate-float" style={{ animationDelay: '2s' }} />

      <div className="glass rounded-2xl p-8 w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Join PopMart</h1>
          <p className="text-white/70 mt-2">Start buying or selling today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              placeholder="Your name"
              required
            />
          </div>
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
              placeholder="Create a password"
              required
            />
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength.level ? strength.color : 'bg-white/20'}`} />
                  ))}
                </div>
                <p className="text-xs text-white/60 mt-1">{strength.text}</p>
              </div>
            )}
          </div>

          {/* role selector as visual cards */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">I want to be a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`p-4 rounded-xl border-2 transition text-center ${
                  role === 'buyer'
                    ? 'border-white bg-white/20 text-white'
                    : 'border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                <div className="text-2xl mb-1">🛒</div>
                <p className="font-medium text-sm">Buyer</p>
                <p className="text-xs opacity-60 mt-0.5">Shop products</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`p-4 rounded-xl border-2 transition text-center ${
                  role === 'seller'
                    ? 'border-white bg-white/20 text-white'
                    : 'border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                <div className="text-2xl mb-1">🏪</div>
                <p className="font-medium text-sm">Seller</p>
                <p className="text-xs opacity-60 mt-0.5">Sell products</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-pink-600 py-3 rounded-lg font-semibold hover:bg-white/90 disabled:opacity-50 transition mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-white/60">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
