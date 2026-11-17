import { TrendingUp, TrendingDown } from "lucide-react";
export const StatCard = ({
  title,
  value,
  icon: Icon,
  iconBgColor = "bg-blue-50",
  iconColor = "text-primary",
  trend,
  onClick,
  className = ""
}) => {
  return <div
    onClick={onClick}
    className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md ${onClick ? "cursor-pointer hover:border-blue-300" : ""} ${className}`}
  ><div className="flex items-center justify-between"><div className={`p-3 rounded-xl ${iconBgColor} ${iconColor}`}><Icon className="w-6 h-6" /></div></div><div className="mt-4"><h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3><p className="text-sm font-medium text-slate-500 mt-1">{title}</p></div>{trend && <div className="mt-3 flex items-center text-xs font-medium">{trend.isPositive !== false ? <span className="text-emerald-600 flex items-center mr-1"><TrendingUp className="w-3.5 h-3.5 mr-1" />{trend.value}</span> : <span className="text-rose-600 flex items-center mr-1"><TrendingDown className="w-3.5 h-3.5 mr-1" />{trend.value}</span>}<span className="text-slate-400">{trend.label || "vs last month"}</span></div>}</div>;
};
