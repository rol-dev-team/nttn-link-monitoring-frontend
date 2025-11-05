// pages/shiftCapacity/ShiftingCapacity.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Pencil } from "lucide-react";
import Button from "../components/ui/Button";
import ShiftCapacityForm from "../components/shiftCapacity/ShiftCapacityForm";
import DataTable from "../components/table/DataTable";
import ToastContainer from "../components/ui/ToastContainer";
import ExportButton from "../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";


import {
  createShiftCapacity,
} from "../services/shiftCapacity";
import { fetchCapacityShifting } from "../services/capacityShiftingApi";

const defaultInitialValues = {
  nttn_provider: "",
  client_category: "",
  client: "",
  nttn_link_id: "",
  capacity: "",
  capacity_cost: "",
  shifting_bw: "",
  after_shifting_capacity: "",
  shifting_capacity: "",
  shifting_client_category: "",
  shifting_client: "",
  shifting_unit_cost: "",
  total_shifting_cost: "",
};



const ShiftingCapacity = () => {
  const [capacityShiftingData,setCapacityShiftingData] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRows: 0,
  });

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

  useEffect(() => {
    const getCapacityShiftingData = async () => {
      try {
        const { data } = await fetchCapacityShifting(filters);
        setCapacityShiftingData(data);
      } catch (error) {
        console.error(" API call failed:", error);
      }
    };
  
    getCapacityShiftingData();
  }, []);

  /* ---------- form flow ---------- */
  const openNew = () =>
    setFormState({
      isOpen: true,
      isEditMode: false,
      editingId: null,
      initialValues: defaultInitialValues,
    });



  const closeForm = () =>
    setFormState({
      isOpen: false,
      isEditMode: false,
      editingId: null,
      initialValues: defaultInitialValues,
    });

  const handleSubmit = async (values) => {
    try {
        await createShiftCapacity(values);
        pushToast("Created successfully!", "success");
      closeForm();
    } catch (e) {
      pushToast(e?.response?.data?.message || "Save failed", "error");
    }
  };




  /* ---------- columns with filter options ---------- */

  const columns = useMemo(
    () => [
      {
        key: "from_client",
        header: "From Client",
        isSortable: true,
      },
      { key: "source_capacity", header: "Source Capacity", isSortable: true },
     
      {
        key: "to_client",
        header: "To Client",
        isSortable: true,
      },

      { key: "shifting_bw", header: "Shifting BW", isSortable: true },
       {
        key: "current_capacity",
        header: "Current Capacity",

        isSortable: true,
      },
      { key: "total_shifting_cost", header: "Total Cost", isSortable: true },
      {
        key: "created_at",
        header: "Date",
        isSortable: true,
      }
      
    ],
    []
  );

  /* ---------- UI ---------- */
  if (formState.isOpen) {
    return (
      <div className='p-8 bg-gray-100 min-h-screen'>
        <ShiftCapacityForm
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
    <div className='p-8 bg-gray-100 min-h-screen'>
      <div className='flex justify-between items-center pb-16'>
        <div>
          <h1 className='text-2xl font-bold'>Capacity Shifting List</h1>
          <p className='text-gray-500'>
            View and manage capacity-shifting records.
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <ExportButton
            data={capacityShiftingData}
            columns={columns}
            fileName='capacity_shifts'
            intent='primary'
            leftIcon={FaFileExcel}
            className='text-white bg-green-700 hover:bg-green-800 border-none'>
            Export
          </ExportButton>
          <Button intent='primary' onClick={openNew} leftIcon={Plus}>
            Add Capacity Shift
          </Button>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center py-20 text-gray-500'>
          <p>Loading records...</p>
        </div>
      ) : error ? (
        <div className='flex justify-center items-center py-20 text-red-500'>
          <p>Error: {error}</p>
        </div>
      ) : (
        <DataTable
          data={capacityShiftingData}
          columns={columns}
          searchable={true}
          selection={true}
          showId={true}
          isBackendPagination={true}
          totalRows={pagination.totalRows}
          page={pagination.page}
          pageSize={pagination.limit}
          setPage={(page) => setPagination((prev) => ({ ...prev, page }))}
          setPageSize={(limit) =>
            setPagination((prev) => ({ ...prev, limit, page: 1 }))
          }
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ShiftingCapacity;
