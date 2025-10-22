// // src/pages/TechnicalKAMDashboard.jsx

// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import DataTable from '../components/table/DataTable'; // Your reusable DataTable
// import Button from '../components/ui/Button';
// import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
// import { useToast } from '../hooks/useToast'; 

// // Import the new form component (will be defined next)
// import ExportButton from '../components/ui/ExportButton';
// import { FaFileExcel } from 'react-icons/fa';
// import TechnicalKAMForm from '../components/TechnicalKAMForm'; 

// // ================================================================
// // MOCK DATA & API SIMULATION
// // ================================================================

// // Mock database for KAMs
// let MOCK_KAMS_DB = [
//     {
//         id: 101,
//         name: "A. Karim",
//         designation: "Senior Network Engineer",
//         cell_number: "01712345678",
//         status: "Active", // Example of an active KAM
//     },
//     {
//         id: 102,
//         name: "F. Hoque",
//         designation: "Principal Architect",
//         cell_number: "01823456789",
//         status: "Active", // Example of an active KAM
//     },
//     {
//         id: 103,
//         name: "S. Begum",
//         designation: "Technical Lead",
//         cell_number: "01934567890",
//         status: "Inactive", // Example of an inactive KAM
//     },
// ];
// let nextId = 104;

// // Mock API Functions
// const api = {
//     listKams: () => Promise.resolve(MOCK_KAMS_DB),
//     createKam: (data) => {
//         const newKam = { id: nextId++, ...data };
//         MOCK_KAMS_DB.push(newKam);
//         return Promise.resolve(newKam);
//     },
//     updateKam: (id, data) => {
//         const index = MOCK_KAMS_DB.findIndex(a => a.id === id);
//         if (index > -1) {
//             MOCK_KAMS_DB[index] = { ...MOCK_KAMS_DB[index], ...data };
//             return Promise.resolve(MOCK_KAMS_DB[index]);
//         }
//         return Promise.reject(new Error("KAM not found."));
//     },
//     deleteKam: (id) => {
//         const initialLength = MOCK_KAMS_DB.length;
//         MOCK_KAMS_DB = MOCK_KAMS_DB.filter(a => a.id !== id);
//         if (MOCK_KAMS_DB.length < initialLength) {
//             return Promise.resolve({ success: true });
//         }
//         return Promise.reject(new Error("KAM not found."));
//     }
// };

// /**
//  * Technical KAM dashboard component with Table view and Form modal.
//  */
// export default function TechnicalKAMDashboard() {
//     const { addToast } = useToast();
//     const [kams, setKams] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [viewMode, setViewMode] = useState('table'); // 'table' or 'form'
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editingKam, setEditingKam] = useState(null);

//     // --- Data Fetching ---
//     const fetchKams = useCallback(async () => {
//         setLoading(true);
//         try {
//             const data = await api.listKams();
//             setKams(data);
//         } catch (err) {
//             console.error(err);
//             addToast('Failed to fetch KAMs', 'error');
//         } finally {
//             setLoading(false);
//         }
//     }, [addToast]);

//     useEffect(() => {
//         fetchKams();
//     }, [fetchKams]);

//     // --- View and Action Handlers ---
//     const openNewForm = () => {
//         setIsEditMode(false);
//         setEditingKam(null);
//         setViewMode('form');
//     };

//     const handleEdit = (kam) => {
//         setIsEditMode(true);
//         setEditingKam(kam);
//         setViewMode('form');
//     };

//     const handleDelete = async (kamId) => {
//         if (!window.confirm("Are you sure you want to delete this Technical KAM?")) return;
        
//         try {
//             await api.deleteKam(kamId);
//             addToast("KAM deleted successfully.", "success");
//         } catch (err) {
//             addToast("Failed to delete KAM.", "error");
//             console.error("Delete failed:", err);
//         } finally {
//             fetchKams();
//         }
//     };
    
//     // --- Form Submission Handler ---
//     const handleFormSubmit = async (values, { resetForm }) => {
//         try {
//             console.log("Submitting KAM details for API:", values);
//             if (isEditMode) {
//                 await api.updateKam(editingKam.id, values);
//                 addToast("KAM updated successfully.", "success");
//             } else {
//                 await api.createKam(values);
//                 addToast("KAM created successfully.", "success");
//             }
//         } catch (err) {
//             addToast(err.message || "Save failed.", "error");
//         } finally {
//             fetchKams();
//             resetForm();
//             setViewMode('table');
//         }
//     };

