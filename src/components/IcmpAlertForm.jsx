// // src/components/IcmpAlertForm.jsx

// import React from "react";
// import { Formik, Form, useField } from "formik";
// import * as Yup from "yup";
// import clsx from 'clsx';
// import { ArrowLeft } from 'lucide-react';

// // Assuming these are your custom components/hooks
// import SelectField from "./fields/SelectField";
// import TextInputField from "./fields/TextInputField"; 
// import Button from "./ui/Button";

// // ================================================================
// // MOCK DATA (Consistent with Dashboard's mock)
// // ================================================================
// const MOCK_NAS_IPS = [
//     { value: "192.168.1.1", label: "NAS-Prod-01 (192.168.1.1)" },
//     { value: "192.168.1.2", label: "NAS-Dev-02 (192.168.1.2)" },
//     { value: "10.0.0.50", label: "NAS-Backup-03 (10.0.0.50)" },
//     { value: "172.16.0.10", label: "NAS-HQ-04 (172.16.0.10)" },
// ];

// const ALL_NAS_IP_VALUES = MOCK_NAS_IPS.map(ip => ip.value);


// // ================================================================
// // INTERNAL TOGGLE FIELD COMPONENT (Reused from previous analysis)
// // ================================================================
// const ToggleField = ({ name, label, className, ...props }) => {
//     const [field, meta] = useField(name);
//     const hasError = !!meta.error && meta.touched;

//     const fieldProps = {
//         ...field,
//         checked: field.value,
//         type: 'checkbox', 
//     };

//     return (
//         <div className={clsx("flex flex-col", className)} {...props}>
//             <div className="flex items-center">
//                 <label htmlFor={field.id || name} className="text-base font-medium text-gray-700 select-none">
//                     {label}
//                 </label>
//                 <input
//                     id={field.id || name}
//                     className="toggle toggle-lg toggle-primary ml-3" 
//                     {...fieldProps}
//                 />
//             </div>
//             {hasError && (
//                 <p className="text-red-500 text-xs mt-1">{meta.error}</p>
//             )}
//         </div>
//     );
// };


// // ================================================================
// // Validation Schema
// // ================================================================
// const IcmpAlertSchema = Yup.object().shape({
//     select_all_nas: Yup.boolean(),
//     nas_ip_select: Yup.array()
//         .of(Yup.string())
//         .when('select_all_nas', {
//             is: false, 
//             then: (schema) => schema.min(1, "Please select at least one NAS IP or activate 'Select All'."),
//             otherwise: (schema) => schema.notRequired(),
//         }),
    
//     // ICMP Threshold fields
//     ping_threshold_ms: Yup.number()
//         .typeError("Value must be a number")
//         .min(1, "Threshold must be positive")
//         .required("Ping Threshold is required"),
        
//     loss_threshold_percent: Yup.number()
//         .typeError("Value must be a number")
//         .min(0, "Loss cannot be negative")
//         .max(100, "Loss cannot exceed 100%")
//         .required("Loss Threshold is required"),
        
//     check_interval_seconds: Yup.number()
//         .typeError("Value must be a number")
//         .min(10, "Interval must be at least 10 seconds")
//         .integer("Interval must be an integer")
//         .required("Check Interval is required"),

//     is_active: Yup.boolean().required("Status is required."),
// });

// // ================================================================
// // Initial Values Helper
// // ================================================================
// const getInitialValues = (initialData) => {
//     const base = {
//         select_all_nas: false,
//         nas_ip_select: [], 
//         nas_ip_manual_select: [], 
//         ping_threshold_ms: '',
//         loss_threshold_percent: '',
//         check_interval_seconds: '',
//         is_active: true,
//     };

//     if (initialData) {
//         const initialIPs = initialData.nas_ip_select || [];
//         const isAllSelected = initialData.select_all_nas || false;
        
//         return {
//             ...base,
//             ...initialData,
//             nas_ip_select: initialIPs,
//             nas_ip_manual_select: isAllSelected ? [] : initialIPs, 
//         };
//     }
//     return base;
// };


