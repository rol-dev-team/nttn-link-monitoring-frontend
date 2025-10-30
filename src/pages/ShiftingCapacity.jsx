// pages/shiftCapacity/ShiftingCapacity.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Pencil } from "lucide-react";
import Button from "../components/ui/Button";
import ShiftCapacityForm from "../components/shiftCapacity/ShiftCapacityForm";
import DataTable from "../components/table/DataTable";
import ToastContainer from "../components/ui/ToastContainer";
import ExportButton from "../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";
import FilterMenu from "../components/table/FilterMenu";
import SelectField from "../components/fields/SelectField";
import DateField from "../components/fields/DateField";

import {
  createShiftCapacity,
  fetchShiftCapacities,
  updateShiftCapacity,
} from "../services/shiftCapacity";

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
  workorder_id: "",
  vlan: "",
};

/* ---------- Helper functions to handle nested data and unique options ---------- */
const getUniqueOptionsWithIds = (records, namePath, idPath) => {
  const uniqueMap = new Map();
  records.forEach((record) => {
    const name = namePath
      .split(".")
      .reduce((acc, part) => acc && acc[part], record);
    const id = idPath
      .split(".")
      .reduce((acc, part) => acc && acc[part], record);
    if (name && id) {
      uniqueMap.set(name, id);
    }
  });
  return Array.from(uniqueMap.entries())
    .sort()
    .map(([name, id]) => ({
      label: name,
      value: id,
    }));
};

const ShiftingCapacity = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
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

  /* ---------- fetch data with filters & pagination ---------- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { page, limit } = pagination;
    const allFilters = {
      ...filters,
      page: page,
      limit: limit,
    };
    try {
      const res = await fetchShiftCapacities(allFilters);
      const preprocessedData = (res.data || []).map((item) => ({
        ...item,
        // Flatten the data for easier access
        client_name: item.from_client_details?.client_name ?? "N/A",
        client_id: item.from_client_details?.id,
        shifting_client_name: item.to_client_details?.client_name ?? "N/A",
        shifting_client_id: item.to_client_details?.id,
      }));
      setRecords(preprocessedData);
      setPagination((prev) => ({ ...prev, totalRows: res.total }));
    } catch (e) {
      const msg =
        e?.response?.data?.message || "Failed to load capacity shifts";
      setError(msg);
      pushToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ---------- form flow ---------- */
  const openNew = () =>
    setFormState({
      isOpen: true,
      isEditMode: false,
      editingId: null,
      initialValues: defaultInitialValues,
    });

  const openEdit = (item) =>
    setFormState({
      isOpen: true,
      isEditMode: true,
      editingId: item.id,
      initialValues: {
        ...defaultInitialValues,
        id: item.id,
        nttn_provider: item.nttn_provider,
        client_category: item.client_category,
        client: item.client,
        shifting_client_category: item.shifting_client_category,
        shifting_client: item.shifting_client,
        nttn_link_id: item.nttn_link_id,
        capacity: item.capacity,
        capacity_cost: item.capacity_cost,
        shifting_bw: item.shifting_bw,
        after_shifting_capacity: item.after_shifting_capacity,
        shifting_capacity: item.shifting_capacity,
        shifting_unit_cost: item.shifting_unit_cost,
        total_shifting_cost: item.total_shifting_cost,
        workorder_id: item.workorder,
        vlan: item.vlan,
      },
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
      if (formState.isEditMode) {
        await updateShiftCapacity(formState.editingId, values);
        pushToast("Updated successfully!", "success");
      } else {
        await createShiftCapacity(values);
        pushToast("Created successfully!", "success");
      }
      fetchAll();
      closeForm();
    } catch (e) {
      pushToast(e?.response?.data?.message || "Save failed", "error");
    }
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const dynamicOptions = useMemo(() => {
    return {
      from_client: getUniqueOptionsWithIds(
        records,
        "from_client_details.client_name",
        "from_client_details.id"
      ),
      to_client: getUniqueOptionsWithIds(
        records,
        "to_client_details.client_name",
        "to_client_details.id"
      ),
    };
  }, [records]);

  /* ---------- columns with filter options ---------- */
  const columns = useMemo(
    () => [
      {
        key: "client_name",
        header: "From Client",
        isSortable: true,
        field: SelectField,
        fieldProps: { name: "client", options: dynamicOptions.from_client },
      },
      { key: "nttn_link_id", header: "Link ID", isSortable: true },
      { key: "capacity", header: "Last Capacity", isSortable: true },
      {
        key: "after_shifting_capacity",
        header: "After Shift Capacity",
        isSortable: true,
      },
      {
        key: "shifting_client_name",
        header: "To Client",
        isSortable: true,
        field: SelectField,
        fieldProps: {
          name: "shifting_client",
          options: dynamicOptions.to_client,
        },
      },
      { key: "shifting_bw", header: "Shifting BW", isSortable: true },
      { key: "total_shifting_cost", header: "Total Cost", isSortable: true },
      { key: "vlan", header: "VLAN", isSortable: true },
      {
        key: "created_at",
        header: "Date",
        isSortable: true,
        render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        field: DateField,
        fieldProps: { name: "created_at" },
      },
      {
        key: "actions",
        header: "Action",
        render: (_, row) => (
          <Button
            variant='icon'
            size='sm'
            onClick={() => openEdit(row)}
            title='Edit'>
            <Pencil className='h-4 w-4' />
          </Button>
        ),
      },
    ],
    [openEdit, dynamicOptions]
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
            data={records}
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
          data={records}
          columns={columns}
          searchable={true}
          selection={true}
          showId={true}
          filterComponent={
            <FilterMenu columns={columns} onFilterChange={handleFilterChange} />
          }
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
