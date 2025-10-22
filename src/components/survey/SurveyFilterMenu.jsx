import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import clsx from 'clsx';
// Assuming useOutside is defined elsewhere
// import { useOutside } from '../hooks/useOutside';
import Button from '../ui/Button';
import { useFormik, FormikProvider, Field } from 'formik';
import SelectField from '../fields/SelectField';
import DateField from '../fields/DateField';

// --- Helper function: Maps Name (label) to ID (value) for Foreign Keys ---
// Note: This helper is only kept for calculating the dependent clientOptions (if needed)
// and for export purposes, but is no longer used for the main dynamic options.
const getUniqueOptionsWithIds = (records, nameKey, idKey) => {
    const uniqueMap = new Map();
    records.forEach(record => {
        const name = record[nameKey];
        const id = record[idKey];
        if (name && id) {
            uniqueMap.set(name, id);
        }
    });

    return Array.from(uniqueMap.entries()).sort().map(([name, id]) => ({
        label: name,
        value: id,
    }));
};

// ... (getUniqueOptions helper kept for client category) ...

const useOutside = (ref, onOutside) => {
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onOutside?.();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [ref, onOutside]);
};

// 🔑 ACCEPT THE dynamicOptions PROP
const SurveyFilterMenu = ({ records, onFilterChange, live = false, dynamicOptions }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerRef = useRef(null);

    const initialValues = {
        sbu_id: '',
        link_type_id: '',
        aggregator_id: '',
        kam_id: '',
        nttn_id: '',
        client_category: '',
        client_id: '',
        submition: '',
    };

    const formik = useFormik({
        initialValues,
        onSubmit: (values) => {
            const activeFilters = Object.entries(values).reduce((acc, [key, value]) => {
                if (value !== null && value !== '' && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            onFilterChange(activeFilters);
            setDrawerOpen(false);
        },
    });

    // 🔑 Dynamic Options Calculation (REMOVED: Now uses prop)
    // The options are now directly used from the prop: `dynamicOptions`

    // --- Filter options for the dependent 'client_name' dropdown ---
    const clientOptions = useMemo(() => {
        // NOTE: If using the client-side approach, this still relies on the full `records` array.
        let filteredRecords = records;

        // Filter by SBU if a value is selected
        if (formik.values.sbu_id) {
            filteredRecords = filteredRecords.filter(
                (record) => record.sbu_id === formik.values.sbu_id
            );
        }

        // Filter by NTTN if a value is selected
        if (formik.values.nttn_id) {
            filteredRecords = filteredRecords.filter(
                (record) => record.nttn_id === formik.values.nttn_id
            );
        }

        return getUniqueOptionsWithIds(filteredRecords, 'client_name', 'client_id');
    }, [records, formik.values.sbu_id, formik.values.nttn_id]);


    // The critical fix: Reset client_id when sbu_id or nttn_id changes
    useEffect(() => {
        const currentClientId = formik.values.client_id;
        const isClientValid = clientOptions.some(opt => opt.value === currentClientId);

        if (!isClientValid && currentClientId) {
            formik.setFieldValue('client_id', '');
        }
    }, [formik.values.sbu_id, formik.values.nttn_id, formik.setFieldValue, clientOptions]);

    const handleLiveChange = useCallback(() => {
        if (live) {
            formik.handleSubmit(); // Triggers submit logic which calls onFilterChange(activeFilters)
        }
    }, [live, formik.handleSubmit]);

    // ... (rest of useEffects, useOutside, clearFilters, activeFiltersCount, etc. are unchanged) ...

    const clearFilters = () => {
        formik.resetForm({ values: initialValues });
        onFilterChange({}); // CRITICAL: Reset the parent's filter state
        setDrawerOpen(false);
    };

    const activeFiltersCount = useMemo(() => {
        return Object.values(formik.values).filter(
            (value) => value !== null && value !== ''
        ).length;
    }, [formik.values]);

    const handleOpenDrawer = () => {
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };


    return (
        <>
            <Button onClick={handleOpenDrawer} leftIcon={Filter} variant="icon">
                Filters
                {activeFiltersCount > 0 && (
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full text-xs font-semibold bg-blue-500 text-white ml-1">
                        {activeFiltersCount}
                    </span>
                )}
            </Button>

            {drawerOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40"
                    onClick={handleCloseDrawer}
                />
            )}

            <div
                ref={drawerRef}
                className={clsx(
                    'fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col',
                    drawerOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="flex-none flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Filter className="h-5 w-5" /> Filter
                    </h2>
                    <Button
                        onClick={handleCloseDrawer}
                        variant="icon"
                        size="sm"
                        title="Close Filters"
                    >
                        <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
                    </Button>
                </div>

                <FormikProvider value={formik}>
                    <form
                        className="flex-1 p-4 space-y-4 overflow-y-auto"
                        onSubmit={formik.handleSubmit}
                    >
                        {/* SBU Filter */}
                        <Field
                            name="sbu_id"
                            as={SelectField}
                            label="SBU"
                            options={dynamicOptions.sbu}
                            floating={true}
                            searchable={true}
                            onChange={(v) => formik.setFieldValue('sbu_id', v)}
                        />

                        {/* Link Type Filter */}
                        <Field
                            name="link_type_id"
                            as={SelectField}
                            label="Link Type"
                            options={dynamicOptions.link_type}
                            floating={true}
                            searchable={true}
                            onChange={(v) => formik.setFieldValue('link_type_id', v)}
                        />

                        {/* Aggregator Filter */}
                        <Field
                            name="aggregator_id"
                            as={SelectField}
                            label="Aggregator"
                            options={dynamicOptions.aggregator}
                            floating={true}
                            searchable={true}
                            onChange={(v) => formik.setFieldValue('aggregator_id', v)}
                        />

                        {/* KAM Filter */}
                        <Field
                            name="kam_id"
                            as={SelectField}
                            label="KAM"
                            options={dynamicOptions.kam}
                            floating={true}
                            searchable={true}
                            onChange={(v) => formik.setFieldValue('kam_id', v)}
                        />

                        {/* NTTN Name Filter */}
                        <Field
                            name="nttn_id"
                            as={SelectField}
                            label="NTTN Name"
                            options={dynamicOptions.nttn}
                            floating={true}
                            searchable={true}
                            onChange={(v) => formik.setFieldValue('nttn_id', v)}
                        />

                        {/* Client Category Filter */}
                        <Field
                            name="client_category"
                            as={SelectField}
                            label="Client Category"
                            options={dynamicOptions.client_category}
                            floating={true}
                            searchable={true}
                            onChange={(v) => formik.setFieldValue('client_category', v)}
                        />

                        {/* Client Name Filter (Dependent) */}
                        <Field
                            name="client_id"
                            as={SelectField}
                            label="Client Name"
                            options={clientOptions}
                            floating={true}
                            searchable={true}
                            onChange={(v) => formik.setFieldValue('client_id', v)}
                        />

                        {/* Submission Date Filter */}
                        <Field
                            name="submition"
                            as={DateField}
                            label="Submission Date"
                            floating={true}
                            className="mb-0"
                            searchable={true}
                            options={dynamicOptions.submition}
                            onChange={(v) => formik.setFieldValue('submition', v)}
                        />
                    </form>
                </FormikProvider>

                <div className="flex-none p-4 border-t border-gray-200 bg-white flex justify-end gap-2">
                    <Button onClick={clearFilters} intent="ghost" type="button">
                        Clear All
                    </Button>
                    {!live && (
                        <Button intent="primary" type="submit" onClick={formik.handleSubmit}>
                            Apply
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
};

export default SurveyFilterMenu;