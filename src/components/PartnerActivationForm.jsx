// src/components/PartnerActivationForm.jsx
import React, { useCallback, useMemo } from "react";
import { Formik, Form, FieldArray, useFormikContext, Field } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Trash2, PlusCircle } from "lucide-react";
import TextInputField from "./fields/TextInputField";
import SelectField from "./fields/SelectField";
import Button from "./ui/Button";
import { useToast } from "../hooks/useToast";
import DataTable from "./table/DataTable";

// Mock Data
const MOCK_NTTN_OPTIONS = [
    { label: "NTTN-LINK-001", value: "NTTN-LINK-001" },
    { label: "NTTN-LINK-002 (Test)", value: "NTTN-LINK-002" },
    { label: "NTTN-LINK-003 (Live)", value: "NTTN-LINK-003" },
];

const MOCK_STATUS_OPTIONS = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

const MOCK_PARTNER_DATA = {
    "NTTN-LINK-001": {
        nttn_provider: "Summit",
        partner_name: "ABC Entity",
        sbu: "Race Online",
        aggregator: "Khaja",
        business_kam: "XYZ",
        purchased_capacity: "100 Mb",
    },
    "NTTN-LINK-002": {
        nttn_provider: "Fiber@Home",
        partner_name: "Beta ISP",
        sbu: "MetroNet",
        aggregator: "Rahim",
        business_kam: "PQR",
        purchased_capacity: "50 Mb",
    },
    "NTTN-LINK-003": {
        nttn_provider: "Summit",
        partner_name: "Gamma Telecom",
        sbu: "Linkup",
        aggregator: "Karim",
        business_kam: "LMN",
        purchased_capacity: "500 Mb",
    },
};

// Validation Schemas
const DropDeviceSchema = Yup.object().shape({
    device_ip: Yup.string().max(50).required("IP is required"),
    usage_vlan: Yup.string().max(50).required("VLAN is required"),
    connected_port: Yup.string().max(50).required("Port is required"),
});

const InterfaceConfigSchema = Yup.object().shape({
    interface_name: Yup.string().max(50).required("Interface Name is required"),
});

const ActivationPlanSchema = Yup.object().shape({
    // Frontend field names (will be mapped to backend names in dashboard)
    nttn_link_id: Yup.string().required(
        "Partner Name / NTTN Link ID is required"
    ),
    nttn_vlan: Yup.string().max(10).required("NTTN VLAN is required"),
    int_peering_ip: Yup.string().max(50).required("IP is required"),
    ggc_peering_ip: Yup.string().max(50).required("IP is required"),
    fna_peering_ip: Yup.string().max(50).required("IP is required"),
    bdix_peering_ip: Yup.string().max(50).required("IP is required"),
    mcdn_peering_ip: Yup.string().max(50).required("IP is required"),
    asn: Yup.string().max(20).required("ASN is required"),
    nas_ip: Yup.string().max(50).required("NAS IP is required"),
    nat_ip: Yup.string().max(50).required("NAT IP is required"),
    int_vlan: Yup.string().max(10).required("VLAN is required"),
    ggn_vlan: Yup.string().max(10).required("VLAN is required"),
    fna_vlan: Yup.string().max(10).required("VLAN is required"),
    bdix_vlan: Yup.string().max(10).required("VLAN is required"),
    mcdn_vlan: Yup.string().max(10).required("VLAN is required"),
    connected_sw_name: Yup.string().max(50).required("SW Name is required"),
    chr_server: Yup.string().max(50).required("Server is required"),
    sw_port: Yup.string().max(20).required("SW Port is required"),
    nic_no: Yup.string().max(20).required("NIC No is required"),
    status: Yup.string()
        .oneOf(
            MOCK_STATUS_OPTIONS.map((o) => o.value),
            "Invalid status"
        )
        .required("Status is required"),
    note: Yup.string().max(255).notRequired(),
    drop_devices: Yup.array().of(DropDeviceSchema),
    interface_configs: Yup.array().of(InterfaceConfigSchema),
});

