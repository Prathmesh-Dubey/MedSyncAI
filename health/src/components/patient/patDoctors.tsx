import React, { useEffect, useState } from "react";
import { Search, Phone, Mail, Stethoscope, RefreshCw, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  consultationFee?: number;
  experience?: number;
  phone?: string;
  gender?: string;
}

export const PatDoctorList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoctors = () => {
    setIsLoading(true);
    fetch("https://medsyncaidatabase.onrender.com/api/doctors")
      .then(res => res.json())
      .then(data => setDoctors(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  const resetFilters = () => {
    setSearchTerm("");
    setFilterSpecialization("");
    setFilterGender("");
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchSearch =
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpec = !filterSpecialization || doc.specialization === filterSpecialization;
    const matchGender = !filterGender || doc.gender?.toLowerCase() === filterGender.toLowerCase();
    return matchSearch && matchSpec && matchGender;
  });

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Our Doctors</h1>
        <p className="text-slate-500">Browse and find the right doctor for you</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, specialization or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400 transition"
            />
          </div>

          <select
            value={filterSpecialization}
            onChange={e => setFilterSpecialization(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400 transition bg-white text-slate-700"
          >
            <option value="">All Specializations</option>
            {specializations.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="flex gap-3">
            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400 transition bg-white text-slate-700"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button
              onClick={resetFilters}
              className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
              title="Reset filters"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <User size={36} className="mb-3" />
          <p className="text-sm">No doctors found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {getInitials(doc.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate">{doc.name}</h3>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mt-0.5">
                    {doc.specialization || '—'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2.5 text-sm border-t border-slate-100 pt-4">

                {doc.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span>{doc.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{doc.email || '—'}</span>
                </div>

                {doc.gender && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <User size={13} className="text-slate-400 shrink-0" />
                    <span>{doc.gender}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-400 mb-0.5">Experience</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {doc.experience ? `${doc.experience} yrs` : '—'}
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-400 mb-0.5">Consultation</p>
                    <p className="text-sm font-semibold text-emerald-700">
                      {doc.consultationFee ? `₹${doc.consultationFee}` : '—'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer count */}
      {!isLoading && filteredDoctors.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </p>
      )}

    </div>
  );
};