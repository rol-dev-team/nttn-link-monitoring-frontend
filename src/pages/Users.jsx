// src/pages/Users.jsx  (single-file, no warnings)
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Pencil, ArrowLeft } from "lucide-react"; // ← ArrowLeft imported
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import Button from "../components/ui/Button";
import InputField from "../components/fields/InputField";
import SelectField from "../components/fields/SelectField";
import DataTable from "../components/table/DataTable";
import ToastContainer from "../components/ui/ToastContainer";
import ExportButton from "../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";
import { createUser, fetchUsers, updateUser } from "../services/auth"; // ← adjust path

/* ---------- validation ---------- */
const userSchema = Yup.object().shape({
  full_name: Yup.string().trim().required("Full name is required").max(255),
  email: Yup.string().email("Invalid email").required("Email is required"),
  mobile_number: Yup.string()
    .matches(/^[0-9]{10,15}$/, "Must be 10-15 digits")
    .required("Mobile number is required"),
  role: Yup.string().oneOf(["admin", "editor", "viewer"]).required("Role is required"),
  password: Yup.string().min(6, "At least 6 characters").required("Password is required"),
  retypePassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please re-type password"),
});

/* ---------- section wrapper ---------- */
const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

/* ---------- page shell ---------- */
const Users = () => {
  /* ---------- data & UI state ---------- */
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [formState, setFormState] = useState({
    isOpen: false,
    isEditMode: false,
    editingId: null,
    initialValues: {
      id: "",
      full_name: "",
      email: "",
      mobile_number: "",
      role: "",
      password: "",
      retypePassword: "",
    },
  });

  /* ---------- toast helpers ---------- */
  const pushToast = useCallback((msg, type) => {
    const t = { id: Date.now(), message: msg, type };
    setToasts((c) => [...c, t]);
    setTimeout(() => setToasts((c) => c.filter((x) => x.id !== t.id), 5000));
  }, []);

  const removeToast = (id) => setToasts((c) => c.filter((t) => t.id !== id));

  /* ---------- fetch + flatten ---------- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchUsers(); // ← adjust service name
      const flat = raw.map((u) => ({
        ...u,
        full_name: u.full_name ?? "N/A",
        email: u.email ?? "N/A",
        role: u.role ?? "N/A",
        created_at: u.created_at ?? new Date().toISOString(),
      }));
      setRecords(flat);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load users";
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
    setFormState({
      isOpen: true,
      isEditMode: false,
      editingId: null,
      initialValues: {
        id: "",
        full_name: "",
        email: "",
        mobile_number: "",
        role: "",
        password: "",
        retypePassword: "",
      },
    });

  const openEdit = (item) =>
    setFormState({
      isOpen: true,
      isEditMode: true,
      editingId: item.id,
      initialValues: {
        id: item.id,
        full_name: item.full_name,
        email: item.email,
        mobile_number: item.mobile_number,
        role: item.role,
        password: "", // never pre-fill password
        retypePassword: "",
      },
    });

  const closeForm = () =>
    setFormState({
      isOpen: false,
      isEditMode: false,
      editingId: null,
      initialValues: {
        id: "",
        full_name: "",
        email: "",
        mobile_number: "",
        role: "",
        password: "",
        retypePassword: "",
      },
    });

  const handleSubmit = async (values) => {
    try {
      if (formState.isEditMode) {
        await updateUser(formState.editingId, values); // ← adjust service
        pushToast("Updated successfully!", "success");
      } else {
        await createUser(values); // ← adjust service
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

      { key: "full_name", header: "Full Name", isSortable: true },
      { key: "email", header: "Email", isSortable: true },
      { key: "mobile_number", header: "Mobile", isSortable: true },
      { key: "role", header: "Role", isSortable: true },
      {
        key: "created_at",
        header: "Created",
        isSortable: true,
        render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
      },
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

  /* ---------- FORM COMPONENT (inside same file) ---------- */
  const UserForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
    const roles = ["admin", "editor", "viewer"];

    const formik = useFormik({
      initialValues,
      validationSchema: userSchema,
      enableReinitialize: true,
      onSubmit,
    });

    return (
      <FormikProvider value={formik}>
        <form
          onSubmit={formik.handleSubmit}
          className="p-8 bg-gray-100 min-h-screen space-y-6"
        >
          {/* header – identical to other forms */}
          <div className="flex items-center space-x-3 mb-6 md:mb-8">
            <Button
              variant="icon"
              type="button"
              onClick={onCancel}
              title="Go Back"
              className="p-1 text-gray-600 hover:text-gray-900 transition-transform hover:scale-110"
            >
              <ArrowLeft size={24} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit User" : "Add User"}
              </h1>
              <p className="text-gray-500">
                Fill in the details to {isEditMode ? "update" : "add a new"} user record.
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <FormSection title="User Information">
            <InputField
              name="full_name"
              label="Full Name *"
              placeholder="Enter full name"
            />
            <InputField
              name="email"
              label="Email *"
              type="email"
              placeholder="Enter email"
            />
            <InputField
              name="mobile_number"
              label="Mobile Number *"
              placeholder="Enter mobile number"
            />
            <SelectField
              name="role"
              label="Role *"
              options={roles.map((r) => ({ value: r, label: r }))}
              onChange={(v) => formik.setFieldValue("role", v)}
              searchable
            />
            <InputField
              name="password"
              label="Password *"
              type="password"
              placeholder="Enter password"
            />
            <InputField
              name="retypePassword"
              label="Retype Password *"
              type="password"
              placeholder="Re-enter password"
            />
          </FormSection>

          {/* Actions – identical bar */}
          <div className="flex w-full justify-end mt-8 space-x-3">
            <Button intent="cancel" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" intent="submit" loading={formik.isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </FormikProvider>
    );
  };

  /* ---------- UI ---------- */
  if (formState.isOpen) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <UserForm
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
          <h1 className="text-2xl font-bold">User List</h1>
          <p className="text-gray-500">View and manage users.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={records}
            columns={columns}
            fileName="user_list"
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNew} leftIcon={Plus}>
            Add User
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

export default Users;