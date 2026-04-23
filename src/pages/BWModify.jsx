// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import { Plus, Pencil } from 'lucide-react';
// import Button from '../components/ui/Button';
// import BWModificationForm from '../components/bwModify/BWModificationForm';
// import DataTable from '../components/table/DataTable';
// import ToastContainer from '../components/ui/ToastContainer';
// import { FaFileExcel } from 'react-icons/fa';
// import ExportButton from '../components/ui/ExportButton';
// import SelectField from '../components/fields/SelectField';
// import DateField from '../components/fields/DateField';
// import BWModificationFilterMenu from '../components/bwModify/BWModificationFilterMenu';
// import {
//   createBWModification,
//   fetchBWModifications,
//   updateBWModification,
// } from '../services/bwModification';
// import moment from 'moment';

// /* ---------- Helper functions ---------- */
// const getNestedValue = (obj, path) => {
//   return path.split('.').reduce((acc, part) => acc && acc[part], obj);
// };

// const getUniqueOptionsWithIds = (records, namePath, idPath) => {
//   const uniqueMap = new Map();
//   records.forEach((record) => {
//     const name = getNestedValue(record, namePath);
//     const id = getNestedValue(record, idPath);
//     if (name && id) {
//       uniqueMap.set(name, id);
//     }
//   });
//   return Array.from(uniqueMap.entries())
//     .sort()
//     .map(([name, id]) => ({
//       label: name,
//       value: id,
//     }));
// };

// const getUniqueOptions = (records, key) => {
//   const uniqueValues = new Set();
//   records.forEach((record) => {
//     const value = getNestedValue(record, key);
//     if (value !== null && value !== undefined && String(value).trim() !== '') {
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

// // Add modification type display helper function
// const getModificationTypeDisplay = (type) => {
//   switch (type) {
//     case '1':
//       return 'Upgrade';
//     case '2':
//       return 'Downgrade';
//     default:
//       return type || '-';
//   }
// };
// /* ----------------------------------------------------------- */

// const defaultInitialValues = {
//   id: '',
//   nttn_provider: null,
//   modification_type: '',
//   client_category: null,
//   client: null,
//   nttn_link_id: '',
//   capacity: '',
//   capacity_cost: '',
//   shifting_bw: '',
//   shifting_capacity: '',
//   shifting_unit_cost: '',
//   workorder: null,
// };

// const BWModify = () => {
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

//   const showToast = useCallback((message, type) => {
//     const newToast = { id: Date.now(), message, type };
//     setToasts((c) => [...c, newToast]);
//     setTimeout(() => setToasts((c) => c.filter((t) => t.id !== newToast.id)), 5000);
//   }, []);

//   const removeToast = (id) => setToasts((c) => c.filter((t) => t.id !== id));

//   /* ---------- Updated fetch function ---------- */
//   const fetchAllBWModifications = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     const { page, limit } = pagination;

//     // Prepare filters for API
//     const apiFilters = {
//       ...filters,
//       page: page,
//       limit: limit,
//     };

//     try {
//       const res = await fetchBWModifications(apiFilters);

//       // Handle different API response structures
//       let data = [];
//       let total = 0;

//       if (Array.isArray(res.data)) {
//         // If response has data array
//         data = res.data;
//         total = res.total || res.data.length;
//       } else if (Array.isArray(res)) {
//         // If response is directly an array
//         data = res;
//         total = res.length;
//       } else {
//         // Fallback
//         data = [];
//         total = 0;
//       }

//       // Preprocess data with proper field mapping
//       const preprocessedData = data.map((item) => ({
//         ...item,
//         // Map fields according to your database structure
//         nttn_provider_name: item.nttn_name || item.nttn_provider_details?.nttn_name || '-',
//         client_category_name: item.cat_name || item.client_category_details?.cat_name,
//         client_name: item.client_name || item.client_details?.client_name,
//         workorder_bw_capacity: item.workorder_details?.request_capacity,
//         workorder_id: item.workorder_row_id || item.workorder_details?.id,
//         modification_type: item.modification_type || '',
//         shifting_capacity: item.shifting_capacity || '',
//         shifting_unit_cost: item.shifting_unit_cost || '',
//         nttn_link_id: item.nttn_work_order_id || item.nttn_link_id || '', // Handle both field names
//       }));

