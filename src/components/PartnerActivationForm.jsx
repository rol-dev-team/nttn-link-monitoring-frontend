


// src/components/PartnerActivationForm.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft } from 'lucide-react';
import TextInputField from './fields/TextInputField';
import SelectField from './fields/SelectField';
import Button from './ui/Button';
import { useToast } from '../hooks/useToast';
import {
    fetchCategoryWiseClientPartner,
    fetchWorkOrderDetailsForPartner,
} from '../services/partner-link/txToPartner';
import Select from 'react-select';

// ================================================================
// CONSTANTS
// ================================================================
const MOCK_STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

// ================================================================
// VALIDATION SCHEMA
// ================================================================
const ActivationPlanSchema = Yup.object().shape({
    nttn_work_order_id: Yup.string().required('Partner Name / Work Order ID is required'),
    nttn_vlan: Yup.string().max(50).required('NTTN VLAN is required'),
    int_peering_ip: Yup.string().max(50).required('IP is required'),
    ggc_peering_ip: Yup.string().max(50).required('IP is required'),
    fna_peering_ip: Yup.string().max(50).required('IP is required'),
    bdix_peering_ip: Yup.string().max(50).required('IP is required'),
    mcdn_peering_ip: Yup.string().max(50).required('IP is required'),
    asn: Yup.string().max(50).required('ASN is required'),
    nas_ip: Yup.string().max(50).required('NAS IP is required'),
    nat_ip: Yup.string().max(50).required('NAT IP is required'),
    int_vlan: Yup.string().max(50).required('VLAN is required'),
    ggn_vlan: Yup.string().max(50).required('VLAN is required'),
    fna_vlan: Yup.string().max(50).required('VLAN is required'),
    bdix_vlan: Yup.string().max(50).required('VLAN is required'),
    mcdn_vlan: Yup.string().max(50).required('VLAN is required'),
    connected_sw_name: Yup.string().max(50).required('SW Name is required'),
    chr_server: Yup.string().max(50).required('Server is required'),
    sw_port: Yup.string().max(50).required('SW Port is required'),
    nic_no: Yup.string().max(50).required('NIC No is required'),
    status: Yup.string()
        .oneOf(MOCK_STATUS_OPTIONS.map((o) => o.value), 'Invalid status')
        .required('Status is required'),
    note: Yup.string().max(255).notRequired(),
    backup: Yup.boolean().notRequired(),
    log: Yup.boolean().notRequired(),
});

// ================================================================
// INITIAL VALUES
// ================================================================
const getInitialValues = (initialData) => {
    if (initialData) {
        return {
            nttn_work_order_id: initialData.work_order_id || '',
            client_id: initialData.client_id || '',
            nttn_vlan: initialData.nttn_vlan || '',
            int_peering_ip: initialData.int_routing_ip || '',
            ggc_peering_ip: initialData.ggc_routing_ip || '',
            fna_peering_ip: initialData.fna_routing_ip || '',
            bdix_peering_ip: initialData.bcdx_routing_ip || '',
            mcdn_peering_ip: initialData.mcdn_routing_ip || '',
            asn: initialData.asn?.toString() || '',
            nas_ip: initialData.nas_ip || '',
            nat_ip: initialData.nat_ip || '',
            int_vlan: initialData.int_vlan || '',
            ggn_vlan: initialData.ggn_vlan || '',
            fna_vlan: initialData.fna_vlan || '',
            bdix_vlan: initialData.bcdx_vlan || '',
            mcdn_vlan: initialData.mcdn_vlan || '',
            connected_sw_name: initialData.connected_ws_name || '',
            chr_server: initialData.chr_server || '',
            sw_port: initialData.sw_port?.toString() || '',
            nic_no: initialData.nic_no || '',
            status: initialData.status || MOCK_STATUS_OPTIONS[0].value,
            note: initialData.note || '',
            backup: Boolean(initialData.backup),
            log: Boolean(initialData.log),
        };
    }

    return {
        nttn_work_order_id: '',
        client_id: '',
        nttn_work_order_id: '',
        nttn_vlan: '',
        int_peering_ip: '',
        ggc_peering_ip: '',
        fna_peering_ip: '',
        bdix_peering_ip: '',
        mcdn_peering_ip: '',
        asn: '',
        nas_ip: '',
        nat_ip: '',
        int_vlan: '',
        ggn_vlan: '',
        fna_vlan: '',
        bdix_vlan: '',
        mcdn_vlan: '',
        connected_sw_name: '',
        chr_server: '',
        sw_port: '',
        nic_no: '',
        status: MOCK_STATUS_OPTIONS[0].value,
        note: '',
        backup: false,
        log: false,
    };
};

