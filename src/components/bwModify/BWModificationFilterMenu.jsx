import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import clsx from 'clsx';
import { useOutside } from '../../hooks/useOutside';
import Button from '../ui/Button';
import { useFormik, FormikProvider, Field } from 'formik';
import SelectField from '../fields/SelectField';
import DateField from '../fields/DateField';

// Helper function to safely get nested data
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Helper: Maps Name (label) to ID (value) for Foreign Keys
const getUniqueOptionsWithIds = (records = [], namePath, idPath) => {
    const uniqueMap = new Map();
    records.forEach(record => {
        const name = getNestedValue(record, namePath);
        const id = getNestedValue(record, idPath);
        if (name && id) {
            uniqueMap.set(name, id);
        }
    });

    return Array.from(uniqueMap.entries()).sort().map(([name, id]) => ({
        label: name,
        value: id,
    }));
};

// Helper to extract unique simple options
const getUniqueOptions = (records = [], key) => {
    const uniqueValues = new Set();
    records.forEach(record => {
        const value = getNestedValue(record, key);
        if (value !== null && value !== undefined && String(value).trim() !== "") {
            uniqueValues.add(String(value).trim());
        }
    });

    return Array.from(uniqueValues).sort().map(value => ({
        label: value,
        value: value,
    }));
};

const BWModificationFilterMenu = ({ records, onFilterChange, live = false }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerRef = useRef(null);

    const initialValues = {
        nttn_provider: '',
        modification_type: '',
        client_category: '',
        client: '',
        created_at: '',
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

    const dynamicOptions = useMemo(() => {
        return {
            nttn_provider: getUniqueOptionsWithIds(records, 'nttn_provider_details.nttn_name', 'nttn_provider_details.id'),
            modification_type: getUniqueOptions(records, 'modification_type'),
            client_category: getUniqueOptionsWithIds(records, 'client_category_details.cat_name', 'client_category_details.id'),
            created_at: getUniqueOptions(records, 'created_at').map(opt => ({
                ...opt,
                label: opt.label.substring(0, 10),
            })),
        };
    }, [records]);

    // Dependent Client options
    const clientOptions = useMemo(() => {
        let filteredRecords = records;
        if (formik.values.nttn_provider) {
            filteredRecords = filteredRecords.filter(
                (record) => getNestedValue(record, 'nttn_provider_details.id') === formik.values.nttn_provider
            );
        }
        return getUniqueOptionsWithIds(filteredRecords, 'client_details.client_name', 'client_details.id');
    }, [records, formik.values.nttn_provider]);

    // Reset the dependent 'client' field if 'nttn_provider' changes
    useEffect(() => {
        const currentClientId = formik.values.client;
        const isClientValid = clientOptions.some(opt => opt.value === currentClientId);
        if (!isClientValid && currentClientId) {
            formik.setFieldValue('client', '');
        }
    }, [formik.values.nttn_provider, formik.setFieldValue, clientOptions]);

    const handleLiveChange = useCallback(() => {
        if (live) {
            onFilterChange(formik.values);
        }
    }, [live, onFilterChange, formik.values]);

    useEffect(() => {
        handleLiveChange();
    }, [formik.values, handleLiveChange]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && drawerOpen) {
                setDrawerOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [drawerOpen]);

    useOutside(drawerRef, (e) => {
        if (document.querySelector('[data-calendar-portal]')?.contains(e.target)) return;
        setDrawerOpen(false);
    });

    const clearFilters = () => {
        formik.resetForm({ values: initialValues });
        onFilterChange({});
    };

    const activeFiltersCount = useMemo(() => {
        return Object.values(formik.values).filter(
            (value) => value !== null && value !== ''
        ).length;
    }, [formik.values]);

    const handleOpenDrawer = () => setDrawerOpen(true);
    const handleCloseDrawer = () => setDrawerOpen(false);

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
                        {/* NTTN Provider Filter */}
                        <Field
                            name="nttn_provider"
                            as={SelectField}
                            label="NTTN Provider"
                            options={dynamicOptions.nttn_provider}
                            floating={true}
                            searchable={true}
                            value={formik.values.nttn_provider}
                            onChange={(v) => formik.setFieldValue('nttn_provider', v)}
                        />

                        {/* Dependent Client Filter */}
                        <Field
                            name="client"
                            as={SelectField}
                            label="Client"
                            options={clientOptions}
                            floating={true}
                            searchable={true}
                            value={formik.values.client}
                            onChange={(v) => formik.setFieldValue('client', v)}
                        />

                        {/* Modification Type Filter */}
                        <Field
                            name="modification_type"
                            as={SelectField}
                            label="Modification Type"
                            options={dynamicOptions.modification_type}
                            floating={true}
                            searchable={true}
                            value={formik.values.modification_type}
                            onChange={(v) => formik.setFieldValue('modification_type', v)}
                        />

                        {/* Client Category Filter */}
                        <Field
                            name="client_category"
                            as={SelectField}
                            label="Client Category"
                            options={dynamicOptions.client_category}
                            floating={true}
                            searchable={true}
                            value={formik.values.client_category}
                            onChange={(v) => formik.setFieldValue('client_category', v)}
                        />

                        {/* Created At Date Filter */}
                        <Field
                            name="created_at"
                            as={DateField}
                            label="Created Date"
                            floating={true}
                            className="mb-0"
                            searchable={true}
                            options={dynamicOptions.created_at}
                            value={formik.values.created_at}
                            onChange={(v) => formik.setFieldValue('created_at', v)}
                        />
                    </form>
                </FormikProvider>

                <div className="flex-none p-4 border-t border-gray-200 bg-white flex justify-end gap-2">
                    <Button onClick={clearFilters} intent="ghost" type="button">
                        Clear All
                    </Button>
                    <Button intent="primary" type="submit" onClick={formik.handleSubmit}>
                        Apply
                    </Button>
                </div>
            </div>
        </>
    );
};

export default BWModificationFilterMenu;