// Initial Values Helper - Map backend data to frontend field names for editing
const getInitialValues = (initialData) => {
    if (initialData) {
        // Map backend field names to frontend field names for editing
        return {
            nttn_link_id: initialData.work_order_id || "",
            nttn_vlan: initialData.nttn_vlan || "",
            int_peering_ip: initialData.int_routing_ip || "",
            ggc_peering_ip: initialData.ggc_routing_ip || "",
            fna_peering_ip: initialData.fna_routing_ip || "",
            bdix_peering_ip: initialData.bcdx_routing_ip || "",
            mcdn_peering_ip: initialData.mcdn_routing_ip || "",
            asn: initialData.asn?.toString() || "",
            nas_ip: initialData.nas_ip || "",
            nat_ip: initialData.nat_ip || "",
            int_vlan: initialData.int_vlan || "",
            ggn_vlan: initialData.ggn_vlan || "",
            fna_vlan: initialData.fna_vlan || "",
            bdix_vlan: initialData.bcdx_vlan || "",
            mcdn_vlan: initialData.mcdn_vlan || "",
            connected_sw_name: initialData.connected_ws_name || "",
            chr_server: initialData.chr_server || "",
            sw_port: initialData.sw_port?.toString() || "",
            nic_no: initialData.nic_no || "",
            status: initialData.status || MOCK_STATUS_OPTIONS[0].value,
            note: initialData.note || "",
            drop_devices: initialData.drop_devices || [],
            interface_configs: initialData.interface_configs || [],
            new_device_ip: "",
            new_usage_vlan: "",
            new_connected_port: "",
            new_interface_name: "",
        };
    }

    // Default values for new form
    return {
        nttn_link_id: "",
        nttn_vlan: "",
        int_peering_ip: "",
        ggc_peering_ip: "",
        fna_peering_ip: "",
        bdix_peering_ip: "",
        mcdn_peering_ip: "",
        asn: "",
        nas_ip: "",
        nat_ip: "",
        int_vlan: "",
        ggn_vlan: "",
        fna_vlan: "",
        bdix_vlan: "",
        mcdn_vlan: "",
        connected_sw_name: "",
        chr_server: "",
        sw_port: "",
        nic_no: "",
        status: MOCK_STATUS_OPTIONS[0].value,
        note: "",
        drop_devices: [],
        interface_configs: [],
        new_device_ip: "",
        new_usage_vlan: "",
        new_connected_port: "",
        new_interface_name: "",
    };
};

// Helper Components
const PartnerDetailDisplayField = ({ label, value }) => (
    <div className="flex flex-col space-y-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
        </span>
        <span className="text-base font-semibold text-gray-800">
            {value || "N/A"}
        </span>
    </div>
);

const FieldWrapper = ({ name, placeholder, formik }) => (
    <div className="space-y-1">
        <TextInputField name={name} placeholder={placeholder} formik={formik} />
    </div>
);

const SelectFieldWrapper = ({ name, placeholder, options, formik }) => (
    <div className="space-y-1">
        <SelectField
            name={name}
            placeholder={placeholder}
            options={options}
            formik={formik}
        />
        {formik.touched[name] && formik.errors[name] && (
            <p className="text-red-500 text-sm ml-1">{formik.errors[name]}</p>
        )}
    </div>
);

// Interface Configuration Section
const InterfaceConfigSection = ({ addToast }) => {
    const { values, setFieldValue, setFieldTouched } = useFormikContext();
    const interfaceConfigs = values.interface_configs || [];

    const INTERFACE_COLUMNS = useMemo(
        () => [
            { key: "interface_name", header: "Interface Name" },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                width: "5rem",
                isSortable: false,
                render: (v, row, index) => (
                    <button
                        type="button"
                        onClick={() => {
                            const newConfigs = [...interfaceConfigs];
                            newConfigs.splice(index, 1);
                            setFieldValue("interface_configs", newConfigs);
                            addToast(
                                `Removed interface: ${row.interface_name}`,
                                "warning"
                            );
                        }}
                        className="btn btn-ghost btn-xs text-red-500 hover:text-red-700"
                        title="Remove Interface"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                ),
            },
        ],
        [interfaceConfigs, setFieldValue, addToast]
    );

    const handleAddInterface = useCallback(() => {
        const newEntry = {
            interface_name: values.new_interface_name,
        };

        InterfaceConfigSchema.validate(newEntry, { abortEarly: false })
            .then(() => {
                setFieldValue("interface_configs", [
                    ...interfaceConfigs,
                    newEntry,
                ]);
                setFieldValue("new_interface_name", "");
                addToast("Interface added successfully!", "success");
            })
            .catch((validationErrors) => {
                validationErrors.inner.forEach((err) => {
                    if (err.path === "interface_name")
                        setFieldTouched("new_interface_name", true);
                });
                addToast("Please fill in the Interface Name.", "error");
            });
    }, [values, interfaceConfigs, setFieldValue, setFieldTouched, addToast]);

    return (
        <FieldArray name="interface_configs">
            {() => (
                <div className="md:col-span-3 space-y-6">
                    <h3 className="text-2xl font-semibold text-gray-800">
                        Interface Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-14">
                        <Field name="new_interface_name">
                            {({ field, form }) => (
                                <TextInputField
                                    {...field}
                                    placeholder="Interface Name"
                                    formik={form}
                                    className="mb-0"
                                    name="new_interface_name"
                                />
                            )}
                        </Field>

                        <div className="flex items-center pt-1 md:pt-0">
                            <Button
                                type="button"
                                onClick={handleAddInterface}
                                intent="primary"
                                size="sm"
                                leftIcon={PlusCircle}
                                className="w-full md:w-auto"
                            >
                                Add Interface
                            </Button>
                        </div>
                    </div>

                    {interfaceConfigs.length > 0 && (
                        <div className="pt-6 border-t border-gray-200">
                            <DataTable
                                data={interfaceConfigs}
                                columns={INTERFACE_COLUMNS}
                                searchable={false}
                                selection={false}
                                initialPageSize={5}
                                pageSizeOptions={[5, 10, 25]}
                                stickyHeader={false}
                                title={`Interface List (${interfaceConfigs.length})`}
                            />
                        </div>
                    )}
                </div>
            )}
        </FieldArray>
    );
};