// ================================================================
// HELPER COMPONENTS
// ================================================================
const PartnerDetailDisplayField = ({ label, value }) => (
    <div className="flex flex-col space-y-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
        </span>
        <span className="text-base font-semibold text-gray-800">{value || 'N/A'}</span>
    </div>
);

// ✅ Shows error if touched OR backend injected error via setErrors
const FieldWrapper = ({ name, placeholder, formik }) => (
    <div className="space-y-1">
        <TextInputField name={name} placeholder={placeholder} formik={formik} />
        {(formik.touched[name] || formik.errors[name]) && formik.errors[name] && (
            <p className="text-red-500 text-sm ml-1">{formik.errors[name]}</p>
        )}
    </div>
);

// ✅ Same fix for select fields
const SelectFieldWrapper = ({ name, placeholder, options, formik }) => (
    <div className="space-y-1">
        <SelectField name={name} placeholder={placeholder} options={options} formik={formik} />
        {(formik.touched[name] || formik.errors[name]) && formik.errors[name] && (
            <p className="text-red-500 text-sm ml-1">{formik.errors[name]}</p>
        )}
    </div>
);

// ================================================================
// MAIN COMPONENT
// ================================================================
export default function PartnerActivationForm({
    initialValues,
    isEditMode,
    onSubmit,
    onCancel,
}) {
    const { addToast } = useToast();
    const [clientOptions, setClientOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [partnerDetails, setPartnerDetails] = useState({});
    const [detailsLoading, setDetailsLoading] = useState(false);

    const formTitle = isEditMode
        ? 'Edit Activation Plan Configuration'
        : 'Activation Plan Configuration';

    // Fetch client dropdown options on mount
    useEffect(() => {
        const fetchClientData = async () => {
            setLoading(true);
            try {
                const response = await fetchCategoryWiseClientPartner();
                if (response.status === 'success' && response.data) {
                    const options = response.data.map((client) => ({
                        label: `${client.client_name} - ${client.nttn_work_order_id}`,
                        value: client.work_order_id.toString(),
                        client_id: client.client_id,
                    }));
                    setClientOptions(options);
                } else {
                    addToast('Failed to load client data', 'error');
                    setClientOptions([]);
                }
            } catch (error) {
                console.error('Error fetching client data:', error);
                addToast('Error loading client data', 'error');
                setClientOptions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, [addToast]);

    return (
        <div className="w-full h-full p-4 lg:p-6">
            <header className="mb-10 pb-6 border-b border-gray-200 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        <Button
                            variant="ghost"
                            leftIcon={ArrowLeft}
                            onClick={onCancel}
                            className="-ml-4 text-lg font-semibold"
                            type="button"
                        />
                        {formTitle}
                    </h1>
                    <p className="text-sm text-gray-500 ml-10">
                        {isEditMode
                            ? 'Modify the technical parameters and devices for this partner link.'
                            : 'Configure technical parameters and associated drop devices for a new partner link.'}
                    </p>
                </div>
            </header>

            <Formik
                initialValues={getInitialValues(initialValues)}
                validationSchema={ActivationPlanSchema}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {(formik) => {
                    const selectedLinkID = formik.values.nttn_work_order_id;

                    // Fetch work order details when selection changes
                    useEffect(() => {
                        if (selectedLinkID) {
                            const fetchDetails = async () => {
                                setDetailsLoading(true);
                                try {
                                    const response = await fetchWorkOrderDetailsForPartner(selectedLinkID);
                                    if (response.status === 'success' && response.data) {
                                        setPartnerDetails({
                                            nttn_provider: response.data.nttn_name,
                                            aggregator: response.data.aggregator_name,
                                            partner_name: response.data.client_name,
                                            business_kam: response.data.kam_name,
                                            sbu: response.data.sbu_name,
                                            purchased_capacity: response.data.request_capacity,
                                        });
                                        if (response.data.client_id) {
                                            formik.setFieldValue('client_id', response.data.client_id);
                                        }
                                    } else {
                                        addToast('Failed to load partner details', 'error');
                                        setPartnerDetails({});
                                        formik.setFieldValue('client_id', '');
                                    }
                                } catch (error) {
                                    console.error('Error fetching partner details:', error);
                                    addToast('Error loading partner details', 'error');
                                    setPartnerDetails({});
                                    formik.setFieldValue('client_id', '');
                                } finally {
                                    setDetailsLoading(false);
                                }
                            };
                            fetchDetails();
                        } else {
                            setPartnerDetails({});
                            formik.setFieldValue('client_id', '');
                        }
                    }, [selectedLinkID]);

                    return (
                        <Form className="grid grid-cols-1 md:grid-cols-3 gap-x-14 gap-y-6">

                            {/* ── Partner Selection Dropdown ── */}
                            <div>
                                <Select
                                    name="nttn_work_order_id"
                                    options={clientOptions}
                                    isDisabled={loading}
                                    isLoading={loading}
                                    placeholder={
                                        loading ? 'Loading clients...' : 'Select Partner Name / Link ID'
                                    }
                                    isClearable={true}
                                    isSearchable={true}
                                    value={
                                        clientOptions.find(
                                            (option) =>
                                                option.value === formik.values.nttn_work_order_id
                                        ) || null
                                    }
                                    onChange={(selectedOption) => {
                                        if (selectedOption) {
                                            formik.setFieldValue(
                                                'nttn_work_order_id',
                                                selectedOption.value
                                            );
                                            formik.setFieldValue(
                                                'client_id',
                                                selectedOption.client_id
                                                    ? selectedOption.client_id.toString()
                                                    : ''
                                            );
                                        } else {
                                            formik.setFieldValue('nttn_work_order_id', '');
                                            formik.setFieldValue('client_id', '');
                                        }
                                        setPartnerDetails({});
                                    }}
                                    onBlur={() =>
                                        formik.setFieldTouched('nttn_work_order_id', true)
                                    }
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            borderRadius: '6px',
                                            // ✅ Red border if touched OR backend-injected error
                                            borderColor:
                                                (formik.touched.nttn_work_order_id ||
                                                    formik.errors.nttn_work_order_id) &&
                                                formik.errors.nttn_work_order_id
                                                    ? '#ef4444'
                                                    : '#cccccc',
                                            boxShadow: state.isFocused
                                                ? '0 0 0 1px #4b1e85'
                                                : 'none',
                                            '&:hover': { borderColor: '#4b1e85' },
                                            padding: '2px 4px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isSelected
                                                ? '#4b1e85'
                                                : state.isFocused
                                                ? '#f0eafa'
                                                : '#ffffff',
                                            color: state.isSelected ? '#ffffff' : '#333333',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: '#aaaaaa',
                                            fontSize: '14px',
                                        }),
                                        clearIndicator: (base) => ({
                                            ...base,
                                            cursor: 'pointer',
                                            color: '#999',
                                            '&:hover': { color: '#ef4444' },
                                        }),
                                    }}
                                />

                                {/* ✅ Error — shows on touched OR backend-injected */}
                                {(formik.touched.nttn_work_order_id ||
                                    formik.errors.nttn_work_order_id) &&
                                    formik.errors.nttn_work_order_id && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {formik.errors.nttn_work_order_id}
                                        </p>
                                    )}

                                {loading && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Loading client data...
                                    </p>
                                )}
                            </div>

                            {/* ── Partner Information ── */}
                            <div className="md:col-span-3">
                                <hr className="border-gray-200 mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-800 -mt-2">
                                    Partner Information
                                </h3>
                            </div>

                            <div className="md:col-span-3 mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6 p-6 bg-white border border-gray-200 rounded-xl">
                                    <div className="space-y-4 pr-5 border-r border-gray-100">
                                        <PartnerDetailDisplayField
                                            label="NTTN Provider"
                                            value={
                                                detailsLoading
                                                    ? 'Loading...'
                                                    : partnerDetails.nttn_provider
                                            }
                                        />
                                        <PartnerDetailDisplayField
                                            label="Aggregator"
                                            value={
                                                detailsLoading
                                                    ? 'Loading...'
                                                    : partnerDetails.aggregator
                                            }
                                        />
                                    </div>
                                    <div className="space-y-4 px-5 border-r border-gray-100">
                                        <PartnerDetailDisplayField
                                            label="Partner Name"
                                            value={
                                                detailsLoading
                                                    ? 'Loading...'
                                                    : partnerDetails.partner_name
                                            }
                                        />
                                        <PartnerDetailDisplayField
                                            label="Business KAM"
                                            value={
                                                detailsLoading
                                                    ? 'Loading...'
                                                    : partnerDetails.business_kam
                                            }
                                        />
                                    </div>
                                    <div className="space-y-4 pl-5">
                                        <PartnerDetailDisplayField
                                            label="SBU"
                                            value={
                                                detailsLoading ? 'Loading...' : partnerDetails.sbu
                                            }
                                        />
                                        <PartnerDetailDisplayField
                                            label="Purchased Capacity"
                                            value={
                                                detailsLoading
                                                    ? 'Loading...'
                                                    : partnerDetails.purchased_capacity
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Technical Configuration ── */}
                            <div className="md:col-span-3">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-2 pt-4 border-t border-gray-200">
                                    Technical Configuration
                                </h3>
                            </div>

                            {/* Column 1: Peering IPs */}
                            <div className="space-y-6">
                                <FieldWrapper
                                    name="int_peering_ip"
                                    placeholder="INT Peering IP"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="ggc_peering_ip"
                                    placeholder="GGC Peering IP"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="fna_peering_ip"
                                    placeholder="FNA Peering IP"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="bdix_peering_ip"
                                    placeholder="BDIX Peering IP"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="mcdn_peering_ip"
                                    placeholder="MCDN Peering IP"
                                    formik={formik}
                                />
                                <FieldWrapper name="asn" placeholder="ASN" formik={formik} />
                            </div>

                            {/* Column 2: VLANs */}
                            <div className="space-y-6">
                                <FieldWrapper
                                    name="nttn_vlan"
                                    placeholder="NTTN VLAN"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="int_vlan"
                                    placeholder="INT VLAN"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="ggn_vlan"
                                    placeholder="GGN VLAN"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="fna_vlan"
                                    placeholder="FNA VLAN"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="bdix_vlan"
                                    placeholder="BDIX VLAN"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="mcdn_vlan"
                                    placeholder="MCDN VLAN"
                                    formik={formik}
                                />
                            </div>

                            {/* Column 3: Misc */}
                            <div className="space-y-6">
                                <FieldWrapper
                                    name="nas_ip"
                                    placeholder="NAS IP"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="nat_ip"
                                    placeholder="NAT IP"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="connected_sw_name"
                                    placeholder="Connected SW Name"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="chr_server"
                                    placeholder="CHR Server"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="sw_port"
                                    placeholder="SW Port"
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="nic_no"
                                    placeholder="NIC No"
                                    formik={formik}
                                />
                            </div>

                            {/* ── Status and Note ── */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-14 pt-2">
                                <div>
                                    <SelectFieldWrapper
                                        name="status"
                                        placeholder="Status"
                                        options={MOCK_STATUS_OPTIONS}
                                        formik={formik}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <FieldWrapper
                                        name="note"
                                        placeholder="Note (Optional)"
                                        formik={formik}
                                    />
                                </div>
                            </div>

                            {/* ── Flags ── */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-14 gap-y-4 pt-2">
                                <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        name="backup"
                                        checked={formik.values.backup}
                                        onChange={formik.handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Backup: {formik.values.backup ? 'Yes' : 'No'}
                                </label>
                                <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        name="log"
                                        checked={formik.values.log}
                                        onChange={formik.handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Log: {formik.values.log ? 'Yes' : 'No'}
                                </label>
                            </div>

                            {/* ── Action Buttons ── */}
                            <div className="md:col-span-3 flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
                                <Button
                                    type="button"
                                    intent="secondary"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </Button>

                                {/* ✅ Touch all fields first so ALL Yup errors show on click */}
                                <Button
                                    type="button"
                                    intent="primary"
                                    loading={formik.isSubmitting}
                                    loadingText={
                                        isEditMode ? 'Updating Plan...' : 'Saving Plan...'
                                    }
                                    disabled={formik.isSubmitting}
                                    onClick={async () => {
                                        const allFields = Object.keys(getInitialValues(null));
                                        const touchedAll = allFields.reduce((acc, key) => {
                                            acc[key] = true;
                                            return acc;
                                        }, {});
                                        await formik.setTouched(touchedAll, true);
                                        formik.submitForm();
                                    }}
                                >
                                    {isEditMode ? 'Update' : 'Save'}
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
}