//       setRecords(preprocessedData);
//       setPagination((prev) => ({ ...prev, totalRows: total }));
//     } catch (err) {
//       const msg = err?.response?.data?.message || 'Failed to fetch BW Modifications.';
//       setError(msg);
//       showToast(msg, 'error');
//     } finally {
//       setLoading(false);
//     }
//   }, [showToast, filters, pagination.page, pagination.limit]);

//   useEffect(() => {
//     fetchAllBWModifications();
//   }, [fetchAllBWModifications]);

//   /* ---------- form handling ---------- */
//   const [formState, setFormState] = useState({
//     isOpen: false,
//     isEditMode: false,
//     editingRecordId: null,
//     initialValues: defaultInitialValues,
//     isLoading: false,
//   });

//   const openNewForm = () =>
//     setFormState({
//       isOpen: true,
//       isEditMode: false,
//       editingRecordId: null,
//       initialValues: defaultInitialValues,
//       isLoading: false,
//     });

//   const handleEdit = useCallback((item) => {
//     setFormState({
//       isOpen: true,
//       isEditMode: true,
//       editingRecordId: item.id,
//       initialValues: {
//         ...item,
//         nttn_work_order_id: item.nttn_link_id || item.nttn_work_order_id || '',
//         capacity: item.capacity || '',
//         capacity_cost: item.capacity_cost || '',
//         shifting_bw: item.shifting_bw || '',
//         shifting_capacity: item.shifting_capacity || '',
//         shifting_unit_cost: item.shifting_unit_cost || '',
//         nttn_provider: item.nttn_provider_id || item.nttn_provider_details?.id || null,
//         client: item.client_id || item.client_details?.id || null,
//         client_category: item.client_category_id || item.client_category_details?.id || null,
//         workorder: item.workorder_row_id || item.workorder_details?.id || null,
//       },
//       isLoading: false,
//     });
//   }, []);

//   const closeForm = () =>
//     setFormState((s) => ({
//       ...s,
//       isOpen: false,
//       isEditMode: false,
//       editingRecordId: null,
//       initialValues: defaultInitialValues,
//     }));

//   const handleSubmit = async (values) => {
//     const { isEditMode, editingRecordId } = formState;
//     try {
//       if (isEditMode) {
//         await updateBWModification(editingRecordId, values);
//         showToast('Updated successfully!', 'success');
//       } else {
//         await createBWModification(values);
//         showToast('Created successfully!', 'success');
//       }
//       fetchAllBWModifications();
//       closeForm();
//     } catch (err) {
//       showToast(err?.response?.data?.message || 'Save failed!', 'error');
//     }
//   };

//   const handleFilterChange = useCallback((newFilters) => {
//     setFilters(newFilters);
//     setPagination((prev) => ({ ...prev, page: 1 }));
//   }, []);

//   // Dynamic Options Calculation
//   const dynamicOptions = useMemo(() => {
//     return {
//       nttn_provider:
//         getUniqueOptionsWithIds(records, 'nttn_name', 'nttn_provider_id') ||
//         getUniqueOptionsWithIds(
//           records,
//           'nttn_provider_details.nttn_name',
//           'nttn_provider_details.id'
//         ),
//       modification_type: getUniqueOptions(records, 'modification_type'),
//       client:
//         getUniqueOptionsWithIds(records, 'client_name', 'client_id') ||
//         getUniqueOptionsWithIds(records, 'client_details.client_name', 'client_details.id'),
//       client_category:
//         getUniqueOptionsWithIds(records, 'cat_name', 'client_category_id') ||
//         getUniqueOptionsWithIds(
//           records,
//           'client_category_details.cat_name',
//           'client_category_details.id'
//         ),
//     };
//   }, [records]);

