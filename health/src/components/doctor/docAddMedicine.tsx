import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Pill, Save, Loader2 } from 'lucide-react';


interface MedicineForm {
  medicineName: string;
  companyName: string;
  dosage: string;
  frequency: string;
  duration: string;
  price: string;
  recordStatus: string;
}

const baseUrl = 'https://medsyncaidatabase.onrender.com/api/medicines';

const initialForm: MedicineForm = {
  medicineName: '',
  companyName: '',
  dosage: '',
  frequency: '',
  duration: '',
  price: '',
  recordStatus: 'ACTIVE',
};

export const AddMedicine: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const medicineId = searchParams.get('id');
  const isEditMode = !!medicineId;

  const [form, setForm] = useState<MedicineForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState<Partial<MedicineForm>>({});

  useEffect(() => {
    if (isEditMode && medicineId) {
      fetchMedicineById(medicineId);
    }
  }, [medicineId]);

  const fetchMedicineById = async (id: string) => {
    setIsFetching(true);
    try {
      const response = await fetch(`${baseUrl}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch medicine');
      const data = await response.json();
      setForm({
        medicineName: data.medicineName || data.name || '',
        companyName: data.companyName || '',
        dosage: data.dosage || '',
        frequency: data.frequency || '',
        duration: data.duration?.toString() || '',
        price: data.price?.toString() || '',
        recordStatus: data.recordStatus || 'ACTIVE',
      });
    } catch (error) {
      console.error('Error fetching medicine:', error);
      alert('Failed to load medicine details.');
    } finally {
      setIsFetching(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<MedicineForm> = {};
    if (!form.medicineName.trim()) newErrors.medicineName = 'Medicine name is required';
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!form.dosage.trim()) newErrors.dosage = 'Dosage is required';
    if (!form.frequency.trim()) newErrors.frequency = 'Frequency is required';
    if (!form.duration.trim()) newErrors.duration = 'Duration is required';
    if (!form.price.trim()) newErrors.price = 'Price is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof MedicineForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      alert('Doctor not logged in.');
      return;
    }

    const payload = {
      ...form,
      duration: Number(form.duration),
      price: parseFloat(form.price),
      doctorId,
    };

    setIsLoading(true);
    try {
      const url = isEditMode ? `${baseUrl}/${medicineId}` : baseUrl;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save medicine');

      navigate(-1);
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert('Failed to save medicine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fields: { name: keyof MedicineForm; label: string; type?: string; placeholder: string }[] = [
    { name: 'medicineName', label: 'Medicine Name', placeholder: 'e.g. Paracetamol 500mg' },
    { name: 'companyName', label: 'Company / Manufacturer', placeholder: 'e.g. Sun Pharma' },
    { name: 'dosage', label: 'Dosage', placeholder: 'e.g. 500mg' },
    { name: 'frequency', label: 'Frequency', placeholder: 'e.g. Twice a day' },
    { name: 'duration', label: 'Duration (days)', type: 'number', placeholder: 'e.g. 7' },
    { name: 'price', label: 'Price (₹)', type: 'number', placeholder: 'e.g. 49.99' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/doctor/medicine')}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill size={22} className="text-emerald-600" />
            {isEditMode ? 'Edit Medicine' : 'Add New Medicine'}
          </h1>
          <p className="text-slate-500 mt-0.5">
            {isEditMode ? 'Update the medicine details below.' : 'Fill in the details to add a new medicine to inventory.'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-2xl">
        {isFetching ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map(({ name, label, type = 'text', placeholder }) => (
                <div key={name} className={name === 'medicineName' || name === 'companyName' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    min={type === 'number' ? '0' : undefined}
                    step={name === 'price' ? '0.01' : undefined}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 outline-none transition
                      focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                      ${errors[name] ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                  />
                  {errors[name] && (
                    <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
                  )}
                </div>
              ))}

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  name="recordStatus"
                  value={form.recordStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none transition
                    focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/doctor/medicine')}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isEditMode ? 'Update Medicine' : 'Save Medicine'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};