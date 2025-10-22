// src/pages/Reports.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import Button from "../components/ui/Button";
import DataTable from "../components/table/DataTable"; // 🔁 reusable
import ToastContainer from "../components/ui/ToastContainer";
import ExportButton from "../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";
import { EyeIcon, PencilIcon, } from "lucide-react";

/* ---------- dummy data generator (remove once you plug real API) ---------- */
const dummy = () =>
  Array.from({ length: 120 }, (_, i) => ({
    id: i + 1,
    clientName: `Client ${i + 1}`,
    category: ["Enterprise", "SME", "Govt"][i % 3],
    division: ["Dhaka", "Chattogram", "Rajshahi"][i % 3],
    district: ["Gazipur", "Cox's Bazar", "Natore"][i % 3],
    thana: ["Kaliganj", "Teknaf", "Singra"][i % 3],
    address: `House ${i + 1}, Road ${i + 1}`,
    sbu: ["SBU-A", "SBU-B", "SBU-C"][i % 3],
  }));

const Reports = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((msg, type) => {
    const t = { id: Date.now(), message: msg, type };
    setToasts((c) => [...c, t]);
    setTimeout(() => setToasts((c) => c.filter((x) => x.id !== t.id), 5000));
  }, []);

  const removeToast = (id) => setToasts((c) => c.filter((t) => t.id !== id));

  /* ---------- fetch (dummy for now) ---------- */
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      // TODO: replace with real API call
      setRecords(dummy());
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load reports";
      setError(msg);
      pushToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  /* ---------- columns for reusable table + export ---------- */
  const columns = useMemo(
    () => [

      { key: "clientName", header: "Client Name", isSortable: true },
      { key: "category", header: "Category", isSortable: true },
      { key: "division", header: "Division", isSortable: true },
      { key: "district", header: "District", isSortable: true },
      { key: "thana", header: "Thana", isSortable: true },
      { key: "address", header: "Address", isSortable: true },
      { key: "sbu", header: "SBU", isSortable: true },
      {
        key: "actions",
        header: "Action",
        render: (_, row) => (
          <div className="flex gap-2">
            <Button variant="icon" size="sm" title="View">
              <EyeIcon className="h-4 w-4" />
            </Button>
            <Button variant="icon" size="sm" title="Edit">
              <PencilIcon className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  /* ---------- optional “Add” button (if you ever need it) ---------- */
  const handleAdd = () => pushToast("Add functionality coming soon", "info");

  /* ---------- UI ---------- */
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center pb-16">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-500">View and export client reports.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={records}
            columns={columns}
            fileName="client_reports"
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={handleAdd} leftIcon={Plus}>
            Add Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <p>Loading records...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <DataTable
          data={records}
          columns={columns}
          searchable={true}
          selection={true}
          showId={true}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          initialPageSize={5}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Reports;