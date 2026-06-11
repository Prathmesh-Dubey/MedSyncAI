import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Save, Loader2 } from 'lucide-react';

interface TestForm {
  patientId: string;
  testName: string;
  category: string;
  price: string;
  description: string;
  resultStatus: string;
  history: string;
}

const BASE_URL = 'https://medsyncaidatabase.onrender.com';

const initialForm: TestForm = {
  patientId: '',
  testName: '',
  category: '',
  price: '',
  description: '',
  resultStatus: 'Pending',
  history: '',
};

const CATEGORIES = [
  'Blood Test',
  'Urine Test',
  'X-Ray',
  'MRI',
  'CT Scan',
  'ECG',
  'Ultrasound',
  'Pathology',
  'Other',
];

export const AddMedicalTest: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { testId } = useParams<{ testId: string }>();

  const patientIdFromUrl = searchParams.get('patientId');
  const isEditMode = !!testId;

  const [form, setForm] = useState<TestForm>(initialForm);
  const [errors, setErrors] = useState<Partial<TestForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (patientIdFromUrl) {
      setForm(prev => ({ ...prev, patientId: patientIdFromUrl }));
    }
  }, [patientIdFromUrl]);

  useEffect(() => {
    if (isEditMode && testId) {
      fetchTestById(testId);
    }
  }, [testId]);

  const fetchTestById = async (id: string) => {
    setIsFetching(true);
    try {
      const response = await fetch(`${BASE_URL}/api/medical-tests/test/${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setForm({
        patientId: data.patientId || '',
        testName: data.testName || '',
        category: data.category || '',
        price: data.price?.toString() || '',
        description: data.description || '',
        resultStatus: data.resultStatus || 'Pending',
        history: data.history || '',
      });
    } catch (error) {
      console.error('Failed to load test:', error);
      alert('Failed to load test details.');
    } finally {
      setIsFetching(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<TestForm> = {};
    if (!form.patientId.trim()) newErrors.patientId = 'Patient ID is required';
    if (!form.testName.trim())  newErrors.testName  = 'Test name is required';
    if (!form.category)         newErrors.category  = 'Category is required';
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
      newErrors.price = 'Enter a valid price greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof TestForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      alert('Session expired. Please login again.');
      return;
    }

    const payload = {
      ...form,
      price: parseFloat(form.price),
      timestamp: new Date().toISOString(),
    };

    setIsLoading(true);
    try {
      let response: Response;

      if (isEditMode) {
        // PUT to update by internal id — need to fetch id first from testId
        const getRes = await fetch(`${BASE_URL}/api/medical-tests/test/${testId}`);
        const existing = await getRes.json();
        response = await fetch(`${BASE_URL}/api/medical-tests/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, doctorId }),
        });
      } else {
        response = await fetch(`${BASE_URL}/api/medical-tests/doctor/${doctorId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const saved = await response.json();

      // Navigate to the detail view of the saved test
      navigate(`/doctor/tests/view/${saved.testId}`);
    } catch (error) {
      console.error('Failed to save test:', error);
      alert('Failed to save test record.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical size={22} className="text-emerald-600" />
            {isEditMode ? 'Edit Test Record' : 'Add Test Record'}
          </h1>
          <p className="text-slate-500 mt-0.5">
            {isEditMode ? 'Update the medical test details below.' : 'Fill in the details to add a new medical test.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-2xl">
        {isFetching ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Patient ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Patient ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="patientId"
                value={form.patientId}
                onChange={handleChange}
                readOnly={!!patientIdFromUrl}
                placeholder="e.g. PAT-001"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
                  ${!!patientIdFromUrl
                    ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-900 hover:border-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                  }
                  ${errors.patientId ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
              {errors.patientId && <p className="mt-1 text-xs text-red-500">{errors.patientId}</p>}
            </div>

            {/* Test Name + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Test Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="testName"
                  value={form.testName}
                  onChange={handleChange}
                  placeholder="e.g. Complete Blood Count"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 outline-none transition
                    focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400
                    ${errors.testName ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`}
                />
                {errors.testName && <p className="mt-1 text-xs text-red-500">{errors.testName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 outline-none transition
                    focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400
                    ${errors.category ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`}
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
              </div>
            </div>

            {/* Price + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Price (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 outline-none transition
                    focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400
                    ${errors.price ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`}
                />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Result Status
                </label>
                <select
                  name="resultStatus"
                  value={form.resultStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none transition
                    focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Enter test description or findings..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition
                  focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400 resize-none"
              />
            </div>

            {/* History */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">History / Notes</label>
              <textarea
                name="history"
                value={form.history}
                onChange={handleChange}
                rows={3}
                placeholder="Enter relevant patient history or additional notes..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition
                  focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isEditMode ? 'Update Test' : 'Save Test Record'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};