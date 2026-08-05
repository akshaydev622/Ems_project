import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Calendar, Clock, MapPin, Loader2, Camera, RefreshCw, Trash2, MessageSquare } from 'lucide-react';
import Loading from '../components/Loading';
import AttendanceStats from '../components/attendance/AttendanceStats';
import AttendanceHistory from '../components/attendance/AttendanceHistory';
import Modal from '../components/shared/customModals/Modal';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/authcontext.jsx';

const Attendance = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalTime, setModalTime] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  // Dynamic Location & Form states
  const [address, setAddress] = useState("Detecting location...");
  const [addressLoading, setAddressLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Camera & Photo States
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/attendance");
      const json = res.data;
      setHistory(json.data || []);
      if (json.employee?.isDeleted) setIsDeleted(true);
    } catch (error) {
      toast.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "EMPLOYEE") {
      setLoading(false);
      return;
    }
    fetchData();
  }, [fetchData, user]);

  // Stop camera tracks helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Open modal and capture opening timestamp
  const handleOpenModal = () => {
    setModalTime(new Date());
    setShowModal(true);
  };

  // Close modal and cleanup state
  const handleCloseModal = () => {
    stopCamera();
    setCapturedPhoto(null);
    setCameraError("");
    setNote("");
    setModalTime(null);
    setShowModal(false);
  };

  // Start camera stream
  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera permission denied or camera device unavailable");
    }
  };

  // Snap photo from video feed
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(imageBase64);
    stopCamera();
  };

  // Location detection when modal opens
  useEffect(() => {
    if (!showModal) {
      stopCamera();
      return;
    }

    if (navigator.geolocation) {
      setAddressLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const lat = latitude.toFixed(2);
          const lng = longitude.toFixed(2);
          setCoords({ latitude, longitude });
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
            } else {
              setAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
            }
          } catch (err) {
            setAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
          } finally {
            setAddressLoading(false);
          }
        },
        (error) => {
          setAddress("Location access unavailable or denied by browser");
          setAddressLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setAddress("Geolocation is not supported by your browser");
      setAddressLoading(false);
    }

    return () => {
      stopCamera();
    };
  }, [showModal]);

  if (authLoading || loading) return <Loading />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRecord = history.find((r) => new Date(r.date).toDateString() === today.toDateString());

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const activeTime = modalTime || new Date();
      const payload = {
        date: activeTime.toISOString(),
        time: activeTime.toISOString(),
        note,
        photo: capturedPhoto,
        address,
        coords,
      };
      const res = await api.post("/attendance", payload);
      toast.success(res.data?.type === "CHECK IN" ? "Checked in successfully!" : "Checked out successfully!");
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== "EMPLOYEE") {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Attendance is available only for employees.</p>
        </div>
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700">
          <p className="font-medium">Attendance access</p>
          <p className="mt-2 text-sm text-slate-600">Your current account role does not have an attendance record. Contact your administrator if this is incorrect.</p>
        </div>
      </div>
    );
  }

  // Format date & time using the exact active modal time
  const activeTime = modalTime || new Date();
  const currentDateFormatted = activeTime.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const currentTimeFormatted = activeTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col justify-between sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track your work hours and daily check-ins</p>
        </div>
        <button className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center" onClick={handleOpenModal}>
          <Plus size={16} /> Mark Attendance
        </button>
      </div>

      {isDeleted ? (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
          <p className="text-rose-600">
            You can no longer clock in or out because your employee record has been marked as deleted.
          </p>
        </div>
      ) : ''}

      <AttendanceStats history={history} />
      <AttendanceHistory history={history} />

      {/* Hidden Canvas for Camera Snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mark Attendance Modal */}
      {showModal && (
        <Modal
          open={showModal}
          onClose={handleCloseModal}
          title="Mark Attendance"
          subtitle="Confirm your details and mark attendance"
          size="lg"
        >
          <form onSubmit={handleMarkAttendance} className="space-y-5">
            {/* Status Action Type Badge */}
            <div className="flex items-center justify-between p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Attendance Action</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${todayRecord?.punchIn ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                {todayRecord?.punchIn ? "Punch Out" : "Punch In"}
              </span>
            </div>

            {/* Date & Time Display Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {currentDateFormatted}
                  </p>
                </div>
              </div>

              {/* Current Time (Hours & Minutes only) */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Time</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {currentTimeFormatted}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Address Display Card */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Detected Location</span>
              </div>
              {addressLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-1 pl-6">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Fetching location...</span>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-800 leading-relaxed pl-6">
                  {address}
                </p>
              )}
            </div>

            {/* Camera / Photo Snapshot Section */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Photo Verification (Optional)</span>
                </div>
              </div>

              {cameraError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">{cameraError}</p>
              )}

              {/* Camera Active View */}
              {cameraActive && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 text-xs btn-secondary"
                    >
                      Cancel Camera
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-3 py-1.5 text-xs btn-primary flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" /> Capture Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Captured View */}
              {capturedPhoto && !cameraActive && (
                <div className="flex items-center gap-4">
                  <img src={capturedPhoto} alt="Captured Attendance Selfie" className="w-24 h-24 rounded-xl object-cover border-2 border-indigo-500 shadow-sm" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      ✓ Photo attached
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1.5 text-xs btn-secondary flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retake
                      </button>
                      <button
                        type="button"
                        onClick={() => setCapturedPhoto(null)}
                        className="px-3 py-1.5 text-xs btn-danger-light flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Initial State (No Camera Active & No Photo Captured) */}
              {!cameraActive && !capturedPhoto && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:text-indigo-600 bg-white transition-all text-xs font-medium"
                >
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>Click to take a photo / selfie</span>
                </button>
              )}
            </div>

            {/* Note / Comment Input */}
            <div className="space-y-1.5">
              <label htmlFor="attendance-note" className="block text-xs font-medium text-slate-700 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Note / Comment (Optional)
              </label>
              <textarea
                id="attendance-note"
                rows="2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any note or comments regarding today's attendance..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex gap-3 justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  todayRecord?.punchIn ? 'Confirm Clock Out' : 'Confirm Clock In'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Attendance;