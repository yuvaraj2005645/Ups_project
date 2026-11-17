import { Loader2 } from "lucide-react";
export const LoadingSpinner = ({
  fullPage = false,
  message = "Loading...",
  size = "md",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  }[size];
  const content = <div className={`flex flex-col items-center justify-center p-6 ${className}`}><Loader2 className={`${sizeClasses} text-primary animate-spin`} />{message && <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>}</div>;
  if (fullPage) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">{content}</div>;
  }
  return content;
};
