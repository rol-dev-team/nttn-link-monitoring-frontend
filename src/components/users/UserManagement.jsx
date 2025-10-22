import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../app/AuthContext";
import { useUsers } from "./useUsers ";
import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlinePlus,
  AiOutlineSearch,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";
import UserStats from "./UserStats";
import UserSkeleton from "./UserSkeleton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../utils/apiClient"; // <-- ensure src/utils/apiClient.js exists and axios is installed

export function UserManagement() {
  const { isAuthenticated, user: currentUser } = useAuth();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const usersPerPage = 10;

  const {
    users,
    roles = [],
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    totalUsers,
    isCreating,
    isUpdating,
    isDeleting,
  } = useUsers({
    page,
    limit: usersPerPage,
    searchQuery,
  });

  const [modalState, setModalState] = useState({ type: null, user: null });

  const editDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const createDialogRef = useRef(null);

  useEffect(() => {
    // manage native dialog open/close
    try {
      if (modalState.type === "edit") {
        editDialogRef.current?.showModal();
      } else if (modalState.type === "delete") {
        deleteDialogRef.current?.showModal();
      } else if (modalState.type === "create") {
        createDialogRef.current?.showModal();
      } else {
        editDialogRef.current?.close();
        deleteDialogRef.current?.close();
        createDialogRef.current?.close();
      }
    } catch (err) {
      // some browsers require dialog polyfill; guard against exceptions
      console.warn("Dialog open/close failed:", err);
    }
  }, [modalState]);

  const hasPermission = currentUser?.roles?.some(
    (role) => role.name === "admin" || role.name === "manager"
  );

  const handleAction = async (actionFunction, ...args) => {
    try {
      await actionFunction(...args);
      setModalState({ type: null, user: null });
    } catch (err) {
      console.error("Action failed:", err?.message || err);
      toast.error(err?.message || "An error occurred");
    }
  };

  const totalPages = Math.max(1, Math.ceil((totalUsers || 0) / usersPerPage));
  const handleNextPage = () =>
    setPage((old) => (old < totalPages ? old + 1 : old));
  const handlePrevPage = () => setPage((old) => Math.max(old - 1, 1));

  const isProcessing = isCreating || isUpdating || isDeleting;

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center text-error">
        Please log in to manage users.
      </div>
    );
  }

  // ----------------- UserForm -----------------
  const UserForm = ({
    onSubmit,
    onCancel,
    onSuccess,
    userToEdit,
    roles,
    isSubmitting,
  }) => {
    const [formData, setFormData] = useState({
      name: userToEdit?.name || "",
      first_name: userToEdit?.first_name || "",
      last_name: userToEdit?.last_name || "",
      email: userToEdit?.email || "",
      mobile: userToEdit?.mobile || "",
      password: "",
      role_name: userToEdit?.roles?.[0]?.name || roles?.[0]?.name || "",
    //   team_id: userToEdit?.team_id || "",
    //   dept_id: userToEdit?.dept_id || "",
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const isEditing = !!userToEdit;

    const validateField = (name, value) => {
      let error = "";
      switch (name) {
        case "name":
          if (!value.trim()) error = "Username is required";
          else if (value.length > 255) error = "Username must be less than 255 characters";
          break;
        case "first_name":
          if (!value.trim()) error = "First name is required";
          else if (value.length > 255) error = "First name must be less than 255 characters";
          break;
        case "last_name":
          if (!value.trim()) error = "Last name is required";
          else if (value.length > 255) error = "Last name must be less than 255 characters";
          break;
        case "email":
          if (!value.trim()) error = "Email is required";
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
          else if (value.length > 255) error = "Email must be less than 255 characters";
          break;
        case "mobile":
          if (!value.trim()) error = "Mobile number is required";
          else if (value.length > 20) error = "Mobile number must be less than 20 characters";
          break;
        case "password":
          if (!isEditing && !value.trim()) error = "Password is required";
          else if (value && value.length < 8) error = "Password must be at least 8 characters";
          break;
        case "role_name":
          if (!value.trim()) error = "Role is required";
          break;
        // case "team_id":
        //   if (value && !/^\d+$/.test(String(value))) error = "Team ID must be a number";
        //   break;
        // case "dept_id":
        //   if (value && !/^\d+$/.test(String(value))) error = "Department ID must be a number";
        //   break;
        default:
          break;
      }
      return error;
    };

    // Check uniqueness from backend (onBlur)
    const checkUnique = async (field, value) => {
      if (!value) return;
      try {
        const res = await apiClient.get("/check-unique", {
          params: {
            field,
            value,
            user_id: isEditing ? userToEdit.id : null,
          },
        });
        if (res?.data?.valid === false) {
          setErrors((prev) => ({ ...prev, [field]: res.data.message }));
        } else {
          setErrors((prev) => {
            const updated = { ...prev };
            if (updated[field]) delete updated[field];
            return updated;
          });
        }
      } catch (err) {
        console.error("Unique check failed", err);
        // Do not block user if check fails; optionally show a toast
      }
    };

    const validateForm = () => {
      const newErrors = {};
      Object.keys(formData).forEach((field) => {
        if (field === "password" && isEditing && !formData[field]) return; // skip
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    };

    const handleBlur = (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, formData[name]);
      setErrors((prev) => ({ ...prev, [name]: error }));

      // Only run uniqueness check if field has no client-side error
      if (["name", "email", "mobile"].includes(name) && !error) {
        checkUnique(name, formData[name]);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      // mark all touched so validation shows
      const allTouched = {};
      Object.keys(formData).forEach((k) => (allTouched[k] = true));
      setTouched(allTouched);

      if (!validateForm()) return;

      try {
        const payload = { ...formData };
        if (isEditing) {
          if (!payload.password) {
            delete payload.password;
          } else {
            payload.password_confirmation = payload.password;
          }
        } else {
          payload.password_confirmation = payload.password;
        }

        await onSubmit(isEditing ? { userId: userToEdit.id, payload } : payload);
        onSuccess();
      } catch (err) {
        // server validation errors (422)
        if (err?.response?.data?.errors) {
          const serverErrors = err.response.data.errors;
          setErrors(serverErrors);
          Object.values(serverErrors).forEach((errorMessages) => {
            if (Array.isArray(errorMessages)) {
              errorMessages.forEach((m) => toast.error(m));
            } else if (typeof errorMessages === "string") {
              toast.error(errorMessages);
            }
          });
        } else {
          const errorMessage = err?.message || "An unexpected error occurred.";
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
        }
      }
    };

    const renderError = (field) => {
      if (!errors[field]) return null;
      const message = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
      return <span className="text-error text-xs mt-1">{message}</span>;
    };

    return (
      <form onSubmit={handleSubmit}>
        {errors.general && <div className="alert alert-error mb-4">{errors.general}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username */}
          <div className="form-control">
            <label className="label"><span className="label-text">Username</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {renderError("name")}
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label"><span className="label-text">Email</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {renderError("email")}
          </div>

          {/* Mobile */}
          <div className="form-control">
            <label className="label"><span className="label-text">Mobile</span></label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input input-bordered w-full ${errors.mobile ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {renderError("mobile")}
          </div>

          {/* First Name */}
          <div className="form-control">
            <label className="label"><span className="label-text">First Name</span></label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input input-bordered w-full ${errors.first_name ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {renderError("first_name")}
          </div>

          {/* Last Name */}
          <div className="form-control">
            <label className="label"><span className="label-text">Last Name</span></label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input input-bordered w-full ${errors.last_name ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {renderError("last_name")}
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password {isEditing && "(leave blank to keep current)"}</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {renderError("password")}
          </div>

          {/* Role */}
          <div className="form-control">
            <label className="label"><span className="label-text">Role</span></label>
            <select
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`select select-bordered w-full ${errors.role_name ? "select-error" : ""}`}
              disabled={isSubmitting}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            {renderError("role_name")}
          </div>

          {/* Team ID */}
          {/* <div className="form-control">
            <label className="label"><span className="label-text">Team ID</span></label>
            <input
              type="number"
              name="team_id"
              value={formData.team_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input input-bordered w-full ${errors.team_id ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {renderError("team_id")}
          </div> */}

          {/* Department ID */}
          {/* <div className="form-control">
            <label className="label"><span className="label-text">Department ID</span></label>
            <input
              type="number"
              name="dept_id"
              value={formData.dept_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input input-bordered w-full ${errors.dept_id ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {renderError("dept_id")}
          </div> */}
        </div>

        <div className="modal-action mt-6">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : isEditing ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    );
  };

  // ----------------- MAIN RETURN -----------------
  return (
    <div className="p-8 bg-base-200 min-h-screen">
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-base-content">User Management Dashboard</h1>
        {hasPermission && (
          <button
            className="btn btn-primary"
            onClick={() => setModalState({ type: "create", user: null })}
            disabled={isProcessing}
          >
            <AiOutlinePlus className="mr-2" /> Add New User
          </button>
        )}
      </div>

      {/* Search + UserStats (three stat UI lives in UserStats) */}
      <div className="flex flex-col md:flex-row items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="input input-bordered w-full pl-10"
            disabled={isLoading || isProcessing}
          />
          <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <div className="w-full md:w-auto">
          {!isLoading && <UserStats totalUsers={totalUsers} users={users} />}
        </div>
      </div>

      {isLoading && <UserSkeleton />}
      {error && <div className="alert alert-error my-4">{error.message}</div>}

      {!isLoading && !error && users.length > 0 && (
        <>
          <div className="overflow-x-auto shadow-xl rounded-lg">
            <table className="table w-full table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  {/* <th>Team</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-base-300 transition-colors">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-bold">{user.first_name} {user.last_name}</div>
                          <div className="text-sm opacity-50">@{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td><span className="badge badge-ghost badge-sm">{user.roles?.[0]?.name || "N/A"}</span></td>
                    {/* <td>{user.team_id || "N/A"}</td> */}
                    <td>
                      {hasPermission && (
                        <div className="flex space-x-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => setModalState({ type: "edit", user })}
                            disabled={isProcessing}
                          >
                            <AiOutlineEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => setModalState({ type: "delete", user })}
                            disabled={isProcessing}
                          >
                            <AiOutlineDelete />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-base-content opacity-70">Page {page} of {totalPages}</p>

            <div className="join">
              <button className="join-item btn btn-md" onClick={handlePrevPage} disabled={page === 1 || isProcessing}>
                <AiOutlineLeft />
              </button>
              <button className="join-item btn btn-md" onClick={handleNextPage} disabled={page >= totalPages || isProcessing}>
                <AiOutlineRight />
              </button>
            </div>
          </div>
        </>
      )}

      {/* CREATE DIALOG */}
      <dialog ref={createDialogRef} className="modal bg-black bg-opacity-50">
        <div className="modal-box relative p-6 bg-base-100 rounded-lg shadow-xl w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Create New User</h3>
          <UserForm
            onSubmit={createUser}
            onCancel={() => setModalState({ type: null, user: null })}
            onSuccess={() => setModalState({ type: null, user: null })}
            roles={roles}
            isSubmitting={isProcessing}
          />
        </div>
      </dialog>

      {/* EDIT DIALOG */}
      <dialog ref={editDialogRef} className="modal bg-black bg-opacity-50">
        <div className="modal-box relative p-6 bg-base-100 rounded-lg shadow-xl w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Edit User: {modalState.user?.name}</h3>
          <UserForm
            onSubmit={updateUser}
            onCancel={() => setModalState({ type: null, user: null })}
            onSuccess={() => setModalState({ type: null, user: null })}
            userToEdit={modalState.user}
            roles={roles}
            isSubmitting={isProcessing}
          />
        </div>
      </dialog>

      {/* DELETE DIALOG */}
      <dialog ref={deleteDialogRef} className="modal bg-black bg-opacity-50">
        <div className="modal-box relative p-6 bg-base-100 rounded-lg shadow-xl w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
          <p className="py-4">Are you sure you want to delete the user <strong>{modalState.user?.name}</strong>? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setModalState({ type: null, user: null })} disabled={isProcessing}>Cancel</button>
            <button className="btn btn-error" onClick={() => handleAction(deleteUser, modalState.user.id)} disabled={isProcessing}>
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

