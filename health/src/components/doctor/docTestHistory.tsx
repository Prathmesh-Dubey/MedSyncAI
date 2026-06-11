import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Eye, Trash2, ClipboardList, Edit2 } from 'lucide-react';

interface MedicalTest {
  id: string;
  testId: string;
  testName: string;
  category: string;
  price: number;
  resultStatus: string;
}

const BASE_URL = 'https://medsyncaidatabase.onrender.com';

export const TestHistoryList: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const [tests, setTests] = useState<MedicalTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTests = async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const url = `${BASE_URL}/api/medical-tests/patients/${patientId}`;
      console.log('Fetching:', url);
      const response = await fetch(url);
      console.log('Status:', response.status, 'Content-Type:', response.headers.get('content-type'));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log('Data:', data);
      setTests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading test history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [patientId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this test?')) return;
    try {
      const response = await fetch(`${BASE_URL}/api/medical-tests/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      await fetchTests();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete test.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'Pending':   return 'bg-amber-100 text-amber-700';
      default:          return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/doctor/tests')}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical size={22} className="text-emerald-600" />
            Test History
          </h1>
          <p className="text-slate-500 mt-0.5">
            Showing all medical tests for patient <span className="font-semibold text-slate-700">#{patientId}</span>
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => navigate(`/doctor/addTest?patientId=${patientId}`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm"
          >
            + Add Test
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList size={36} className="mb-3" />
            <p className="text-sm">No tests found for this patient.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Test ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Test Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.map(test => (
                  <tr key={test.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-700">{test.testId}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{test.testName}</td>
                    <td className="px-5 py-4 text-slate-600">{test.category}</td>
                    <td className="px-5 py-4 text-slate-700 font-medium">₹{test.price ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(test.resultStatus)}`}>
                        {test.resultStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/doctor/tests/view/${test.testId}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/doctor/addTest/edit/${test.testId}`)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
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

      {!isLoading && tests.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          {tests.length} test{tests.length !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  );
};