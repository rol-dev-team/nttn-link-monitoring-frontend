// src/components/filter/TechnicalKAMFilterDrawer.jsx

import React, { useState, useMemo } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import { Filter, X } from "lucide-react";

// Assuming these field components exist in your structure
import SelectInput from "../fields/SelectInput"; 
import Button from '../ui/Button'; 

// Available filter options based on mock data
const DESIGNATION_OPTIONS = [
    { value: "Senior Network Engineer", label: "Senior Network Engineer" },
    { value: "Principal Architect", label: "Principal Architect" },
    { value: "Technical Lead", label: "Technical Lead" },
    // Add more designations as needed
];

const STATUS_OPTIONS = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

// Helper function to map the flat activeFilters payload to Formik's required structure
const mapFiltersToFormik = (filters, designationOptions, statusOptions) => {
    // Finds the option object for the SelectInput fields
    const findOption = (options, key) => options.find(opt => opt.value === filters[key]) || null;
    
    return {
        // Formik expects the option object for react-select fields
        designation: findOption(designationOptions, 'designation'), 
        status: findOption(statusOptions, 'status'),   
    };
};


/**
 * Filter drawer component for Technical KAM Dashboard
 */
export default function TechnicalKAMFilterDrawer({ onApply, activeFilters = {} }) {
    
    const [isOpen, setIsOpen] = useState(false);
    
    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    
    // Use the options defined above
    const designationOptions = DESIGNATION_OPTIONS;
    const statusOptions = STATUS_OPTIONS;

    // Convert activeFilters for Formik's initial state
    const initialFormValues = useMemo(() => {
        return mapFiltersToFormik(activeFilters, designationOptions, statusOptions);
    }, [activeFilters]);


    const formik = useFormik({
        initialValues: initialFormValues, 
        enableReinitialize: true, // Re-initializes form when activeFilters changes
        
        // No complex validation needed for simple selects
        onSubmit: (values) => {
            // Transform values to a clean, flat payload
            const payload = {
                designation: values.designation?.value || null,
                status: values.status?.value || null,
            };
            
            // Filter out null/empty values
            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([, v]) => v !== null && v !== '')
            );

            onApply(cleanPayload); // Pass payload to the parent
            setIsOpen(false);
        },
    });

    const handleClear = () => {
        // Reset Formik to empty state and notify parent controller
        formik.resetForm({ 
            values: mapFiltersToFormik({}, designationOptions, statusOptions) 
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
                        Filter KAMs
                    </h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} type="button" aria-label="Close filter drawer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-4 space-y-4">
                    
                    {/* Filter by Designation */}
                    <div>
                        <SelectInput
                            name="designation"
                            label="Designation"
                            options={designationOptions}
                            formik={formik}
                            isClearable
                        />
                    </div>
                    
                    {/* Filter by Status */}
                    <div>
                        <SelectInput
                            name="status"
                            label="Status"
                            options={statusOptions}
                            formik={formik}
                            isClearable
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