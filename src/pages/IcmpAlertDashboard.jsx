
// // src/pages/IcmpAlertDashboard.jsx

// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import DataTable from '../components/table/DataTable'; // Your reusable DataTable
// import Button from '../components/ui/Button';
// import ToastContainer from '../components/ui/ToastContainer';
// import { Plus, Pencil, Trash2, Zap } from "lucide-react";
// import { capitalizer } from '../utils/helpers'; // Assuming this utility exists
// import { useToast } from '../hooks/useToast'; 

// // Import the new form component
// import ExportButton from '../components/ui/ExportButton';
// import { FaFileExcel } from 'react-icons/fa';
// import IcmpAlertForm from '../components/IcmpAlertForm';

// // ================================================================
// // MOCK DATA & API SIMULATION (MODIFIED)
// // ================================================================

// const MOCK_NAS_IPS = [
//     "192.168.1.1", "192.168.1.2", "10.0.0.50", "172.16.0.10"
// ];
// const ALL_NAS_IP_VALUES = MOCK_NAS_IPS; 

// // Mock database for ICMP alerts - UPDATED FOR NEW FIELD
// let MOCK_ALERTS_DB = [
//     {
//         id: 101,
//         nas_ip_scope: "192.168.1.1, 10.0.0.50",
//         select_all_nas: false,
//         latency_threshold_ms: 100, // <--- NEW FIELD
//         is_active: true,
//     },
//     {
//         id: 102,
//         nas_ip_scope: ALL_NAS_IP_VALUES.join(', '), 
//         select_all_nas: true,
//         latency_threshold_ms: 50, // <--- NEW FIELD
//         is_active: true,
//     },
// ];
// let nextId = 103;

// // Mock API Functions (UNCHANGED)
// const api = {
//     listAlerts: () => Promise.resolve(MOCK_ALERTS_DB),
//     createAlert: (data) => {
//         const newAlert = { id: nextId++, ...data };
//         MOCK_ALERTS_DB.push(newAlert);
//         return Promise.resolve(newAlert);
//     },
//     updateAlert: (id, data) => {
//         const index = MOCK_ALERTS_DB.findIndex(a => a.id === id);
//         if (index > -1) {
//             MOCK_ALERTS_DB[index] = { ...MOCK_ALERTS_DB[index], ...data };
//             return Promise.resolve(MOCK_ALERTS_DB[index]);
//         }
//         return Promise.reject(new Error("ICMP Alert not found."));
//     },
//     deleteAlert: (id) => {
//         const initialLength = MOCK_ALERTS_DB.length;
//         MOCK_ALERTS_DB = MOCK_ALERTS_DB.filter(a => a.id !== id);
//         if (MOCK_ALERTS_DB.length < initialLength) {
//             return Promise.resolve({ success: true });
//         }
//         return Promise.reject(new Error("ICMP Alert not found."));
//     }
// };

// /**
//  * ICMP Alert dashboard component with Table view and Form modal.
//  */
// export default function IcmpAlertDashboard() {
//     const { addToast } = useToast();
//     const [alerts, setAlerts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [viewMode, setViewMode] = useState('table'); // 'table' or 'form'
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editingAlert, setEditingAlert] = useState(null);

//     const formatScope = (row) => 
//         row.select_all_nas ? "All NAS IPs" : row.nas_ip_scope || "N/A";
    
//     // --- Data Fetching ---
//     const fetchAlerts = useCallback(async () => {
//         setLoading(true);
//         try {
//             const data = await api.listAlerts();
//             setAlerts(data);
//         } catch (err) {
//             console.error(err);
//             addToast('Failed to fetch ICMP alerts', 'error');
//         } finally {
//             setLoading(false);
//         }
//     }, [addToast]);

//     useEffect(() => {
//         fetchAlerts();
//     }, [fetchAlerts]);

//     // --- View and Action Handlers (UNCHANGED) ---
//     const openNewForm = () => {
//         setIsEditMode(false);
//         setEditingAlert(null);
//         setViewMode('form');
//     };

//     const handleEdit = (alert) => {
//         setIsEditMode(true);
//         setEditingAlert(alert);
//         setViewMode('form');
//     };

//     const handleDelete = async (alertId) => {
//         if (!window.confirm("Are you sure you want to delete this ICMP alert configuration?")) return;
        
//         try {
//             await api.deleteAlert(alertId);
//             addToast("ICMP alert configuration deleted successfully.", "success");
//         } catch (err) {
//             addToast("Failed to delete ICMP alert configuration.", "error");
//             console.error("Delete failed:", err);
//         } finally {
//             fetchAlerts();
//         }
//     };
    
