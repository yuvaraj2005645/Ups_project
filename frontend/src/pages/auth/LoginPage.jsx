import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye, EyeOff, Lock, Mail, ShieldCheck, Navigation, Truck,
  AlertCircle, ArrowRight, CheckCircle2, Package, MapPin,
  Activity, Users, BarChart3, Clock, Shield
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/Toast";
import "./LoginPage.css";

/* ─────────────────────────────────────────────────────────
   ROLE CONFIGURATION
───────────────────────────────────────────────────────── */
const ROLES = {
  ADMIN: {
    id: "ADMIN",
    label: "Admin",
    tagline: "Enterprise Control Center",
    icon: ShieldCheck,
    email: "admin@fleetops.com",
    password: "Admin@123",
    // Left panel
    headline: "Command Your Entire Logistics Network",
    description:
      "Manage fleet operations, shipments, drivers, routes and enterprise performance from one intelligent platform.",
    eyebrow: "ENTERPRISE CONTROL CENTER",
    footnote: "Full system authority · 360° fleet visibility",
    // Colors
    panelFrom: "#0A0F1E",
    panelVia: "#0D1B3E",
    panelTo: "#0F172A",
    accentFrom: "#1E40AF",
    accentTo: "#2563EB",
    glow: "rgba(37,99,235,0.35)",
    glowSoft: "rgba(96,165,250,0.12)",
    accent: "#2563EB",
    accentLight: "#60A5FA",
    accentBg: "#EFF6FF",
    accentText: "#1D4ED8",
    ring: "#BFDBFE",
    buttonFrom: "#1D4ED8",
    buttonTo: "#2563EB",
    buttonHover: "#1E40AF",
    // Welcome
    welcomeTitle: "Welcome, Administrator",
    welcomeSub: "Sign in to access your enterprise control center.",
    // Stats cards
    stats: [
      { icon: Package, label: "Active Shipments", value: "1,284", trend: "+12%" },
      { icon: Truck, label: "Fleet Vehicles", value: "248", trend: "94% active" },
      { icon: Users, label: "Drivers", value: "186", trend: "On duty" },
      { icon: BarChart3, label: "On-Time Rate", value: "97.4%", trend: "↑ 2.1%" },
    ],
  },
  DISPATCHER: {
    id: "DISPATCHER",
    label: "Dispatcher",
    tagline: "Operations Command Center",
    icon: Navigation,
    email: "dispatcher@fleetops.com",
    password: "Dispatch@123",
    headline: "Coordinate Every Delivery. Control Every Route.",
    description:
      "Monitor shipments, assign drivers, optimise delivery routes and coordinate logistics operations in real time.",
    eyebrow: "OPERATIONS COMMAND CENTER",
    footnote: "Real-time dispatch · Route optimisation",
    panelFrom: "#0C0A1E",
    panelVia: "#1A1545",
    panelTo: "#1E1B4B",
    accentFrom: "#5B21B6",
    accentTo: "#7C3AED",
    glow: "rgba(124,58,237,0.35)",
    glowSoft: "rgba(167,139,250,0.12)",
    accent: "#7C3AED",
    accentLight: "#A78BFA",
    accentBg: "#F5F3FF",
    accentText: "#6D28D9",
    ring: "#DDD6FE",
    buttonFrom: "#6D28D9",
    buttonTo: "#7C3AED",
    buttonHover: "#5B21B6",
    welcomeTitle: "Welcome, Dispatcher",
    welcomeSub: "Sign in to manage your daily logistics operations.",
    stats: [
      { icon: Activity, label: "Active Routes", value: "64", trend: "Live now" },
      { icon: Package, label: "Pending Dispatch", value: "38", trend: "Queue" },
      { icon: MapPin, label: "Delivery Zones", value: "12", trend: "Covered" },
      { icon: Clock, label: "Avg. Dispatch", value: "4.2 min", trend: "↓ Fast" },
    ],
  },
  DRIVER: {
    id: "DRIVER",
    label: "Driver",
    tagline: "Driver Workspace",
    icon: Truck,
    email: "driver@fleetops.com",
    password: "Driver@123",
    headline: "Your Route. Your Deliveries. Your Journey.",
    description:
      "Access your assigned shipments, navigate delivery routes, update status and complete deliveries efficiently.",
    eyebrow: "DRIVER WORKSPACE",
    footnote: "Safe driving · On-time delivery",
    panelFrom: "#021A11",
    panelVia: "#052E16",
    panelTo: "#064E3B",
    accentFrom: "#065F46",
    accentTo: "#059669",
    glow: "rgba(16,185,129,0.35)",
    glowSoft: "rgba(110,231,183,0.12)",
    accent: "#10B981",
    accentLight: "#6EE7B7",
    accentBg: "#ECFDF5",
    accentText: "#065F46",
    ring: "#A7F3D0",
    buttonFrom: "#047857",
    buttonTo: "#059669",
    buttonHover: "#065F46",
    welcomeTitle: "Welcome, Driver",
    welcomeSub: "Sign in to access your driver workspace.",
    stats: [
      { icon: Package, label: "Today's Deliveries", value: "14", trend: "Assigned" },
      { icon: MapPin, label: "Route Distance", value: "142 km", trend: "Planned" },
      { icon: CheckCircle2, label: "Completed", value: "9", trend: "Today" },
      { icon: Clock, label: "ETA", value: "On Time", trend: "✓ Good" },
    ],
  },
};

