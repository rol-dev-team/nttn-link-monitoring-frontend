import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Pencil } from "lucide-react";
import Button from "../components/ui/Button";
import BWModificationForm from "../components/bwModify/BWModificationForm";
import DataTable from "../components/table/DataTable";
import ToastContainer from "../components/ui/ToastContainer";
import { FaFileExcel } from 'react-icons/fa';
import ExportButton from "../components/ui/ExportButton";
import SelectField from "../components/fields/SelectField";
import DateField from "../components/fields/DateField";
import BWModificationFilterMenu from "../components/bwModify/BWModificationFilterMenu";
import {
  createBWModification,
  fetchBWModifications,
  updateBWModification
} from "../services/bwModification";
import moment from "moment";

/* ---------- Helper functions from WorkOrder example ---------- */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const getUniqueOptionsWithIds = (records, namePath, idPath) => {
  const uniqueMap = new Map();
  records.forEach(record => {
    const name = getNestedValue(record, namePath);
    const id = getNestedValue(record, idPath);
    if (name && id) {
      uniqueMap.set(name, id);
    }
  });
  return Array.from(uniqueMap.entries()).sort().map(([name, id]) => ({
    label: name,
    value: id,
  }));
};

const getUniqueOptions = (records, key) => {
  const uniqueValues = new Set();
  records.forEach(record => {
    const value = getNestedValue(record, key);
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      uniqueValues.add(String(value).trim());
    }
  });
  return Array.from(uniqueValues).sort().map(value => ({
    label: value,
    value: value,
  }));
};
/* ----------------------------------------------------------- */

/* ---------- default empty form values ---------- */
const defaultInitialValues = {
  id: "",
  nttn_provider: null,
  modification_type: "",
  client_category: null,
  client: null,
  nttn_link_id: "",
  capacity: "",
  capacity_cost: "",
  shifting_bw: "",
  shifting_capacity: "",
  shifting_unit_cost: "",
  workorder: null,
};

