import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { driverService } from '../../services/driverService';
import { deliveryService } from '../../services/deliveryService';
import { Delivery, Driver } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

export const DriverDeliveriesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TODAY' | 'UPCOMING' | 'COMPLETED'>('TODAY');

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        const drivers = await driverService.getAll();
        const currentDriver =
          drivers.find((d) => d.email === user?.email || d.name === user?.name) || drivers[0];

        if (currentDriver) {
          const list = await deliveryService.getByDriverId(currentDriver.id);
          setDeliveries(list || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, [user]);

  const handleStartDelivery = async (id: string) => {
    try {
      await deliveryService.updateStatus(id, 'OUT_FOR_DELIVERY');
      setDeliveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'OUT_FOR_DELIVERY' } : d))
      );
      success('Delivery Started', 'Marked package as Out For Delivery.');
    } catch (err) {
      error('Error', 'Could not update delivery state');
    }
  };

  const openNavigation = (address: string) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      '_blank'
    );
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading delivery packages..." />;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredDeliveries = deliveries.filter((d) => {
    if (activeTab === 'COMPLETED') {
      return d.status === 'DELIVERED';
    }
    if (activeTab === 'TODAY') {
      return d.status !== 'DELIVERED' && (d.scheduledDate === todayStr || !d.scheduledDate);
    }
    // UPCOMING
    return d.status !== 'DELIVERED' && d.scheduledDate > todayStr;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Delivery Manifest Queue</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          View assigned delivery stops, initiate turn-by-turn navigation, and collect customer signatures.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
        {[
          { key: 'TODAY', label: "Today's Manifest" },
          { key: 'UPCOMING', label: 'Upcoming Stops' },
          { key: 'COMPLETED', label: 'Completed Deliveries' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 relative transition-colors ${
              activeTab === tab.key ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Delivery Cards */}
      <div className="space-y-4">
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((d, index) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">
                        {d.receiverName || 'Recipient Drop'}
                      </span>
                      <StatusBadge status={d.status} type="delivery" />
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      ID: #{d.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                  {d.scheduledDate || 'Today'}
                </span>
              </div>

              {/* Destination Address */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">{d.destinationAddress}</p>
                    <p className="text-slate-500">{d.destinationCity}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openNavigation(`${d.destinationAddress}, ${d.destinationCity}`)}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    Open GPS Maps
                  </button>
                  <a
                    href="tel:9876543210"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Call Contact
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  {d.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleStartDelivery(d.id)}
                      className="px-3.5 py-1.5 bg-blue-50 text-primary hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      Start Transit
                    </button>
                  )}
                  {d.status !== 'DELIVERED' && (
                    <button
                      onClick={() => navigate(`/driver/pod/${d.id}`)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Capture POD & Finish</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No delivery items in this view.
          </div>
        )}
      </div>
    </div>
  );
};
