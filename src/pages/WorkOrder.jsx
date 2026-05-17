



import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Pencil } from "lucide-react";
import Button from "../components/ui/Button";
import WorkOrderForm from "../components/work-order/WorkOrderForm";
import DataTable from "../components/table/DataTable";
import ToastContainer from "../components/ui/ToastContainer";
import { FaFileExcel } from "react-icons/fa";
import ExportButton from "../components/ui/ExportButton";
import WorkOrderFilterMenu from "../components/work-order/WorkOrderFilterMenu";
import {
  createWorkOrderLaravel,
  fetchWorkOrdersLaravel,
  updateWorkOrderLaravel,
  fetchWorkOrderLaravel,
} from "../services/workOrder";
import { fetchReasons } from "../services/reason";
import moment from "moment";

// ✅ Helper to safely get nested data from object paths
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// ✅ Helper to extract unique options
const getUniqueOptions = (records, key) => {
  if (!Array.isArray(records)) return [];
  const uniqueValues = new Set();
  records.forEach((record) => {
    const value = getNestedValue(record, key);
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      uniqueValues.add(String(value).trim());
    }
  });
  return Array.from(uniqueValues)
    .sort()
    .map((value) => ({
      label: value,
      value: value,
    }));
};

// ✅ Helper: Maps label ↔ id for foreign keys
const getUniqueOptionsWithIds = (records, nameKey, idKey) => {
  if (!Array.isArray(records)) return [];
  const uniqueMap = new Map();
  records.forEach((record) => {
    const name = getNestedValue(record, nameKey);
    const id = getNestedValue(record, idKey);
    if (name && id) {
      uniqueMap.set(String(name), String(id));
    }
  });
  return Array.from(uniqueMap.entries())
    .sort()
    .map(([label, value]) => ({ label, value }));
};

const defaultInitialValues = {
  sbu_id: "",
  link_type_id: "",
  aggregator_id: "",
  kam_id: "",
  nttn_id: "",
  nttn_survey_id: "",
  nttn_lat: "",
  nttn_long: "",
  client_lat: "",
  client_long: "",
  client_id: "",
  mac_user: "",
  nttn_work_order_id: "",
  work_order_mac_user: "",
  request_capacity: "",
  total_cost_of_request_capacity: "",
  unit_rate: "",
  rate_id: "",
  vlan: "",
  remarks: "",
  requested_delivery: "",
  service_handover: "",
  submission: "",
  status: "active",
  posted_by: "",
  reason_id: "",
};

