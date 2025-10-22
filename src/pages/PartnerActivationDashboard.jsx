
// // src/pages/PartnerActivationDashboard.jsx

// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import DataTable from '../components/table/DataTable'; // Your reusable DataTable
// import Button from '../components/ui/Button';
// import { Plus, Pencil, Trash2 } from "lucide-react";
// import { useToast } from '../hooks/useToast'; 

// // Import the new form component (will be defined next)
// import ExportButton from '../components/ui/ExportButton';
// import { FaFileExcel } from 'react-icons/fa';
// import PartnerActivationForm from '../components/PartnerActivationForm'; 

// // ================================================================
// // MOCK DATA & API SIMULATION
// // ================================================================

// // Mock database for Activation Plans (Only storing the clean structure)
// let MOCK_ACTIVATION_DB = [
//     {
//         id: 701,
//         nttn_link_id: "NTTN-LINK-001",
//         nttn_vlan: "101", 
//         int_peering_ip: "10.10.10.1/30",
//         ggc_peering_ip: "192.0.2.1/30",
//         fna_peering_ip: "203.0.113.1/30",
//         bdix_peering_ip: "172.16.0.1/30",
//         mcdn_peering_ip: "10.20.20.1/30",
//         asn: "AS65001",
//         nas_ip: "10.10.10.254",
//         nat_ip: "10.10.10.250",
//         int_vlan: "10", 
//         ggn_vlan: "20", 
//         fna_vlan: "30", 
//         bdix_vlan: "40", 
//         mcdn_vlan: "50", 
//         connected_sw_name: "SW-CORE-01",
//         chr_server: "CHR-SERVER-A",
//         sw_port: "Gi1/0/1",
//         nic_no: "NIC-007",
//         // NEW STANDALONE FIELDS
//         status: "active",
//         note: "Primary activation.",
//         drop_devices: [{device_ip: "10.1.1.1", usage_vlan: "201", connected_port: "G0/1/1"}], 
//         interface_configs: [{interface_name: "Eth0/1"}], // Simplified array structure
//         last_updated: "2023-10-12",
//     },
//     {
//         id: 702,
//         nttn_link_id: "NTTN-LINK-003",
//         nttn_vlan: "303", 
//         int_peering_ip: "10.10.10.5/30",
//         ggc_peering_ip: "192.0.2.5/30",
//         fna_peering_ip: "203.0.113.5/30",
//         bdix_peering_ip: "172.16.0.5/30",
//         mcdn_peering_ip: "10.20.20.5/30",
//         asn: "AS65002",
//         nas_ip: "10.10.10.253",
//         nat_ip: "10.10.10.249",
//         int_vlan: "11", 
//         ggn_vlan: "21", 
//         fna_vlan: "31", 
//         bdix_vlan: "41", 
//         mcdn_vlan: "51", 
//         connected_sw_name: "SW-EDGE-05",
//         chr_server: "CHR-SERVER-B",
//         sw_port: "Gi1/0/5",
//         nic_no: "NIC-008",
//         // NEW STANDALONE FIELDS
//         status: "inactive",
//         note: "Initial config, needs verification.",
//         drop_devices: [{device_ip: "10.2.2.1", usage_vlan: "301", connected_port: "G0/1/1"}], 
//         interface_configs: [{interface_name: "Eth0/3"}], // Simplified array structure
//         last_updated: "2023-10-15",
//     },
// ];
// let nextId = 703;

// // Mock API Functions
// const api = {
//     listPlans: () => Promise.resolve(MOCK_ACTIVATION_DB),
//     createPlan: (data) => {
//         const newPlan = { id: nextId++, ...data };
//         MOCK_ACTIVATION_DB.push(newPlan);
//         return Promise.resolve(newPlan);
//     },
//     updatePlan: (id, data) => {
//         const index = MOCK_ACTIVATION_DB.findIndex(a => a.id === id);
//         if (index > -1) {
//             MOCK_ACTIVATION_DB[index] = { ...MOCK_ACTIVATION_DB[index], ...data };
//             return Promise.resolve(MOCK_ACTIVATION_DB[index]);
//         }
//         return Promise.reject(new Error("Activation Plan not found."));
//     },
//     deletePlan: (id) => {
//         const initialLength = MOCK_ACTIVATION_DB.length;
//         MOCK_ACTIVATION_DB = MOCK_ACTIVATION_DB.filter(a => a.id !== id);
//         if (MOCK_ACTIVATION_DB.length < initialLength) {
//             return Promise.resolve({ success: true });
//         }
//         return Promise.reject(new Error("Activation Plan not found."));
//     }
// };

