// // src/pages/PartnerInfoDashboard.jsx

// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import DataTable from '../components/table/DataTable'; // Your reusable DataTable
// import Button from '../components/ui/Button';
// import { Plus, Pencil, Trash2 } from "lucide-react";
// import { useToast } from '../hooks/useToast'; 

// // Import the new form component
// import ExportButton from '../components/ui/ExportButton';
// import { FaFileExcel } from 'react-icons/fa';
// import PartnerInfoForm from '../components/PartnerInfoForm'; 

// // ================================================================
// // MOCK DATA & API SIMULATION
// // ================================================================

// // Mock database for Partner Configurations
// let MOCK_PARTNER_CONFIG_DB = [
//     {
//         id: 501,
//         nttn_link_id: "NTTN-LINK-001",
//         network_code: "RACE-A1",
//         address: "Dhaka Central PO Box 1000",
//         contract_number: "C-9001",
//         technical_kam: "abir_hossain",
//         router_identity: "RT-DH-A1",
//         radius: "radius_1",
//     },
//     {
//         id: 502,
//         nttn_link_id: "NTTN-LINK-003",
//         network_code: "LINK-X5",
//         address: "Chittagong Port Area",
//         contract_number: "C-9002",
//         technical_kam: "nazia_rahman",
//         router_identity: "RT-CTG-X5",
//         radius: "radius_2",
//     },
// ];
// let nextId = 503;

// // Mock API Functions
// const api = {
//     listPartners: () => Promise.resolve(MOCK_PARTNER_CONFIG_DB),
//     createPartner: (data) => {
//         const newConfig = { id: nextId++, ...data };
//         MOCK_PARTNER_CONFIG_DB.push(newConfig);
//         return Promise.resolve(newConfig);
//     },
//     updatePartner: (id, data) => {
//         const index = MOCK_PARTNER_CONFIG_DB.findIndex(a => a.id === id);
//         if (index > -1) {
//             MOCK_PARTNER_CONFIG_DB[index] = { ...MOCK_PARTNER_CONFIG_DB[index], ...data };
//             return Promise.resolve(MOCK_PARTNER_CONFIG_DB[index]);
//         }
//         return Promise.reject(new Error("Partner config not found."));
//     },
//     deletePartner: (id) => {
//         const initialLength = MOCK_PARTNER_CONFIG_DB.length;
//         MOCK_PARTNER_CONFIG_DB = MOCK_PARTNER_CONFIG_DB.filter(a => a.id !== id);
//         if (MOCK_PARTNER_CONFIG_DB.length < initialLength) {
//             return Promise.resolve({ success: true });
//         }
//         return Promise.reject(new Error("Partner config not found."));
//     }
// };

// /**
//  * Partner Info dashboard component with Table view and Form modal.
//  */
// export default function PartnerInfoDashboard() {
//     const { addToast } = useToast();
//     const [configs, setConfigs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [viewMode, setViewMode] = useState('table'); // 'table' or 'form'
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editingConfig, setEditingConfig] = useState(null);

//     // --- Data Fetching ---
//     const fetchConfigs = useCallback(async () => {
//         setLoading(true);
//         try {
//             const data = await api.listPartners();
//             setConfigs(data);
//         } catch (err) {
//             console.error(err);
//             addToast('Failed to fetch partner configurations', 'error');
//         } finally {
//             setLoading(false);
//         }
//     }, [addToast]);

//     useEffect(() => {
//         fetchConfigs();
//     }, [fetchConfigs]);

//     // --- View and Action Handlers ---
//     const openNewForm = () => {
//         setIsEditMode(false);
//         setEditingConfig(null);
//         setViewMode('form');
//     };

//     const handleEdit = (config) => {
//         setIsEditMode(true);
//         setEditingConfig(config);
//         setViewMode('form');
//     };

//     const handleDelete = async (configId) => {
//         if (!window.confirm("Are you sure you want to delete this partner configuration?")) return;
        
//         try {
//             await api.deletePartner(configId);
//             addToast("Configuration deleted successfully.", "success");
//         } catch (err) {
//             addToast("Failed to delete configuration.", "error");
//             console.error("Delete failed:", err);
//         } finally {
//             fetchConfigs();
//         }
//     };
    
//     // --- Form Submission Handler ---
//     const handleFormSubmit = async (values, { resetForm }) => {
//         try {
//             // 🔥 Restored Console Log
//             console.log("Submitting Partner Info:", values); 
            
