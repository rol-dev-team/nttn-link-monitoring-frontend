

// import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// import { Filter, X } from 'lucide-react';
// import clsx from 'clsx';
// import { useOutside } from '../../hooks/useOutside';
// import Button from '../ui/Button';
// import { useFormik, FormikProvider, Field } from 'formik';
// import SelectField from '../fields/SelectField';
// import DateField from '../fields/DateField';
// import { fetchSBUs } from '../../services/sbu';
// import { fetchClients } from '../../services/client';

// // Helper function to safely get nested data
// const getNestedValue = (obj, path) => {
//     if (!obj) return undefined;
//     return path.split('.').reduce((acc, part) => acc && acc[part], obj);
// };

// // Helper: Maps Name (label) to ID (value) for Foreign Keys
// const getUniqueOptionsWithIds = (records, namePath, idPath) => {
//     const uniqueMap = new Map();
//     records.forEach(record => {
//         const name = getNestedValue(record, namePath);
//         const id = getNestedValue(record, idPath);
//         if (name && id) {
//             // Ensure both are strings for comparison
//             uniqueMap.set(String(name), String(id));
//         }
//     });

//     return Array.from(uniqueMap.entries()).sort().map(([name, id]) => ({
//         label: name,
//         value: id,
//     }));
// };

// // Helper to extract unique simple options
// const getUniqueOptions = (records, key) => {
//     const uniqueValues = new Set();
//     records.forEach(record => {
//         const value = getNestedValue(record, key);
//         if (value !== null && value !== undefined && String(value).trim() !== "") {
//             uniqueValues.add(String(value).trim());
//         }
//     });

//     return Array.from(uniqueValues).sort().map(value => ({
//         label: value,
//         value: value,
//     }));
// };

// // Simple Text Input Component
// const SimpleTextField = ({ 
//     label, 
//     value, 
//     onChange, 
//     placeholder, 
//     type = "text",
//     floating = true,
//     ...props 
// }) => {
//     const inputId = `text-field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    
//     return (
//         <div className="relative mb-4">
//             {floating ? (
//                 <div className="relative">
//                     <input
//                         id={inputId}
//                         type={type}
//                         value={value || ''}
//                         onChange={onChange}
//                         placeholder=" "
//                         className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
//                         {...props}
//                     />
//                     <label
//                         htmlFor={inputId}
//                         className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
//                     >
//                         {label}
//                     </label>
//                 </div>
//             ) : (
//                 <div>
//                     <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
//                         {label}
//                     </label>
//                     <input
//                         id={inputId}
//                         type={type}
//                         value={value || ''}
//                         onChange={onChange}
//                         placeholder={placeholder}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         {...props}
//                     />
//                 </div>
//             )}
//         </div>
//     );
// };

// const WorkOrderFilterMenu = ({ records, onFilterChange, live = false }) => {
//     const [drawerOpen, setDrawerOpen] = useState(false);
//     const drawerRef = useRef(null);
    
//     // State for API data
//     const [sbuOptions, setSbuOptions] = useState([]);
//     const [clientOptions, setClientOptions] = useState([]);
//     const [isLoadingSbu, setIsLoadingSbu] = useState(false);
//     const [isLoadingClients, setIsLoadingClients] = useState(false);
//     const [sbuNameMap, setSbuNameMap] = useState(new Map());

//     const initialValues = {
//         sbu_id: '',
//         sbu_name: '',
//         link_type_id: '',
//         aggregator_id: '',
//         kam_id: '',
//         nttn_id: '',
//         client_category: '',
//         client_id: '',
//         client_name: '',
//         client_lat: '',
//         client_long: '',
//         requested_delivery: '',
//         service_handover: '',
//     };

//     const formik = useFormik({
//         initialValues,
//         onSubmit: (values) => {
//             // Clean up the values before sending
//             const activeFilters = {};
            
//             Object.entries(values).forEach(([key, value]) => {
//                 if (value !== null && value !== '' && value !== undefined) {
//                     activeFilters[key] = value;
                    
//                     // If sbu_id is selected, also filter by sbu_name for consistency
//                     if (key === 'sbu_id' && value) {
//                         const sbuName = sbuNameMap.get(String(value));
//                         if (sbuName) {
//                             activeFilters['sbu_name'] = sbuName;
//                         }
//                     }
//                 }
//             });

//             console.log('🔍 Applying filters:', activeFilters);
//             onFilterChange(activeFilters);
//             setDrawerOpen(false);
//         },
//     });

//     // Fetch SBU data from API
//     useEffect(() => {
//         const loadSBUs = async () => {
//             setIsLoadingSbu(true);
//             try {
//                 const response = await fetchSBUs();
//                 const sbuData = Array.isArray(response) ? response : response?.data || [];
                
//                 const mappedOptions = sbuData.map(sbu => ({
//                     value: String(sbu.id), // Ensure string format
//                     label: sbu.sbu_name || sbu.name || `SBU ${sbu.id}`,
//                 }));
                
//                 // Create a map of ID to name for filtering
//                 const nameMap = new Map();
//                 sbuData.forEach(sbu => {
//                     nameMap.set(String(sbu.id), sbu.sbu_name || sbu.name || `SBU ${sbu.id}`);
//                 });
                
