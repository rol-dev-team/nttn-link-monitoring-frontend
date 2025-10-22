// src/components/filter/IcmpAlertFilterDrawer.jsx

import React, { useState, useMemo } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import { Filter, X } from "lucide-react";

import SelectInput from "../fields/SelectInput"; 
import Button from '../ui/Button'; 

// Helper function to map the flat activeFilters payload to Formik's required structure
// Requires dynamic options to correctly map back a selected filter value to the option object
const mapFiltersToFormik = (filters, nasIpOptions, statusOptions) => {
    // Helper to find the correct option object based on the plain value string
    const findOption = (options, key) => options.find(opt => opt.value === filters[key]) || null;
    
    return {
        is_active: findOption(statusOptions, 'is_active'), 
        nas_ip_filter: findOption(nasIpOptions, 'nas_ip_filter'),   
    };
};


/**
 * Filter drawer component for ICMP Alert Dashboard
 * @param {object} props.nasIpOptions - Dynamic list of NAS IP options derived from dashboard data
 * @param {object} props.statusOptions - Dynamic list of Status options derived from dashboard data
 */
export default function IcmpAlertFilterDrawer({ onApply, activeFilters = {}, nasIpOptions = [], statusOptions = [] }) {
    
    const [isOpen, setIsOpen] = useState(false);
    
    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    
    // Convert activeFilters for Formik's initial state
    const initialFormValues = useMemo(() => {
        return mapFiltersToFormik(activeFilters, nasIpOptions, statusOptions);
    }, [activeFilters, nasIpOptions, statusOptions]);


    const formik = useFormik({
        initialValues: initialFormValues, 
        enableReinitialize: true,
        
        onSubmit: (values) => {
            // Transform values to a clean, flat payload
            const payload = {
                // Pass the string value for active status ("true" or "false")
                is_active: values.is_active?.value || null, 
                // Pass the specific NAS IP string
                nas_ip_filter: values.nas_ip_filter?.value || null,
            };
            
            // Filter out null/empty values
            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([, v]) => v !== null && v !== '')
            );

            onApply(cleanPayload);
            setIsOpen(false);
        },
    });

    const handleClear = () => {
        // Reset Formik to empty state and notify parent controller
        formik.resetForm({ 
            values: mapFiltersToFormik({}, nasIpOptions, statusOptions) 
        });
        onApply({});
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
                        Filter ICMP Alerts
                    </h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} type="button" aria-label="Close filter drawer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-4 space-y-4">
                    
                    {/* Filter by Activity Status (Dynamic Options) */}
                    <div>
                        <SelectInput
                            name="is_active"
                            label="Activity Status"
                            options={statusOptions}
                            formik={formik}
                            isClearable
                        />
                    </div>
                    
                    {/* Filter by Specific NAS IP (Dynamic Options) */}
                    <div>
                        <SelectInput
                            name="nas_ip_filter"
                            label="Filter by NAS IP"
                            options={nasIpOptions}
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