const WorkOrder = () => {
  const [allRecords, setAllRecords] = useState([]); // All records from API
  const [filteredRecords, setFilteredRecords] = useState([]); // Filtered records for display
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRows: 0,
  });
  const [reasonsMap, setReasonsMap] = useState(new Map());

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
    setTimeout(
      () =>
        setToasts((currentToasts) =>
          currentToasts.filter((t) => t.id !== newToast.id)
        ),
      4000
    );
  }, []);

  const removeToast = (id) =>
    setToasts((toasts) => toasts.filter((t) => t.id !== id));

  // Function to fetch reasons and create a map
  const fetchAllReasons = useCallback(async () => {
    try {
      const reasonRes = await fetchReasons();
      const reasonsData = reasonRes.data || reasonRes;
      
      // Create a map of reason_id -> reason text
      const reasonsMap = new Map();
      if (Array.isArray(reasonsData)) {
        reasonsData.forEach(reason => {
          reasonsMap.set(String(reason.id), reason.reason);
        });
      }
      setReasonsMap(reasonsMap);
      return reasonsMap;
    } catch (error) {
      console.error("Error fetching reasons:", error);
      return new Map();
    }
  }, []);

  // Function to fetch all work orders
  const fetchAllWorkOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { page, limit } = pagination;
      const response = await fetchWorkOrdersLaravel({ page, limit });
      
      // Check if response is array directly or has data property
      let recordsData = [];
      let total = 0;
      
      if (Array.isArray(response)) {
        recordsData = response;
        total = response.length;
      } else if (response && Array.isArray(response.data)) {
        recordsData = response.data;
        total = response.total || response.data.length;
      } else {
        // Handle other structures
        recordsData = [];
        total = 0;
      }
      
      setAllRecords(recordsData);
      setFilteredRecords(recordsData); // Initially show all records
      setPagination((prev) => ({ ...prev, totalRows: total }));
    } catch (error) {
      console.error("Fetch error:", error);
      setError(
        error?.response?.data?.message ||
          "Something went wrong while fetching work orders."
      );
      showToast("Failed to fetch work orders.", "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, showToast]);

  useEffect(() => {
    fetchAllWorkOrders();
    fetchAllReasons();
  }, [fetchAllWorkOrders, fetchAllReasons]);

  // Function to apply filters locally
  const applyFilters = useCallback((filters) => {
    if (!allRecords.length) return;
    
    console.log("🔍 Applying filters:", filters);
    
    let result = [...allRecords];
    
    // Apply each filter if it exists
    if (filters.sbu_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'sbu_id')) === String(filters.sbu_id)
      );
    }
    
    if (filters.link_type_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'link_type_id')) === String(filters.link_type_id)
      );
    }
    
    if (filters.aggregator_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'aggregator_id')) === String(filters.aggregator_id)
      );
    }
    
    if (filters.kam_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'kam_id')) === String(filters.kam_id)
      );
    }
    
    if (filters.nttn_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'nttn_id')) === String(filters.nttn_id)
      );
    }
    
    if (filters.client_category) {
      result = result.filter(record => 
        String(getNestedValue(record, 'cat_name')) === String(filters.client_category)
      );
    }
    
    if (filters.client_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'client_id')) === String(filters.client_id)
      );
    }
    
    if (filters.requested_delivery) {
      result = result.filter(record => {
        const deliveryDate = record.requested_delivery;
        if (!deliveryDate) return false;
        return deliveryDate.includes(filters.requested_delivery);
      });
    }
    
    if (filters.service_handover) {
      result = result.filter(record => {
        const handoverDate = record.service_handover;
        if (!handoverDate) return false;
        return handoverDate.includes(filters.service_handover);
      });
    }


    if (filters.client_lat) {
        result = result.filter(record => {
            const clientLat = getNestedValue(record, 'client_lat') || record.client_lat;
            return String(clientLat) === String(filters.client_lat);
        });
    }
    
    // Client Longitude filter (exact match)
    if (filters.client_long) {
        result = result.filter(record => {
            const clientLong = getNestedValue(record, 'client_long') || record.client_long;
            return String(clientLong) === String(filters.client_long);
        });
    }
    
    // Client ID filter (from API)
    if (filters.client_id) {
        result = result.filter(record => 
            String(getNestedValue(record, 'client_id')) === String(filters.client_id)
        );
    }



     // NTTN Work Order ID filter (Link/SCR ID)
    if (filters.nttn_work_order_id) {
        result = result.filter(record => {
            const nttnWorkOrderId = record.nttn_work_order_id;
            return String(nttnWorkOrderId) === String(filters.nttn_work_order_id);
        });
    }
    
    // NTTN Survey ID filter (NTTN Provider ID)
    if (filters.nttn_survey_id) {
        result = result.filter(record => {
            const nttnSurveyId = record.nttn_survey_id;
            return String(nttnSurveyId) === String(filters.nttn_survey_id);
        });
    }
    
    // Date range filters for requested delivery
    if (filters.requested_delivery_from || filters.requested_delivery_to) {
        result = result.filter(record => {
            const recordDate = record.requested_delivery;
            if (!recordDate) return false;
            
            const recordDateObj = new Date(recordDate);
            
            if (filters.requested_delivery_from) {
                const fromDate = new Date(filters.requested_delivery_from);
                if (recordDateObj < fromDate) return false;
            }
            
            if (filters.requested_delivery_to) {
                const toDate = new Date(filters.requested_delivery_to);
                if (recordDateObj > toDate) return false;
            }
            
            return true;
        });
    }
    
    console.log(`✅ Filtered from ${allRecords.length} to ${result.length} records`);
    setFilteredRecords(result);
    setPagination(prev => ({ ...prev, page: 1, totalRows: result.length }));
    setActiveFilters(filters);
}, [allRecords]);

  // Handle filter change from WorkOrderFilterMenu
  const handleFilterChange = useCallback((filters) => {
    console.log("🎯 Filters received from WorkOrderFilterMenu:", filters);
    applyFilters(filters);
  }, [applyFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilteredRecords(allRecords);
    setActiveFilters({});
    setPagination(prev => ({ ...prev, page: 1, totalRows: allRecords.length }));
  }, [allRecords]);

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
    setFormState({
      isOpen: false,
      isEditMode: false,
      editingRecordId: null,
      initialValues: defaultInitialValues,
    });
  };

  const handleEdit = useCallback(async (item) => {
    setFormState((prev) => ({ ...prev, isLoading: true }));
    try {
      console.log('📡 Fetching work order data for ID:', item.id);
      const workOrderData = await fetchWorkOrderLaravel(item.id);
      console.log('✅ Work order data received:', workOrderData);
      
      const workOrder = workOrderData.data || workOrderData;
      
      // In edit mode, DO NOT fetch survey data - keep existing work order data
      // We explicitly skip calling survey APIs
      
      // Prepare initial values - ensure status is included
      const initialValues = {
        ...workOrder,
        // Keep existing survey data from the work order
        nttn_survey_id: workOrder.nttn_survey_id || '',
        nttn_lat: workOrder.nttn_lat || '',
        nttn_long: workOrder.nttn_long || '',
        client_lat: workOrder.client_lat || '',
        client_long: workOrder.client_long || '',
        
        reason_id: workOrder.reason_id ? String(workOrder.reason_id) : '',
        // Map rate to unit_rate for form
        unit_rate: workOrder.rate || '',
        // Calculate total cost for form
        total_cost_of_request_capacity: workOrder.request_capacity && workOrder.rate 
          ? (parseFloat(workOrder.request_capacity) * parseFloat(workOrder.rate)).toFixed(2)
          : '',
        // Make sure status is explicitly included
        status: workOrder.status || 'active',
      };
      
      console.log('📝 Initial values for edit (keeping existing data):', initialValues);
      
      setFormState({
        isOpen: true,
        isEditMode: true,
        editingRecordId: item.id,
        initialValues,
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ Error fetching work order:', error);
      showToast("Failed to load work order!", "error");
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [showToast]);

  const handleSubmit = async (values) => {
    const { isEditMode, editingRecordId } = formState;
    
    console.log('🚀 Submitting form values:', values);
    console.log('📋 Status value being sent:', values.status);
    console.log('📋 Reason value being sent:', values.reason_id);
    
    try {
      if (isEditMode) {
        const response = await updateWorkOrderLaravel(editingRecordId, values);
        console.log('✅ Update response:', response);
        showToast("Updated successfully!", "success");
      } else {
        await createWorkOrderLaravel(values);
        showToast("Created successfully!", "success");
      }
      fetchAllWorkOrders(); // Refresh data
      closeForm();
    } catch (error) {
      console.error("Submit error:", error);
      console.error("Error response:", error.response);
      const errorMessage = error?.response?.data?.message || "Save failed!";
      showToast(errorMessage, "error");
    }
  };

  // Function to get reason text from reason_id
  const getReasonText = useCallback((reasonId) => {
    if (!reasonId) return "N/A";
    return reasonsMap.get(String(reasonId)) || reasonId;
  }, [reasonsMap]);

  // Function to calculate total cost from rate and request_capacity
  const calculateTotalCost = useCallback((record) => {
    const requestCapacity = parseFloat(record.request_capacity) || 0;
    const rate = parseFloat(record.rate) || 0;
    
    // If total_cost_of_request_capacity already exists, use it
    if (record.total_cost_of_request_capacity) {
      return parseFloat(record.total_cost_of_request_capacity).toFixed(2);
    }
    
    // Otherwise calculate: request_capacity * rate
    return (requestCapacity * rate).toFixed(2);
  }, []);

  // Dynamic dropdowns for filter menu
  const dynamicOptions = useMemo(() => {
    return {
      sbu: getUniqueOptionsWithIds(allRecords, "sbu_name", "sbu_id"),
      link_type: getUniqueOptionsWithIds(allRecords, "type_name", "link_type_id"),
      aggregator: getUniqueOptionsWithIds(
        allRecords,
        "aggregator_name",
        "aggregator_id"
      ),
      kam: getUniqueOptionsWithIds(allRecords, "kam_name", "kam_id"),
      nttn: getUniqueOptionsWithIds(allRecords, "nttn_name", "nttn_id"),
      client: getUniqueOptionsWithIds(allRecords, "client_name", "client_id"),
      client_category: getUniqueOptions(allRecords, "cat_name"),
      status: getUniqueOptions(allRecords, "status"),
      reason: getUniqueOptions(allRecords, "reason_id").map(option => ({
        ...option,
        label: getReasonText(option.value)
      })),
    };
  }, [allRecords, getReasonText]);

  // Updated Columns with proper rate and total cost calculations
  const workOrderColumns = useMemo(
    () => [
      { key: "sbu_name", header: "SBU" },
      { key: "type_name", header: "Link Type" },
      { key: "aggregator_name", header: "Aggregator" },
      { key: "kam_name", header: "KAM" },
      { key: "nttn_name", header: "NTTN" },
      { key: "client_name", header: "Client" },
      { key: "cat_name", header: "Category" },
      { key: "thana_name", header: "Thana" },
      { key: "district_name", header: "District" },
      { key: "division_name", header: "Division" },
      { key: "nttn_survey_id", header: "NTTN Survey ID" },
      { key: "nttn_lat", header: "NTTN LAT" },
      { key: "nttn_long", header: "NTTN LONG" },
      { key: "client_lat", header: "Client LAT" },
      { key: "client_long", header: "Client LONG" },
      { key: "mac_user", header: "MAC User" },
      { key: "nttn_work_order_id", header: "NTTN Link ID" },
      { key: "work_order_mac_user", header: "Work Order MAC User" },
      { 
        key: "request_capacity", 
        header: "Request Capacity",
        render: (val) => val ? `${val} Mbps` : "0 Mbps"
      },
      { 
        key: "rate", 
        header: "Unit Rate",
        render: (val) => val ? `$${parseFloat(val).toFixed(2)}` : "$0.00"
      },
      { 
        key: "total_cost_of_request_capacity", 
        header: "Total Cost",
        render: (val, row) => {
          const totalCost = calculateTotalCost(row);
          return `$${totalCost}`;
        }
      },
      { key: "vlan", header: "VLAN" },
      {
        key: "requested_delivery",
        header: "Requested Delivery",
        render: (val) =>
          val ? moment(val).format("YYYY-MM-DD") : "Not Assigned",
      },
      {
        key: "service_handover",
        header: "Service Handover",
        render: (val) =>
          val ? moment(val).format("YYYY-MM-DD") : "Not Assigned",
      },
      {
        key: "submission",
        header: "Submission Date",
        render: (val) =>
          val ? moment(val).format("YYYY-MM-DD") : "Not Assigned",
      },
      { key: "remarks", header: "Remarks" },
      { 
        key: "reason_id", 
        header: "Reason",
        render: (val) => getReasonText(val)
      },
      { 
        key: "status", 
        header: "Status",
        render: (val) => val ? val.charAt(0).toUpperCase() + val.slice(1) : "N/A"
      },
      { key: "posted_by", header: "Posted By" },
      {
        key: "actions",
        header: "Action",
        render: (value, row) => (
          <Button
            variant="icon"
            size="sm"
            onClick={() => handleEdit(row)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [handleEdit, calculateTotalCost, getReasonText]
  );

  // DataTable onFilterChange handler (for pagination)
  const handleTableFilterChange = useCallback((newTableState) => {
    const { page, pageSize } = newTableState;
    setPagination(prev => ({ 
      ...prev, 
      page: page || prev.page, 
      limit: pageSize || prev.limit 
    }));
  }, []);

  if (formState.isOpen) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        {formState.isLoading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <p>Loading form...</p>
          </div>
        ) : (
          <WorkOrderForm
            initialValues={formState.initialValues}
            isEditMode={formState.isEditMode}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        )}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center pb-16">
        <div>
          <h1 className="text-2xl font-bold">Work Orders</h1>
          <p className="text-gray-500">
            View and manage the list of work orders.
          </p>
          {/* Show active filters count */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{filteredRecords.length}</span> records filtered
              <button 
                onClick={clearFilters}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={filteredRecords}
            columns={workOrderColumns}
            fileName="work_orders"
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
            Add Work Order
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <p>Loading work orders...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <DataTable
          data={filteredRecords}
          columns={workOrderColumns}
          searchable
          showId
          filterComponent={
            <WorkOrderFilterMenu
              records={allRecords} // Pass all records for filter options
              onFilterChange={handleFilterChange} // This handles frontend filtering
            />
          }
          isBackendPagination={false} // Frontend pagination since we're filtering locally
          totalRows={filteredRecords.length}
          page={pagination.page}
          pageSize={pagination.limit}
          onFilterChange={handleTableFilterChange} // Only for pagination
          setPage={(page) => setPagination(p => ({ ...p, page }))}
          setPageSize={(limit) => setPagination(p => ({ ...p, limit, page: 1 }))}
          scrollable
          maxHeight="600px"
          stickyHeader
          selection={false}
          pageSizeOptions={[10, 25, 50, 100]}
          initialPageSize={10}
        />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default WorkOrder;