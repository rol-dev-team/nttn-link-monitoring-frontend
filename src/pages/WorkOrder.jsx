// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import { Plus, Pencil } from "lucide-react";
// import Button from "../components/ui/Button";
// import WorkOrderForm from "../components/work-order/WorkOrderForm";
// import DataTable from "../components/table/DataTable";
// import ToastContainer from "../components/ui/ToastContainer";
// import { FaFileExcel } from "react-icons/fa";
// import ExportButton from "../components/ui/ExportButton";
// import SelectField from "../components/fields/SelectField";
// import DateField from "../components/fields/DateField";
// import WorkOrderFilterMenu from "../components/work-order/WorkOrderFilterMenu";
// import {
//   createWorkOrderLaravel,
//   fetchWorkOrdersLaravel,
//   fetchWorkOrder,
//   updateWorkOrderLaravel,fetchWorkOrderLaravel,
// } from "../services/workOrder";
// import moment from "moment";

// // ✅ Helper to extract unique options
// const getUniqueOptions = (records, key) => {
//   const uniqueValues = new Set();
//   records.forEach((record) => {
//     const value = record[key];
//     if (value !== null && value !== undefined && String(value).trim() !== "") {
//       uniqueValues.add(String(value).trim());
//     }
//   });
//   return Array.from(uniqueValues)
//     .sort()
//     .map((value) => ({
//       label: value,
//       value: value,
//     }));
// };

// // ✅ Helper: Maps label ↔ id for foreign keys
// const getUniqueOptionsWithIds = (records, nameKey, idKey) => {
//   const uniqueMap = new Map();
//   records.forEach((record) => {
//     const name = record[nameKey];
//     const id = record[idKey];
//     if (name && id) {
//       uniqueMap.set(name, id);
//     }
//   });
//   return Array.from(uniqueMap.entries())
//     .sort()
//     .map(([label, value]) => ({ label, value }));
// };

// const defaultInitialValues = {
//   sbu_id: null,
//   link_type_id: null,
//   aggregator_id: null,
//   kam_id: null,
//   nttn_id: null,
//   nttn_survey_id: "",
//   nttn_lat: "",
//   nttn_long: "",
//   client_lat: null,
//   client_long: null,
//   client_id: null,
//   mac_user: "",
//   nttn_work_order_id: "",
//   request_capacity: "",
//   remarks: "",
//   requested_delivery: "",
//   service_handover: "",
// };

// const WorkOrder = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [toasts, setToasts] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     totalRows: 0,
//   });

//   const [formState, setFormState] = useState({
//     isOpen: false,
//     isEditMode: false,
//     editingRecordId: null,
//     initialValues: defaultInitialValues,
//     isLoading: false,
//   });

//   const showToast = useCallback((message, type) => {
//     const newToast = { id: Date.now(), message, type };
//     setToasts((currentToasts) => [...currentToasts, newToast]);
//     setTimeout(
//       () =>
//         setToasts((currentToasts) =>
//           currentToasts.filter((t) => t.id !== newToast.id)
//         ),
//       4000
//     );
//   }, []);

//   const removeToast = (id) =>
//     setToasts((toasts) => toasts.filter((t) => t.id !== id));

//   const fetchAllWorkOrders = useCallback(async (currentFilters = {}) => {
//     setLoading(true);
//     try {
//       const { page, limit } = pagination;
//       const allFilters = { ...currentFilters, page, limit };
//       const { data: recordsData, totalCount: total } =
//         await fetchWorkOrdersLaravel(allFilters);
//       setRecords(recordsData);
//       setPagination((prev) => ({ ...prev, totalRows: total }));
//     } catch (error) {
//       console.error("Fetch error:", error);
//       setError(
//         error?.response?.data?.message ||
//           "Something went wrong while fetching work orders."
//       );
//       showToast("Failed to fetch work orders.", "error");
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, showToast]);

//   useEffect(() => {
//     fetchAllWorkOrders(filters);
//   }, [filters, fetchAllWorkOrders]);

//   const openNewForm = () => {
//     setFormState({
//       isOpen: true,
//       isEditMode: false,
//       editingRecordId: null,
//       initialValues: defaultInitialValues,
//       isLoading: false,
//     });
//   };

