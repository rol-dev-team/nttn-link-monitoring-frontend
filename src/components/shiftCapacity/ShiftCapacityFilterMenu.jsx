import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import clsx from 'clsx';
import { useOutside } from '../../hooks/useOutside';
import Button from '../ui/Button';
import { useFormik, FormikProvider } from 'formik';
import SelectField from '../fields/SelectField';
import { fetchSBUs } from '../../services/sbu';
import { fetchClients } from '../../services/client';
import { fetchActiveNttnWorkOrderIds, fetchActiveNttnProviderIds } from '../../services/workOrder';

// Helper function to safely get nested data
const getNestedValue = (obj, path) => {
    if (!obj) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
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

// Simple Text Input Component
const SimpleTextField = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    type = "text",
    floating = true,
    ...props 
}) => {
    
    const inputId = `text-field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    
    return (
        <div className="relative mb-4">
            {floating ? (
                <div className="relative">
                    <input
                        id={inputId}
                        type={type}
                        value={value || ''}
                        onChange={onChange}
                        placeholder=" "
                        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        {...props}
                    />
                    <label
                        htmlFor={inputId}
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                    >
                        {label}
                    </label>
                </div>
            ) : (
                <div>
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                    <input
                        id={inputId}
                        type={type}
                        value={value || ''}
                        onChange={onChange}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        {...props}
                    />
                </div>
            )}
        </div>
    );
};

const ShiftCapacityFilterMenu = ({ records, onFilterChange, live = false }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerRef = useRef(null);
    
    // State for API data
    const [sbuOptions, setSbuOptions] = useState([]);
    const [fromClientOptions, setFromClientOptions] = useState([]);
    const [toClientOptions, setToClientOptions] = useState([]);
    const [nttnWorkOrderIds, setNttnWorkOrderIds] = useState([]);
    const [nttnSurveyIds, setNttnSurveyIds] = useState([]);
    const [isLoadingSbu, setIsLoadingSbu] = useState(false);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [isLoadingNttnWorkOrderIds, setIsLoadingNttnWorkOrderIds] = useState(false);
    const [isLoadingNttnSurveyIds, setIsLoadingNttnSurveyIds] = useState(false);
    const [sbuNameMap, setSbuNameMap] = useState(new Map());

    const initialValues = {
        sbu_id: '',
        sbu_name: '',
        from_client_id: '',
        from_client_name: '',
        to_client_id: '',
        to_client_name: '',
        client_lat: '',
        client_long: '',
        nttn_work_order_id: '',
        nttn_survey_id: '',
    };

    const formik = useFormik({
        initialValues,
        onSubmit: (values) => {
            // Clean up the values before sending
            const activeFilters = {};
            
            Object.entries(values).forEach(([key, value]) => {
                if (value !== null && value !== '' && value !== undefined) {
                    activeFilters[key] = value;
                    
                    // If sbu_id is selected, also filter by sbu_name for consistency
                    if (key === 'sbu_id' && value) {
                        const sbuName = sbuNameMap.get(String(value));
                        if (sbuName) {
                            activeFilters['sbu_name'] = sbuName;
                        }
                    }
                }
            });

            console.log('🔍 Applying filters:', activeFilters);
            onFilterChange(activeFilters);
            setDrawerOpen(false);
        },
    });

    // Fetch SBU data from API
    useEffect(() => {
        const loadSBUs = async () => {
            setIsLoadingSbu(true);
            try {
                const response = await fetchSBUs();
                const sbuData = Array.isArray(response) ? response : response?.data || [];
                
                const mappedOptions = sbuData.map(sbu => ({
                    value: String(sbu.id),
                    label: sbu.sbu_name || sbu.name || `SBU ${sbu.id}`,
                }));
                
                // Create a map of ID to name for filtering
                const nameMap = new Map();
                sbuData.forEach(sbu => {
                    nameMap.set(String(sbu.id), sbu.sbu_name || sbu.name || `SBU ${sbu.id}`);
                });
                
                setSbuOptions(mappedOptions);
                setSbuNameMap(nameMap);
                console.log('✅ SBU options loaded:', mappedOptions);
            } catch (error) {
                console.error('❌ Error fetching SBUs:', error);
                setSbuOptions([]);
            } finally {
                setIsLoadingSbu(false);
            }
        };

        loadSBUs();
    }, []);

    // Fetch Client data from API
    useEffect(() => {
        const loadClients = async () => {
            setIsLoadingClients(true);
            try {
                const response = await fetchClients();
                
                console.log('🔍 Client API response:', response);
                
                let clientData = [];
                
                if (response && response.success && Array.isArray(response.data)) {
                    clientData = response.data;
                } else if (Array.isArray(response)) {
                    clientData = response;
                } else if (response && Array.isArray(response.data)) {
                    clientData = response.data;
                }
                
                console.log('📋 Raw client data:', clientData);
                
                // Transform API response
                const mappedClientOptions = clientData.map(client => {
                    const clientId = client.id;
                    const clientName = client.client_name;
                    
                    return {
                        value: String(clientId),
                        label: clientName,
                        client_lat: client.client_lat || client.lat,
                        client_long: client.client_long || client.lng || client.long,
                        originalData: client,
                    };
                });
                
                console.log('✅ Mapped client options:', mappedClientOptions);
                setFromClientOptions(mappedClientOptions);
                setToClientOptions(mappedClientOptions);
                
            } catch (error) {
                console.error('❌ Error fetching clients:', error);
                console.error('Error details:', error.response?.data || error.message);
                setFromClientOptions([]);
                setToClientOptions([]);
            } finally {
                setIsLoadingClients(false);
            }
        };

        loadClients();
    }, []);

    // ✅ Fetch NTTN Work Order IDs from API
    useEffect(() => {
        const loadNttnWorkOrderIds = async () => {
            setIsLoadingNttnWorkOrderIds(true);
            try {
                console.log('🔄 Fetching NTTN Work Order IDs...');
                const response = await fetchActiveNttnWorkOrderIds();
                
                console.log('🔍 NTTN Work Order IDs API response:', response);
                
                let workOrderIds = [];
                
                // Based on your API response: {success: true, message: "...", data: ["45", "150", "70"]}
                if (response && response.success && Array.isArray(response.data)) {
                    workOrderIds = response.data;
                } else if (Array.isArray(response)) {
                    workOrderIds = response;
                } else if (response && response.data && Array.isArray(response.data)) {
                    workOrderIds = response.data;
                }
                
                console.log('📋 Extracted work order IDs:', workOrderIds);
                
                // Transform string IDs to options format
                const mappedOptions = workOrderIds
                    .filter(id => id !== null && id !== undefined && String(id).trim() !== "")
                    .map(id => ({
                        value: String(id).trim(),
                        label: String(id).trim(),
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));

                console.log('✅ NTTN Work Order IDs transformed:', mappedOptions);
                console.log('✅ Number of options:', mappedOptions.length);
                
                setNttnWorkOrderIds(mappedOptions);
                
            } catch (error) {
                console.error('❌ Error fetching NTTN Work Order IDs:', error);
                console.error('Error details:', error.response?.data || error.message);
                
                // Fallback: try to extract from local records if API fails
                try {
                    const uniqueIds = new Set();
                    records.forEach(record => {
                        if (record.nttn_work_order_id) {
                            uniqueIds.add(String(record.nttn_work_order_id).trim());
                        }
                    });

                    const mappedOptions = Array.from(uniqueIds)
                        .filter(id => id && id !== '')
                        .map(id => ({
                            value: id,
                            label: id,
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label));

                    console.log('✅ Using local fallback for NTTN Work Order IDs:', mappedOptions);
                    setNttnWorkOrderIds(mappedOptions);
                } catch (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError);
                    setNttnWorkOrderIds([]);
                }
            } finally {
                setIsLoadingNttnWorkOrderIds(false);
            }
        };

        loadNttnWorkOrderIds();
    }, [records]);

    // ✅ Fetch NTTN Provider IDs from API
    useEffect(() => {
        const loadNttnProviderIds = async () => {
            setIsLoadingNttnSurveyIds(true);
            try {
                console.log('🔄 Fetching NTTN Provider IDs...');
                const response = await fetchActiveNttnProviderIds();
                
                console.log('🔍 NTTN Provider IDs API response:', response);
                
                let providerIds = [];
                
                // Based on your API response: {success: true, message: "...", data: ["75", "324", "65"]}
                if (response && response.success && Array.isArray(response.data)) {
                    providerIds = response.data;
                } else if (Array.isArray(response)) {
                    providerIds = response;
                } else if (response && response.data && Array.isArray(response.data)) {
                    providerIds = response.data;
                }
                
                console.log('📋 Extracted provider IDs:', providerIds);
                
                // Transform string IDs to options format
                const mappedOptions = providerIds
                    .filter(id => id !== null && id !== undefined && String(id).trim() !== "")
                    .map(id => ({
                        value: String(id).trim(),
                        label: String(id).trim(),
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));

                console.log('✅ NTTN Provider IDs transformed:', mappedOptions);
                console.log('✅ Number of options:', mappedOptions.length);
                
                setNttnSurveyIds(mappedOptions);
                
            } catch (error) {
                console.error('❌ Error fetching NTTN Provider IDs:', error);
                console.error('Error details:', error.response?.data || error.message);
                
                // Fallback: try to extract from local records if API fails
                try {
                    const uniqueIds = new Set();
                    records.forEach(record => {
                        if (record.nttn_survey_id) {
                            uniqueIds.add(String(record.nttn_survey_id).trim());
                        }
                    });

                    const mappedOptions = Array.from(uniqueIds)
                        .filter(id => id && id !== '')
                        .map(id => ({
                            value: id,
                            label: id,
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label));

                    console.log('✅ Using local fallback for NTTN Provider IDs:', mappedOptions);
                    setNttnSurveyIds(mappedOptions);
                } catch (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError);
                    setNttnSurveyIds([]);
                }
            } finally {
                setIsLoadingNttnSurveyIds(false);
            }
        };

        loadNttnProviderIds();
    }, [records]);

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
            (value) => value !== null && value !== '' && value !== undefined
        ).length;
    }, [formik.values]);

    const handleOpenDrawer = () => setDrawerOpen(true);
    const handleCloseDrawer = () => setDrawerOpen(false);

    const handleSbuChange = (value) => {
        console.log('📝 SBU changed to:', value);
        formik.setFieldValue('sbu_id', value);
        
        if (value && sbuNameMap.has(String(value))) {
            const sbuName = sbuNameMap.get(String(value));
            formik.setFieldValue('sbu_name', sbuName);
        } else {
            formik.setFieldValue('sbu_name', '');
        }
    };

    const handleFromClientChange = (value) => {
        console.log('📝 From Client changed to:', value);
        formik.setFieldValue('from_client_id', value);
        
        if (value) {
            const selectedClient = fromClientOptions.find(client => client.value === value);
            console.log('🔍 Selected from client:', selectedClient);
            if (selectedClient) {
                if (selectedClient.client_lat) {
                    formik.setFieldValue('client_lat', selectedClient.client_lat);
                }
                if (selectedClient.client_long) {
                    formik.setFieldValue('client_long', selectedClient.client_long);
                }
            }
        }
    };

    const handleToClientChange = (value) => {
        console.log('📝 To Client changed to:', value);
        formik.setFieldValue('to_client_id', value);
        
        if (value) {
            const selectedClient = toClientOptions.find(client => client.value === value);
            console.log('🔍 Selected to client:', selectedClient);
            if (selectedClient) {
                if (selectedClient.client_lat) {
                    formik.setFieldValue('client_lat', selectedClient.client_lat);
                }
                if (selectedClient.client_long) {
                    formik.setFieldValue('client_long', selectedClient.client_long);
                }
            }
        }
    };

    // Debug: Log current state
    useEffect(() => {
        console.log('🔍 Current nttnWorkOrderIds state:', nttnWorkOrderIds);
        console.log('🔍 Current nttnSurveyIds state:', nttnSurveyIds);
    }, [nttnWorkOrderIds, nttnSurveyIds]);

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
                        <div className="pb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Client & SBU Filters</h3>
                            
                            {/* SBU Filter */}
                            <SelectField
                                name="sbu_id"
                                label={`SBU ${isLoadingSbu ? '(Loading...)' : ''}`}
                                options={sbuOptions}
                                floating={true}
                                searchable={true}
                                value={formik.values.sbu_id}
                                onChange={handleSbuChange}
                                disabled={isLoadingSbu}
                            />

                            {/* From Client Filter */}
                            <SelectField
                                name="from_client_id"
                                label={`From Client ${isLoadingClients ? '(Loading...)' : ''}`}
                                options={fromClientOptions}
                                floating={true}
                                searchable={true}
                                value={formik.values.from_client_id}
                                onChange={handleFromClientChange}
                                disabled={isLoadingClients}
                            />

                            {/* To Client Filter */}
                            <SelectField
                                name="to_client_id"
                                label={`To Client ${isLoadingClients ? '(Loading...)' : ''}`}
                                options={toClientOptions}
                                floating={true}
                                searchable={true}
                                value={formik.values.to_client_id}
                                onChange={handleToClientChange}
                                disabled={isLoadingClients}
                            />

                            {/* Link / SCR ID Filter */}
                            <SelectField
                                name="nttn_work_order_id"
                                label={`Link / SCR ID ${isLoadingNttnWorkOrderIds ? '(Loading...)' : ''}`}
                                options={nttnWorkOrderIds}
                                floating={true}
                                searchable={true}
                                value={formik.values.nttn_work_order_id}
                                onChange={(value) => formik.setFieldValue('nttn_work_order_id', value)}
                                disabled={isLoadingNttnWorkOrderIds}
                            />

                            {/* NTTN Provider ID Filter */}
                            <SelectField
                                name="nttn_survey_id"
                                label={`NTTN Provider ID ${isLoadingNttnSurveyIds ? '(Loading...)' : ''}`}
                                options={nttnSurveyIds}
                                floating={true}
                                searchable={true}
                                value={formik.values.nttn_survey_id}
                                onChange={(value) => formik.setFieldValue('nttn_survey_id', value)}
                                disabled={isLoadingNttnSurveyIds}
                            />
                        </div>

                        {/* Client Location Filters */}
                        <div className="pb-4 border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Client Location</h3>

                            {/* Client Lat Filter */}
                            <div className="mb-4">
                                <SimpleTextField
                                    label="Client Latitude"
                                    value={formik.values.client_lat}
                                    onChange={(e) => formik.setFieldValue('client_lat', e.target.value)}
                                    placeholder="Enter latitude (exact match)"
                                    type="text"
                                />
                            </div>

                            {/* Client Long Filter */}
                            <div className="mb-4">
                                <SimpleTextField
                                    label="Client Longitude"
                                    value={formik.values.client_long}
                                    onChange={(e) => formik.setFieldValue('client_long', e.target.value)}
                                    placeholder="Enter longitude (exact match)"
                                    type="text"
                                />
                            </div>
                        </div>
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

export default ShiftCapacityFilterMenu;