const ROLE_ORDER = ["ADMIN", "DISPATCHER", "DRIVER"];

/* ─────────────────────────────────────────────────────────
   LEFT PANEL ILLUSTRATIONS
───────────────────────────────────────────────────────── */
const AdminIllustration = ({ accent, accentLight }) => (
  <svg viewBox="0 0 480 300" className="w-full h-auto max-h-56" aria-hidden="true">
    <defs>
      <linearGradient id="adm-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={accentLight} stopOpacity="0.08" />
        <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
      </linearGradient>
      <linearGradient id="adm-truck" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.9" />
      </linearGradient>
      <filter id="adm-shadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
        <feOffset dy="4" /><feComponentTransfer><feFuncA type="linear" slope="0.25" /></feComponentTransfer>
        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    {/* Road */}
    <ellipse cx="240" cy="265" rx="220" ry="18" fill="#000" opacity="0.2" />
    <rect x="30" y="258" width="420" height="10" rx="5" fill={accent} opacity="0.15" />
    {/* Dashed road centre */}
    {[70,130,190,250,310,370].map(x => <rect key={x} x={x} y="261" width="40" height="4" rx="2" fill="#fff" opacity="0.2" />)}
    {/* City skyline */}
    {[
      {x:30,y:200,w:40,h:60},{x:80,y:180,w:30,h:80},{x:120,y:195,w:35,h:65},
      {x:360,y:185,w:35,h:75},{x:405,y:200,w:30,h:60},{x:445,y:175,w:35,h:85}
    ].map((b,i)=>(
      <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="3"
        fill={accent} opacity="0.12" />
    ))}
    {/* Windows */}
    {[{x:38,y:208},{x:50,y:208},{x:38,y:222},{x:50,y:222},
      {x:88,y:190},{x:98,y:190},{x:88,y:204},{x:98,y:204}].map((w,i)=>(
      <rect key={i} x={w.x} y={w.y} width="8" height="8" rx="1"
        fill={accentLight} opacity="0.4" />
    ))}
    {/* Route path */}
    <path d="M60 250 Q180 210 240 230 Q300 250 420 220"
      fill="none" stroke={accentLight} strokeWidth="2"
      strokeDasharray="8 5" opacity="0.5" />
    {/* Truck */}
    <g filter="url(#adm-shadow)" transform="translate(148,165)">
      <rect x="0" y="10" width="140" height="68" rx="5" fill="url(#adm-truck)" />
      <rect x="4" y="18" width="132" height="48" rx="3" fill="#E0ECFB" opacity="0.7" />
      {/* cargo lines */}
      {[26,36,46,56].map(y=><line key={y} x1="10" y1={y} x2="130" y2={y} stroke="#B0C8E4" strokeWidth="1.5" opacity="0.7"/>)}
      {/* Cab */}
      <path d="M140 28 L140 78 L184 78 L184 56 Q183 28 165 28 Z" fill={accent} opacity="0.95"/>
      <path d="M143 32 L143 52 L180 52 L180 48 Q178 32 165 32 Z" fill="#C7E5FF" opacity="0.85"/>
      {/* Undercarriage */}
      <rect x="-2" y="78" width="188" height="6" rx="3" fill="#94A3B8" opacity="0.5"/>
      {/* Wheels */}
      <circle cx="30" cy="88" r="14" fill="#1E293B"/><circle cx="30" cy="88" r="7" fill="#94A3B8"/>
      <circle cx="156" cy="88" r="14" fill="#1E293B"/><circle cx="156" cy="88" r="7" fill="#94A3B8"/>
    </g>
    {/* Shield badge */}
    <g transform="translate(390,40)">
      <circle r="22" fill={accent} opacity="0.15"/>
      <circle r="16" fill={accent} opacity="0.25"/>
      <path d="M0-10 L8 0 L0 10 L-8 0 Z" fill={accentLight} opacity="0.9"/>
    </g>
    {/* Pin */}
    <g transform="translate(410,210)">
      <path d="M0-14 Q10-14 10 0 Q10 10 0 20 Q-10 10 -10 0 Q-10-14 0-14 Z" fill={accentLight} opacity="0.8"/>
      <circle cy="-2" r="5" fill="#fff" opacity="0.7"/>
    </g>
    {/* Floating KPI */}
    <g transform="translate(32,52)">
      <rect width="120" height="52" rx="10" fill="#fff" opacity="0.08" />
      <rect width="120" height="52" rx="10" fill="none" stroke={accentLight} strokeOpacity="0.2" strokeWidth="1"/>
      <text x="10" y="20" fill={accentLight} fontSize="9" opacity="0.7" fontFamily="Inter,sans-serif">FLEET STATUS</text>
      <text x="10" y="38" fill="#fff" fontSize="16" fontWeight="700" fontFamily="Inter,sans-serif">97.4%</text>
      <text x="52" y="38" fill="#4ADE80" fontSize="10" fontFamily="Inter,sans-serif">↑ On-Time</text>
    </g>
    <g transform="translate(320,30)">
      <rect width="110" height="52" rx="10" fill="#fff" opacity="0.08"/>
      <rect width="110" height="52" rx="10" fill="none" stroke={accentLight} strokeOpacity="0.2" strokeWidth="1"/>
      <text x="10" y="20" fill={accentLight} fontSize="9" opacity="0.7" fontFamily="Inter,sans-serif">SHIPMENTS</text>
      <text x="10" y="38" fill="#fff" fontSize="16" fontWeight="700" fontFamily="Inter,sans-serif">1,284</text>
      <text x="52" y="38" fill="#4ADE80" fontSize="10" fontFamily="Inter,sans-serif">+12%</text>
    </g>
    {/* Dots */}
    {[[70,230],[320,240],[400,235]].map(([cx,cy],i)=>(
      <circle key={i} cx={cx} cy={cy} r="5" fill={accentLight} opacity="0.5"/>
    ))}
  </svg>
);

