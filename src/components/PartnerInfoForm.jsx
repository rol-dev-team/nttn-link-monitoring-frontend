// src/components/config/PartnerInfoForm.jsx

import React, { useCallback, useMemo, useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ArrowLeft } from "lucide-react";
import TextInputField from "./fields/TextInputField";
import SelectField from "./fields/SelectField";
import Button from "./ui/Button";
import { fetchRadiusServers } from "../services/partner-link/radiusServer";
import { fetchTechnicalKams } from "../services/partner-link/technicalKam";

// ================================================================
// 1. Validation Schema
// ================================================================
const PartnerSchema = Yup.object().shape({
    nttn_link_id: Yup.string().required(
        "Partner Name / NTTN Link ID is required"
    ),
    network_code: Yup.string().max(50).required("Network Code is required"),
    address: Yup.string().max(255).required("Address is required"),
    contract_number: Yup.string()
        .max(50)
        .required("Contact Number is required"),
    technical_kam: Yup.string().required("Technical KAM is required"),
    router_identity: Yup.string()
        .max(100)
        .required("Router Identity is required"),
    radius: Yup.string().required("Radius Server is required"),
});

// ================================================================
// 2. Initial Values Helper (UPDATED for backend model compatibility)
// ================================================================
const getInitialValues = (initialData) => {
    return {
        nttn_link_id: initialData?.word_order_id || "", // Map word_order_id to nttn_link_id
        network_code: initialData?.network_code || "",
        address: initialData?.address || "",
        contract_number: initialData?.contact_number || "", // Map contact_number to contract_number
        technical_kam: initialData?.technical_kam_id?.toString() || "", // Convert ID to string for form
        router_identity: initialData?.router_identity || "",
        radius: initialData?.radius_server_id?.toString() || "", // Convert ID to string for form
    };
};

// ================================================================
// Helper: Display Field Component
// ================================================================
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

// ================================================================
// 3. Main Component - PartnerInfoForm
// ================================================================
export default function PartnerInfoForm({
    initialValues,
    isEditMode,
    onSubmit,
    onCancel,
}) {
    const [radiusOptions, setRadiusOptions] = useState([]);
    const [kamOptions, setKamOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const formTitle = isEditMode
        ? "Edit Partner Info Settings"
        : "Partner Info Settings";

    // Fetch dropdown data
    const fetchDropdownData = useCallback(async () => {
        try {
            setLoading(true);
            const [radiusResponse, kamResponse] = await Promise.all([
                fetchRadiusServers(),
                fetchTechnicalKams(),
            ]);

            // Transform radius servers data
            const radiusOptions = radiusResponse.data.map((server) => ({
                label:
                    server.name || server.server_name || `Radius ${server.id}`,
                value: server.id.toString(), // Convert to string for form
            }));

            // Transform technical KAMs data
            const kamOptions = kamResponse.data.map((kam) => ({
                label: kam.name,
                value: kam.id.toString(), // Convert to string for form
            }));

            setRadiusOptions(radiusOptions);
            setKamOptions(kamOptions);
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    // Mock data for NTTN Link IDs (word_order_id)
    const MOCK_NTTN_OPTIONS = [
        { label: "NTTN-LINK-001", value: "NTTN-LINK-001" },
        { label: "NTTN-LINK-002", value: "NTTN-LINK-002" },
        { label: "NTTN-LINK-003", value: "NTTN-LINK-003" },
        { label: "NTTN-LINK-004", value: "NTTN-LINK-004" },
        { label: "NTTN-LINK-005", value: "NTTN-LINK-005" },
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
        "NTTN-LINK-004": {
            nttn_provider: "BDCOM",
            partner_name: "Delta Networks",
            sbu: "Fiber Optic",
            aggregator: "Salam",
            business_kam: "ABC",
            purchased_capacity: "200 Mb",
        },
        "NTTN-LINK-005": {
            nttn_provider: "Link3",
            partner_name: "Epsilon Telecom",
            sbu: "Broadband",
            aggregator: "Rafiq",
            business_kam: "DEF",
            purchased_capacity: "150 Mb",
        },
    };

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
                            ? "Modify the existing partner details."
                            : "Configure and save partner details."}
                    </p>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <p>Loading form data...</p>
                </div>
            ) : (
                <Formik
                    initialValues={getInitialValues(initialValues)}
                    validationSchema={PartnerSchema}
                    onSubmit={onSubmit}
                    enableReinitialize={true}
                >
                    {(formik) => {
                        const selectedLinkID = formik.values.nttn_link_id;
                        const partnerDetails =
                            MOCK_PARTNER_DATA[selectedLinkID];

                        return (
                            <Form className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-6">
                                {/* Row 1: NTTN Link ID Dropdown (word_order_id) */}
                                <SelectField
                                    name="nttn_link_id"
                                    options={MOCK_NTTN_OPTIONS}
                                    placeholder="Select Partner Name / NTTN Link ID"
                                    formik={formik}
                                />

                                {/* Empty column for alignment */}
                                <div className="hidden md:block"></div>

                                {/* Row 2: Partner Details Display Box */}
                                <div className="md:col-span-2 mb-4">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4 pt-4 border-t border-gray-200">
                                        Partner Information
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6 p-6 bg-white border border-gray-200 rounded-xl">
                                        {/* Column 1: NTTN Provider & Partner Name */}
                                        <div className="space-y-4 pr-5 border-r border-gray-100">
                                            <PartnerDetailDisplayField
                                                label="NTTN Provider"
                                                value={
                                                    partnerDetails?.nttn_provider
                                                }
                                            />
                                            <PartnerDetailDisplayField
                                                label="Partner Name"
                                                value={
                                                    partnerDetails?.partner_name
                                                }
                                            />
                                        </div>

                                        {/* Column 2: SBU & Aggregator */}
                                        <div className="space-y-4 px-5 border-r border-gray-100">
                                            <PartnerDetailDisplayField
                                                label="SBU"
                                                value={partnerDetails?.sbu}
                                            />
                                            <PartnerDetailDisplayField
                                                label="Aggregator"
                                                value={
                                                    partnerDetails?.aggregator
                                                }
                                            />
                                        </div>

                                        {/* Column 3: Business KAM & Purchased Capacity */}
                                        <div className="space-y-4 pl-5">
                                            <PartnerDetailDisplayField
                                                label="Business KAM"
                                                value={
                                                    partnerDetails?.business_kam
                                                }
                                            />
                                            <PartnerDetailDisplayField
                                                label="Purchased Capacity"
                                                value={
                                                    partnerDetails?.purchased_capacity
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Editable Fields */}
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

                                {/* Row 5: Dynamic Dropdowns from APIs */}
                                <SelectField
                                    name="technical_kam"
                                    options={kamOptions}
                                    placeholder="Select Technical KAM"
                                    formik={formik}
                                />
                                <SelectField
                                    name="radius"
                                    options={radiusOptions}
                                    placeholder="Select Radius Server"
                                    formik={formik}
                                />

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
                                                ? "Updating Settings..."
                                                : "Saving Settings..."
                                        }
                                        disabled={
                                            formik.isSubmitting ||
                                            !formik.isValid
                                        }
                                    >
                                        {isEditMode ? "Update" : "Save"}
                                    </Button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            )}
        </div>
    );
}
