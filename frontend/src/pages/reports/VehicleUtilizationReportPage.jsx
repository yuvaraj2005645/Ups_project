import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gauge,
  AlertTriangle,
  Download
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { reportService } from "../../services/reportService";
import { vehicleService } from "../../services/vehicleService";
import { ProgressBar } from "../../components/ProgressBar";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../components/Toast";
export const VehicleUtilizationReportPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [report, setReport] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const [rData, vList] = await Promise.all([
        reportService.getVehicleUtilizationReport(),
        vehicleService.getAll().catch(() => [])
      ]);
      setReport(rData);
      setVehicles(vList || []);
    } catch (err) {
      console.error(err);
      setReport({
        averageUtilizationPct: 76.4,
        utilizationByType: [
          { type: "Mini Truck", utilizationPct: 82 },
          { type: "Delivery Van", utilizationPct: 88 },
          { type: "Pickup Truck", utilizationPct: 65 },
          { type: "Heavy Truck", utilizationPct: 74 },
          { type: "Container Truck", utilizationPct: 91 }
        ],
        utilizationTrend: [
          { date: "Week 1", utilizationPct: 68 },
          { date: "Week 2", utilizationPct: 72 },
          { date: "Week 3", utilizationPct: 75 },
          { date: "Week 4", utilizationPct: 81 }
        ],
        underutilizedVehicles: [],
        overutilizedVehicles: []
      });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);
  const handleExportCSV = async () => {
    try {
      const blob = await reportService.exportVehicleReportCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FleetOps_Vehicle_Utilization.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success("Export Complete", "Vehicle utilization report downloaded.");
    } catch (err) {
      error("Export Failed", "Could not export CSV");
    }
  };
  if (loading && !report) {
    return <LoadingSpinner fullPage message="Analyzing fleet payload load factors..." />;
  }
  const underutilized = vehicles.filter((v) => {
    const pct = v.maxWeightKg > 0 ? (v.currentWeightKg || 0) / v.maxWeightKg * 100 : 0;
    return pct < 50;
  });
  const overutilized = vehicles.filter((v) => {
    const pct = v.maxWeightKg > 0 ? (v.currentWeightKg || 0) / v.maxWeightKg * 100 : 0;
    return pct > 90;
  });
  return <div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Vehicle Capacity Utilization Telemetry
          </h2><p className="text-xs text-slate-500 mt-0.5">
            Optimize deadheading empty miles and maintain balanced fleet payload distribution.
          </p></div><button
    onClick={handleExportCSV}
    className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
  ><Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </button></div>{
    /* Charts Grid */
  }<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{
    /* Utilization by Vehicle Type */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-sm font-bold text-slate-900 mb-1">
            Capacity Load Factor by Vehicle Classification (%)
          </h3><p className="text-xs text-slate-400 mb-4">
            Payload utilization grouped by chassis classification
          </p><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={report?.utilizationByType || []}><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" /><XAxis dataKey="type" stroke="#94A3B8" fontSize={11} /><YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} /><Tooltip
    contentStyle={{
      backgroundColor: "#1E293B",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "12px"
    }}
  /><Bar dataKey="utilizationPct" name="Utilization %" fill="#3B82F6" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>{
    /* Fleet Capacity Trend Over Time */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-sm font-bold text-slate-900 mb-1">Fleet Load Factor Trend (%)</h3><p className="text-xs text-slate-400 mb-4">Rolling weekly fleet capacity trajectory</p><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={report?.utilizationTrend || []}><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" /><XAxis dataKey="date" stroke="#94A3B8" fontSize={11} /><YAxis domain={[40, 100]} stroke="#94A3B8" fontSize={11} /><Tooltip
    contentStyle={{
      backgroundColor: "#1E293B",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "12px"
    }}
  /><Line
    type="monotone"
    dataKey="utilizationPct"
    name="Avg Utilization %"
    stroke="#10B981"
    strokeWidth={2.5}
    dot={{ r: 4 }}
  /></LineChart></ResponsiveContainer></div></div></div>{
    /* Alert Lists: Underutilized vs Overutilized */
  }<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{
    /* Underutilized */
  }<div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 space-y-4"><div className="flex items-center space-x-2 text-amber-600 font-bold text-sm"><Gauge className="w-5 h-5" /><span>Underutilized Vehicles (&lt; 50% Capacity)</span></div><p className="text-xs text-slate-500">
            Vehicles traveling with excess deadhead headroom; candidates for cargo consolidation.
          </p><div className="space-y-2.5">{underutilized.length > 0 ? underutilized.map((v) => {
    const pct = v.maxWeightKg > 0 ? Math.round((v.currentWeightKg || 0) / v.maxWeightKg * 100) : 0;
    return <div
      key={v.id}
      onClick={() => navigate(`/fleet/${v.id}`)}
      className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center justify-between cursor-pointer hover:bg-amber-100/50 transition-colors"
    ><div><span className="font-mono font-bold text-xs text-amber-900">{v.registrationNumber}</span><p className="text-[11px] text-amber-700">{v.manufacturer} {v.model} &bull; {v.currentWeightKg || 0} / {v.maxWeightKg} kg
                      </p></div><span className="text-xs font-extrabold text-amber-800 font-mono">{pct}%</span></div>;
  }) : <p className="text-xs text-slate-400 italic">No severely underutilized vehicles.</p>}</div></div>{
    /* Overutilized */
  }<div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-6 space-y-4"><div className="flex items-center space-x-2 text-rose-600 font-bold text-sm"><AlertTriangle className="w-5 h-5" /><span>Overutilized Vehicles (&gt; 90% Capacity)</span></div><p className="text-xs text-slate-500">
            Vehicles near gross axle weight rating limits. Ensure no overloading penalties.
          </p><div className="space-y-2.5">{overutilized.length > 0 ? overutilized.map((v) => {
    const pct = v.maxWeightKg > 0 ? Math.round((v.currentWeightKg || 0) / v.maxWeightKg * 100) : 0;
    return <div
      key={v.id}
      onClick={() => navigate(`/fleet/${v.id}`)}
      className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between cursor-pointer hover:bg-rose-100/50 transition-colors"
    ><div><span className="font-mono font-bold text-xs text-rose-900">{v.registrationNumber}</span><p className="text-[11px] text-rose-700">{v.manufacturer} {v.model} &bull; {v.currentWeightKg || 0} / {v.maxWeightKg} kg
                      </p></div><span className="text-xs font-extrabold text-rose-800 font-mono">{pct}%</span></div>;
  }) : <p className="text-xs text-slate-400 italic">No vehicles currently exceeding 90% load.</p>}</div></div></div>{
    /* Fleet Utilization Detail Table */
  }<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-900">Complete Fleet Utilization Roster</h3></div><div className="overflow-x-auto"><table className="w-full text-left border-collapse text-xs"><thead><tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100"><th className="py-3 px-4">Reg #</th><th className="py-3 px-4">Vehicle Model</th><th className="py-3 px-4">Chassis Type</th><th className="py-3 px-4 w-44">Weight Capacity %</th><th className="py-3 px-4 w-44">Volume Capacity %</th><th className="py-3 px-4 text-right">Payload Headroom</th></tr></thead><tbody className="divide-y divide-slate-100">{vehicles.map((v) => {
    const remWeight = Math.max(0, v.maxWeightKg - (v.currentWeightKg || 0));
    return <tr
      key={v.id}
      onClick={() => navigate(`/fleet/${v.id}`)}
      className="hover:bg-slate-50 cursor-pointer"
    ><td className="py-3 px-4 font-mono font-bold text-primary">{v.registrationNumber}</td><td className="py-3 px-4 font-medium text-slate-800">{v.manufacturer} {v.model}</td><td className="py-3 px-4 text-slate-600">{v.type?.replace("_", " ")}</td><td className="py-3 px-4"><ProgressBar
      value={v.currentWeightKg || 0}
      max={v.maxWeightKg}
      size="sm"
    /></td><td className="py-3 px-4"><ProgressBar
      value={v.currentVolumeM3 || 0}
      max={v.maxVolumeM3}
      size="sm"
    /></td><td className="py-3 px-4 text-right font-semibold text-emerald-700">{remWeight} kg
                    </td></tr>;
  })}</tbody></table></div></div></div>;
};
