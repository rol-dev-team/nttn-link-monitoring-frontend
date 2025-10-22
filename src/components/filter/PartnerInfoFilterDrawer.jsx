// // src/components/filter/PartnerInfoFilterDrawer.jsx

// import React, { useState, useMemo } from "react";
// import { useFormik } from "formik";
// import clsx from "clsx";
// import { Filter, X } from "lucide-react";

// // Assuming these field components exist in your structure
// import SelectInput from "../fields/SelectInput"; 
// import Button from '../ui/Button'; 

// // Hardcoded/Mock filter options based on the PartnerInfoDashboard data
// const NETWORK_CODE_OPTIONS = [
//     { value: "RACE-A1", label: "RACE-A1" },
//     { value: "LINK-X5", label: "LINK-X5" },
//     // Add more codes as they appear
// ];

// const KAM_OPTIONS = [
//     { value: "abir_hossain", label: "Abir Hossain" },
//     { value: "nazia_rahman", label: "Nazia Rahman" },
//     // Add more KAMs as they appear
// ];

// // Helper function to map the flat activeFilters payload to Formik's required structure
// const mapFiltersToFormik = (filters, networkOptions, kamOptions) => {
//     // Finds the option object for the SelectInput fields
//     const findOption = (options, key) => options.find(opt => opt.value === filters[key]) || null;
    
//     return {
//         // Formik expects the option object for react-select fields
//         network_code: findOption(networkOptions, 'network_code'), 
//         technical_kam: findOption(kamOptions, 'technical_kam'),   
//     };
// };


// /**
//  * Filter drawer component for Partner Info Dashboard
//  */
// export default function PartnerInfoFilterDrawer({ onApply, activeFilters = {} }) {
    
//     const [isOpen, setIsOpen] = useState(false);
    
//     const hasActiveFilters = Object.keys(activeFilters).length > 0;
    
//     const networkOptions = NETWORK_CODE_OPTIONS;
//     const kamOptions = KAM_OPTIONS;

//     // Convert activeFilters for Formik's initial state
//     const initialFormValues = useMemo(() => {
//         return mapFiltersToFormik(activeFilters, networkOptions, kamOptions);
//     }, [activeFilters]);


//     const formik = useFormik({
//         initialValues: initialFormValues, 
//         enableReinitialize: true,
        
//         onSubmit: (values) => {
//             // Transform values to a clean, flat payload
//             const payload = {
//                 network_code: values.network_code?.value || null,
//                 technical_kam: values.technical_kam?.value || null,
//             };
            
//             // Filter out null/empty values
//             const cleanPayload = Object.fromEntries(
//                 Object.entries(payload).filter(([, v]) => v !== null && v !== '')
//             );

//             onApply(cleanPayload); // Pass payload to the parent
//             setIsOpen(false);
//         },
//     });

//     const handleClear = () => {
//         // Reset Formik to empty state and notify parent controller
//         formik.resetForm({ 
//             values: mapFiltersToFormik({}, networkOptions, kamOptions) 
//         });
//         onApply({}); // Pass empty object to clear filters in the parent
//         setIsOpen(false);
//     };

//     return (
//         <>
//             <button
//                 className="btn btn-ghost relative"
//                 onClick={() => setIsOpen(true)}
//                 aria-label="Filter data"
//                 title="Filter data"
//                 type="button"
//             >
//                 <Filter className="h-4 w-4" />
//                 {/* Visual indicator if filters are active */}
//                 {hasActiveFilters && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>}
//                 <span className="ml-1 hidden sm:inline">Filter</span>
//             </button>

//             {/* Backdrop and Drawer structure */}
//             {isOpen && (
//                 <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setIsOpen(false)}></div>
//             )}