//     // --- Form Submission Handler (UNCHANGED LOGIC) ---
//     const handleFormSubmit = async (values, { resetForm }) => {
//         try {
//             const dataToSave = { ...values };

//             // Ensure the nas_ip_scope field stores the comma-separated string list
//             if (dataToSave.select_all_nas) {
//                 // When 'select_all_nas' is true, save the full list
//                 dataToSave.nas_ip_scope = dataToSave.nas_ip_select.join(', ');
//             } else {
//                 // When 'select_all_nas' is false, save the manual selections
//                 dataToSave.nas_ip_scope = dataToSave.nas_ip_select.join(', ');
//             }
            
//             // Delete the temporary array field used by Formik
//             delete dataToSave.nas_ip_select; 
            
//             console.log("Submitting ICMP Alert values (final payload):", dataToSave);

//             if (isEditMode) {
//                 await api.updateAlert(editingAlert.id, dataToSave);
//                 addToast("ICMP configuration updated successfully.", "success");
//             } else {
//                 await api.createAlert(dataToSave);
//                 addToast("ICMP configuration created successfully.", "success");
//             }
//         } catch (err) {
//             addToast(err.message || "Save failed.", "error");
//         } finally {
//             fetchAlerts();
//             resetForm();
//             setViewMode('table');
//         }
//     };

//     // --- DataTable Columns (MODIFIED) ---
//     const alertColumns = useMemo(() => [
//         { key: 'id', header: 'ID' },
//         { 
//             key: 'nas_ip_scope', 
//             header: 'Scope', 
//             render: (_, row) => formatScope(row),
//         },
//         // --- UPDATED COLUMN ---
//         { key: 'latency_threshold_ms', header: 'Latency Threshold (ms)' },
//         // --- OLD COLUMNS REMOVED ---
//         // { key: 'ping_threshold_ms', header: 'Ping Threshold (ms)', align: 'right' },
//         // { key: 'loss_threshold_percent', header: 'Loss Threshold (%)', align: 'right' },
//         // { key: 'check_interval_seconds', header: 'Check Interval (s)', align: 'right' },
        
//         { 
//             key: 'is_active', 
//             header: 'Active',
//             render: (_, row) => (
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                     {row.is_active ? 'Yes' : 'No'}
//                 </span>
//             )
//         },
//         {
//             key: 'actions',
//             header: 'Actions',
//             render: (_, row) => (
//                 <div className="flex justify-start gap-2">
//                     <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
//                         <Pencil className="h-4 w-4 text-indigo-500 hover:text-indigo-700" />
//                     </Button>
//                     {/* <Button variant="icon" size="sm" onClick={() => handleDelete(row.id)} title="Delete">
//                         <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
//                     </Button> */}
//                 </div>
//             )
//         }
//     ], [handleEdit, handleDelete]);

//     // --- Conditional Render ---
//     if (viewMode === 'form') {
//         const initialFormValues = editingAlert ? {
//             // Map the old database field names to the new Formik field names if necessary for edit mode
//             ...editingAlert,
//             // The logic for nas_ip_select/nas_ip_manual_select remains correct
//             select_all_nas: editingAlert.select_all_nas,
//             // Map scope back to array for Formik
//             nas_ip_select: editingAlert.select_all_nas 
//                 ? ALL_NAS_IP_VALUES 
//                 : (editingAlert.nas_ip_scope?.split(',').map(s => s.trim()) || []),
//         } : null;

//         return (
//             <IcmpAlertForm
//                 initialValues={initialFormValues}
//                 isEditMode={isEditMode}
//                 onSubmit={handleFormSubmit}
//                 onCancel={() => setViewMode('table')}
//             />
//         );
//     }

//     // --- Table View Render ---
//     return (
//         <div className='p-4 lg:p-6 '>
//             <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
//                 <div>
//                     <h1 className="text-3xl font-extrabold text-gray-900">
                        
//                         ICMP Alert Configurations
//                     </h1>
//                     <p className="text-sm text-gray-500">
//                         View and manage ICMP alert configuration.
//                     </p>
//                 </div>
//                 <div className='px-6 flex gap-2'>
//                     <ExportButton 
//                         data={alerts} 
//                         columns={alertColumns} 
//                         fileName="icmp_alerts_export" 
//                         intent="primary" 
//                         leftIcon={FaFileExcel} 
//                         className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
//                     >
//                         Export
//                     </ExportButton>
//                     <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
//                         Add Configuration
//                     </Button>
//                 </div>

//             </header>

//             {loading ? (
//                 <div className="flex justify-center items-center py-20 text-gray-500">
//                     <p>Loading configurations...</p>
//                 </div>
//             ) : (
//                 <DataTable
//                     title="ICMP Alert Records"
//                     data={alerts}
//                     columns={alertColumns}
//                     searchable={true}
//                     showId={false}
//                     selection={false}
//                 />
//             )}
//         </div>
//     );
// }


