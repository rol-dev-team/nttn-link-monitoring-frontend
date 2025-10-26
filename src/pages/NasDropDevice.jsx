import React, { useMemo, useCallback, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Trash2, PlusCircle, FileSpreadsheet, Plus } from "lucide-react";

import TextInputField from "../components/fields/TextInputField";
import Button from "../components/ui/Button";
import DataTable from "../components/table/DataTable";
import ExportButton from "../components/ui/ExportButton";

// Import the SelectInput component
import SelectInput from "../components/fields/SelectInput";

// Mock data for NAS options (using react-select format)
const MOCK_NAS_OPTIONS = [
  { value: "192.168.10.1", label: "NAS A (192.168.10.1)" },
  { value: "192.168.10.2", label: "NAS B (192.168.10.2)" },
  { value: "192.168.10.3", label: "NAS C (192.168.10.3)" },
];

// Validation schema for individual rows (Drop Devices)
const DropDeviceSchema = Yup.object().shape({
  device_ip: Yup.string().required("Device IP is required"),
  usage_vlan: Yup.string().required("Usage VLAN is required"),
  connected_port: Yup.string().required("Connected Port is required"),
});

// Main validation schema for the entire form
const MainDropDeviceSchema = Yup.object().shape({
  // 1. Validation for the NAS SelectInput (expects an object { value, label })
  nas_ip: Yup.object()
    .shape({
      value: Yup.string().required("NAS IP is required"),
    })
    .nullable()
    .required("Please select a NAS."),

  // 2. Validation for the array of drop devices
  drop_devices: Yup.array().min(
    1,
    "Please add at least one drop device before submitting."
  ),

  // Note: The new_ fields do not require validation here as they are validated in handleAddRow
});