// /**
//  * Partner Activation dashboard component with Table view and Form modal.
//  */
// export default function PartnerActivationDashboard() {
//     const { addToast } = useToast();
//     const [plans, setPlans] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [viewMode, setViewMode] = useState('table'); // 'table' or 'form'
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editingPlan, setEditingPlan] = useState(null);

//     // --- Data Fetching ---
//     const fetchPlans = useCallback(async () => {
//         setLoading(true);
//         try {
//             const data = await api.listPlans();
//             setPlans(data);
//         } catch (err) {
//             console.error(err);
//             addToast('Failed to fetch activation plans', 'error');
//         } finally {
//             setLoading(false);
//         }
//     }, [addToast]);

//     useEffect(() => {
//         fetchPlans();
//     }, [fetchPlans]);

//     // --- View and Action Handlers ---
//     const openNewForm = () => {
//         setIsEditMode(false);
//         setEditingPlan(null);
//         setViewMode('form');
//     };

//     const handleEdit = (plan) => {
//         setIsEditMode(true);
//         setEditingPlan(plan);
//         setViewMode('form');
//     };

//     const handleDelete = async (planId) => {
//         if (!window.confirm("Are you sure you want to delete this activation plan?")) return;
        
//         try {
//             await api.deletePlan(planId);
//             addToast("Activation Plan deleted successfully.", "success");
//         } catch (err) {
//             addToast("Failed to delete activation plan.", "error");
//             console.error("Delete failed:", err);
//         } finally {
//             fetchPlans();
//         }
//     };
    
//     // --- Form Submission Handler ---
//     const handleFormSubmit = async (values, { resetForm }) => {
//         try {
//             // Destructure to omit *all* temporary fields from submission, as required
//             const { 
//                 new_device_ip, new_usage_vlan, new_connected_port, 
//                 new_interface_name, 
//                 // new_status and new_note were removed from form, but kept in destructuring 
//                 // for robustness if other temporary fields were added.
//                 // However, they are not necessary here since they are top-level fields now.
//                 ...submitValues 
//             } = values;
            
//             // 🔥 RESTORED CONSOLE LOG
//             console.log("Submitting Activation Plan (Clean JSON):", JSON.stringify(submitValues, null, 2));

//             if (isEditMode) {
//                 await api.updatePlan(editingPlan.id, submitValues);
//                 addToast("Activation Plan updated successfully!", "success");
//             } else {
//                 await api.createPlan(submitValues);
//                 addToast("Activation Plan created successfully!", "success");
//             }
//         } catch (err) {
//             addToast(err.message || "Save failed.", "error");
//         } finally {
//             fetchPlans();
//             resetForm();
//             setViewMode('table');
//         }
//     };

//     // --- DataTable Columns (EXPANDED) ---
//     const planColumns = useMemo(() => [
//         { key: 'nttn_link_id', header: 'Link ID' },
//         { key: 'asn', header: 'ASN' },
//         { key: 'nas_ip', header: 'NAS IP' },
//         { key: 'nat_ip', header: 'NAT IP' },
//         { key: 'nttn_vlan', header: 'NTTN VLAN' }, 
        
//         // Peering IPs
//         { key: 'int_peering_ip', header: 'INT IP', width: '9%' },
//         { key: 'ggc_peering_ip', header: 'GGC IP', width: '9%' },
//         { key: 'fna_peering_ip', header: 'FNA IP', width: '9%' },
//         { key: 'bdix_peering_ip', header: 'BDIX IP', width: '9%' },
        
//         // VLANs
//         { key: 'int_vlan', header: 'INT VLAN', width: '5%' },
//         { key: 'ggn_vlan', header: 'GGN VLAN', width: '5%' },
        
//         // Misc Hardware
//         { key: 'connected_sw_name', header: 'Switch' },
//         { key: 'sw_port', header: 'Port' },
//         { key: 'chr_server', header: 'CHR Server' },
        
