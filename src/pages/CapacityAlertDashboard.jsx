//src/pages/CapacityAlertDashboard.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import DataTable from '../components/table/DataTable'; // Your reusable DataTable
import Button from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer'; // Restored import
import { Plus, Pencil, Trash2 } from "lucide-react";
import { capitalizer } from '../utils/helpers'; // Assuming this utility exists
import { useToast } from '../hooks/useToast'; 
import ExportButton from '../components/ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import CapacityAlertForm from '../components/CapacityAlertForm';
// 🔑 NEW: Import the Filter Drawer Component
import CapacityAlertFilterDrawer from '../components/filter/CapacityAlertFilterDrawer';

// ================================================================
// MOCK DATA & API SIMULATION (UNCHANGED)
// ================================================================

const MOCK_NAS_IPS = [
    "192.168.1.1", "192.168.1.2", "10.0.0.50", "172.16.0.10"
];
const ALL_NAS_IP_VALUES = MOCK_NAS_IPS; 

let MOCK_ALERTS_DB = [
    {
        id: 1,
        nas_ip_scope: "192.168.1.1, 10.0.0.50",
        max_value_mbps: 1500,
        max_frequency: "2",
        max_affected_days: 7,
        max_created_date: "2023-10-10",
        min_value_mbps: 200,
        min_frequency: "2",
        min_affected_days: 3,
        last_updated: "2023-10-10",
        is_active: true,
        select_all_nas: false,
    },
    {
        id: 2,
        nas_ip_scope: ALL_NAS_IP_VALUES.join(', '), 
        max_value_mbps: 500,
        max_frequency: "2",
        max_affected_days: 1,
        max_created_date: "2023-10-12",
        min_value_mbps: 50,
        min_frequency: "2",
        min_affected_days: 1,
        last_updated: "2023-10-12",
        is_active: true,
        select_all_nas: true,
    },
    // Added for better filter demonstration
    {
        id: 3,
        nas_ip_scope: "172.16.0.10",
        max_value_mbps: 100,
        max_frequency: "1",
        max_affected_days: 1,
        max_created_date: "2023-11-01",
        min_value_mbps: 10,
        min_frequency: "1",
        min_affected_days: 1,
        last_updated: "2023-11-01",
        is_active: true,
        select_all_nas: false,
    },
];
let nextId = 4;

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
        return Promise.reject(new Error("Alert not found."));
    },
    deleteAlert: (id) => {
        const initialLength = MOCK_ALERTS_DB.length;
        MOCK_ALERTS_DB = MOCK_ALERTS_DB.filter(a => a.id !== id);
        if (MOCK_ALERTS_DB.length < initialLength) {
            return Promise.resolve({ success: true });
        }
        return Promise.reject(new Error("Alert not found."));
    }
};

/**
 * Capacity Alert dashboard component with Table view and Form modal.
 */
