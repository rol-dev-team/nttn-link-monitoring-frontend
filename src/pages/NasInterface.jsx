// import React, { useState, useCallback, useMemo } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { Trash2, PlusCircle, Plus, FileSpreadsheet } from "lucide-react";
// import axios from "axios";

// import TextInputField from "../components/fields/TextInputField";
// import Button from "../components/ui/Button";
// import DataTable from "../components/table/DataTable";
// import ExportButton from "../components/ui/ExportButton"; // optional

// import SelectInput from "../components/fields//SelectInput";
// import {
//     fetchNasIps,
//     createPartnerInterfaceConfig,
// } from "../services/partner-link/partnerInterfaceConfig";

// const MOCK_NTTN_OPTIONS = [
//     { value: "192.168.1.1", label: "NAS 192.168.1.1 / Partner A" },
//     { value: "192.168.1.2", label: "NAS 192.168.1.2 / Partner B" },
//     { value: "192.168.1.3", label: "NAS 192.168.1.3 / Partner C" },
// ];

// // Validation
// const InterfaceSchema = Yup.object().shape({
//     interface_name: Yup.string().required("Interface Name is required"),
// });

// const NasSchema = Yup.object().shape({
//     nas_ip: Yup.string().required("NAS IP is required"),
//     interface_configs: Yup.array().min(1, "Add at least one interface."),
// });

// const NasInterface = () => {
//     const [viewMode, setViewMode] = useState("table");
//     const addToast = (msg, type = "info") =>
//         alert(`${type.toUpperCase()}: ${msg}`);

//     // Formik setup
//     const formik = useFormik({
//         initialValues: {
//             nas_ip: "",
//             new_interface_name: "",
//             interface_configs: [],
//         },
//         validationSchema: NasSchema,
//         onSubmit: async (values) => {
//             try {
//                 const payload = {
//                     nas_ip: values.nas_ip,
//                     interfaces: values.interface_configs.map((i) => ({
//                         name: i.interface_name,
//                     })),
//                 };

//                 console.log("Submitting data:", payload);
//                 // await axios.post("/api/interfaces", payload);
//                 addToast("Submitted successfully!", "success");
//                 formik.resetForm();
//                 setViewMode("table");
//             } catch (err) {
//                 addToast("Failed to submit configurations", "error");
//             }
//         },
//     });

//     // Add interface
//     const handleAddInterface = useCallback(() => {
//         const newInterface = {
//             interface_name: formik.values.new_interface_name,
//             id: Date.now(),
//         };

//         InterfaceSchema.validate(newInterface, { abortEarly: false })
//             .then(() => {
//                 formik.setFieldValue("interface_configs", [
//                     ...formik.values.interface_configs,
//                     newInterface,
//                 ]);
//                 formik.setFieldValue("new_interface_name", "");
//                 addToast("Interface added successfully!", "success");
//             })
//             .catch((err) => {
//                 const msg =
//                     err?.errors?.[0] || "Please fill all fields correctly.";
//                 addToast(msg, "error");
//             });
//     }, [formik]);

//     // Remove interface individually
//     const handleRemoveInterface = useCallback(
//         (id) => {
//             const updated = formik.values.interface_configs.filter(
//                 (i) => i.id !== id
//             );
//             formik.setFieldValue("interface_configs", updated);
//             addToast("Interface removed", "warning");
//         },
//         [formik]
//     );

//     // Columns
//     const INTERFACE_COLUMNS = useMemo(
//         () => [
//             { key: "interface_name", header: "Interface Name" },
//             { key: "interface_port", header: "Interface Port" },
//             {
//                 key: "actions",
//                 header: "Actions",
//                 align: "center",
//                 width: "5rem",
//                 render: (v, row) => (
//                     <button
//                         type="button"
//                         onClick={() => handleRemoveInterface(row.id)}
//                         className="btn btn-ghost btn-xs text-red-500 hover:text-red-700"
//                         title="Remove Interface"
//                     >
//                         <Trash2 className="h-4 w-4" />
//                     </button>
//                 ),
//             },
//         ],
//         [handleRemoveInterface]
//     );