//   const closeForm = () => {
//     setFormState({
//       isOpen: false,
//       isEditMode: false,
//       editingRecordId: null,
//       initialValues: defaultInitialValues,
//     });
//   };

//   const handleEdit = async (item) => {
//     setFormState((prev) => ({ ...prev, isLoading: true }));
//     try {
//       const workOrderData = await fetchWorkOrderLaravel(item.id);
//       setFormState({
//         isOpen: true,
//         isEditMode: true,
//         editingRecordId: item.id,
//         initialValues: workOrderData,
//         isLoading: false,
//       });
//     } catch (error) {
//       showToast("Failed to load work order!", "error");
//       setFormState((prev) => ({ ...prev, isLoading: false }));
//     }
//   };

//   const handleSubmit = async (values) => {
//     const { isEditMode, editingRecordId } = formState;
//     try {
//       if (isEditMode) {
//         await updateWorkOrderLaravel(editingRecordId, values);
//         showToast("Updated successfully!", "success");
//       } else {
//         await createWorkOrderLaravel(values);
//         showToast("Created successfully!", "success");
//       }
//       fetchAllWorkOrders(filters);
//       closeForm();
//     } catch (error) {
//       console.error("Submit error:", error);
//       showToast("Save failed!", "error");
//     }
//   };

//   const handleFilterChange = useCallback((newTableState) => {
//     const { page, limit, ...otherFilters } = newTableState;
//     setFilters(otherFilters);
//     setPagination((prev) => ({ ...prev, page: 1 }));
//   }, []);

//   // ✅ Dynamic dropdowns
//   const dynamicOptions = useMemo(() => {
//     return {
//       sbu: getUniqueOptionsWithIds(records, "sbu_name", "sbu_id"),
//       link_type: getUniqueOptionsWithIds(records, "type_name", "link_type_id"),
//       aggregator: getUniqueOptionsWithIds(
//         records,
//         "aggregator_name",
//         "aggregator_id"
//       ),
//       kam: getUniqueOptionsWithIds(records, "kam_name", "kam_id"),
//       nttn: getUniqueOptionsWithIds(records, "nttn_name", "nttn_id"),
//       client: getUniqueOptionsWithIds(records, "client_name", "client_id"),
//       client_category: getUniqueOptions(records, "cat_name"),
//       status: getUniqueOptions(records, "status"),
//     };
//   }, [records]);