const DispatcherIllustration = ({ accent, accentLight }) => (
  <svg viewBox="0 0 480 300" className="w-full h-auto max-h-56" aria-hidden="true">
    <defs>
      <linearGradient id="dsp-btn" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity="0.8"/>
        <stop offset="100%" stopColor={accentLight} stopOpacity="0.6"/>
      </linearGradient>
    </defs>
    {/* Map grid */}
    {[0,1,2,3,4,5].map(i=>(
      <line key={`h${i}`} x1="30" y1={60+i*40} x2="450" y2={60+i*40}
        stroke={accentLight} strokeWidth="0.5" opacity="0.1"/>
    ))}
    {[0,1,2,3,4,5,6,7,8,9].map(i=>(
      <line key={`v${i}`} x1={30+i*47} y1="40" x2={30+i*47} y2="280"
        stroke={accentLight} strokeWidth="0.5" opacity="0.1"/>
    ))}
    {/* Route connections */}
    <path d="M80 240 Q140 200 200 210 Q260 220 320 180 Q370 155 420 165"
      fill="none" stroke={accentLight} strokeWidth="2.5" strokeDasharray="6 4" opacity="0.5"/>
    <path d="M80 240 Q160 170 240 160 Q310 150 380 120"
      fill="none" stroke={accent} strokeWidth="2" strokeDasharray="4 6" opacity="0.4"/>
    {/* Command screen */}
    <rect x="140" y="60" width="200" height="130" rx="12" fill="#fff" opacity="0.06"/>
    <rect x="140" y="60" width="200" height="130" rx="12" fill="none"
      stroke={accentLight} strokeWidth="1" strokeOpacity="0.25"/>
    <rect x="140" y="60" width="200" height="22" rx="12" fill={accent} opacity="0.3"/>
    <circle cx="155" cy="71" r="4" fill="#fff" opacity="0.4"/>
    <circle cx="168" cy="71" r="4" fill="#fff" opacity="0.3"/>
    <circle cx="181" cy="71" r="4" fill="#fff" opacity="0.2"/>
    {/* Bar chart inside screen */}
    {[{h:40,x:160},{h:60,x:185},{h:35,x:210},{h:70,x:235},{h:50,x:260},{h:65,x:285},{h:45,x:310}].map((b,i)=>(
      <rect key={i} x={b.x} y={170-b.h} width="16" height={b.h} rx="3"
        fill={i%2===0?accent:accentLight} opacity="0.5"/>
    ))}
    {/* Location pins */}
    {[[80,240],[200,210],[320,180],[420,165],[240,160]].map(([cx,cy],i)=>(
      <g key={i} transform={`translate(${cx},${cy})`}>
        <path d="M0-10 Q7-10 7 0 Q7 8 0 16 Q-7 8 -7 0 Q-7-10 0-10 Z"
          fill={i===0?accentLight:accent} opacity={0.7+i*0.05}/>
        <circle cy="-2" r="3.5" fill="#fff" opacity="0.8"/>
      </g>
    ))}
    {/* Driver assignment cards */}
    <g transform="translate(30,55)">
      <rect width="90" height="58" rx="10" fill="#fff" opacity="0.07"/>
      <rect width="90" height="58" rx="10" fill="none" stroke={accentLight} strokeOpacity="0.2" strokeWidth="1"/>
      <text x="8" y="20" fill={accentLight} fontSize="8" opacity="0.7" fontFamily="Inter,sans-serif">DISPATCH</text>
      <text x="8" y="38" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Inter,sans-serif">64 Routes</text>
      <text x="8" y="52" fill="#4ADE80" fontSize="9" fontFamily="Inter,sans-serif">● Live</text>
    </g>
    <g transform="translate(360,220)">
      <rect width="100" height="55" rx="10" fill="#fff" opacity="0.07"/>
      <rect width="100" height="55" rx="10" fill="none" stroke={accentLight} strokeOpacity="0.2" strokeWidth="1"/>
      <text x="8" y="18" fill={accentLight} fontSize="8" opacity="0.7" fontFamily="Inter,sans-serif">PENDING</text>
      <text x="8" y="36" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Inter,sans-serif">38 Jobs</text>
      <text x="8" y="50" fill="#FCD34D" fontSize="9" fontFamily="Inter,sans-serif">◐ Queue</text>
    </g>
    {/* Pulsing node */}
    <circle cx="240" cy="160" r="18" fill={accent} opacity="0.1"/>
    <circle cx="240" cy="160" r="10" fill={accent} opacity="0.3"/>
    <circle cx="240" cy="160" r="5" fill={accentLight} opacity="0.9"/>
  </svg>
);

