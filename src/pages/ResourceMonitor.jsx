import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Search,
  Cpu,
  Server,
  HardDrive,
  Users,
  Activity,
  TrendingUp,
  Calendar,
  RefreshCw,
  Clock,
  ChevronDown,
  AlertCircle,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react';
import Chart from '../components/charts/Chart';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  fetchCategoryWiseClientPartner,
  fetchWorkOrderDetailsForPartner,
} from '../services/partner-link/txToPartner';
import { getResourceMonitoring } from '../services/partner-link/nasHealthApi';

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
   UI COMPONENTS
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
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// Info Card Component
const InfoCard = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-base font-bold text-gray-900">{value || 'N/A'}</p>
  </div>
);

export default function ResourceMonitor({ onCancel }) {
  // State
  const [nttnLinkIdOptions, setNttnLinkIdOptions] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [partnerInfos, setPartnerInfos] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const today = new Date();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Derived state
  const isHistoricalMode = !!(startDate && endDate && selectedNttnId);

  useEffect(() => {
    const boot = async () => {
      try {
        const { data } = await fetchCategoryWiseClientPartner();
        setNttnLinkIdOptions(
          data.map((item) => ({
            label: `${item.client_name} - ${item.nttn_work_order_id}`,
            value: item.work_order_id,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };
    boot();
  }, []);

  const formik = useFormik({
    initialValues: {
      nttnId: '',
      dateRange: [null, null],
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const { data } = await fetchWorkOrderDetailsForPartner(values.nttnId);
        setPartnerInfos(data);
        const resourceRes = await getResourceMonitoring({
          partner_activation_id: data.activation_plan_id,
          date_range: values.dateRange,
        });

        setResourceData(resourceRes.data || []);
        setLastUpdate(new Date());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // CPU Data
  const cpuData = resourceData
    .filter((item) => item.type === 'CPU')
    .map((item) => ({ x: item.collected_month, y: item.value }));

  // RAM Data
  const ramData = resourceData
    .filter((item) => item.type === 'RAM')
    .map((item) => ({ x: item.collected_month, y: item.value }));

  // Disk Data
  const diskData = resourceData
    .filter((item) => item.type === 'Disk')
    .map((item) => ({ x: item.collected_month, y: item.value }));

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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 14 },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          // text: 'Month',
          font: { size: 14, weight: 'bold' },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Usage (%)',
          font: { size: 14, weight: 'bold' },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">NAS Health Monitoring</h1>

          {lastUpdate && !isHistoricalMode && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <Clock className="w-4 h-4" />
              Last updated:{new Date().toLocaleTimeString()}
            </div>
          )}
        </header>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form
            onSubmit={formik.handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 justify-center"
          >
            {/* NTTN Link Selector */}
            <div className="">
              <Select
                value={formik.values.nttnId}
                onChange={(value) => formik.setFieldValue('nttnId', value)}
                options={nttnLinkIdOptions}
                placeholder="Select NTTN Link*"
              />
              {formik.touched.nttnId && formik.errors.nttnId && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.nttnId}</p>
              )}
            </div>

            {/* Date Range Picker */}
            <div className="">
              <DatePicker
                selectsRange={true}
                startDate={formik.values.dateRange[0]}
                endDate={formik.values.dateRange[1]}
                onChange={(update) => formik.setFieldValue('dateRange', update)}
                maxDate={today}
                placeholderText="Select date range*"
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
            <div className="">
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  icon={Search}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Partner Information */}

        {partnerInfos && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Partner Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <InfoCard label="NTTN Provider" value={partnerInfos.nttn_name} />
              <InfoCard label="Partner Name" value={partnerInfos.client_name} />
              <InfoCard label="SBU" value={partnerInfos.sbu_name} />
              <InfoCard label="Aggregator" value={partnerInfos.aggregator_name} />
              <InfoCard label="Business KAM" value={partnerInfos.kam_name} />
              <InfoCard label="Purchased Capacity" value={partnerInfos.request_capacity} />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
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
          </div>
        ) : resourceData.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* CPU Chart */}
            <div className="flex-1 bg-white rounded-2xl shadow-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">CPU Usage</h3>
              </div>
              <div className="h-[250px] lg:h-[300px]">
                <Chart
                  type="line"
                  data={createLineChartData('CPU', cpuData, '#4f46e5')}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* RAM Chart */}
            <div className="flex-1 bg-white rounded-2xl shadow-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">RAM Usage</h3>
              </div>
              <div className="h-[250px] lg:h-[300px]">
                <Chart
                  type="line"
                  data={createLineChartData('RAM', ramData, '#16a34a')}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* Disk Chart */}
            <div className="flex-1 bg-white rounded-2xl shadow-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">Disk Usage</h3>
              </div>
              <div className="h-[250px] lg:h-[300px]">
                <Chart
                  type="line"
                  data={createLineChartData('Disk', diskData, '#f59e0b')}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">
              No resource monitoring data available. Please perform a search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
