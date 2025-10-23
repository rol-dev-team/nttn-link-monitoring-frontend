// src/pages/PartnerInfoDashboard.jsx

import React, { useState, useCallback, useMemo, useEffect } from "react";
import DataTable from "../components/table/DataTable";
import Button from "../components/ui/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "../hooks/useToast";
import ExportButton from "../components/ui/ExportButton";
import { FaFileExcel } from "react-icons/fa";
import PartnerInfoForm from "../components/PartnerInfoForm";
import PartnerInfoFilterDrawer from "../components/filter/PartnerInfoFilterDrawer";
import {
    createPartnerinfo,
    fetchPartnerinfos,
    fetchPartnerinfo,
    updatePartnerinfo,
    deletePartnerinfo,
} from "../services/partner-link/partnerInfo";

/**
 * Partner Info dashboard component with Table view and Form modal.
 */
export default function PartnerInfoDashboard() {
    const { addToast } = useToast();
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});

    // --- Data Fetching ---
    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchPartnerinfos();
            setConfigs(response.data);
        } catch (err) {
            console.error(err);
            addToast("Failed to fetch partner configurations", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    // Derive filter options data structure from the main config data
    const filterMetadata = useMemo(() => {
        const pairs = configs.map((c) => ({
            network_code: c.network_code,
            technical_kam: c.technical_kam?.name, // Access KAM name from relation
        }));
        return pairs;
    }, [configs]);

    // Central Filter Logic (Client-Side)
    const filteredConfigs = useMemo(() => {
        const filters = activeFilters;
        if (Object.keys(filters).length === 0) {
            return configs;
        }

        return configs.filter((config) => {
            let matches = true;

            // 1. Network Code Filter
            if (
                filters.network_code &&
                config.network_code !== filters.network_code
            ) {
                matches = false;
            }

            // 2. Technical KAM Filter
            if (
                filters.technical_kam &&
                config.technical_kam?.name !== filters.technical_kam
            ) {
                matches = false;
            }

            return matches;
        });
    }, [configs, activeFilters]);

    // Filter Handler (called by the FilterDrawer)
    const handleApplyFilters = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);

    // --- View and Action Handlers ---
    const openNewForm = () => {
        setIsEditMode(false);
        setEditingConfig(null);
        setViewMode("form");
    };

    const handleEdit = async (config) => {
        try {
            setIsEditMode(true);
            // Fetch the latest data for editing
            const response = await fetchPartnerinfo(config.id);
            setEditingConfig(response.data);
            setViewMode("form");
        } catch (err) {
            console.error(err);
            addToast("Failed to fetch partner details", "error");
        }
    };

    const handleDelete = async (configId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this partner configuration?"
            )
        )
            return;

        try {
            await deletePartnerinfo(configId);
            addToast("Configuration deleted successfully.", "success");
            fetchConfigs();
        } catch (err) {
            addToast("Failed to delete configuration.", "error");
            console.error("Delete failed:", err);
        }
    };

    // --- Form Submission Handler ---
    const handleFormSubmit = async (values, { resetForm }) => {
        try {
            console.log("Submitting Partner Info:", values);

            // Transform data to match backend model
            const apiPayload = {
                word_order_id: values.nttn_link_id, // Map nttn_link_id to word_order_id
                network_code: values.network_code,
                address: values.address,
                contact_number: values.contract_number, // Map contract_number to contact_number
                router_identity: values.router_identity,
                technical_kam_id: parseInt(values.technical_kam), // Convert to integer
                radius_server_id: parseInt(values.radius), // Convert to integer
            };

            if (isEditMode) {
                await updatePartnerinfo(editingConfig.id, apiPayload);
                addToast("Configuration updated successfully.", "success");
            } else {
                await createPartnerinfo(apiPayload);
                addToast("Configuration created successfully.", "success");
            }

            fetchConfigs();
            resetForm();
            setViewMode("table");
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || err.message || "Save failed.";
            addToast(errorMessage, "error");
        }
    };

    // --- DataTable Columns ---
    const configColumns = useMemo(
        () => [
            { key: "id", header: "ID" },
            {
                key: "word_order_id",
                header: "NTTN Link ID",
                render: (word_order_id) => word_order_id || "N/A",
            },
            { key: "network_code", header: "Network Code" },
            {
                key: "contact_number",
                header: "Contact Number",
                render: (contact_number) => contact_number || "N/A",
            },
            {
                key: "technical_kam",
                header: "Technical KAM",
                render: (technical_kam) => technical_kam?.name || "N/A",
            },
            {
                key: "router_identity",
                header: "Router ID",
                render: (router_identity) => router_identity || "N/A",
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
                        {/* Uncomment if you want delete functionality */}
                        {/* <Button 
                            variant="icon" 
                            size="sm" 
                            onClick={() => handleDelete(row.id)} 
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                        </Button> */}
                    </div>
                ),
            },
        ],
        [handleEdit, handleDelete]
    );

    // --- Conditional Render: FORM VIEW ---
    if (viewMode === "form") {
        return (
            <PartnerInfoForm
                initialValues={editingConfig}
                isEditMode={isEditMode}
                onSubmit={handleFormSubmit}
                onCancel={() => setViewMode("table")}
            />
        );
    }

    // --- Conditional Render: TABLE VIEW ---
    return (
        <div className="p-4 lg:p-6 ">
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Partner Configuration
                    </h1>
                    <p className="text-sm text-gray-500">
                        View and manage partner network and business
                        configuration settings.
                    </p>
                </div>
                <div className="px-6 flex gap-2">
                    <ExportButton
                        data={filteredConfigs}
                        columns={configColumns}
                        fileName="partner_configs_export"
                        intent="primary"
                        leftIcon={FaFileExcel}
                        className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
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
                    <p>Loading partner configurations...</p>
                </div>
            ) : (
                <DataTable
                    title="Partner Records"
                    data={filteredConfigs}
                    columns={configColumns}
                    searchable={true}
                    showId={true}
                    selection={false}
                    filterComponent={
                        <PartnerInfoFilterDrawer
                            onApply={handleApplyFilters}
                            activeFilters={activeFilters}
                            masterFilterData={filterMetadata}
                        />
                    }
                />
            )}
        </div>
    );
}
