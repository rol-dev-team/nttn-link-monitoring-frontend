import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Pencil } from "lucide-react";
import Button from "../components/ui/Button";
import WorkOrderForm from "../components/work-order/WorkOrderForm"
import DataTable from "../components/table/DataTable";
import ToastContainer from "../components/ui/ToastContainer";
import { FaFileExcel } from 'react-icons/fa';
import ExportButton from "../components/ui/ExportButton";
import SelectField from "../components/fields/SelectField";
import DateField from "../components/fields/DateField";
import WorkOrderFilterMenu from "../components/work-order/WorkOrderFilterMenu";
import {
  createWorkOrder,
  updateWorkOrder,
  fetchWorkOrders,
  fetchWorkOrder,
} from "../services/workOrder";
import moment from "moment";

// Helper function to safely get nested data
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Helper: Maps Name (label) to ID (value) for Foreign Keys
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

// Helper to extract unique simple options
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

const defaultInitialValues = {
  type_id: 2,
  sbu_id: null,
  link_type_id: null,
  aggregator_id: null,
  kam_id: null,
  nttn_id: null,
  nttn_survey_id: "",
  nttn_lat: "",
  nttn_long: "",
  client_lat: null,
  client_long: null,
  client_id: null,
  mac_user: "",
  submition: "",
  nttn_link_id: "",
  request_capacity: "",
  total_cost_of_request_capacity: "",
  shift_capacity: false,
  net_capacity: "",
  net_capacity_price: "",
  unit_rate: "",
  vlan: "",
  remarks: "",
  requested_delivery: "",
  service_handover: "",
};

