import React, { useEffect, useState } from 'react';
import { Card, Button } from '../UI';
import { patientApi, prescriptionApi, medicineApi } from '../../services/api';
import { 
  Users, 
  FileText, 
  Pill, 
  Calendar,
  ArrowRight,
  Plus
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    patients: 0,
    prescriptions: 0,
    medicines: 0
  });

  const doctor = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  // FIX 1: Handle multiple possible ID field names from login response
  const doctorId: string = doctor.userId || doctor._id || doctor.id || doctor.doctorId || '';

  useEffect(() => {
    if (!doctorId) {
      console.warn('DoctorDashboard: No doctorId found in localStorage user object', doctor);
      return;
    }

    const fetchStats = async () => {
      try {
        const [patientsRes, prescriptionsRes, medicinesRes] = await Promise.all([
          patientApi.getPatientsByDoctor(doctorId),
          prescriptionApi.getByDoctor(doctorId),
          medicineApi.getByDoctor(doctorId),
        ]);

        // FIX 2: Axios returns response.data — your API likely returns the array
        // directly, so patientsRes.data is already the array (not patientsRes.data.data)
        const toArray = (res: any): any[] => {
          const d = res?.data;
          if (Array.isArray(d)) return d;               // API returns array directly
          if (Array.isArray(d?.data)) return d.data;    // API returns { data: [...] }
          if (Array.isArray(d?.patients)) return d.patients;
          if (Array.isArray(d?.prescriptions)) return d.prescriptions;
          if (Array.isArray(d?.medicines)) return d.medicines;
          return [];
        };

        setStats({
          patients:      toArray(patientsRes).length,
          prescriptions: toArray(prescriptionsRes).length,
          medicines:     toArray(medicinesRes).length,
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };

    fetchStats();
  }, [doctorId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {doctor.name || 'Doctor'}</h1>
          <p className="text-slate-500">Here's what's happening with your patients today</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center">
            <Calendar size={18} className="mr-2" />
            Schedule
          </Button>
          <Button className="flex items-center">
            <Plus size={18} className="mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 border-none" style={{ background: 'linear-gradient(135deg, #059669, #064e3b)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <Users size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-sm font-bold tracking-wide uppercase" style={{ color: '#a7f3d0' }}>Total Patients</p>
          <h3 className="text-4xl font-extrabold mt-1" style={{ color: '#ffffff' }}>{stats.patients}</h3>
        </Card>

        <Card className="p-6 border-none" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b0764)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <FileText size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-sm font-bold tracking-wide uppercase" style={{ color: '#ddd6fe' }}>Prescriptions Issued</p>
          <h3 className="text-4xl font-extrabold mt-1" style={{ color: '#ffffff' }}>{stats.prescriptions}</h3>
        </Card>

        <Card className="p-6 border-none" style={{ background: 'linear-gradient(135deg, #ea580c, #7c2d12)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <Pill size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-sm font-bold tracking-wide uppercase" style={{ color: '#fed7aa' }}>Medicines Prescribed</p>
          <h3 className="text-4xl font-extrabold mt-1" style={{ color: '#ffffff' }}>{stats.medicines}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Patients</h3>
            <Button variant="ghost" size="sm" className="text-emerald-600">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3">Patient Name</th>
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Gender</th>
                  <th className="pb-3">Blood Group</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          JD
                        </div>
                        <span className="text-sm font-medium text-slate-900">Jane Doe</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-500">PAT-100{i}</td>
                    <td className="py-4 text-sm text-slate-500">Female</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg">O+</span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Upcoming Appointments</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl text-emerald-600">
                  <span className="text-xs font-bold">OCT</span>
                  <span className="text-lg font-bold leading-none">2{i}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Consultation: Mark Smith</p>
                  <p className="text-xs text-slate-500">10:30 AM - 11:00 AM</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6">View Full Calendar</Button>
        </Card>
      </div>
    </div>
  );
};