import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, FlaskConical, User, Stethoscope, FileText, Clock } from 'lucide-react';

interface MedicalTest {
  id: string;
  testId: string;
  testName: string;
  category: string;
  price: number;
  resultStatus: string;
  description: string;
  history: string;
  doctorId: string;
  patientId: string;
}

interface Doctor {
  name: string;
  email: string;
  specialization: string;
  phone: string;
}

interface Patient {
  fullName: string;
  phone: string;
  emailAddress: string;
}

const BASE_URL = 'https://medsyncaidatabase.onrender.com';

export const TestDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const [test, setTest] = useState<MedicalTest | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (testId) loadTest();
  }, [testId]);

  const loadTest = async () => {
    setIsLoading(true);
    try {
      // Load test
      const testRes = await fetch(`${BASE_URL}/api/medical-tests/test/${testId}`);
      if (!testRes.ok) throw new Error(`HTTP ${testRes.status}`);
      const testData: MedicalTest = await testRes.json();
      setTest(testData);

      // Load doctor
      if (testData.doctorId) {
        const docRes = await fetch(`${BASE_URL}/api/doctors/${testData.doctorId}`);
        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctor(docData);
        }
      }

      // Load patient
      if (testData.patientId) {
        const patRes = await fetch(`${BASE_URL}/api/patients/by-patient-id/${testData.patientId}`);
        if (patRes.ok) {
          const patData = await patRes.json();
          setPatient(patData);
        }
      }
    } catch (error) {
      console.error('Failed to load test report:', error);
      alert('Failed to load test report.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return { dot: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' };
      case 'Pending':   return { dot: 'bg-amber-500',   text: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700'   };
      default:          return { dot: 'bg-slate-400',   text: 'text-slate-500',   badge: 'bg-slate-100 text-slate-500'   };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <FlaskConical size={36} className="mb-3" />
        <p>Test report not found.</p>
      </div>
    );
  }

  const statusStyle = getStatusStyle(test.resultStatus);

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
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
              Test Report
              <span className="text-slate-400 font-normal text-lg">#{test.testId}</span>
            </h1>
            <p className="text-slate-500 mt-0.5">Full details of the medical test.</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
        >
          <Printer size={16} />
          Print
        </button>
      </div>

      {/* Test Info Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FlaskConical size={15} className="text-emerald-600" />
            Test Information
          </h2>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {test.resultStatus || 'N/A'}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-slate-100">
          <InfoCell label="Test ID"       value={test.testId} />
          <InfoCell label="Test Name"     value={test.testName} />
          <InfoCell label="Category"      value={test.category} />
          <InfoCell label="Price"         value={`₹${test.price ?? '0.00'}`} />
        </div>
      </div>

      {/* Description & History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={15} className="text-blue-500" />
              Description
            </h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {test.description || 'No description available.'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={15} className="text-amber-500" />
              History
            </h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {test.history || 'No history recorded.'}
            </p>
          </div>
        </div>
      </div>

      {/* Doctor & Patient */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Doctor */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Stethoscope size={15} className="text-emerald-600" />
              Attending Doctor
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            <InfoRow label="Name"           value={doctor?.name} />
            <InfoRow label="Specialization" value={doctor?.specialization} />
            <InfoRow label="Email"          value={doctor?.email} />
            <InfoRow label="Phone"          value={doctor?.phone} />
          </div>
        </div>

        {/* Patient */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User size={15} className="text-blue-500" />
              Patient Details
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            <InfoRow label="Name"  value={patient?.fullName} />
            <InfoRow label="Phone" value={patient?.phone} />
            <InfoRow label="Email" value={patient?.emailAddress} />
          </div>
        </div>

      </div>
    </div>
  );
};

// Small reusable sub-components
const InfoCell: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="px-6 py-4">
    <p className="text-xs text-slate-400 mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
  </div>
);

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between px-6 py-3">
    <span className="text-xs text-slate-400 w-32 shrink-0">{label}</span>
    <span className="text-sm text-slate-700 font-medium text-right">{value || '—'}</span>
  </div>
);