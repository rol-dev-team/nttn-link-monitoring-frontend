import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Pencil } from "lucide-react";
import Button from "../../components/ui/Button";
import DataTable from "../../components/table/DataTable";
import ToastContainer from "../../components/ui/ToastContainer";
import ExportButton from "../../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";
import CategoryForm from "../../components/category/CategoryForm";


/* ---------- NEW: real CRUD services ---------- */
import {
  fetchCategories,
  createCategory,
  updateCategory,
} from "../../services/category";

const defaultInitialValues = { sbu_id: "", cat_name: "" };

const Category = () => {
  /* ---------- state ---------- */
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
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

  /* ---------- data load ---------- */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setRecords(data);
    } catch (e) {
      pushToast(e?.message || "Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ---------- form flow ---------- */
  const openNew = () =>
    setFormState({ isOpen: true, isEditMode: false, editingId: null, initialValues: defaultInitialValues });

  const openEdit = (item) =>
    setFormState({
      isOpen: true,
      isEditMode: true,
      editingId: item.id,
      initialValues: { sbu_id: item.sbu_id, cat_name: item.cat_name },
    });

  const closeForm = () =>
    setFormState({ isOpen: false, isEditMode: false, editingId: null, initialValues: defaultInitialValues });

  /* ---------- real save ---------- */
  const handleSubmit = async (values) => {
    try {
      if (formState.isEditMode) {
        await updateCategory(formState.editingId, values);
        pushToast("Updated successfully!", "success");
      } else {
        await createCategory(values);
        pushToast("Created successfully!", "success");
      }
      loadCategories(); // refresh list
      closeForm();
    } catch (e) {
      pushToast(e?.message || "Save failed", "error");
    }
  };

  /* ---------- table columns ---------- */
  const columns = useMemo(
    () => [
      { key: "sbu_name", header: "SBU", isSortable: true }, // backend returns sbu.sbu_name
      { key: "cat_name", header: "Category Name", isSortable: true },
      {
        key: "actions",
        header: "Action",
        render: (_, row) => (
          <div className="flex gap-2">
            <Button variant="icon" size="sm" onClick={() => openEdit(row)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  /* ---------- UI ---------- */
  if (formState.isOpen) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <CategoryForm
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
          <h1 className="text-2xl font-bold">Category</h1>
          <p className="text-gray-500">View and manage client categories.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={records}
            columns={columns}
            fileName="category_list"
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNew} leftIcon={Plus}>
            Add Category
          </Button>
        </div>
      </div>

      <DataTable
        data={records}
        columns={columns}
        searchable={true}
        selection={true}
        showId={true}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        initialPageSize={5}
        loading={loading}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Category;