//         // Arrays Count
//         {
//             key: 'devices_count',
//             header: 'Devices',
//             align: 'center',
//             render: (_, row) => (row.drop_devices?.length || 0), 
//         },
//         {
//             key: 'interfaces_count',
//             header: 'Interfaces',
//             align: 'center',
//             render: (_, row) => (row.interface_configs?.length || 0), 
//         },
//         { key: 'last_updated', header: 'Last Updated' },
//         { 
//         key: 'status', 
//         header: 'Status',
//         // --- Custom Render for Status ---
//         render: (status) => {
//             const is_active = status === 'active';
            
//             // Define Tailwind classes for active and inactive states
//             const baseClasses = "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium";
            
//             const colorClasses = is_active
//                 ? "bg-green-100 text-green-800" // Green for Active
//                 : "bg-red-100 text-red-800";   // Red for Inactive

//             return (
//                 <span className={`${baseClasses} ${colorClasses}`}>
//                     {status}
//                 </span>
//             );
//         }
//     },
    
//         // Actions
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

//     // --- Conditional Render: FORM VIEW ---
//     if (viewMode === 'form') {
//         return (
//             <PartnerActivationForm
//                 initialValues={editingPlan}
//                 isEditMode={isEditMode}
//                 onSubmit={handleFormSubmit}
//                 onCancel={() => setViewMode('table')}
//             />
//         );
//     }

//     // --- Conditional Render: TABLE VIEW ---
//     return (
//         <div className='p-4 lg:p-6 '>
//             <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
//                 <div>
//                     <h1 className="text-3xl font-extrabold text-gray-900">
//                         Partner Activation Plans
//                     </h1>
//                     <p className="text-sm text-gray-500">
//                         View and manage the configuration of partner activation.
//                     </p>
//                 </div>
//                 <div className='px-6 flex gap-2'>
//                     <ExportButton 
//                         data={plans} 
//                         columns={planColumns} 
//                         fileName="partner_activation_plans_export" 
//                         intent="primary" 
//                         leftIcon={FaFileExcel} 
//                         className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
//                     >
//                         Export
//                     </ExportButton>
//                     <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
//                         Create New Plan
//                     </Button>
//                 </div>
                
//             </header>

//             {loading ? (
//                 <div className="flex justify-center items-center py-20 text-gray-500">
//                     <p>Loading activation plans...</p>
//                 </div>
//             ) : (
//                 <DataTable
//                     title="Activation Records"
//                     data={plans}
//                     columns={planColumns}
//                     searchable={true}
//                     showId={true}
//                     selection={false}
//                 />
//             )}
//         </div>
//     );
// }


// src/pages/PartnerActivationDashboard.jsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import DataTable from '../components/table/DataTable'; // Your reusable DataTable
import Button from '../components/ui/Button';
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from '../hooks/useToast'; 

import ExportButton from '../components/ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import PartnerActivationForm from '../components/PartnerActivationForm'; 
// 🔑 Import the Filter Drawer Component
import PartnerActivationFilterDrawer from '../components/filter/PartnerActivationFilterDrawer'; 

// ================================================================
// MOCK DATA & API SIMULATION (UNCHANGED)
// ================================================================

let MOCK_ACTIVATION_DB = [
    {
        id: 701,
        nttn_link_id: "NTTN-LINK-001",
        nttn_vlan: "101", 
        int_peering_ip: "10.10.10.1/30",
        ggc_peering_ip: "192.0.2.1/30",
        fna_peering_ip: "203.0.113.1/30",
        bdix_peering_ip: "172.16.0.1/30",
        mcdn_peering_ip: "10.20.20.1/30",
        asn: "AS65001",
        nas_ip: "10.10.10.254",
        nat_ip: "10.10.10.250",
        int_vlan: "10", 
        ggn_vlan: "20", 
        fna_vlan: "30", 
        bdix_vlan: "40", 
        mcdn_vlan: "50", 
        connected_sw_name: "SW-CORE-01",
        chr_server: "CHR-SERVER-A",
        sw_port: "Gi1/0/1",
        nic_no: "NIC-007",
        status: "active",
        note: "Primary activation.",
        drop_devices: [{device_ip: "10.1.1.1", usage_vlan: "201", connected_port: "G0/1/1"}], 
        interface_configs: [{interface_name: "Eth0/1"}],
        last_updated: "2023-10-12",
    },
    {
        id: 702,
        nttn_link_id: "NTTN-LINK-003",
        nttn_vlan: "303", 
        int_peering_ip: "10.10.10.5/30",
        ggc_peering_ip: "192.0.2.5/30",
        fna_peering_ip: "203.0.113.5/30",
        bdix_peering_ip: "172.16.0.5/30",
        mcdn_peering_ip: "10.20.20.5/30",
        asn: "AS65002",
        nas_ip: "10.10.10.253",
        nat_ip: "10.10.10.249",
        int_vlan: "11", 
        ggn_vlan: "21", 
        fna_vlan: "31", 
        bdix_vlan: "41", 
        mcdn_vlan: "51", 
        connected_sw_name: "SW-EDGE-05",
        chr_server: "CHR-SERVER-B",
        sw_port: "Gi1/0/5",
        nic_no: "NIC-008",
        status: "inactive",
        note: "Initial config, needs verification.",
        drop_devices: [{device_ip: "10.2.2.1", usage_vlan: "301", connected_port: "G0/1/1"}], 
        interface_configs: [{interface_name: "Eth0/3"}],
        last_updated: "2023-10-15",
    },
];
let nextId = 703;

