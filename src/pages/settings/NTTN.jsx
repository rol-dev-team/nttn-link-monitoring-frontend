// import { useEffect, useState, useCallback, useMemo } from "react";
// import { Plus, Pencil } from "lucide-react";
// import moment from "moment";

// import Button from "../../components/ui/Button";
// import ToastContainer from "../../components/ui/ToastContainer";
// import DataTable from "../../components/table/DataTable";

// import NttnForm from "../../components/nttns/NttnForm";
// import { createNTTN, fetchNTTNs, updateNTTN } from "../../services/nttn";

// const defaultInitialValues = {
//   nttn_name: "",
//   address: "",
// };

// const NTTN = () => {
//   const [records, setRecords] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [formState, setFormState] = useState({
//     isOpen: false,
//     isEditMode: false,
//     editingId: null,
//     initialValues: defaultInitialValues,
//   });

//   const [toasts, setToasts] = useState([]);
//   const showToast = useCallback((message, type) => {
//     const newToast = { id: Date.now(), message, type };
//     setToasts((c) => [...c, newToast]);
//     setTimeout(() => setToasts((c) => c.filter((t) => t.id !== newToast.id)), 5000);
//   }, []);
//   const removeToast = (id) => setToasts((c) => c.filter((t) => t.id !== id));

//   const fetchAllNttns = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetchNTTNs();
//       setRecords(res || []);
//     } catch (err) {
//       const msg = err?.response?.data?.message || "Failed to fetch NTTNs.";
//       setError(msg);
//       showToast(msg, "error");
//     } finally {
//       setLoading(false);
//     }
//   }, [showToast]);

//   useEffect(() => {
//     fetchAllNttns();
//   }, [fetchAllNttns]);

//   const openNewForm = () =>
//     setFormState({
//       isOpen: true,
//       isEditMode: false,
//       editingId: null,
//       initialValues: defaultInitialValues,
//     });

//   const handleEdit = useCallback((item) => {
//     setFormState({
//       isOpen: true,
//       isEditMode: true,
//       editingId: item.id,
//       initialValues: {
//         nttn_name: item.nttn_name,
//         address: item.address,
//       },
//     });
//   }, []);

//   const closeForm = () =>
//     setFormState({
//       isOpen: false,
//       isEditMode: false,
//       editingId: null,
//       initialValues: defaultInitialValues,
//     });

//   const handleSubmit = async (values, { resetForm }) => {
//     try {
//       if (formState.isEditMode) {
//         await updateNTTN(formState.editingId, values);
//         showToast("Updated successfully!", "success");
//       } else {
//         await createNTTN(values);
//         showToast("Created successfully!", "success");
//       }
//       fetchAllNttns();
//       resetForm();
//       closeForm();
//     } catch (err) {
//       showToast(err?.response?.data?.message || "Save failed!", "error");
//     }
//   };

//   const filtered = records.filter((r) =>
//     (r.nttn_name || "").toLowerCase().includes(search.toLowerCase())
//   );

//   const columns = useMemo(
//     () => [
//       { key: "nttn_name", header: "NTTN Name", isSortable: true },
//       { key: "address", header: "Address", isSortable: false },
//       {
//         key: "actions",
//         header: "Action",
//         render: (_, row) => (
//           <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
//             <Pencil className="h-4 w-4" />
//           </Button>
//         ),
//       },
//     ],
//     [handleEdit]
//   );

//   if (formState.isOpen) {
//     return (
//       <div className="p-8 bg-gray-100 min-h-screen">
//         <NttnForm
//           initialValues={formState.initialValues}
//           isEditMode={formState.isEditMode}
//           onSubmit={handleSubmit}
//           onCancel={closeForm}
//         />
//         <ToastContainer toasts={toasts} removeToast={removeToast} />
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 bg-gray-100 min-h-screen">
//       <div className="flex justify-between items-center pb-16">
//         <div>
//           <h1 className="text-2xl font-bold">NTTN List</h1>
//           <p className="text-gray-500">View and manage the list of NTTN providers.</p>
//         </div>
//         <div className="flex items-center gap-4">
//           <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
//             Add NTTN
//           </Button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center py-20 text-gray-500">
//           <p>Loading records...</p>
//         </div>
//       ) : error ? (
//         <div className="flex justify-center items-center py-20 text-red-500">
//           <p>Error: {error}</p>
//         </div>
//       ) : (
//         <DataTable
//           data={filtered}
//           columns={columns}
//           searchable={true}
//           selection={true}
//           showId={true}
//           pageSizeOptions={[5, 10, 25, 50]}
//           initialPageSize={10}
//         />
//       )}

