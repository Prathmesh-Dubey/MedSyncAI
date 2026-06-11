import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Shield, Edit2, Save, X, Loader2, Eye, EyeOff, Trash2 } from 'lucide-react';
import axios from 'axios';

interface DoctorData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  specialization: string;
  experience: string;
  hospitalName: string;
  consultationFee: string;
  address: string;
  qualification: string[];
}

const initialData: DoctorData = {
  name: '', email: '', phone: '', gender: 'MALE',
  specialization: '', experience: '', hospitalName: '',
  consultationFee: '', address: '', qualification: [],
};

export const DoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DoctorData>(initialData);
  const [editData, setEditData] = useState<DoctorData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const doctorId = localStorage.getItem('doctorId') || localStorage.getItem('userId');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!doctorId) { navigate('/'); return; }
    setIsLoading(true);
    try {
      const res = await axios.get(`https://medsyncaidatabase.onrender.com/api/doctors/${doctorId}`);
      const d = res.data;
      const data: DoctorData = {
        name: d.name || '',
        email: d.email || '',
        phone: d.phone || '',
        gender: d.gender || 'MALE',
        specialization: d.specialization || '',
        experience: d.experience?.toString() || '',
        hospitalName: d.hospitalName || '',
        consultationFee: d.consultationFee?.toString() || '',
        address: d.address || '',
        qualification: Array.isArray(d.qualification)
          ? d.qualification
          : d.qualification ? d.qualification.split(',').map((q: string) => q.trim()) : [],
      };
      setProfile(data);
      setEditData(data);
    } catch (err) {
      console.error('Profile load failed:', err);
      alert('Session expired or profile not found.');
      localStorage.clear();
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const enableEdit = () => { setEditData({ ...profile }); setIsEditing(true); };
  const cancelEdit = () => { setEditData({ ...profile }); setIsEditing(false); };

  const handleChange = (field: keyof DoctorData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!doctorId) return;
    setIsSaving(true);
    try {
      const payload = {
        ...editData,
        experience: editData.experience ? parseInt(editData.experience) : 0,
        consultationFee: editData.consultationFee ? parseFloat(editData.consultationFee) : 0,
        qualification: editData.qualification,
      };
      const res = await axios.put(`https://medsyncaidatabase.onrender.com/api/doctors/${doctorId}`, payload);
      const updated = res.data;
      const data: DoctorData = {
        ...editData,
        name: updated.name || editData.name,
        specialization: updated.specialization || editData.specialization,
      };
      setProfile(data);
      setEditData(data);
      localStorage.setItem('userName', data.name);
      setIsEditing(false);
      alert('Profile Updated Successfully');
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetPassword = async () => {
    setPwdMessage(null);
    if (!newPassword || !confirmPassword) {
      setPwdMessage({ type: 'error', text: 'Both password fields are required.' }); return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: 'Password must be at least 6 characters.' }); return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'Passwords do not match.' }); return;
    }
    setPwdLoading(true);
    try {
      await axios.post('https://medsyncaidatabase.onrender.com/api/doctors/reset-password', {
        email: profile.email,
        phone: profile.phone,
        newPassword,
      });
      setPwdMessage({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPwdMessage({ type: 'error', text: 'Invalid email or phone.' });
      } else {
        setPwdMessage({ type: 'error', text: 'Something went wrong while updating password.' });
      }
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
      await axios.delete(`https://medsyncaidatabase.onrender.com/api/doctors/${doctorId}`);
      localStorage.clear();
      navigate('/');
    } catch (err) {
      console.error('Delete account failed:', err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';

  const data = isEditing ? editData : profile;

  if (isLoading) return (
    <div className="flex justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-0.5">Manage your personal and professional information.</p>
      </div>

      {/* Avatar + actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700 shrink-0">
          {getInitials(profile.name)}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-slate-900">{profile.name || '—'}</h2>
          <p className="text-sm text-emerald-600 font-medium mt-0.5">{profile.specialization || 'General'}</p>
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

      {/* Personal Details */}
      <Section title="Personal Details" icon={<Stethoscope size={15} className="text-emerald-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Full Name">
            <Input value={data.name} disabled={!isEditing} onChange={v => handleChange('name', v)} />
          </Field>
          <Field label="Email Address">
            <Input type="email" value={data.email} disabled={!isEditing} onChange={v => handleChange('email', v)} />
          </Field>
          <Field label="Phone Number">
            <Input type="tel" value={data.phone} disabled={!isEditing} onChange={v => handleChange('phone', v)} />
          </Field>
          <Field label="Gender">
            <Select value={data.gender} disabled={!isEditing} onChange={v => handleChange('gender', v)}
              options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]}
            />
          </Field>
        </div>
      </Section>

      {/* Professional Info */}
      <Section title="Professional Info" icon={<Stethoscope size={15} className="text-blue-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Specialization">
            <Input value={data.specialization} disabled={!isEditing} onChange={v => handleChange('specialization', v)} />
          </Field>
          <Field label="Experience (Years)">
            <Input type="number" value={data.experience} disabled={!isEditing} onChange={v => handleChange('experience', v)} />
          </Field>
          <Field label="Hospital Affiliation">
            <Input value={data.hospitalName} disabled={!isEditing} onChange={v => handleChange('hospitalName', v)} />
          </Field>
          <Field label="Consultation Fee (₹)">
            <Input type="number" value={data.consultationFee} disabled={!isEditing} onChange={v => handleChange('consultationFee', v)} />
          </Field>
          <Field label="Qualifications (comma separated)" className="md:col-span-2">
            <Input
              value={data.qualification.join(', ')}
              disabled={!isEditing}
              onChange={v => setEditData(prev => ({
                ...prev,
                qualification: v.split(',').map(q => q.trim()).filter(Boolean)
              }))}
              placeholder="e.g. MBBS, MD, PhD"
            />
          </Field>
          <Field label="Clinic Address" className="md:col-span-2">
            <textarea
              value={data.address}
              disabled={!isEditing}
              onChange={e => handleChange('address', e.target.value)}
              rows={2}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition resize-none
                ${!isEditing
                  ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
            />
          </Field>
        </div>
      </Section>

      {/* Account Security */}
      <Section title="Account Security" icon={<Shield size={15} className="text-slate-400" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Current Password">
            <div className="relative">
              <input type="password" value="••••••••" disabled
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed outline-none" />
            </div>
            <p className="text-xs text-slate-400 mt-1">For security reasons, your password cannot be viewed.</p>
          </Field>
        </div>
      </Section>

      {/* Change Password */}
      <Section title="Change Password" icon={<Shield size={15} className="text-amber-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="New Password">
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password">
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
        </div>

        {pwdMessage && (
          <p className={`text-sm mt-3 ${pwdMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
            {pwdMessage.text}
          </p>
        )}

        <button onClick={resetPassword} disabled={pwdLoading}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-60 transition">
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
    type={type}
    value={value}
    onChange={e => onChange?.(e.target.value)}
    disabled={disabled}
    placeholder={placeholder}
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
  <select
    value={value}
    onChange={e => onChange?.(e.target.value)}
    disabled={disabled}
    className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
      ${disabled
        ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
        : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
      }`}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);