//   // Updated Columns Definition
//   const bwModifyColumns = useMemo(
//     () => [
//       {
//         key: 'nttn_provider_name',
//         header: 'NTTN Provider',
//         isSortable: true,
//         field: SelectField,
//         fieldProps: {
//           name: 'nttn_provider',
//           options: dynamicOptions.nttn_provider || [],
//           searchable: true,
//         },
//       },
//       {
//         key: 'modification_type',
//         header: 'Modification Type',
//         isSortable: true,
//         render: (val) => getModificationTypeDisplay(val),
//         field: SelectField,
//         fieldProps: {
//           name: 'modification_type',
//           options: dynamicOptions.modification_type || [],
//           searchable: true,
//         },
//       },
//       {
//         key: 'client_category_name',
//         header: 'Client Category',
//         isSortable: true,
//         field: SelectField,
//         fieldProps: {
//           name: 'client_category',
//           options: dynamicOptions.client_category || [],
//           searchable: true,
//         },
//       },
//       {
//         key: 'client_name',
//         header: 'Client',
//         isSortable: true,
//         field: SelectField,
//         fieldProps: {
//           name: 'client',
//           options: dynamicOptions.client || [],
//           searchable: true,
//         },
//       },
//       {
//         key: 'nttn_link_id',
//         header: 'NTTN Link ID',
//         isSortable: true,
//       },
//       {
//         key: 'capacity',
//         header: 'Last Capacity',
//         isSortable: true,
//         render: (val) => (val ? `${val} Mbps` : '-'),
//       },
//       {
//         key: 'capacity_cost',
//         header: 'Last Cost',
//         isSortable: true,
//         render: (val) => (val ? `$${parseFloat(val).toFixed(2)}` : '-'),
//       },
//       {
//         key: 'shifting_bw',
//         header: 'New BW',
//         isSortable: true,
//         render: (val) => (val ? `${val} Mbps` : '-'),
//       },
//       {
//         key: 'shifting_capacity',
//         header: 'New Amount',
//         isSortable: true,
//         render: (val) => (val ? `$${parseFloat(val).toFixed(2)}` : '-'),
//       },
//       {
//         key: 'shifting_unit_cost',
//         header: 'Unit Cost',
//         isSortable: true,
//         render: (val) => (val ? `$${parseFloat(val).toFixed(2)}` : '-'),
//       },
//       {
//         key: 'workorder_id',
//         header: 'Work Order ID',
//         isSortable: true,
//       },
//       {
//         key: 'created_at',
//         header: 'Created',
//         isSortable: true,
//         render: (val) => (val ? moment(val).format('LLL') : '-'),
//         field: DateField,
//         fieldProps: { name: 'created_at', label: 'Created Date' },
//       },
//       {
//         key: 'updated_at',
//         header: 'Updated',
//         isSortable: true,
//         render: (val) => (val ? moment(val).format('LLL') : '-'),
//       },
//       {
//         key: 'actions',
//         header: 'Action',
//         render: (_, row) => (
//           <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
//             <Pencil className="h-4 w-4" />
//           </Button>
//         ),
//       },
//     ],
//     [handleEdit, dynamicOptions]
//   );

//   /* ---------- UI ---------- */
//   if (formState.isOpen) {
//     return (
//       <div className="p-8 bg-gray-100 min-h-screen">
//         <BWModificationForm
//           initialValues={formState.initialValues}
//           isEditMode={formState.isEditMode}
//           onSubmit={handleSubmit}
//           onCancel={closeForm}
//           showToast={showToast}
//         />
//         <ToastContainer toasts={toasts} removeToast={removeToast} />
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 bg-gray-100 min-h-screen">
//       <div className="flex justify-between items-center pb-16">
//         <div>
//           <h1 className="text-2xl font-bold">BW Modifications</h1>
//           <p className="text-gray-500">View and manage the list of bandwidth modifications.</p>
//         </div>
//         <div className="flex items-center gap-4">
//           <ExportButton
//             data={records}
//             columns={bwModifyColumns}
//             fileName="bw_modifications"
//             intent="primary"
//             leftIcon={FaFileExcel}
//             className="text-white bg-green-700 hover:bg-green-800 border-none"
//           >
//             Export
//           </ExportButton>
//           <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
//             Add BW Modification
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
//           data={records}
//           columns={bwModifyColumns}
//           showId={true}
//           filterComponent={
//             <BWModificationFilterMenu records={records} onFilterChange={handleFilterChange} />
//           }
//           isBackendPagination={true}
//           totalRows={pagination.totalRows}
//           page={pagination.page}
//           pageSize={pagination.limit}
//           setPage={(page) => setPagination((prev) => ({ ...prev, page }))}
//           setPageSize={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
//         />
//       )}

//       <ToastContainer toasts={toasts} removeToast={removeToast} />
//     </div>
//   );
// };

// export default BWModify;





import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Pencil } from 'lucide-react';
import Button from '../components/ui/Button';
import BWModificationForm from '../components/bwModify/BWModificationForm';
import DataTable from '../components/table/DataTable';
import ToastContainer from '../components/ui/ToastContainer';
import { FaFileExcel } from 'react-icons/fa';
import ExportButton from '../components/ui/ExportButton';
import SelectField from '../components/fields/SelectField';
import DateField from '../components/fields/DateField';
import BWModificationFilterMenu from '../components/bwModify/BWModificationFilterMenu';
import {
  createBWModification,
  fetchBWModifications,
  updateBWModification,
} from '../services/bwModification';
import moment from 'moment';

