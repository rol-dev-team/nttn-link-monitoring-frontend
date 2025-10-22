// src/components/config/TechnicalKAMForm.jsx

import React, { useCallback } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ArrowLeft } from 'lucide-react';

// Assuming these are your custom components/hooks
import TextInputField from "./fields/TextInputField"; 
import SelectField from "./fields/SelectField"; // <-- New component import (assuming you have one)
import Button from "./ui/Button";

// ================================================================
// 1. Validation Schema
// ================================================================
const KamSchema = Yup.object().shape({
    name: Yup.string()
        .max(100, "Name is too long")
        .required("Name is required"),
    designation: Yup.string()
        .max(100, "Designation is too long")
        .required("Designation is required"),
    // Basic regex for common Bangladeshi cell number format (e.g., 01XXXXXXXXX)
    cell_number: Yup.string()
        .matches(/^(?:(?:\+|00)?88)?01[3-9]\d{8}$/, "Invalid cell number format (e.g., 01XXXXXXXXX)")
        .required("Cell Number is required"),
    // --- New Status Field Validation ---
    status: Yup.string()
        .oneOf(['Active', 'Inactive'], "Invalid status selected")
        .required("Status is required"),
});

// ================================================================
// 2. Initial Values Helper
// ================================================================
// Helper function to safely set initial values for Formik
const getInitialValues = (initialData) => ({
    name: initialData?.name || "",
    designation: initialData?.designation || "",
    cell_number: initialData?.cell_number || "",
    // --- New Status Initial Value ---
    status: initialData?.status || "Active", // Default to 'Active' for new registrations
});

// ================================================================
// 3. Main Component - TechnicalKAMForm
// ================================================================
// Define the options for the status dropdown
const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
];

export default function TechnicalKAMForm({ initialValues, isEditMode, onSubmit, onCancel }) {
    
    const formTitle = isEditMode ? "Edit Technical KAM Details" : "Technical KAM Registration";
    
    // NOTE: The submission logic remains handled by the parent component via the onSubmit prop.
    
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
                        {isEditMode ? "Modify the existing Technical KAM's details." : "Register a new Technical KAM for operations."}
                    </p>
                </div>
            </header>

            <Formik
                initialValues={getInitialValues(initialValues)}
                validationSchema={KamSchema}
                onSubmit={onSubmit}
                enableReinitialize={true} // Essential for proper edit mode data loading
            >
                {(formik) => (
                    <Form className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-6">
                        
                        {/* Row 1: Name and Designation */}
                        <TextInputField
                            name="name"
                            placeholder="Full Name"
                            className="mb-0" 
                            formik={formik} 
                        />
                        <TextInputField
                            name="designation"
                            placeholder="Designation"
                            className="mb-0"
                            formik={formik} 
                        />
                        
                        {/* Row 2: Cell Number and Status Dropdown */}
                        <div className="md:col-span-1">
                            <TextInputField
                                name="cell_number"
                                placeholder="Cell Number (e.g., 01XXXXXXXXX)"
                                className="mb-0"
                                type="tel" 
                                formik={formik} 
                            />
                        </div>
                        {/* --- NEW STATUS DROPDOWN --- */}
                        <div className="md:col-span-1">
                             <SelectField
                                name="status"
                                placeholder="Select Status"
                                className="mb-0"
                                formik={formik}
                                options={statusOptions}
                            />
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
                                loadingText={isEditMode ? "Updating..." : "Saving Details..."}
                                disabled={formik.isSubmitting || !formik.isValid}
                            >
                                {isEditMode ? "Update" : "Save"}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}