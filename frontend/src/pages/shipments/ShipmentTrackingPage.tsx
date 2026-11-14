import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Calendar,
  AlertTriangle,
  Send,
  Navigation,
} from 'lucide-react';
import { shipmentService } from '../../services/shipmentService';
import { Shipment, ShipmentHistory } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Breadcrumb } from '../../components/Breadcrumb';

const STANDARD_STAGES = [
  { key: 'PENDING', title: 'Order Booked', desc: 'Consignment request initialized' },
  { key: 'ASSIGNED', title: 'Carrier Assigned', desc: 'Driver and transport allocated' },
  { key: 'IN_TRANSIT', title: 'In Transit', desc: 'Package in active transit across logistics corridors' },
  { key: 'OUT_FOR_DELIVERY', title: 'Out For Delivery', desc: 'Final-mile driver en route to customer' },
  { key: 'DELIVERED', title: 'Delivered', desc: 'Recipient verified and signed delivery' },
];

export const ShipmentTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchTracking = async () => {
      setLoading(true);
      try {
        const [sData, hData] = await Promise.all([
          shipmentService.getById(id),
          shipmentService.getHistory(id).catch(() => []),
        ]);
        setShipment(sData);
        setHistory(hData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [id]);

  if (loading && !shipment) {
    return <LoadingSpinner fullPage message="Tracking shipment route telemetry..." />;
  }

  if (!shipment) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600">Shipment not found.</p>
        <button
          onClick={() => navigate('/shipments')}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
        >
          Back to Shipments
        </button>
      </div>
    );
  }

  // Determine stage progression index
  const stageOrder = ['PENDING', 'SCHEDULED', 'ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentIndex = stageOrder.indexOf(shipment.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Shipments', path: '/shipments' },
          { label: `#${shipment.id.slice(-6).toUpperCase()}`, path: `/shipments/${shipment.id}` },
          { label: 'Tracking' },
        ]}
      />

      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(`/shipments/${shipment.id}`)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Tracking #{shipment.id.slice(-6).toUpperCase()}
            </h2>
            <StatusBadge status={shipment.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Destination: {shipment.deliveryAddress} &bull; Customer: {shipment.customerName}
          </p>
        </div>
      </div>

      {/* Visual Step Progress Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-primary" />
          <span>Fulfillment Stage Progression</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {STANDARD_STAGES.map((stage, idx) => {
            const isCompleted =
              currentIndex >= stageOrder.indexOf(stage.key) || shipment.status === 'DELIVERED';
            const isCurrent = shipment.status === stage.key;

            return (
              <div key={stage.key} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-primary text-white ring-4 ring-blue-100 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <h4
                  className={`text-xs font-bold mt-3 ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {stage.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-[130px] leading-tight">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Chronological History Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>Checkpoint Event Timeline</span>
        </h3>

        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 ml-2 pt-2">
          {history.length > 0 ? (
            history.map((item, index) => (
              <div key={item.id || index} className="relative">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-white"></div>
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Status changed to <span className="text-primary">{item.toStatus}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {item.remarks && (
                    <p className="text-xs text-slate-600 italic">"{item.remarks}"</p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Recorded by: {item.updatedBy || 'Operations Control'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-white"></div>
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-800">Initial Booking Created</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {new Date(shipment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