//     // Table view
//     if (viewMode === "table") {
//         return (
//             <div className="p-4 lg:p-6">
//                 <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
//                     <div>
//                         <h1 className="text-3xl font-extrabold text-gray-900">
//                             Partner Interface Configuration
//                         </h1>
//                         <p className="text-sm text-gray-500">
//                             View and manage the configuration of partner
//                             activation.
//                         </p>
//                     </div>
//                     <div className="px-6 flex gap-2">
//                         <ExportButton
//                             data={formik.values.interface_configs}
//                             columns={INTERFACE_COLUMNS}
//                             fileName="partner_activation_plans_export"
//                             intent="primary"
//                             leftIcon={FileSpreadsheet}
//                             className="text-white-500 bg-green-700 hover:bg-green-800 border-none"
//                         >
//                             Export
//                         </ExportButton>
//                         <Button
//                             intent="primary"
//                             onClick={() => setViewMode("form")}
//                             leftIcon={Plus}
//                         >
//                             Create New Interface
//                         </Button>
//                     </div>
//                 </header>

//                 <DataTable
//                     title="Interface Records"
//                     data={formik.values.interface_configs}
//                     columns={INTERFACE_COLUMNS}
//                     searchable={true}
//                     showId={true}
//                     selection={false}
//                 />
//             </div>
//         );
//     }

//     // Form view
//     return (
//         <form onSubmit={formik.handleSubmit} className="p-6 space-y-8">
//             <h3 className="text-2xl font-semibold text-gray-800 border-b pb-4">
//                 NAS Interface Configuration
//             </h3>

//             <div className="space-y-4">
//                 <SelectInput
//                     name="nas_ip"
//                     formik={formik}
//                     options={MOCK_NTTN_OPTIONS}
//                     label="Select Partner Name / NAS IP"
//                     isDisabled={formik.values.interface_configs.length > 0}
//                     isSearchable={true}
//                     isClearable={true}
//                 />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//                 <TextInputField
//                     name="new_interface_name"
//                     placeholder="e.g. eth0"
//                     formik={formik}
//                 />
//                 <Button
//                     type="button"
//                     onClick={handleAddInterface}
//                     intent="primary"
//                     size="md"
//                     leftIcon={PlusCircle}
//                     className="w-full"
//                 >
//                     Add Interface
//                 </Button>
//             </div>

//             {formik.values.interface_configs.length > 0 && (
//                 <div className="pt-6 border-t border-gray-200">
//                     <DataTable
//                         data={formik.values.interface_configs}
//                         columns={INTERFACE_COLUMNS}
//                         searchable={false}
//                         selection={false}
//                         initialPageSize={5}
//                         pageSizeOptions={[5, 10, 25]}
//                         stickyHeader={false}
//                         title={`Configured Interfaces (${formik.values.interface_configs.length})`}
//                     />
//                 </div>
//             )}

//             {formik.submitCount > 0 && formik.errors.interface_configs && (
//                 <p className="text-sm text-red-600 mt-1">
//                     {formik.errors.interface_configs}
//                 </p>
//             )}

//             <div className="pt-6 border-t border-gray-200 flex justify-between">
//                 <Button
//                     type="button"
//                     intent="secondary"
//                     onClick={() => setViewMode("table")}
//                 >
//                     Back to Table
//                 </Button>
//                 <Button
//                     type="submit"
//                     intent="success"
//                     size="md"
//                     disabled={
//                         formik.isSubmitting ||
//                         !formik.isValid ||
//                         formik.values.interface_configs.length === 0
//                     }
//                 >
//                     Submit All Configurations
//                 </Button>
//             </div>
//         </form>
//     );
// };

// export default NasInterface;

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Trash2, PlusCircle, Plus, FileSpreadsheet } from "lucide-react";

import TextInputField from "../components/fields/TextInputField";
import Button from "../components/ui/Button";
import DataTable from "../components/table/DataTable";
import ExportButton from "../components/ui/ExportButton";
import SelectInput from "../components/fields/SelectInput";

import {
    fetchNasIps,
    createPartnerInterfaceConfig,
} from "../services/partner-link/partnerInterfaceConfig";

// Validation
const InterfaceSchema = Yup.object().shape({
    interface_name: Yup.string().required("Interface Name is required"),
});

const NasSchema = Yup.object().shape({
    activation_plan_id: Yup.string().required("Partner/NAS IP is required"),
    interface_configs: Yup.array().min(1, "Add at least one interface."),
});

