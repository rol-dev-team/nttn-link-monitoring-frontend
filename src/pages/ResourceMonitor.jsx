import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Cpu, Server, HardDrive, Users, Activity, TrendingUp, Calendar, RefreshCw, Clock, ChevronDown, AlertCircle, TrendingDown, TrendingUp as TrendingUpIcon } from 'lucide-react';
import Chart from "../components/charts/Chart";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

/* =============================================================================
   MOCK DATA & API SIMULATORS
   ============================================================================= */

const MOCK_NTTN_OPTIONS = [
  { label: "NTTN-LINK-001", value: "NTTN-LINK-001" },
  { label: "NTTN-LINK-002", value: "NTTN-LINK-002" },
  { label: "NTTN-LINK-003", value: "NTTN-LINK-003" },
];

const RESOURCE_OPTIONS = [
  { label: "All Resources", value: "all" },
  { label: "CPU Only", value: "cpu" },
  { label: "Memory Only", value: "memory" },
  { label: "RAM Only", value: "ram" },
];

const MOCK_PARTNER_DATA = {
  "NTTN-LINK-001": {
    nttn_provider: "Summit Communications",
    partner_name: "ABC Entity Ltd.",
    sbu: "Race Online",
    aggregator: "Khaja Rahman",
    business_kam: "Sarah Mitchell",
    purchased_capacity: "100 Mbps",
  },
  "NTTN-LINK-002": {
    nttn_provider: "Fiber@Home",
    partner_name: "Beta ISP Solutions",
    sbu: "MetroNet Division",
    aggregator: "Rahim Ahmed",
    business_kam: "John Peterson",
    purchased_capacity: "50 Mbps",
  },
  "NTTN-LINK-003": {
    nttn_provider: "Summit Communications",
    partner_name: "Gamma Telecom Inc.",
    sbu: "Linkup Services",
    aggregator: "Karim Hassan",
    business_kam: "Michael Chen",
    purchased_capacity: "500 Mbps",
  },
};

// Simulate live data fetch
const simulateFetchLiveData = (id) => new Promise(resolve => {
  setTimeout(() => {
    if (!id) return resolve(null);
    resolve({
      nttn_link_id: id,
      cpu_utilization: Math.round(Math.random() * 30 + 45),
      memory_utilization: Math.round(Math.random() * 25 + 60),
      ram_utilization: Math.round(Math.random() * 35 + 25),
      timestamp: new Date().toISOString(),
    });
  }, 800);
});

// Generate historical data with more detail
const generateHistoricalData = (metric) => {
  const dataPoints = 30;
  const baseDate = new Date();
  const labels = [];
  const data = [];
  
  let baseValue;
  switch(metric) {
    case 'cpu': baseValue = 55; break;
    case 'memory': baseValue = 70; break;
    case 'ram': baseValue = 40; break;
    default: baseValue = 50;
  }
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - (dataPoints - 1 - i));
    labels.push(date);
    data.push(Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * 30)));
  }
  
  // Calculate stats
  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const current = data[data.length - 1];
  const previous = data[data.length - 2];
  const trend = current > previous ? 'up' : current < previous ? 'down' : 'stable';
  
  return { labels, data, stats: { avg, max, min, current, trend } };
};