//   // ✅ Updated Columns for flat data
//   const workOrderColumns = useMemo(
//     () => [
//       { key: "sbu_name", header: "SBU" },
//       { key: "type_name", header: "Link Type" },
//       { key: "aggregator_name", header: "Aggregator" },
//       { key: "kam_name", header: "KAM" },
//       { key: "nttn_name", header: "NTTN" },
//       { key: "client_name", header: "Client" },
//       { key: "cat_name", header: "Category" },
//       { key: "thana_name", header: "Thana" },
//       { key: "district_name", header: "District" },
//       { key: "division_name", header: "Division" },
//       { key: "nttn_survey_id", header: "NTTN Survey ID" },
//       { key: "nttn_lat", header: "NTTN LAT" },
//       { key: "nttn_long", header: "NTTN LONG" },
//       { key: "client_lat", header: "Client LAT" },
//       { key: "client_long", header: "Client LONG" },
//       { key: "mac_user", header: "MAC User" },
//       { key: "nttn_work_order_id", header: "NTTN Link ID" },
//       { key: "request_capacity", header: "Request Capacity" },
//       {
//         key: "requested_delivery",
//         header: "Requested Delivery",
//         render: (val) =>
//           val ? moment(val).format("YYYY-MM-DD") : "Not Assigned",
//       },
//       {
//         key: "service_handover",
//         header: "Service Handover",
//         render: (val) =>
//           val ? moment(val).format("YYYY-MM-DD") : "Not Assigned",
//       },
//       { key: "remarks", header: "Remarks" },
//       {
//         key: "actions",
//         header: "Action",
//         render: (value, row) => (
//           <Button
//             variant="icon"
//             size="sm"
//             onClick={() => handleEdit(row)}
//             title="Edit"
//           >
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
//         {formState.isLoading ? (
//           <div className="flex justify-center items-center py-20 text-gray-500">
//             <p>Loading form...</p>
//           </div>
//         ) : (
//           <WorkOrderForm
//             initialValues={formState.initialValues}
//             isEditMode={formState.isEditMode}
//             onSubmit={handleSubmit}
//             onCancel={closeForm}
//           />
//         )}
//         <ToastContainer toasts={toasts} removeToast={removeToast} />
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 bg-gray-100 min-h-screen">
//       <div className="flex justify-between items-center pb-16">
//         <div>
//           <h1 className="text-2xl font-bold">Work Orders</h1>
//           <p className="text-gray-500">
//             View and manage the list of work orders.
//           </p>
//         </div>
//         <div className="flex items-center gap-4">
//           <ExportButton
//             data={records}
//             columns={workOrderColumns}
//             fileName="work_orders"
//             intent="primary"
//             leftIcon={FaFileExcel}
//             className="text-white bg-green-700 hover:bg-green-800 border-none"
//           >
//             Export
//           </ExportButton>
//           <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
//             Add Work Order
//           </Button>
//         </div>
//       </div>
//       {loading ? (
//         <div className="flex justify-center items-center py-20 text-gray-500">
//           <p>Loading work orders...</p>
//         </div>
//       ) : error ? (
//         <div className="flex justify-center items-center py-20 text-red-500">
//           <p>Error: {error}</p>
//         </div>
//       ) : (
//         <DataTable
//           data={records}
//           columns={workOrderColumns}
//           searchable
//           showId
//           filterComponent={
//             <WorkOrderFilterMenu
//               records={records}
//               onFilterChange={handleFilterChange}
//             />
//           }
//           isBackendPagination
//           totalRows={pagination.totalRows}
//           page={pagination.page}
//           pageSize={pagination.limit}
//           onFilterChange={handleFilterChange}
//           setPage={(page) => setPagination((p) => ({ ...p, page }))}
//           setPageSize={(limit) => setPagination((p) => ({ ...p, limit, page: 1 }))}
//           scrollable
//           maxHeight="600px"
//           stickyHeader
//           selection={false}
//           pageSizeOptions={[10, 25, 50, 100]}
//           initialPageSize={10}
//         />
//       )}
//       <ToastContainer toasts={toasts} removeToast={removeToast} />
//     </div>
//   );
// };

// export default WorkOrder;




// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import { Plus, Pencil } from "lucide-react";
// import Button from "../components/ui/Button";
// import WorkOrderForm from "../components/work-order/WorkOrderForm";
// import DataTable from "../components/table/DataTable";
// import ToastContainer from "../components/ui/ToastContainer";
// import { FaFileExcel } from "react-icons/fa";
// import ExportButton from "../components/ui/ExportButton";
// import SelectField from "../components/fields/SelectField";
// import DateField from "../components/fields/DateField";
// import WorkOrderFilterMenu from "../components/work-order/WorkOrderFilterMenu";
// import {
//   createWorkOrderLaravel,
//   fetchWorkOrdersLaravel,
//   fetchWorkOrder,
//   updateWorkOrderLaravel,
//   fetchWorkOrderLaravel,
// } from "../services/workOrder";
// import moment from "moment";

// // ✅ Helper to extract unique options
// const getUniqueOptions = (records, key) => {
//   const uniqueValues = new Set();
//   records.forEach((record) => {
//     const value = record[key];
//     if (value !== null && value !== undefined && String(value).trim() !== "") {
//       uniqueValues.add(String(value).trim());
//     }
//   });
//   return Array.from(uniqueValues)
//     .sort()
//     .map((value) => ({
//       label: value,
//       value: value,
//     }));
// };

// // ✅ Helper: Maps label ↔ id for foreign keys
// const getUniqueOptionsWithIds = (records, nameKey, idKey) => {
//   const uniqueMap = new Map();
//   records.forEach((record) => {
//     const name = record[nameKey];
//     const id = record[idKey];
//     if (name && id) {
//       uniqueMap.set(name, id);
//     }
//   });
//   return Array.from(uniqueMap.entries())
//     .sort()
//     .map(([label, value]) => ({ label, value }));
// };