const BWModify = () => {
  /* ---------- data & UI state ---------- */
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({}); // Stores active column filters

  // 1️⃣ New state for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRows: 0,
  });

  const showToast = useCallback((message, type) => {
    const newToast = { id: Date.now(), message, type };
    setToasts((c) => [...c, newToast]);
    setTimeout(() => setToasts((c) => c.filter((t) => t.id !== newToast.id)), 5000);
  }, []);

  const removeToast = (id) => setToasts((c) => c.filter((t) => t.id !== id));

  /* ---------- fetch data with filters & pagination ---------- */
  const fetchAllBWModifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { page, limit } = pagination;

    // Combine all filters, including pagination parameters
    const allFilters = {
      ...filters,
      page: page,
      limit: limit,
    };

    try {
      // 2️⃣ Use the combined filters object
      const res = await fetchBWModifications(allFilters);
      const preprocessedData = (res.data || []).map((item) => ({
        ...item,
        nttn_provider_name: item.nttn_provider_details?.nttn_name ?? item.nttn_provider ?? "-",
        client_category_name: item.client_category_details?.cat_name,
        client_name: item.client_details?.client_name,
        workorder_bw_capacity: item.workorder_details?.request_capacity,
        workorder_id: item.workorder_details?.id,
        modification_type: item.modification_type ?? "",
        shifting_capacity: item.shifting_capacity ?? "",
        shifting_unit_cost: item.shifting_unit_cost ?? "",
      }));
      setRecords(preprocessedData);
      setPagination(prev => ({ ...prev, totalRows: res.total })); // 3️⃣ Update total rows
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch BW Modifications.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchAllBWModifications();
  }, [fetchAllBWModifications]);

  /* ---------- form handling (unchanged) ---------- */
  const [formState, setFormState] = useState({
    isOpen: false,
    isEditMode: false,
    editingRecordId: null,
    initialValues: defaultInitialValues,
    isLoading: false,
  });

  const openNewForm = () =>
    setFormState({
      isOpen: true,
      isEditMode: false,
      editingRecordId: null,
      initialValues: defaultInitialValues,
      isLoading: false,
    });

  const handleEdit = (item) =>
    setFormState({
      isOpen: true,
      isEditMode: true,
      editingRecordId: item.id,
      initialValues: {
        ...item,
        nttn_link_id: item.nttn_link_id || "",
        capacity: item.capacity || "",
        capacity_cost: item.capacity_cost || "",
        shifting_bw: item.shifting_bw || "",
        shifting_capacity: item.shifting_capacity || "",
        shifting_unit_cost: item.shifting_unit_cost || "",
        nttn_provider: item.nttn_provider_details?.id ?? null,
        client: item.client_details?.id ?? null,
        client_category: item.client_category_details?.id ?? null,
        workorder: item.workorder_details?.id ?? null,
      },
      isLoading: false,
    });

  const closeForm = () =>
    setFormState((s) => ({ ...s, isOpen: false, isEditMode: false, editingRecordId: null, initialValues: defaultInitialValues }));

  const handleSubmit = async (values) => {
    const { isEditMode, editingRecordId } = formState;
    try {
      if (isEditMode) {
        await updateBWModification(editingRecordId, values);
        showToast("Updated successfully!", "success");
      } else {
        await createBWModification(values);
        showToast("Created successfully!", "success");
      }
      fetchAllBWModifications();
      closeForm();
    } catch (err) {
      showToast(err?.response?.data?.message || "Save failed!", "error");
    }
  };

  // 4️⃣ New filter handler
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    // IMPORTANT: Reset to page 1 whenever filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // 5️⃣ Dynamic Options Calculation (based on fetched records)
  const dynamicOptions = useMemo(() => {
    return {
      nttn_provider: getUniqueOptionsWithIds(records, 'nttn_provider_details.nttn_name', 'nttn_provider_details.id'),
      modification_type: getUniqueOptions(records, 'modification_type'),
      client: getUniqueOptionsWithIds(records, 'client_details.client_name', 'client_details.id'),
      client_category: getUniqueOptionsWithIds(records, 'client_category_details.cat_name', 'client_category_details.id'),
    };
  }, [records]);


  // 6️⃣ Work Order Columns Definition (Configured for Filtering)
  const bwModifyColumns = useMemo(
    () => [
      {
        key: "nttn_provider_name",
        header: "NTTN Provider",
        isSortable: true,
        field: SelectField,
        fieldProps: { name: "nttn_provider", options: dynamicOptions.nttn_provider, searchable: true }
      },
      {
        key: "modification_type",
        header: "Modification Type",
        isSortable: true,
        field: SelectField,
        fieldProps: { name: "modification_type", options: dynamicOptions.modification_type, searchable: true }
      },
      {
        key: "client_category_name",
        header: "Client Category",
        isSortable: true,
        field: SelectField,
        fieldProps: { name: "client_category", options: dynamicOptions.client_category, searchable: true }
      },
      {
        key: "client_name",
        header: "Client",
        isSortable: true,
        field: SelectField,
        fieldProps: { name: "client", options: dynamicOptions.client, searchable: true }
      },
      { key: "nttn_link_id", header: "NTTN Link ID", isSortable: true },
      { key: "capacity", header: "Current Capacity", isSortable: true },
      { key: "capacity_cost", header: "Current Cost", isSortable: true },
      { key: "shifting_bw", header: "New BW", isSortable: true },
      { key: "workorder_bw_capacity", header: "Work Order BW", isSortable: true },
      { key: "shifting_capacity", header: "New Amount", isSortable: true },
      { key: "shifting_unit_cost", header: "Unit Cost", isSortable: true },
      { key: "workorder_id", header: "Work Order ID", isSortable: true },
      {
        key: "created_at",
        header: "Created",
        isSortable: true,
        render: (val) => (val ? moment(val).format("LLL") : "-"),
        field: DateField,
        fieldProps: { name: "created_at", label: "Created Date", }
      },
      { key: "updated_at", header: "Updated", isSortable: true, render: (val) => (val ? moment(val).format("LLL") : "-") },
      {
        key: "actions",
        header: "Action",
        render: (_, row) => (
          <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [handleEdit, dynamicOptions]
  );

  /* ---------- UI ---------- */
  if (formState.isOpen) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <BWModificationForm
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
          <h1 className="text-2xl font-bold">BW Modifications</h1>
          <p className="text-gray-500">View and manage the list of bandwidth modifications.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={records}
            columns={bwModifyColumns}
            fileName="bw_modifications"
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
            Add BW Modification
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
          columns={bwModifyColumns}
          showId={true}

          // 7️⃣ The FilterMenu is passed as a component to the DataTable
          filterComponent={
            <BWModificationFilterMenu
              records={records}
              onFilterChange={handleFilterChange} // This handler updates 'filters' and triggers a data fetch
            />
          }

          // 8️⃣ Server-Side Control Props
          isBackendPagination={true}
          totalRows={pagination.totalRows}
          page={pagination.page}
          pageSize={pagination.limit}

          // Dedicated handlers for pagination/filters
          setPage={(page) => setPagination(prev => ({ ...prev, page }))}
          setPageSize={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default BWModify;