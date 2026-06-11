import axios from 'axios';

const API_BASE_URL = 'https://medsyncaidatabase.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API
export const adminApi = {
  login: (data: any) => api.post('/admins/login', data),
  create: (data: any) => api.post('/admins', data),
  getAll: (params?: any) => api.get('/admins', { params }),
  getById: (id: string) => api.get(`/admins/${id}`),
  getProfile: (id: string) => api.get(`/admins/profile/${id}`),
  update: (id: string, data: any) => api.put(`/admins/${id}`, data),
  delete: (id: string) => api.delete(`/admins/${id}`),
};

// Clinic API
export const clinicApi = {
  create: (data: any) => api.post('/clinics', data),
  getAll: (params?: any) => api.get('/clinics', { params }),
  getById: (id: string) => api.get(`/clinics/${id}`),
  update: (id: string, data: any) => api.put(`/clinics/${id}`, data),
  delete: (id: string) => api.delete(`/clinics/${id}`),
};

// Doctor API
export const doctorApi = {
  login: (data: any) => api.post('/doctors/login', data),
  create: (data: any) => api.post('/doctors', data),
  getAll: (params?: any) => api.get('/doctors', { params }),
  getById: (id: string) => api.get(`/doctors/${id}`),
  getByDoctorId: (doctorId: string) => api.get(`/doctors/by-doctor-id/${doctorId}`),
  update: (id: string, data: any) => api.put(`/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/doctors/${id}`),
  resetPassword: (data: any) => api.post('/doctors/reset-password', data),
};

// Patient API
export const patientApi = {
  login: (data: any) => api.post('/patients/login', data),
  create: (data: any) => api.post('/patients', data),
  createForDoctor: (doctorId: string, data: any) => api.post(`/patients/doctor/${doctorId}`, data),
  getAll: (params?: any) => api.get('/patients', { params }),
  getById: (id: string) => api.get(`/patients/${id}`),
  getByPatientId: (patientId: string) => api.get(`/patients/by-patient-id/${patientId}`),
  getPatientsByDoctor: (doctorId: string) => api.get(`/patients/doctor/${doctorId}`),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  updateByPatientId: (patientId: string, data: any) => api.put(`/patients/by-patient-id/${patientId}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
  assignDoctor: (patientId: string, doctorId: string) => api.put(`/patients/${patientId}/assign-doctor/${doctorId}`),
};

// Medicine API
export const medicineApi = {
  create: (data: any) => api.post('/medicines', data),
  createForPatient: (doctorId: string, patientId: string, data: any) =>
    api.post(`/medicines/doctor/${doctorId}/patients/${patientId}`, data),
  getAll: (params?: any) => api.get('/medicines', { params }),
  getById: (id: string) => api.get(`/medicines/${id}`),
  getByDoctor: (doctorId: string) => api.get(`/medicines/doctor/${doctorId}`),
  getByPatient: (patientId: string) => api.get(`/medicines/patients/${patientId}`),
  update: (id: string, data: any) => api.put(`/medicines/${id}`, data),
  delete: (id: string) => api.delete(`/medicines/${id}`),
};

// Medical Test API
export const medicalTestApi = {
  create: (data: any) => api.post('/medical-tests', data),
  createByDoctor: (doctorId: string, data: any) => api.post(`/medical-tests/doctor/${doctorId}`, data),
  getAll: (params?: any) => api.get('/medical-tests', { params }),
  getById: (id: string) => api.get(`/medical-tests/${id}`),
  getByPatient: (patientId: string) => api.get(`/medical-tests/patients/${patientId}`),
  getByDoctor: (doctorId: string) => api.get(`/medical-tests/doctor/${doctorId}`),
  update: (id: string, data: any) => api.put(`/medical-tests/${id}`, data),
  delete: (id: string) => api.delete(`/medical-tests/${id}`),
  getByTestId: (testId: string) => api.get(`/medical-tests/test/${testId}`),
};

// Prescription API
export const prescriptionApi = {
  create: (data: any) => api.post('/prescriptions', data),
  createForDoctor: (doctorId: string, data: any) => api.post(`/prescriptions/doctor/${doctorId}`, data),
  // ✅ ADD THIS
  createForDoctorAndPatient: (doctorId: string, patientId: string, data: any) =>
    api.post(`/prescriptions/doctor/${doctorId}/patients/${patientId}`, data),
  getAll: (params?: any) => api.get('/prescriptions', { params }),
  getById: (id: string) => api.get(`/prescriptions/${id}`),
  getByPatient: (patientId: string) => api.get(`/prescriptions/patients/${patientId}`),
  getByDoctor: (doctorId: string) => api.get(`/prescriptions/doctor/${doctorId}`),
  getDoctorPatientPrescriptions: (doctorId: string, patientId: string) =>
    api.get(`/prescriptions/doctor/${doctorId}/patients/${patientId}`),
  update: (id: string, data: any) => api.put(`/prescriptions/${id}`, data),
  delete: (id: string) => api.delete(`/prescriptions/${id}`),
};

export default api;