const DriverIllustration = ({ accent, accentLight }) => (
  <svg viewBox="0 0 480 300" className="w-full h-auto max-h-56" aria-hidden="true">
    <defs>
      <linearGradient id="drv-road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1A2E1A" stopOpacity="0"/>
        <stop offset="100%" stopColor="#0A1A0A" stopOpacity="0.8"/>
      </linearGradient>
      <linearGradient id="drv-truck" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0.9"/>
      </linearGradient>
    </defs>
    {/* Road surface */}
    <rect x="0" y="210" width="480" height="90" fill="url(#drv-road)"/>
    <rect x="0" y="210" width="480" height="6" rx="3" fill={accent} opacity="0.2"/>
    {/* Road markings */}
    {[40,100,160,220,280,340,400].map(x=>(
      <rect key={x} x={x} y="254" width="45" height="5" rx="2" fill="#fff" opacity="0.15"/>
    ))}
    {/* Horizon trees */}
    {[[50,180],[90,170],[130,185],[340,172],[380,183],[420,170]].map(([x,y],i)=>(
      <g key={i} transform={`translate(${x},${y})`}>
        <rect x="-3" y="0" width="6" height="30" rx="2" fill="#166534" opacity="0.5"/>
        <circle cy="-10" r="14" fill="#15803D" opacity="0.4"/>
      </g>
    ))}
    {/* Truck */}
    <g transform="translate(130,130)">
      {/* cargo */}
      <rect x="0" y="8" width="150" height="72" rx="6" fill="url(#drv-truck)"/>
      <rect x="5" y="16" width="140" height="52" rx="3" fill="#D1FAE5" opacity="0.5"/>
      {[26,36,46,56].map(y=><line key={y} x1="10" y1={y} x2="140" y2={y}
        stroke="#6EE7B7" strokeWidth="1.5" opacity="0.6"/>)}
      {/* FleetOps badge */}
      <rect x="30" y="28" width="80" height="20" rx="4" fill={accent} opacity="0.3"/>
      <text x="70" y="42" fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle"
        fontFamily="Inter,sans-serif">FLEETOPS</text>
      {/* Cab */}
      <path d="M150 22 L150 80 L200 80 L200 54 Q199 22 180 22 Z" fill={accent} opacity="0.9"/>
      <path d="M154 26 L154 50 L196 50 L196 46 Q194 26 180 26 Z" fill="#A7F3D0" opacity="0.85"/>
      {/* Light */}
      <rect x="195" y="58" width="8" height="6" rx="2" fill="#FCD34D" opacity="0.9"/>
      {/* Undercarriage */}
      <rect x="-3" y="80" width="206" height="6" rx="3" fill="#6B7280" opacity="0.5"/>
      {/* Wheels */}
      <circle cx="35" cy="93" r="16" fill="#111827"/><circle cx="35" cy="93" r="8" fill="#6B7280"/>
      <circle cx="35" cy="93" r="4" fill="#D1FAE5" opacity="0.5"/>
      <circle cx="168" cy="93" r="16" fill="#111827"/><circle cx="168" cy="93" r="8" fill="#6B7280"/>
      <circle cx="168" cy="93" r="4" fill="#D1FAE5" opacity="0.5"/>
    </g>
    {/* Route path */}
    <path d="M50 215 Q180 200 240 215 Q320 230 440 210"
      fill="none" stroke={accentLight} strokeWidth="2" strokeDasharray="8 5" opacity="0.4"/>
    {/* Destination pin */}
    <g transform="translate(400,145)">
      <path d="M0-16 Q12-16 12 0 Q12 12 0 24 Q-12 12 -12 0 Q-12-16 0-16Z" fill={accentLight} opacity="0.9"/>
      <circle cy="-2" r="6" fill="#fff" opacity="0.8"/>
    </g>
    {/* Progress card */}
    <g transform="translate(32,45)">
      <rect width="118" height="58" rx="10" fill="#fff" opacity="0.08"/>
      <rect width="118" height="58" rx="10" fill="none" stroke={accentLight} strokeOpacity="0.2" strokeWidth="1"/>
      <text x="10" y="20" fill={accentLight} fontSize="9" opacity="0.7" fontFamily="Inter,sans-serif">TODAY'S PROGRESS</text>
      <text x="10" y="38" fill="#fff" fontSize="15" fontWeight="700" fontFamily="Inter,sans-serif">9 / 14</text>
      <text x="58" y="38" fill="#4ADE80" fontSize="10" fontFamily="Inter,sans-serif">Done</text>
      {/* mini bar */}
      <rect x="10" y="46" width="98" height="5" rx="2.5" fill="#fff" opacity="0.1"/>
      <rect x="10" y="46" width="63" height="5" rx="2.5" fill={accentLight} opacity="0.7"/>
    </g>
    <g transform="translate(340,42)">
      <rect width="108" height="55" rx="10" fill="#fff" opacity="0.08"/>
      <rect width="108" height="55" rx="10" fill="none" stroke={accentLight} strokeOpacity="0.2" strokeWidth="1"/>
      <text x="10" y="20" fill={accentLight} fontSize="9" opacity="0.7" fontFamily="Inter,sans-serif">ETA STATUS</text>
      <text x="10" y="38" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Inter,sans-serif">On Time</text>
      <text x="10" y="52" fill="#4ADE80" fontSize="10" fontFamily="Inter,sans-serif">✓ Route clear</text>
    </g>
  </svg>
);

