import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authService } from "../../services/authService";
import { useToast } from "../../components/Toast";
export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();
  const { success } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const strength = getStrength(password);
  const strengthLabels = ["Too Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = ["bg-slate-200", "bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword({ token, email, newPassword: password });
      success("Success!", "Password has been reset. Please sign in with your new credentials.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to reset password. The link may have expired."
      );
    } finally {
      setIsLoading(false);
    }
  };
  return <div><div className="mb-6"><h2 className="text-xl font-bold text-slate-900 tracking-tight">Set new password</h2><p className="text-xs text-slate-500 mt-1">
          Create a secure password with a mix of letters, numbers, and symbols.
        </p></div>{errorMsg && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2"><AlertCircle className="w-4 h-4 text-rose-500 shrink-0" /><span>{errorMsg}</span></div>}<form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            New Password
          </label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input
    type={showPassword ? "text" : "password"}
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter new password"
    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder-slate-400"
  /><button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
  >{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>{
    /* Strength Meter */
  }{password && <div className="mt-2"><div className="flex justify-between items-center text-[10px] text-slate-500 mb-1"><span>Strength: {strengthLabels[strength]}</span></div><div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex space-x-1">{[...Array(4)].map((_, i) => <div
    key={i}
    className={`h-full flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColors[strength] : "bg-slate-200"}`}
  />)}</div></div>}</div><div><label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Confirm Password
          </label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input
    type="password"
    required
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    placeholder="Confirm new password"
    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder-slate-400"
  /></div></div><button
    type="submit"
    disabled={isLoading}
    className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center disabled:opacity-50"
  >{isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Reset Password"}</button><div className="text-center mt-3"><Link to="/login" className="text-xs text-slate-500 hover:text-primary transition-colors">
            Cancel and back to login
          </Link></div></form></div>;
};
