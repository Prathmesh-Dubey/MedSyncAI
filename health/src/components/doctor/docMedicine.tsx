import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pill, Trash2, Edit2, RefreshCw, Package } from 'lucide-react';

interface Medicine {
  id: string;
  medId: string;
  medicineName: string;
  name?: string;
  companyName: string;
  dosage: string;
  frequency: string;
  duration: number;
  price: number;
  recordStatus: string;
}

const baseUrl = 'https://medsyncaidatabase.onrender.com/api/medicines';

export const MedicineList: React.FC = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterPrice, setFilterPrice] = useState('');

  const fetchMedicines = async () => {
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      alert('Doctor not logged in.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/doctor/${doctorId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const response = await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      await fetchMedicines();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete medicine.');
    }
  };

  const resetFilters = () => {
    setFilterName('');
    setFilterCompany('');
    setFilterPrice('');
  };

  const filtered = medicines.filter(med => {
    const name = (med.medicineName || med.name || '').toLowerCase();
    const company = (med.companyName || '').toLowerCase();
    const matchName = name.includes(filterName.toLowerCase());
    const matchCompany = company.includes(filterCompany.toLowerCase());
    const matchPrice = filterPrice === '' || med.price <= parseFloat(filterPrice);
    return matchName && matchCompany && matchPrice;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill size={22} className="text-emerald-600" />
            My Medicines
          </h1>
          <p className="text-slate-500 mt-0.5">Manage and search your medication inventory.</p>
        </div>
        <button
          onClick={() => navigate('/doctor/addMedicine')}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus size={17} />
          Add Medicine
        </button>
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
              placeholder="Filter by company..."
              value={filterCompany}
              onChange={e => setFilterCompany(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400 transition"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max price (₹)"
              value={filterPrice}
              onChange={e => setFilterPrice(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400 transition"
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
            <Package size={36} className="mb-3" />
            <p className="text-sm">No medicines found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Med ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Dosage</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Frequency</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(med => (
                  <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-700">{med.medId || '—'}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-700">
                      {med.medicineName || med.name || '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{med.companyName || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{med.dosage || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{med.frequency || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {med.duration ? `${med.duration} days` : '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      ₹{med.price?.toFixed(2) ?? '0.00'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold
                        ${med.recordStatus === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'}`}>
                        {med.recordStatus || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/doctor/addMedicine?id=${med.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
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
          Showing {filtered.length} of {medicines.length} medicines
        </p>
      )}
    </div>
  );
};