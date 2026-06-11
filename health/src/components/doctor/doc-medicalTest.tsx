import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, FlaskConical, PlusCircle, RefreshCw } from 'lucide-react';

interface Patient {
  patientId: string;
  fullName: string;
  phone: string;
  emailAddress: string;
}

export const MedicalTestPatientList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterEmail, setFilterEmail] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      alert('Doctor not logged in.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`https://medsyncaidatabase.onrender.com/api/patients/doctor/${doctorId}`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      const patientData = Array.isArray(data) ? data : data?.data || [];
      setPatients(patientData);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setFilterName('');
    setFilterPhone('');
    setFilterEmail('');
  };

  const filtered = patients.filter(p => {
    const matchName = (p.fullName || '').toLowerCase().includes(filterName.toLowerCase());
    const matchPhone = (p.phone || '').toLowerCase().includes(filterPhone.toLowerCase());
    const matchEmail = (p.emailAddress || '').toLowerCase().includes(filterEmail.toLowerCase());
    return matchName && matchPhone && matchEmail;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FlaskConical size={22} className="text-emerald-600" />
          Medical Tests
        </h1>
        <p className="text-slate-500 mt-0.5">Select a patient to add or view their medical tests.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400 transition"
            />
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by phone..."
              value={filterPhone}
              onChange={e => setFilterPhone(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400 transition"
            />
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by email..."
              value={filterEmail}
              onChange={e => setFilterEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400 transition"
            />
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw size={15} />
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <User size={36} className="mb-3" />
            <p className="text-sm">No matching patients found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.patientId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-700">#{p.patientId}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{p.fullName || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{p.phone || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{p.emailAddress || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/doctor/addTest?patientId=${p.patientId}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                        >
                          <PlusCircle size={13} />
                          Add Test
                        </button>
                        <button
                          onClick={() => navigate(`/doctor/tests/history/${p.patientId}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        >
                          <FlaskConical size={13} />
                          View Tests
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer count */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {patients.length} patients
        </p>
      )}
    </div>
  );
};