//                 setSbuOptions(mappedOptions);
//                 setSbuNameMap(nameMap);
//                 console.log('✅ SBU options loaded:', mappedOptions);
//             } catch (error) {
//                 console.error('❌ Error fetching SBUs:', error);
//                 setSbuOptions([]);
//             } finally {
//                 setIsLoadingSbu(false);
//             }
//         };

//         loadSBUs();
//     }, []);

//     // Fetch Client data from API
//     useEffect(() => {
//         const loadClients = async () => {
//             setIsLoadingClients(true);
//             try {
//                 const response = await fetchClients();
                
//                 console.log('🔍 Client API response:', response);
                
//                 let clientData = [];
                
//                 if (response && response.success && Array.isArray(response.data)) {
//                     clientData = response.data;
//                 } else if (Array.isArray(response)) {
//                     clientData = response;
//                 } else if (response && Array.isArray(response.data)) {
//                     clientData = response.data;
//                 }
                
//                 console.log('📋 Raw client data:', clientData);
                
//                 // Transform API response - Direct mapping based on your API structure
//                 const mappedClientOptions = clientData.map(client => {
//                     // Your API returns: id, client_name
//                     const clientId = client.id;
//                     const clientName = client.client_name;
                    
//                     return {
//                         value: String(clientId), // Convert to string
//                         label: clientName,
//                         // Store additional data
//                         client_lat: client.client_lat || client.lat,
//                         client_long: client.client_long || client.lng || client.long,
//                         // Store original data for debugging
//                         originalData: client,
//                     };
//                 });
                
//                 console.log('✅ Mapped client options:', mappedClientOptions);
//                 setClientOptions(mappedClientOptions);
                
//             } catch (error) {
//                 console.error('❌ Error fetching clients:', error);
//                 console.error('Error details:', error.response?.data || error.message);
//                 setClientOptions([]);
                
//                 // Fallback to local extraction if API fails
//                 const fallbackOptions = getUniqueOptionsWithIds(
//                     records, 
//                     'survey_data.client_name', 
//                     'survey_data.client_id'
//                 );
//                 console.log('🔄 Fallback client options:', fallbackOptions);
//                 setClientOptions(fallbackOptions);
//             } finally {
//                 setIsLoadingClients(false);
//             }
//         };

//         // Load clients on mount, not dependent on records
//         loadClients();
//     }, []); // Remove records dependency

//     const dynamicOptions = useMemo(() => {
//         return {
//             link_type: getUniqueOptionsWithIds(records, 'survey_data.link_type_name', 'survey_data.link_type_id'),
//             aggregator: getUniqueOptionsWithIds(records, 'survey_data.aggregator_name', 'survey_data.aggregator_id'),
//             kam: getUniqueOptionsWithIds(records, 'survey_data.kam_name', 'survey_data.kam_id'),
//             nttn_name: getUniqueOptionsWithIds(records, 'survey_data.nttn_name', 'survey_data.nttn_id'),
//             client_category: getUniqueOptions(records, 'survey_data.client_category'),
//             requested_delivery: getUniqueOptions(records, 'requested_delivery').map(opt => ({
//                 ...opt,
//                 label: opt.label.substring(0, 10),
//             })),
//             service_handover: getUniqueOptions(records, 'service_handover').map(opt => ({
//                 ...opt,
//                 label: opt.label.substring(0, 10),
//             })),
//         };
//     }, [records]);

//     // Get all client options (not filtered by SBU/NTTN initially)
//     const allClientOptions = useMemo(() => {
//         console.log('🔄 Getting all client options:', clientOptions.length);
//         return clientOptions;
//     }, [clientOptions]);

//     // Filter client options based on SBU and NTTN selections
//     const filteredClientOptions = useMemo(() => {
//         console.log('🔄 Filtering client options...');
//         console.log('SBU ID:', formik.values.sbu_id);
//         console.log('NTTN ID:', formik.values.nttn_id);
//         console.log('Total client options:', clientOptions.length);
        
//         // If no SBU or NTTN filter is applied, show all client options
//         if (!formik.values.sbu_id && !formik.values.nttn_id) {
//             console.log('✅ No filters applied, showing all client options');
//             return clientOptions;
//         }
        
//         let filteredRecords = records;

//         if (formik.values.sbu_id) {
//             const before = filteredRecords.length;
//             filteredRecords = filteredRecords.filter(
//                 (record) => {
//                     const recordSbuId = getNestedValue(record, 'survey_data.sbu_id');
//                     const matches = String(recordSbuId) === formik.values.sbu_id;
//                     return matches;
//                 }
//             );
//             console.log(`📊 After SBU filter: ${before} -> ${filteredRecords.length} records`);
//         }

//         if (formik.values.nttn_id) {
//             const before = filteredRecords.length;
//             filteredRecords = filteredRecords.filter(
//                 (record) => {
//                     const recordNttnId = getNestedValue(record, 'survey_data.nttn_id');
//                     const matches = String(recordNttnId) === formik.values.nttn_id;
//                     return matches;
//                 }
//             );
//             console.log(`📊 After NTTN filter: ${before} -> ${filteredRecords.length} records`);
//         }

