import React, { useState, useMemo, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Search, Bell, Calendar, Clock, ChevronDown, AlertCircle, TrendingUp } from 'lucide-react';
import Chart from '../components/charts/Chart'; // Assuming this is a Chart.js wrapper component
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// --- Mocking API Functions for a Runnable Example ---
const MOCK_NTTN_OPTIONS = [
  { label: 'NTTN-LINK-001 (Partner A)', value: 'wo-a123' },
  { label: 'NTTN-LINK-002 (Partner B)', value: 'wo-b456' },
  { label: 'NTTN-LINK-003 (Partner C)', value: 'wo-c789' },
];

const mockFetchCategoryWiseClientPartner = () =>
  new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          data: MOCK_NTTN_OPTIONS.map((opt) => ({
            nttn_work_order_id: opt.label,
            work_order_id: opt.value,
          })),
        }),
      500
    );
  });

const mockFetchWorkOrderDetailsForPartner = (nttnId) =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ data: { activation_plan_id: `act-${nttnId}` } }), 300);
  });

// Mock Alert Log Data (Time series data for 7 hours/days)
const MOCK_ALERT_DATA = [
  { timestamp: '2023-11-05T00:00:00Z', alert_count: 5 },
  { timestamp: '2023-11-06T00:00:00Z', alert_count: 12 },
  { timestamp: '2023-11-07T00:00:00Z', alert_count: 8 },
  { timestamp: '2023-11-08T00:00:00Z', alert_count: 20 },
  { timestamp: '2023-11-09T00:00:00Z', alert_count: 15 },
  { timestamp: '2023-11-10T00:00:00Z', alert_count: 25 },
  { timestamp: '2023-11-11T00:00:00Z', alert_count: 18 },
];

const mockGetAlertMonitoring = (params) =>
  new Promise((resolve) => {
    console.log('Mock Alert API called with:', params);
    setTimeout(() => resolve({ data: MOCK_ALERT_DATA }), 1000);
  });

// Using mocks
const fetchCategoryWiseClientPartner = mockFetchCategoryWiseClientPartner;
const fetchWorkOrderDetailsForPartner = mockFetchWorkOrderDetailsForPartner;
const getAlertMonitoring = mockGetAlertMonitoring;

/* =============================================================================
   CONSTANTS
   ============================================================================= */
const today = new Date();
const validationSchema = Yup.object().shape({
  nttnId: Yup.string().required('NTTN Link is required'),
  dateRange: Yup.array()
    .of(Yup.date().nullable())
    .test('both-required', 'Please select start and end dates', (value) => {
      if (!value) return false;
      const [start, end] = value;
      return !!start && !!end;
    }),
});

/* =============================================================================
   UI COMPONENTS & Helpers
   ============================================================================= */

// Select Component
const Select = ({ value, onChange, options, placeholder, disabled }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm
                 text-gray-900 text-sm font-medium appearance-none
                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                 disabled:bg-gray-100 disabled:cursor-not-allowed
                 transition-colors duration-200 pr-10"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
  </div>
);