const NasDropDevicePage = () => {
  const [viewMode, setViewMode] = useState("table"); // "table" | "form"
  const addToast = (msg, type = "info") =>
    alert(`${type.toUpperCase()}: ${msg}`);

  const formik = useFormik({
    initialValues: {
      nas_ip: null, // Initial value for SelectInput
      drop_devices: [],
      new_device_ip: "",
      new_usage_vlan: "",
      new_connected_port: "",
    },
    validationSchema: MainDropDeviceSchema, // Apply the main schema
    onSubmit: async (values) => {
      // Drop device array check is now handled by Yup schema, but keep the toast for clarity
      if (values.drop_devices.length === 0) {
        addToast("Please add at least one device before submitting.", "error");
        return;
      }

      try {
        const payload = {
          // Access the NAS IP string from the selected object
          nas_ip: values.nas_ip.value,
          devices: values.drop_devices,
        };

        const response = await axios.post("/api/drop-devices", payload);
        addToast("Devices submitted successfully!", "success");
        console.log("API response:", response.data);
        formik.resetForm();
        setViewMode("table");
      } catch (error) {
        console.error(error);
        addToast("Failed to submit devices. Please try again.", "error");
      }
    },
  });

  // ✅ Add Device Handler (Unchanged logic)
  const handleAddRow = useCallback(() => {
    const newEntry = {
      device_ip: formik.values.new_device_ip,
      usage_vlan: formik.values.new_usage_vlan,
      connected_port: formik.values.new_connected_port,
    };

    DropDeviceSchema.validate(newEntry, { abortEarly: false })
      .then(() => {
        // Add an index/ID before adding to the array for better table keying
        formik.setFieldValue("drop_devices", [
          ...formik.values.drop_devices,
          { ...newEntry, id: Date.now() },
        ]);
        formik.setFieldValue("new_device_ip", "");
        formik.setFieldValue("new_usage_vlan", "");
        formik.setFieldValue("new_connected_port", "");
        addToast("Device added successfully!", "success");
      })
      .catch((err) => {
        // Display the actual error if available
        const msg =
          err.errors?.[0] ||
          "Please fill in all required fields for the new device.";
        addToast(msg, "error");
      });
  }, [formik, addToast]);

  // ✅ Remove Device Handler
  const handleRemoveRow = useCallback(
    (index) => {
      const newDevices = [...formik.values.drop_devices];
      const removedDevice = newDevices.splice(index, 1)[0];
      formik.setFieldValue("drop_devices", newDevices);
      addToast(`Removed device: ${removedDevice.device_ip}`, "warning");
    },
    [formik, addToast]
  );

  // ✅ Table columns
  const DROP_DEVICE_COLUMNS = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "device_ip", header: "Device IP" },
      { key: "usage_vlan", header: "Usage VLAN" },
      { key: "connected_port", header: "Connected Port" },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        width: "5rem",
        isSortable: false,
        render: (v, row, index) => (
          <button
            type='button'
            // Use row index for array manipulation
            onClick={() => handleRemoveRow(index)}
            className='btn btn-ghost btn-xs text-red-500 hover:text-red-700'
            title='Remove Device'>
            <Trash2 className='h-4 w-4' />
          </button>
        ),
      },
    ],
    [handleRemoveRow]
  );

  // ---
  // ✅ Conditional Rendering (Table View)
  // ---
  if (viewMode === "table") {
    return (
      <div className='p-4 lg:p-6'>
        <header className='flex justify-between items-center mb-10 pb-6 border-b border-gray-200'>
          <div>
            <h1 className='text-3xl font-extrabold text-gray-900'>
              Drop Devices Configuration
            </h1>
            <p className='text-sm text-gray-500'>
              View and manage drop device configurations for a NAS.
            </p>
          </div>

          <div className='px-6 flex gap-2'>
            <ExportButton
              data={formik.values.drop_devices}
              columns={DROP_DEVICE_COLUMNS}
              fileName='drop_devices_export'
              intent='primary'
              leftIcon={FileSpreadsheet}
              className='text-white bg-green-700 hover:bg-green-800 border-none'>
              Export
            </ExportButton>

            <Button
              intent='primary'
              onClick={() => setViewMode("form")}
              leftIcon={Plus}>
              Create New Device
            </Button>
          </div>
        </header>

        <DataTable
          title='Drop Device Records'
          data={formik.values.drop_devices} // Note: This table currently shows the last set of devices added, not historical data.
          columns={DROP_DEVICE_COLUMNS}
          searchable={true}
          showId={true}
          selection={false}
        />
      </div>
    );
  }

  // ---
  // ✅ Form View
  // ---
  return (
    <form
      onSubmit={formik.handleSubmit}
      className='p-6 md:col-span-3 space-y-6'>
      <div className='flex justify-between items-center'>
        <h3 className='text-2xl font-semibold text-gray-800'>
          Create Drop Device Configuration
        </h3>
        <Button
          type='button'
          intent='secondary'
          onClick={() => setViewMode("table")}>
          Back to Table
        </Button>
      </div>

      {/* 1. NAS Selection Dropdown */}
      <div className='space-y-4 '>
        <SelectInput
          name='nas_ip'
          formik={formik}
          options={MOCK_NAS_OPTIONS}
          label='Select NAS IP / Link'
          // Disable selection if devices are already added
          isDisabled={formik.values.drop_devices.length > 0}
          isSearchable={true}
        />

        {/* Error handling for NAS selection */}
        {formik.submitCount > 0 &&
          formik.touched.nas_ip &&
          formik.errors.nas_ip && (
            <p className='text-sm text-red-600 mt-1'>
              {typeof formik.errors.nas_ip === "string"
                ? formik.errors.nas_ip
                : formik.errors.nas_ip.value}
            </p>
          )}
      </div>

      {/* 2. Add New Device Row */}
      <div className='space-y-4 '>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-x-14'>
          <TextInputField
            name='new_device_ip'
            placeholder='Device IP'
            formik={formik}
          />
          <TextInputField
            name='new_usage_vlan'
            placeholder='Usage VLAN'
            formik={formik}
          />
          <TextInputField
            name='new_connected_port'
            placeholder='Connected Port'
            formik={formik}
          />

          <div className='flex items-center pt-1 md:pt-0'>
            <Button
              type='button'
              onClick={handleAddRow}
              intent='primary'
              size='sm'
              leftIcon={PlusCircle}
              className='w-full md:w-auto'>
              Add Device
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Device List Table */}
      {formik.values.drop_devices.length > 0 && (
        <div className='pt-6 border-t border-gray-200'>
          <DataTable
            data={formik.values.drop_devices}
            columns={DROP_DEVICE_COLUMNS}
            searchable={false}
            selection={false}
            initialPageSize={5}
            pageSizeOptions={[5, 10, 25]}
            stickyHeader={false}
            title={`Device List (${formik.values.drop_devices.length})`}
          />
        </div>
      )}

      {/* 4. Submission Button and Array Validation Error */}
      <div className='pt-6'>
        {/* Array validation error message */}
        {formik.submitCount > 0 && formik.errors.drop_devices && (
          <p className='text-sm text-red-600 mb-4'>
            {formik.errors.drop_devices}
          </p>
        )}

        <Button
          type='submit'
          intent='success'
          size='md'
          // Disable submission if the NAS is not selected or no devices are added
          disabled={
            formik.isSubmitting ||
            !formik.isValid ||
            !formik.values.nas_ip ||
            formik.values.drop_devices.length === 0
          }
          className='w-full md:w-auto'>
          Submit All Configurations to NAS (
          {formik.values.nas_ip?.value || "Select NAS"})
        </Button>
      </div>
    </form>
  );
};

export default NasDropDevicePage;
