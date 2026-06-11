import React, { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Search } from "lucide-react";
import { Button } from "../UI";
import { useNavigate } from "react-router-dom";

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

export const DoctorList: React.FC = () => {

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchDoctors = () => {
    fetch("https://medsyncaidatabase.onrender.com/api/doctors")
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // DELETE
  const handleDelete = async (id: string) => {

    const confirmDelete = window.confirm("Delete this doctor?");

    if (!confirmDelete) return;

    await fetch(`https://medsyncaidatabase.onrender.com/api/doctors/${id}`, {
      method: "DELETE"
    });

    setDoctors(prev => prev.filter(doc => doc.id !== id));
  };

  // EDIT
  const handleEdit = (id: string) => {
    console.log("Edit doctor:", id);
  };

  // SEARCH FILTER
  const filteredDoctors = doctors.filter(doc =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (

    <div className="space-y-8 p-8">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Doctors Management
          </h1>
          <p className="text-slate-500">
            View and manage registered doctors
          </p>
        </div>

        <Button
          onClick={() => navigate("/doctors/new")}
          className="flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Doctor
        </Button>

      </div>


      {/* SEARCH */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">

        <div className="relative">

          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />

          <input
            className="w-full pl-10 border rounded-lg px-3 py-2"
            placeholder="Search by doctor name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </div>

      </div>


      {/* DOCTOR GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredDoctors.map((doc) => (

          <div
            key={doc.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >

            <div className="flex justify-between items-start mb-2">

              <h3 className="text-lg font-bold text-slate-900">
                {doc.name}
              </h3>

              <div className="flex gap-2">

                <button
                  onClick={() => navigate(`/doctors/edit/${doc.id}`)}
                  className="p-2 text-slate-400 hover:text-emerald-600"
                >
                  <Edit2 size={16} />
                </button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-slate-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </div>

            <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
              {doc.specialization}
            </span>

            <div className="text-sm text-slate-600 border-t border-slate-100 pt-3 mt-2">
              <p>{doc.email}</p>
            </div>

          </div>

        ))}

      </div>

    </div>

  );
};