// src/components/config/CapacityAlertForm.jsx

import React from "react";
import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';

// Assuming these are your custom components/hooks
import SelectField from "./fields/SelectField";
import DateField from "./fields/DateField"; 
import TextInputField from "./fields/TextInputField"; 
import Button from "./ui/Button";

// ================================================================
// MOCK DATA (Should be consistent with Dashboard's mock)
// ================================================================
const MOCK_NAS_IPS = [
    { value: "192.168.1.1", label: "NAS-Prod-01 (192.168.1.1)" },
    { value: "192.168.1.2", label: "NAS-Dev-02 (192.168.1.2)" },
    { value: "10.0.0.50", label: "NAS-Backup-03 (10.0.0.50)" },
    { value: "172.16.0.10", label: "NAS-HQ-04 (172.16.0.10)" },
];

const ALL_NAS_IP_VALUES = MOCK_NAS_IPS.map(ip => ip.value);


// ================================================================
// INTERNAL TOGGLE FIELD COMPONENT (Modified for inline display)
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
            {/* 🎯 FIX: Changed 'justify-between' to simply 'flex items-center' 
               to make the label and toggle stick to the left and be adjacent. */}
            <div className="flex items-center">
                <label htmlFor={field.id || name} className="text-base font-medium text-gray-700 select-none">
                    {label}
                </label>
                {/* Added ml-3 for space between label and toggle */}
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
// Wrapper Components (DateField)
// ================================================================
function DateFieldWrapper({ name, ...props }) {
    const [field, meta] = useField(name); 
    return (
        <DateField
            {...props} 
            field={field} 
            meta={meta}
            name={name}
        />
    );
}

// ================================================================
// Validation Schema
// ================================================================
const CapacityAlertSchema = Yup.object().shape({
    select_all_nas: Yup.boolean(),
    // Validation runs on nas_ip_select, which is conditionally set
    nas_ip_select: Yup.array()
        .of(Yup.string())
        .when('select_all_nas', {
            is: false, 
            then: (schema) => schema.min(1, "Please select at least one NAS IP or activate 'Select All'."),
            otherwise: (schema) => schema.notRequired(),
        }),
    
    // nas_ip_manual_select is not required for validation
    
    max_value_mbps: Yup.number().typeError("Value must be a number").min(0, "Value cannot be negative").required("Max Value is required"),
    max_frequency: Yup.string().max(50, "Frequency too long").required("Max Frequency is required"),
    max_affected_days: Yup.number().typeError("Days must be a number").min(0, "Days cannot be negative").integer("Days must be an integer").required("Max Affected Days is required"),
    // max_created_date: Yup.date().required("Created Date is required").nullable(),

    min_value_mbps: Yup.number().typeError("Value must be a number").min(0, "Value cannot be negative").required("Min Value is required"),
    min_frequency: Yup.string().max(50, "Frequency too long").required("Min Frequency is required"),
    min_affected_days: Yup.number().typeError("Days must be a number").min(0, "Days cannot be negative").integer("Days must be an integer").required("Min Affected Days is required"),
    // min_created_date: Yup.date().required("Created Date is required").nullable(),
});

// ================================================================
// Initial Values Helper
// ================================================================
const getInitialValues = (initialData) => {
    const base = {
        select_all_nas: false,
        nas_ip_select: [], // Final value for submission
        nas_ip_manual_select: [], // Value for the SelectField component
        max_value_mbps: "",
        max_frequency: "",
        max_affected_days: "",
        // max_created_date: new Date().toISOString().split('T')[0],
        // max_created_date: "",
        min_value_mbps: "",
        min_frequency: "",
        min_affected_days: "",
        // min_created_date: new Date().toISOString().split('T')[0],
        // min_created_date: "",
    };

    if (initialData) {
        const initialIPs = initialData.nas_ip_select || [];
        const isAllSelected = initialData.select_all_nas || false;
        
        return {
            ...base,
            ...initialData,
            nas_ip_select: initialIPs,
            // The manual field is set to empty if 'Select All' is true 
            // to prevent the disabled dropdown from showing pre-selected chips.
            nas_ip_manual_select: isAllSelected ? [] : initialIPs, 
            // max_created_date: initialData.max_created_date?.split('T')[0] ?? base.max_created_date,
            // min_created_date: initialData.min_created_date?.split('T')[0] ?? base.min_created_date,
        };
    }
    return base;
};


// ================================================================
// Main Component - CapacityAlertForm
// ================================================================

