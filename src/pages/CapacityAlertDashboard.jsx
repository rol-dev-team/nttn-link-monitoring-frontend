// src/pages/CapacityAlertDashboard.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import DataTable from "../components/table/DataTable";
import Button from "../components/ui/Button";
import ToastContainer from "../components/ui/ToastContainer";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { capitalizer } from "../utils/helpers";
import { useToast } from "../hooks/useToast";
import ExportButton from "../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";
import CapacityAlertForm from "../components/CapacityAlertForm";
import CapacityAlertFilterDrawer from "../components/filter/CapacityAlertFilterDrawer";
import {
    createCapacityAleart,
    fetchCapacityAleart,
    fetchCapacityAlearts,
    updateCapacityAleart,
    deleteCapacityAleart,
} from "../services/partner-link/capacityAlert";
import { fetchPartnerActivations } from "../services/partner-link/partnerActivationPlan";

export default function CapacityAlertDashboard() {
    const { addToast } = useToast();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});
    const [nasIps, setNasIps] = useState([]);

    // Fetch NAS IPs from partner activation plans - FIXED FIELD NAMES
    const fetchNasIps = useCallback(async () => {
        try {
            const response = await fetchPartnerActivations();
            if (response.status) {
                // FIXED: Using correct field names from PartnerActivationPlan
                const ips = response.data.map((plan) => ({
                    value: plan.id, // Using ID as value for activation_plan_id
                    label: plan.nas_ip
                        ? `${plan.work_order_id} (${plan.nas_ip})`
                        : plan.work_order_id,
                    nas_ip: plan.nas_ip, // Store the actual NAS IP - FIXED FIELD NAME
                }));
                setNasIps(ips);
                console.log("Fetched NAS IPs:", ips); // Debug log
            }
        } catch (err) {
            console.error("Failed to fetch NAS IPs:", err);
            addToast("Failed to fetch NAS IPs", "error");
        }
    }, [addToast]);

    // Format scope for display - FIXED FIELD NAME
    const formatScope = (row) => row.activation_plan?.nas_ip || "N/A";

    // Data Fetching
    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchCapacityAlearts();
            if (response.status) {
                setAlerts(response.data || []);
                console.log("Fetched alerts:", response.data); // Debug log
            } else {
                throw new Error(response.message || "Failed to fetch alerts");
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to fetch alerts", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchNasIps();
        fetchAlerts();
    }, [fetchNasIps, fetchAlerts]);

    // Filter logic - FIXED FIELD NAMES
    const filteredAlerts = useMemo(() => {
        const filters = activeFilters;
        if (Object.keys(filters).length === 0) {
            return alerts;
        }

        return alerts.filter((row) => {
            let matches = true;

            // NAS IP Scope Filter - FIXED FIELD NAME
            if (
                filters.nas_ip_scope &&
                row.activation_plan?.nas_ip !== filters.nas_ip_scope
            ) {
                matches = false;
            }

            // Max Threshold Range Filter
            const maxMin = filters.max_threshold_mbps_min;
            if (
                maxMin !== null &&
                maxMin !== "" &&
                row.max_threshold_mbps < Number(maxMin)
            ) {
                matches = false;
            }
            const maxMax = filters.max_threshold_mbps_max;
            if (
                maxMax !== null &&
                maxMax !== "" &&
                row.max_threshold_mbps > Number(maxMax)
            ) {
                matches = false;
            }

            // Min Threshold Range Filter
            const minMin = filters.min_threshold_mbps_min;
            if (
                minMin !== null &&
                minMin !== "" &&
                row.min_threshold_mbps < Number(minMin)
            ) {
                matches = false;
            }
            const minMax = filters.min_threshold_mbps_max;
            if (
                minMax !== null &&
                minMax !== "" &&
                row.min_threshold_mbps > Number(minMax)
            ) {
                matches = false;
            }

            return matches;
        });
    }, [alerts, activeFilters]);

    const handleApplyFilters = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);

    // View and Action Handlers
    const openNewForm = () => {
        setIsEditMode(false);
        setEditingAlert(null);
        setViewMode("form");
    };

    const handleEdit = async (alert) => {
        try {
            const response = await fetchCapacityAleart(alert.id);
            if (response.status) {
                setIsEditMode(true);
                setEditingAlert(response.data);
                setViewMode("form");
            } else {
                throw new Error(
                    response.message || "Failed to fetch alert details"
                );
            }
        } catch (err) {
            addToast("Failed to fetch alert details", "error");
            console.error("Edit failed:", err);
        }
    };

    const handleDelete = async (alertId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this capacity alert configuration?"
            )
        )
            return;

        try {
            const response = await deleteCapacityAleart(alertId);
            if (response.status) {
                addToast(
                    "Alert configuration deleted successfully.",
                    "success"
                );
                fetchAlerts();
            } else {
                throw new Error(response.message || "Failed to delete alert");
            }
        } catch (err) {
            addToast("Failed to delete alert configuration.", "error");
            console.error("Delete failed:", err);
        }
    };

    // Form Submission Handler - UPDATED with better error handling
    const handleFormSubmit = async (values, { resetForm }) => {
        try {
            let nasIpsToCreate = [];

            if (values.select_all_nas) {
                nasIpsToCreate = nasIps;
            } else {
                nasIpsToCreate = nasIps.filter((ip) =>
                    values.nas_ip_manual_select.includes(ip.value)
                );
            }

            if (nasIpsToCreate.length === 0) {
                throw new Error("No NAS IPs selected");
            }

            console.log(
                "Creating configurations for:",
                nasIpsToCreate.length,
                "NAS IPs"
            );

            // Create configuration for each NAS IP
            const results = [];
            for (const nasIp of nasIpsToCreate) {
                try {
                    const dataToSave = {
                        activation_plan_id: nasIp.value,
                        max_threshold_mbps: values.max_value_mbps,
                        max_frequency_per_day: values.max_frequency,
                        max_consecutive_days: values.max_affected_days,
                        min_threshold_mbps: values.min_value_mbps,
                        min_frequency_per_day: values.min_frequency,
                        min_consecutive_days: values.min_affected_days,
                    };

                    console.log("Saving data:", dataToSave);
                    const response = await createCapacityAleart(dataToSave);

                    if (response.status) {
                        results.push({ success: true, data: response.data });
                    } else {
                        results.push({
                            success: false,
                            error: response.message,
                        });
                    }
                } catch (error) {
                    console.error(
                        "Failed to create configuration for NAS IP:",
                        nasIp.value,
                        error
                    );
                    results.push({ success: false, error: error.message });
                }
            }

            const successful = results.filter((r) => r.success);
            const failed = results.filter((r) => !r.success);

            if (failed.length > 0) {
                console.warn(
                    `${failed.length} configurations failed to create`
                );
                addToast(
                    `${failed.length} configurations failed (possibly duplicates)`,
                    "warning"
                );
            }

            if (successful.length > 0) {
                addToast(
                    `Successfully created ${successful.length} configuration(s)`,
                    "success"
                );
                fetchAlerts();
                resetForm();
                setViewMode("table");
            } else {
                throw new Error("All configurations failed to create");
            }
        } catch (err) {
            console.error("Form submission error:", err);
            addToast(err.message || "Save failed.", "error");
        }
    };

    // DataTable Columns - FIXED FIELD NAMES
    const alertColumns = useMemo(
        () => [
            { key: "id", header: "ID" },
            {
                key: "nas_ip",
                header: "NAS IP Address",
                render: (_, row) => row.activation_plan?.nas_ip || "N/A", // FIXED FIELD NAME
                className: "min-w-[150px]",
            },
            {
                key: "work_order_id",
                header: "Work Order ID",
                render: (_, row) => row.activation_plan?.work_order_id || "N/A",
            },
            { key: "max_threshold_mbps", header: "Max Threshold (Mbps)" },
            {
                key: "max_frequency_per_day",
                header: "Max Frequency",
                render: (val) => capitalizer(val?.toString() || ""),
            },
            { key: "max_consecutive_days", header: "Max Consecutive Days" },
            { key: "min_threshold_mbps", header: "Min Threshold (Mbps)" },
            {
                key: "min_frequency_per_day",
                header: "Min Frequency",
                render: (val) => capitalizer(val?.toString() || ""),
            },
            { key: "min_consecutive_days", header: "Min Consecutive Days" },
            {
                key: "created_at",
                header: "Created Date",
                render: (val) =>
                    val ? new Date(val).toLocaleDateString() : "N/A",
            },
            {
                key: "actions",
                header: "Actions",
                render: (_, row) => (
                    <div className="flex justify-center gap-2">
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
        const initialFormValues = editingAlert
            ? {
                  ...editingAlert,
                  max_value_mbps: editingAlert.max_threshold_mbps,
                  max_frequency: editingAlert.max_frequency_per_day,
                  max_affected_days: editingAlert.max_consecutive_days,
                  min_value_mbps: editingAlert.min_threshold_mbps,
                  min_frequency: editingAlert.min_frequency_per_day,
                  min_affected_days: editingAlert.min_consecutive_days,
                  select_all_nas: false,
                  nas_ip_manual_select: [editingAlert.activation_plan_id],
              }
            : null;

        return (
            <CapacityAlertForm
                initialValues={initialFormValues}
                isEditMode={isEditMode}
                onSubmit={handleFormSubmit}
                onCancel={() => setViewMode("table")}
                nasIps={nasIps}
            />
        );
    }

    // Table View
    return (
        <div className="p-4 lg:p-6 ">
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Capacity Alert Configurations
                    </h1>
                    <p className="text-sm text-gray-500">
                        View and manage maximum and minimum capacity alert
                        thresholds.
                    </p>
                </div>
                <div className="px-6 flex gap-2">
                    <ExportButton
                        data={filteredAlerts}
                        columns={alertColumns}
                        fileName="capacity_alerts_export"
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
                        Add Configuration
                    </Button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-500">
                    <p>Loading configurations...</p>
                </div>
            ) : (
                <DataTable
                    title="Alert Records"
                    data={filteredAlerts}
                    columns={alertColumns}
                    searchable={true}
                    showId={false}
                    selection={false}
                    filterComponent={
                        <CapacityAlertFilterDrawer
                            onApply={handleApplyFilters}
                            allNasIps={nasIps
                                .map((ip) => ip.nas_ip)
                                .filter(Boolean)}
                            activeFilters={activeFilters}
                        />
                    }
                />
            )}
        </div>
    );
}
