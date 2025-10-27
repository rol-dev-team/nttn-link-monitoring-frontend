// src/pages/PartnerActivationDashboard.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import DataTable from "../components/table/DataTable";
import Button from "../components/ui/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "../hooks/useToast";
import ExportButton from "../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";
import PartnerActivationForm from "../components/PartnerActivationForm";
import PartnerActivationFilterDrawer from "../components/filter/PartnerActivationFilterDrawer";
import {
    createPartnerActivation,
    fetchPartnerActivation,
    fetchPartnerActivations,
    updatePartnerActivation,
    deletePartnerActivation,
} from "../services/partner-link/partnerActivationPlan";
import { createPartnerInterfaceConfig } from "../services/partner-link/partnerInterfaceConfig";
import { createPartnerDropDeviceConfig } from "../services/partner-link/partnerDropDeviceConfig";

export default function PartnerActivationDashboard() {
    const { addToast } = useToast();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});

    // Data Fetching
    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchPartnerActivations();
            if (response.status) {
                setPlans(response.data || []);
            } else {
                throw new Error(
                    response.message || "Failed to fetch activation plans"
                );
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to fetch activation plans", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // Central Filter Logic - Updated field names
    const filteredPlans = useMemo(() => {
        const filters = activeFilters;
        if (Object.keys(filters).length === 0) {
            return plans;
        }

        return plans.filter((plan) => {
            let matches = true;

            if (
                filters.work_order_id &&
                plan.work_order_id !== filters.work_order_id
            ) {
                matches = false;
            }

            if (
                filters.connected_ws_name &&
                plan.connected_ws_name !== filters.connected_ws_name
            ) {
                matches = false;
            }

            if (filters.status && plan.status !== filters.status) {
                matches = false;
            }

            return matches;
        });
    }, [plans, activeFilters]);

    const handleApplyFilters = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);

    // View and Action Handlers
    const openNewForm = () => {
        setIsEditMode(false);
        setEditingPlan(null);
        setViewMode("form");
    };

    const handleEdit = async (plan) => {
        try {
            const response = await fetchPartnerActivation(plan.id);
            if (response.status) {
                setIsEditMode(true);
                setEditingPlan(response.data);
                setViewMode("form");
            } else {
                throw new Error(
                    response.message ||
                        "Failed to fetch activation plan details"
                );
            }
        } catch (err) {
            addToast("Failed to fetch activation plan details", "error");
            console.error("Edit failed:", err);
        }
    };

    const handleDelete = async (planId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this activation plan?"
            )
        )
            return;

        try {
            const response = await deletePartnerActivation(planId);
            if (response.status) {
                addToast("Activation Plan deleted successfully.", "success");
                fetchPlans();
            } else {
                throw new Error(
                    response.message || "Failed to delete activation plan"
                );
            }
        } catch (err) {
            addToast("Failed to delete activation plan.", "error");
            console.error("Delete failed:", err);
        }
    };

    // Form Submission Handler - UPDATED with correct field mapping
    const handleFormSubmit = async (values, { resetForm }) => {
        try {
            // Extract arrays for separate API calls
            const { drop_devices, interface_configs, ...activationData } =
                values;

            console.log("Original Form Data:", activationData);

            // Map frontend field names to backend field names
            const mappedActivationData = {
                work_order_id: activationData.nttn_link_id,
                int_routing_ip: activationData.int_peering_ip,
                ggc_routing_ip: activationData.ggc_peering_ip,
                fna_routing_ip: activationData.fna_peering_ip,
                bcdx_routing_ip: activationData.bdix_peering_ip,
                mcdn_routing_ip: activationData.mcdn_peering_ip,
                nttn_vlan: activationData.nttn_vlan,
                int_vlan: activationData.int_vlan,
                ggn_vlan: activationData.ggn_vlan,
                fna_vlan: activationData.fna_vlan,
                bcdx_vlan: activationData.bdix_vlan,
                mcdn_vlan: activationData.mcdn_vlan,
                nas_ip: activationData.nas_ip,
                nat_ip: activationData.nat_ip,
                connected_ws_name: activationData.connected_sw_name,
                chr_server: activationData.chr_server,
                sw_port: parseInt(activationData.sw_port) || null,
                nic_no: activationData.nic_no,
                asn: parseInt(activationData.asn) || null,
                status: activationData.status,
                note: activationData.note,
            };

            console.log("Mapped Data for Backend:", mappedActivationData);

            let response;
            if (isEditMode) {
                response = await updatePartnerActivation(
                    editingPlan.id,
                    mappedActivationData
                );
            } else {
                response = await createPartnerActivation(mappedActivationData);
            }

            if (response.status) {
                const planId = response.data.id;

                // Handle drop devices creation
                if (drop_devices && drop_devices.length > 0) {
                    try {
                        const devicePromises = drop_devices.map((device) =>
                            createPartnerDropDeviceConfig({
                                activation_plan_id: planId,
                                device_ip: device.device_ip,
                                usage_vlan: device.usage_vlan,
                                connected_port: device.connected_port,
                            })
                        );
                        await Promise.all(devicePromises);
                        addToast(
                            `${drop_devices.length} drop device(s) created successfully!`,
                            "success"
                        );
                    } catch (deviceErr) {
                        console.warn(
                            "Some drop devices failed to create:",
                            deviceErr
                        );
                        addToast(
                            "Some drop devices failed to create",
                            "warning"
                        );
                    }
                }

                // Handle interface configs creation
                if (interface_configs && interface_configs.length > 0) {
                    try {
                        const interfacePromises = interface_configs.map(
                            (interfaceConfig) =>
                                createPartnerInterfaceConfig({
                                    activation_plan_id: planId,
                                    interface_name:
                                        interfaceConfig.interface_name,
                                })
                        );
                        await Promise.all(interfacePromises);
                        addToast(
                            `${interface_configs.length} interface(s) created successfully!`,
                            "success"
                        );
                    } catch (interfaceErr) {
                        console.warn(
                            "Some interface configs failed to create:",
                            interfaceErr
                        );
                        addToast(
                            "Some interface configs failed to create",
                            "warning"
                        );
                    }
                }

                addToast(
                    isEditMode
                        ? "Activation Plan updated successfully!"
                        : "Activation Plan created successfully!",
                    "success"
                );
                fetchPlans();
                resetForm();
                setViewMode("table");
            } else {
                throw new Error(response.message || "Save failed");
            }
        } catch (err) {
            console.error("Form submission error:", err);
            addToast(err.message || "Save failed.", "error");
        }
    };

    // DataTable Columns - UPDATED with backend field names
    const planColumns = useMemo(
        () => [
            { key: "id", header: "ID" },
            { key: "work_order_id", header: "Work Order ID" },
            { key: "work_order_id", header: "Client Name" },
            { key: "asn", header: "ASN" },
            { key: "nas_ip", header: "NAS IP" },
            { key: "nat_ip", header: "NAT IP" },
            { key: "nttn_vlan", header: "NTTN VLAN" },
            { key: "int_routing_ip", header: "INT IP", width: "9%" },
            { key: "ggc_routing_ip", header: "GGC IP", width: "9%" },
            { key: "fna_routing_ip", header: "FNA IP", width: "9%" },
            { key: "bcdx_routing_ip", header: "BDIX IP", width: "9%" },
            { key: "int_vlan", header: "INT VLAN", width: "5%" },
            { key: "ggn_vlan", header: "GGN VLAN", width: "5%" },
            { key: "connected_ws_name", header: "Switch" },
            { key: "sw_port", header: "Port" },
            { key: "chr_server", header: "CHR Server" },
            {
                key: "devices_count",
                header: "Devices",
                align: "center",
                render: (_, row) => row.drop_devices?.length || 0,
            },
            {
                key: "interfaces_count",
                header: "Interfaces",
                align: "center",
                render: (_, row) => row.interface_configs?.length || 0,
            },
            {
                key: "updated_at",
                header: "Last Updated",
                render: (date) =>
                    date ? new Date(date).toLocaleDateString() : "N/A",
            },
            {
                key: "status",
                header: "Status",
                render: (status) => {
                    const is_active = status === "active";
                    const baseClasses =
                        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium";
                    const colorClasses = is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800";
                    return (
                        <span className={`${baseClasses} ${colorClasses}`}>
                            {status}
                        </span>
                    );
                },
            },
            {
                key: "actions",
                header: "Actions",
                render: (_, row) => (
                    <div className="flex justify-start gap-2">
                        <Button
                            variant="icon"
                            size="sm"
                            onClick={() => handleEdit(row)}
                            title="Edit"
                        >
                            <Pencil className="h-4 w-4 text-indigo-500 hover:text-indigo-700" />
                        </Button>
                        <Button
                            variant="icon"
                            size="sm"
                            onClick={() => handleDelete(row.id)}
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                        </Button>
                    </div>
                ),
            },
        ],
        [handleEdit, handleDelete]
    );

    // Form View
    if (viewMode === "form") {
        return (
            <PartnerActivationForm
                initialValues={editingPlan}
                isEditMode={isEditMode}
                onSubmit={handleFormSubmit}
                onCancel={() => setViewMode("table")}
            />
        );
    }

    // Table View
    return (
        <div className="p-4 lg:p-6 ">
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Partner Activation Plans
                    </h1>
                    <p className="text-sm text-gray-500">
                        View and manage the configuration of partner activation.
                    </p>
                </div>
                <div className="px-6 flex gap-2">
                    <ExportButton
                        data={filteredPlans}
                        columns={planColumns}
                        fileName="partner_activation_plans_export"
                        intent="primary"
                        leftIcon={FaFileExcel}
                        className="text-white-500 bg-green-700 hover:bg-green-800 border-none"
                    >
                        Export
                    </ExportButton>
                    <Button
                        intent="primary"
                        onClick={openNewForm}
                        leftIcon={Plus}
                    >
                        Create New Plan
                    </Button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-500">
                    <p>Loading activation plans...</p>
                </div>
            ) : (
                <DataTable
                    title="Activation Records"
                    data={filteredPlans}
                    columns={planColumns}
                    searchable={true}
                    showId={true}
                    selection={false}
                    filterComponent={
                        <PartnerActivationFilterDrawer
                            onApply={handleApplyFilters}
                            activeFilters={activeFilters}
                        />
                    }
                />
            )}
        </div>
    );
}
