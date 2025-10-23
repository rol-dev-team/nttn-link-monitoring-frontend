// src/components/CapacityAlertForm.jsx
import React from "react";
import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import SelectField from "./fields/SelectField";
import TextInputField from "./fields/TextInputField";
import Button from "./ui/Button";

// Toggle Field Component
const ToggleField = ({ name, label, className, ...props }) => {
    const [field, meta] = useField(name);
    const hasError = !!meta.error && meta.touched;

    const fieldProps = {
        ...field,
        checked: field.value,
        type: "checkbox",
    };

    return (
        <div className={clsx("flex flex-col", className)} {...props}>
            <div className="flex items-center">
                <label
                    htmlFor={field.id || name}
                    className="text-base font-medium text-gray-700 select-none"
                >
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

// Validation Schema
const CapacityAlertSchema = Yup.object().shape({
    select_all_nas: Yup.boolean(),
    nas_ip_manual_select: Yup.array()
        .of(Yup.string())
        .when("select_all_nas", {
            is: false,
            then: (schema) =>
                schema.min(
                    1,
                    "Please select at least one NAS IP or activate 'Select All'."
                ),
            otherwise: (schema) => schema.notRequired(),
        }),
    max_value_mbps: Yup.number()
        .typeError("Value must be a number")
        .min(0, "Value cannot be negative")
        .required("Max Value is required"),
    max_frequency: Yup.string()
        .max(50, "Frequency too long")
        .required("Max Frequency is required"),
    max_affected_days: Yup.number()
        .typeError("Days must be a number")
        .min(0, "Days cannot be negative")
        .integer("Days must be an integer")
        .required("Max Affected Days is required"),
    min_value_mbps: Yup.number()
        .typeError("Value must be a number")
        .min(0, "Value cannot be negative")
        .required("Min Value is required"),
    min_frequency: Yup.string()
        .max(50, "Frequency too long")
        .required("Min Frequency is required"),
    min_affected_days: Yup.number()
        .typeError("Days must be a number")
        .min(0, "Days cannot be negative")
        .integer("Days must be an integer")
        .required("Min Affected Days is required"),
});

// Initial Values Helper
const getInitialValues = (initialData) => {
    const base = {
        select_all_nas: false,
        nas_ip_manual_select: [],
        max_value_mbps: "",
        max_frequency: "",
        max_affected_days: "",
        min_value_mbps: "",
        min_frequency: "",
        min_affected_days: "",
    };

    if (initialData) {
        return {
            ...base,
            ...initialData,
        };
    }
    return base;
};

// Main Component
export default function CapacityAlertForm({
    initialValues,
    isEditMode,
    onSubmit,
    onCancel,
    nasIps,
}) {
    const formTitle = isEditMode
        ? "Edit Capacity Alert Configuration"
        : "Capacity Alert Configuration";

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
                            ? "Modify the existing thresholds and scope."
                            : "Set capacity alert thresholds for selected NAS IPs. Multiple configurations will be created for multiple selections."}
                    </p>
                </div>
            </header>

            <Formik
                initialValues={getInitialValues(initialValues)}
                validationSchema={CapacityAlertSchema}
                onSubmit={(values, actions) => {
                    console.log("Form values:", values);
                    onSubmit(values, actions);
                }}
                enableReinitialize={true}
            >
                {(formik) => {
                    const selectAllActive = formik.values.select_all_nas;
                    const selectedCount =
                        formik.values.nas_ip_manual_select.length;

                    return (
                        <Form className="grid grid-cols-1 gap-x-14 gap-y-0">
                            {/* NAS IP Selection Section */}
                            <div className="md:col-span-2 mb-2">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                                    NAS IP Selection
                                </h3>

                                {/* Selection Info */}
                                {selectAllActive ? (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-blue-700 font-medium">
                                            ✅ All NAS IPs ({nasIps.length}{" "}
                                            total) will be configured
                                        </p>
                                    </div>
                                ) : selectedCount > 0 ? (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 font-medium">
                                            ✅ {selectedCount} NAS IP(s)
                                            selected for configuration
                                        </p>
                                    </div>
                                ) : null}

                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    <ToggleField
                                        name="select_all_nas"
                                        label="Select All NAS IPs"
                                    />
                                    <SelectField
                                        name="nas_ip_manual_select"
                                        placeholder="Select NAS IP addresses"
                                        multiple={true}
                                        searchable={true}
                                        options={nasIps}
                                        disabled={selectAllActive}
                                        formik={formik}
                                        className="flex-1 max-w-[695px] -mt-2"
                                    />
                                </div>

                                {/* Help text */}
                                <p className="text-sm text-gray-500 mt-2">
                                    {selectAllActive
                                        ? "Configuration will be applied to all available NAS IPs"
                                        : "Select one or more NAS IPs to apply this configuration"}
                                </p>
                            </div>
                            <hr className="border-gray-200 my-6" />

                            {/* Maximum Capacity Threshold Section */}
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
                                </div>
                            </div>
                            <hr className="border-gray-200 my-6" />

                            {/* Minimum Capacity Threshold Section */}
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
                                </div>
                            </div>

                            {/* Actions */}
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
                                    loadingText={
                                        isEditMode
                                            ? "Updating..."
                                            : "Creating Configurations..."
                                    }
                                    disabled={
                                        formik.isSubmitting || !formik.isValid
                                    }
                                >
                                    {isEditMode
                                        ? "Update Configuration"
                                        : `Create ${
                                              selectAllActive
                                                  ? nasIps.length
                                                  : selectedCount || 0
                                          } Configuration(s)`}
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
}