// // ================================================================
// // Main Component - IcmpAlertForm
// // ================================================================

// export default function IcmpAlertForm({ initialValues, isEditMode, onSubmit, onCancel }) {
    
//     const formTitle = isEditMode ? "Edit ICMP Alert Configuration" : "New ICMP Alert Configuration";

//     return (
//         <div className="w-full h-full p-4 lg:p-6">
//             <header className="mb-10 pb-6 border-b border-gray-200 flex items-start justify-between">
//                 <div>
//                     <h1 className="text-3xl font-extrabold text-gray-900">
//                         <Button 
//                         variant="ghost" 
//                         leftIcon={ArrowLeft} 
//                         onClick={onCancel} 
//                         className="-ml-4 text-lg font-semibold"
//                         type="button"
//                     >
                        
//                     </Button>
//                         {formTitle}
//                     </h1>
//                     <p className="text-sm text-gray-500 ml-10">
//                         {isEditMode ? "Modify the existing ICMP thresholds and scope." : "Define a new ICMP ping and loss threshold configuration."}
//                     </p>
//                 </div>
//             </header>

//             <Formik
//                 initialValues={getInitialValues(initialValues)}
//                 validationSchema={IcmpAlertSchema}
//                 onSubmit={(values, actions) => {
//                     const payload = { ...values };
//                     delete payload.nas_ip_manual_select;
//                     onSubmit(payload, actions);
//                 }}
//                 enableReinitialize={true} 
//             >
//                 {(formik) => {
//                     const selectAllActive = formik.values.select_all_nas;

//                     // --- STATE MANAGEMENT FOR CONDITIONAL VALUE (Reused) ---
//                     if (selectAllActive) {
//                         if (formik.values.nas_ip_select.length !== ALL_NAS_IP_VALUES.length) {
//                             formik.setFieldValue('nas_ip_select', ALL_NAS_IP_VALUES, false); 
//                         }
//                         if (formik.values.nas_ip_manual_select.length > 0) {
//                             formik.setFieldValue('nas_ip_manual_select', [], false);
//                         }
//                     } else {
//                         if (formik.values.nas_ip_select !== formik.values.nas_ip_manual_select) {
//                             formik.setFieldValue('nas_ip_select', formik.values.nas_ip_manual_select, false);
//                         }
//                     }
//                     // --- END STATE MANAGEMENT ---


//                     return (
//                         <Form className="grid grid-cols-1 gap-x-14 gap-y-0">
                            
//                             {/* --- NAS IP SELECTION SECTION (REVISED LAYOUT) --- */}
//                             <div className="md:col-span-2 mb-2">
//                                 <h3 className="text-2xl font-semibold text-gray-800 mb-6">NAS IP Selection</h3>

//                                 {/* Flex container to align toggle and dropdown horizontally */}
//                                 <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    
//                                     {/* Toggle */}
//                                     <ToggleField
//                                     name="select_all_nas"
//                                     label="Select All NAS IPs"
//                                     />

//                                     {/* Dropdown */}
//                                     <SelectField
//                                     name="nas_ip_manual_select"
//                                     placeholder="Select NAS IP addresses"
//                                     multiple={true}
//                                     searchable={true}
//                                     options={MOCK_NAS_IPS}
//                                     disabled={selectAllActive}
//                                     formik={formik}
//                                     className="flex-1 max-w-[695px] -mt-2"
//                                     />
//                                 </div>
//                             </div>
//                             <hr className="border-gray-200 my-6" />
                            
//                             {/* --- ICMP Threshold Section (New/Simplified) --- */}
//                             <div className="md:col-span-2 mb-8">
//                                 <h3 className="text-2xl font-semibold text-gray-800 mb-6">
//                                     ICMP Threshold Configuration
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-6">
//                                     <TextInputField
//                                         name="ping_threshold_ms"
//                                         placeholder="Ping Threshold (ms)"
                                        
