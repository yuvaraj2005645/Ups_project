import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Map,
  Navigation,
  CheckCircle2,
  FileCheck,
  History,
  User,
  LogOut,
  Menu,
  X,
  Truck
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
export const DriverLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
    { label: "Driver Dashboard", path: "/driver/dashboard", icon: LayoutDashboard },
    { label: "My Shipments", path: "/driver/shipments", icon: Package },
    { label: "My Route", path: "/driver/route", icon: Map },
    { label: "Route Navigation", path: "/driver/navigate", icon: Navigation },
    { label: "Update Status", path: "/driver/update-status", icon: CheckCircle2 },
    { label: "Proof of Delivery", path: "/driver/pod", icon: FileCheck },
    { label: "Delivery History", path: "/driver/history", icon: History },
    { label: "My Profile", path: "/driver/profile", icon: User }
  ];
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">{
    /* Mobile Top Bar */
  }<div className="md:hidden flex items-center justify-between bg-[#0F172A] px-4 py-3 text-white border-b border-slate-800 sticky top-0 z-40"><div className="flex items-center space-x-2"><div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-base"><Truck className="w-4 h-4" /></div><div><span className="font-bold text-base tracking-wide text-white">FleetOps</span><span className="block text-[10px] text-emerald-400 font-medium">Driver Portal</span></div></div><button
    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
  >{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button></div>{
    /* Driver Sidebar */
  }<aside
    className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
  ><div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80"><div className="flex items-center space-x-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-emerald-500/20"><Truck className="w-5 h-5" /></div><div><span className="font-bold text-lg tracking-wide text-white">FleetOps</span><span className="block text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">
                Driver Portal
              </span></div></div><button
    onClick={() => setIsMobileMenuOpen(false)}
    className="md:hidden text-slate-400 hover:text-white"
  ><X className="w-5 h-5" /></button></div><div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">{navItems.map((item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return <NavLink
      key={item.path}
      to={item.path}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"}`}
    ><Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} /><span>{item.label}</span></NavLink>;
  })}</div>{
    /* Driver Profile Footer */
  }<div className="p-3.5 border-t border-slate-800/80 bg-slate-900/40"><div className="flex items-center justify-between"><div className="flex items-center space-x-3 min-w-0"><div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-sm font-semibold shrink-0">{user?.name ? user.name.charAt(0).toUpperCase() : "D"}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-white truncate">{user?.name || "Driver"}</p><span className="inline-block px-1.5 py-0.2 text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold rounded">
                  On Duty
                </span></div></div><button
    onClick={handleLogout}
    title="Sign Out"
    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
  ><LogOut className="w-4 h-4" /></button></div></div></aside>{
    /* Backdrop */
  }{isMobileMenuOpen && <div
    onClick={() => setIsMobileMenuOpen(false)}
    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
  />}{
    /* Main Content */
  }<div className="flex-1 flex flex-col min-w-0 overflow-hidden"><header className="h-16 bg-white border-b border-slate-200/80 hidden md:flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm/50"><div className="flex items-center space-x-3"><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● Driver Session Active
            </span><span className="text-sm font-medium text-slate-500">Welcome, {user?.name}</span></div><button
    onClick={handleLogout}
    className="flex items-center space-x-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
  ><LogOut className="w-3.5 h-3.5" /><span>Sign Out</span></button></header><main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"><Outlet /></main></div></div>;
};
