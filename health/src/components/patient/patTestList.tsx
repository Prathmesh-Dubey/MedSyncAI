import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Eye, ClipboardList } from 'lucide-react';

interface MedicalTest {
  id: string;
  testId: string;
  testName: string;
  category: string;
  resultStatus: string;
}

export const PatientTestList: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<MedicalTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    const patientId =
      localStorage.getItem('patientId') ||
      localStorage.getItem('userId') ||
      localStorage.getItem('id');

    console.log('All localStorage keys:');
    Object.keys(localStorage).forEach(k => console.log(k, '=', localStorage.getItem(k)));
    console.log('Using patientId:', patientId);

    if (!patientId) return;
    setIsLoading(true);
    setError(false);
    try {
      const response = await fetch(`https://medsyncaidatabase.onrender.com/api/medical-tests/patients/${patientId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load tests:', err);
      setError(true);
    } finally {
      setIsLoading(false);
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FlaskConical size={22} className="text-emerald-600" />
          My Lab Tests
        </h1>
        <p className="text-slate-500 mt-0.5">View all your medical test records.</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-400">
            <FlaskConical size={36} className="mb-3" />
            <p className="text-sm">Failed to load lab tests.</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList size={36} className="mb-3" />
            <p className="text-sm">No lab tests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Test ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Test Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.map(test => (
                  <tr key={test.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-500">#{test.testId}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{test.testName}</td>
                    <td className="px-5 py-4 text-slate-600">{test.category}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(test.resultStatus)}`}>
                        {test.resultStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`/patient/tests/view/${test.testId}`)}
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

      {!isLoading && !error && tests.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          {tests.length} test{tests.length !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  );
};