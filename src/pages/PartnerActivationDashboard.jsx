




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

export default function PartnerActivationDashboard() {
    const { addToast } = useToast();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});

    // ── Data Fetching ──
    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchPartnerActivations();
            if (response.status) {
                setPlans(response.data || []);
            } else {
                throw new Error(response.message || "Failed to fetch activation plans");
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

    // ── Filter Logic ──
    const filteredPlans = useMemo(() => {
        const filters = activeFilters;
        if (Object.keys(filters).length === 0) return plans;

        return plans.filter((plan) => {
            let matches = true;
            if (filters.work_order_id && plan.work_order_id !== filters.work_order_id)
                matches = false;
            if (filters.connected_ws_name && plan.connected_ws_name !== filters.connected_ws_name)
                matches = false;
            if (filters.status && plan.status !== filters.status)
                matches = false;
            return matches;
        });
    }, [plans, activeFilters]);

    const handleApplyFilters = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);

    // ── View Handlers ──
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
                throw new Error(response.message || "Failed to fetch activation plan details");
            }
        } catch (err) {
            addToast("Failed to fetch activation plan details", "error");
            console.error("Edit failed:", err);
        }
    };

    const handleDelete = async (planId) => {
        if (!window.confirm("Are you sure you want to delete this activation plan?")) return;
        try {
            const response = await deletePartnerActivation(planId);
            if (response.status) {
                addToast("Activation Plan deleted successfully.", "success");
                fetchPlans();
            } else {
                throw new Error(response.message || "Failed to delete activation plan");
            }
        } catch (err) {
            addToast("Failed to delete activation plan.", "error");
            console.error("Delete failed:", err);
        }
    };

    // ── Form Submit Handler ──
    const handleFormSubmit = async (values, { resetForm, setErrors }) => {
        try {
            // Map frontend field names → backend field names
            const mappedActivationData = {
                work_order_id: values.nttn_work_order_id || '',
                client_id: values.client_id || '',
                nttn_work_order_id: values.nttn_work_order_id || '',
                request_capacity: values.request_capacity || '',
                nttn_vlan: values.nttn_vlan || '',
                int_routing_ip: values.int_peering_ip || '',
                ggc_routing_ip: values.ggc_peering_ip || '',
                fna_routing_ip: values.fna_peering_ip || '',
                bcdx_routing_ip: values.bdix_peering_ip || '',
                mcdn_routing_ip: values.mcdn_peering_ip || '',
                int_vlan: values.int_vlan || '',
                ggn_vlan: values.ggn_vlan || '',
                fna_vlan: values.fna_vlan || '',
                bcdx_vlan: values.bdix_vlan || '',
                mcdn_vlan: values.mcdn_vlan || '',
                nas_ip: values.nas_ip || '',
                nat_ip: values.nat_ip || '',
                connected_ws_name: values.connected_sw_name || '',
                chr_server: values.chr_server || '',
                sw_port: values.sw_port || '',
                nic_no: values.nic_no || '',
                asn: values.asn || '',
                status: values.status || 'active',
                note: values.note || '',
                backup: values.backup ? 1 : 0,
                log: values.log ? 1 : 0,
            };

            let response;
            if (isEditMode) {
                response = await updatePartnerActivation(editingPlan.id, mappedActivationData);
            } else {
                response = await createPartnerActivation(mappedActivationData);
            }

            // ✅ SUCCESS
            if (response.status) {
                addToast(
                    isEditMode
                        ? "Activation Plan updated successfully!"
                        : "Activation Plan created successfully!",
                    "success"
                );
                fetchPlans();
                resetForm();
                setViewMode("table");
                return;
            }

            // Service returned status: false
            addToast(response.message || "Save failed.", "error");

        } catch (err) {
            console.error("Form submission error:", err);

            const status = err.response?.status;
            const data = err.response?.data;

            // ✅ 422 — Laravel field-level validation errors
            // e.g. "The nat ip has already been taken."
            if (status === 422 && data?.errors) {

                // Map backend field names → frontend Formik field names
                const backendToFrontend = {
                    work_order_id: 'nttn_work_order_id',
                    nttn_vlan: 'nttn_vlan',
                    int_routing_ip: 'int_peering_ip',
                    ggc_routing_ip: 'ggc_peering_ip',
                    fna_routing_ip: 'fna_peering_ip',
                    bcdx_routing_ip: 'bdix_peering_ip',
                    mcdn_routing_ip: 'mcdn_peering_ip',
                    int_vlan: 'int_vlan',
                    ggn_vlan: 'ggn_vlan',
                    fna_vlan: 'fna_vlan',
                    bcdx_vlan: 'bdix_vlan',
                    mcdn_vlan: 'mcdn_vlan',
                    nas_ip: 'nas_ip',
                    nat_ip: 'nat_ip',
                    connected_ws_name: 'connected_sw_name',
                    chr_server: 'chr_server',
                    sw_port: 'sw_port',
                    nic_no: 'nic_no',
                    asn: 'asn',
                    status: 'status',
                    note: 'note',
                    backup: 'backup',
                    log: 'log',
                };

                const formikErrors = {};
                Object.entries(data.errors).forEach(([backendField, messages]) => {
                    const frontendField = backendToFrontend[backendField] || backendField;
                    formikErrors[frontendField] = Array.isArray(messages)
                        ? messages[0]
                        : messages;
                });

                // Inject errors into form fields + keep form open
                setErrors(formikErrors);
                addToast(
                    data.message || "Validation failed. Please check the highlighted fields.",
                    "error"
                );
                return;
            }

            // ✅ 500 — Server error or LibreNMS failure
            if (status === 500) {
                let errorMessage = data?.message || "A server error occurred.";
                if (data?.librenms_response) {
                    const libreDetail =
                        typeof data.librenms_response === "object"
                            ? JSON.stringify(data.librenms_response)
                            : data.librenms_response;
                    errorMessage += ` LibreNMS: ${libreDetail}`;
                }
                addToast(errorMessage, "error");
                return;
            }

            // ✅ Network error — server completely unreachable
            if (!err.response) {
                addToast(
                    "Network error: Unable to reach the server. Please check your connection.",
                    "error"
                );
                return;
            }

            // ✅ Any other error
            addToast(data?.message || err.message || "Save failed.", "error");
        }
    };

    // ── Table Columns ──
    const planColumns = useMemo(
        () => [
            { key: "id", header: "ID" },
            { key: "work_order_id", header: "Work Order ID" },
            {
                key: "client_id",
                header: "Client Name",
                render: (_, row) => row.client?.client_name || "N/A",
                searchValue: (row) => row.client?.client_name || "",
            },
            {
                key: "nttn_work_order_id",
                header: "Link ID",
                render: (_, row) => row.work_order?.nttn_work_order_id || "N/A",
                searchValue: (row) => row.work_order?.nttn_work_order_id || "",
            },
            {
                key: "request_capacity",
                header: "Request Capacity",
                render: (_, row) => row.work_order?.request_capacity || "N/A",
                searchValue: (row) => row.work_order?.request_capacity || "",
            },
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
                key: "backup",
                header: "Backup",
                render: (val) => (Number(val) === 1 || val === true ? "Yes" : "No"),
            },
            {
                key: "log",
                header: "Log",
                render: (val) => (Number(val) === 1 || val === true ? "Yes" : "No"),
            },
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
                render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
            },
            {
                key: "status",
                header: "Status",
                render: (status) => {
                    const isActive = status === "active";
                    return (
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${
                                isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                        >
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
                    </div>
                ),
            },
        ],
        [handleEdit, handleDelete]
    );

    // ── Form View ──
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

    // ── Table View ──
    return (
        <div className="w-full">
            <header className="px-4 lg:px-6 flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
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
                    <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
                        Create New Plan
                    </Button>
                </div>
            </header>

            {loading ? (
                <div className="px-4 lg:px-6 flex justify-center items-center py-20 text-gray-500">
                    <p>Loading activation plans...</p>
                </div>
            ) : (
                <div className="px-4 lg:px-6">
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
                </div>
            )}
        </div>
    );
}
