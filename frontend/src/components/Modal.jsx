import { useEffect } from "react";
import { X } from "lucide-react";
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "md"
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl"
  }[maxWidth];
  return <div className="fixed inset-0 z-50 overflow-y-auto">{
    /* Backdrop */
  }<div
    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
    onClick={onClose}
  />{
    /* Modal Dialog */
  }<div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0"><div
    className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidthClasses} border border-slate-100`}
  >{title && <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><h3 className="text-lg font-semibold text-slate-900">{title}</h3><button
    type="button"
    onClick={onClose}
    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
  ><X className="w-5 h-5" /></button></div>}<div className="px-6 py-4">{children}</div>{footer && <div className="flex items-center justify-end space-x-3 border-t border-slate-100 bg-slate-50/50 px-6 py-3.5">{footer}</div>}</div></div></div>;
};
