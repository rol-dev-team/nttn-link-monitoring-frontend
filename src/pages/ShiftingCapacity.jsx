

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Pencil } from 'lucide-react';
import Button from '../components/ui/Button';
import ShiftCapacityForm from '../components/shiftCapacity/ShiftCapacityForm';
import DataTable from '../components/table/DataTable';
import ToastContainer from '../components/ui/ToastContainer';
import ExportButton from '../components/ui/ExportButton';
import ShiftCapacityFilterMenu from '../components/shiftCapacity/ShiftCapacityFilterMenu';
import { FaFileExcel } from 'react-icons/fa';
import moment from 'moment';

import { createShiftCapacity } from '../services/shiftCapacity';
import { fetchCapacityShifting } from '../services/capacityShiftingApi';

const defaultInitialValues = {
  nttn_provider: '',
  link_type: '',
  client_category: '',
  client: '',
  nttn_link_id: '',
  capacity: '',
  capacity_cost: '',
  shifting_bw: '',
  after_shifting_capacity: '',
  shifting_capacity: '',
  shifting_client_category: '',
  shifting_client: '',
  shifting_unit_cost: '',
  total_shifting_cost: '',
  shifting_unit_price_dropdown: '',
  submission_date: '',
  reason_id: '',
  remarks: '',
};

