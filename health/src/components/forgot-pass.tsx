import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Phone, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

type Role = 'doctor' | 'admin' | 'patient';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('doctor');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // doctor → PUT, admin → POST, patient → PUT
    const config: Record<Role, { url: string; method: string }> = {
      doctor:  { url: 'https://medsyncaidatabase.onrender.com/api/doctors/reset-password',  method: 'PUT'  },
      admin:   { url: 'https://medsyncaidatabase.onrender.com/api/admins/reset-password',   method: 'POST' },
      patient: { url: 'https://medsyncaidatabase.onrender.com/api/patients/reset-password', method: 'PUT'  },
    };

    const { url, method } = config[role];

    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, newPassword }),
      });

      const result = await response.text();

      if (!response.ok) {
        // Show the actual server error message so user knows what's wrong
        throw new Error(result || `Server error (${response.status})`);
      }

      setMessage({ type: 'success', text: 'Password reset successful. Redirecting to login...' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Password reset failed. Please check your details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleColors: Record<Role, string> = {
    doctor:  'bg-emerald-600',
    admin:   'bg-blue-600',
    patient: 'bg-teal-500',
  };

  const roleLabels: Record<Role, string> = {
    doctor:  'Doctor',
    admin:   'Admin',
    patient: 'Patient',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Top banner */}
        <div className={`${roleColors[role]} transition-colors duration-300 px-8 py-8 flex flex-col items-center text-white`}>
          <ShieldCheck size={40} className="mb-3 opacity-90" />
          <h2 className="text-xl font-bold">Reset Password</h2>
          <p className="text-sm opacity-75 mt-1">Verify your identity to continue</p>
        </div>

        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reset For</label>
              <div className="flex p-1 bg-slate-100 rounded-xl">
                {(['doctor', 'admin', 'patient'] as Role[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setMessage(null); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      role === r ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Registered Phone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="Enter registered phone"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none
                             focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                             hover:border-slate-400 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Enter registered email"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none
                             focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                             hover:border-slate-400 transition"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm outline-none
                             focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                             hover:border-slate-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`px-4 py-3 rounded-lg text-sm font-medium text-center ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-2.5
                         ${roleColors[role]} text-white text-sm font-semibold rounded-lg
                         hover:opacity-90 disabled:opacity-60 transition`}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            {/* Back to login */}
            <div className="text-center">
              <Link to="/" className="text-sm text-emerald-600 hover:underline font-medium">
                ← Back to Login
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};