import React, { useEffect, useState } from 'react';
import { Card, Button } from '../UI';
import { prescriptionApi, medicineApi, medicalTestApi } from '../../services/api';
import {
  FileText,
  Pill,
  TestTube,
  Activity,
  Calendar,
  Download,
  Clock
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    prescriptions: 0,
    medicines: 0,
    tests: 0
  });
  const [patient, setPatient] = useState<any>({});
  const patientId = localStorage.getItem('patientId') || localStorage.getItem('userId');

  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) return;

      try {
        const res = await fetch(`https://medsyncaidatabase.onrender.com/api/patients/by-patient-id/${patientId}`);
        const data = await res.json();

        setPatient(data);
      } catch (err) {
        console.error("Failed to load patient", err);
      }
    };

    loadPatient();
  }, [patientId]);


  useEffect(() => {
    const fetchStats = async () => {
      if (!patientId) return;
      try {
        const [prescriptions, medicines, tests] = await Promise.all([
          prescriptionApi.getByPatient(patient.patientId),
          medicineApi.getByPatient(patient.patientId),
          medicalTestApi.getByPatient(patient.patientId)
        ]);
        setStats({
          prescriptions: prescriptions.data.length || 0,
          medicines: medicines.data.length || 0,
          tests: tests.data.length || 0
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, [patient.patientId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {patient.fullName}</h1>
          <p className="text-slate-500">Your health status and medical records at a glance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download size={18} className="mr-2" />
            Health Report
          </Button>
          <Button className="flex items-center">
            <Calendar size={18} className="mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon={<FileText className="text-blue-600" />}
          label="Prescriptions"
          value={stats.prescriptions}
          color="bg-blue-50"
        />
        <StatCard
          icon={<Pill className="text-emerald-600" />}
          label="Active Medicines"
          value={stats.medicines}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<TestTube className="text-purple-600" />}
          label="Medical Tests"
          value={stats.tests}
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Current Medications</h3>
              <Button variant="ghost" size="sm" className="text-emerald-600">View Schedule</Button>
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Pill size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Paracetamol 500mg</p>
                      <p className="text-xs text-slate-500">Twice a day • After meals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-400">Next dose</p>
                    <p className="text-sm font-bold text-emerald-600">02:00 PM</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Recent Test Results</h3>
              <Button variant="ghost" size="sm" className="text-emerald-600">All Tests</Button>
            </div>
            <div className="space-y-4">
              {[1].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <TestTube size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Complete Blood Count (CBC)</p>
                      <p className="text-xs text-slate-500">24 Oct 2023 • Diagnostic Center</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">Normal</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Health Vitals</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity size={18} className="text-red-500" />
                  <span className="text-sm text-slate-600">Heart Rate</span>
                </div>
                <span className="text-sm font-bold text-slate-900">72 bpm</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity size={18} className="text-blue-500" />
                  <span className="text-sm text-slate-600">Blood Pressure</span>
                </div>
                <span className="text-sm font-bold text-slate-900">120/80</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity size={18} className="text-orange-500" />
                  <span className="text-sm text-slate-600">Weight</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{patient.weight} kg</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 text-white border-none">
            <h3 className="text-lg font-bold mb-4">Need Help?</h3>
            <p className="text-slate-400 text-sm mb-6">Connect with our 24/7 medical support team for any emergencies.</p>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 border-none">Contact Support</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string }> = ({ icon, label, value, color }) => (
  <Card className="p-6">
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  </Card>
);