// src/pages/IcmpAlertDashboard.jsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import DataTable from '../components/table/DataTable';
import Button from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer';
import { Plus, Pencil, Trash2, Zap, Filter } from "lucide-react";
import { capitalizer } from '../utils/helpers';
import { useToast } from '../hooks/useToast'; 

import ExportButton from '../components/ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import IcmpAlertForm from '../components/IcmpAlertForm';
import IcmpAlertFilterDrawer from '../components/filter/IcmpAlertFilterDrawer';

// ================================================================
// MOCK DATA & API SIMULATION
// ================================================================

const MOCK_NAS_IPS = [
    "192.168.1.1", "192.168.1.2", "10.0.0.50", "172.16.0.10"
];
const ALL_NAS_IP_VALUES = MOCK_NAS_IPS; 

let MOCK_ALERTS_DB = [
    {
        id: 101,
        nas_ip_scope: "192.168.1.1, 10.0.0.50",
        select_all_nas: false,
        latency_threshold_ms: 100, 
        is_active: true,
    },
    {
        id: 102,
        nas_ip_scope: ALL_NAS_IP_VALUES.join(', '), 
        select_all_nas: true,
        latency_threshold_ms: 50, 
        is_active: true,
    },
    {
        id: 103,
        nas_ip_scope: "172.16.0.10",
        select_all_nas: false,
        latency_threshold_ms: 150, 
        is_active: false,
    },
];
let nextId = 104;

const api = {
    listAlerts: () => Promise.resolve(MOCK_ALERTS_DB),
    createAlert: (data) => {
        const newAlert = { id: nextId++, ...data };
        MOCK_ALERTS_DB.push(newAlert);
        return Promise.resolve(newAlert);
    },
    updateAlert: (id, data) => {
        const index = MOCK_ALERTS_DB.findIndex(a => a.id === id);
        if (index > -1) {
            MOCK_ALERTS_DB[index] = { ...MOCK_ALERTS_DB[index], ...data };
            return Promise.resolve(MOCK_ALERTS_DB[index]);
        }
        return Promise.reject(new Error("ICMP Alert not found."));
    },
    deleteAlert: (id) => {
        const initialLength = MOCK_ALERTS_DB.length;
        MOCK_ALERTS_DB = MOCK_ALERTS_DB.filter(a => a.id !== id);
        if (MOCK_ALERTS_DB.length < initialLength) {
            return Promise.resolve({ success: true });
        }
        return Promise.reject(new Error("ICMP Alert not found."));
    }
};

/**
 * ICMP Alert dashboard component with Table view and Form modal.
 */