//         // Get unique client IDs from filtered records
//         const clientIdsInRecords = new Set();
//         filteredRecords.forEach(record => {
//             const clientId = getNestedValue(record, 'survey_data.client_id');
//             if (clientId) {
//                 clientIdsInRecords.add(String(clientId));
//             }
//         });
        
//         console.log('📊 Client IDs in filtered records:', Array.from(clientIdsInRecords));

//         // Filter client options to only show clients that exist in the filtered records
//         const filteredOptions = clientOptions.filter(clientOption => 
//             clientIdsInRecords.has(clientOption.value)
//         );
        
//         console.log('✅ Filtered client options:', filteredOptions.length, 'options');
//         return filteredOptions;
//     }, [records, formik.values.sbu_id, formik.values.nttn_id, clientOptions]);

//     // Use filtered options when filters are applied, otherwise use all options
//     const displayClientOptions = useMemo(() => {
//         return filteredClientOptions.length > 0 ? filteredClientOptions : clientOptions;
//     }, [filteredClientOptions, clientOptions]);

//     useEffect(() => {
//         const currentClientId = formik.values.client_id;
//         const isClientValid = displayClientOptions.some(opt => opt.value === currentClientId);

//         if (!isClientValid && currentClientId) {
//             console.log('🔄 Resetting invalid client selection');
//             formik.setFieldValue('client_id', '');
//         }
//     }, [formik.values.sbu_id, formik.values.nttn_id, formik.setFieldValue, displayClientOptions]);

//     const handleLiveChange = useCallback(() => {
//         if (live) {
//             onFilterChange(formik.values);
//         }
//     }, [live, onFilterChange, formik.values]);

//     useEffect(() => {
//         handleLiveChange();
//     }, [formik.values, handleLiveChange]);