export default function CapacityAlertForm({ initialValues, isEditMode, onSubmit, onCancel }) {
    
    const formTitle = isEditMode ? "Edit Capacity Alert Configuration" : "Capacity Alert Configuration";

    return (
        <div className="w-full h-full p-4 lg:p-6">
            <header className="mb-10 pb-6 border-b border-gray-200 flex items-start justify-between">
                <div>
                    {/* <Button 
                        variant="ghost" 
                        leftIcon={ArrowLeft} 
                        onClick={onCancel} 
                        className="mb-4 -ml-4 text-lg font-semibold"
                        type="button"
                    >
                        
                    </Button> */}
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
                        {isEditMode ? "Modify the existing thresholds and scope." : "Set a new maximum and minimum capacity alert."}
                    </p>
                </div>
            </header>

            <Formik
                initialValues={getInitialValues(initialValues)}
                validationSchema={CapacityAlertSchema}
                // WRAPPING onSubmit to clean up the data
                onSubmit={(values, actions) => {
                    // Create the final payload
                    const payload = { ...values };

                    // 1. Remove the temporary UI field
                    delete payload.nas_ip_manual_select;

                    // 2. The field 'nas_ip_select' is guaranteed to be set correctly 
                    //    by the logic in the render block below (either ALL IPs or the manual selection).
                    console.log("Capacity Alert Payload Ready for API:", payload);
                    // Pass the cleaned payload to the external onSubmit handler
                    onSubmit(payload, actions);
                }}
                enableReinitialize={true} 
            >
                {(formik) => {
                    const selectAllActive = formik.values.select_all_nas;

                    // --- STATE MANAGEMENT FOR CONDITIONAL VALUE ---
                    if (selectAllActive) {
                        // 1. If 'Select All' is active, the FINAL submission value is all IPs.
                        if (formik.values.nas_ip_select.length !== ALL_NAS_IP_VALUES.length) {
                            // Set the *actual* submission field to ALL, silently
                            formik.setFieldValue('nas_ip_select', ALL_NAS_IP_VALUES, false); 
                        }
                        // 2. Ensure the manual selection field is empty/cleared (UI fix)
                        if (formik.values.nas_ip_manual_select.length > 0) {
                            formik.setFieldValue('nas_ip_manual_select', [], false);
                        }
                    } else {
                        // 3. If 'Select All' is INACTIVE, the FINAL submission value comes from the manual selection field.
                        if (formik.values.nas_ip_select !== formik.values.nas_ip_manual_select) {
                            // Set the *actual* submission field to the manual selection, silently
                            formik.setFieldValue('nas_ip_select', formik.values.nas_ip_manual_select, false);
                        }
                    }
                    // --- END STATE MANAGEMENT ---


                    return (
                        <Form className="grid grid-cols-1 gap-x-14 gap-y-0">
                            
                            {/* --- NAS IP SELECTION SECTION (REVISED LAYOUT) --- */}
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
                            {/* --- Maximum Capacity Threshold Section --- */}
                            <div className="md:col-span-2 mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                                    Maximum Capacity Alert
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-6">
                                    <TextInputField
                                        name="max_value_mbps"
                                        placeholder="Threshold (Mbps)"
                                        type="number"
                                        className="mb-0" 
                                        formik={formik} 
                                    />
                                    <TextInputField
                                        name="max_frequency"
                                        placeholder="Frequency per day"
                                        className="mb-0"
                                        formik={formik} 
                                    />
                                    <TextInputField
                                        name="max_affected_days"
                                        placeholder="Consecutive Affected Days"
                                        type="number"
                                        className="mb-0"
                                        formik={formik} 
                                    />
                                    {/* <DateFieldWrapper 
                                        name="max_created_date"
                                        placeholder="Created Date (Current Date)"
                                        className="mb-0"
                                    /> */}
                                </div>
                            </div>
                            <hr className="border-gray-200 my-6" />
                            {/* --- Minimum Capacity Threshold Section --- */}
                            <div className="md:col-span-2 mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                                    Minimum Capacity Alert
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-6">
                                    <TextInputField
                                        name="min_value_mbps"
                                        placeholder="Threshold (Mbps)"
                                        type="number"
                                        className="mb-0"
                                        formik={formik} 
                                    />
                                    <TextInputField
                                        name="min_frequency"
                                        placeholder="Frequency per day"
                                        className="mb-0"
                                        formik={formik} 
                                    />
                                    <TextInputField
                                        name="min_affected_days"
                                        placeholder="Consecutive Affected Days"
                                        type="number"
                                        className="mb-0"
                                        formik={formik} 
                                    />
                                    {/* <DateFieldWrapper
                                        name="min_created_date"
                                        placeholder="Created Date (Current Date)"
                                        className="mb-0"
                                    /> */}
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