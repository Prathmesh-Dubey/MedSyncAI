import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, Mail, Eye, EyeOff, Loader2, User } from 'lucide-react';

interface AdminData {
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string;
}

export const AdminProfile: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const adminId = localStorage.getItem('adminId') || localStorage.getItem('userId');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!adminId) { navigate('/'); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`https://medsyncaidatabase.onrender.com/api/admins/profile/${adminId}`);
      if (!res.ok) throw new Error('Admin not found');
      const data = await res.json();
      setAdmin(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    setPwdMessage(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwdMessage({ type: 'error', text: 'Please fill in all password fields.' }); return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'New passwords do not match.' }); return;
    }
    setPwdLoading(true);
    try {
      const res = await fetch('https://medsyncaidatabase.onrender.com/api/admins/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, oldPassword, newPassword }),
      });
      if (!res.ok) throw new Error('Incorrect current password.');
      setPwdMessage({ type: 'success', text: 'Password successfully updated!' });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setPwdMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try { return new Date(date).toLocaleDateString(); } catch { return 'N/A'; }
  };

  const formatDateTime = (date: string) => {
    if (!date) return 'Never';
    try { return new Date(date).toLocaleString(); } catch { return 'Never'; }
  };

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  if (isLoading) return (
    <div className="flex justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
    </div>
  );

  if (!admin) return null;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-0.5">Manage your account settings and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left — Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-16 bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="flex flex-col items-center px-6 pb-6 -mt-8">
            <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-xl font-bold text-emerald-700 bg-emerald-100">
              {getInitials(admin.username)}
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">{admin.username}</h3>
            <p className="text-sm text-slate-400">{admin.email}</p>

            <span className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
              admin.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
            }`}>
              {admin.status || 'UNKNOWN'}
            </span>

            <div className="w-full mt-5 divide-y divide-slate-100">
              <div className="flex justify-between py-3">
                <span className="text-xs text-slate-400 uppercase font-semibold">Role</span>
                <span className="text-sm font-semibold text-slate-800">{admin.role || 'ADMIN'}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-xs text-slate-400 uppercase font-semibold">Joined</span>
                <span className="text-sm font-semibold text-slate-800">{formatDate(admin.createdAt)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-xs text-slate-400 uppercase font-semibold">Last Login</span>
                <span className="text-sm font-semibold text-slate-800">{formatDateTime(admin.lastLoginAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Contact + Security */}
        <div className="md:col-span-2 space-y-6">

          {/* Contact Information */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50">
              <User size={15} className="text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-700">Contact Information</h2>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Phone Number</label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700">{admin.phone || 'N/A'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Email Address</label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700">{admin.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50">
              <Shield size={15} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-700">Security Settings</h2>
            </div>
            <div className="px-6 py-5 space-y-5">

              {/* Current password */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Current Password</label>
                <PasswordInput
                  value={oldPassword} onChange={setOldPassword}
                  show={showOld} onToggle={() => setShowOld(!showOld)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">New Password</label>
                  <PasswordInput
                    value={newPassword} onChange={setNewPassword}
                    show={showNew} onToggle={() => setShowNew(!showNew)}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Confirm New Password</label>
                  <PasswordInput
                    value={confirmPassword} onChange={setConfirmPassword}
                    show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)}
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              {pwdMessage && (
                <p className={`text-sm ${pwdMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {pwdMessage.text}
                </p>
              )}

              <div className="flex justify-end">
                <button onClick={changePassword} disabled={pwdLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-60 transition">
                  {pwdLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                  Update Password
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const PasswordInput: React.FC<{
  value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder?: string;
}> = ({ value, onChange, show, onToggle, placeholder }) => (
  <div className="relative">
    <input
      type={show ? 'text' : 'password'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
    />
    <button type="button" onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
);