const NasInterface = () => {
    const [viewMode, setViewMode] = useState("table");
    const [nasIpOptions, setNasIpOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [existingConfigs, setExistingConfigs] = useState([]);

    const addToast = (msg, type = "info") =>
        alert(`${type.toUpperCase()}: ${msg}`);

    // Fetch NAS IPs on component mount
    useEffect(() => {
        const loadNasIps = async () => {
            setLoading(true);
            try {
                const response = await fetchNasIps();
                if (response.status) {
                    const options = response.data.map((item) => ({
                        value: item.id.toString(), // Convert to string to match Yup validation
                        label: `NAS ${item.nas_ip} / Partner ${item.id}`,
                        nas_ip: item.nas_ip,
                    }));
                    setNasIpOptions(options);
                } else {
                    addToast(response.message, "error");
                }
            } catch (error) {
                addToast(error.message, "error");
            } finally {
                setLoading(false);
            }
        };

        loadNasIps();
    }, []);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            activation_plan_id: "",
            new_interface_name: "",
            interface_configs: [],
        },
        validationSchema: NasSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                console.log("Submitting values:", values); // Debug log

                // Submit each interface configuration individually
                const promises = values.interface_configs.map(
                    (interfaceConfig) =>
                        createPartnerInterfaceConfig({
                            activation_plan_id: values.activation_plan_id,
                            interface_name: interfaceConfig.interface_name,
                            interface_port:
                                interfaceConfig.interface_port || "",
                        })
                );

                const results = await Promise.all(promises);

                // Check if all requests were successful
                const allSuccess = results.every(
                    (result) => result.status === true
                );

                if (allSuccess) {
                    addToast(
                        "All interface configurations submitted successfully!",
                        "success"
                    );
                    formik.resetForm();
                    setViewMode("table");

                    // Update existing configs for table view
                    const newConfigs = results.map((result) => result.data);
                    setExistingConfigs((prev) => [...prev, ...newConfigs]);
                } else {
                    addToast("Some configurations failed to submit", "error");
                }
            } catch (err) {
                addToast(
                    "Failed to submit configurations: " + err.message,
                    "error"
                );
            } finally {
                setLoading(false);
            }
        },
    });

    // Handle select change to store only the value
    const handleActivationPlanChange = (selectedOption) => {
        // Store only the value (string) not the entire object
        formik.setFieldValue(
            "activation_plan_id",
            selectedOption ? selectedOption.value : ""
        );
    };

    // Add interface
    const handleAddInterface = useCallback(() => {
        const newInterface = {
            interface_name: formik.values.new_interface_name,
            interface_port: "",
            id: Date.now(),
        };

        InterfaceSchema.validate(newInterface, { abortEarly: false })
            .then(() => {
                formik.setFieldValue("interface_configs", [
                    ...formik.values.interface_configs,
                    newInterface,
                ]);
                formik.setFieldValue("new_interface_name", "");
                addToast("Interface added successfully!", "success");
            })
            .catch((err) => {
                const msg =
                    err.errors?.[0] || "Please fill all fields correctly.";
                addToast(msg, "error");
            });
    }, [formik]);

    // Remove interface individually
    const handleRemoveInterface = useCallback(
        (id) => {
            const updated = formik.values.interface_configs.filter(
                (i) => i.id !== id
            );
            formik.setFieldValue("interface_configs", updated);
            addToast("Interface removed", "warning");
        },
        [formik]
    );

    // Get the selected option for display
    const selectedNasIpOption = nasIpOptions.find(
        (option) => option.value === formik.values.activation_plan_id
    );

    // Columns for form view (temporary interfaces)
    const INTERFACE_COLUMNS_FORM = useMemo(
        () => [
            { key: "interface_name", header: "Interface Name" },
            {
                key: "interface_port",
                header: "Interface Port",
                render: (value) => value || "Will be set by system",
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                width: "5rem",
                render: (v, row) => (
                    <button
                        type="button"
                        onClick={() => handleRemoveInterface(row.id)}
                        className="btn btn-ghost btn-xs text-red-500 hover:text-red-700"
                        title="Remove Interface"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                ),
            },
        ],
        [handleRemoveInterface]
    );

    // Columns for table view (saved interfaces)
    const INTERFACE_COLUMNS_TABLE = useMemo(
        () => [
            { key: "interface_name", header: "Interface Name" },
            { key: "interface_port", header: "Interface Port" },
            {
                key: "activation_plan_id",
                header: "Activation Plan ID",
                render: (value) => value || "N/A",
            },
        ],
        []
    );

    // Table view
    if (viewMode === "table") {
        return (
            <div className="p-4 lg:p-6">
                <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Partner Interface Configuration
                        </h1>
                        <p className="text-sm text-gray-500">
                            View and manage the configuration of partner
                            activation.
                        </p>
                    </div>
                    <div className="px-6 flex gap-2">
                        <ExportButton
                            data={existingConfigs}
                            columns={INTERFACE_COLUMNS_TABLE}
                            fileName="partner_interface_configs_export"
                            intent="primary"
                            leftIcon={FileSpreadsheet}
                            className="text-white-500 bg-green-700 hover:bg-green-800 border-none"
                        >
                            Export
                        </ExportButton>
                        <Button
                            intent="primary"
                            onClick={() => setViewMode("form")}
                            leftIcon={Plus}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Create New Interface"}
                        </Button>
                    </div>
                </header>

                <DataTable
                    title="Interface Records"
                    data={existingConfigs}
                    columns={INTERFACE_COLUMNS_TABLE}
                    searchable={true}
                    showId={true}
                    selection={false}
                />
            </div>
        );
    }

    // Form view
    return (
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-8">
            <h3 className="text-2xl font-semibold text-gray-800 border-b pb-4">
                NAS Interface Configuration
            </h3>

            <div className="space-y-4">
                <SelectInput
                    name="activation_plan_id"
                    formik={formik}
                    options={nasIpOptions}
                    label="Select Partner Name / NAS IP"
                    isDisabled={
                        formik.values.interface_configs.length > 0 || loading
                    }
                    isSearchable={true}
                    isClearable={true}
                    isLoading={loading}
                    placeholder={
                        loading ? "Loading NAS IPs..." : "Select NAS IP..."
                    }
                    onChange={handleActivationPlanChange} // Add custom onChange
                    value={selectedNasIpOption} // Control the value display
                />
                {formik.errors.activation_plan_id &&
                    formik.touched.activation_plan_id && (
                        <p className="text-sm text-red-600">
                            {formik.errors.activation_plan_id}
                        </p>
                    )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <TextInputField
                    name="new_interface_name"
                    placeholder="e.g. eth0, sfp-sfpplus1, VSOL-PON-1"
                    formik={formik}
                    disabled={!formik.values.activation_plan_id}
                />
                <Button
                    type="button"
                    onClick={handleAddInterface}
                    intent="primary"
                    size="md"
                    leftIcon={PlusCircle}
                    className="w-full"
                    disabled={
                        !formik.values.activation_plan_id ||
                        !formik.values.new_interface_name ||
                        loading
                    }
                >
                    {loading ? "Adding..." : "Add Interface"}
                </Button>
            </div>

            {formik.values.interface_configs.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                    <DataTable
                        data={formik.values.interface_configs}
                        columns={INTERFACE_COLUMNS_FORM}
                        searchable={false}
                        selection={false}
                        initialPageSize={5}
                        pageSizeOptions={[5, 10, 25]}
                        stickyHeader={false}
                        title={`Configured Interfaces (${formik.values.interface_configs.length})`}
                    />
                </div>
            )}

            {formik.submitCount > 0 && formik.errors.interface_configs && (
                <p className="text-sm text-red-600 mt-1">
                    {formik.errors.interface_configs}
                </p>
            )}

            <div className="pt-6 border-t border-gray-200 flex justify-between">
                <Button
                    type="button"
                    intent="secondary"
                    onClick={() => setViewMode("table")}
                    disabled={loading}
                >
                    Back to Table
                </Button>
                <Button
                    type="submit"
                    intent="success"
                    size="md"
                    disabled={
                        loading ||
                        formik.isSubmitting ||
                        !formik.isValid ||
                        formik.values.interface_configs.length === 0
                    }
                >
                    {loading ? "Submitting..." : "Submit All Configurations"}
                </Button>
            </div>
        </form>
    );
};

export default NasInterface;
