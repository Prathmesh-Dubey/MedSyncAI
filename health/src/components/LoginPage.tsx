import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card } from './UI';
import { adminApi, doctorApi, patientApi } from '../services/api';
import { UserRole } from '../types';
import { Activity, Shield, User, Stethoscope, HeadphonesIcon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('PATIENT');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (role === 'ADMIN') {
        response = await adminApi.login({ phone, password });
      } else if (role === 'DOCTOR') {
        response = await doctorApi.login({ phone, password });
      } else {
        response = await patientApi.login({ phone, password });
      }

      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('role', role);

      if (role === 'DOCTOR') localStorage.setItem('doctorId', response.data.userId);
      if (role === 'PATIENT') localStorage.setItem('patientId', response.data.userId);
      if (role === 'ADMIN') localStorage.setItem('adminId', response.data.userId);

      navigate(`/${role.toLowerCase()}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="text-emerald-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">MEDSYNC</h1>
          <p className="text-slate-500 text-sm">Welcome back, please login to your account</p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => setRole('PATIENT')}
            className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${
              role === 'PATIENT' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            Patient
          </button>
          <button
            onClick={() => setRole('DOCTOR')}
            className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${
              role === 'DOCTOR' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Doctor
          </button>
          <button
            onClick={() => setRole('ADMIN')}
            className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${
              role === 'ADMIN' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-emerald-600 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Login as {role.charAt(0) + role.slice(1).toLowerCase()}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-600 font-medium hover:underline">Sign up</Link>
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3 text-center">
            <Link
              to="/contact-support"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 transition"
            >
              <HeadphonesIcon className="w-3.5 h-3.5" />
              Contact Support
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};