//             if (isEditMode) {
//                 await api.updatePartner(editingConfig.id, values);
//                 addToast("Configuration updated successfully.", "success");
//             } else {
//                 await api.createPartner(values);
//                 addToast("Configuration created successfully.", "success");
//             }
//         } catch (err) {
//             addToast(err.message || "Save failed.", "error");
//         } finally {
//             fetchConfigs();
//             resetForm();
//             setViewMode('table');
//         }
//     };

//     // --- DataTable Columns ---
//     const configColumns = useMemo(() => [
//         { key: 'nttn_link_id', header: 'NTTN Link ID' },
//         { key: 'network_code', header: 'Network Code' },
//         { key: 'contract_number', header: 'Contract' },
//         { key: 'technical_kam', header: 'Technical KAM' },
//         { key: 'router_identity', header: 'Router ID' },
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
//             <PartnerInfoForm
//                 initialValues={editingConfig}
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
//                         Partner Configuration
//                     </h1>
//                     <p className="text-sm text-gray-500">
//                         View and manage partner network and business configuration settings.
//                     </p>
//                 </div>
//                 <div className='px-6 flex gap-2'>
//                     <ExportButton 
//                         data={configs} 
//                         columns={configColumns} 
//                         fileName="partner_configs_export" 
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
//                     <p>Loading partner configurations...</p>
//                 </div>
//             ) : (
//                 <DataTable
//                     title="Partner Records"
//                     data={configs}
//                     columns={configColumns}
//                     searchable={true}
//                     showId={true}
//                     selection={false}
//                 />
//             )}
//         </div>
//     );
// }


// src/pages/PartnerInfoDashboard.jsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import DataTable from '../components/table/DataTable'; // Your reusable DataTable
import Button from '../components/ui/Button';
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from '../hooks/useToast'; 

// Import components
import ExportButton from '../components/ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import PartnerInfoForm from '../components/PartnerInfoForm'; 
import PartnerInfoFilterDrawer from '../components/filter/PartnerInfoFilterDrawer'; 

// ================================================================
// MOCK DATA & API SIMULATION
// ================================================================

// Mock database for Partner Configurations
let MOCK_PARTNER_CONFIG_DB = [
    {
        id: 501,
        nttn_link_id: "NTTN-LINK-001",
        network_code: "RACE-A1",
        address: "Dhaka Central PO Box 1000",
        contract_number: "C-9001",
        technical_kam: "abir_hossain",
        router_identity: "RT-DH-A1",
        radius: "radius_1",
    },
    {
        id: 502,
        nttn_link_id: "NTTN-LINK-003",
        network_code: "LINK-X5",
        address: "Chittagong Port Area",
        contract_number: "C-9002",
        technical_kam: "nazia_rahman",
        router_identity: "RT-CTG-X5",
        radius: "radius_2",
    },
    // Adding another mock entry for better filtering demo
    {
        id: 503,
        nttn_link_id: "NTTN-LINK-005",
        network_code: "RACE-A1",
        address: "Khulna",
        contract_number: "C-9003",
        technical_kam: "abir_hossain",
        router_identity: "RT-KH-A3",
        radius: "radius_1",
    },
];
let nextId = 504;

// Mock API Functions
const api = {
    listPartners: () => Promise.resolve(MOCK_PARTNER_CONFIG_DB),
    createPartner: (data) => {
        const newConfig = { id: nextId++, ...data };
        MOCK_PARTNER_CONFIG_DB.push(newConfig);
        return Promise.resolve(newConfig);
    },
    updatePartner: (id, data) => {
        const index = MOCK_PARTNER_CONFIG_DB.findIndex(a => a.id === id);
        if (index > -1) {
            MOCK_PARTNER_CONFIG_DB[index] = { ...MOCK_PARTNER_CONFIG_DB[index], ...data };
            return Promise.resolve(MOCK_PARTNER_CONFIG_DB[index]);
        }
        return Promise.reject(new Error("Partner config not found."));
    },
    deletePartner: (id) => {
        const initialLength = MOCK_PARTNER_CONFIG_DB.length;
        MOCK_PARTNER_CONFIG_DB = MOCK_PARTNER_CONFIG_DB.filter(a => a.id !== id);
        if (MOCK_PARTNER_CONFIG_DB.length < initialLength) {
            return Promise.resolve({ success: true });
        }
        return Promise.reject(new Error("Partner config not found."));
    }
};

/**
 * Partner Info dashboard component with Table view and Form modal.
 */