//     // --- DataTable Columns ---
//     const kamColumns = useMemo(() => [
//     { key: 'name', header: 'Name' },
//     { key: 'designation', header: 'Designation' },
//     { key: 'cell_number', header: 'Cell Number' },
//     { 
//         key: 'status', 
//         header: 'Status',
//         // --- Custom Render for Status ---
//         render: (status) => {
//             const is_active = status === 'Active';
            
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
//     {
//         key: 'actions',
//         header: 'Actions',
//         render: (_, row) => (
//             <div className="flex justify-start gap-2">
//                 <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
//                     <Pencil className="h-4 w-4 text-indigo-500 hover:text-indigo-700" />
//                 </Button>
//                 {/* <Button variant="icon" size="sm" onClick={() => handleDelete(row.id)} title="Delete">
//                     <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
//                 </Button> */}
//             </div>
//         )
//     }
// ], [handleEdit, handleDelete]);

//     // --- Conditional Render: FORM VIEW ---
//     if (viewMode === 'form') {
//         return (
//             <TechnicalKAMForm
//                 initialValues={editingKam}
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
//                         Technical KAM Management
//                     </h1>
//                     <p className="text-sm text-gray-500">
//                         View and manage the Technical KAM.
//                     </p>
//                 </div>
//                 <div className='px-6 flex gap-2'>
//                     <ExportButton 
//                         data={kams} 
//                         columns={kamColumns} 
//                         fileName="technical_kams_export" 
//                         intent="primary" 
//                         leftIcon={FaFileExcel} 
//                         className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
//                     >
//                         Export
//                     </ExportButton>
//                     <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
//                         Add KAM
//                     </Button>
//                 </div>
                
                
//             </header>

//             {loading ? (
//                 <div className="flex justify-center items-center py-20 text-gray-500">
//                     <p>Loading Key Account Managers...</p>
//                 </div>
//             ) : (
//                 <DataTable
//                     title="KAM Records"
//                     data={kams}
//                     columns={kamColumns}
//                     searchable={true}
//                     showId={true} // Assuming ID is useful here
//                     selection={false}
//                 />
//             )}
//         </div>
//     );
// }


// src/pages/TechnicalKAMDashboard.jsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import DataTable from '../components/table/DataTable';
import Button from '../components/ui/Button';
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from '../hooks/useToast'; 
import ExportButton from '../components/ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import TechnicalKAMForm from '../components/TechnicalKAMForm'; 
// 🔑 NEW: Import the Filter Drawer Component
import TechnicalKAMFilterDrawer from '../components/filter/TechnicalKAMFilterDrawer'; 

// ================================================================
// MOCK DATA & API SIMULATION (UNCHANGED)
// ================================================================

let MOCK_KAMS_DB = [
    {
        id: 101,
        name: "A. Karim",
        designation: "Senior Network Engineer",
        cell_number: "01712345678",
        status: "Active",
    },
    {
        id: 102,
        name: "F. Hoque",
        designation: "Principal Architect",
        cell_number: "01823456789",
        status: "Active",
    },
    {
        id: 103,
        name: "S. Begum",
        designation: "Technical Lead",
        cell_number: "01934567890",
        status: "Inactive",
    },
    {
        id: 104,
        name: "R. Islam",
        designation: "Senior Network Engineer",
        cell_number: "01755555555",
        status: "Inactive",
    },
];
let nextId = 105;

const api = {
    listKams: () => Promise.resolve(MOCK_KAMS_DB),
    createKam: (data) => {
        const newKam = { id: nextId++, ...data };
        MOCK_KAMS_DB.push(newKam);
        return Promise.resolve(newKam);
    },
    updateKam: (id, data) => {
        const index = MOCK_KAMS_DB.findIndex(a => a.id === id);
        if (index > -1) {
            MOCK_KAMS_DB[index] = { ...MOCK_KAMS_DB[index], ...data };
            return Promise.resolve(MOCK_KAMS_DB[index]);
        }
        return Promise.reject(new Error("KAM not found."));
    },
    deleteKam: (id) => {
        const initialLength = MOCK_KAMS_DB.length;
        MOCK_KAMS_DB = MOCK_KAMS_DB.filter(a => a.id !== id);
        if (MOCK_KAMS_DB.length < initialLength) {
            return Promise.resolve({ success: true });
        }
        return Promise.reject(new Error("KAM not found."));
    }
};

