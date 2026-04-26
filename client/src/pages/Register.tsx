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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="border-2 border-black p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-black uppercase tracking-tight">Join PopMart</h1>
            <p className="text-sm text-gray-500 mt-1">Start buying or selling today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black bg-white text-black placeholder-gray-400 focus:outline-none focus:bg-gray-100 transition text-sm"
                placeholder="Your name"
                required
              />
            </div>
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
                placeholder="Create a password"
                required
              />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 ${i <= strength.level ? strength.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{strength.text}</p>
                </div>
              )}
            </div>

            {/* role selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">I want to be a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-4 border-2 transition text-center ${
                    role === 'buyer'
                      ? 'border-black bg-black text-white'
                      : 'border-black bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl mb-1">X</div>
                  <p className="font-bold text-sm uppercase">Buyer</p>
                  <p className="text-xs opacity-60 mt-0.5">Shop products</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`p-4 border-2 transition text-center ${
                    role === 'seller'
                      ? 'border-black bg-black text-white'
                      : 'border-black bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl mb-1">Y</div>
                  <p className="font-bold text-sm uppercase">Seller</p>
                  <p className="text-xs opacity-60 mt-0.5">Sell products</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 font-bold uppercase tracking-wider text-sm hover:bg-gray-800 disabled:opacity-50 transition border-2 border-black mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-bold uppercase hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