// const defaultInitialValues = {
//   sbu_id: "",
//   link_type_id: "",
//   aggregator_id: "",
//   kam_id: "",
//   nttn_id: "",
//   nttn_survey_id: "",
//   nttn_lat: "",
//   nttn_long: "",
//   client_lat: "",
//   client_long: "",
//   client_id: "",
//   mac_user: "",
//   nttn_link_id: "",
//   work_order_mac_user: "",
//   request_capacity: "",
//   total_cost_of_request_capacity: "",
//   unit_rate: "",
//   rate_id: "",
//   vlan: "",
//   remarks: "",
//   requested_delivery: "",
//   service_handover: "",
//   submition: "",
//   status: "active",
//   posted_by: "",
// };

// const WorkOrder = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [toasts, setToasts] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     totalRows: 0,
//   });

//   const [formState, setFormState] = useState({
//     isOpen: false,
//     isEditMode: false,
//     editingRecordId: null,
//     initialValues: defaultInitialValues,
//     isLoading: false,
//   });

//   const showToast = useCallback((message, type) => {
//     const newToast = { id: Date.now(), message, type };
//     setToasts((currentToasts) => [...currentToasts, newToast]);
//     setTimeout(
//       () =>
//         setToasts((currentToasts) =>
//           currentToasts.filter((t) => t.id !== newToast.id)
//         ),
//       4000
//     );
//   }, []);

//   const removeToast = (id) =>
//     setToasts((toasts) => toasts.filter((t) => t.id !== id));

//   const fetchAllWorkOrders = useCallback(async (currentFilters = {}) => {
//     setLoading(true);
//     try {
//       const { page, limit } = pagination;
//       const allFilters = { ...currentFilters, page, limit };
//       const { data: recordsData, totalCount: total } =
//         await fetchWorkOrdersLaravel(allFilters);
//       setRecords(recordsData);
//       setPagination((prev) => ({ ...prev, totalRows: total }));
//     } catch (error) {
//       console.error("Fetch error:", error);
//       setError(
//         error?.response?.data?.message ||
//           "Something went wrong while fetching work orders."
//       );
//       showToast("Failed to fetch work orders.", "error");
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, showToast]);

//   useEffect(() => {
//     fetchAllWorkOrders(filters);
//   }, [filters, fetchAllWorkOrders]);

//   const openNewForm = () => {
//     setFormState({
//       isOpen: true,
//       isEditMode: false,
//       editingRecordId: null,
//       initialValues: defaultInitialValues,
//       isLoading: false,
//     });
//   };

//   const closeForm = () => {
//     setFormState({
//       isOpen: false,
//       isEditMode: false,
//       editingRecordId: null,
//       initialValues: defaultInitialValues,
//     });
//   };

//   const handleEdit = useCallback(async (item) => {
//     setFormState((prev) => ({ ...prev, isLoading: true }));
//     try {
//       console.log('📡 Fetching work order data for ID:', item.id);
//       const workOrderData = await fetchWorkOrderLaravel(item.id);
//       console.log('✅ Work order data received:', workOrderData);
      
//       // Ensure we have the data object
//       const workOrder = workOrderData.data || workOrderData;
      
//       setFormState({
//         isOpen: true,
//         isEditMode: true,
//         editingRecordId: item.id,
//         initialValues: workOrder,
//         isLoading: false,
//       });
//     } catch (error) {
//       console.error('❌ Error fetching work order:', error);
//       showToast("Failed to load work order!", "error");
//       setFormState((prev) => ({ ...prev, isLoading: false }));
//     }
//   }, [showToast]);

//   const handleSubmit = async (values) => {
//     const { isEditMode, editingRecordId } = formState;
//     try {
//       console.log('🚀 Submitting form values:', values);
//       if (isEditMode) {
//         await updateWorkOrderLaravel(editingRecordId, values);
//         showToast("Updated successfully!", "success");
//       } else {
//         await createWorkOrderLaravel(values);
//         showToast("Created successfully!", "success");
//       }
//       fetchAllWorkOrders(filters);
//       closeForm();
//     } catch (error) {
//       console.error("Submit error:", error);
//       const errorMessage = error?.response?.data?.message || "Save failed!";
//       showToast(errorMessage, "error");
//     }
//   };

