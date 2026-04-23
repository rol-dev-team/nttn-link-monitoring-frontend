


import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Trash2, PlusCircle, Plus, FileSpreadsheet, ArrowLeft } from 'lucide-react';

import TextInputField from '../components/fields/TextInputField';
import Button from '../components/ui/Button';
import DataTable from '../components/table/DataTable';
import ExportButton from '../components/ui/ExportButton';
import SelectInput from '../components/fields/SelectInput';
import { useToast } from '../hooks/useToast';

import {
  createPartnerInterfaceConfig,
  fetchPartnerInterfaceConfigs
} from '../services/partner-link/partnerInterfaceConfig';
import { fetchCategoryWiseClientPartnerWithNas } from '../services/partner-link/txToPartner';

// Validation
const InterfaceSchema = Yup.object().shape({
  interface_name: Yup.string().required('Interface Name is required'),
});

const NasSchema = Yup.object().shape({
  activation_plan_id: Yup.string().required('Partner/NAS IP is required'),
  interface_configs: Yup.array().min(1, 'Add at least one interface.'),
});

const NasInterface = () => {
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState('table');
  const [nasIpOptions, setNasIpOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingConfigs, setExistingConfigs] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Fetch NAS IPs from API on component mount
  useEffect(() => {
    const loadNasIps = async () => {
      setLoading(true);
      try {
        const response = await fetchCategoryWiseClientPartnerWithNas();
        
        if (response.status === 'success' && response.data) {
          console.log('API Response:', response.data); // Debug log
          
          // Transform the API response to create NAS IP options
          const options = response.data
            .filter(item => item.nas_ip && item.id)
            .map((item) => ({
              value: item.id.toString(), // activation_plan_id
              label: `${item.client_name} - ${item.nttn_work_order_id} - ${item.nas_ip}`,
              nas_ip: item.nas_ip,
              client_name: item.client_name,
              nttn_work_order_id: item.nttn_work_order_id,
            }));
          
          setNasIpOptions(options);
          console.log('Transformed NAS Options:', options); // Debug log
          addToast(`Loaded ${options.length} NAS IPs successfully`, 'success');
        } else {
          addToast('Failed to load NAS IP data', 'error');
          setNasIpOptions([]);
        }
      } catch (error) {
        console.error('Error fetching NAS IP data:', error);
        addToast('Error loading NAS IP data', 'error');
        setNasIpOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadNasIps();
  }, [addToast]);

  // Fetch existing interface configurations
  const fetchExistingConfigs = useCallback(async () => {
    setTableLoading(true);
    try {
      const response = await fetchPartnerInterfaceConfigs();
      if (response.status) {
        setExistingConfigs(response.data || []);
        console.log('Fetched interface configs:', response.data); // Debug log
      } else {
        throw new Error(response.message || 'Failed to fetch interface configurations');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch interface configurations', 'error');
    } finally {
      setTableLoading(false);
    }
  }, [addToast]);

  // Load existing configs when component mounts and when view mode changes to table
  useEffect(() => {
    if (viewMode === 'table') {
      fetchExistingConfigs();
    }
  }, [viewMode, fetchExistingConfigs]);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      activation_plan_id: '',
      new_interface_name: '',
      interface_configs: [],
    },
    validationSchema: NasSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        console.log('Submitting values:', values); // Debug log

        // Submit each interface configuration individually
        const promises = values.interface_configs.map((interfaceConfig) =>
          createPartnerInterfaceConfig({
            activation_plan_id: values.activation_plan_id,
            interface_name: interfaceConfig.interface_name,
            interface_port: interfaceConfig.interface_port || '',
          })
        );

        const results = await Promise.all(promises);

        // Check if all requests were successful
        const allSuccess = results.every((result) => result.status === true);

        if (allSuccess) {
          addToast('All interface configurations submitted successfully!', 'success');
          formik.resetForm();
          setViewMode('table');

          // Refresh the table data
          fetchExistingConfigs();
        } else {
          addToast('Some configurations failed to submit', 'error');
        }
      } catch (err) {
        addToast('Failed to submit configurations: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle select change to store only the value
  const handleActivationPlanChange = (selectedOption) => {
    // Store only the value (string) not the entire object
    formik.setFieldValue('activation_plan_id', selectedOption ? selectedOption.value : '');
  };

  // Add interface
  const handleAddInterface = useCallback(() => {
    const newInterface = {
      interface_name: formik.values.new_interface_name,
      interface_port: '',
      id: Date.now(),
    };

    InterfaceSchema.validate(newInterface, { abortEarly: false })
      .then(() => {
        formik.setFieldValue('interface_configs', [
          ...formik.values.interface_configs,
          newInterface,
        ]);
        formik.setFieldValue('new_interface_name', '');
        addToast('Interface added successfully!', 'success');
      })
      .catch((err) => {
        const msg = err.errors?.[0] || 'Please fill all fields correctly.';
        addToast(msg, 'error');
      });
  }, [formik, addToast]);

  // Remove interface individually
  const handleRemoveInterface = useCallback(
    (id) => {
      const updated = formik.values.interface_configs.filter((i) => i.id !== id);
      formik.setFieldValue('interface_configs', updated);
      addToast('Interface removed', 'warning');
    },
    [formik, addToast]
  );

  // Get the selected option for display
  const selectedNasIpOption = nasIpOptions.find(
    (option) => option.value === formik.values.activation_plan_id
  );

  // Columns for form view (temporary interfaces)
  const INTERFACE_COLUMNS_FORM = useMemo(
    () => [
      { key: 'interface_name', header: 'Interface Name' },
      {
        key: 'interface_port',
        header: 'Interface Port',
        render: (value) => value || 'Will be set by system',
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'center',
        width: '5rem',
        render: (v, row) => (
          <button
            type="button"
            onClick={() => handleRemoveInterface(row.id)}
            className="btn btn-ghost btn-xs text-red-500 hover:text-red-700"
            title="Remove Interface"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [handleRemoveInterface]
  );

  // Columns for table view (saved interfaces)
  const INTERFACE_COLUMNS_TABLE = useMemo(
    () => [
      { key: 'id', header: 'ID' },
      { key: 'interface_name', header: 'Interface Name' },
      { key: 'interface_port', header: 'Interface Port' },
      {
        key: 'activation_plan_id',
        header: 'Activation Plan ID',
        render: (value) => value || 'N/A',
      },
      {
        key: 'nas_ip',
        header: 'NAS IP',
        render: (_, row) => row.activation_plan?.nas_ip || 'N/A',
        searchValue: (row) => row.activation_plan?.nas_ip || '', 
      },
      // {
      //   key: 'client_name',
      //   header: 'Client Name',
      //   render: (_, row) => row.activation_plan?.client?.client_name || 'N/A',
      // },
      {
        key: 'work_order_id',
        header: 'Work Order ID',
        render: (_, row) => row.activation_plan?.work_order_id || 'N/A',
      },
      {
        key: 'created_at',
        header: 'Created At',
        render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
      },
      {
        key: 'updated_at',
        header: 'Updated At',
        render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
      },
    ],
    []
  );

  // Table view
  if (viewMode === 'table') {
    return (
      <div className="p-4 lg:p-6">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Partner Interface Configuration
            </h1>
            <p className="text-sm text-gray-500">
              View and manage the configuration of partner activation.
            </p>
          </div>

          <div className="px-6 flex gap-2">
            <ExportButton
              data={existingConfigs}
              columns={INTERFACE_COLUMNS_TABLE}
              fileName="partner_interface_configs_export"
              intent="primary"
              leftIcon={FileSpreadsheet}
              className="text-white-500 bg-green-700 hover:bg-green-800 border-none"
            >
              Export
            </ExportButton>
            <Button
              intent="primary"
              onClick={() => setViewMode('form')}
              leftIcon={Plus}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Create New Interface'}
            </Button>
          </div>
        </header>

        {tableLoading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <p>Loading interface configurations...</p>
          </div>
        ) : (
          <DataTable
            title={`Interface Records (${existingConfigs.length})`}
            data={existingConfigs}
            columns={INTERFACE_COLUMNS_TABLE}
            searchable={true}
            showId={false}
            selection={false}
          />
        )}
      </div>
    );
  }

  // Form view
  return (
    <form onSubmit={formik.handleSubmit} className="p-6 space-y-8">
      <header className="mb-10 pb-6 border-b border-gray-200 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            <Button
              variant="ghost"
              leftIcon={ArrowLeft}
              onClick={() => setViewMode('table')}
              className="-ml-4 text-lg font-semibold"
              type="button"
            ></Button>
            NAS Interface Configuration
          </h1>
          <p className="text-sm text-gray-500 ml-10">Create nas interface configuration</p>
        </div>
      </header>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800">NAS IP Selection</h3>
        <SelectInput
          name="activation_plan_id"
          formik={formik}
          options={nasIpOptions}
          label="Select Partner Name / NAS IP"
          isDisabled={formik.values.interface_configs.length > 0 || loading}
          isSearchable={true}
          isClearable={true}
          isLoading={loading}
          placeholder={loading ? 'Loading NAS IPs...' : 'Select NAS IP...'}
          onChange={handleActivationPlanChange}
          value={selectedNasIpOption}
        />
        {formik.errors.activation_plan_id && formik.touched.activation_plan_id && (
          <p className="text-sm text-red-600">{formik.errors.activation_plan_id}</p>
        )}
        {!loading && nasIpOptions.length === 0 && (
          <p className="text-sm text-yellow-500">No NAS IPs available</p>
        )}
      </div>

      <hr className="border-gray-200 my-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <TextInputField
          name="new_interface_name"
          placeholder="e.g. eth0, sfp-sfpplus1, VSOL-PON-1"
          formik={formik}
          disabled={!formik.values.activation_plan_id}
        />
        <Button
          type="button"
          onClick={handleAddInterface}
          intent="primary"
          size="md"
          leftIcon={PlusCircle}
          className="w-full"
          disabled={
            !formik.values.activation_plan_id || !formik.values.new_interface_name || loading
          }
        >
          {loading ? 'Adding...' : 'Add Interface'}
        </Button>
      </div>

      {formik.values.interface_configs.length > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <DataTable
            data={formik.values.interface_configs}
            columns={INTERFACE_COLUMNS_FORM}
            searchable={false}
            selection={false}
            initialPageSize={5}
            pageSizeOptions={[5, 10, 25]}
            stickyHeader={false}
            title={`Configured Interfaces (${formik.values.interface_configs.length})`}
          />
        </div>
      )}

      {formik.submitCount > 0 && formik.errors.interface_configs && (
        <p className="text-sm text-red-600 mt-1">{formik.errors.interface_configs}</p>
      )}

      <div className="pt-6 border-t border-gray-200 flex justify-end">
        <Button
          type="submit"
          intent="success"
          size="md"
          disabled={loading || formik.isSubmitting || formik.values.interface_configs.length === 0}
        >
          {loading ? 'Submitting...' : 'Submit All Configurations'}
        </Button>
      </div>
    </form>
  );
};

export default NasInterface;