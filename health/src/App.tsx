import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClinicList } from './components/admin/ClinicList';
import { DoctorDashboard} from './components/doctor/DoctorDashboard';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { DoctorList } from './components/admin/DoctorList';
import { PatientList } from './components/admin/PatientList';
import { ClinicForm } from './components/admin/ClinicForm';
import { DoctorForm } from './components/admin/DoctorForm';
import { PatientForm } from "./components/admin/PatientForm";
import { PatientList as DoctorPatientList } from "./components/doctor/docPatient";
import { DoctorPatientPrescriptionList } from "./components/doctor/DoctorPatientPrescriptionList";
import { PrescriptionDetail } from "./components/doctor/docDetailedRx";
import { AddRx } from "./components/doctor/AddRx";
import { PatTestList } from './components/doctor/docPatTest';
import { MedicineList } from './components/doctor/docMedicine';
import { AddMedicine } from './components/doctor/docAddMedicine';
import { MedicalTestPatientList } from './components/doctor/doc-medicalTest';
import { TestHistoryList } from './components/doctor/docTestHistory';
import { TestDetailView } from './components/doctor/docDetailedTest';
import { AddMedicalTest } from './components/doctor/docAddMedTest';
import { PatDoctorList } from './components/patient/patDoctors';
import { PatientTestList } from './components/patient/patTestList';
import { PatientTestDetail } from './components/patient/patDetailTest';
import { PatientPrescriptionList } from './components/patient/patRx';
import { PatPrescriptionDetail } from './components/patient/patDetailRx';
import { PatClinicList } from './components/patient/patClinic';
import { DocClinicList } from './components/doctor/docClinics';
import { PatientProfile } from './components/patient/patProfile';
import { DoctorProfile } from './components/doctor/docProfile';
import { AdminProfile } from './components/admin/profile';
import { SignupPage } from './components/signUp';
import { ForgotPasswordPage } from './components/forgot-pass';
import { ContactSupportPage } from './components/contact-support';
import { AIChatPage } from './components/Ai';

// Single role protected route
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole: string }> = ({ children, allowedRole }) => {
  const role = localStorage.getItem('role');
  const user = localStorage.getItem('user');

  if (!user || role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Multi-role protected route (for pages accessible by multiple roles)
const ProtectedRouteMulti: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('role');
  const user = localStorage.getItem('user');

  if (!user || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/clinics" element={
          <ProtectedRoute allowedRole="ADMIN">
            <ClinicList />
          </ProtectedRoute>
        } />
        <Route path="/clinics/new" element={<ClinicForm />} />
        <Route path="/clinics/edit/:clinicId" element={<ClinicForm />} />

        <Route path="/admin/doctors" element={
          <ProtectedRoute allowedRole="ADMIN">
            <DoctorList />
          </ProtectedRoute>
        } />
        <Route path="/doctors/new" element={<DoctorForm />} />
        <Route path="/doctors/edit/:doctorId" element={<DoctorForm />} />

        <Route path="/admin/patients" element={
          <ProtectedRoute allowedRole="ADMIN">
            <PatientList />
          </ProtectedRoute>
        } />
        <Route path="/patients/new" element={<PatientForm />} />
        <Route path="/patients/edit/:patientId" element={<PatientForm />} />

        <Route path="/admin/admins" element={
          <ProtectedRoute allowedRole="ADMIN">
            <div className="p-8"><h1 className="text-2xl font-bold">Admins Management</h1><p className="text-slate-500">Coming soon...</p></div>
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminProfile />
          </ProtectedRoute>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor/patients" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <DoctorPatientList />
          </ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <PatTestList />
          </ProtectedRoute>
        } />
        <Route path="/doctor/patients/:patientId/prescriptions" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <DoctorPatientPrescriptionList />
          </ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions/:prescriptionId" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <PrescriptionDetail />
          </ProtectedRoute>
        } />
        <Route path="/doctor/patients/:patientId/prescriptions/new" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <AddRx />
          </ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions/new/:patientId" element={<AddRx />} />
        <Route path="/doctor/prescriptions/edit/:prescriptionId/:patientId" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <AddRx />
          </ProtectedRoute>
        } />
        <Route path="/doctor/medicines" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <MedicineList />
          </ProtectedRoute>
        } />
        <Route path="/doctor/addMedicine" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <AddMedicine />
          </ProtectedRoute>
        } />
        <Route path="/doctor/tests" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <MedicalTestPatientList />
          </ProtectedRoute>
        } />
        <Route path="/doctor/tests/history/:patientId" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <TestHistoryList />
          </ProtectedRoute>
        } />
        <Route path="/doctor/tests/view/:testId" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <TestDetailView />
          </ProtectedRoute>
        } />
        <Route path="/doctor/addTest" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <AddMedicalTest />
          </ProtectedRoute>
        } />
        <Route path="/doctor/addTest/edit/:testId" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <AddMedicalTest />
          </ProtectedRoute>
        } />
        <Route path="/doctor/clinics" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <DocClinicList />
          </ProtectedRoute>
        } />
        <Route path="/doctor/profile" element={
          <ProtectedRoute allowedRole="DOCTOR">
            <DoctorProfile />
          </ProtectedRoute>
        } />

        {/* Patient Routes */}
        <Route path="/patient/dashboard" element={
          <ProtectedRoute allowedRole="PATIENT">
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient/doctors" element={
          <ProtectedRoute allowedRole="PATIENT">
            <PatDoctorList />
          </ProtectedRoute>
        } />
        <Route path="/patient/prescriptions" element={
          <ProtectedRoute allowedRole="PATIENT">
            <PatientPrescriptionList />
          </ProtectedRoute>
        } />
        <Route path="/patient/tests/view/:testId" element={
          <ProtectedRoute allowedRole="PATIENT">
            <PatientTestDetail />
          </ProtectedRoute>
        } />
        <Route path="/patient/tests" element={
          <ProtectedRoute allowedRole="PATIENT">
            <PatientTestList />
          </ProtectedRoute>
        } />
        <Route path="/patient/prescriptions/:prescriptionId" element={
          <ProtectedRoute allowedRole="PATIENT">
            <PatPrescriptionDetail />
          </ProtectedRoute>
        } />
        <Route path="/patient/Clinics" element={
          <ProtectedRoute allowedRole="PATIENT">
            <PatClinicList />
          </ProtectedRoute>
        } />
        <Route path="/patient/profile" element={
          <ProtectedRoute allowedRole="PATIENT">
            <PatientProfile />
          </ProtectedRoute>
        } />

        {/* AI Route — accessible by ALL roles */}
        <Route path="/AI" element={
          <ProtectedRouteMulti allowedRoles={['ADMIN', 'DOCTOR', 'PATIENT']}>
            <AIChatPage />
          </ProtectedRouteMulti>
        } />

        {/* Public Routes */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/contact-support" element={<ContactSupportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}