// Drop Device Section
const DropDeviceSection = ({ addToast }) => {
    const { values, setFieldValue, setFieldTouched } = useFormikContext();
    const dropDevices = values.drop_devices || [];

    const DROP_DEVICE_COLUMNS = useMemo(
        () => [
            { key: "device_ip", header: "Device IP" },
            { key: "usage_vlan", header: "Usage VLAN" },
            { key: "connected_port", header: "Connected Port" },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                width: "5rem",
                isSortable: false,
                render: (v, row, index) => (
                    <button
                        type="button"
                        onClick={() => {
                            const newDevices = [...dropDevices];
                            newDevices.splice(index, 1);
                            setFieldValue("drop_devices", newDevices);
                            addToast(
                                `Removed device: ${row.device_ip}`,
                                "warning"
                            );
                        }}
                        className="btn btn-ghost btn-xs text-red-500 hover:text-red-700"
                        title="Remove Device"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                ),
            },
        ],
        [dropDevices, setFieldValue, addToast]
    );

    const handleAddRow = useCallback(() => {
        const newEntry = {
            device_ip: values.new_device_ip,
            usage_vlan: values.new_usage_vlan,
            connected_port: values.new_connected_port,
        };

        DropDeviceSchema.validate(newEntry, { abortEarly: false })
            .then(() => {
                setFieldValue("drop_devices", [...dropDevices, newEntry]);
                setFieldValue("new_device_ip", "");
                setFieldValue("new_usage_vlan", "");
                setFieldValue("new_connected_port", "");
                addToast("Device added successfully!", "success");
            })
            .catch((validationErrors) => {
                validationErrors.inner.forEach((err) => {
                    if (err.path === "device_ip")
                        setFieldTouched("new_device_ip", true);
                    if (err.path === "usage_vlan")
                        setFieldTouched("new_usage_vlan", true);
                    if (err.path === "connected_port")
                        setFieldTouched("new_connected_port", true);
                });
                addToast(
                    "Please fill in all required fields for the new device.",
                    "error"
                );
            });
    }, [values, dropDevices, setFieldValue, setFieldTouched, addToast]);

    return (
        <FieldArray name="drop_devices">
            {() => (
                <div className="md:col-span-3 space-y-6">
                    <h3 className="text-2xl font-semibold text-gray-800">
                        Drop Device Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-14">
                        <Field name="new_device_ip">
                            {({ field, form }) => (
                                <TextInputField
                                    {...field}
                                    placeholder="Device IP"
                                    formik={form}
                                    className="mb-0"
                                    name="new_device_ip"
                                />
                            )}
                        </Field>

                        <Field name="new_usage_vlan">
                            {({ field, form }) => (
                                <TextInputField
                                    {...field}
                                    placeholder="Usage VLAN"
                                    formik={form}
                                    className="mb-0"
                                    name="new_usage_vlan"
                                />
                            )}
                        </Field>

                        <Field name="new_connected_port">
                            {({ field, form }) => (
                                <TextInputField
                                    {...field}
                                    placeholder="Connected Port"
                                    formik={form}
                                    className="mb-0"
                                    name="new_connected_port"
                                />
                            )}
                        </Field>

                        <div className="flex items-center pt-1 md:pt-0">
                            <Button
                                type="button"
                                onClick={handleAddRow}
                                intent="primary"
                                size="sm"
                                leftIcon={PlusCircle}
                                className="w-full md:w-auto"
                            >
                                Add Device
                            </Button>
                        </div>
                    </div>

                    {dropDevices.length > 0 && (
                        <div className="pt-6 border-t border-gray-200">
                            <DataTable
                                data={dropDevices}
                                columns={DROP_DEVICE_COLUMNS}
                                searchable={false}
                                selection={false}
                                initialPageSize={5}
                                pageSizeOptions={[5, 10, 25]}
                                stickyHeader={false}
                                title={`Device List (${dropDevices.length})`}
                            />
                        </div>
                    )}
                </div>
            )}
        </FieldArray>
    );
};