const ILLUSTRATIONS = {
  ADMIN: AdminIllustration,
  DISPATCHER: DispatcherIllustration,
  DRIVER: DriverIllustration,
};

/* ─────────────────────────────────────────────────────────
   ANIMATED ROUTE DOTS (decorative background)
───────────────────────────────────────────────────────── */
const RouteDots = ({ accent }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
    <defs>
      <radialGradient id="dot-fade">
        <stop offset="0%" stopColor={accent} stopOpacity="0.6"/>
        <stop offset="100%" stopColor={accent} stopOpacity="0"/>
      </radialGradient>
    </defs>
    {/* Subtle grid of dots */}
    {Array.from({length:12},(_,row)=>
      Array.from({length:8},(_,col)=>(
        <circle key={`${row}-${col}`}
          cx={`${8+col*12.5}%`} cy={`${6+row*9}%`}
          r="1" fill={accent} opacity="0.07"/>
      ))
    )}
    {/* Diagonal accent line */}
    <line x1="0%" y1="30%" x2="60%" y2="100%"
      stroke={accent} strokeWidth="1" opacity="0.08"/>
    <line x1="40%" y1="0%" x2="100%" y2="70%"
      stroke={accent} strokeWidth="1" opacity="0.06"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────
   MAIN LOGIN PAGE
───────────────────────────────────────────────────────── */
export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success } = useToast();

  const [activeRole, setActiveRole] = useState("ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);

  const role = ROLES[activeRole];
  const Illustration = ILLUSTRATIONS[activeRole];

  /* Role switch — fade out / in left panel */
  const handleRoleChange = (roleId) => {
    if (roleId === activeRole) return;
    setPanelVisible(false);
    setTimeout(() => {
      setActiveRole(roleId);
      setPanelVisible(true);
    }, 220);
    setErrorMsg(null);
  };

  /* Fill demo credentials for the selected role */
  const fillDemo = (roleId) => {
    const r = ROLES[roleId];
    setEmail(r.email);
    setPassword(r.password);
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) { setErrorMsg("Please enter your email address."); return; }
    if (!password) { setErrorMsg("Please enter your password."); return; }
    setIsLoading(true);
    try {
      const user = await login(email.trim(), password);
      success("Welcome back!", `Signed in as ${user.name}`);
      if (user.role === "DRIVER") {
        navigate("/driver/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Invalid credentials. Please verify your email and password.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /* Dynamic CSS vars for smooth color transition */
  const panelStyle = {
    background: `linear-gradient(145deg, ${role.panelFrom} 0%, ${role.panelVia} 55%, ${role.panelTo} 100%)`,
    transition: "background 0.5s ease",
  };

  const glowStyle = {
    background: `radial-gradient(ellipse at 30% 50%, ${role.glow} 0%, transparent 65%)`,
    transition: "background 0.5s ease",
  };

  const glowSoftStyle = {
    background: `radial-gradient(ellipse at 70% 20%, ${role.glowSoft} 0%, transparent 60%)`,
    transition: "background 0.5s ease",
  };

  const btnStyle = {
    background: `linear-gradient(135deg, ${role.buttonFrom} 0%, ${role.buttonTo} 100%)`,
    boxShadow: `0 8px 24px ${role.glow}`,
    transition: "background 0.4s ease, box-shadow 0.4s ease",
  };

  return (
    <div className="login-page" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ══════════════════════════════════════════════
          LEFT PANEL — Dynamic role visual
      ══════════════════════════════════════════════ */}
      <div
        className="login-left-panel hidden lg:flex flex-col relative overflow-hidden"
        style={panelStyle}
      >
        {/* Lighting layers */}
        <div className="absolute inset-0 pointer-events-none" style={glowStyle} />
        <div className="absolute inset-0 pointer-events-none" style={glowSoftStyle} />
        <RouteDots accent={role.accentLight} />

        {/* Content */}
        <div
          className="login-left-content relative z-10 flex flex-col h-full"
          style={{
            opacity: panelVisible ? 1 : 0,
            transform: panelVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          {/* Brand lockup */}
          <div className="login-brand-lockup flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg"
              style={{ background: `linear-gradient(135deg, ${role.accentFrom}, ${role.accentTo})` }}
            >
              FO
            </div>
            <div>
              <div className="text-white font-bold text-xl tracking-tight">FleetOps</div>
              <div className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: role.accentLight, opacity: 0.8 }}>
                Enterprise Logistics
              </div>
            </div>
          </div>

          {/* Main message */}
          <div className="login-brand-main flex-1 flex flex-col justify-center">
            <div>
              <p className="login-eyebrow text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: role.accentLight, opacity: 0.75 }}>
                {role.eyebrow}
              </p>
              <h1 className="text-white font-extrabold leading-tight mb-4"
                style={{ letterSpacing: "-0.03em" }}>
                {role.headline}
              </h1>
              <p className="login-description text-sm leading-relaxed max-w-sm"
                style={{ color: role.accentLight, opacity: 0.7 }}>
                {role.description}
              </p>
            </div>

            {/* Illustration */}
            <div className="login-illustration w-full">
              <Illustration accent={role.accent} accentLight={role.accentLight} />
            </div>

            {/* Stats grid */}
            <div className="login-stats grid grid-cols-2">
              {role.stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="login-stat-card rounded-2xl flex items-start gap-3"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${role.accentLight}22`,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${role.accent}30` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: role.accentLight }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate"
                        style={{ color: role.accentLight, opacity: 0.65 }}>
                        {stat.label}
                      </div>
                      <div className="text-sm font-bold text-white leading-tight">{stat.value}</div>
                      <div className="text-xs" style={{ color: "#4ADE80" }}>{stat.trend}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="login-brand-footer flex items-center gap-2 mt-auto">
            <span className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: role.accentLight }} />
            <span className="text-xs" style={{ color: role.accentLight, opacity: 0.6 }}>
              {role.footnote}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — Auth workspace
      ══════════════════════════════════════════════ */}
      <div className="login-right-panel flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
        <div className="login-right-content flex-1 flex items-center justify-center">
          <div className="login-content w-full max-w-[460px]">

            {/* Mobile brand */}
            <div className="login-mobile-brand lg:hidden flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base"
                style={{ background: `linear-gradient(135deg, ${role.accentFrom}, ${role.accentTo})`,
                  transition: "background 0.4s ease" }}
              >
                FO
              </div>
              <div>
                <div className="font-bold text-slate-900">FleetOps</div>
                <div className="text-xs text-slate-500">Enterprise Logistics</div>
              </div>
            </div>

            {/* ── ROLE SELECTOR ── */}
            <div className="login-role-selector mb-8">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Select your role
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {ROLE_ORDER.map((roleId) => {
                  const r = ROLES[roleId];
                  const Icon = r.icon;
                  const isActive = roleId === activeRole;
                  return (
                    <button
                      key={roleId}
                      type="button"
                      onClick={() => handleRoleChange(roleId)}
                      className="login-role-card relative flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-2xl text-center transition-all duration-300 focus:outline-none focus-visible:ring-2"
                      style={{
                        background: isActive ? `${r.accentBg}` : "#fff",
                        border: isActive
                          ? `2px solid ${r.accent}`
                          : "2px solid #E2E8F0",
                        boxShadow: isActive
                          ? `0 4px 20px ${r.glow.replace("0.35","0.2")}`
                          : "0 1px 4px rgba(0,0,0,0.05)",
                        transform: isActive ? "translateY(-2px)" : "none",
                        "--tw-ring-color": r.accent,
                      }}
                      aria-pressed={isActive}
                    >
                      {isActive && (
                        <div
                          className="absolute top-2 right-2 w-2 h-2 rounded-full"
                          style={{ background: r.accent }}
                        />
                      )}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300"
                        style={{
                          background: isActive ? r.accent : "#F1F5F9",
                        }}
                      >
                        <Icon
                          className="w-4.5 h-4.5"
                          style={{
                            width: "1.1rem", height: "1.1rem",
                            color: isActive ? "#fff" : "#64748B"
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold leading-tight"
                        style={{
                          color: isActive ? r.accentText : "#475569",
                          transition: "color 0.3s ease",
                        }}
                      >
                        {r.label}
                      </span>
                      <span
                        className="text-[9px] leading-tight"
                        style={{ color: isActive ? r.accent : "#94A3B8",
                          opacity: isActive ? 0.85 : 0.7 }}
                      >
                        {r.tagline.split(" ").slice(0,2).join(" ")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── LOGIN CARD ── */}
            <div
              className="login-card bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden"
              style={{ boxShadow: "0 20px 60px rgba(15,23,42,0.08), 0 4px 16px rgba(15,23,42,0.04)" }}
            >
              {/* Card accent top bar */}
              <div
                className="h-1 w-full"
                style={{
                  background: `linear-gradient(90deg, ${role.accentFrom}, ${role.accentTo})`,
                  transition: "background 0.4s ease",
                }}
              />

              <div className="login-card-body">
                {/* Welcome heading */}
                <div className="login-welcome mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1"
                    style={{ letterSpacing: "-0.025em" }}>
                    {role.welcomeTitle}
                  </h2>
                  <p className="text-sm text-slate-500">{role.welcomeSub}</p>
                </div>

                {/* Error banner */}
                {errorMsg && (
                  <div
                    className="login-error flex items-start gap-3 mb-5 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: "#FFF1F2",
                      border: "1px solid #FECDD3",
                      color: "#BE123C",
                    }}
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* ── FORM ── */}
                <form onSubmit={handleSubmit} className="login-form" noValidate>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="login-email"
                      className="login-field-label block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@fleetops.com"
                        autoComplete="username"
                        className="login-input w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all"
                        style={{ "--focus-ring": role.accent }}
                        onFocus={e => {
                          e.target.style.borderColor = role.accent;
                          e.target.style.boxShadow = `0 0 0 3px ${role.glow.replace("0.35","0.15")}`;
                          e.target.style.background = "#fff";
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = "#E2E8F0";
                          e.target.style.boxShadow = "none";
                          e.target.style.background = "#F8FAFC";
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="login-password"
                        className="login-field-label block text-xs font-bold text-slate-600 uppercase tracking-wider"
                      >
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold transition-colors hover:underline"
                        style={{ color: role.accent }}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="login-input w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all"
                        onFocus={e => {
                          e.target.style.borderColor = role.accent;
                          e.target.style.boxShadow = `0 0 0 3px ${role.glow.replace("0.35","0.15")}`;
                          e.target.style.background = "#fff";
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = "#E2E8F0";
                          e.target.style.boxShadow = "none";
                          e.target.style.background = "#F8FAFC";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <label className="login-remember flex items-center gap-2.5 cursor-pointer select-none w-fit">
                    <div className="relative">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: rememberMe ? role.accent : "#CBD5E1",
                          background: rememberMe ? role.accent : "transparent",
                        }}
                        onClick={() => setRememberMe(!rememberMe)}
                      >
                        {rememberMe && (
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                            <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-slate-600">Remember me on this device</span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="login-submit w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-white text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-70 disabled:cursor-wait"
                    style={btnStyle}
                    onMouseEnter={e => {
                      if (!isLoading)
                        e.currentTarget.style.filter = "brightness(1.08)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.filter = "none";
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="white" strokeWidth="3"/>
                          <path className="opacity-80" fill="white"
                            d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* ── DEMO CREDENTIALS ── */}
                <div className="login-demo-section mt-7 pt-6 border-t border-slate-100">
                  <div className="login-demo-heading flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      Quick Demo
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  <div className="login-demo-grid grid grid-cols-3 gap-2">
                    {ROLE_ORDER.map((roleId) => {
                      const r = ROLES[roleId];
                      const Icon = r.icon;
                      const isSelected = email === r.email;
                      const isCurrentRole = roleId === activeRole;
                      return (
                        <button
                          key={roleId}
                          type="button"
                          onClick={() => {
                            handleRoleChange(roleId);
                            fillDemo(roleId);
                          }}
                          className="login-demo-card flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-all duration-200"
                          style={{
                            background: isSelected ? r.accentBg : "#F8FAFC",
                            border: isSelected
                              ? `1.5px solid ${r.ring}`
                              : "1.5px solid #E2E8F0",
                            transform: isSelected ? "translateY(-1px)" : "none",
                            boxShadow: isSelected ? `0 4px 12px ${r.glow.replace("0.35","0.12")}` : "none",
                          }}
                          aria-pressed={isSelected}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: isSelected ? r.accentBg : "#F1F5F9" }}
                          >
                            <Icon
                              className="w-4 h-4"
                              style={{ color: isSelected ? r.accentText : "#64748B" }}
                            />
                          </div>
                          <span
                            className="text-[11px] font-bold"
                            style={{ color: isSelected ? r.accentText : "#64748B" }}
                          >
                            {r.label}
                          </span>
                          <span
                            className="text-[9px] text-center leading-tight"
                            style={{ color: isSelected ? r.accent : "#94A3B8" }}
                          >
                            {r.email.split("@")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="login-demo-hint text-center text-xs text-slate-400 mt-3">
                    Select a profile to auto-fill credentials · then click Sign In
                  </p>
                </div>
              </div>
            </div>

            {/* Security notice */}
            <div className="login-security-note mt-5 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">
                Secure authentication powered by FleetOps
              </span>
            </div>

            {/* Copyright */}
            <p className="login-copyright text-center text-xs text-slate-400 mt-3">
              © {new Date().getFullYear()} FleetOps Logistics Systems. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
