import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, ClipboardList } from 'lucide-react';

interface Prescription {
  prescriptionId: string;
  doctorName: string;
  createdAt: any;
  status: string;
}

export const PatientPrescriptionList: React.FC = () => {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    const patientId =
      localStorage.getItem('patientId') ||
      localStorage.getItem('userId') ||
      localStorage.getItem('id');

    if (!patientId) return;

    setIsLoading(true);
    setError(false);

    try {
      const res = await fetch(
        `https://medsyncaidatabase.onrender.com/api/prescriptions/patients-safe/${patientId}`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const enriched = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (p: any) => {
          let doctorName = 'N/A';

          const doctorId = p.currentDoctor?.doctorId;

          if (doctorId) {
            try {
              const docRes = await fetch(
                `https://medsyncaidatabase.onrender.com/api/doctors/${doctorId}`
              );
              if (docRes.ok) {
                const docData = await docRes.json();
                doctorName = docData?.name || doctorId;
              } else {
                doctorName = doctorId;
              }
            } catch {
              doctorName = doctorId;
            }
          }

          return {
            prescriptionId: p.prescriptionId,
            doctorName,
            // Use createdDate (matches working DoctorPatientPrescriptionList)
            // with fallbacks for other possible field names
            createdAt:
              p.createdDate ||
              p.audit?.createdAt ||
              p.createdAt ||
              p.date ||
              null,
            status:
              p.treatmentTimeline?.treatmentStatus || p.recordStatus || 'Unknown',
          };
        })
      );

      setPrescriptions(enriched);
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      // Handle Java LocalDateTime array [year, month, day, hour, min, sec]
      if (Array.isArray(date)) {
        const [year, month, day, hour = 0, min = 0, sec = 0] = date;
        return new Date(year, month - 1, day, hour, min, sec).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        });
      }
      // Handle timestamp or string
      const parsed = new Date(typeof date === 'string' ? date.replace(' ', 'T') : date);
      if (isNaN(parsed.getTime())) return 'N/A';
      return parsed.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ONGOING':    return 'bg-amber-100 text-amber-700';
      case 'COMPLETED':  return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED':  return 'bg-red-100 text-red-600';
      default:           return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText size={22} className="text-emerald-600" />
          My Prescriptions
        </h1>
        <p className="text-slate-500 mt-0.5">View all your prescription records.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-400">
            <FileText size={36} className="mb-3" />
            <p className="text-sm">Failed to load prescriptions.</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList size={36} className="mb-3" />
            <p className="text-sm">No prescriptions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Doctor</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescriptions.map((p) => (
                  <tr key={p.prescriptionId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-500">#{p.prescriptionId}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{p.doctorName}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(p.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`/patient/prescriptions/${p.prescriptionId}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Eye size={13} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && !error && prescriptions.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  );
};