export default function PartnerInfoDashboard() {
    const { addToast } = useToast();
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'form'
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);

    // Holds the filter payload from the drawer
    const [activeFilters, setActiveFilters] = useState({});

    // --- Data Fetching ---
    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.listPartners();
            setConfigs(data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch partner configurations', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    // Derive filter options data structure from the main config data 
    const filterMetadata = useMemo(() => {
        const pairs = configs.map(c => ({
            network_code: c.network_code,
            technical_kam: c.technical_kam
        }));
        return pairs;
    }, [configs]);


    // Central Filter Logic (Client-Side)
    const filteredConfigs = useMemo(() => {
        const filters = activeFilters;
        if (Object.keys(filters).length === 0) {
            return configs;
        }

        return configs.filter(config => {
            let matches = true;

            // 1. Network Code Filter
            if (filters.network_code && config.network_code !== filters.network_code) {
                matches = false;
            }
            
            // 2. Technical KAM Filter
            if (filters.technical_kam && config.technical_kam !== filters.technical_kam) {
                matches = false;
            }
            
            return matches;
        });
    }, [configs, activeFilters]);

    // Filter Handler (called by the FilterDrawer)
    const handleApplyFilters = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);


    // --- View and Action Handlers ---
    const openNewForm = () => {
        setIsEditMode(false);
        setEditingConfig(null);
        setViewMode('form');
    };

    const handleEdit = (config) => {
        setIsEditMode(true);
        setEditingConfig(config);
        setViewMode('form');
    };

    const handleDelete = async (configId) => {
        if (!window.confirm("Are you sure you want to delete this partner configuration?")) return;
        
        try {
            await api.deletePartner(configId);
            addToast("Configuration deleted successfully.", "success");
        } catch (err) {
            addToast("Failed to delete configuration.", "error");
            console.error("Delete failed:", err);
        } finally {
            fetchConfigs();
        }
    };
    
    // --- Form Submission Handler ---
    const handleFormSubmit = async (values, { resetForm }) => {
        try {
            console.log("Submitting Partner Info:", values); 
            
            if (isEditMode) {
                await api.updatePartner(editingConfig.id, values);
                addToast("Configuration updated successfully.", "success");
            } else {
                await api.createPartner(values);
                addToast("Configuration created successfully.", "success");
            }
        } catch (err) {
            addToast(err.message || "Save failed.", "error");
        } finally {
            fetchConfigs();
            resetForm();
            setViewMode('table');
        }
    };

    // --- DataTable Columns ---
    const configColumns = useMemo(() => [
        { key: 'id', header: 'ID' }, // Added ID back to the columns for clarity
        { key: 'nttn_link_id', header: 'NTTN Link ID' },
        { key: 'network_code', header: 'Network Code' },
        { key: 'contract_number', header: 'Contract' },
        { key: 'technical_kam', header: 'Technical KAM' },
        { key: 'router_identity', header: 'Router ID' },
        {
            key: 'actions',
            header: 'Actions',
            render: (_, row) => (
                <div className="flex justify-start gap-2">
                    <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
                        <Pencil className="h-4 w-4 text-indigo-500 hover:text-indigo-700" />
                    </Button>
                    {/* Delete button commented out to match original code */}
                    {/* <Button variant="icon" size="sm" onClick={() => handleDelete(row.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button> */}
                </div>
            )
        }
    ], [handleEdit, handleDelete]);

    // --- Conditional Render: FORM VIEW ---
    if (viewMode === 'form') {
        return (
            <PartnerInfoForm
                initialValues={editingConfig}
                isEditMode={isEditMode}
                onSubmit={handleFormSubmit}
                onCancel={() => setViewMode('table')}
            />
        );
    }

    // --- Conditional Render: TABLE VIEW ---
    return (
        <div className='p-4 lg:p-6 '>
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Partner Configuration
                    </h1>
                    <p className="text-sm text-gray-500">
                        View and manage partner network and business configuration settings.
                    </p>
                </div>
                <div className='px-6 flex gap-2'>
                    <ExportButton 
                        data={filteredConfigs} // Export the filtered data
                        columns={configColumns} 
                        fileName="partner_configs_export" 
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
                    <p>Loading partner configurations...</p>
                </div>
            ) : (
                <DataTable
                    title="Partner Records"
                    data={filteredConfigs} // Pass the filtered data to the table
                    columns={configColumns}
                    searchable={true}
                    showId={true}
                    selection={false}
                    // Integrate the Filter Drawer
                    filterComponent={
                        <PartnerInfoFilterDrawer 
                            onApply={handleApplyFilters} 
                            activeFilters={activeFilters}
                            // Pass the dynamic filter metadata
                            masterFilterData={filterMetadata} 
                        />
                    }
                />
            )}
        </div>
    );
}