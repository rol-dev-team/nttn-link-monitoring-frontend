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
const getUniqueOptionsWithIds = (records, namePath, idPath) => {
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
const getUniqueOptions = (records, key) => {
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

const WorkOrderFilterMenu = ({ records, onFilterChange, live = false }) => {
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
        requested_delivery: '',
        service_handover: '',
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
            sbu: getUniqueOptionsWithIds(records, 'survey_data.sbu_name', 'survey_data.sbu_id'),
            link_type: getUniqueOptionsWithIds(records, 'survey_data.link_type_name', 'survey_data.link_type_id'),
            aggregator: getUniqueOptionsWithIds(records, 'survey_data.aggregator_name', 'survey_data.aggregator_id'),
            kam: getUniqueOptionsWithIds(records, 'survey_data.kam_name', 'survey_data.kam_id'),
            nttn_name: getUniqueOptionsWithIds(records, 'survey_data.nttn_name', 'survey_data.nttn_id'),
            client_category: getUniqueOptions(records, 'survey_data.client_category'),
            requested_delivery: getUniqueOptions(records, 'requested_delivery').map(opt => ({
                ...opt,
                label: opt.label.substring(0, 10),
            })),
            service_handover: getUniqueOptions(records, 'service_handover').map(opt => ({
                ...opt,
                label: opt.label.substring(0, 10),
            })),
        };
    }, [records]);

    const clientOptions = useMemo(() => {
        let filteredRecords = records;

        if (formik.values.sbu_id) {
            filteredRecords = filteredRecords.filter(
                (record) => getNestedValue(record, 'survey_data.sbu_id') === formik.values.sbu_id
            );
        }

        if (formik.values.nttn_id) {
            filteredRecords = filteredRecords.filter(
                (record) => getNestedValue(record, 'survey_data.nttn_id') === formik.values.nttn_id
            );
        }

        return getUniqueOptionsWithIds(filteredRecords, 'survey_data.client_name', 'survey_data.client_id');
    }, [records, formik.values.sbu_id, formik.values.nttn_id]);

    useEffect(() => {
        const currentClientId = formik.values.client_id;
        const isClientValid = clientOptions.some(opt => opt.value === currentClientId);

        if (!isClientValid && currentClientId) {
            formik.setFieldValue('client_id', '');
        }
    }, [formik.values.sbu_id, formik.values.nttn_id, formik.setFieldValue, clientOptions]);

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
                            value={formik.values.sbu_id}
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
                            value={formik.values.link_type_id}
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
                            value={formik.values.aggregator_id}
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
                            value={formik.values.kam_id}
                            onChange={(v) => formik.setFieldValue('kam_id', v)}
                        />

                        {/* NTTN Name Filter */}
                        <Field
                            name="nttn_id"
                            as={SelectField}
                            label="NTTN Name"
                            options={dynamicOptions.nttn_name}
                            floating={true}
                            searchable={true}
                            value={formik.values.nttn_id}
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
                            value={formik.values.client_category}
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
                            value={formik.values.client_id}
                            onChange={(v) => formik.setFieldValue('client_id', v)}
                        />

                        {/* Requested Delivery Date Filter */}
                        <Field
                            name="requested_delivery"
                            as={DateField}
                            label="Requested Delivery Date"
                            floating={true}
                            className="mb-0"
                            searchable={true}
                            options={dynamicOptions.requested_delivery}
                            value={formik.values.requested_delivery}
                            onChange={(v) => formik.setFieldValue('requested_delivery', v)}
                        />

                        {/* Service Handover Date Filter */}
                        <Field
                            name="service_handover"
                            as={DateField}
                            label="Service Handover Date"
                            floating={true}
                            className="mb-0"
                            searchable={true}
                            options={dynamicOptions.service_handover}
                            value={formik.values.service_handover}
                            onChange={(v) => formik.setFieldValue('service_handover', v)}
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

export default WorkOrderFilterMenu;