//     useEffect(() => {
//         const handleKeyDown = (event) => {
//             if (event.key === 'Escape' && drawerOpen) {
//                 setDrawerOpen(false);
//             }
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         return () => {
//             window.removeEventListener('keydown', handleKeyDown);
//         };
//     }, [drawerOpen]);

//     useOutside(drawerRef, (e) => {
//         if (document.querySelector('[data-calendar-portal]')?.contains(e.target)) return;
//         setDrawerOpen(false);
//     });

//     const clearFilters = () => {
//         formik.resetForm({ values: initialValues });
//         onFilterChange({});
//     };

//     const activeFiltersCount = useMemo(() => {
//         return Object.values(formik.values).filter(
//             (value) => value !== null && value !== '' && value !== undefined
//         ).length;
//     }, [formik.values]);

//     const handleOpenDrawer = () => {
//         setDrawerOpen(true);
//     };

//     const handleCloseDrawer = () => {
//         setDrawerOpen(false);
//     };

//     const handleSbuChange = (value) => {
//         console.log('📝 SBU changed to:', value);
//         formik.setFieldValue('sbu_id', value);
        
//         // Also store the SBU name for reference
//         if (value && sbuNameMap.has(String(value))) {
//             const sbuName = sbuNameMap.get(String(value));
//             formik.setFieldValue('sbu_name', sbuName);
//         } else {
//             formik.setFieldValue('sbu_name', '');
//         }
//     };

//     const handleClientChange = (value) => {
//         console.log('📝 Client changed to:', value);
//         console.log('Available client options:', displayClientOptions);
//         formik.setFieldValue('client_id', value);
        
//         // If a client is selected, find and set its lat/long if available
//         if (value) {
//             const selectedClient = clientOptions.find(client => client.value === value);
//             console.log('🔍 Selected client:', selectedClient);
//             if (selectedClient) {
//                 if (selectedClient.client_lat) {
//                     formik.setFieldValue('client_lat', selectedClient.client_lat);
//                 }
//                 if (selectedClient.client_long) {
//                     formik.setFieldValue('client_long', selectedClient.client_long);
//                 }
//             }
//         }
//     };

//     // Debug: Log current state
//     useEffect(() => {
//         console.log('🎯 Current displayClientOptions:', displayClientOptions);
//         console.log('🎯 Current formik.values.client_id:', formik.values.client_id);
//     }, [displayClientOptions, formik.values.client_id]);

//     return (
//         <>
//             <Button onClick={handleOpenDrawer} leftIcon={Filter} variant="icon">
//                 Filters
//                 {activeFiltersCount > 0 && (
//                     <span className="inline-flex items-center justify-center h-4 w-4 rounded-full text-xs font-semibold bg-blue-500 text-white ml-1">
//                         {activeFiltersCount}
//                     </span>
//                 )}
//             </Button>

//             {drawerOpen && (
//                 <div
//                     className="fixed inset-0 bg-black bg-opacity-40 z-40"
//                     onClick={handleCloseDrawer}
//                 />
//             )}

//             <div
//                 ref={drawerRef}
//                 className={clsx(
//                     'fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col',
//                     drawerOpen ? 'translate-x-0' : 'translate-x-full'
//                 )}
//             >
//                 <div className="flex-none flex items-center justify-between p-4 border-b border-gray-200">
//                     <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//                         <Filter className="h-5 w-5" /> Filter
//                     </h2>
//                     <Button
//                         onClick={handleCloseDrawer}
//                         variant="icon"
//                         size="sm"
//                         title="Close Filters"
//                     >
//                         <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
//                     </Button>
//                 </div>

//                 <FormikProvider value={formik}>
//                     <form
//                         className="flex-1 p-4 space-y-4 overflow-y-auto"
//                         onSubmit={formik.handleSubmit}
//                     >
//                         {/* SBU Filter - Now from API */}
//                         <SelectField
//                             name="sbu_id"
//                             label={`SBU ${isLoadingSbu ? '(Loading...)' : ''}`}
//                             options={sbuOptions}
//                             floating={true}
//                             searchable={true}
//                             value={formik.values.sbu_id}
//                             onChange={handleSbuChange}
//                             disabled={isLoadingSbu}
//                             // placeholder="Select SBU"
//                         />

//                         {/* Link Type Filter */}
//                         <SelectField
//                             name="link_type_id"
//                             label="Link Type"
//                             options={dynamicOptions.link_type}
//                             floating={true}
//                             searchable={true}
//                             value={formik.values.link_type_id}
//                             onChange={(v) => formik.setFieldValue('link_type_id', v)}
//                             // placeholder="Select Link Type"
//                         />

//                         {/* Aggregator Filter */}
//                         <SelectField
//                             name="aggregator_id"
//                             label="Aggregator"
//                             options={dynamicOptions.aggregator}
//                             floating={true}
//                             searchable={true}
//                             value={formik.values.aggregator_id}
//                             onChange={(v) => formik.setFieldValue('aggregator_id', v)}
//                             // placeholder="Select Aggregator"
//                         />

//                         {/* KAM Filter */}
//                         <SelectField
//                             name="kam_id"
//                             label="KAM"
//                             options={dynamicOptions.kam}
//                             floating={true}
//                             searchable={true}
//                             value={formik.values.kam_id}
//                             onChange={(v) => formik.setFieldValue('kam_id', v)}
//                             // placeholder="Select KAM"
//                         />

//                         {/* NTTN Name Filter */}
//                         <SelectField
//                             name="nttn_id"
//                             label="NTTN Name"
//                             options={dynamicOptions.nttn_name}
//                             floating={true}
//                             searchable={true}
//                             value={formik.values.nttn_id}
//                             onChange={(v) => formik.setFieldValue('nttn_id', v)}
//                             // placeholder="Select NTTN"
//                         />

//                         {/* Client Category Filter */}
//                         <SelectField
//                             name="client_category"
//                             label="Client Category"
//                             options={dynamicOptions.client_category}
//                             floating={true}
//                             searchable={true}
//                             value={formik.values.client_category}
//                             onChange={(v) => formik.setFieldValue('client_category', v)}
//                             // placeholder="Select Category"
//                         />

//                         {/* Client Name Filter - From API */}
//                         <SelectField
//                             name="client_id"
//                             label={`Client Name ${isLoadingClients ? '(Loading...)' : ''}`}
//                             options={displayClientOptions}
//                             floating={true}
//                             searchable={true}
//                             value={formik.values.client_id}
//                             onChange={handleClientChange}
//                             disabled={isLoadingClients}
//                             // placeholder={isLoadingClients ? "Loading clients..." : 
//                             //             displayClientOptions.length === 0 ? "No clients available" : 
//                             //             "Select a client"}
//                         />

//                         {/* Client Lat Filter - Simple Text Field */}
//                         <div className="mb-4">
//                             <SimpleTextField
//                                 label="Client Latitude"
//                                 value={formik.values.client_lat}
//                                 onChange={(e) => formik.setFieldValue('client_lat', e.target.value)}
//                                 placeholder="Enter latitude (exact match)"
//                                 type="text"
//                             />
//                         </div>

//                         {/* Client Long Filter - Simple Text Field */}
//                         <div className="mb-4">
//                             <SimpleTextField
//                                 label="Client Longitude"
//                                 value={formik.values.client_long}
//                                 onChange={(e) => formik.setFieldValue('client_long', e.target.value)}
//                                 placeholder="Enter longitude (exact match)"
//                                 type="text"
//                             />
//                         </div>

//                         {/* Requested Delivery Date Filter */}
//                         <DateField
//                             name="requested_delivery"
//                             label="Requested Delivery Date"
//                             floating={true}
//                             className="mb-0"
//                             searchable={true}
//                             options={dynamicOptions.requested_delivery}
//                             value={formik.values.requested_delivery}
//                             onChange={(v) => formik.setFieldValue('requested_delivery', v)}
//                             placeholder="Select date"
//                         />

//                         {/* Service Handover Date Filter */}
//                         <DateField
//                             name="service_handover"
//                             label="Service Handover Date"
//                             floating={true}
//                             className="mb-0"
//                             searchable={true}
//                             options={dynamicOptions.service_handover}
//                             value={formik.values.service_handover}
//                             onChange={(v) => formik.setFieldValue('service_handover', v)}
//                             placeholder="Select date"
//                         />
//                     </form>
//                 </FormikProvider>

//                 <div className="flex-none p-4 border-t border-gray-200 bg-white flex justify-end gap-2">
//                     <Button onClick={clearFilters} intent="ghost" type="button">
//                         Clear All
//                     </Button>
//                     {!live && (
//                         <Button intent="primary" type="submit" onClick={formik.handleSubmit}>
//                             Apply
//                         </Button>
//                     )}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default WorkOrderFilterMenu;







import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import clsx from 'clsx';
import { useOutside } from '../../hooks/useOutside';
import Button from '../ui/Button';
import { useFormik, FormikProvider, Field } from 'formik';
import SelectField from '../fields/SelectField';
import DateField from '../fields/DateField';
import { fetchSBUs } from '../../services/sbu';
import { fetchClients } from '../../services/client';
import { fetchActiveNttnWorkOrderIds } from '../../services/workOrder';

// Helper function to safely get nested data
const getNestedValue = (obj, path) => {
    if (!obj) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Helper: Maps Name (label) to ID (value) for Foreign Keys
const getUniqueOptionsWithIds = (records, namePath, idPath) => {
    const uniqueMap = new Map();
    records.forEach(record => {
        const name = getNestedValue(record, namePath);
        const id = getNestedValue(record, idPath);
        if (name && id) {
            // Ensure both are strings for comparison
            uniqueMap.set(String(name), String(id));
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

// Simple Text Input Component
const SimpleTextField = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    type = "text",
    floating = true,
    ...props 
}) => {
    const inputId = `text-field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    
    return (
        <div className="relative mb-4">
            {floating ? (
                <div className="relative">
                    <input
                        id={inputId}
                        type={type}
                        value={value || ''}
                        onChange={onChange}
                        placeholder=" "
                        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        {...props}
                    />
                    <label
                        htmlFor={inputId}
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                    >
                        {label}
                    </label>
                </div>
            ) : (
                <div>
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                    <input
                        id={inputId}
                        type={type}
                        value={value || ''}
                        onChange={onChange}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        {...props}
                    />
                </div>
            )}
        </div>
    );
};

const WorkOrderFilterMenu = ({ records, onFilterChange, live = false }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerRef = useRef(null);
    
    // State for API data
    const [sbuOptions, setSbuOptions] = useState([]);
    const [clientOptions, setClientOptions] = useState([]);
    const [nttnWorkOrderIds, setNttnWorkOrderIds] = useState([]);
    const [nttnSurveyIds, setNttnSurveyIds] = useState([]);
    const [isLoadingSbu, setIsLoadingSbu] = useState(false);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [isLoadingNttnWorkOrderIds, setIsLoadingNttnWorkOrderIds] = useState(false);
    const [isLoadingNttnSurveyIds, setIsLoadingNttnSurveyIds] = useState(false);
    const [sbuNameMap, setSbuNameMap] = useState(new Map());

    const initialValues = {
        sbu_id: '',
        sbu_name: '',
        link_type_id: '',
        aggregator_id: '',
        kam_id: '',
        nttn_id: '',
        client_category: '',
        client_id: '',
        client_name: '',
        client_lat: '',
        client_long: '',
        requested_delivery_from: '',
        requested_delivery_to: '',
        service_handover_from: '',
        service_handover_to: '',
        nttn_work_order_id: '', // New field for Link/SCR ID
        nttn_survey_id: '', // New field for NTTN Provider ID
    };

    const formik = useFormik({
        initialValues,
        onSubmit: (values) => {
            // Clean up the values before sending
            const activeFilters = {};
            
            Object.entries(values).forEach(([key, value]) => {
                if (value !== null && value !== '' && value !== undefined) {
                    activeFilters[key] = value;
                    
                    // If sbu_id is selected, also filter by sbu_name for consistency
                    if (key === 'sbu_id' && value) {
                        const sbuName = sbuNameMap.get(String(value));
                        if (sbuName) {
                            activeFilters['sbu_name'] = sbuName;
                        }
                    }
                }
            });

            console.log('🔍 Applying filters:', activeFilters);
            onFilterChange(activeFilters);
            setDrawerOpen(false);
        },
    });

    // Fetch SBU data from API
    useEffect(() => {
        const loadSBUs = async () => {
            setIsLoadingSbu(true);
            try {
                const response = await fetchSBUs();
                const sbuData = Array.isArray(response) ? response : response?.data || [];
                
                const mappedOptions = sbuData.map(sbu => ({
                    value: String(sbu.id), // Ensure string format
                    label: sbu.sbu_name || sbu.name || `SBU ${sbu.id}`,
                }));
                
                // Create a map of ID to name for filtering
                const nameMap = new Map();
                sbuData.forEach(sbu => {
                    nameMap.set(String(sbu.id), sbu.sbu_name || sbu.name || `SBU ${sbu.id}`);
                });
                
                setSbuOptions(mappedOptions);
                setSbuNameMap(nameMap);
                console.log('✅ SBU options loaded:', mappedOptions);
            } catch (error) {
                console.error('❌ Error fetching SBUs:', error);
                setSbuOptions([]);
            } finally {
                setIsLoadingSbu(false);
            }
        };

        loadSBUs();
    }, []);

    // Fetch Client data from API
    useEffect(() => {
        const loadClients = async () => {
            setIsLoadingClients(true);
            try {
                const response = await fetchClients();
                
                console.log('🔍 Client API response:', response);
                
                let clientData = [];
                
                if (response && response.success && Array.isArray(response.data)) {
                    clientData = response.data;
                } else if (Array.isArray(response)) {
                    clientData = response;
                } else if (response && Array.isArray(response.data)) {
                    clientData = response.data;
                }
                
                console.log('📋 Raw client data:', clientData);
                
                // Transform API response - Direct mapping based on your API structure
                const mappedClientOptions = clientData.map(client => {
                    // Your API returns: id, client_name
                    const clientId = client.id;
                    const clientName = client.client_name;
                    
                    return {
                        value: String(clientId), // Convert to string
                        label: clientName,
                        // Store additional data
                        client_lat: client.client_lat || client.lat,
                        client_long: client.client_long || client.lng || client.long,
                        // Store original data for debugging
                        originalData: client,
                    };
                });
                
                console.log('✅ Mapped client options:', mappedClientOptions);
                setClientOptions(mappedClientOptions);
                
            } catch (error) {
                console.error('❌ Error fetching clients:', error);
                console.error('Error details:', error.response?.data || error.message);
                setClientOptions([]);
                
                // Fallback to local extraction if API fails
                const fallbackOptions = getUniqueOptionsWithIds(
                    records, 
                    'survey_data.client_name', 
                    'survey_data.client_id'
                );
                console.log('🔄 Fallback client options:', fallbackOptions);
                setClientOptions(fallbackOptions);
            } finally {
                setIsLoadingClients(false);
            }
        };

        // Load clients on mount, not dependent on records
        loadClients();
    }, []);

    // Fetch NTTN Work Order IDs (Link/SCR ID)
    useEffect(() => {
        const loadNttnWorkOrderIds = async () => {
            setIsLoadingNttnWorkOrderIds(true);
            try {
                const response = await fetchActiveNttnWorkOrderIds();
                console.log('🔍 NTTN Work Order IDs API response:', response);
                
                let nttnWorkOrderData = [];
                
                if (response && response.success && Array.isArray(response.data)) {
                    nttnWorkOrderData = response.data;
                } else if (Array.isArray(response)) {
                    nttnWorkOrderData = response;
                } else if (response && Array.isArray(response.data)) {
                    nttnWorkOrderData = response.data;
                }
                
                console.log('📋 Raw NTTN Work Order IDs:', nttnWorkOrderData);
                
                // Transform to SelectField options format
                const mappedNttnWorkOrderOptions = nttnWorkOrderData
                    .filter(id => id && String(id).trim() !== '') // Remove empty/null values
                    .map((id, index) => ({
                        value: String(id),
                        label: String(id),
                    }));
                
                console.log('✅ Mapped NTTN Work Order ID options:', mappedNttnWorkOrderOptions);
                setNttnWorkOrderIds(mappedNttnWorkOrderOptions);
                
            } catch (error) {
                console.error('❌ Error fetching NTTN Work Order IDs:', error);
                console.error('Error details:', error.response?.data || error.message);
                setNttnWorkOrderIds([]);
                
                // Fallback to local extraction from records
                const fallbackOptions = getUniqueOptions(records, 'nttn_work_order_id')
                    .filter(opt => opt.value && opt.value.trim() !== '');
                console.log('🔄 Fallback NTTN Work Order ID options:', fallbackOptions);
                setNttnWorkOrderIds(fallbackOptions);
            } finally {
                setIsLoadingNttnWorkOrderIds(false);
            }
        };

        loadNttnWorkOrderIds();
    }, [records]);

    // Fetch NTTN Survey IDs (NTTN Provider ID)
    // You need to create fetchActiveNttnSurveyIds function in your services
    // For now, I'll extract from local records
    useEffect(() => {
        const loadNttnSurveyIds = async () => {
            setIsLoadingNttnSurveyIds(true);
            try {
                // If you have an API for NTTN Survey IDs, use it:
                // const response = await fetchActiveNttnSurveyIds();
                // For now, extract from local records
                
                const uniqueSurveyIds = getUniqueOptions(records, 'nttn_survey_id')
                    .filter(opt => opt.value && opt.value.trim() !== '');
                
                console.log('📋 Extracted NTTN Survey IDs from records:', uniqueSurveyIds);
                setNttnSurveyIds(uniqueSurveyIds);
                
            } catch (error) {
                console.error('❌ Error fetching NTTN Survey IDs:', error);
                setNttnSurveyIds([]);
            } finally {
                setIsLoadingNttnSurveyIds(false);
            }
        };

        if (records.length > 0) {
            loadNttnSurveyIds();
        }
    }, [records]);

    const dynamicOptions = useMemo(() => {
        return {
            link_type: getUniqueOptionsWithIds(records, 'survey_data.link_type_name', 'survey_data.link_type_id'),
            aggregator: getUniqueOptionsWithIds(records, 'survey_data.aggregator_name', 'survey_data.aggregator_id'),
            kam: getUniqueOptionsWithIds(records, 'survey_data.kam_name', 'survey_data.kam_id'),
            nttn_name: getUniqueOptionsWithIds(records, 'survey_data.nttn_name', 'survey_data.nttn_id'),
            client_category: getUniqueOptions(records, 'survey_data.client_category'),
            requested_delivery: getUniqueOptions(records, 'requested_delivery').map(opt => ({
                ...opt,
                label: opt.label.substring(0, 10),
            })),
            service_handover: getUniqueOptions(records, 'service_handover').map(opt => ({
                ...opt,
                label: opt.label.substring(0, 10),
            })),
        };
    }, [records]);

    // Filter client options based on SBU and NTTN selections
    const filteredClientOptions = useMemo(() => {
        console.log('🔄 Filtering client options...');
        console.log('SBU ID:', formik.values.sbu_id);
        console.log('NTTN ID:', formik.values.nttn_id);
        console.log('Total client options:', clientOptions.length);
        
        // If no SBU or NTTN filter is applied, show all client options
        if (!formik.values.sbu_id && !formik.values.nttn_id) {
            console.log('✅ No filters applied, showing all client options');
            return clientOptions;
        }
        
        let filteredRecords = records;

        if (formik.values.sbu_id) {
            const before = filteredRecords.length;
            filteredRecords = filteredRecords.filter(
                (record) => {
                    const recordSbuId = getNestedValue(record, 'survey_data.sbu_id');
                    const matches = String(recordSbuId) === formik.values.sbu_id;
                    return matches;
                }
            );
            console.log(`📊 After SBU filter: ${before} -> ${filteredRecords.length} records`);
        }

        if (formik.values.nttn_id) {
            const before = filteredRecords.length;
            filteredRecords = filteredRecords.filter(
                (record) => {
                    const recordNttnId = getNestedValue(record, 'survey_data.nttn_id');
                    const matches = String(recordNttnId) === formik.values.nttn_id;
                    return matches;
                }
            );
            console.log(`📊 After NTTN filter: ${before} -> ${filteredRecords.length} records`);
        }

        // Get unique client IDs from filtered records
        const clientIdsInRecords = new Set();
        filteredRecords.forEach(record => {
            const clientId = getNestedValue(record, 'survey_data.client_id');
            if (clientId) {
                clientIdsInRecords.add(String(clientId));
            }
        });
        
        console.log('📊 Client IDs in filtered records:', Array.from(clientIdsInRecords));

        // Filter client options to only show clients that exist in the filtered records
        const filteredOptions = clientOptions.filter(clientOption => 
            clientIdsInRecords.has(clientOption.value)
        );
        
        console.log('✅ Filtered client options:', filteredOptions.length, 'options');
        return filteredOptions;
    }, [records, formik.values.sbu_id, formik.values.nttn_id, clientOptions]);

    // Use filtered options when filters are applied, otherwise use all options
    const displayClientOptions = useMemo(() => {
        return filteredClientOptions.length > 0 ? filteredClientOptions : clientOptions;
    }, [filteredClientOptions, clientOptions]);

    useEffect(() => {
        const currentClientId = formik.values.client_id;
        const isClientValid = displayClientOptions.some(opt => opt.value === currentClientId);

        if (!isClientValid && currentClientId) {
            console.log('🔄 Resetting invalid client selection');
            formik.setFieldValue('client_id', '');
        }
    }, [formik.values.sbu_id, formik.values.nttn_id, formik.setFieldValue, displayClientOptions]);

    const handleLiveChange = useCallback(() => {
        if (live) {
            onFilterChange(formik.values);
        }
    }, [live, onFilterChange, formik.values]);

    useEffect(() => {
        handleLiveChange();
    }, [formik.values, handleLiveChange]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && drawerOpen) {
                setDrawerOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [drawerOpen]);

    useOutside(drawerRef, (e) => {
        if (document.querySelector('[data-calendar-portal]')?.contains(e.target)) return;
        setDrawerOpen(false);
    });

    const clearFilters = () => {
        formik.resetForm({ values: initialValues });
        onFilterChange({});
    };

    const activeFiltersCount = useMemo(() => {
        return Object.values(formik.values).filter(
            (value) => value !== null && value !== '' && value !== undefined
        ).length;
    }, [formik.values]);

    const handleOpenDrawer = () => {
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };

    const handleSbuChange = (value) => {
        console.log('📝 SBU changed to:', value);
        formik.setFieldValue('sbu_id', value);
        
        // Also store the SBU name for reference
        if (value && sbuNameMap.has(String(value))) {
            const sbuName = sbuNameMap.get(String(value));
            formik.setFieldValue('sbu_name', sbuName);
        } else {
            formik.setFieldValue('sbu_name', '');
        }
    };

    const handleClientChange = (value) => {
        console.log('📝 Client changed to:', value);
        console.log('Available client options:', displayClientOptions);
        formik.setFieldValue('client_id', value);
        
        // If a client is selected, find and set its lat/long if available
        if (value) {
            const selectedClient = clientOptions.find(client => client.value === value);
            console.log('🔍 Selected client:', selectedClient);
            if (selectedClient) {
                if (selectedClient.client_lat) {
                    formik.setFieldValue('client_lat', selectedClient.client_lat);
                }
                if (selectedClient.client_long) {
                    formik.setFieldValue('client_long', selectedClient.client_long);
                }
            }
        }
    };

    return (
        <>
            <Button onClick={handleOpenDrawer} leftIcon={Filter} variant="icon">
                Filters
                {activeFiltersCount > 0 && (
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full text-xs font-semibold bg-blue-500 text-white ml-1">
                        {activeFiltersCount}
                    </span>
                )}
            </Button>

            {drawerOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40"
                    onClick={handleCloseDrawer}
                />
            )}

            <div
                ref={drawerRef}
                className={clsx(
                    'fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col',
                    drawerOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="flex-none flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Filter className="h-5 w-5" /> Filter
                    </h2>
                    <Button
                        onClick={handleCloseDrawer}
                        variant="icon"
                        size="sm"
                        title="Close Filters"
                    >
                        <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
                    </Button>
                </div>

                <FormikProvider value={formik}>
                    <form
                        className="flex-1 p-4 space-y-4 overflow-y-auto"
                        onSubmit={formik.handleSubmit}
                    >
                        {/* SBU Filter */}
                        <SelectField
                            name="sbu_id"
                            label={`SBU ${isLoadingSbu ? '(Loading...)' : ''}`}
                            options={sbuOptions}
                            floating={true}
                            searchable={true}
                            value={formik.values.sbu_id}
                            onChange={handleSbuChange}
                            disabled={isLoadingSbu}
                        />

                        {/* Client Name Filter */}
                        <SelectField
                            name="client_id"
                            label={`Client Name ${isLoadingClients ? '(Loading...)' : ''}`}
                            options={displayClientOptions}
                            floating={true}
                            searchable={true}
                            value={formik.values.client_id}
                            onChange={handleClientChange}
                            disabled={isLoadingClients}
                        />

                        {/* Link / SCR ID Filter */}
                        <SelectField
                            name="nttn_work_order_id"
                            label={`Link / SCR ID ${isLoadingNttnWorkOrderIds ? '(Loading...)' : ''}`}
                            options={nttnWorkOrderIds}
                            floating={true}
                            searchable={true}
                            value={formik.values.nttn_work_order_id}
                            onChange={(value) => formik.setFieldValue('nttn_work_order_id', value)}
                            disabled={isLoadingNttnWorkOrderIds}
                        />

                        {/* NTTN Provider ID Filter */}
                        <SelectField
                            name="nttn_survey_id"
                            label={`NTTN Provider ID ${isLoadingNttnSurveyIds ? '(Loading...)' : ''}`}
                            options={nttnSurveyIds}
                            floating={true}
                            searchable={true}
                            value={formik.values.nttn_survey_id}
                            onChange={(value) => formik.setFieldValue('nttn_survey_id', value)}
                            disabled={isLoadingNttnSurveyIds}
                        />

                        {/* Client Lat Filter */}
                        <div className="mb-4">
                            <SimpleTextField
                                label="Client Latitude"
                                value={formik.values.client_lat}
                                onChange={(e) => formik.setFieldValue('client_lat', e.target.value)}
                                placeholder="Enter latitude (exact match)"
                                type="text"
                            />
                        </div>

                        {/* Client Long Filter */}
                        <div className="mb-4">
                            <SimpleTextField
                                label="Client Longitude"
                                value={formik.values.client_long}
                                onChange={(e) => formik.setFieldValue('client_long', e.target.value)}
                                placeholder="Enter longitude (exact match)"
                                type="text"
                            />
                        </div>

                        {/* Requested Delivery Date - From */}
                        <DateField
                            name="requested_delivery_from"
                            label="Requested Delivery Date From"
                            floating={true}
                            className="mb-0"
                            searchable={true}
                            options={dynamicOptions.requested_delivery}
                            value={formik.values.requested_delivery_from}
                            onChange={(v) => formik.setFieldValue('requested_delivery_from', v)}
                            placeholder="Select start date"
                        />

                        {/* Requested Delivery Date - To */}
                        <DateField
                            name="requested_delivery_to"
                            label="Requested Delivery Date To"
                            floating={true}
                            className="mb-0"
                            searchable={true}
                            options={dynamicOptions.requested_delivery}
                            value={formik.values.requested_delivery_to}
                            onChange={(v) => formik.setFieldValue('requested_delivery_to', v)}
                            placeholder="Select end date"
                        />
                    </form>
                </FormikProvider>

                <div className="flex-none p-4 border-t border-gray-200 bg-white flex justify-end gap-2">
                    <Button onClick={clearFilters} intent="ghost" type="button">
                        Clear All
                    </Button>
                    {!live && (
                        <Button intent="primary" type="submit" onClick={formik.handleSubmit}>
                            Apply
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
};

export default WorkOrderFilterMenu;