/* ---------- Helper functions ---------- */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const getUniqueOptionsWithIds = (records, namePath, idPath) => {
  const uniqueMap = new Map();
  records.forEach((record) => {
    const name = getNestedValue(record, namePath);
    const id = getNestedValue(record, idPath);
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

const getUniqueOptions = (records, key) => {
  const uniqueValues = new Set();
  records.forEach((record) => {
    const value = getNestedValue(record, key);
    if (value !== null && value !== undefined && String(value).trim() !== '') {
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

// Add modification type display helper function
const getModificationTypeDisplay = (type) => {
  switch (type) {
    case '1':
      return 'Upgrade';
    case '2':
      return 'Downgrade';
    default:
      return type || '-';
  }
};

// Helper function to get reason name
const getReasonName = (record) => {
  return record.reason_name || record.reason || '-';
};
/* ----------------------------------------------------------- */

const defaultInitialValues = {
  id: '',
  nttn_provider: null,
  modification_type: '',
  client_category_name: null,
  client: null,
  nttn_link_id: '',
  capacity: '',
  capacity_cost: '',
  shifting_bw: '',
  shifting_capacity: '',
  shifting_unit_cost: '',
  workorder: null,
  remarks: '',
  reason_id: '',
  submission: '',
  rate_id:'',
};

const BWModify = () => {
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

  const showToast = useCallback((message, type) => {
    const newToast = { id: Date.now(), message, type };
    setToasts((c) => [...c, newToast]);
    setTimeout(() => setToasts((c) => c.filter((t) => t.id !== newToast.id)), 5000);
  }, []);

  const removeToast = (id) => setToasts((c) => c.filter((t) => t.id !== id));

  /* ---------- Fetch function (no filter parameters) ---------- */
  const fetchAllBWModifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchBWModifications(); // No parameters

      // Handle different API response structures
      let data = [];
      let total = 0;

      if (res && res.data && Array.isArray(res.data)) {
        data = res.data;
        total = res.total || res.data.length;
      } else if (Array.isArray(res)) {
        data = res;
        total = res.length;
      } else if (res && Array.isArray(res.data)) {
        data = res.data;
        total = res.total || res.data.length;
      } else {
        data = [];
        total = 0;
      }

      // Preprocess data with proper field mapping
      const preprocessedData = data.map((item) => ({
        ...item,
        // Original fields
        nttn_provider_name: item.nttn_name || item.nttn_provider_details?.nttn_name || '-',
        client_category_name: item.client_category_name || item.client_category_details?.cat_name || '-',
        client_name: item.client_name || item.client_details?.client_name || '-',
        workorder_id: item.workorder_row_id || item.workorder_details?.id || '-',
        modification_type: item.modification_type || '',
        shifting_capacity: item.shifting_capacity || '',
        shifting_unit_cost: item.shifting_unit_cost || '',
        nttn_link_id: item.nttn_work_order_id || item.nttn_link_id || '',
        remarks: item.remarks || '',
        reason_name: item.reason_name || '-',
        submission: item.submission || '',
        capacity: item.capacity || '',
        capacity_cost: item.capacity_cost || '',
        shifting_bw: item.shifting_bw || '',
        
        // New fields for filtering (these should come from your API)
        sbu_id: item.sbu_id || item.survey_data?.sbu_id || '',
        sbu_name: item.sbu_name || item.survey_data?.sbu_name || '',
        client_lat: item.client_lat || item.survey_data?.client_lat || '',
        client_long: item.client_long || item.survey_data?.client_long || '',
        nttn_survey_id: item.nttn_survey_id || item.survey_data?.nttn_survey_id || '',
        
        // Make sure these fields are properly populated
        client_id: item.client_id || item.client_details?.id || '',
      }));

      console.log('✅ Preprocessed data sample:', preprocessedData[0]);
      setAllRecords(preprocessedData);
      setFilteredRecords(preprocessedData); // Initially show all records
      setPagination((prev) => ({ ...prev, totalRows: total }));
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to fetch BW Modifications.';
      setError(msg);
      showToast(msg, 'error');
      console.error('❌ Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllBWModifications();
  }, [fetchAllBWModifications]);

  /* ---------- Frontend Filtering Function ---------- */
  const applyFilters = useCallback((filters) => {
    if (!allRecords.length) return;
    
    console.log('🔍 Applying frontend filters:', filters);
    
    let result = [...allRecords];
    
    // Apply SBU filter
    if (filters.sbu_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'sbu_id')) === String(filters.sbu_id)
      );
    }
    
    // Apply Client ID filter
    if (filters.client_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'client_id')) === String(filters.client_id)
      );
    }
    
    // Apply NTTN Work Order ID filter (Link/SCR ID)
    if (filters.nttn_work_order_id) {
      result = result.filter(record => {
        const nttnWorkOrderId = record.nttn_work_order_id || record.nttn_link_id;
        return String(nttnWorkOrderId) === String(filters.nttn_work_order_id);
      });
    }
    
    // Apply NTTN Survey ID filter (NTTN Provider ID)
    if (filters.nttn_survey_id) {
      result = result.filter(record => {
        const nttnSurveyId = record.nttn_survey_id;
        return String(nttnSurveyId) === String(filters.nttn_survey_id);
      });
    }
    
    // Apply Client Latitude filter
    if (filters.client_lat) {
      result = result.filter(record => {
        const clientLat = getNestedValue(record, 'client_lat') || record.client_lat;
        return String(clientLat) === String(filters.client_lat);
      });
    }
    
    // Apply Client Longitude filter
    if (filters.client_long) {
      result = result.filter(record => {
        const clientLong = getNestedValue(record, 'client_long') || record.client_long;
        return String(clientLong) === String(filters.client_long);
      });
    }
    
    console.log(`✅ Filtered from ${allRecords.length} to ${result.length} records`);
    setFilteredRecords(result);
    setPagination(prev => ({ ...prev, page: 1, totalRows: result.length }));
    setActiveFilters(filters);
  }, [allRecords]);

  // Handle filter change from BWModificationFilterMenu
  const handleFilterChange = useCallback((filters) => {
    console.log('🎯 Filters received from BWModificationFilterMenu:', filters);
    applyFilters(filters);
  }, [applyFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilteredRecords(allRecords);
    setActiveFilters({});
    setPagination(prev => ({ ...prev, page: 1, totalRows: allRecords.length }));
  }, [allRecords]);

  /* ---------- form handling ---------- */
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

// In BWModify.jsx - Update the handleEdit function

const handleEdit = useCallback((item) => {
  setFormState({
    isOpen: true,
    isEditMode: true,
    editingRecordId: item.id,
    initialValues: {
      ...item,
      id: item.id,
      nttn_work_order_id: item.nttn_link_id || item.nttn_work_order_id || '',
      capacity: item.capacity || '',
      capacity_cost: item.capacity_cost || '',
      shifting_bw: item.shifting_bw || '',
      shifting_capacity: item.shifting_capacity || '',
      shifting_unit_cost: item.shifting_unit_cost || '',
      nttn_provider: item.nttn_provider_id || item.nttn_provider_details?.id || null,
      client: item.client_id || item.client_details?.id || null,
      client_category: item.client_category_id || item.client_category_details?.id || null,
      workorder_id: item.workorder_row_id || item.workorder_details?.id || null,
      modification_type: item.modification_type || '',
      remarks: item.remarks || '',
      reason_id: item.reason_id || '',
      submission: item.submission || '',
      rate_id: item.rate_id || '', // ✅ Added rate_id from existing record
    },
    isLoading: false,
  });
}, []);

  const closeForm = () =>
    setFormState((s) => ({
      ...s,
      isOpen: false,
      isEditMode: false,
      editingRecordId: null,
      initialValues: defaultInitialValues,
    }));

  const handleSubmit = async (values) => {
    const { isEditMode, editingRecordId } = formState;
    try {
      if (isEditMode) {
        await updateBWModification(editingRecordId, values);
        showToast('Updated successfully!', 'success');
      } else {
        await createBWModification(values);
        showToast('Created successfully!', 'success');
      }
      fetchAllBWModifications();
      closeForm();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Save failed!', 'error');
    }
  };

  // Dynamic Options Calculation for table inline editing
  const dynamicOptions = useMemo(() => {
    return {
      nttn_provider:
        getUniqueOptionsWithIds(allRecords, 'nttn_name', 'nttn_provider_id') ||
        getUniqueOptionsWithIds(
          allRecords,
          'nttn_provider_details.nttn_name',
          'nttn_provider_details.id'
        ),
      modification_type: getUniqueOptions(allRecords, 'modification_type'),
      client:
        getUniqueOptionsWithIds(allRecords, 'client_name', 'client_id') ||
        getUniqueOptionsWithIds(allRecords, 'client_details.client_name', 'client_details.id'),
      client_category:
        getUniqueOptionsWithIds(allRecords, 'cat_name', 'client_category_id') ||
        getUniqueOptionsWithIds(
          allRecords,
          'client_category_details.cat_name',
          'client_category_details.id'
        ),
      reason: getUniqueOptions(allRecords, 'reason_name').filter(opt => opt.value !== '-'),
    };
  }, [allRecords]);

  // Updated Columns Definition with new fields
  const bwModifyColumns = useMemo(
    () => [
      {
        key: 'nttn_survey_id',
        header: 'NTTN Provider',
        isSortable: true,
        field: SelectField,
        fieldProps: {
          name: 'nttn_provider',
          options: dynamicOptions.nttn_provider || [],
          searchable: true,
        },
      },
      {
        key: 'modification_type',
        header: 'Modification Type',
        isSortable: true,
        render: (val) => getModificationTypeDisplay(val),
        field: SelectField,
        fieldProps: {
          name: 'modification_type',
          options: dynamicOptions.modification_type || [],
          searchable: true,
        },
      },
      {
        key: 'client_category_name',
        header: 'Client Category',
        isSortable: true,
        field: SelectField,
        fieldProps: {
          name: 'client_category',
          options: dynamicOptions.client_category || [],
          searchable: true,
        },
      },
      {
        key: 'client_name',
        header: 'Client',
        isSortable: true,
        field: SelectField,
        fieldProps: {
          name: 'client',
          options: dynamicOptions.client || [],
          searchable: true,
        },
      },
      {
        key: 'nttn_link_id',
        header: 'NTTN Link ID',
        isSortable: true,
      },
      {
        key: 'capacity',
        header: 'Last Capacity',
        isSortable: true,
        render: (val) => (val ? `${val} Mbps` : '-'),
      },
      {
        key: 'capacity_cost',
        header: 'Last Cost',
        isSortable: true,
        render: (val) => (val ? `$${parseFloat(val).toFixed(2)}` : '-'),
      },
      {
        key: 'shifting_bw',
        header: 'New BW',
        isSortable: true,
        render: (val) => (val ? `${val} Mbps` : '-'),
      },
      {
        key: 'shifting_capacity',
        header: 'New Amount',
        isSortable: true,
        render: (val) => (val ? `$${parseFloat(val).toFixed(2)}` : '-'),
      },
      {
        key: 'shifting_unit_cost',
        header: 'Unit Cost',
        isSortable: true,
        render: (val) => (val ? `$${parseFloat(val).toFixed(2)}` : '-'),
      },
      {
        key: 'remarks',
        header: 'Remarks',
        isSortable: true,
        render: (val) => (val && val.trim() !== '' ? val.substring(0, 50) + (val.length > 50 ? '...' : '') : '-'),
      },
      {
        key: 'reason_name',
        header: 'Reason',
        isSortable: true,
        render: (val, row) => getReasonName(row),
        field: SelectField,
        fieldProps: {
          name: 'reason',
          options: dynamicOptions.reason || [],
          searchable: true,
        },
      },
      {
        key: 'submission',
        header: 'Submission Date',
        isSortable: true,
        render: (val) => (val ? moment(val).format('YYYY-MM-DD') : '-'),
        field: DateField,
        fieldProps: { name: 'submission', label: 'Submission Date' },
      },
      {
        key: 'workorder_id',
        header: 'Work Order ID',
        isSortable: true,
      },
      {
        key: 'created_at',
        header: 'Created',
        isSortable: true,
        render: (val) => (val ? moment(val).format('LLL') : '-'),
        field: DateField,
        fieldProps: { name: 'created_at', label: 'Created Date' },
      },
      {
        key: 'updated_at',
        header: 'Updated',
        isSortable: true,
        render: (val) => (val ? moment(val).format('LLL') : '-'),
      },
      {
        key: 'actions',
        header: 'Action',
        render: (_, row) => (
          <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [handleEdit, dynamicOptions]
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

  /* ---------- UI ---------- */
  if (formState.isOpen) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <BWModificationForm
          initialValues={formState.initialValues}
          isEditMode={formState.isEditMode}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          showToast={showToast}
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
          data={filteredRecords}
          columns={bwModifyColumns}
          showId={true}
          filterComponent={
            <BWModificationFilterMenu 
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
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default BWModify;