//                                         type="number"
//                                         className="mb-0" 
//                                         formik={formik} 
//                                     />
//                                     <TextInputField
//                                         name="loss_threshold_percent"
//                                         placeholder="Loss Threshold (%)"
                                        
//                                         type="number"
//                                         className="mb-0"
//                                         formik={formik} 
//                                     />
//                                     <TextInputField
//                                         name="check_interval_seconds"
//                                         placeholder="Check Interval (seconds)"
                                    
//                                         type="number"
//                                         className="mb-0"
//                                         formik={formik} 
//                                     />
                                    
//                                 </div>
//                             </div>

//                             {/* --- Actions --- */}
//                             <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
//                                 <Button
//                                     type="button"
//                                     intent="secondary"
//                                     onClick={onCancel}
//                                 >
//                                     Cancel
//                                 </Button>
//                                 <Button
//                                     type="submit"
//                                     intent="primary"
//                                     loading={formik.isSubmitting} 
//                                     loadingText={isEditMode ? "Updating..." : "Saving Configuration..."}
//                                     disabled={formik.isSubmitting || !formik.isValid} 
//                                 >
//                                     {isEditMode ? "Update" : "Save"}
//                                 </Button>
//                             </div>
//                         </Form>
//                     );
//                 }}
//             </Formik>
//         </div>
//     );
// }
// src/components/IcmpAlertForm.jsx

import React from "react";
import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';

// Assuming these are your custom components/hooks
import SelectField from "./fields/SelectField";
import TextInputField from "./fields/TextInputField"; 
import Button from "./ui/Button";

// ================================================================
// MOCK DATA (Consistent with Dashboard's mock)
// ================================================================
const MOCK_NAS_IPS = [
    { value: "192.168.1.1", label: "NAS-Prod-01 (192.168.1.1)" },
    { value: "192.168.1.2", label: "NAS-Dev-02 (192.168.1.2)" },
    { value: "10.0.0.50", label: "NAS-Backup-03 (10.0.0.50)" },
    { value: "172.16.0.10", label: "NAS-HQ-04 (172.16.0.10)" },
];

const ALL_NAS_IP_VALUES = MOCK_NAS_IPS.map(ip => ip.value);


// ================================================================
// INTERNAL TOGGLE FIELD COMPONENT (Retained)
// ================================================================
const ToggleField = ({ name, label, className, ...props }) => {
    const [field, meta] = useField(name);
    const hasError = !!meta.error && meta.touched;

    const fieldProps = {
        ...field,
        checked: field.value,
        type: 'checkbox', 
    };

    return (
        <div className={clsx("flex flex-col", className)} {...props}>
            <div className="flex items-center">
                <label htmlFor={field.id || name} className="text-base font-medium text-gray-700 select-none">
                    {label}
                </label>
                <input
                    id={field.id || name}
                    className="toggle toggle-lg toggle-primary ml-3" 
                    {...fieldProps}
                />
            </div>
            {hasError && (
                <p className="text-red-500 text-xs mt-1">{meta.error}</p>
            )}
        </div>
    );
};


// ================================================================
// Validation Schema (MODIFIED)
// ================================================================
const IcmpAlertSchema = Yup.object().shape({
    select_all_nas: Yup.boolean(),
    nas_ip_select: Yup.array()
        .of(Yup.string())
        .when('select_all_nas', {
            is: false, 
            then: (schema) => schema.min(1, "Please select at least one NAS IP or activate 'Select All'."),
            otherwise: (schema) => schema.notRequired(),
        }),
    
    // ICMP Threshold fields (REPLACED)
    latency_threshold_ms: Yup.number()
        .typeError("Value must be a number")
        .min(1, "Latency Threshold must be positive")
        .required("Latency Threshold is required"),
        
    is_active: Yup.boolean().required("Status is required."),
});

