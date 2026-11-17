import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  FileCheck,
  MapPin,
  Package,
  PenTool,
  Phone,
  RefreshCw,
  RotateCcw,
  Truck,
  User,
  X,
} from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../components/Toast";
import { customerService } from "../../services/customerService";
import { deliveryService } from "../../services/deliveryService";
import { driverService } from "../../services/driverService";
import { shipmentService } from "../../services/shipmentService";
import { formatDate, formatDateTime, formatStatus, getStatusColor } from "../../utils/formatters";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const SUPPORTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CLOSED_DELIVERY_STATUSES = ["DELIVERED", "FAILED", "RETURNED"];

function getErrorMessage(err, fallback) {
  if (err.response?.status === 401) return "Your session has expired. Sign in again to continue.";
  if (err.response?.status === 403) return "You do not have permission to access these deliveries.";
  return err.response?.data?.message || err.message || fallback;
}

function isEligibleForProof(delivery) {
  return delivery.status === "OUT_FOR_DELIVERY"
    && delivery.shipment?.status === "OUT_FOR_DELIVERY"
    && !delivery.signatureBase64;
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`rounded-xl p-2.5 ${tone}`}><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export const ProofOfDelivery = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const canvasRef = useRef(null);
  const photoInputRef = useRef(null);

  const [driver, setDriver] = useState(null);
  const [records, setRecords] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [deliveryDetail, setDeliveryDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [remarks, setRemarks] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const currentDriver = await driverService.getMe();
      if (!currentDriver?.id) throw new Error("The driver profile response is missing an ID.");

      const [assignedShipments, assignedDeliveries] = await Promise.all([
        shipmentService.getByDriverId(currentDriver.id),
        deliveryService.getByDriverId(currentDriver.id),
      ]);
      if (!Array.isArray(assignedShipments) || !Array.isArray(assignedDeliveries)) {
        throw new Error("The shipment or delivery API returned an invalid response.");
      }

      const shipmentsById = Object.fromEntries(assignedShipments.map((shipment) => [shipment.id, shipment]));
      const enrichedDeliveries = assignedDeliveries.map((delivery) => {
        const shipment = shipmentsById[delivery.shipmentId];
        if (!delivery.id || !shipment) {
          throw new Error(`Delivery ${delivery.id || "(unknown)"} is not linked to one of your assigned shipments.`);
        }
        if (delivery.driverId?.toLowerCase() !== currentDriver.id.toLowerCase()) {
          throw new Error(`Delivery ${delivery.id} is not associated with the authenticated driver.`);
        }
        return { ...delivery, shipment };
      });

      const customerIds = [...new Set(assignedShipments.map((shipment) => shipment.customerId).filter(Boolean))];
      const customerRecords = await Promise.all(customerIds.map((id) => customerService.getById(id)));
      if (customerRecords.some((customer) => !customer?.id)) {
        throw new Error("A customer detail response was incomplete.");
      }

      const proofEligibleIds = enrichedDeliveries.filter(isEligibleForProof).map((delivery) => delivery.id);
      setDriver(currentDriver);
      setRecords(enrichedDeliveries);
      setCustomers(Object.fromEntries(customerRecords.map((customer) => [customer.id, customer])));
      setSelectedId((previous) => (
        previous && proofEligibleIds.includes(previous) ? previous : proofEligibleIds[0] || ""
      ));
    } catch (err) {
      const message = getErrorMessage(err, "Could not load delivery records. Check your connection and retry.");
      setLoadError(message);
      error("Unable to load deliveries", message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const eligibleDeliveries = useMemo(
    () => records.filter(isEligibleForProof),
    [records]
  );
  const selectedRecord = eligibleDeliveries.find((delivery) => delivery.id === selectedId) || null;
  const selectedDelivery = deliveryDetail?.id === selectedId ? deliveryDetail : selectedRecord;
  const selectedShipment = selectedDelivery?.shipment
    || records.find((delivery) => delivery.id === selectedId)?.shipment;
  const customer = selectedShipment ? customers[selectedShipment.customerId] : null;
  const submittedProofCount = records.filter((delivery) => Boolean(delivery.signatureBase64)).length;
  const pendingConfirmationCount = records.filter((delivery) => (
    !CLOSED_DELIVERY_STATUSES.includes(delivery.status) && !delivery.signatureBase64
  )).length;

  useEffect(() => {
    if (!selectedId) {
      setDeliveryDetail(null);
      setDetailError("");
      setRecipientName("");
      setRecipientPhone("");
      setRelationship("");
      setRemarks("");
      setConfirmed(false);
      setHasSignature(false);
      setSignaturePreview("");
      setPhotoBase64("");
      setPhotoPreview("");
      if (canvasRef.current) {
        canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return undefined;
    }

    let active = true;
    setDeliveryDetail(null);
    setDetailError("");
    setConfirmed(false);
    setRelationship("");
    setRemarks("");
    setHasSignature(false);
    setSignaturePreview("");
    setPhotoBase64("");
    setPhotoPreview("");
    if (canvasRef.current) {
      canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    const shipment = records.find((delivery) => delivery.id === selectedId)?.shipment;
    const selectedCustomer = shipment ? customers[shipment.customerId] : null;
    setRecipientName(shipment?.customerName || selectedCustomer?.name || "");
    setRecipientPhone(selectedCustomer?.phone || "");

    deliveryService.getById(selectedId).then((delivery) => {
      if (!active) return;
      if (!delivery?.id || delivery.id !== selectedId) {
        throw new Error("The delivery details API returned an invalid response.");
      }
      setDeliveryDetail({ ...delivery, shipment });
    }).catch((err) => {
      if (!active) return;
      const message = getErrorMessage(err, "Could not load the selected delivery.");
      setDetailError(message);
      error("Unable to load delivery details", message);
    });

    return () => { active = false; };
  }, [selectedId, records, customers, error]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignaturePreview("");
  };

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = getCanvasPoint(event);
    const context = canvas.getContext("2d");
    context.fillStyle = "#1e293b";
    context.beginPath();
    context.arc(x, y, 1.5, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(x, y);
    setDrawing(true);
    setHasSignature(true);
  };

  const drawSignature = (event) => {
    if (!drawing || !canvasRef.current) return;
    event.preventDefault();
    const { x, y } = getCanvasPoint(event);
    const context = canvasRef.current.getContext("2d");
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#1e293b";
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setDrawing(false);
    if (canvasRef.current && hasSignature) {
      setSignaturePreview(canvasRef.current.toDataURL("image/png"));
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (!SUPPORTED_PHOTO_TYPES.includes(file.type)) {
      error("Unsupported image", "Upload a JPG, PNG, or WebP photograph.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      error("Photo is too large", "Choose an image smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        error("Photo could not be read", "Choose another image and try again.");
        return;
      }
      setPhotoBase64(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.onerror = () => error("Photo could not be read", "Choose another image and try again.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedDelivery || !selectedShipment || !isEligibleForProof(selectedDelivery)) {
      error("Delivery is not eligible", "Only an out-for-delivery shipment can receive proof of delivery.");
      return;
    }
    if (!recipientName.trim()) {
      error("Recipient required", "Enter the recipient's name before submitting.");
      return;
    }
    if (!hasSignature || !canvasRef.current) {
      error("Signature required", "Capture the recipient's signature before submitting.");
      return;
    }
    if (!confirmed) {
      error("Confirmation required", "Confirm that the delivery has been completed.");
      return;
    }

    const signatureBase64 = canvasRef.current.toDataURL("image/png");
    if (!signatureBase64 || signatureBase64.endsWith(",")) {
      error("Signature required", "Capture a valid signature before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await deliveryService.submitProof(selectedDelivery.id, {
        receiverName: recipientName.trim(),
        receiverPhone: recipientPhone.trim() || undefined,
        receiverRelationship: relationship || undefined,
        signatureBase64,
        proofPhotoBase64: photoBase64 || undefined,
        remarks: remarks.trim() || undefined,
      });
      if (!result?.id || result.id !== selectedDelivery.id || result.status !== "DELIVERED") {
        throw new Error("The proof endpoint returned an incomplete delivery confirmation.");
      }

      setSubmitted({
        delivery: result,
        shipment: selectedShipment,
        signatureBase64,
        photoBase64,
        recipientName: recipientName.trim(),
      });
      success("Delivery completed", `Proof submitted for shipment ${selectedShipment.id}.`);
      await fetchData();
    } catch (err) {
      error("Proof submission failed", getErrorMessage(err, "The proof of delivery could not be submitted."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !submitted) return <LoadingSpinner fullPage message="Loading your assigned deliveries..." />;

  if (loadError && !submitted) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader />
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-500" />
          <h3 className="font-semibold text-slate-900">Delivery data could not be loaded</h3>
          <p className="mt-2 text-sm text-slate-600">{loadError}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button onClick={fetchData} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
            <Link to="/driver/shipments" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              My Shipments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const delivery = submitted.delivery;
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader />
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-emerald-900">Delivery Completed</h3>
          <p className="mt-1 text-sm text-emerald-800">Proof of delivery has been saved successfully.</p>
        </div>
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <Detail label="Shipment ID" value={submitted.shipment.id} />
            <Detail label="Delivery ID" value={delivery.id} />
            <Detail label="Recipient" value={delivery.receiverName || submitted.recipientName} />
            <Detail label="Recipient Phone" value={delivery.receiverPhone || "Not provided"} />
            <Detail label="Relationship" value={delivery.receiverRelationship || "Not provided"} />
            <Detail label="Delivery Date and Time" value={formatDateTime(delivery.deliveryDate)} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recipient Signature</p>
            <img src={delivery.signatureBase64 || submitted.signatureBase64} alt="Recipient signature" className="max-h-32 rounded-xl border border-slate-200 bg-slate-50 object-contain p-2" />
          </div>
          {(delivery.proofPhotoBase64 || submitted.photoBase64) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery Photograph</p>
              <img src={delivery.proofPhotoBase64 || submitted.photoBase64} alt="Delivery proof" className="max-h-64 rounded-xl border border-slate-200 object-contain" />
            </div>
          )}
          {delivery.remarks && <Detail label="Delivery Remarks" value={delivery.remarks} />}
          <p className="text-xs text-slate-500">Your shipment and delivery history now show the completed delivery.</p>
        </section>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={() => navigate("/driver/history")} className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">View Delivery History</button>
          <button onClick={() => setSubmitted(null)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Return to Deliveries</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Eligible Deliveries" value={eligibleDeliveries.length} icon={FileCheck} tone="bg-blue-50 text-blue-600" />
        <SummaryCard label="Submitted Proofs" value={submittedProofCount} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
        <SummaryCard label="Pending Confirmations" value={pendingConfirmationCount} icon={Clock} tone="bg-amber-50 text-amber-600" />
      </div>

      {eligibleDeliveries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <FileCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h3 className="font-semibold text-slate-800">
            {records.length === 0
              ? "No deliveries are assigned to your driver account"
              : records.every((delivery) => CLOSED_DELIVERY_STATUSES.includes(delivery.status))
                ? "All assigned deliveries are already closed"
                : "No assigned deliveries are eligible for proof yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            {records.length === 0
              ? "Ask your dispatcher to assign a delivery, then retry this page."
              : records.every((delivery) => CLOSED_DELIVERY_STATUSES.includes(delivery.status))
                ? "Completed, failed, and returned deliveries cannot receive another proof submission."
                : "A delivery becomes eligible when both its delivery and shipment statuses are Out for Delivery."}
          </p>
          <Link to="/driver/shipments" className="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Return to My Shipments
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Eligible Deliveries</h3>
              <p className="mt-1 text-xs text-slate-500">Only your assigned deliveries in the backend-approved Out for Delivery state are shown.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {eligibleDeliveries.map((delivery) => {
                const shipment = delivery.shipment;
                return (
                  <article key={delivery.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${selectedId === delivery.id ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-bold text-blue-700">{shipment.id}</p>
                        <p className="mt-1 text-xs text-slate-500">Delivery {delivery.id}</p>
                      </div>
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${getStatusColor(delivery.status)}`}>{formatStatus(delivery.status)}</span>
                    </div>
                    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                      <Info icon={User} label="Customer" value={shipment.customerName || "Not provided"} />
                      <Info icon={MapPin} label="Delivery Address" value={shipment.deliveryAddress || delivery.destinationAddress} />
                      <Info icon={Package} label="Package" value={shipment.packageDescription || "Not provided"} />
                    </div>
                    <button type="button" onClick={() => setSelectedId(delivery.id)} className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
                      Select Delivery
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          {selectedDelivery && selectedShipment && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {detailError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{detailError}</div>}

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Delivery</p>
                    <h3 className="mt-1 font-mono text-lg font-bold text-slate-900">{selectedShipment.id}</h3>
                    <p className="mt-1 text-xs text-slate-500">Delivery {selectedDelivery.id}</p>
                  </div>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${getStatusColor(selectedDelivery.status)}`}>{formatStatus(selectedDelivery.status)}</span>
                </div>
                <div className="grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
                  <Info icon={User} label="Customer" value={selectedShipment.customerName || customer?.name} />
                  <Info icon={Phone} label="Customer Phone" value={customer?.phone} />
                  <Info icon={MapPin} label="Delivery Address" value={selectedShipment.deliveryAddress || selectedDelivery.destinationAddress} />
                  <Info icon={Package} label="Package" value={selectedShipment.packageDescription} />
                  <Info icon={Truck} label="Assigned Driver" value={driver?.name} />
                  <Info icon={Clock} label="Delivery Status" value={formatStatus(selectedDelivery.status)} />
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><User className="h-4 w-4 text-blue-600" /> Recipient Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Recipient Name" required>
                    <input required maxLength={120} value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Recipient's full name" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </Field>
                  <Field label="Recipient Phone Number">
                    <input type="tel" maxLength={32} pattern="[+]?[0-9\\s()-]{7,20}" title="Enter a valid phone number" value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} placeholder="+91 9876543210" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </Field>
                  <Field label="Relationship to Customer">
                    <select value={relationship} onChange={(event) => setRelationship(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Select (optional)</option>
                      {["Self", "Family Member", "Colleague", "Security / Gate Guard", "Reception", "Neighbour", "Other"].map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </Field>
                </div>
              </section>

              <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><PenTool className="h-4 w-4 text-blue-600" /> Digital Signature <span className="text-rose-500">*</span></h3>
                  <button type="button" onClick={clearSignature} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600">
                    <RotateCcw className="h-3.5 w-3.5" /> Clear Signature
                  </button>
                </div>
                <div className={`relative overflow-hidden rounded-xl border-2 ${hasSignature ? "border-blue-300 bg-blue-50/20" : "border-dashed border-slate-300 bg-slate-50"}`}>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={180}
                    onPointerDown={startDrawing}
                    onPointerMove={drawSignature}
                    onPointerUp={stopDrawing}
                    onPointerCancel={stopDrawing}
                    onPointerLeave={stopDrawing}
                    className="block h-40 w-full touch-none cursor-crosshair"
                    aria-label="Draw recipient signature"
                  />
                  {!hasSignature && <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">Sign here using a mouse or touchscreen</span>}
                </div>
                <p className="text-xs text-slate-500">{hasSignature ? "Signature captured. Clear it to sign again." : "A signature is required before submitting."}</p>
                {signaturePreview && <img src={signaturePreview} alt="Captured signature preview" className="max-h-24 rounded-lg border border-slate-200 bg-slate-50 p-2" />}
              </section>

              <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Camera className="h-4 w-4 text-blue-600" /> Delivery Photograph <span className="text-xs font-normal text-slate-500">(optional)</span></h3>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                    <Camera className="h-4 w-4" /> Upload Photograph
                    <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} className="sr-only" />
                  </label>
                  {photoPreview && (
                    <div className="relative">
                      <img src={photoPreview} alt="Delivery photograph preview" className="h-24 w-24 rounded-xl border border-slate-200 object-cover" />
                      <button type="button" aria-label="Remove photograph" onClick={() => { setPhotoBase64(""); setPhotoPreview(""); if (photoInputRef.current) photoInputRef.current.value = ""; }} className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">JPG, PNG, or WebP, up to 5 MB. Photograph submission is optional.</p>
              </section>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Delivery Confirmation</h3>
                <Field label="Delivery Remarks">
                  <textarea rows={3} maxLength={500} value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Handover notes or other delivery details" className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </Field>
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <p className="text-xs leading-relaxed text-slate-600">The backend records the official delivery date and time when this confirmation is submitted.</p>
                </div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                  <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span>I confirm that the package has been delivered to the named recipient and that the information provided is accurate.</span>
                </label>
              </section>

              <button type="submit" disabled={submitting || !confirmed || !hasSignature || !recipientName.trim() || Boolean(detailError)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {submitting ? "Submitting proof..." : "Submit Proof of Delivery"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

function PageHeader() {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-slate-900">Proof of Delivery</h2>
      <p className="mt-0.5 text-xs text-slate-500">Collect recipient signatures and confirm delivery completion.</p>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block text-xs font-semibold text-slate-700">
      {label}{required && <span className="ml-1 text-rose-500">*</span>}
      {children}
    </label>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 break-words font-medium text-slate-800">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words font-medium text-slate-800">{value || "Not provided"}</p>
    </div>
  );
}
