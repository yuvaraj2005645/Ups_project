import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
const ToastContext = createContext(void 0);
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const addToast = useCallback(
    (type, title, message, duration = 4e3) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );
  const success = useCallback((title, message) => addToast("success", title, message), [addToast]);
  const error = useCallback((title, message) => addToast("error", title, message, 5e3), [addToast]);
  const warning = useCallback((title, message) => addToast("warning", title, message), [addToast]);
  const info = useCallback((title, message) => addToast("info", title, message), [addToast]);
  return <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>{children}{
    /* Toast Container */
  }<div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">{toasts.map((t) => {
    let bg = "bg-white border-slate-200 text-slate-800";
    let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    if (t.type === "success") {
      bg = "bg-white border-emerald-200 text-slate-800";
      icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    } else if (t.type === "error") {
      bg = "bg-white border-rose-200 text-slate-800";
      icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
    } else if (t.type === "warning") {
      bg = "bg-white border-amber-200 text-slate-800";
      icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
    }
    return <div
      key={t.id}
      className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border shadow-lg ${bg} transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200`}
    >{icon}<div className="flex-1 min-w-0"><h5 className="text-sm font-semibold">{t.title}</h5>{t.message && <p className="mt-0.5 text-xs text-slate-500 leading-snug">{t.message}</p>}</div><button
      type="button"
      onClick={() => removeToast(t.id)}
      className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
    ><X className="w-4 h-4" /></button></div>;
  })}</div></ToastContext.Provider>;
};
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
