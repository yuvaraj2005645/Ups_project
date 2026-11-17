import { useState } from "react";
import { Save, Bell, Map, Globe } from "lucide-react";
import { useToast } from "../../components/Toast";
export const SettingsPage = () => {
  const { success } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "FleetOps Logistics Enterprise",
    supportEmail: "operations@fleetops.com",
    timezone: "Asia/Kolkata (IST)",
    currency: "INR (\u20B9)",
    unitSystem: "METRIC",
    emailNotifications: true,
    capacityThresholdAlert: 90,
    licenseExpiryWarningDays: 60,
    defaultMapLat: 13.0827,
    defaultMapLng: 80.2707,
    defaultMapZoom: 11
  });
  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success("Settings Saved", "System configurations updated successfully.");
    }, 500);
  };
  return <div className="space-y-6 max-w-4xl mx-auto"><div><h2 className="text-xl font-bold text-slate-900 tracking-tight">System Configuration</h2><p className="text-xs text-slate-500 mt-0.5">
          Configure regional logistics parameters, alert triggers, and geographic map baselines.
        </p></div><form onSubmit={handleSave} className="space-y-6">{
    /* General Settings */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100"><Globe className="w-4 h-4 text-primary" /><span>Organization & Regional Defaults</span></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"><div><label className="block font-semibold text-slate-700 mb-1.5">
                Organization Display Name
              </label><input
    type="text"
    value={settings.companyName}
    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
  /></div><div><label className="block font-semibold text-slate-700 mb-1.5">
                Dispatch Operations Support Email
              </label><input
    type="email"
    value={settings.supportEmail}
    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
  /></div><div><label className="block font-semibold text-slate-700 mb-1.5">Default Timezone</label><select
    value={settings.timezone}
    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
  ><option value="Asia/Kolkata (IST)">Asia/Kolkata (UTC +05:30)</option><option value="UTC">UTC (Coordinated Universal Time)</option><option value="America/New_York (EST)">America/New_York (EST)</option></select></div><div><label className="block font-semibold text-slate-700 mb-1.5">Operating Currency</label><select
    value={settings.currency}
    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
  ><option value="INR (₹)">Indian Rupee (INR ₹)</option><option value="USD ($)">US Dollar (USD $)</option><option value="EUR (€)">Euro (EUR €)</option></select></div></div></div>{
    /* Fleet Thresholds & Compliance */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100"><Bell className="w-4 h-4 text-primary" /><span>Telemetry Alerts & Thresholds</span></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"><div><label className="block font-semibold text-slate-700 mb-1.5">
                Vehicle Overload Alert Trigger (%)
              </label><input
    type="number"
    min={50}
    max={100}
    value={settings.capacityThresholdAlert}
    onChange={(e) => setSettings({ ...settings, capacityThresholdAlert: Number(e.target.value) })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
  /><p className="text-[11px] text-slate-400 mt-1">
                Flags warning when current payload weight exceeds this % of rated gross capacity.
              </p></div><div><label className="block font-semibold text-slate-700 mb-1.5">
                License Expiration Advance Notice (Days)
              </label><input
    type="number"
    min={15}
    max={180}
    value={settings.licenseExpiryWarningDays}
    onChange={(e) => setSettings({ ...settings, licenseExpiryWarningDays: Number(e.target.value) })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
  /><p className="text-[11px] text-slate-400 mt-1">
                Warns operations dispatchers when driver licenses have fewer days remaining.
              </p></div></div></div>{
    /* Map Center Calibration */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100"><Map className="w-4 h-4 text-primary" /><span>Geographic Map Calibration</span></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"><div><label className="block font-semibold text-slate-700 mb-1.5">Default Center Latitude</label><input
    type="number"
    step="0.0001"
    value={settings.defaultMapLat}
    onChange={(e) => setSettings({ ...settings, defaultMapLat: Number(e.target.value) })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
  /></div><div><label className="block font-semibold text-slate-700 mb-1.5">Default Center Longitude</label><input
    type="number"
    step="0.0001"
    value={settings.defaultMapLng}
    onChange={(e) => setSettings({ ...settings, defaultMapLng: Number(e.target.value) })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
  /></div><div><label className="block font-semibold text-slate-700 mb-1.5">Default Zoom Level</label><input
    type="number"
    min={4}
    max={18}
    value={settings.defaultMapZoom}
    onChange={(e) => setSettings({ ...settings, defaultMapZoom: Number(e.target.value) })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
  /></div></div></div><div className="flex justify-end"><button
    type="submit"
    disabled={isSaving}
    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
  >{isSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /><span>Save System Settings</span></>}</button></div></form></div>;
};
