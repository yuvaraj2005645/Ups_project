import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  Map,
  UserCheck,
  Warehouse,
  PackageCheck,
  Shield,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../hooks/useNotifications";

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Shipments", path: "/shipments", icon: Package },
    { label: "Fleet Management", path: "/fleet", icon: Truck },
    { label: "Drivers", path: "/drivers", icon: Users },
    { label: "Route Management", path: "/routes", icon: Map },
    { label: "Customers", path: "/customers", icon: UserCheck },
    { label: "Warehouses", path: "/warehouses", icon: Warehouse },
    { label: "Deliveries", path: "/deliveries", icon: PackageCheck },
    { label: "User Management", path: "/users", icon: Shield },
    { label: "Notifications", path: "/notifications", icon: Bell, badge: unreadCount },
    { label: "Settings", path: "/settings", icon: Settings },
    { label: "My Profile", path: "/profile", icon: User }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const item = navItems.find(
      (n) => n.path === path || (n.path !== "/dashboard" && path.startsWith(n.path))
    );
    return item ? item.label : "FleetOps";
  };

  return (
    /* ── Root shell: full viewport, no overflow ── */
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] flex">

      {/* ════════════════════════════════════════════
          FIXED SIDEBAR  (desktop)
          Always fixed to left edge, full height.
          On mobile: slides in as a drawer.
      ════════════════════════════════════════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-[#0F172A]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-blue-500/20">
              FO
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide text-white">FleetOps</span>
              <span className="block text-[10px] text-blue-400 uppercase tracking-widest font-semibold">
                Enterprise Logistics
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items — scrolls independently if too tall */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-blue-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? "bg-white text-primary" : "bg-rose-500 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User / Sign-Out Section — always visible at bottom */}
        <div className="shrink-0 p-3.5 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name || "Administrator"}</p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {user?.role?.toLowerCase() || "Admin"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ════════════════════════════════════════════
          RIGHT COLUMN  — header + scrollable content
          Offset by sidebar width on desktop.
      ════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 md:pl-64">

        {/* Mobile top bar — only shown on small screens */}
        <div className="md:hidden flex items-center justify-between bg-[#0F172A] px-4 py-3 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-base">
              FO
            </div>
            <span className="font-bold text-lg tracking-wide text-white">FleetOps</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-1.5 text-slate-300 hover:text-white"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Fixed top header — desktop */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200/80 items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm/50 z-30">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-slate-900">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Notifications Bell */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name || "Admin User"}</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{user?.role || "ADMIN"}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-40">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { setIsUserDropdownOpen(false); navigate("/profile"); }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => { setIsUserDropdownOpen(false); navigate("/settings"); }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => { setIsUserDropdownOpen(false); handleLogout(); }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile page title bar */}
        <div className="md:hidden px-4 py-2 bg-white border-b border-slate-200/80 shrink-0">
          <h1 className="text-base font-bold text-slate-900">{getPageTitle()}</h1>
        </div>

        {/* ── Scrollable main content ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