export default function IcmpAlertDashboard() {
    const { addToast } = useToast();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);

    const [activeFilters, setActiveFilters] = useState({});

    const formatScope = (row) => 
        row.select_all_nas ? "All NAS IPs" : row.nas_ip_scope || "N/A";
    
    // --- Data Fetching ---
    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.listAlerts();
            setAlerts(data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch ICMP alerts', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);
    
    // --- DYNAMIC FILTER OPTIONS (Architecture Adherence) ---
    
    // 🔑 1. NAS IP Filter Options
    const NAS_IP_OPTIONS = useMemo(() => {
        // Collect all IPs from the mock list (or unique IPs from the alerts themselves)
        return MOCK_NAS_IPS.map(ip => ({ value: ip, label: ip }));
    }, []); 

    // 🔑 2. Status Filter Options (Dynamically derived from actual data)
    const STATUS_OPTIONS = useMemo(() => {
        const uniqueStatuses = Array.from(new Set(alerts.map(alert => alert.is_active)));
        
        return uniqueStatuses.map(isActive => ({
            value: String(isActive), // Filter value must be a string
            label: isActive ? 'Active' : 'Inactive',
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [alerts]); 


    // --- Central Filter Logic (Client-Side) ---
    const filteredAlerts = useMemo(() => {
        const filters = activeFilters;
        if (Object.keys(filters).length === 0) {
            return alerts;
        }

        return alerts.filter(alert => {
            let matches = true;
            
            // 1. Activity Status Filter
            if (filters.is_active) {
                const filterActive = filters.is_active === "true";
                if (alert.is_active !== filterActive) {
                    matches = false;
                }
            }
            
            // 2. NAS IP Scope Filter (Check if the alert's scope includes the filtered IP)
            if (filters.nas_ip_filter && alert.nas_ip_scope) {
                const filterIp = filters.nas_ip_filter;
                
                // Check if the alert's nas_ip_scope string contains the filtered IP
                // This is robust enough for comma-separated IP lists
                if (!alert.nas_ip_scope.includes(filterIp)) {
                    matches = false;
                }
            }
            
            return matches;
        });
    }, [alerts, activeFilters]);

    // --- Filter Handler ---
    const handleApplyFilters = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);

    // --- View and Action Handlers (UNCHANGED) ---
    const openNewForm = () => {
        setIsEditMode(false);
        setEditingAlert(null);
        setViewMode('form');
    };

    const handleEdit = (alert) => {
        setIsEditMode(true);
        setEditingAlert(alert);
        setViewMode('form');
    };

    const handleDelete = async (alertId) => {
        if (!window.confirm("Are you sure you want to delete this ICMP alert configuration?")) return;
        
        try {
            await api.deleteAlert(alertId);
            addToast("ICMP alert configuration deleted successfully.", "success");
        } catch (err) {
            addToast("Failed to delete ICMP alert configuration.", "error");
            console.error("Delete failed:", err);
        } finally {
            fetchAlerts();
        }
    };
    
    // --- Form Submission Handler (UNCHANGED) ---
    const handleFormSubmit = async (values, { resetForm }) => {
        try {
            const dataToSave = { ...values };

            if (dataToSave.select_all_nas) {
                dataToSave.nas_ip_scope = ALL_NAS_IP_VALUES.join(', ');
            } else {
                dataToSave.nas_ip_scope = dataToSave.nas_ip_select.join(', ');
            }
            
            delete dataToSave.nas_ip_select; 
            
            console.log("Submitting ICMP Alert values (final payload):", dataToSave);

            if (isEditMode) {
                await api.updateAlert(editingAlert.id, dataToSave);
                addToast("ICMP configuration updated successfully.", "success");
            } else {
                await api.createAlert(dataToSave);
                addToast("ICMP configuration created successfully.", "success");
            }
        } catch (err) {
            addToast(err.message || "Save failed.", "error");
        } finally {
            fetchAlerts();
            resetForm();
            setViewMode('table');
        }
    };

    // --- DataTable Columns (UNCHANGED) ---
    const alertColumns = useMemo(() => [
        { key: 'id', header: 'ID' },
        { 
            key: 'nas_ip_scope', 
            header: 'Scope', 
            render: (_, row) => formatScope(row),
        },
        { key: 'latency_threshold_ms', header: 'Latency Threshold (ms)' },
        
        { 
            key: 'is_active', 
            header: 'Active',
            render: (_, row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_, row) => (
                <div className="flex justify-start gap-2">
                    <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
                        <Pencil className="h-4 w-4 text-indigo-500 hover:text-indigo-700" />
                    </Button>
                </div>
            )
        }
    ], [handleEdit, handleDelete]);

    // --- Conditional Render (UNCHANGED) ---
    if (viewMode === 'form') {
        const initialFormValues = editingAlert ? {
            ...editingAlert,
            nas_ip_select: editingAlert.select_all_nas 
                ? ALL_NAS_IP_VALUES 
                : (editingAlert.nas_ip_scope?.split(',').map(s => s.trim()) || []),
        } : null;

        return (
            <IcmpAlertForm
                initialValues={initialFormValues}
                isEditMode={isEditMode}
                onSubmit={handleFormSubmit}
                onCancel={() => setViewMode('table')}
            />
        );
    }

    // --- Table View Render ---
    return (
        <div className='p-4 lg:p-6 '>
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        ICMP Alert Configurations
                    </h1>
                    <p className="text-sm text-gray-500">
                        View and manage ICMP alert configuration.
                    </p>
                </div>
                <div className='px-6 flex gap-2'>
                    <ExportButton 
                        data={filteredAlerts}
                        columns={alertColumns} 
                        fileName="icmp_alerts_export" 
                        intent="primary" 
                        leftIcon={FaFileExcel} 
                        className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
                    >
                        Export
                    </ExportButton>
                    <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
                        Add Configuration
                    </Button>
                </div>

            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-500">
                    <p>Loading configurations...</p>
                </div>
            ) : (
                <DataTable
                    title="ICMP Alert Records"
                    data={filteredAlerts}
                    columns={alertColumns}
                    searchable={true}
                    showId={false}
                    selection={false}
                    filterComponent={
                        <IcmpAlertFilterDrawer 
                            onApply={handleApplyFilters} 
                            activeFilters={activeFilters}
                            nasIpOptions={NAS_IP_OPTIONS} // 🔑 Dynamic IPs
                            statusOptions={STATUS_OPTIONS} // 🔑 Dynamic Statuses
                        />
                    }
                />
            )}
        </div>
    );
}