//             <div
//                 className={clsx(
//                     "fixed top-0 right-0 z-50 h-full w-full max-w-sm transform bg-white shadow-xl transition-transform duration-300",
//                     isOpen ? "translate-x-0" : "translate-x-full"
//                 )}
//             >
//                 <div className="flex items-center justify-between p-4 border-b border-gray-200">
//                     <h3 className="text-lg font-semibold flex items-center gap-2">
//                         <Filter className="h-5 w-5" />
//                         Filter Partner Configs
//                     </h3>
//                     <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} type="button" aria-label="Close filter drawer">
//                         <X className="h-5 w-5" />
//                     </button>
//                 </div>

//                 <form onSubmit={formik.handleSubmit} className="p-4 space-y-4">
                    
//                     {/* Filter by Network Code */}
//                     <div>
//                         <SelectInput
//                             name="network_code"
//                             label="Network Code"
//                             options={networkOptions}
//                             formik={formik}
//                             isClearable
//                         />
//                     </div>
                    
//                     {/* Filter by Technical KAM */}
//                     <div>
//                         <SelectInput
//                             name="technical_kam"
//                             label="Technical KAM"
//                             options={kamOptions}
//                             formik={formik}
//                             isClearable
//                         />
//                     </div>
                    
//                     <div className="flex justify-end gap-2 mt-6">
//                         <Button
//                             type="button"
//                             onClick={handleClear}
//                             intent="secondary"
//                             disabled={!hasActiveFilters} 
//                         >
//                             Clear
//                         </Button>
//                         <Button type="submit" intent="primary">
//                             Apply Filter
//                         </Button>
//                     </div>
//                 </form>
//             </div>
//         </>
//     );
// }
// src/components/filter/PartnerInfoFilterDrawer.jsx

// src/components/filter/PartnerInfoFilterDrawer.jsx

import React, { useState, useMemo, useEffect } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import { Filter, X } from "lucide-react";

// Assuming these field components exist in your structure
import SelectInput from "../fields/SelectInput"; 
import Button from '../ui/Button'; 