const simulateFetchHistoricalData = (id, start, end) => new Promise(resolve => {
  setTimeout(() => {
    if (!id || !start || !end) return resolve(null);
    const cpu = generateHistoricalData('cpu');
    const memory = generateHistoricalData('memory');
    const ram = generateHistoricalData('ram');
    
    resolve({
      cpu: { labels: cpu.labels, data: cpu.data, stats: cpu.stats },
      memory: { labels: memory.labels, data: memory.data, stats: memory.stats },
      ram: { labels: ram.labels, data: ram.data, stats: ram.stats },
    });
  }, 1200);
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
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
  </div>
);

// Button Component
const Button = ({ children, onClick, variant = 'primary', disabled, icon: Icon, className = '' }) => {
  const baseStyles = "px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow-md",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200",
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

// Stats Card for detailed view
const StatsCard = ({ label, value, icon: Icon, trend }) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-red-600 bg-red-50';
    if (trend === 'down') return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };
  
  const TrendIcon = trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDown : Activity;
  
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">{value}%</span>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getTrendColor()}`}>
            <TrendIcon className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

// Radial Gauge Component (Enhanced for full width)
const RadialGauge = ({ value, label, icon: Icon, color, isFullWidth, stats }) => {
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (value / 100) * circumference;
  
  const getStatusColor = (val) => {
    if (val < 60) return { stroke: '#10b981', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (val < 80) return { stroke: '#f59e0b', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { stroke: '#ef4444', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };
  
  const status = getStatusColor(value);
  
  if (isFullWidth) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-8 h-8" style={{ color }} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{label} Utilization</h3>
            <p className="text-sm text-gray-600">Current system resource usage</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Gauge */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke={status.stroke}
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-out"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-6xl font-black ${status.text}`}>{value}%</span>
                <span className="text-sm text-gray-500 mt-2 font-semibold">Current Usage</span>
              </div>
            </div>
            
            <div className={`mt-6 px-6 py-3 rounded-full text-sm font-bold ${status.bg} ${status.text} border-2 ${status.border}`}>
              {value < 60 ? '✓ Healthy Status' : value < 80 ? '⚠ Moderate Usage' : '⚠ High Usage Alert'}
            </div>
          </div>
          
          {/* Additional Stats and Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Stats */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Live Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="text-xs font-semibold text-blue-700 uppercase mb-1">Current Load</div>
                  <div className="text-3xl font-bold text-blue-900">{value}%</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="text-xs font-semibold text-purple-700 uppercase mb-1">Status</div>
                  <div className="text-lg font-bold text-purple-900">
                    {value < 60 ? 'Optimal' : value < 80 ? 'Elevated' : 'Critical'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Threshold Indicators */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                Usage Thresholds
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-24">0-60% Safe</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-24">60-80% Warning</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-24">80-100% Critical</span>
                </div>
              </div>
            </div>
            
            {/* System Info */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-indigo-900 mb-1">{label} Resource Monitor</h5>
                  <p className="text-sm text-indigo-700">
                    {label === 'CPU' && 'Processing power utilization across all cores'}
                    {label === 'Memory' && 'System memory allocation and usage patterns'}
                    {label === 'RAM' && 'Random access memory consumption tracking'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke={status.stroke}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className={`w-8 h-8 mb-2 ${status.text}`} />
            <span className={`text-4xl font-bold ${status.text}`}>{value}%</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1">{label}</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
          {value < 60 ? 'Healthy' : value < 80 ? 'Moderate' : 'High Usage'}
        </div>
      </div>
    </div>
  );
};

// Line Chart Component (Enhanced for full width)
const LineChart = ({ data, label, color, icon: Icon, isFullWidth }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: `${label} Utilization`,
        data: data.data,
        borderColor: color,
        backgroundColor: `${color}20`,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM dd',
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          callback: (value) => `${value}%`,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  if (isFullWidth) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-8 h-8" style={{ color }} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{label} Utilization</h3>
              <p className="text-sm text-gray-600">Historical performance analysis</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatsCard label="Current" value={data.stats.current.toFixed(1)} icon={Activity} trend={data.stats.trend} />
          <StatsCard label="Average" value={data.stats.avg.toFixed(1)} icon={TrendingUp} />
          <StatsCard label="Peak" value={data.stats.max.toFixed(1)} icon={AlertCircle} />
          <StatsCard label="Minimum" value={data.stats.min.toFixed(1)} icon={TrendingDown} />
        </div>
        
        <div className="flex-1 min-h-[400px]">
          <Chart
            type="line"
            data={chartData}
            options={options}
            fallbackMessage="No historical data available"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{label} Utilization</h3>
      </div>
      
      <div className="flex-1 min-h-0">
        <Chart
          type="line"
          data={chartData}
          options={options}
          fallbackMessage="No historical data available"
        />
      </div>
    </div>
  );
};

/* =============================================================================
   MAIN COMPONENT
   ============================================================================= */

export default function ResourceMonitor({ onCancel }) {
  // State
  const [selectedNttnId, setSelectedNttnId] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedResource, setSelectedResource] = useState('all');
  
  const [liveData, setLiveData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Derived state
  const isHistoricalMode = !!(startDate && endDate && selectedNttnId);
  const partnerDetails = selectedNttnId ? MOCK_PARTNER_DATA[selectedNttnId] : null;
  const isFullWidth = selectedResource !== 'all';
  
  // Fetch live data
  const fetchLiveData = useCallback(async (id) => {
    if (!id) return;
    const data = await simulateFetchLiveData(id);
    setLiveData(data);
    setLastUpdate(new Date());
  }, []);
  
  // Fetch historical data
  const fetchHistoricalData = useCallback(async (id, start, end) => {
    if (!id || !start || !end) return;
    setIsLoading(true);
    const data = await simulateFetchHistoricalData(id, start, end);
    setHistoricalData(data);
    setIsLoading(false);
  }, []);
  
  // Effect: Initial load and live polling
  useEffect(() => {
    if (!selectedNttnId) {
      setLiveData(null);
      setHistoricalData(null);
      return;
    }
    
    if (isHistoricalMode) {
      setLiveData(null);
      fetchHistoricalData(selectedNttnId, startDate, endDate);
      return;
    }
    
    // Live mode: initial fetch + polling
    fetchLiveData(selectedNttnId);
    const interval = setInterval(() => {
      fetchLiveData(selectedNttnId);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [selectedNttnId, isHistoricalMode, startDate, endDate, fetchLiveData, fetchHistoricalData]);
  
  // Handlers
  const handleNttnChange = (value) => {
    setSelectedNttnId(value);
    setDateRange([null, null]);
    setHistoricalData(null);
  };
  
  const handleClearDates = () => {
    setDateRange([null, null]);
    setHistoricalData(null);
  };
  
  const handleRefresh = () => {
    if (isHistoricalMode) {
      fetchHistoricalData(selectedNttnId, startDate, endDate);
    } else if (selectedNttnId) {
      fetchLiveData(selectedNttnId);
    }
  };
  
  // Format date helpers
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const today = new Date();
  
  // Get resource config
  const getResourceConfig = (type) => {
    const configs = {
      cpu: { color: '#3b82f6', icon: Cpu, label: 'CPU' },
      memory: { color: '#f59e0b', icon: Server, label: 'Memory' },
      ram: { color: '#10b981', icon: HardDrive, label: 'RAM' },
    };
    return configs[type];
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full mx-auto p-6 space-y-6">
        
        {/* Header */}
        <header className="pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Resource Monitoring Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            {isHistoricalMode 
              ? `Historical analysis: ${formatDate(startDate)} - ${formatDate(endDate)}`
              : selectedNttnId 
                ? 'Real-time monitoring with 5-second auto-refresh'
                : 'Select an NTTN link to begin monitoring'
            }
          </p>
          {lastUpdate && !isHistoricalMode && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </header>
        
        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* NTTN Link Selector */}
            <div className="lg:col-span-1">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                NTTN Link ID
              </label>
              <Select
                value={selectedNttnId}
                onChange={handleNttnChange}
                options={MOCK_NTTN_OPTIONS}
                placeholder="Select NTTN Link"
              />
            </div>
            
            {/* Resource Filter */}
            <div className="lg:col-span-1">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Resource View
              </label>
              <Select
                value={selectedResource}
                onChange={setSelectedResource}
                options={RESOURCE_OPTIONS}
                placeholder="Select Resource"
                disabled={!selectedNttnId}
              />
            </div>
            
            {/* Date Range Picker */}
            <div className="lg:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Date Range (Optional)
              </label>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                maxDate={today}
                disabled={!selectedNttnId}
                placeholderText="Select date range"
                dateFormat="MMM dd, yyyy"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm
                           text-gray-900 text-sm font-medium
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           disabled:bg-gray-100 disabled:cursor-not-allowed
                           transition-colors duration-200"
                isClearable
              />
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 opacity-0">Actions</label>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  icon={Calendar}
                  onClick={handleClearDates}
                  disabled={!startDate && !endDate}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  icon={RefreshCw}
                  onClick={handleRefresh}
                  disabled={!selectedNttnId}
                  className="flex-1"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Partner Information */}
        {partnerDetails && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              {/* <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div> */}
              <h2 className="text-xl font-bold text-gray-900">Partner Information</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <InfoCard label="NTTN Provider" value={partnerDetails.nttn_provider} />
              <InfoCard label="Partner Name" value={partnerDetails.partner_name} />
              <InfoCard label="SBU" value={partnerDetails.sbu} />
              <InfoCard label="Aggregator" value={partnerDetails.aggregator} />
              <InfoCard label="Business KAM" value={partnerDetails.business_kam} />
              <InfoCard label="Purchased Capacity" value={partnerDetails.purchased_capacity} />
            </div>
          </div>
        )}
        
        {/* Visualization Section */}
        {selectedNttnId && (
          <div className="space-y-6">
            
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div> */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">System Resource Utilization</h2>
                  <p className="text-sm text-gray-600">
                    {isHistoricalMode ? 'Historical trends over selected period' : 'Current usage metrics'}
                  </p>
                </div>
              </div>
              
              <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                isHistoricalMode 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {isHistoricalMode ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Historical Mode
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Live Mode
                  </>
                )}
              </div>
            </div>
            
            {/* Historical Mode: Line Charts */}
            {isHistoricalMode && (
              <>
                {isLoading ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
                    <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                    <p className="text-lg font-semibold text-gray-900">Loading historical data...</p>
                    <p className="text-sm text-gray-500">This may take a few moments</p>
                  </div>
                ) : historicalData ? (
                  <div className={isFullWidth ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
                    {(selectedResource === 'all' || selectedResource === 'cpu') && (
                      <div className={isFullWidth ? "w-full" : "h-96"}>
                        <LineChart
                          data={historicalData.cpu}
                          label="CPU"
                          color="#3b82f6"
                          icon={Cpu}
                          isFullWidth={isFullWidth && selectedResource === 'cpu'}
                        />
                      </div>
                    )}
                    {(selectedResource === 'all' || selectedResource === 'memory') && (
                      <div className={isFullWidth ? "w-full" : "h-96"}>
                        <LineChart
                          data={historicalData.memory}
                          label="Memory"
                          color="#f59e0b"
                          icon={Server}
                          isFullWidth={isFullWidth && selectedResource === 'memory'}
                        />
                      </div>
                    )}
                    {(selectedResource === 'all' || selectedResource === 'ram') && (
                      <div className={isFullWidth ? "w-full" : "h-96"}>
                        <LineChart
                          data={historicalData.ram}
                          label="RAM"
                          color="#10b981"
                          icon={HardDrive}
                          isFullWidth={isFullWidth && selectedResource === 'ram'}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            )}
            
            {/* Live Mode: Radial Gauges */}
            {!isHistoricalMode && (
              <>
                {!liveData ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
                    <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                    <p className="text-lg font-semibold text-gray-900">Loading live data...</p>
                  </div>
                ) : (
                  <div className={isFullWidth ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                    {(selectedResource === 'all' || selectedResource === 'cpu') && (
                      <RadialGauge
                        value={liveData.cpu_utilization}
                        label="CPU"
                        icon={Cpu}
                        color="#3b82f6"
                        isFullWidth={isFullWidth && selectedResource === 'cpu'}
                      />
                    )}
                    {(selectedResource === 'all' || selectedResource === 'memory') && (
                      <RadialGauge
                        value={liveData.memory_utilization}
                        label="Memory"
                        icon={Server}
                        color="#f59e0b"
                        isFullWidth={isFullWidth && selectedResource === 'memory'}
                      />
                    )}
                    {(selectedResource === 'all' || selectedResource === 'ram') && (
                      <RadialGauge
                        value={liveData.ram_utilization}
                        label="RAM"
                        icon={HardDrive}
                        color="#10b981"
                        isFullWidth={isFullWidth && selectedResource === 'ram'}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Empty State */}
        {!selectedNttnId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <Activity className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No NTTN Link Selected</h3>
            <p className="text-gray-600 max-w-md">
              Select an NTTN link from the dropdown above to begin monitoring resource utilization in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}