// Main Component
export default function PartnerActivationForm({
    initialValues,
    isEditMode,
    onSubmit,
    onCancel,
}) {
    const { addToast } = useToast();
    const formTitle = isEditMode
        ? "Edit Activation Plan Configuration"
        : "Activation Plan Configuration";

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
                            ? "Modify the technical parameters and devices for this partner link."
                            : "Configure technical parameters and associated drop devices for a new partner link."}
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
                    const selectedLinkID = formik.values.nttn_link_id;
                    const partnerDetails = selectedLinkID
                        ? MOCK_PARTNER_DATA[selectedLinkID]
                        : {};

                    return (
                        <Form className="grid grid-cols-1 md:grid-cols-3 gap-x-14 gap-y-6">
                            {/* Row 1: NTTN Link ID Dropdown */}
                            <div className="">
                                <SelectField
                                    name="nttn_link_id"
                                    options={MOCK_NTTN_OPTIONS}
                                    placeholder="Select Partner Name / Link ID"
                                    className={"-mb-2"}
                                />
                            </div>

                            {/* Partner Details Section */}
                            <div className="md:col-span-3">
                                <hr className="border-gray-200 my-7" />
                                <h3 className="text-2xl font-semibold text-gray-800 -mt-2">
                                    Partner Information
                                </h3>
                            </div>
                            <div className="md:col-span-3 mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6 p-6 bg-white border border-gray-200 rounded-xl">
                                    <div className="space-y-4 pr-5 border-r border-gray-100">
                                        <PartnerDetailDisplayField
                                            label="NTTN Provider"
                                            value={partnerDetails.nttn_provider}
                                        />
                                        <PartnerDetailDisplayField
                                            label="Aggregator"
                                            value={partnerDetails.aggregator}
                                        />
                                    </div>
                                    <div className="space-y-4 px-5 border-r border-gray-100">
                                        <PartnerDetailDisplayField
                                            label="Partner Name"
                                            value={partnerDetails.partner_name}
                                        />
                                        <PartnerDetailDisplayField
                                            label="Business KAM"
                                            value={partnerDetails.business_kam}
                                        />
                                    </div>
                                    <div className="space-y-4 pl-5">
                                        <PartnerDetailDisplayField
                                            label="SBU"
                                            value={partnerDetails.sbu}
                                        />
                                        <PartnerDetailDisplayField
                                            label="Purchased Capacity"
                                            value={
                                                partnerDetails.purchased_capacity
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Technical Configuration */}
                            <div className="md:col-span-3">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-2 pt-4 border-t border-gray-200">
                                    Technical Configuration
                                </h3>
                            </div>

                            {/* Column 1: IPs */}
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
                                <FieldWrapper
                                    name="asn"
                                    placeholder="ASN"
                                    formik={formik}
                                />
                            </div>

                            {/* Column 2: VLANs */}
                            <div className="space-y-6">
                                <FieldWrapper
                                    name="nttn_vlan"
                                    placeholder="NTTN VLAN "
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="int_vlan"
                                    placeholder="INT VLAN "
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="ggn_vlan"
                                    placeholder="GGN VLAN "
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="fna_vlan"
                                    placeholder="FNA VLAN "
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="bdix_vlan"
                                    placeholder="BDIX VLAN "
                                    formik={formik}
                                />
                                <FieldWrapper
                                    name="mcdn_vlan"
                                    placeholder="MCDN VLAN "
                                    formik={formik}
                                />
                            </div>

                            {/* Column 3: Remaining IPs and Misc */}
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

                            {/* Status and Note */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-14 pt-2">
                                <div className="">
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

                            {/* Interface Configuration */}
                            <div className="md:col-span-3 pt-6 border-t border-gray-200 mt-6">
                                <InterfaceConfigSection addToast={addToast} />
                            </div>

                            {/* Drop Device Configuration */}
                            <div className="md:col-span-3 pt-6 border-t border-gray-200 mt-6">
                                <DropDeviceSection addToast={addToast} />
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-3 flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
                                <Button
                                    type="button"
                                    intent="secondary"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    intent="primary"
                                    loading={formik.isSubmitting}
                                    loadingText={
                                        isEditMode
                                            ? "Updating Plan..."
                                            : "Saving Plan..."
                                    }
                                    disabled={
                                        formik.isSubmitting || !formik.isValid
                                    }
                                >
                                    {isEditMode ? "Update" : "Save"}
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
}
