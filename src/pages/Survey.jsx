import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Pencil } from "lucide-react";
import Button from "../components/ui/Button";
import SurveyForm from "../components/survey/SurveyForm";
import SurveyTable from "../components/survey/SurveyTable";
import { createSurvey, fetchSurveys, updateSurvey } from "../services/survey";
import ToastContainer from "../components/ui/ToastContainer";
import { FaFileExcel } from 'react-icons/fa';
import ExportButton from "../components/ui/ExportButton";
import DateField from "../components/fields/DateField";
import SelectField from "../components/fields/SelectField";

// Helper to extract unique options that only returns the name (for complex fields)
const getUniqueOptions = (records, key) => {
  const uniqueValues = new Set();
  records.forEach(record => {
    const value = record[key];
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      uniqueValues.add(String(value).trim());
    }
  });

  return Array.from(uniqueValues).sort().map(value => ({
    label: value,
    value: value,
  }));
};

// --- NEW HELPER: Maps Name (label) to ID (value) for Foreign Keys ---
const getUniqueOptionsWithIds = (records, nameKey, idKey) => {
  const uniqueMap = new Map(); // Map to store name -> ID

  records.forEach(record => {
    const name = record[nameKey];
    const id = record[idKey];
    if (name && id) {
      uniqueMap.set(name, id);
    }
  });

  return Array.from(uniqueMap.entries()).sort().map(([name, id]) => ({
    label: name,
    value: id, // <-- The filter sends the ID to the backend
  }));
};

const defaultInitialValues = {
  type_id: 1,
  sbu_id: null,
  link_type_id: null,
  aggregator_id: null,
  kam_id: null,
  nttn_id: null,
  nttn_survey_id: "",
  nttn_lat: "",
  nttn_long: "",
  client_lat: null,
  client_long: null,
  client_id: null,
  mac_user: "",
  submition: "",
};

const DEFAULT_PAGE_SIZE = 10;

