import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const LoginPage: React.FC = () => {
  const { login, resetPassword, showToast } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Invalid email or password');
    }
  };

  const handleDemoCustomerLogin = async () => {
    setLoading(true);
    await login('mahesh.reddy@gmail.com', 'Password@123', 'customer');
    setLoading(false);
    navigate('/dashboard');
  };

  const handleDemoAdminLogin = async () => {
    setLoading(true);
    await login('admin@rscreation.in', 'Password@123', 'admin');
    setLoading(false);
    navigate('/admin/dashboard');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetSending(true);
    const res = await resetPassword(resetEmail);
    setResetSending(false);

    if (res.success) {
      showToast('Password reset link sent to your email!');
      setShowResetModal(false);
    } else {
      setErrorMsg(res.error || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-xs">
        <div className="text-center">
          <Link to="/" className="text-2xl font-black text-slate-900 font-display">
            RScreation
          </Link>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Welcome to Your Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your purchased PSD files, re-downloads, and license keys.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="designer@studio.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-800">Password</label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}
                className="text-[11px] text-amber-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Testing Shortcut Helpers */}
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <p className="text-[11px] text-center font-medium text-slate-400 uppercase tracking-wider">
            Quick 1-Click Demo Profiles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomerLogin}
              className="py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors text-center"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={handleDemoAdminLogin}
              className="py-2 px-3 bg-amber-500/10 border border-amber-300 hover:bg-amber-500/20 text-amber-900 text-xs font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="text-slate-900 font-semibold hover:underline">
            Register now
          </Link>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Reset Your Password</h3>
            <p className="text-xs text-slate-500">
              Enter your account email to receive a password reset link from Supabase Auth.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="designer@studio.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetSending}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-60"
                >
                  {resetSending ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
