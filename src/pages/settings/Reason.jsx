// src/pages/reason/Reason.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Pencil } from "lucide-react";
import Button from "../../components/ui/Button";
import DataTable from "../../components/table/DataTable";
import ToastContainer from "../../components/ui/ToastContainer";
import ExportButton from "../../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";
import ReasonForm from "../../components/reason/ReasonForm";
import { createReason, fetchReasons, updateReason } from "../../services/reason";


const defaultInitialValues = { reason: "" };

const Reason = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [formState, setFormState] = useState({
    isOpen: false,
    isEditMode: false,
    editingId: null,
    initialValues: defaultInitialValues,
  });

  /* ---------- toast helpers ---------- */
  const pushToast = useCallback((msg, type) => {
    const t = { id: Date.now(), message: msg, type };
    setToasts((c) => [...c, t]);
    setTimeout(() => setToasts((c) => c.filter((x) => x.id !== t.id), 5000));
  }, []);

  const removeToast = (id) => setToasts((c) => c.filter((t) => t.id !== id));

  /* ---------- fetch ---------- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchReasons();
      setRecords(raw);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load reasons";
      setError(msg);
      pushToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ---------- form flow ---------- */
  const openNew = () =>
    setFormState({ isOpen: true, isEditMode: false, editingId: null, initialValues: defaultInitialValues });

  const openEdit = (item) =>
    setFormState({
      isOpen: true,
      isEditMode: true,
      editingId: item.id,
      initialValues: { reason: item.reason },
    });

  const closeForm = () =>
    setFormState({ isOpen: false, isEditMode: false, editingId: null, initialValues: defaultInitialValues });

  const handleSubmit = async (values) => {
    try {
      if (formState.isEditMode) {
        await updateReason(formState.editingId, values);
        pushToast("Updated successfully!", "success");
      } else {
        await createReason(values);
        pushToast("Created successfully!", "success");
      }
      fetchAll();
      closeForm();
    } catch (e) {
      pushToast(e?.response?.data?.message || "Save failed", "error");
    }
  };

  /* ---------- columns for reusable table + export ---------- */
  const columns = useMemo(
    () => [

      { key: "reason", header: "Reason", isSortable: true },
      {
        key: "actions",
        header: "Action",
        render: (_, row) => (
          <Button variant="icon" size="sm" onClick={() => openEdit(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  /* ---------- UI ---------- */
  if (formState.isOpen) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <ReasonForm
          initialValues={formState.initialValues}
          isEditMode={formState.isEditMode}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          showToast={pushToast}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center pb-16">
        <div>
          <h1 className="text-2xl font-bold">Reason List</h1>
          <p className="text-gray-500">View and manage Reasons.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={records}
            columns={columns}
            fileName="reason_list"
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNew} leftIcon={Plus}>
            Add Reason
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

export default Reason;