export default function CapacityAlertDashboard() {
    const { addToast } = useToast();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);

    // 🔑 NEW STATE: Holds the filter payload from the drawer
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
            addToast('Failed to fetch alerts', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    // 🔑 NEW: Central Filter Logic 🔑
    const filteredAlerts = useMemo(() => {
        const filters = activeFilters;
        if (Object.keys(filters).length === 0) {
            return alerts;
        }

        return alerts.filter(row => {
            let matches = true;

            // 1. NAS IP Scope Filter (Check if the row's scope contains the filtered IP)
            if (filters.nas_ip_scope) {
                const ipScopeArray = row.nas_ip_scope?.split(',').map(s => s.trim()) || [];
                if (!ipScopeArray.includes(filters.nas_ip_scope)) {
                    matches = false;
                }
            }
            
            // 2. Max Threshold (Mbps) Range Filter
            const maxMin = filters.max_value_mbps_min;
            if (maxMin !== null && maxMin !== '' && row.max_value_mbps < Number(maxMin)) {
                matches = false;
            }
            const maxMax = filters.max_value_mbps_max;
            if (maxMax !== null && maxMax !== '' && row.max_value_mbps > Number(maxMax)) {
                matches = false;
            }

            // 3. Min Threshold (Mbps) Range Filter
            const minMin = filters.min_value_mbps_min;
            if (minMin !== null && minMin !== '' && row.min_value_mbps < Number(minMin)) {
                matches = false;
            }
            const minMax = filters.min_value_mbps_max;
            if (minMax !== null && minMax !== '' && row.min_value_mbps > Number(minMax)) {
                matches = false;
            }
            
            return matches;
        });
    }, [alerts, activeFilters]);


    // 🔑 NEW: Filter Handler (called by the FilterDrawer)
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
        if (!window.confirm("Are you sure you want to delete this capacity alert configuration?")) return;
        
        try {
            await api.deleteAlert(alertId);
            addToast("Alert configuration deleted successfully.", "success");
        } catch (err) {
            addToast("Failed to delete alert configuration.", "error");
            console.error("Delete failed:", err);
        } finally {
            fetchAlerts();
        }
    };
    
    // --- Form Submission Handler (UNCHANGED logic) ---
    const handleFormSubmit = async (values, { resetForm }) => {
        try {
            const dataToSave = { ...values };

            if (dataToSave.select_all_nas) {
                dataToSave.nas_ip_scope = dataToSave.nas_ip_select.join(', ');
            } else {
                dataToSave.nas_ip_scope = dataToSave.nas_ip_select.join(', ');
            }
            
            delete dataToSave.nas_ip_select; 
            
            if (isEditMode) {
                await api.updateAlert(editingAlert.id, dataToSave);
                addToast("Configuration updated successfully.", "success");
            } else {
                await api.createAlert(dataToSave);
                addToast("Configuration created successfully.", "success");
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
            className: 'min-w-[150px]', 
        },
        { key: 'max_value_mbps', header: 'Max Threshold', },
        { key: 'max_frequency', header: 'Max Freq', render: (val) => capitalizer(val) },
        { key: 'max_affected_days', header: 'Max Consecutive Days', },
        { key: 'min_value_mbps', header: 'Min Threshold', },
        { key: 'min_frequency', header: 'Min Freq', render: (val) => capitalizer(val) },
        { key: 'min_affected_days', header: 'Min Consecutive Days', },
        { key: 'last_updated', header: 'Last Updated' }, 
        {
            key: 'actions',
            header: 'Actions',
            render: (_, row) => (
                <div className="flex justify-center gap-2">
                    <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
                        <Pencil className="h-4 w-4 text-indigo-500 hover:text-indigo-700" />
                    </Button>
                    {/* <Button variant="icon" size="sm" onClick={() => handleDelete(row.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button> */}
                </div>
            )
        }
    ], [handleEdit, handleDelete]);

    // --- Conditional Render (Form View - UNCHANGED) ---
    if (viewMode === 'form') {
        const initialFormValues = editingAlert ? {
            ...editingAlert,
            select_all_nas: editingAlert.select_all_nas,
            nas_ip_select: editingAlert.select_all_nas 
                ? ALL_NAS_IP_VALUES 
                : (editingAlert.nas_ip_scope?.split(',').map(s => s.trim()) || []), 
        } : null;

        return (
            <CapacityAlertForm
                initialValues={initialFormValues}
                isEditMode={isEditMode}
                onSubmit={handleFormSubmit}
                onCancel={() => setViewMode('table')}
            />
        );
    }

    // --- Table View Render (Updated to use filteredAlerts and filterComponent) ---
    return (
        <div className='p-4 lg:p-6 '>
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Capacity Alert Configurations</h1>
                    <p className="text-sm text-gray-500">View and manage maximum and minimum capacity alert thresholds.</p>
                </div>
                <div className='px-6 flex gap-2'>
                    <ExportButton 
                        data={filteredAlerts} // 🔑 Export the filtered data
                        columns={alertColumns} 
                        fileName="capacity_alerts_export" 
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
                    title="Alert Records"
                    data={filteredAlerts} // 🔑 Use the filtered data for the table
                    columns={alertColumns}
                    searchable={true}
                    showId={false}
                    selection={false}
                    // 🔑 NEW PROP: Pass the filter component and its logic
                    filterComponent={
                        <CapacityAlertFilterDrawer 
                            onApply={handleApplyFilters} 
                            allNasIps={ALL_NAS_IP_VALUES} 
                            activeFilters={activeFilters}
                        />
                    }
                />
            )}
        </div>
    );
}