// Button Component
const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled,
  icon: Icon,
  className = '',
  type = 'button',
}) => {
  const baseStyles =
    'px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow-md',
    secondary:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// Chart Data Transformer
const createLineChartData = (label, data, color) => ({
  labels: data.map((item) => item.x),
  datasets: [
    {
      label,
      data: data.map((item) => item.y),
      borderColor: color,
      backgroundColor: `${color}33`, // light fill
      tension: 0.3,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
});

// Chart Options (adapted Y-axis)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top', labels: { font: { size: 14 } } },
    tooltip: { enabled: true, mode: 'index', intersect: false },
  },
  interaction: { mode: 'nearest', axis: 'x', intersect: false },
  scales: {
    x: { title: { display: true, text: 'Time Period', font: { size: 14, weight: 'bold' } } },
    y: {
      title: { display: true, text: 'Alert Count', font: { size: 14, weight: 'bold' } },
      beginAtZero: true,
    },
  },
};

/* =============================================================================
   MAIN COMPONENT
   ============================================================================= */

const AlertLog = () => {
  // --- State Declarations ---
  const [nttnLinkIdOptions, setNttnLinkIdOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertData, setAlertData] = useState([]);
  const [partnerInfos, setPartnerInfos] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null); // Kept the state, but not used in JSX

  // --- Formik Setup ---
  const formik = useFormik({
    initialValues: {
      nttnId: '',
      dateRange: [null, null],
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setAlertData([]);
      setPartnerInfos(null);

      try {
        const { data: partnerData } = await fetchWorkOrderDetailsForPartner(values.nttnId);
        setPartnerInfos(partnerData);

        // Fetch Alert Monitoring Data
        const [startDate, endDate] = values.dateRange;
        const alertRes = await getAlertMonitoring({
          partner_activation_id: partnerData.activation_plan_id,
          date_range: [startDate.toISOString(), endDate.toISOString()],
        });

        setAlertData(alertRes.data || []);
        setLastUpdate(new Date());
      } catch (err) {
        console.error('Error during data fetching:', err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // --- Derived State (Simplified) ---
  // The 'isHistoricalMode' variable is no longer necessary as it's not displayed.

  // Transform alertData into chart-ready format
  const alertChartData = useMemo(() => {
    return alertData.map((item) => ({
      x: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      y: item.alert_count,
    }));
  }, [alertData]);

  // --- Data Fetching Effect (Initial Load) ---
  useEffect(() => {
    const boot = async () => {
      try {
        const { data } = await fetchCategoryWiseClientPartner();
        setNttnLinkIdOptions(
          data.map((item) => ({ label: item.nttn_work_order_id, value: item.work_order_id }))
        );
      } catch (e) {
        console.error('Error fetching NTTN links:', e);
      }
    };
    boot();
  }, []);

  // --- Component Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        {/* Header - SIMPLIFIED */}
        <header className="pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Alert Log</h1>
          {/* Removed Last updated and Historical Mode display */}
        </header>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form
            onSubmit={formik.handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 justify-center"
          >
            {/* NTTN Link Selector */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                NTTN Link ID*
              </label>
              <Select
                value={formik.values.nttnId}
                onChange={(value) => formik.setFieldValue('nttnId', value)}
                options={nttnLinkIdOptions}
                placeholder="Select NTTN Link"
              />
              {formik.touched.nttnId && formik.errors.nttnId && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.nttnId}</p>
              )}
            </div>

            {/* Date Range Picker */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Date Range*
              </label>

              <DatePicker
                selectsRange={true}
                startDate={formik.values.dateRange[0]}
                endDate={formik.values.dateRange[1]}
                onChange={(update) => formik.setFieldValue('dateRange', update)}
                maxDate={today}
                placeholderText="Select date range"
                dateFormat="MMM dd, yyyy"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm
                            text-gray-900 text-sm font-medium
                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                            transition-colors duration-200"
                isClearable
              />
              {formik.touched.dateRange && formik.errors.dateRange && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.dateRange}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <label className="text-sm font-semibold text-gray-700 opacity-0">Actions</label>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  icon={Search}
                  className="flex-1"
                  disabled={isLoading || !formik.isValid}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* --- Dashboard Content (Alert Log Chart) --- */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md p-6">
            <svg
              className="animate-spin h-10 w-10 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p className="text-indigo-600 mt-3 font-medium">Fetching alert data...</p>
          </div>
        ) : alertData.length > 0 ? (
          <div className="flex flex-col gap-4">
            {/* Alert Trend Chart */}
            <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-800">Alerts Over Time</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">Daily or hourly count of system alerts.</p>
              <div className="h-[300px]">
                <Chart
                  type="line"
                  data={createLineChartData('Alert Count', alertChartData, '#ef4444')}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <AlertCircle className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">
              No alert log data available. Please select an NTTN Link ID and a Date Range, then
              click **Search**.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertLog;