//   const handleFilterChange = useCallback((newTableState) => {
//     const { page, limit, ...otherFilters } = newTableState;
//     setFilters(otherFilters);
//     setPagination((prev) => ({ ...prev, page: 1 }));
//   }, []);

//   // ✅ Dynamic dropdowns
//   const dynamicOptions = useMemo(() => {
//     return {
//       sbu: getUniqueOptionsWithIds(records, "sbu_name", "sbu_id"),
//       link_type: getUniqueOptionsWithIds(records, "type_name", "link_type_id"),
//       aggregator: getUniqueOptionsWithIds(
//         records,
//         "aggregator_name",
//         "aggregator_id"
//       ),
//       kam: getUniqueOptionsWithIds(records, "kam_name", "kam_id"),
//       nttn: getUniqueOptionsWithIds(records, "nttn_name", "nttn_id"),
//       client: getUniqueOptionsWithIds(records, "client_name", "client_id"),
//       client_category: getUniqueOptions(records, "cat_name"),
//       status: getUniqueOptions(records, "status"),
//     };
//   }, [records]);

//   // ✅ Updated Columns for flat data
//   const workOrderColumns = useMemo(
//     () => [
//       { key: "sbu_name", header: "SBU" },
//       { key: "type_name", header: "Link Type" },
//       { key: "aggregator_name", header: "Aggregator" },
//       { key: "kam_name", header: "KAM" },
//       { key: "nttn_name", header: "NTTN" },
//       { key: "client_name", header: "Client" },
//       { key: "cat_name", header: "Category" },
//       { key: "thana_name", header: "Thana" },
//       { key: "district_name", header: "District" },
//       { key: "division_name", header: "Division" },
//       { key: "nttn_survey_id", header: "NTTN Survey ID" },
//       { key: "nttn_lat", header: "NTTN LAT" },
//       { key: "nttn_long", header: "NTTN LONG" },
//       { key: "client_lat", header: "Client LAT" },
//       { key: "client_long", header: "Client LONG" },
//       { key: "mac_user", header: "MAC User" },
//       { key: "nttn_link_id", header: "NTTN Link ID" },
//       { key: "work_order_mac_user", header: "Work Order MAC User" },
//       { key: "request_capacity", header: "Request Capacity" },
//       { key: "total_cost_of_request_capacity", header: "Total Cost" },
//       { key: "unit_rate", header: "Unit Rate" },
//       { key: "vlan", header: "VLAN" },
//       {
//         key: "requested_delivery",
//         header: "Requested Delivery",
//         render: (val) =>
//           val ? moment(val).format("YYYY-MM-DD") : "Not Assigned",
//       },
//       {
//         key: "service_handover",
//         header: "Service Handover",
//         render: (val) =>
//           val ? moment(val).format("YYYY-MM-DD") : "Not Assigned",
//       },
//       {
//         key: "submition",
//         header: "Submission Date",
//         render: (val) =>
//           val ? moment(val).format("YYYY-MM-DD") : "Not Assigned",
//       },
//       { key: "remarks", header: "Remarks" },
//       { key: "status", header: "Status" },
//       { key: "posted_by", header: "Posted By" },
//       {
//         key: "actions",
//         header: "Action",
//         render: (value, row) => (
//           <Button
//             variant="icon"
//             size="sm"
//             onClick={() => handleEdit(row)}
//             title="Edit"
//           >
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
//         {formState.isLoading ? (
//           <div className="flex justify-center items-center py-20 text-gray-500">
//             <p>Loading form...</p>
//           </div>
//         ) : (
//           <WorkOrderForm
//             initialValues={formState.initialValues}
//             isEditMode={formState.isEditMode}
//             onSubmit={handleSubmit}
//             onCancel={closeForm}
//           />
//         )}
//         <ToastContainer toasts={toasts} removeToast={removeToast} />
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 bg-gray-100 min-h-screen">
//       <div className="flex justify-between items-center pb-16">
//         <div>
//           <h1 className="text-2xl font-bold">Work Orders</h1>
//           <p className="text-gray-500">
//             View and manage the list of work orders.
//           </p>
//         </div>
//         <div className="flex items-center gap-4">
//           <ExportButton
//             data={records}
//             columns={workOrderColumns}
//             fileName="work_orders"
//             intent="primary"
//             leftIcon={FaFileExcel}
//             className="text-white bg-green-700 hover:bg-green-800 border-none"
//           >
//             Export
//           </ExportButton>
//           <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
//             Add Work Order
//           </Button>
//         </div>
//       </div>
//       {loading ? (
//         <div className="flex justify-center items-center py-20 text-gray-500">
//           <p>Loading work orders...</p>
//         </div>
//       ) : error ? (
//         <div className="flex justify-center items-center py-20 text-red-500">
//           <p>Error: {error}</p>
//         </div>
//       ) : (
//         <DataTable
//           data={records}
//           columns={workOrderColumns}
//           searchable
//           showId
//           filterComponent={
//             <WorkOrderFilterMenu
//               records={records}
//               onFilterChange={handleFilterChange}
//             />
//           }
//           isBackendPagination
//           totalRows={pagination.totalRows}
//           page={pagination.page}
//           pageSize={pagination.limit}
//           onFilterChange={handleFilterChange}
//           setPage={(page) => setPagination((p) => ({ ...p, page }))}
//           setPageSize={(limit) => setPagination((p) => ({ ...p, limit, page: 1 }))}
//           scrollable
//           maxHeight="600px"
//           stickyHeader
//           selection={false}
//           pageSizeOptions={[10, 25, 50, 100]}
//           initialPageSize={10}
//         />
//       )}
//       <ToastContainer toasts={toasts} removeToast={removeToast} />
//     </div>
//   );
// };