const api = {
    listPlans: () => Promise.resolve(MOCK_ACTIVATION_DB),
    createPlan: (data) => {
        const newPlan = { id: nextId++, ...data };
        MOCK_ACTIVATION_DB.push(newPlan);
        return Promise.resolve(newPlan);
    },
    updatePlan: (id, data) => {
        const index = MOCK_ACTIVATION_DB.findIndex(a => a.id === id);
        if (index > -1) {
            MOCK_ACTIVATION_DB[index] = { ...MOCK_ACTIVATION_DB[index], ...data };
            return Promise.resolve(MOCK_ACTIVATION_DB[index]);
        }
        return Promise.reject(new Error("Activation Plan not found."));
    },
    deletePlan: (id) => {
        const initialLength = MOCK_ACTIVATION_DB.length;
        MOCK_ACTIVATION_DB = MOCK_ACTIVATION_DB.filter(a => a.id !== id);
        if (MOCK_ACTIVATION_DB.length < initialLength) {
            return Promise.resolve({ success: true });
        }
        return Promise.reject(new Error("Activation Plan not found."));
    }
};

/**
 * Partner Activation dashboard component with Table view and Form modal.
 */
export default function PartnerActivationDashboard() {
    const { addToast } = useToast();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    // 🔑 NEW STATE: Holds the filter payload from the drawer
    const [activeFilters, setActiveFilters] = useState({});

    // --- Data Fetching ---
    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.listPlans();
            setPlans(data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch activation plans', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // 🔑 Central Filter Logic (Client-Side)
    const filteredPlans = useMemo(() => {
        const filters = activeFilters;
        if (Object.keys(filters).length === 0) {
            return plans;
        }

        return plans.filter(plan => {
            let matches = true;

            // 1. NTTN Link ID Filter
            if (filters.nttn_link_id && plan.nttn_link_id !== filters.nttn_link_id) {
                matches = false;
            }
            
            // 2. Connected Switch Name Filter
            if (filters.connected_sw_name && plan.connected_sw_name !== filters.connected_sw_name) {
                matches = false;
            }

            // 3. Status Filter
            if (filters.status && plan.status !== filters.status) {
                matches = false;
            }
            
            return matches;
        });
    }, [plans, activeFilters]);

    // 🔑 Filter Handler (called by the FilterDrawer)
    const handleApplyFilters = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);


    // --- View and Action Handlers (UNCHANGED) ---
    const openNewForm = () => {
        setIsEditMode(false);
        setEditingPlan(null);
        setViewMode('form');
    };

    const handleEdit = (plan) => {
        setIsEditMode(true);
        setEditingPlan(plan);
        setViewMode('form');
    };

    const handleDelete = async (planId) => {
        if (!window.confirm("Are you sure you want to delete this activation plan?")) return;
        
        try {
            await api.deletePlan(planId);
            addToast("Activation Plan deleted successfully.", "success");
        } catch (err) {
            addToast("Failed to delete activation plan.", "error");
            console.error("Delete failed:", err);
        } finally {
            fetchPlans();
        }
    };
    
    // --- Form Submission Handler (UNCHANGED) ---
    const handleFormSubmit = async (values, { resetForm }) => {
        try {
            const { 
                new_device_ip, new_usage_vlan, new_connected_port, 
                new_interface_name, 
                ...submitValues 
            } = values;
            
            console.log("Submitting Activation Plan (Clean JSON):", JSON.stringify(submitValues, null, 2));

            if (isEditMode) {
                await api.updatePlan(editingPlan.id, submitValues);
                addToast("Activation Plan updated successfully!", "success");
            } else {
                await api.createPlan(submitValues);
                addToast("Activation Plan created successfully!", "success");
            }
        } catch (err) {
            addToast(err.message || "Save failed.", "error");
        } finally {
            fetchPlans();
            resetForm();
            setViewMode('table');
        }
    };

    // --- DataTable Columns (UNCHANGED) ---
    const planColumns = useMemo(() => [
        { key: 'id', header: 'ID' }, 
        { key: 'nttn_link_id', header: 'Link ID' },
        { key: 'asn', header: 'ASN' },
        { key: 'nas_ip', header: 'NAS IP' },
        { key: 'nat_ip', header: 'NAT IP' },
        { key: 'nttn_vlan', header: 'NTTN VLAN' }, 
        
        // Peering IPs
        { key: 'int_peering_ip', header: 'INT IP', width: '9%' },
        { key: 'ggc_peering_ip', header: 'GGC IP', width: '9%' },
        { key: 'fna_peering_ip', header: 'FNA IP', width: '9%' },
        { key: 'bdix_peering_ip', header: 'BDIX IP', width: '9%' },
        
        // VLANs
        { key: 'int_vlan', header: 'INT VLAN', width: '5%' },
        { key: 'ggn_vlan', header: 'GGN VLAN', width: '5%' },
        
        // Misc Hardware
        { key: 'connected_sw_name', header: 'Switch' },
        { key: 'sw_port', header: 'Port' },
        { key: 'chr_server', header: 'CHR Server' },
        
        // Arrays Count
        {
            key: 'devices_count',
            header: 'Devices',
            align: 'center',
            render: (_, row) => (row.drop_devices?.length || 0), 
        },
        {
            key: 'interfaces_count',
            header: 'Interfaces',
            align: 'center',
            render: (_, row) => (row.interface_configs?.length || 0), 
        },
        { key: 'last_updated', header: 'Last Updated' },
        { 
        key: 'status', 
        header: 'Status',
        render: (status) => {
            const is_active = status === 'active';
            const baseClasses = "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium";
            const colorClasses = is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800";
            return (
                <span className={`${baseClasses} ${colorClasses}`}>
                    {status}
                </span>
            );
        }
    },
    
        // Actions
        {
            key: 'actions',
            header: 'Actions',
            render: (_, row) => (
                <div className="flex justify-start gap-2">
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

    // --- Conditional Render: FORM VIEW (UNCHANGED) ---
    if (viewMode === 'form') {
        return (
            <PartnerActivationForm
                initialValues={editingPlan}
                isEditMode={isEditMode}
                onSubmit={handleFormSubmit}
                onCancel={() => setViewMode('table')}
            />
        );
    }

    // --- Conditional Render: TABLE VIEW (Updated to use filteredPlans and filterComponent) ---
    return (
        <div className='p-4 lg:p-6 '>
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Partner Activation Plans
                    </h1>
                    <p className="text-sm text-gray-500">
                        View and manage the configuration of partner activation.
                    </p>
                </div>
                <div className='px-6 flex gap-2'>
                    <ExportButton 
                        data={filteredPlans} // 🔑 Export the filtered data
                        columns={planColumns} 
                        fileName="partner_activation_plans_export" 
                        intent="primary" 
                        leftIcon={FaFileExcel} 
                        className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
                    >
                        Export
                    </ExportButton>
                    <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
                        Create New Plan
                    </Button>
                    {/* The filter button is NO LONGER HERE in the header */}
                </div>
                
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-500">
                    <p>Loading activation plans...</p>
                </div>
            ) : (
                <DataTable
                    title="Activation Records"
                    data={filteredPlans} // 🔑 Pass the filtered data to the table
                    columns={planColumns}
                    searchable={true}
                    showId={true}
                    selection={false}
                    // 🔑 CORRECT INTEGRATION: Pass the drawer as a prop to DataTable
                    filterComponent={
                        <PartnerActivationFilterDrawer 
                            onApply={handleApplyFilters} 
                            activeFilters={activeFilters}
                        />
                    }
                />
            )}
        </div>
    );
}