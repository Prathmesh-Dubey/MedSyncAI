import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Shield, Eye, EyeOff, Edit2, Save, X, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';

interface PatientData {
  fullName: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  height: string;
  weight: string;
  allergies: string[];
  chronicDiseases: string[];
  currentMedications: string[];
  phone: string;
  emailAddress: string;
  residentialAddress: string;
  emergencyContact: string;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const initialData: PatientData = {
  fullName: '', patientId: '', dateOfBirth: '', gender: '', bloodGroup: '',
  height: '', weight: '', allergies: [], chronicDiseases: [], currentMedications: [],
  phone: '', emailAddress: '', residentialAddress: '', emergencyContact: '',
};

export const PatientProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientData>(initialData);
  const [editData, setEditData] = useState<PatientData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Password state
  const [confirmPhone, setConfirmPhone] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const userId = localStorage.getItem('patientId') || localStorage.getItem('userId');

  useEffect(() => {
    loadProfile();
  }, []);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P';

  const arrayToString = (arr: string[]) => arr.join(', ');
  const stringToArray = (str: string) => str.split(',').map(v => v.trim()).filter(Boolean);

  const loadProfile = async () => {
    if (!userId) { navigate('/'); return; }
    setIsLoading(true);
    try {
      const res = await axios.get(`https://medsyncaidatabase.onrender.com/api/patients/by-patient-id/${userId}`);
      const p = res.data;
      const data: PatientData = {
        fullName: p.fullName || '',
        patientId: p.patientId || userId,
        dateOfBirth: p.dateOfBirth || '',
        gender: p.gender || '',
        bloodGroup: p.bloodGroup || '',
        height: p.height?.toString() || '',
        weight: p.weight?.toString() || '',
        allergies: Array.isArray(p.allergies) ? p.allergies : [],
        chronicDiseases: Array.isArray(p.chronicDiseases) ? p.chronicDiseases : [],
        currentMedications: Array.isArray(p.currentMedications) ? p.currentMedications : [],
        phone: p.phone || '',
        emailAddress: p.emailAddress || '',
        residentialAddress: p.residentialAddress || '',
        emergencyContact: p.emergencyContact || '',
      };
      setProfile(data);
      setEditData(data);
    } catch (err) {
      console.error('Profile load failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const enableEdit = () => { setEditData({ ...profile }); setIsEditing(true); };
  const cancelEdit = () => { setEditData({ ...profile }); setIsEditing(false); };

  const handleChange = (field: keyof PatientData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const payload = {
        ...editData,
        height: editData.height ? parseInt(editData.height) : null,
        weight: editData.weight ? parseInt(editData.weight) : null,
      };
      await axios.put(`https://medsyncaidatabase.onrender.com/api/patients/by-patient-id/${userId}`, payload);
      localStorage.setItem('userName', editData.fullName);
      await loadProfile();
      setIsEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Profile update failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    setPwdMessage(null);
    if (!confirmPhone || !confirmEmail || !newPassword) {
      setPwdMessage({ type: 'error', text: 'All fields are required.' }); return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: 'Password must be at least 6 characters.' }); return;
    }
    setPwdLoading(true);
    try {
      await axios.put('https://medsyncaidatabase.onrender.com/api/patients/change-password', {
        userId, phone: confirmPhone, email: confirmEmail, newPassword,
      });
      setPwdMessage({ type: 'success', text: 'Password updated successfully!' });
      setConfirmPhone(''); setConfirmEmail(''); setNewPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to update password.';
      setPwdMessage({ type: 'error', text: typeof msg === 'string' ? msg : 'Failed to update password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;
    const doubleConfirm = window.confirm('This will permanently delete all your data. Press OK to confirm.');
    if (!doubleConfirm) return;
    setIsDeleting(true);
    try {
      await axios.delete(`https://medsyncaidatabase.onrender.com/api/patients/${userId}`);
      localStorage.clear();
      navigate('/');
    } catch (err) {
      console.error('Delete account failed:', err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
    </div>
  );

  const data = isEditing ? editData : profile;

  return (
    <div className="max-w-3xl space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-0.5">Manage your personal and medical information.</p>
      </div>

      {/* Avatar + actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700 shrink-0">
          {getInitials(profile.fullName)}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-slate-900">{profile.fullName || '—'}</h2>
          <p className="text-sm text-slate-400 mt-0.5">ID: {profile.patientId}</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button onClick={enableEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition">
              <Edit2 size={15} /> Edit Profile
            </button>
          ) : (
            <>
              <button onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition">
                <X size={15} /> Cancel
              </button>
              <button onClick={saveProfile} disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition">
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <Section title="Personal Information" icon={<User size={15} className="text-emerald-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Full Name">
            <Input value={data.fullName} disabled={!isEditing} onChange={v => handleChange('fullName', v)} />
          </Field>
          <Field label="Date of Birth">
            <Input type="date" value={data.dateOfBirth} disabled={!isEditing} onChange={v => handleChange('dateOfBirth', v)} />
          </Field>
          <Field label="Gender">
            <Select value={data.gender} disabled={!isEditing} onChange={v => handleChange('gender', v)}
              options={[{ value: '', label: 'Select Gender' }, { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
          </Field>
          <Field label="Blood Group">
            <Select value={data.bloodGroup} disabled={!isEditing} onChange={v => handleChange('bloodGroup', v)}
              options={[{ value: '', label: 'Select Blood Group' }, ...BLOOD_GROUPS.map(b => ({ value: b, label: b }))]} />
          </Field>
          <Field label="Height (cm)">
            <Input type="number" value={data.height} disabled={!isEditing} onChange={v => handleChange('height', v)} />
          </Field>
          <Field label="Weight (kg)">
            <Input type="number" value={data.weight} disabled={!isEditing} onChange={v => handleChange('weight', v)} />
          </Field>
          <Field label="Allergies (comma separated)" className="md:col-span-2">
            <Input value={arrayToString(data.allergies)} disabled={!isEditing}
              onChange={v => setEditData(prev => ({ ...prev, allergies: stringToArray(v) }))}
              placeholder="e.g. Penicillin, Pollen" />
          </Field>
          <Field label="Chronic Diseases (comma separated)" className="md:col-span-2">
            <Input value={arrayToString(data.chronicDiseases)} disabled={!isEditing}
              onChange={v => setEditData(prev => ({ ...prev, chronicDiseases: stringToArray(v) }))}
              placeholder="e.g. Diabetes, Hypertension" />
          </Field>
          <Field label="Current Medications (comma separated)" className="md:col-span-2">
            <Input value={arrayToString(data.currentMedications)} disabled={!isEditing}
              onChange={v => setEditData(prev => ({ ...prev, currentMedications: stringToArray(v) }))}
              placeholder="e.g. Metformin, Aspirin" />
          </Field>
        </div>
      </Section>

      {/* Contact Information */}
      <Section title="Contact Information" icon={<Phone size={15} className="text-blue-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Phone">
            <Input value={data.phone} disabled={!isEditing} onChange={v => handleChange('phone', v)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={data.emailAddress} disabled={!isEditing} onChange={v => handleChange('emailAddress', v)} />
          </Field>
          <Field label="Residential Address" className="md:col-span-2">
            <Input value={data.residentialAddress} disabled={!isEditing} onChange={v => handleChange('residentialAddress', v)} />
          </Field>
          <Field label="Emergency Contact" className="md:col-span-2">
            <Input value={data.emergencyContact} disabled={!isEditing} onChange={v => handleChange('emergencyContact', v)} />
          </Field>
        </div>
      </Section>

      {/* Security Settings */}
      <Section title="Security Settings" icon={<Shield size={15} className="text-red-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Confirm Phone Number">
            <Input value={confirmPhone} onChange={setConfirmPhone} placeholder="Enter registered phone" />
          </Field>
          <Field label="Confirm Email Address">
            <Input type="email" value={confirmEmail} onChange={setConfirmEmail} placeholder="Enter registered email" />
          </Field>
          <Field label="New Password" className="md:col-span-2">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} value={newPassword}
                onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
        </div>
        {pwdMessage && (
          <p className={`text-sm mt-2 ${pwdMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
            {pwdMessage.text}
          </p>
        )}
        <button onClick={changePassword} disabled={pwdLoading}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition">
          {pwdLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
          Update Password
        </button>
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone" icon={<Trash2 size={15} className="text-red-500" />}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Delete Account</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
          <button onClick={deleteAccount} disabled={isDeleting}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition">
            {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Delete Account
          </button>
        </div>
      </Section>

    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50">
      {icon}
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
    {children}
  </div>
);

const Input: React.FC<{
  value: string; onChange?: (v: string) => void; disabled?: boolean;
  type?: string; placeholder?: string;
}> = ({ value, onChange, disabled, type = 'text', placeholder }) => (
  <input
    type={type} value={value} onChange={e => onChange?.(e.target.value)}
    disabled={disabled} placeholder={placeholder}
    className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
      ${disabled
        ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
        : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
      }`}
  />
);

const Select: React.FC<{
  value: string; onChange?: (v: string) => void; disabled?: boolean;
  options: { value: string; label: string }[];
}> = ({ value, onChange, disabled, options }) => (
  <select value={value} onChange={e => onChange?.(e.target.value)} disabled={disabled}
    className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
      ${disabled
        ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
        : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
      }`}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);