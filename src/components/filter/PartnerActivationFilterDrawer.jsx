// src/components/filter/PartnerActivationFilterDrawer.jsx

import React, { useState, useMemo } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import { Filter, X } from "lucide-react";

// Assuming these field components exist in your structure
import SelectInput from "../fields/SelectInput"; 
import Button from '../ui/Button'; 

// Hardcoded/Mock filter options based on the PartnerActivationDashboard data
const LINK_ID_OPTIONS = [
    { value: "NTTN-LINK-001", label: "NTTN-LINK-001" },
    { value: "NTTN-LINK-003", label: "NTTN-LINK-003" },
];

const SWITCH_OPTIONS = [
    { value: "SW-CORE-01", label: "SW-CORE-01" },
    { value: "SW-EDGE-05", label: "SW-EDGE-05" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

// Helper function to map the flat activeFilters payload to Formik's required structure
const mapFiltersToFormik = (filters, linkOptions, switchOptions, statusOptions) => {
    const findOption = (options, key) => options.find(opt => opt.value === filters[key]) || null;
    
    return {
        // Formik expects the option object for react-select fields
        nttn_link_id: findOption(linkOptions, 'nttn_link_id'), 
        connected_sw_name: findOption(switchOptions, 'connected_sw_name'),
        status: findOption(statusOptions, 'status'),   
    };
};


/**
 * Filter drawer component for Partner Activation Dashboard
 */
export default function PartnerActivationFilterDrawer({ onApply, activeFilters = {} }) {
    
    const [isOpen, setIsOpen] = useState(false);
    
    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    
    // Use the options defined above
    const linkOptions = LINK_ID_OPTIONS;
    const switchOptions = SWITCH_OPTIONS;
    const statusOptions = STATUS_OPTIONS;

    // Convert activeFilters for Formik's initial state
    const initialFormValues = useMemo(() => {
        return mapFiltersToFormik(activeFilters, linkOptions, switchOptions, statusOptions);
    }, [activeFilters]);


    const formik = useFormik({
        initialValues: initialFormValues, 
        enableReinitialize: true,
        
        onSubmit: (values) => {
            // Transform values to a clean, flat payload
            const payload = {
                nttn_link_id: values.nttn_link_id?.value || null,
                connected_sw_name: values.connected_sw_name?.value || null,
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
            values: mapFiltersToFormik({}, linkOptions, switchOptions, statusOptions) 
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
                        Filter Activation Plans
                    </h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} type="button" aria-label="Close filter drawer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-4 space-y-4">
                    
                    {/* Filter by NTTN Link ID */}
                    <div>
                        <SelectInput
                            name="nttn_link_id"
                            label="NTTN Link ID"
                            options={linkOptions}
                            formik={formik}
                            isClearable
                        />
                    </div>
                    
                    {/* Filter by Connected Switch Name */}
                    <div>
                        <SelectInput
                            name="connected_sw_name"
                            label="Connected Switch"
                            options={switchOptions}
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