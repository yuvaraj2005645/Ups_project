import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Camera,
  RotateCcw,
  Save,
  PenTool,
  MapPin,
  Package,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { Delivery } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

export const DriverProofOfDeliveryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  // Form inputs
  const [recipientName, setRecipientName] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // HTML5 Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDelivery = async () => {
      try {
        const d = await deliveryService.getById(id);
        setDelivery(d);
        if (d.receiverName) setRecipientName(d.receiverName);
      } catch (err) {
        error('Error', 'Could not load delivery record.');
      } finally {
        setLoading(false);
      }
    };
    fetchDelivery();
  }, [id, error]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1E293B';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!recipientName.trim()) {
      error('Recipient Required', 'Please enter the name of the recipient.');
      return;
    }

    if (!hasSignature) {
      error('Signature Required', 'Please capture customer digital signature on the pad.');
      return;
    }

    const canvas = canvasRef.current;
    const signatureUrl = canvas ? canvas.toDataURL('image/png') : '';

    setIsSubmitting(true);
    try {
      await deliveryService.submitProofOfDelivery(id, {
        receiverName: recipientName,
        signatureUrl,
        notes: deliveryNotes,
        photoUrl: photoPreview || undefined,
      });

      success('Delivery Confirmed!', 'Proof of delivery successfully recorded.');
      navigate('/driver/deliveries');
    } catch (err: any) {
      console.error(err);
      error('Submission Failed', err.response?.data?.message || 'Could not verify delivery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading proof of delivery protocol..." />;
  }

  if (!delivery) {
    return <div className="p-8 text-center text-slate-500">Delivery package not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/driver/deliveries')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Electronic Proof of Delivery (e-POD)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect verified recipient signature and handover confirmation.
          </p>
        </div>
      </div>

      {/* Delivery Summary Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary font-mono text-sm">
            #{delivery.id.slice(-6).toUpperCase()}
          </span>
          <span className="font-semibold text-slate-500">{delivery.scheduledDate}</span>
        </div>
        <p className="font-semibold text-slate-800">{delivery.destinationAddress}</p>
        <p className="text-slate-400">{delivery.destinationCity}</p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Recipient Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Full name of person receiving package"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Signature Pad */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <PenTool className="w-3.5 h-3.5 text-primary" />
              <span>Customer Digital Signature</span>
              <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-[11px] text-slate-500 hover:text-rose-600 font-semibold flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Pad</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/70 overflow-hidden relative cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={560}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 touch-none block"
            />
            {!hasSignature && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs font-medium text-slate-400">
                Sign inside this box
              </div>
            )}
          </div>
        </div>

        {/* Photo Proof Upload Simulation */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Package Delivery Photo (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors">
              <Camera className="w-4 h-4 text-slate-600" />
              <span>Take Photo / Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            {photoPreview && (
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Handover remarks */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Handover Remarks / Delivery Notes
          </label>
          <textarea
            rows={2}
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            placeholder="Left at reception, verified photo ID, etc."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit e-POD & Mark Delivered</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
