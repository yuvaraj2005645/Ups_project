import { Inbox } from "lucide-react";
export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = ""
}) => {
  return <div
    className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 ${className}`}
  ><div className="w-14 h-14 rounded-2xl bg-blue-50/70 text-primary flex items-center justify-center mb-4"><Icon className="w-7 h-7" /></div><h3 className="text-base font-semibold text-slate-800">{title}</h3>{description && <p className="mt-1.5 text-sm text-slate-500 max-w-sm">{description}</p>}{action && <button
    type="button"
    onClick={action.onClick}
    className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors"
  >{action.icon && <action.icon className="w-4 h-4 mr-2" />}{action.label}</button>}</div>;
};