//       <ToastContainer toasts={toasts} removeToast={removeToast} />
//     </div>
//   );
// };

// export default NTTN;

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash } from 'lucide-react';
import Button from '../../components/ui/Button';
import ToastContainer from '../../components/ui/ToastContainer';
import DataTable from '../../components/table/DataTable';
import NttnForm from '../../components/nttns/NttnForm';
import { createNTTN, fetchNTTNs, updateNTTN, deleteNTTN } from '../../services/nttn';

const defaultInitialValues = {
  nttn_name: '',
  address: '',
};

const NTTN = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formState, setFormState] = useState({
    isOpen: false,
    isEditMode: false,
    editingId: null,
    initialValues: defaultInitialValues,
  });

  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type) => {
    const newToast = { id: Date.now(), message, type };
    setToasts((c) => [...c, newToast]);
    setTimeout(() => setToasts((c) => c.filter((t) => t.id !== newToast.id)), 5000);
  }, []);

  const removeToast = (id) => setToasts((c) => c.filter((t) => t.id !== id));

  // ---------- fetch all NTTNs ----------
  const fetchAllNttns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNTTNs();
      // ✅ Ensure the response is an array
      const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

      setRecords(data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to fetch NTTNs.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllNttns();
  }, [fetchAllNttns]);

  const openNewForm = () =>
    setFormState({
      isOpen: true,
      isEditMode: false,
      editingId: null,
      initialValues: defaultInitialValues,
    });

  const handleEdit = useCallback((item) => {
    setFormState({
      isOpen: true,
      isEditMode: true,
      editingId: item.id,
      initialValues: {
        nttn_name: item.nttn_name,
        address: item.address || '',
      },
    });
  }, []);

  const closeForm = () =>
    setFormState({
      isOpen: false,
      isEditMode: false,
      editingId: null,
      initialValues: defaultInitialValues,
    });

  // handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Reason List?')) {
      return;
    }

    try {
      const response = await deleteNTTN(id);
      if (response.success) {
        showToast('Deleted successfully!', 'success');
        fetchAllNttns();
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (formState.isEditMode) {
        await updateNTTN(formState.editingId, values);
        showToast('Updated successfully!', 'success');
      } else {
        await createNTTN(values);
        console.log(values);
        showToast('Created successfully!', 'success');
      }
      fetchAllNttns();
      resetForm();
      closeForm();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Save failed!', 'error');
    }
  };

  const filtered = useMemo(() => {
    return Array.isArray(records)
      ? records.filter((r) => (r.nttn_name || '').toLowerCase().includes(search.toLowerCase()))
      : [];
  }, [records, search]);

  const columns = useMemo(
    () => [
      { key: 'nttn_name', header: 'NTTN Name', isSortable: true },
      { key: 'address', header: 'Address', isSortable: false },
      {
        key: 'actions',
        header: 'Action',
        render: (_, row) => (
          <>
            <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              className="hover:bg-red-800"
              variant="destructive" // Standard variant for red/destructive actions
              size="sm"
              onClick={() => handleDelete(row.id)} // Function to trigger deletion logic
              title="Delete"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </>
        ),
      },
    ],
    [handleEdit]
  );

  if (formState.isOpen) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <NttnForm
          initialValues={formState.initialValues}
          isEditMode={formState.isEditMode}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center pb-16">
        <div>
          <h1 className="text-2xl font-bold">NTTN List</h1>
          <p className="text-gray-500">View and manage the list of NTTN providers.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
            Add NTTN
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
          data={filtered}
          columns={columns}
          searchable={true}
          selection={true}
          showId={true}
          pageSizeOptions={[5, 10, 25, 50]}
          initialPageSize={10}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default NTTN;