/**
 * Technical KAM dashboard component with Table view and Form modal.
 */
export default function TechnicalKAMDashboard() {
    const { addToast } = useToast();
    const [kams, setKams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingKam, setEditingKam] = useState(null);

    // 🔑 NEW STATE: Holds the filter payload from the drawer
    const [activeFilters, setActiveFilters] = useState({});

    // --- Data Fetching ---
    const fetchKams = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.listKams();
            setKams(data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch KAMs', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchKams();
    }, [fetchKams]);

    // 🔑 NEW: Central Filter Logic (Client-Side) 🔑
    const filteredKams = useMemo(() => {
        const filters = activeFilters;
        if (Object.keys(filters).length === 0) {
            return kams;
        }

        return kams.filter(kam => {
            let matches = true;

            // 1. Designation Filter
            if (filters.designation && kam.designation !== filters.designation) {
                matches = false;
            }
            
            // 2. Status Filter
            if (filters.status && kam.status !== filters.status) {
                matches = false;
            }
            
            return matches;
        });
    }, [kams, activeFilters]);

    // 🔑 NEW: Filter Handler (called by the FilterDrawer)
    const handleApplyFilters = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);

    // --- View and Action Handlers (UNCHANGED) ---
    const openNewForm = () => {
        setIsEditMode(false);
        setEditingKam(null);
        setViewMode('form');
    };

    const handleEdit = (kam) => {
        setIsEditMode(true);
        setEditingKam(kam);
        setViewMode('form');
    };

    const handleDelete = async (kamId) => {
        if (!window.confirm("Are you sure you want to delete this Technical KAM?")) return;
        
        try {
            await api.deleteKam(kamId);
            addToast("KAM deleted successfully.", "success");
        } catch (err) {
            addToast("Failed to delete KAM.", "error");
            console.error("Delete failed:", err);
        } finally {
            fetchKams();
        }
    };
    
    // --- Form Submission Handler (UNCHANGED) ---
    const handleFormSubmit = async (values, { resetForm }) => {
        try {
            console.log("Submitting KAM details for API:", values);
            if (isEditMode) {
                await api.updateKam(editingKam.id, values);
                addToast("KAM updated successfully.", "success");
            } else {
                await api.createKam(values);
                addToast("KAM created successfully.", "success");
            }
        } catch (err) {
            addToast(err.message || "Save failed.", "error");
        } finally {
            fetchKams();
            resetForm();
            setViewMode('table');
        }
    };

    // --- DataTable Columns (UNCHANGED) ---
    const kamColumns = useMemo(() => [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'designation', header: 'Designation' },
    { key: 'cell_number', header: 'Cell Number' },
    { 
        key: 'status', 
        header: 'Status',
        render: (status) => {
            const is_active = status === 'Active';
            
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
            <TechnicalKAMForm
                initialValues={editingKam}
                isEditMode={isEditMode}
                onSubmit={handleFormSubmit}
                onCancel={() => setViewMode('table')}
            />
        );
    }

    // --- Conditional Render: TABLE VIEW (Updated to use filteredKams and filterComponent) ---
    return (
        <div className='p-4 lg:p-6 '>
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Technical KAM Management
                    </h1>
                    <p className="text-sm text-gray-500">
                        View and manage the Technical KAM.
                    </p>
                </div>
                <div className='px-6 flex gap-2'>
                    <ExportButton 
                        data={filteredKams} // 🔑 Export the filtered data
                        columns={kamColumns} 
                        fileName="technical_kams_export" 
                        intent="primary" 
                        leftIcon={FaFileExcel} 
                        className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
                    >
                        Export
                    </ExportButton>
                    <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
                        Add KAM
                    </Button>
                </div>
                
                
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-500">
                    <p>Loading Key Account Managers...</p>
                </div>
            ) : (
                <DataTable
                    title="KAM Records"
                    data={filteredKams} // 🔑 Pass the filtered data to the table
                    columns={kamColumns}
                    searchable={true}
                    // showId={true} 
                    selection={false}
                    // 🔑 NEW PROP: Integrate the Filter Drawer
                    filterComponent={
                        <TechnicalKAMFilterDrawer 
                            onApply={handleApplyFilters} 
                            activeFilters={activeFilters}
                        />
                    }
                />
            )}
        </div>
    );
}