export const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
  className = ""
}) => {
  return <div className={`flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 ${className}`}>{label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}<select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
  ><option value="">{placeholder}</option>{options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>;
};
