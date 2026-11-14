import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authService } from '../../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const msg = await authService.forgotPassword(email);
      setSuccessMsg(msg);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || err.message || 'Failed to send reset link. Please check the email.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to sign in
        </Link>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Forgot password?</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your email and we'll send a password reset instructions link.
        </p>
      </div>

      {successMsg ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <div className="flex items-center space-x-2 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Reset Link Sent</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-emerald-700">{successMsg}</p>
          <Link
            to="/login"
            className="mt-4 inline-block text-xs font-semibold text-emerald-800 hover:underline"
          >
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Account Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      )}
    </div>
  );
};
