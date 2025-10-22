import React, { useState, useMemo, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import clsx from "clsx";
import { Filter, X } from "lucide-react";
import SelectInput from "../fields/SelectInput"; 
import TextInput from "../fields/TextInputField"; 
import Button from '../ui/Button'; 

// Helper function to map the flat activeFilters payload to Formik's required structure
const mapFiltersToFormik = (filters, nasIpOptions) => {
    // Finds the option object for the SelectInput fields
    const findOption = (key) => nasIpOptions.find(opt => opt.value === filters[key]) || null;
    
    return {
        // Range & IP Filters (use || '' for text inputs, || null for select)
        nas_ip_scope: findOption('nas_ip_scope'), 
        min_value_mbps_min: filters.min_value_mbps_min || '',   
        min_value_mbps_max: filters.min_value_mbps_max || '',   
        max_value_mbps_min: filters.max_value_mbps_min || '',   
        max_value_mbps_max: filters.max_value_mbps_max || '',   
    };
};


/**
 * Filter drawer component for Capacity Alert Dashboard
 */
export default function CapacityAlertFilterDrawer({ onApply, allNasIps, activeFilters = {} }) {
    
    const [isOpen, setIsOpen] = useState(false);
    
    // Convert the raw NAS IP list into options format for the SelectInput
    const nasIpOptions = useMemo(() => 
        allNasIps.map(ip => ({ value: ip, label: ip }))
    , [allNasIps]);

    // Determine if the form currently has filters applied (for the Clear button)
    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    
    // Convert activeFilters for Formik's initial state
    const initialFormValues = useMemo(() => {
        return mapFiltersToFormik(activeFilters, nasIpOptions);
    }, [activeFilters, nasIpOptions]);


    const formik = useFormik({
        initialValues: initialFormValues, 
        enableReinitialize: true, // 🔑 IMPORTANT: Re-initializes form when activeFilters changes
        
        validationSchema: yup.object().shape({
            min_value_mbps_min: yup.number().typeError('Must be a number').nullable(true),
            min_value_mbps_max: yup.number().typeError('Must be a number').nullable(true).when('min_value_mbps_min', (min, schema) => 
                min?.[0] ? schema.min(min[0], 'Must be greater than Min') : schema
            ),
            max_value_mbps_min: yup.number().typeError('Must be a number').nullable(true),
            max_value_mbps_max: yup.number().typeError('Must be a number').nullable(true).when('max_value_mbps_min', (min, schema) => 
                min?.[0] ? schema.min(min[0], 'Must be greater than Min') : schema
            ),
        }),
        onSubmit: (values) => {
            // Transform values to a clean, flat payload
            const payload = {
                nas_ip_scope: values.nas_ip_scope?.value || null,
                min_value_mbps_min: values.min_value_mbps_min || null,
                min_value_mbps_max: values.min_value_mbps_max || null,
                max_value_mbps_min: values.max_value_mbps_min || null,
                max_value_mbps_max: values.max_value_mbps_max || null,
            };
            
            // Filter out null/empty values
            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([, v]) => v !== null && v !== '')
            );

            onApply(cleanPayload); // 🔑 Pass payload to the parent
            setIsOpen(false);
        },
    });

    const handleClear = () => {
        // Reset Formik to empty state and notify parent controller
        formik.resetForm({ values: mapFiltersToFormik({}, nasIpOptions) });
        onApply({}); // 🔑 Pass empty object to clear filters in the parent
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

            {/* Backdrop and Drawer structure (UNCHANGED) */}
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
                        Filter Configurations
                    </h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} type="button" aria-label="Close filter drawer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-4 space-y-4">
                    
                    {/* Filter by NAS IP Scope */}
                    <div>
                        <SelectInput
                            name="nas_ip_scope"
                            label="Filter by NAS IP"
                            options={nasIpOptions}
                            formik={formik}
                            isClearable
                            isSearchable
                        />
                    </div>
                    
                    {/* Filter by Max Threshold (Range) */}
                    <div className="pt-2 border-t">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Threshold (Mbps) Range</label>
                        <div className="flex gap-2">
                            <TextInput
                                name="max_value_mbps_min"
                                placeholder="Min Value"
                                formik={formik}
                                type="number"
                            />
                            <TextInput
                                name="max_value_mbps_max"
                                placeholder="Max Value"
                                formik={formik}
                                type="number"
                            />
                        </div>
                    </div>

                    {/* Filter by Min Threshold (Range) */}
                    <div className="pt-2 border-t">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Threshold (Mbps) Range</label>
                        <div className="flex gap-2">
                             <TextInput
                                name="min_value_mbps_min"
                                placeholder="Min Value"
                                formik={formik}
                                type="number"
                            />
                            <TextInput
                                name="min_value_mbps_max"
                                placeholder="Max Value"
                                formik={formik}
                                type="number"
                            />
                        </div>
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