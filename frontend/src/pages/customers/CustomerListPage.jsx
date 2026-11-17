import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, Mail, Phone } from "lucide-react";
import { customerService } from "../../services/customerService";
import { DataTable } from "../../components/DataTable";
import { SearchBar } from "../../components/SearchBar";
import { FilterDropdown } from "../../components/FilterDropdown";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../components/Toast";
export const CustomerListPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerService.getAll({
        search: search || void 0,
        city: cityFilter || void 0
      });
      setCustomers(data || []);
    } catch (err) {
      console.error(err);
      error("Failed to load customers", "Could not retrieve customer database.");
    } finally {
      setLoading(false);
    }
  }, [search, cityFilter, error]);
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  const openCreateModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: ""
    });
    setIsModalOpen(true);
  };
  const openEditModal = (c) => {
    setIsEditing(true);
    setEditId(c.id);
    setFormData({
      name: c.name,
      companyName: c.companyName || "",
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      state: c.state,
      postalCode: c.postalCode || ""
    });
    setIsModalOpen(true);
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && editId) {
        await customerService.update(editId, formData);
        success("Customer Updated", `Profile of ${formData.name} updated.`);
      } else {
        await customerService.create(formData);
        success("Customer Added", `${formData.name} registered.`);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      error("Save failed", err.response?.data?.message || "Could not save customer");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await customerService.delete(deleteTargetId);
      success("Customer Removed", "Customer record deleted.");
      setDeleteTargetId(null);
      fetchCustomers();
    } catch (err) {
      error("Delete failed", err.response?.data?.message || "Could not delete customer");
    } finally {
      setIsDeleting(false);
    }
  };
  const cities = Array.from(new Set(customers.map((c) => c.city).filter(Boolean)));
  const columns = [
    {
      key: "name",
      header: "Customer & Enterprise",
      sortable: true,
      render: (row) => <div><span className="font-semibold text-slate-900 text-xs">{row.name}</span><span className="block text-[11px] text-slate-400">{row.companyName || "Private Individual"}</span></div>
    },
    {
      key: "email",
      header: "Contact Info",
      render: (row) => <div className="text-xs space-y-0.5"><p className="text-slate-700 flex items-center"><Mail className="w-3 h-3 mr-1 text-slate-400" /> {row.email}</p><p className="text-slate-500 flex items-center"><Phone className="w-3 h-3 mr-1 text-slate-400" /> {row.phone}</p></div>
    },
    {
      key: "city",
      header: "Location",
      sortable: true,
      render: (row) => <span className="text-xs text-slate-700">{row.city}, {row.state}</span>
    },
    {
      key: "shipmentsCount",
      header: "Shipments",
      sortable: true,
      render: (row) => <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{row.shipmentsCount || 0} orders
        </span>
    },
    {
      key: "totalSpent",
      header: "Total Spend",
      sortable: true,
      render: (row) => <span className="text-xs font-bold text-emerald-700 font-mono">
          ₹{(row.totalSpent || 0).toLocaleString()}</span>
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}><button
        onClick={() => navigate(`/customers/${row.id}`)}
        className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
        title="View Profile"
      ><Eye className="w-4 h-4" /></button><button
        onClick={() => openEditModal(row)}
        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
        title="Edit Customer"
      ><Edit className="w-4 h-4" /></button><button
        onClick={() => setDeleteTargetId(row.id)}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        title="Delete Customer"
      ><Trash2 className="w-4 h-4" /></button></div>
    }
  ];
  return <div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Accounts</h2><p className="text-xs text-slate-500 mt-0.5">
            Manage enterprise shippers, commercial clients, billing histories, and consignment logs.
          </p></div><button
    onClick={openCreateModal}
    className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
  ><Plus className="w-4 h-4 mr-1.5" />
          Add Customer
        </button></div><div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"><SearchBar
    value={search}
    onChange={setSearch}
    placeholder="Search by customer name, company, email..."
    className="w-full md:w-80"
  /><FilterDropdown
    value={cityFilter}
    onChange={setCityFilter}
    placeholder="All Cities"
    options={cities.map((city) => ({ label: city, value: city }))}
  /></div><DataTable
    columns={columns}
    data={customers}
    isLoading={loading}
    onRowClick={(row) => navigate(`/customers/${row.id}`)}
    emptyMessage="No customer accounts match the current filter criteria."
  />{
    /* Add / Edit Customer Modal */
  }<Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title={isEditing ? "Edit Customer Account" : "Register New Customer"}
  ><form onSubmit={handleFormSubmit} className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label><input
    type="text"
    required
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization
              </label><input
    type="text"
    value={formData.companyName}
    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Email</label><input
    type="email"
    required
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label><input
    type="text"
    required
    value={formData.phone}
    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
  /></div><div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label><textarea
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
  >{isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Account"}</button></div></form></Modal><ConfirmModal
    isOpen={!!deleteTargetId}
    onClose={() => setDeleteTargetId(null)}
    onConfirm={handleDelete}
    title="Remove Customer"
    message="Are you sure you want to delete this customer account? Associated active shipments will not be deleted."
    confirmText="Remove"
    variant="danger"
    isLoading={isDeleting}
  /></div>;
};
