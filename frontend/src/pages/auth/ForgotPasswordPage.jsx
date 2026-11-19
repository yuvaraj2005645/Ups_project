import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert, Shield, Truck } from "lucide-react";
import { authService } from "../../services/authService";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const msg = await authService.forgotPassword(email);
      setSuccessMsg(msg);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to send reset link. Please check the email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-center px-5 py-12"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/20">
          FO
        </div>
        <div>
          <div className="font-bold text-slate-900">FleetOps</div>
          <div className="text-xs text-slate-500">Enterprise Logistics</div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-slate-100"
        style={{ boxShadow: "0 20px 60px rgba(15,23,42,0.08), 0 4px 16px rgba(15,23,42,0.04)" }}>
        <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-[#1D4ED8] to-[#2563EB]" />
        <div className="px-8 py-8">
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Forgot password?</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your email and we'll send you a password reset link.
            </p>
          </div>

          {successMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Reset Link Sent
              </div>
              <p className="text-xs leading-relaxed text-emerald-700 mb-4">{successMsg}</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {errorMsg && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] shadow-lg shadow-blue-500/25 transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-wait"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-400">Secure authentication powered by FleetOps</span>
      </div>
    </div>
  );
};
