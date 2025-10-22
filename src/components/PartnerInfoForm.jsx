// src/components/config/PartnerInfoForm.jsx

import React, { useCallback, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ArrowLeft } from 'lucide-react';

// Assuming these are your custom components/hooks
import TextInputField from "./fields/TextInputField"; 
import SelectField from "./fields/SelectField"; 
import Button from "./ui/Button";

// ================================================================
// MOCK DATA: (UNCHANGED)
// ================================================================
const MOCK_NTTN_OPTIONS = [
    { label: "NTTN-LINK-001", value: "NTTN-LINK-001" },
    { label: "NTTN-LINK-002 (Test)", value: "NTTN-LINK-002" },
    { label: "NTTN-LINK-003 (Live)", value: "NTTN-LINK-003" },
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

// ================================================================
// 1. Validation Schema (UNCHANGED)
// ================================================================
const PartnerSchema = Yup.object().shape({
    nttn_link_id: Yup.string().required("Parner Name / NTTN Link ID is required"),
    network_code: Yup.string().max(50).required("Network Code is required"),
    address: Yup.string().max(255).required("Address is required"),
    contract_number: Yup.string().max(50).required("Contract Number is required"),
    technical_kam: Yup.string().required("Technical KAM is required"),
    router_identity: Yup.string().max(100).required("Router Identity is required"),
    radius: Yup.string().required("Radius is required"),
});

// ================================================================
// 2. Initial Values Helper
// ================================================================
const getInitialValues = (initialData) => ({
    nttn_link_id: initialData?.nttn_link_id || "",
    network_code: initialData?.network_code || "",
    address: initialData?.address || "",
    contract_number: initialData?.contract_number || "",
    technical_kam: initialData?.technical_kam || "", 
    router_identity: initialData?.router_identity || "",
    radius: initialData?.radius || "", 
});

// ================================================================
// Helper: Mock Display Field (UNCHANGED)
// ================================================================
const PartnerDetailDisplayField = ({ label, value }) => (
    <div className="flex flex-col space-y-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-base font-semibold text-gray-800">{value || 'N/A'}</span>
    </div>
);

// ================================================================
// 3. Main Component - PartnerInfoForm
// ================================================================
export default function PartnerInfoForm({ initialValues, isEditMode, onSubmit, onCancel }) {

    const formTitle = isEditMode ? "Edit Partner Info Settings" : "Partner Info Settings";

    const mockKamOptions = useMemo(() => ([
        { label: "Mr. Abir Hossain", value: "abir_hossain" },
        { label: "Ms. Nazia Rahman", value: "nazia_rahman" },
    ]), []);
    const mockRadiusOptions = useMemo(() => ([
        { label: "MQ", value: "mq_1" },
        { label: "Maxim Orbit", value: "maxim_1" },
        { label: "Maxim Race", value: "maxim_2" },
    ]), []);
    
    return (
        <div className="w-full h-full p-4 lg:p-6">
            
            <header className="mb-10 pb-6 border-b border-gray-200 flex items-start justify-between">
                <div>
                    {/* Back Button */}
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
                        {isEditMode ? "Modify the existing partner details." : "Configure and save partner details."}
                    </p>
                </div>
            </header>

            <Formik
                initialValues={getInitialValues(initialValues)}
                validationSchema={PartnerSchema}
                onSubmit={onSubmit}
                enableReinitialize={true} // Essential for proper edit mode data loading
            >
                {(formik) => {
                    const selectedLinkID = formik.values.nttn_link_id;
                    const partnerDetails = MOCK_PARTNER_DATA[selectedLinkID];

                    return (
                        <Form className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-6">
                            
                            {/* Row 1: NTTN Link ID Dropdown */}
                            <SelectField
                                name="nttn_link_id"
                                options={MOCK_NTTN_OPTIONS}
                                placeholder="Select Partner Name / NTTN Link ID"
                            />

                            {/* Empty column for alignment */}
                            <div className="hidden md:block"></div> 

                            {/* Row 2: Partner Details Display Box - Explicitly spans TWO columns */}
                            <div className="md:col-span-2 mb-4">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4 pt-4 border-t border-gray-200">
                                    Partner Information
                                </h3>
                                
                                <div 
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6 p-6 bg-white border border-gray-200 rounded-xl"
                                >
                                    {/* Column 1: NTTN Provider & Partner Name */}
                                    <div className="space-y-4 pr-5 border-r border-gray-100">
                                        <PartnerDetailDisplayField label="NTTN Provider" value={partnerDetails?.nttn_provider} />
                                        <PartnerDetailDisplayField label="Partner Name" value={partnerDetails?.partner_name} />
                                    </div>
                                    
                                    {/* Column 2: SBU & Aggregator (with padding and divider) */}
                                    <div className="space-y-4 px-5 border-r border-gray-100">
                                        <PartnerDetailDisplayField label="SBU" value={partnerDetails?.sbu} />
                                        <PartnerDetailDisplayField label="Aggregator" value={partnerDetails?.aggregator} />
                                    </div>

                                    {/* Column 3: Business KAM & Purchased Capacity (with left padding) */}
                                    <div className="space-y-4 pl-5">
                                        <PartnerDetailDisplayField label="Business KAM" value={partnerDetails?.business_kam} />
                                        <PartnerDetailDisplayField label="Purchased Capacity" value={partnerDetails?.purchased_capacity} />
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Editable Fields (paired in the 2-column grid) */}
                            <TextInputField
                                name="network_code"
                                placeholder="Network Code"
                                formik={formik} 
                            />
                            <TextInputField
                                name="address"
                                placeholder="Address"
                                formik={formik} 
                            />

                            {/* Row 4 */}
                            <TextInputField
                                name="contract_number"
                                placeholder="Contact Number"
                                formik={formik} 
                            />
                            <TextInputField
                                name="router_identity"
                                placeholder="Router Identity"
                                formik={formik} 
                            />
                            
                            
                            {/* Row 5 */}
                            <SelectField
                                name="technical_kam"
                                options={mockKamOptions}
                                placeholder="Select Technical KAM"
                            />
                            <SelectField
                                name="radius"
                                options={mockRadiusOptions}
                                placeholder="Select Radius Server"
                            />

                            {/* Actions - Explicitly spans TWO columns and uses border-t for separation */}
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
                                    loadingText={isEditMode ? "Updating Settings..." : "Saving Settings..."}
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