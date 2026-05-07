import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { FileText, Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await login(email, password);
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Logged in successfully');
      navigate('/');
    }
  };

  const fillDemo = (e, email, pass) => {
    e.preventDefault();
    setEmail(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl text-white mb-4 shadow-lg shadow-primary-200">
            <FileText size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to your collaborative editor</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white hover:bg-primary-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-600 mb-4">Demo Credentials:</p>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={(e) => fillDemo(e, 'priyansh@test.com', 'Test12345')}
                className="text-xs text-left px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <span className="font-bold">Admin:</span> priyansh@test.com / Test12345
              </button>
              <button 
                onClick={(e) => fillDemo(e, 'demo@test.com', 'demo')}
                className="text-xs text-left px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <span className="font-bold">Demo:</span> demo@test.com / demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