// ✅ Helper function to safely get nested data
const getNestedValue = (obj, path) => {
  if (!obj) return undefined;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const ShiftingCapacity = () => {
  const [allRecords, setAllRecords] = useState([]); // ✅ All records from API
  const [filteredRecords, setFilteredRecords] = useState([]); // ✅ Filtered records for display
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [activeFilters, setActiveFilters] = useState({}); // ✅ Track active filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRows: 0,
  });

  const [formState, setFormState] = useState({
    isOpen: false,
    isEditMode: false,
    editingId: null,
    initialValues: defaultInitialValues,
  });

  /* ---------- toast helpers ---------- */
  const pushToast = useCallback((msg, type) => {
    const t = { id: Date.now(), message: msg, type };
    setToasts((c) => [...c, t]);
    setTimeout(() => setToasts((c) => c.filter((x) => x.id !== t.id)), 5000);
  }, []);

  const removeToast = (id) => setToasts((c) => c.filter((t) => t.id !== id));

  /* ---------- fetch all records ---------- */
  useEffect(() => {
    const getCapacityShiftingData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchCapacityShifting();
        
        // Handle different API response structures
        let data = [];
        
        if (response && response.data && Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response)) {
          data = response;
        } else if (response && Array.isArray(response.data)) {
          data = response.data;
        }

        // ✅ Preprocess data with proper field mapping
        const preprocessedData = data.map((item) => ({
          ...item,
          sbu_id: item.sbu_id || '',
          sbu_name: item.sbu_name || '-',
          from_client: item.from_client || item.from_client_name || '-',
          to_client: item.to_client || item.to_client_name || '-',
          from_client_id: item.from_client_id || '',
          to_client_id: item.to_client_id || '',
          nttn_work_order_id: item.nttn_work_order_id || '',
          nttn_survey_id: item.nttn_survey_id || '',
          client_lat: item.client_lat || item.to_client_lat || '',
          client_long: item.client_long || item.to_client_long || '',
          source_capacity: item.source_capacity || '',
          shifting_bw: item.shifting_bw || '',
          current_capacity: item.current_capacity || '',
          total_shifting_cost: item.total_shifting_cost || '',
          created_at: item.created_at || '',
        }));

        console.log('✅ Preprocessed data:', preprocessedData);
        setAllRecords(preprocessedData);
        setFilteredRecords(preprocessedData); // Initially show all records
        setPagination((prev) => ({ ...prev, totalRows: preprocessedData.length }));
      } catch (error) {
        console.error('❌ API call failed:', error);
        setError('Failed to fetch capacity shifting records');
        pushToast('Failed to load records', 'error');
      } finally {
        setLoading(false);
      }
    };

    getCapacityShiftingData();
  }, [pushToast]);

  /* ---------- frontend filtering function ---------- */
  const applyFilters = useCallback((filters) => {
    if (!allRecords.length) return;
    
    console.log('🔍 Applying filters:', filters);
    
    let result = [...allRecords];
    
    // ✅ Apply SBU filter
    if (filters.sbu_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'sbu_id')) === String(filters.sbu_id)
      );
    }
    
    // ✅ Apply From Client filter
    if (filters.from_client_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'from_client_id')) === String(filters.from_client_id)
      );
    }
    
    // ✅ Apply To Client filter
    if (filters.to_client_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'to_client_id')) === String(filters.to_client_id)
      );
    }
    
    // ✅ Apply Client Latitude filter (exact match)
    if (filters.client_lat) {
      result = result.filter(record => {
        const clientLat = getNestedValue(record, 'client_lat') || record.client_lat;
        return String(clientLat) === String(filters.client_lat);
      });
    }
    
    // ✅ Apply Client Longitude filter (exact match)
    if (filters.client_long) {
      result = result.filter(record => {
        const clientLong = getNestedValue(record, 'client_long') || record.client_long;
        return String(clientLong) === String(filters.client_long);
      });
    }
    
    // ✅ Apply NTTN Work Order ID filter (Link/SCR ID)
    if (filters.nttn_work_order_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'nttn_work_order_id')) === String(filters.nttn_work_order_id)
      );
    }
    
    // ✅ Apply NTTN Survey ID filter (NTTN Provider ID)
    if (filters.nttn_survey_id) {
      result = result.filter(record => 
        String(getNestedValue(record, 'nttn_survey_id')) === String(filters.nttn_survey_id)
      );
    }
    
    console.log(`✅ Filtered from ${allRecords.length} to ${result.length} records`);
    setFilteredRecords(result);
    setPagination(prev => ({ ...prev, page: 1, totalRows: result.length }));
    setActiveFilters(filters);
  }, [allRecords]);

  // ✅ Handle filter change from ShiftCapacityFilterMenu
  const handleFilterChange = useCallback((filters) => {
    console.log('🎯 Filters received from ShiftCapacityFilterMenu:', filters);
    applyFilters(filters);
  }, [applyFilters]);

  // ✅ Clear all filters
  const clearFilters = useCallback(() => {
    setFilteredRecords(allRecords);
    setActiveFilters({});
    setPagination(prev => ({ ...prev, page: 1, totalRows: allRecords.length }));
  }, [allRecords]);

  /* ---------- form flow ---------- */
  const openNew = () =>
    setFormState({
      isOpen: true,
      isEditMode: false,
      editingId: null,
      initialValues: defaultInitialValues,
    });

  const closeForm = () =>
    setFormState({
      isOpen: false,
      isEditMode: false,
      editingId: null,
      initialValues: defaultInitialValues,
    });

  const handleSubmit = async (values) => {
    try {
      await createShiftCapacity(values);
      pushToast('Created successfully!', 'success');
      closeForm();
    } catch (e) {
      pushToast(e?.response?.data?.message || 'Save failed', 'error');
    }
  };

  /* ---------- columns definition ---------- */
  const columns = useMemo(
    () => [
      {
        key: 'sbu_name',
        header: 'SBU',
        isSortable: true,
      },
      {
        key: 'from_client',
        header: 'From Client',
        isSortable: true,
      },
      {
        key: 'source_capacity',
        header: 'Source Capacity',
        isSortable: true,
        render: (val) => (val ? `${val} Mbps` : '-'),
      },
      {
        key: 'to_client',
        header: 'To Client',
        isSortable: true,
      },
      {
        key: 'shifting_bw',
        header: 'Shifting BW',
        isSortable: true,
        render: (val) => (val ? `${val} Mbps` : '-'),
      },
      {
        key: 'current_capacity',
        header: 'Current Capacity',
        isSortable: true,
        render: (val) => (val ? `${val} Mbps` : '-'),
      },
      {
        key: 'total_shifting_cost',
        header: 'Total Cost',
        isSortable: true,
        render: (val) => (val ? `$${parseFloat(val).toFixed(2)}` : '-'),
      },
      {
        key: 'client_lat',
        header: 'Client Latitude',
        isSortable: true,
      },
      {
        key: 'client_long',
        header: 'Client Longitude',
        isSortable: true,
      },
      {
        key: 'nttn_work_order_id',
        header: 'Link / SCR ID',
        isSortable: true,
      },
      {
        key: 'nttn_survey_id',
        header: 'NTTN Provider ID',
        isSortable: true,
      },
      {
        key: 'created_at',
        header: 'Date',
        isSortable: true,
        render: (val) => (val ? moment(val).format('YYYY-MM-DD') : '-'),
      },
      {
        key: 'actions',
        header: 'Action',
        render: (_, row) => (
          <Button variant="icon" size="sm" title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  /* ---------- UI ---------- */
  if (formState.isOpen) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <ShiftCapacityForm
          initialValues={formState.initialValues}
          isEditMode={formState.isEditMode}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          showToast={pushToast}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center pb-16">
        <div>
          <h1 className="text-2xl font-bold">Capacity Shifting</h1>
          <p className="text-gray-500">View and manage capacity-shifting records.</p>
          {/* ✅ Show active filters count */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{filteredRecords.length}</span> records filtered
              <button 
                onClick={clearFilters}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={filteredRecords}
            columns={columns}
            fileName="capacity_shifts"
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNew} leftIcon={Plus}>
            Add Capacity Shift
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <p>Loading records...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <DataTable
          data={filteredRecords}
          columns={columns}
          showId={true}
          filterComponent={
            <ShiftCapacityFilterMenu 
              records={allRecords} // ✅ Pass all records for filter options
              onFilterChange={handleFilterChange} // ✅ This handles frontend filtering
            />
          }
          isBackendPagination={false} // ✅ Frontend pagination since we're filtering locally
          totalRows={filteredRecords.length}
          page={pagination.page}
          pageSize={pagination.limit}
          setPage={(page) => setPagination(p => ({ ...p, page }))}
          setPageSize={(limit) => setPagination(p => ({ ...p, limit, page: 1 }))}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ShiftingCapacity;