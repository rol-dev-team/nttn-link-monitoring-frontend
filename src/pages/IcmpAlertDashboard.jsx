// src/pages/IcmpAlertDashboard.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import DataTable from "../components/table/DataTable";
import Button from "../components/ui/Button";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "../hooks/useToast";
import ExportButton from "../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";
import IcmpAlertForm from "../components/IcmpAlertForm";
import IcmpAlertFilterDrawer from "../components/filter/IcmpAlertFilterDrawer";
import {
    createIcmpAleartConfig,
    fetchIcmpAleartConfig,
    fetchIcmpAleartConfigs,
    updateIcmpAleartConfig,
} from "../services/partner-link/icmpAleartConfig";
import { fetchPartnerActivations } from "../services/partner-link/partnerActivationPlan";

export default function IcmpAlertDashboard() {
    const { addToast } = useToast();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);
    const [nasIps, setNasIps] = useState([]);
    const [activeFilters, setActiveFilters] = useState({});

    // Fetch NAS IPs from partner activation plans
    const fetchNasIps = useCallback(async () => {
        try {
            const response = await fetchPartnerActivations();
            if (response.status) {
                const ips = response.data.map((plan) => ({
                    value: plan.id,
                    label: plan.nas_ip
                        ? `${plan.work_order_id} (${plan.nas_ip})`
                        : plan.work_order_id,
                    nas_ip: plan.nas_ip,
                }));
                setNasIps(ips);
            }
        } catch (err) {
            console.error("Failed to fetch NAS IPs:", err);
            addToast("Failed to fetch NAS IPs", "error");
        }
    }, [addToast]);

    // Data Fetching
    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchIcmpAleartConfigs();
            if (response.status) {
                setAlerts(response.data || []);
            } else {
                throw new Error(
                    response.message || "Failed to fetch ICMP alerts"
                );
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to fetch ICMP alerts", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchNasIps();
        fetchAlerts();
    }, [fetchNasIps, fetchAlerts]);

    // Filter Options
    const NAS_IP_OPTIONS = useMemo(() => {
        return nasIps.map((ip) => ({
            value: ip.nas_ip,
            label: ip.label,
        }));
    }, [nasIps]);

    const STATUS_OPTIONS = useMemo(() => {
        const uniqueStatuses = Array.from(
            new Set(alerts.map((alert) => alert.is_active))
        );
        return uniqueStatuses.map((isActive) => ({
            value: String(isActive),
            label: isActive ? "Active" : "Inactive",
        }));
    }, [alerts]);

    // Filter Logic
    const filteredAlerts = useMemo(() => {
        const filters = activeFilters;
        if (Object.keys(filters).length === 0) return alerts;

        return alerts.filter((alert) => {
            let matches = true;
            if (filters.is_active) {
                const filterActive = filters.is_active === "true";
                if (alert.is_active !== filterActive) matches = false;
            }
            if (filters.nas_ip_filter && alert.activation_plan?.nas_ip) {
                if (alert.activation_plan.nas_ip !== filters.nas_ip_filter)
                    matches = false;
            }
            return matches;
        });
    }, [alerts, activeFilters]);

    const handleApplyFilters = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);

    // View Handlers
    const openNewForm = () => {
        setIsEditMode(false);
        setEditingAlert(null);
        setViewMode("form");
    };

    const handleEdit = async (alert) => {
        try {
            const response = await fetchIcmpAleartConfig(alert.id);
            if (response.status) {
                setIsEditMode(true);
                setEditingAlert(response.data);
                setViewMode("form");
            } else {
                throw new Error(
                    response.message || "Failed to fetch ICMP alert details"
                );
            }
        } catch (err) {
            addToast("Failed to fetch ICMP alert details", "error");
        }
    };

    // Form Submission Handler - UPDATED for backend compatibility
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

            // Handle creation/updates
            const results = [];
            for (const nasIp of nasIpsToCreate) {
                try {
                    const dataToSave = {
                        activation_plan_id: nasIp.value,
                        latency_threshold_ms: values.latency_threshold_ms,
                        is_active: values.is_active,
                    };

                    let response;
                    if (isEditMode && editingAlert) {
                        // For edit mode, update the specific record
                        response = await updateIcmpAleartConfig(
                            editingAlert.id,
                            dataToSave
                        );
                    } else {
                        // For create mode, create new records
                        response = await createIcmpAleartConfig(dataToSave);
                    }

                    if (response.status) {
                        results.push({ success: true, data: response.data });
                    } else {
                        results.push({
                            success: false,
                            error: response.message,
                        });
                    }
                } catch (error) {
                    results.push({ success: false, error: error.message });
                }
            }

            const successful = results.filter((r) => r.success);
            const failed = results.filter((r) => !r.success);

            if (failed.length > 0) {
                console.warn(`${failed.length} configurations failed`);
            }

            if (successful.length > 0) {
                addToast(
                    `Successfully ${isEditMode ? "updated" : "created"} ${
                        successful.length
                    } configuration(s)`,
                    "success"
                );
                fetchAlerts();
                resetForm();
                setViewMode("table");
            } else {
                throw new Error("All configurations failed");
            }
        } catch (err) {
            console.error("Form submission error:", err);
            addToast(err.message || "Save failed.", "error");
        }
    };

    // DataTable Columns
    const alertColumns = useMemo(
        () => [
            { key: "id", header: "ID" },
            {
                key: "nas_ip",
                header: "NAS IP",
                render: (_, row) => row.activation_plan?.nas_ip || "N/A",
            },
            {
                key: "nas_ip",
                header: "Client Name",
                render: (_, row) => row.activation_plan?.nas_ip || "N/A",
            },
            {
                key: "work_order_id",
                header: "Work Order ID",
                render: (_, row) => row.activation_plan?.work_order_id || "N/A",
            },
            { key: "latency_threshold_ms", header: "Latency Threshold (ms)" },
            {
                key: "is_active",
                header: "Status",
                render: (_, row) => (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                    >
                        {row.is_active ? "Active" : "Inactive"}
                    </span>
                ),
            },
            {
                key: "created_at",
                header: "Last Updated",
                render: (date) =>
                    date ? new Date(date).toLocaleDateString() : "N/A",
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
                    </div>
                ),
            },
        ],
        [handleEdit]
    );

    // Conditional Render
    if (viewMode === "form") {
        const initialFormValues = editingAlert
            ? {
                  ...editingAlert,
                  select_all_nas: false,
                  nas_ip_manual_select: [editingAlert.activation_plan_id],
                  latency_threshold_ms: editingAlert.latency_threshold_ms,
                  is_active: editingAlert.is_active,
              }
            : null;

        return (
            <IcmpAlertForm
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
        <div className="p-4 lg:p-6">
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        ICMP Alert Configurations
                    </h1>
                    <p className="text-sm text-gray-500">
                        View and manage ICMP alert configurations.
                    </p>
                </div>
                <div className="px-6 flex gap-2">
                    <ExportButton
                        data={filteredAlerts}
                        columns={alertColumns}
                        fileName="icmp_alerts_export"
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
                    title="ICMP Alert Records"
                    data={filteredAlerts}
                    columns={alertColumns}
                    searchable={true}
                    showId={false}
                    selection={false}
                    filterComponent={
                        <IcmpAlertFilterDrawer
                            onApply={handleApplyFilters}
                            activeFilters={activeFilters}
                            nasIpOptions={NAS_IP_OPTIONS}
                            statusOptions={STATUS_OPTIONS}
                        />
                    }
                />
            )}
        </div>
    );
}
