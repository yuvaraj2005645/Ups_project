import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Warehouse as WarehouseIcon,
  MapPin,
  Truck,
  Trash2
} from "lucide-react";
import { warehouseService } from "../../services/warehouseService";
import { ProgressBar } from "../../components/ProgressBar";
import { SearchBar } from "../../components/SearchBar";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../components/Toast";
export const WarehouseListPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0827,
    lng: 80.2707,
    managerName: "",
    phone: "",
    totalCapacityM3: 5e3,
    occupiedCapacityM3: 0,
    status: "ACTIVE"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getAll({ search: search || void 0 });
      setWarehouses(data || []);
    } catch (err) {
      console.error(err);
      error("Failed to load warehouses", "Could not load fulfillment centers.");
    } finally {
      setLoading(false);
    }
  }, [search, error]);
  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);
  const openCreateModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: "",
      address: "",
      city: "Chennai",
      state: "Tamil Nadu",
      lat: 13.0827,
      lng: 80.2707,
      managerName: "",
      phone: "",
      totalCapacityM3: 5e3,
      occupiedCapacityM3: 0,
      status: "ACTIVE"
    });
    setIsModalOpen(true);
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && editId) {
        await warehouseService.update(editId, formData);
        success("Hub Updated", `Warehouse ${formData.name} updated.`);
      } else {
        await warehouseService.create(formData);
        success("Hub Registered", `Warehouse ${formData.name} created.`);
      }
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (err) {
      error("Save failed", err.response?.data?.message || "Could not save warehouse");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await warehouseService.delete(deleteTargetId);
      success("Warehouse Removed", "Fulfillment center removed.");
      setDeleteTargetId(null);
      fetchWarehouses();
    } catch (err) {
      error("Delete failed", err.response?.data?.message || "Could not delete warehouse");
    } finally {
      setIsDeleting(false);
    }
  };
  return <div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Warehouses & Logistics Hubs
          </h2><p className="text-xs text-slate-500 mt-0.5">
            Regional cross-docking facilities, storage capacities, and fleet stationing bays.
          </p></div><button
    onClick={openCreateModal}
    className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
  ><Plus className="w-4 h-4 mr-1.5" />
          Add Warehouse
        </button></div><div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"><SearchBar
    value={search}
    onChange={setSearch}
    placeholder="Search by facility name, code, city..."
    className="w-full md:w-80"
  /></div>{loading ? <LoadingSpinner message="Loading logistics warehouses..." /> : warehouses.length === 0 ? <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          No warehouse facilities found.
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{warehouses.map((w) => {
    const usedPct = w.totalCapacityM3 > 0 ? Math.round(w.occupiedCapacityM3 / w.totalCapacityM3 * 100) : 0;
    return <div
      key={w.id}
      onClick={() => navigate(`/warehouses/${w.id}`)}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer p-6 flex flex-col justify-between"
    ><div><div className="flex items-start justify-between"><div><span className="font-mono text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded">{w.id}</span><h3 className="text-base font-bold text-slate-900 mt-2">{w.name}</h3><p className="text-xs text-slate-500 flex items-center mt-1"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />{w.city}, {w.state}</p></div><div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center"><WarehouseIcon className="w-5 h-5" /></div></div><p className="text-xs text-slate-600 mt-3 line-clamp-2">{w.address}</p>{
      /* Volumetric Capacity Bar */
    }<div className="mt-5 space-y-1.5 pt-4 border-t border-slate-100"><div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Storage Capacity</span><span className="font-bold text-slate-800">{w.usedCapacityM3} / {w.totalCapacityM3} m&sup3; ({usedPct}%)
                      </span></div><ProgressBar
      value={w.occupiedCapacityM3}
      max={w.totalCapacityM3}
      showPercent={false}
      size="sm"
    /></div></div><div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between"><div className="flex items-center space-x-1.5 text-xs text-slate-600"><Truck className="w-4 h-4 text-slate-400" /><span>{w.managerName || "Manager"}</span></div><div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}><button
      onClick={() => navigate(`/warehouses/${w.id}`)}
      className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
    ><Eye className="w-4 h-4" /></button><button
      onClick={() => setDeleteTargetId(w.id)}
      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
    ><Trash2 className="w-4 h-4" /></button></div></div></div>;
  })}</div>}{
    /* Add / Edit Warehouse Modal */
  }<Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title={isEditing ? "Edit Warehouse Facility" : "Register New Warehouse Hub"}
  ><form onSubmit={handleFormSubmit} className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-xs font-semibold text-slate-700 mb-1">
                Facility Name
              </label><input
    type="text"
    required
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Hub Code</label><input
    type="text"
    required
    value={formData.code}
    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs uppercase"
  /></div><div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Address
              </label><textarea
    rows={2}
    required
    value={formData.address}
    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">City</label><input
    type="text"
    required
    value={formData.city}
    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">State</label><input
    type="text"
    required
    value={formData.state}
    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label><input
    type="number"
    step="0.0001"
    required
    value={formData.latitude}
    onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label><input
    type="number"
    step="0.0001"
    required
    value={formData.longitude}
    onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Capacity (m&sup3;)
              </label><input
    type="number"
    required
    value={formData.totalCapacityM3}
    onChange={(e) => setFormData({ ...formData, totalCapacityM3: Number(e.target.value) })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Used (m&sup3;)
              </label><input
    type="number"
    required
    value={formData.usedCapacityM3}
    onChange={(e) => setFormData({ ...formData, usedCapacityM3: Number(e.target.value) })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div></div><div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-100"><button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
  >
              Cancel
            </button><button
    type="submit"
    disabled={isSubmitting}
    className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-50"
  >{isSubmitting ? "Saving..." : isEditing ? "Update Hub" : "Register Hub"}</button></div></form></Modal><ConfirmModal
    isOpen={!!deleteTargetId}
    onClose={() => setDeleteTargetId(null)}
    onConfirm={handleDelete}
    title="Remove Warehouse"
    message="Are you sure you want to delete this warehouse hub record? Associated vehicle home-base records will be updated."
    confirmText="Remove"
    variant="danger"
    isLoading={isDeleting}
  /></div>;
};
