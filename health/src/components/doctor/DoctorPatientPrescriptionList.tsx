import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { prescriptionApi } from "../../services/api";

export const DoctorPatientPrescriptionList = () => {

    const { patientId } = useParams();
    const navigate = useNavigate();

    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const doctorId = localStorage.getItem("doctorId");

    useEffect(() => {

        const fetch = async () => {

            try {

                if (!doctorId || !patientId) return;

                const res = await prescriptionApi.getDoctorPatientPrescriptions(
                    doctorId,
                    patientId
                );

                setPrescriptions(res.data);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }

        };

        fetch();

    }, [patientId]);

    if (loading) return <div>Loading...</div>;

    const formatDate = (date: any) => {
        if (!date) return "-";
        try {
            return new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        } catch {
            return "-";
        }
    };

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">
                        Patient Prescriptions
                    </h1>
                    <p className="text-slate-500">
                        Patient ID: {patientId}
                    </p>

                </div>

                <button
                    onClick={() =>
                        navigate(`/doctor/prescriptions/new/${patientId}`)
                    }
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
                >
                    + Add Prescription
                </button>
            </div>

            {/* LOADING */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : prescriptions.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    No prescriptions found
                </div>
            ) : (
                <div className="grid gap-4">

                    {prescriptions.map((p) => (

                        <div
                            key={p.id}
                            className="p-5 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer border"
                            onClick={() =>
                                navigate(`/doctor/prescriptions/${p.prescriptionId}`)
                            }
                        >   
                            <div className="flex justify-between items-start">

                                {/* LEFT */}
                                <div>
                                    <h3 className="font-bold text-lg">
                                        #{p.prescriptionId}
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        Status: {p.recordStatus}
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        Created: {formatDate(p.createdDate)}
                                    </p>
                                </div>

                                {/* RIGHT */}
                                <div className="flex flex-col items-end gap-2">

                                    <span className="text-sm text-slate-500">
                                        {p.diagnosis?.icdCode || "No ICD"}
                                    </span>

                                    {/* ACTION BUTTONS */}
                                    <div className="flex gap-2">

                                        {/* EDIT */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(
                                                    `/doctor/prescriptions/edit/${p.prescriptionId}/${patientId}`,
                                                    { state: { prescription: p } }
                                                );
                                            }}
                                            className="text-blue-600 text-xs border px-2 py-1 rounded hover:bg-blue-50"
                                        >
                                            Edit
                                        </button>

                                        {/* DELETE */}
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();

                                                const confirmDelete = window.confirm("Delete this prescription?");
                                                if (!confirmDelete) return;

                                                try {
                                                    await prescriptionApi.delete(p.prescriptionId);

                                                    setPrescriptions(prev =>
                                                        prev.filter(item => item.prescriptionId !== p.prescriptionId)
                                                    );

                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Delete failed");
                                                }
                                            }}
                                            className="text-red-600 text-xs border px-2 py-1 rounded hover:bg-red-50"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};