// Helper to format values like "abir_hossain" into "Abir Hossain"
const formatLabel = (value) => {
    if (!value) return '';
    return value
        .replace('_', ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Helper function to map the flat activeFilters payload to Formik's required structure
const mapFiltersToFormik = (filters, networkOptions, kamOptions) => {
    // Finds the option object for the SelectInput fields
    const findOption = (options, key) => options.find(opt => opt.value === filters[key]) || null;
    
    return {
        // Formik expects the option object for react-select fields
        network_code: findOption(networkOptions, 'network_code'), 
        technical_kam: findOption(kamOptions, 'technical_kam'),   
    };
};


/**
 * Filter drawer component for Partner Info Dashboard
 * @param {object} props
 * @param {function} props.onApply - Function to call with the cleaned filter payload
 * @param {object} props.activeFilters - The currently active filters object
 * @param {Array<object>} props.masterFilterData - The array of {network_code, technical_kam} pairs
 */
export default function PartnerInfoFilterDrawer({ onApply, activeFilters = {}, masterFilterData = [] }) {
    
    const [isOpen, setIsOpen] = useState(false);
    
    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    
    // Derive unique, formatted options from the master data prop
    const { networkOptions, allKamOptions } = useMemo(() => {
        const uniqueNetworkCodes = new Set();
        const uniqueKams = new Set();

        masterFilterData.forEach(item => {
            uniqueNetworkCodes.add(item.network_code);
            uniqueKams.add(item.technical_kam);
        });

        const networkOpts = Array.from(uniqueNetworkCodes).map(value => ({ 
            value: value, 
            label: value // Network codes are usually technical names
        }));
        
        const kamOpts = Array.from(uniqueKams).map(value => ({
            value: value,
            label: formatLabel(value) // Format technical KAM names
        }));

        return { networkOptions: networkOpts, allKamOptions: kamOpts };

    }, [masterFilterData]);


    // Convert activeFilters for Formik's initial state
    const initialFormValues = useMemo(() => {
        return mapFiltersToFormik(activeFilters, networkOptions, allKamOptions);
    }, [activeFilters, networkOptions, allKamOptions]);


    const formik = useFormik({
        initialValues: initialFormValues, 
        enableReinitialize: true,
        
        onSubmit: (values) => {
            // Transform values to a clean, flat payload
            const payload = {
                network_code: values.network_code?.value || null,
                technical_kam: values.technical_kam?.value || null,
            };
            
            // Filter out null/empty values
            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([, v]) => v !== null && v !== '')
            );

            onApply(cleanPayload); // Pass payload to the parent
            setIsOpen(false);
        },
    });

    // DEPENDENCY LOGIC:
    const selectedNetworkCode = formik.values.network_code?.value;

    // Dynamic KAM Options based on selected Network Code
    const dependentKamOptions = useMemo(() => {
        // If no Network Code is selected, show all KAMs
        if (!selectedNetworkCode) {
            return allKamOptions;
        }

        // 1. Find all unique KAM values associated with the selected Network Code
        const filteredKamValues = Array.from(
            new Set(
                masterFilterData
                    .filter(p => p.network_code === selectedNetworkCode)
                    .map(p => p.technical_kam)
            )
        );

        // 2. Map those values back to the full option objects
        return allKamOptions.filter(opt => filteredKamValues.includes(opt.value));

    }, [selectedNetworkCode, masterFilterData, allKamOptions]); 


    // Side effect to clear the KAM if it's no longer valid for the selected Network Code
    useEffect(() => {
        const currentKamValue = formik.values.technical_kam?.value;
        if (currentKamValue && selectedNetworkCode) {
            // Check if the current KAM is in the new list of dependent options
            const isValid = dependentKamOptions.some(opt => opt.value === currentKamValue);
            
            if (!isValid) {
                // If it's invalid, clear the technical_kam field
                formik.setFieldValue('technical_kam', null);
            }
        }
    }, [selectedNetworkCode, dependentKamOptions, formik.values.technical_kam?.value]);


    const handleClear = () => {
        // Reset Formik to empty state and notify parent controller
        formik.resetForm({ 
            values: mapFiltersToFormik({}, networkOptions, allKamOptions) 
        });
        onApply({}); // Pass empty object to clear filters in the parent
        setIsOpen(false);
    };

    return (
        <>
            <button
                className="btn btn-ghost relative"
                onClick={() => setIsOpen(true)}
                aria-label="Filter data"
                title="Filter data"
                type="button"
            >
                <Filter className="h-4 w-4" />
                {/* Visual indicator if filters are active */}
                {hasActiveFilters && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>}
                <span className="ml-1 hidden sm:inline">Filter</span>
            </button>

            {/* Backdrop and Drawer structure */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setIsOpen(false)}></div>
            )}

            <div
                className={clsx(
                    "fixed top-0 right-0 z-50 h-full w-full max-w-sm transform bg-white shadow-xl transition-transform duration-300",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filter Partner Configs
                    </h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} type="button" aria-label="Close filter drawer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-4 space-y-4">
                    
                    {/* Filter by Network Code */}
                    <div>
                        <SelectInput
                            name="network_code"
                            label="Network Code"
                            options={networkOptions}
                            formik={formik}
                            isClearable
                        />
                    </div>
                    
                    {/* Filter by Technical KAM (Now dependent) */}
                    <div>
                        <SelectInput
                            name="technical_kam"
                            label="Technical KAM"
                            // Use the dynamically filtered options
                            options={dependentKamOptions}
                            formik={formik}
                            isClearable
                            // Optionally disable if no network code is selected
                            isDisabled={!selectedNetworkCode} 
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            onClick={handleClear}
                            intent="secondary"
                            disabled={!hasActiveFilters} 
                        >
                            Clear
                        </Button>
                        <Button type="submit" intent="primary">
                            Apply Filter
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}