const Survey = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({}); // Stores active filters (search, sort, custom)

  // 🔑 PAGINATION STATE
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalRows, setTotalRows] = useState(0);

  const [formState, setFormState] = useState({
    isOpen: false,
    isEditMode: false,
    editingRecordId: null,
    initialValues: defaultInitialValues,
  });
  const [toasts, setToasts] = useState([]);

  // 1. --- Toast Logic ---
  const showToast = useCallback((message, type) => {
    const newToast = { id: Date.now(), message, type };
    setToasts((currentToasts) => [...currentToasts, newToast]);
    setTimeout(() => {
      setToasts((currentsToasts) =>
        currentsToasts.filter((t) => t.id !== newToast.id)
      );
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  };


  // 2. --- Data Fetching (Primary Fix Applied Here) ---
  const fetchAllSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 🔑 CRITICAL: Use current state variables directly for the call
      const finalFilters = {
        ...filters, // Current filters object
        page: page, // Current page state
        limit: pageSize, // Current pageSize state
      };

      // Ensure that 'page' is at least 1, even if the filter reset set it to 1
      if (finalFilters.page < 1) finalFilters.page = 1;

      // The service layer (fetchSurveys) is assumed to correctly read X-Total-Count
      const { data, totalCount } = await fetchSurveys(finalFilters);

      setRecords(data);
      // Ensure totalRows is updated and non-negative
      setTotalRows(Math.max(0, totalCount));
    } catch (error) {
      console.error("Failed to fetch surveys:", error);
      setError(error?.response?.data?.message || "Something went wrong!");
      showToast(error?.response?.data?.message || "Failed to fetch surveys.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, filters, page, pageSize]); // 🔑 DEPENDENCIES: Re-run whenever pagination/filter state changes


  // 🔑 Initial fetch effect: TRIGGERS ON PAGE/PAGESIZE/FILTER CHANGES
  useEffect(() => {
    fetchAllSurveys();
  }, [fetchAllSurveys]);

  // --- Form Handlers (UNCHANGED) ---
  const openNewForm = () => {
    setFormState({
      isOpen: true,
      isEditMode: false,
      editingRecordId: null,
      initialValues: defaultInitialValues,
    });
  };

  const handleEdit = (item) => {
    let submissionDate = null;
    if (item.submition) {
      const date = new Date(item.submition);
      if (!isNaN(date.getTime())) {
        submissionDate = date;
      }
    }
    setFormState({
      isOpen: true,
      isEditMode: true,
      editingRecordId: item.id,
      initialValues: {
        ...item,
        submition: submissionDate,
        cat_id: item.type_id || item.cat_id,
      },
    });
  };

  const closeForm = () => {
    setFormState((prevState) => ({ ...prevState, isOpen: false }));
  };

  const handleSubmit = async (values) => {
    const { isEditMode, editingRecordId } = formState;
    try {
      if (isEditMode) {
        await updateSurvey(editingRecordId, values);
        showToast("Updated successfully!", "success");
      } else {
        await createSurvey(values);
        showToast("Created successfully!", "success");
      }
      // Re-fetch data using current active states
      fetchAllSurveys();
      closeForm();
    } catch (error) {
      showToast(error?.response?.data?.message || "Save failed!", "error");
    }
  };

  // 🔑 Filter Handler: Resets page to 1
  const handleFilterChange = useCallback((newQueryParams) => {
    // When filters change (search/sort/custom filter), we MUST reset to page 1.
    setPage(1);

    // 🔑 Set filters to the new complete set of query parameters
    setFilters(newQueryParams);
  }, []);


  // 🔑 Dynamic Options Calculation (Remains the same)
  const dynamicOptions = useMemo(() => {
    return {
      sbu: getUniqueOptionsWithIds(records, 'sbu_name', 'sbu_id'),
      link_type: getUniqueOptionsWithIds(records, 'link_type_name', 'link_type_id'),
      aggregator: getUniqueOptionsWithIds(records, 'aggregator_name', 'aggregator_id'),
      kam: getUniqueOptionsWithIds(records, 'kam_name', 'kam_id'),
      nttn: getUniqueOptionsWithIds(records, 'nttn_name', 'nttn_id'),
      client: getUniqueOptionsWithIds(records, 'client_name', 'client_id'),
      client_category: getUniqueOptions(records, 'client_category'),
      submition: getUniqueOptions(records, 'submition').map(opt => ({
        ...opt,
        label: opt.label.substring(0, 10)
      })),
    };
  }, [records]);


  // 🔑 Survey Columns Definition (Remains the same)
  const surveyColumns = useMemo(() => [
    {
      key: "sbu_name",
      header: "SBU",
      field: SelectField,
      fieldProps: { name: "sbu_id", options: dynamicOptions.sbu }
    },
    {
      key: "link_type_name",
      header: "Link Type",
      field: SelectField,
      fieldProps: { name: "link_type_id", options: dynamicOptions.link_type, searchable: true }
    },
    {
      key: "aggregator_name",
      header: "Aggregator",
      field: SelectField,
      fieldProps: { name: "aggregator_id", options: dynamicOptions.aggregator, searchable: true }
    },
    {
      key: "kam_name",
      header: "KAM",
      field: SelectField,
      fieldProps: { name: "kam_id", options: dynamicOptions.kam, searchable: true }
    },
    {
      key: "nttn_name",
      header: "NTTN Name",
      field: SelectField,
      fieldProps: { name: "nttn_id", options: dynamicOptions.nttn, searchable: true }
    },
    { key: "nttn_survey_id", header: "NTTN Provider ID" },
    {
      key: "client_category",
      header: "Client Cat.",
      field: SelectField,
      fieldProps: { name: "client_category", options: dynamicOptions.client_category, searchable: true }
    },
    {
      key: "client_name",
      header: "Client Name",
      field: SelectField,
      fieldProps: { name: "client_id", options: dynamicOptions.client, searchable: true }
    },
    { key: "client_division", header: "Division" },
    { key: "client_district", header: "District" },
    { key: "client_thana", header: "Thana" },
    { key: "mac_user", header: "MAC Users" },
    { key: "status", header: "Status" },
    {
      key: "submition",
      header: "Submission Date",
      field: DateField,
      fieldProps: { name: "submition", options: dynamicOptions.submition, searchable: true }
    },
    {
      key: "actions",
      header: "Action",
      render: (value, row) => (
        <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ], [handleEdit, dynamicOptions]);

  if (formState.isOpen) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <SurveyForm
          initialValues={formState.initialValues}
          isEditMode={formState.isEditMode}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center pb-16">
        <div>
          <h1 className="text-2xl font-bold">Surveys</h1>
          <p className="text-gray-500">View and manage the list of surveys.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={records}
            columns={surveyColumns}
            fileName="surveys"
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
            Add Survey
          </Button>
        </div>
      </div>

      {loading && totalRows === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <p>Loading surveys...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        // 🔑 PASS PAGINATION AND DYNAMIC OPTIONS TO SURVEYTABLE
        <SurveyTable
          records={records}
          onEdit={handleEdit}
          columns={surveyColumns}
          onFilterChange={handleFilterChange}
          dynamicOptions={dynamicOptions}
          isBackendPagination={true}
          totalRows={totalRows}
          page={page}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Survey;