const WorkOrder = () => {
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
    editingRecordId: null,
    initialValues: defaultInitialValues,
    isLoading: false,
  });

  const showToast = useCallback((message, type) => {
    const newToast = { id: Date.now(), message, type };
    setToasts((currentToasts) => [...currentToasts, newToast]);
    setTimeout(() => {
      setToasts((currentsToasts) => currentsToasts.filter((t) => t.id !== newToast.id));
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  };

  const fetchAllWorkOrders = useCallback(async (currentFilters = {}) => {
    setLoading(true);
    setError(null);
    const { page, limit } = pagination;
    const allFilters = {
      ...currentFilters,
      page: page,
      limit: limit,
    };
    try {
      const { data: recordsData, totalCount: total } = await fetchWorkOrders(allFilters);
      setRecords(recordsData);
      setPagination(prev => ({
        ...prev,
        totalRows: total
      }));
    } catch (error) {
      console.error("Failed to fetch work orders:", error);
      setError(error?.response?.data?.message || "Something went wrong! Check Console and CORS/Header exposure.");
      showToast(error?.response?.data?.message || "Failed to fetch work orders.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchAllWorkOrders(filters);
  }, [filters, fetchAllWorkOrders]);

  const openNewForm = () => {
    setFormState({
      isOpen: true,
      isEditMode: false,
      editingRecordId: null,
      initialValues: defaultInitialValues,
      isLoading: false,
    });
  };

  const closeForm = () => {
    setFormState((prevState) => ({
      ...prevState,
      isOpen: false,
      isEditMode: false,
      editingRecordId: null,
      initialValues: defaultInitialValues,
    }));
  };

  const handleEdit = async (item) => {
    setFormState((prevState) => ({ ...prevState, isLoading: true }));
    try {
      const workOrderData = await fetchWorkOrder(item.id);

      const formattedData = {
        // Correctly map all fields from the API response
        nttn_link_id: workOrderData.nttn_link_id || "",
        request_capacity: workOrderData.request_capacity || "",
        total_cost_of_request_capacity: workOrderData.total_cost_of_request_capacity || "",
        unit_rate: workOrderData.unit_rate || "",
        remarks: workOrderData.remarks || "",
        vlan: workOrderData.vlan || "",
        shift_capacity: workOrderData.shift_capacity || false,
        net_capacity: workOrderData.net_capacity || "",
        net_capacity_price: workOrderData.net_capacity_price || "",

        // Correctly map dates
        requested_delivery: workOrderData.requested_delivery || "",
        service_handover: workOrderData.service_handover || "",
        submition: workOrderData.survey_data?.submition || "",

        // Fix: Use the correct source for these fields
        nttn_survey_id: workOrderData.survey_data?.nttn_survey_id || "",
        survey_id: workOrderData.survey_data?.id,
        type_id: workOrderData.survey_data?.type_id || 2,

        // Correctly map IDs and names from the nested survey_data
        sbu_id: workOrderData.survey_data?.sbu_id || null,
        sbu_name: workOrderData.survey_data?.sbu_name || "",
        link_type_id: workOrderData.survey_data?.link_type_id || null,
        link_type_name: workOrderData.survey_data?.link_type_name || "",
        aggregator_id: workOrderData.survey_data?.aggregator_id || null,
        aggregator_name: workOrderData.survey_data?.aggregator_name || "",
        kam_id: workOrderData.survey_data?.kam_id || null,
        kam_name: workOrderData.survey_data?.kam_name || "",
        nttn_id: workOrderData.survey_data?.nttn_id || null,
        nttn_name: workOrderData.survey_data?.nttn_name || "",

        // Fix: Correctly map client data, including name and location
        client_id: workOrderData.survey_data?.client_id || null,
        client_name: workOrderData.survey_data?.client_name || "",
        client_category: workOrderData.survey_data?.client_category || "",
        division: workOrderData.survey_data?.client_division || "",
        district: workOrderData.survey_data?.client_district || "",
        thana: workOrderData.survey_data?.client_thana || "",
        address: workOrderData.survey_data?.client_address || "",

        // Other fields
        nttn_lat: workOrderData.survey_data?.nttn_lat || "",
        nttn_long: workOrderData.survey_data?.nttn_long || "",
        client_lat: workOrderData.survey_data?.client_lat || null,
        client_long: workOrderData.survey_data?.client_long || null,
        mac_user: workOrderData.survey_data?.mac_user || "",
        status: workOrderData.workorder_status || "Active",
      };

      setFormState({
        isOpen: true,
        isEditMode: true,
        editingRecordId: item.id,
        initialValues: formattedData,
        isLoading: false,
      });
    } catch (error) {
      showToast("Failed to load work order data for editing!", "error");
      setFormState((prevState) => ({ ...prevState, isLoading: false }));
      closeForm();
    }
  };

  const handleSubmit = async (values) => {
    const { isEditMode, editingRecordId } = formState;
    const payload = { ...values };

    // Helper function to safely convert to a number or null
    const convertToNumber = (value) => {
      if (value === "" || value === null || isNaN(Number(value))) {
        return null;
      }
      return Number(value);
    };

    // --- Data Transformation ---
    payload.request_capacity = convertToNumber(payload.request_capacity);
    payload.total_cost_of_request_capacity = convertToNumber(payload.total_cost_of_request_capacity);
    payload.net_capacity = convertToNumber(payload.net_capacity);
    payload.net_capacity_price = convertToNumber(payload.net_capacity_price);
    payload.unit_rate = convertToNumber(payload.unit_rate);
    payload.mac_user = convertToNumber(payload.mac_user);
    payload.cat_id = convertToNumber(payload.cat_id); // Ensure cat_id is converted
    payload.sbu_id = convertToNumber(payload.sbu_id);
    payload.link_type_id = convertToNumber(payload.link_type_id);
    payload.aggregator_id = convertToNumber(payload.aggregator_id);
    payload.kam_id = convertToNumber(payload.kam_id);
    payload.nttn_id = convertToNumber(payload.nttn_id);
    payload.client_id = convertToNumber(payload.client_id);
    payload.survey_id = convertToNumber(payload.survey_id);

    // Final checks on string fields
    const safeTrim = (v) => (v ?? "").trim();
    payload.nttn_link_id = safeTrim(payload.nttn_link_id) === "" ? null : safeTrim(payload.nttn_link_id);
    payload.vlan = safeTrim(payload.vlan) === "" ? null : safeTrim(payload.vlan);
    payload.remarks = safeTrim(payload.remarks) === "" ? null : safeTrim(payload.remarks);
    payload.nttn_survey_id = safeTrim(payload.nttn_survey_id) === "" ? null : safeTrim(payload.nttn_survey_id);

    // Date formatting (as per original code, which you stated is working)
    const formatDate = d => (d ? d.split('T')[0] : null);
    payload.requested_delivery = formatDate(payload.requested_delivery);
    payload.service_handover = formatDate(payload.service_handover);
    payload.submition = formatDate(payload.submition);
    try {
      if (isEditMode) {
        await updateWorkOrder(editingRecordId, payload);
        showToast("Updated successfully!", "success");
      } else {
        await createWorkOrder(payload);
        showToast("Created successfully!", "success");
      }
      fetchAllWorkOrders(filters);
      closeForm();
    } catch (error) {
      showToast(error?.response?.data?.message || "Save failed!", "error");
    }
  };

  const handleFilterChange = useCallback((newTableState) => {
    const { page, limit, ...otherFilters } = newTableState;
    setFilters(otherFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const dynamicOptions = useMemo(() => {
    return {
      sbu: getUniqueOptionsWithIds(records, 'survey_data.sbu_name', 'survey_data.sbu_id'),
      link_type: getUniqueOptionsWithIds(records, 'survey_data.link_type_name', 'link_type_id'),
      aggregator: getUniqueOptionsWithIds(records, 'survey_data.aggregator_name', 'survey_data.aggregator_id'),
      kam: getUniqueOptionsWithIds(records, 'survey_data.kam_name', 'survey_data.kam_id'),
      nttn_name: getUniqueOptionsWithIds(records, 'survey_data.nttn_name', 'survey_data.nttn_id'),
      client: getUniqueOptionsWithIds(records, 'survey_data.client_name', 'survey_data.client_id'),
      client_category: getUniqueOptions(records, 'survey_data.client_category'),
    };
  }, [records]);

  const workOrderColumns = useMemo(() => [
    { key: "sbu_name", header: "SBU", render: (val, row) => getNestedValue(row, "survey_data.sbu_name"), field: SelectField, fieldProps: { name: "sbu_id", options: dynamicOptions.sbu, searchable: true } },
    { key: "link_type_name", header: "Link Type", render: (val, row) => getNestedValue(row, "survey_data.link_type_name"), field: SelectField, fieldProps: { name: "link_type_id", options: dynamicOptions.link_type, searchable: true } },
    { key: "aggregator_name", header: "Aggregator", render: (val, row) => getNestedValue(row, "survey_data.aggregator_name"), field: SelectField, fieldProps: { name: "aggregator_id", options: dynamicOptions.aggregator, searchable: true } },
    { key: "kam_name", header: "KAM", render: (val, row) => getNestedValue(row, "survey_data.kam_name"), field: SelectField, fieldProps: { name: "kam_id", options: dynamicOptions.kam, searchable: true } },
    { key: "nttn_name", header: "NTTN Name", render: (val, row) => getNestedValue(row, "survey_data.nttn_name"), field: SelectField, fieldProps: { name: "nttn_id", options: dynamicOptions.nttn_name, searchable: true } },
    { key: "nttn_survey_id", header: "NTTN Survey ID", render: (val, row) => getNestedValue(row, "survey_data.nttn_survey_id") || row.nttn_survey_id },
    { key: "client_name", header: "Client Name", render: (val, row) => getNestedValue(row, "survey_data.client_name"), field: SelectField, fieldProps: { name: "client_id", options: dynamicOptions.client, searchable: true } },
    { key: "client_category", header: "Client Category", render: (val, row) => getNestedValue(row, "survey_data.client_category"), field: SelectField, fieldProps: { name: "client_category", options: dynamicOptions.client_category, searchable: true } },
    { key: "request_capacity", header: "Capacity" },
    { key: "total_cost_of_request_capacity", header: "Total Cost" },
    { key: "unit_rate", header: "Unit Rate" },
    { key: "requested_delivery", header: "Requested Delivery", render: (val) => val ? moment(val).format("YYYY-MM-DD") : "N/A", field: DateField, fieldProps: { name: "requested_delivery", label: "Requested Delivery Date", } },
    { key: "service_handover", header: "Service Handover", render: (val) => val ? moment(val).format("YYYY-MM-DD") : "N/A", field: DateField, fieldProps: { name: "service_handover", label: "Service Handover Date", } },
    { key: "status", header: "Status" },
    { key: "actions", header: "Action", render: (value, row) => (<Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit"><Pencil className="h-4 w-4" /></Button>), },
  ], [handleEdit, dynamicOptions]);

  if (formState.isOpen) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        {formState.isLoading ? (<div className="flex justify-center items-center py-20 text-gray-500"><p>Loading form...</p></div>) : (<WorkOrderForm initialValues={formState.initialValues} isEditMode={formState.isEditMode} onSubmit={handleSubmit} onCancel={closeForm} />)}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center pb-16">
        <div>
          <h1 className="text-2xl font-bold">Work Orders</h1>
          <p className="text-gray-500">View and manage the list of work orders.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton data={records} columns={workOrderColumns} fileName="work_orders" intent="primary" leftIcon={FaFileExcel} className="text-white bg-green-700 hover:bg-green-800 border-none">
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
            Add Work Order
          </Button>
        </div>
      </div>
      {loading ? (<div className="flex justify-center items-center py-20 text-gray-500"><p>Loading work orders...</p></div>) : error ? (<div className="flex justify-center items-center py-20 text-red-500"><p>Error: {error}</p></div>) : (<DataTable data={records} records={records} columns={workOrderColumns} searchable={true} showId={true} filterComponent={<WorkOrderFilterMenu records={records} onFilterChange={handleFilterChange} />} isBackendPagination={true} totalRows={pagination.totalRows} page={pagination.page} pageSize={pagination.limit} onFilterChange={handleFilterChange} setPage={(page) => setPagination(prev => ({ ...prev, page }))} setPageSize={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))} />)}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default WorkOrder;