// export default WorkOrder;




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
import { fetchRatesByNttn } from "../services/rate";
import moment from "moment";

// ✅ Helper to extract unique options
const getUniqueOptions = (records, key) => {
  const uniqueValues = new Set();
  records.forEach((record) => {
    const value = record[key];
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
  const uniqueMap = new Map();
  records.forEach((record) => {
    const name = record[nameKey];
    const id = record[idKey];
    if (name && id) {
      uniqueMap.set(name, id);
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
  submition: "",
  status: "active",
  posted_by: "",
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
  const [ratesCache, setRatesCache] = useState(new Map()); // Cache for rates by NTTN ID

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

  // Function to fetch rates for a specific NTTN and cache them
  const fetchRatesForNttn = useCallback(async (nttnId) => {
    if (!nttnId || ratesCache.has(nttnId)) {
      return ratesCache.get(nttnId) || [];
    }

    try {
      console.log(`📡 Fetching rates for NTTN ID: ${nttnId}`);
      const rates = await fetchRatesByNttn(nttnId);
      const ratesData = rates.data || rates;
      
      // Update cache
      setRatesCache(prev => new Map(prev).set(nttnId, ratesData));
      return ratesData;
    } catch (error) {
      console.error(`❌ Error fetching rates for NTTN ${nttnId}:`, error);
      return [];
    }
  }, [ratesCache]);

  const fetchAllWorkOrders = useCallback(async (currentFilters = {}) => {
    setLoading(true);
    try {
      const { page, limit } = pagination;
      const allFilters = { ...currentFilters, page, limit };
      const { data: recordsData, totalCount: total } =
        await fetchWorkOrdersLaravel(allFilters);
      setRecords(recordsData);
      setPagination((prev) => ({ ...prev, totalRows: total }));

      // Pre-fetch rates for all unique NTTNs in the records
      const uniqueNttnIds = [...new Set(recordsData.map(record => record.nttn_id).filter(Boolean))];
      uniqueNttnIds.forEach(nttnId => {
        fetchRatesForNttn(nttnId);
      });
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
  }, [pagination.page, pagination.limit, showToast, fetchRatesForNttn]);

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
      
      // Ensure we have the data object
      const workOrder = workOrderData.data || workOrderData;
      
      setFormState({
        isOpen: true,
        isEditMode: true,
        editingRecordId: item.id,
        initialValues: workOrder,
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
    try {
      console.log('🚀 Submitting form values:', values);
      if (isEditMode) {
        await updateWorkOrderLaravel(editingRecordId, values);
        showToast("Updated successfully!", "success");
      } else {
        await createWorkOrderLaravel(values);
        showToast("Created successfully!", "success");
      }
      fetchAllWorkOrders(filters);
      closeForm();
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage = error?.response?.data?.message || "Save failed!";
      showToast(errorMessage, "error");
    }
  };

  const handleFilterChange = useCallback((newTableState) => {
    const { page, limit, ...otherFilters } = newTableState;
    setFilters(otherFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // ✅ Function to calculate rates for table display (same logic as WorkOrderForm)
  const calculateTableRates = useCallback((record) => {
    const requestCapacity = parseFloat(record.request_capacity) || 0;
    
    // If unit_rate and total_cost are already available in the record, use them
    if (record.unit_rate && record.total_cost_of_request_capacity) {
      return {
        unitRate: parseFloat(record.unit_rate).toFixed(2),
        totalCost: parseFloat(record.total_cost_of_request_capacity).toFixed(2),
        rateId: record.rate_id || "N/A"
      };
    }

    // Calculate based on cached rates data
    if (record.nttn_id && requestCapacity > 0) {
      const nttnRates = ratesCache.get(record.nttn_id) || [];
      
      // Find matching rate based on bandwidth range (same logic as WorkOrderForm)
      const matchingRate = nttnRates.find(rate => {
        const rangeFrom = parseInt(rate.bw_range_from);
        const rangeTo = parseInt(rate.bw_range_to);
        return requestCapacity >= rangeFrom && requestCapacity <= rangeTo;
      });

      if (matchingRate) {
        const unitRate = parseFloat(matchingRate.rate);
        const totalCost = requestCapacity * unitRate;
        return {
          unitRate: unitRate.toFixed(2),
          totalCost: totalCost.toFixed(2),
          rateId: matchingRate.id
        };
      }
    }

    // If no rates found or no calculation possible, show stored values or zeros
    return {
      unitRate: record.unit_rate ? parseFloat(record.unit_rate).toFixed(2) : "0.00",
      totalCost: record.total_cost_of_request_capacity ? parseFloat(record.total_cost_of_request_capacity).toFixed(2) : "0.00",
      rateId: record.rate_id || "N/A"
    };
  }, [ratesCache]);

  // ✅ Dynamic dropdowns
  const dynamicOptions = useMemo(() => {
    return {
      sbu: getUniqueOptionsWithIds(records, "sbu_name", "sbu_id"),
      link_type: getUniqueOptionsWithIds(records, "type_name", "link_type_id"),
      aggregator: getUniqueOptionsWithIds(
        records,
        "aggregator_name",
        "aggregator_id"
      ),
      kam: getUniqueOptionsWithIds(records, "kam_name", "kam_id"),
      nttn: getUniqueOptionsWithIds(records, "nttn_name", "nttn_id"),
      client: getUniqueOptionsWithIds(records, "client_name", "client_id"),
      client_category: getUniqueOptions(records, "cat_name"),
      status: getUniqueOptions(records, "status"),
    };
  }, [records]);

  // ✅ Updated Columns with rate calculations
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
        key: "unit_rate", 
        header: "Unit Rate",
        render: (val, row) => {
          const rates = calculateTableRates(row);
          return `$${rates.unitRate}`;
        }
      },
      { 
        key: "total_cost_of_request_capacity", 
        header: "Total Cost",
        render: (val, row) => {
          const rates = calculateTableRates(row);
          return `$${rates.totalCost}`;
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
        key: "submition",
        header: "Submission Date",
        render: (val) =>
          val ? moment(val).format("YYYY-MM-DD") : "Not Assigned",
      },
      { key: "remarks", header: "Remarks" },
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
    [handleEdit, calculateTableRates]
  );

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
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={records}
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
          data={records}
          columns={workOrderColumns}
          searchable
          showId
          filterComponent={
            <WorkOrderFilterMenu
              records={records}
              onFilterChange={handleFilterChange}
            />
          }
          isBackendPagination
          totalRows={pagination.totalRows}
          page={pagination.page}
          pageSize={pagination.limit}
          onFilterChange={handleFilterChange}
          setPage={(page) => setPagination((p) => ({ ...p, page }))}
          setPageSize={(limit) => setPagination((p) => ({ ...p, limit, page: 1 }))}
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