// ================================================================
// Initial Values Helper (MODIFIED)
// ================================================================
const getInitialValues = (initialData) => {
    const base = {
        select_all_nas: false,
        nas_ip_select: [], 
        nas_ip_manual_select: [], 
        // Latency field (REPLACED)
        latency_threshold_ms: '',
        is_active: true,
    };

    if (initialData) {
        const initialIPs = initialData.nas_ip_select || [];
        const isAllSelected = initialData.select_all_nas || false;
        
        return {
            ...base,
            ...initialData,
            nas_ip_select: initialIPs,
            nas_ip_manual_select: isAllSelected ? [] : initialIPs, 
        };
    }
    return base;
};


// ================================================================
// Main Component - IcmpAlertForm (MODIFIED)
// ================================================================

export default function IcmpAlertForm({ initialValues, isEditMode, onSubmit, onCancel }) {
    
    const formTitle = isEditMode ? "Edit ICMP Alert Configuration" : "New ICMP Alert Configuration";

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
                    >
                        
                    </Button>
                        {formTitle}
                    </h1>
                    <p className="text-sm text-gray-500 ml-10">
                        {isEditMode ? "Modify the existing ICMP thresholds and scope." : "Define a new ICMP ping and loss threshold configuration."}
                    </p>
                </div>
            </header>

            <Formik
                initialValues={getInitialValues(initialValues)}
                validationSchema={IcmpAlertSchema}
                onSubmit={(values, actions) => {
                    const payload = { ...values };
                    delete payload.nas_ip_manual_select;
                    onSubmit(payload, actions);
                }}
                enableReinitialize={true} 
            >
                {(formik) => {
                    const selectAllActive = formik.values.select_all_nas;

                    // --- STATE MANAGEMENT FOR CONDITIONAL VALUE (Retained) ---
                    if (selectAllActive) {
                        if (formik.values.nas_ip_select.length !== ALL_NAS_IP_VALUES.length) {
                            formik.setFieldValue('nas_ip_select', ALL_NAS_IP_VALUES, false); 
                        }
                        if (formik.values.nas_ip_manual_select.length > 0) {
                            formik.setFieldValue('nas_ip_manual_select', [], false);
                        }
                    } else {
                        if (formik.values.nas_ip_select !== formik.values.nas_ip_manual_select) {
                            formik.setFieldValue('nas_ip_select', formik.values.nas_ip_manual_select, false);
                        }
                    }
                    // --- END STATE MANAGEMENT ---


                    return (
                        <Form className="grid grid-cols-1 gap-x-14 gap-y-0">
                            
                            {/* --- NAS IP SELECTION SECTION (Retained) --- */}
                            <div className="md:col-span-2 mb-2">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-6">NAS IP Selection</h3>

                                {/* Flex container to align toggle and dropdown horizontally */}
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    
                                    {/* Toggle */}
                                    <ToggleField
                                    name="select_all_nas"
                                    label="Select All NAS IPs"
                                    />

                                    {/* Dropdown */}
                                    <SelectField
                                    name="nas_ip_manual_select"
                                    placeholder="Select NAS IP addresses"
                                    multiple={true}
                                    searchable={true}
                                    options={MOCK_NAS_IPS}
                                    disabled={selectAllActive}
                                    formik={formik}
                                    className="flex-1 max-w-[695px] -mt-2"
                                    />
                                </div>
                            </div>
                            <hr className="border-gray-200 my-6" />
                            
                            {/* --- ICMP Threshold Section (MODIFIED) --- */}
                            <div className="md:col-span-2 mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                                    Latency Threshold Configuration
                                </h3>
                                {/* Simple grid for the single latency field */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-6">
                                    
                                    {/* NEW FIELD: Latency threshold */}
                                    <TextInputField
                                        name="latency_threshold_ms"
                                        placeholder="Latency Threshold (ms)"
                                        type="number"
                                        className="mb-0" 
                                        formik={formik} 
                                    />
                                    
                                    {/* Placeholder to keep layout even, if needed, otherwise remove */}
                                    <div></div> 
                                </div>
                            </div>

                            {/* --- Actions --- */}
                            <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
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
                                    loadingText={isEditMode ? "Updating..." : "Saving Configuration..."}
                                    disabled={formik.isSubmitting || !formik.isValid} 
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