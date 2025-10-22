// src/pages/client/Client.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Pencil } from "lucide-react";
import Button from "../../components/ui/Button";
import DataTable from "../../components/table/DataTable";
import ToastContainer from "../../components/ui/ToastContainer";
import ExportButton from "../../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";
import ClientForm from "../../components/client/ClientForm";


/* ---------- NEW: real services ---------- */
import {
  fetchClients,
  createClient,
  updateClient,
} from "../../services/client";

const defaultInitialValues = {
  client_name: "",
  sbu_id: "",
  cat_id: "",
  division_id: "",
  district_id: "",
  thana_id: "",
  address: "",
  client_lat: "",
  client_long: "",
};

const Client = () => {
  /* ---------- state ---------- */
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
    setTimeout(() => setToasts((c) => c.filter((x) => x.id !== t.id)), 5000);
  }, []);

  const removeToast = (id) => setToasts((c) => c.filter((t) => t.id !== id));

  /* ---------- real data load ---------- */
  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClients(); // ← live endpoint
      setRecords(data);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load clients";
      setError(msg);
      pushToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  /* ---------- form flow ---------- */
  const openNew = () =>
    setFormState({ isOpen: true, isEditMode: false, editingId: null, initialValues: defaultInitialValues });

  const openEdit = (item) =>
    setFormState({
      isOpen: true,
      isEditMode: true,
      editingId: item.id,
      initialValues: {
        client_name: item.client_name,
        sbu_id: item.sbu_id,
        cat_id: item.cat_id,
        division_id: item.division_id,
        district_id: item.district_id,
        thana_id: item.thana_id,
        address: item.address,
        client_lat: item.client_lat,
        client_long: item.client_long,
      },
    });

  const closeForm = () =>
    setFormState({ isOpen: false, isEditMode: false, editingId: null, initialValues: defaultInitialValues });

  /* ---------- real save ---------- */
  const handleSubmit = async (values) => {
    try {
      if (formState.isEditMode) {
        await updateClient(formState.editingId, values);
        pushToast("Updated successfully!", "success");
      } else {
        await createClient(values);
        pushToast("Created successfully!", "success");
      }
      loadClients(); // refresh table
      closeForm();
    } catch (e) {
      pushToast(e?.response?.data?.message || "Save failed", "error");
    }
  };

  /* ---------- table columns ---------- */
  const columns = useMemo(
    () => [
      { key: "sbu_name", header: "SBU", isSortable: true },
      { key: "client_name", header: "Client Name", isSortable: true },
      { key: "cat_name", header: "Category", isSortable: true }, // backend returns cat.cat_name
      { key: "division_name", header: "Division", isSortable: true }, // backend returns division.division_name
      { key: "district_name", header: "District", isSortable: true }, // backend returns district.district_name
      { key: "thana_name", header: "Thana", isSortable: true },
      { key: "address", header: "Address" },
      // backend returns sbu.sbu_name
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
        <ClientForm
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
          <h1 className="text-2xl font-bold">Client List</h1>
          <p className="text-gray-500">View and manage clients.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={records}
            columns={columns}
            fileName="client_list"
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNew} leftIcon={Plus}>
            Add Client
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

export default Client;