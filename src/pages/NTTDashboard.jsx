
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { eachMonthOfInterval, format, parseISO, isValid, addDays } from 'date-fns';
import Chart from '../components/ui/elements/Chart';
import DateField from '../components/ui/fields/DateField';
import SelectField from '../components/ui/fields/SelectField';
import { fetchSurveysByDateRange } from '../services/survey';
import { fetchWorkOrdersLaravel } from '../services/workOrder';
import { fetchNTTNs } from '../services/nttn';
import { fetchCategories } from '../services/category';
import { fetchBWModifications } from '../services/bwModification';
import {
  MapPin, Users, TrendingUp, PieChart, Briefcase, FileText, Zap,
} from 'lucide-react';

/* ---------- tiny helpers and constants ---------- */
const genColors = (n) => {
  const base = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
  return Array.from({ length: n }, (_, i) => base[i % base.length]);
};

const today = new Date();
const sixtyDaysAgo = addDays(today, -60);
const thirtyDaysAgo = addDays(today, -30);
const twoMonthsAgo = addDays(today, -60); // Used for initial chart range

// --- UTILITY FUNCTION FOR DATE VALIDATION ---
const isDateRangeValid = (dates) => {
  return dates.length === 2 && dates[0] instanceof Date && dates[1] instanceof Date;
};

/* ---------- reusable skeletons ---------- */
const CardSkeleton = () => <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />;
const ChartSkeleton = () => <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse" />;

/* ---------- stat-card component ---------- */
const StatCard = ({ title, value, icon, change = null }) => (
  <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200 flex items-center text-left w-full">
    <div className="p-3 mr-4 rounded-full bg-indigo-50 text-indigo-600">{icon}</div>
    <div>
      <h2 className="text-sm font-semibold text-gray-500 mb-1">{title}</h2>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      {change != null && (
        <span
          className={`text-xs font-semibold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-400'
            }`}
        >
          {change > 0 ? '↑' : change < 0 ? '↓' : ''} {Math.abs(change)}%
        </span>
      )}
    </div>
  </div>
);

/* ================================================================== */
/* 1.  Survey-by-NTTN chart (DECENTRALIZED FETCHING)                   */
/* ================================================================== */
function SurveyByNttnChart() {
  const [raw, setRaw] = useState([]);
  const [nttns, setNttns] = useState([]);
  const [dates, setDates] = useState([twoMonthsAgo, today]);
  const [nttnId, setNttnId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!isDateRangeValid(dates)) {
      if (!loading) setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([fetchSurveysByDateRange(dates[0], dates[1]), fetchNTTNs()])
      .then(([surveyResponse, nList]) => {
        const surveys = Array.isArray(surveyResponse) ? surveyResponse : surveyResponse.data || [];
        const finalNttns = Array.isArray(nList) ? nList : nList.data || [];
        setRaw(surveys);
        setNttns(finalNttns);
      })
      .finally(() => setLoading(false));
  }, [dates]);

  const filterColumns = useMemo(() => [
    { key: 'dates', header: 'Submission period', field: DateField, fieldProps: { placeholder: 'Select range', floating: true } },
    {
      key: 'nttn_id', header: 'NTTN', field: SelectField, fieldProps: {
        placeholder: 'All NTTN', floating: true,
        options: [{ value: '' }, ...nttns.map(n => ({ label: n.nttn_name, value: n.id }))],
      }
    },
  ], [nttns]);

  const onFilterChange = useCallback((vals) => {
    const fallback = [twoMonthsAgo, today];          // <<< hard-coded fallback
    if (vals.dates === null || vals.dates === undefined || (Array.isArray(vals.dates) && vals.dates.length < 2)) {
      setDates(fallback);
    } else if (vals.dates?.length === 2) {
      setDates(vals.dates);
    }
    setNttnId(
      vals.nttn_id === '' || vals.nttn_id === null || vals.nttn_id === undefined
        ? null
        : vals.nttn_id
    );
  }, []);

  const data = useMemo(() => {
    if (!raw.length || !nttns.length) return null;
    const months = eachMonthOfInterval({ start: dates[0], end: dates[1] });
    const labels = months.map(d => format(d, 'yyyy-MM'));
    const filtered = nttnId ? raw.filter(s => String(s.nttn_id) === String(nttnId)) : raw;

    const counts = {};
    filtered.forEach(s => {
      const d = parseISO(s.submition || s.created_at);
      if (!isValid(d)) return;
      const key = format(d, 'yyyy-MM');
      counts[s.nttn_id] = counts[s.nttn_id] || {};
      counts[s.nttn_id][key] = (counts[s.nttn_id][key] || 0) + 1;
    });

    const colors = genColors(nttns.length);
    const datasets = nttns.map((n, idx) => ({
      label: n.nttn_name,
      data: labels.map(mon => counts[n.id]?.[mon] || 0),
      backgroundColor: colors[idx],
      borderRadius: 2,
      barPercentage: 0.8,
    }));
    return { labels, datasets };
  }, [raw, nttns, dates, nttnId]);

  const onChartClick = useCallback(
    ({ dataIndex, datasetIndex, value, label }) => {
      const month = label;
      const nttnName = data.datasets[datasetIndex].label;
      alert(`Survey: ${nttnName} in ${month} → ${value} submissions`);
    },
    [data]
  );

  return (
    <div className="relative h-[450px] bg-white rounded-xl shadow-md p-10 flex flex-col">
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        Survey by NTTN
      </h2>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <Chart
            type="bar"
            data={data}
            onClick={onChartClick}
            fallbackMessage="No surveys for the selected period"
            filterColumns={filterColumns}
            onFilterChange={onFilterChange}
            options={{
              indexAxis: 'x',
              interaction: { mode: 'index', intersect: false },
              plugins: { legend: { position: 'bottom' } },
              scales: {
                x: { grid: { color: 'rgba(243,244,246,0.8)' }, title: { display: true, text: 'Month' } },
                y: { grid: { color: 'rgba(243,244,246,0.8)' }, title: { display: true, text: 'Survey count' } },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 2.  Work-Orders by NTTN  ( Survey-by-NTTN pattern, WO data )        */
/* ================================================================== */
function WorkOrderByNttnChart() {
  const [raw, setRaw] = useState([]);
  const [nttns, setNttns] = useState([]);
  const [dates, setDates] = useState([twoMonthsAgo, today]);
  const [nttnId, setNttnId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isDateRangeValid(dates)) {
      if (!loading) setLoading(false);
      return;
    }

    setLoading(true);

    const dateFilter = {
      created_at: [dates[0].toISOString().slice(0, 10), dates[1].toISOString().slice(0, 10)],
    };

    Promise.all([fetchWorkOrdersLaravel(dateFilter), fetchNTTNs()])
      .then(([ordersResponse, nList]) => {
        const orders = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse.data || [];
        const finalNttns = Array.isArray(nList) ? nList : nList.data || [];
        setRaw(orders);
        setNttns(finalNttns);
      })
      .finally(() => setLoading(false));
  }, [dates]);

  const filterColumns = useMemo(() => [
    { key: 'dates', header: 'Submission period', field: DateField, fieldProps: { placeholder: 'Select range', floating: true } },
    {
      key: 'nttn_id', header: 'NTTN', field: SelectField, fieldProps: {
        placeholder: 'All NTTN', floating: true,
        options: [{ value: '' }, ...nttns.map(n => ({ label: n.nttn_name, value: n.id }))],
      }
    },
  ], [nttns]);

  const onFilterChange = useCallback((vals) => {
    const fallback = [twoMonthsAgo, today];
    if (vals.dates === null || vals.dates === undefined || (Array.isArray(vals.dates) && vals.dates.length < 2)) {
      setDates(fallback);
    } else if (vals.dates?.length === 2) {
      setDates(vals.dates);
    }
    setNttnId(
      vals.nttn_id === '' || vals.nttn_id === null || vals.nttn_id === undefined
        ? null
        : vals.nttn_id
    );
  }, []);

  const data = useMemo(() => {
    // ... (rest of the setup code)
    if (!raw.length || !nttns.length) return null;
    const months = eachMonthOfInterval({ start: dates[0], end: dates[1] });
    const labels = months.map(d => format(d, 'yyyy-MM'));

    const filtered = raw;

    const counts = {};
    filtered.forEach(w => {
      // 💡 THE FIX: Get the nttn_id from the nested survey_data
      const nttnIdKey = w.survey_data ? w.survey_data.nttn_id : w.nttn_id;

      // Fallback check, though your API data suggests it's in survey_data
      if (!nttnIdKey) {
        console.warn('Skipping Work Order, missing NTTN ID:', w.id);
        return;
      }

      // Use the work order date fields, prioritizing service_handover or requested_delivery
      const d = parseISO(w.service_handover || w.requested_delivery || w.submition || w.created_at);
      if (!isValid(d)) return;
      const key = format(d, 'yyyy-MM');

      // Use the corrected nttnIdKey for grouping
      counts[nttnIdKey] = counts[nttnIdKey] || {};
      counts[nttnIdKey][key] = (counts[nttnIdKey][key] || 0) + 1;
    });

    // ... (rest of the datasets mapping code)

    const colors = genColors(nttns.length);
    const datasets = nttns
      .filter(n => nttnId === null || String(n.id) === String(nttnId))
      .map((n, idx) => ({
        label: n.nttn_name,
        // The n.id here must match the key used in 'counts'
        data: labels.map(mon => counts[n.id]?.[mon] || 0),
        backgroundColor: colors[idx],
        borderRadius: 2,
        barPercentage: 0.8,
      }));
    return { labels, datasets };
  }, [raw, nttns, dates, nttnId]);

  const onChartClick = useCallback(
    ({ dataIndex, datasetIndex, value, label }) => {
      const month = label;
      const nttnName = data.datasets[datasetIndex].label;
      alert(`Work Orders: ${nttnName} in ${month} → ${value} submissions`);
    },
    [data]
  );

  return (
    <div className="relative h-[450px] bg-white rounded-xl shadow-md p-10 flex flex-col">
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        <Briefcase className="w-5 h-5 mr-2" />
        Work Orders by NTTN
      </h2>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <Chart
            type="bar"
            data={data}
            onClick={onChartClick}
            fallbackMessage="No work orders for the selected period"
            filterColumns={filterColumns}
            onFilterChange={onFilterChange}
            options={{
              indexAxis: 'x',
              interaction: { mode: 'index', intersect: false },
              plugins: { legend: { position: 'bottom' } },
              scales: {
                x: { grid: { color: 'rgba(243,244,246,0.8)' }, title: { display: true, text: 'Month' } },
                y: { grid: { color: 'rgba(243,244,246,0.8)' }, title: { display: true, text: 'Work Order count' } },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 3.  Survey vs. Work-Order Chart (DECENTRALIZED FETCHING)           */
/* ================================================================== */
function SurveyVsWorkOrderChart() {
  const [surveyResponse, setSurveyResponse] = useState(null);
  const [workOrderResponse, setWorkOrderResponse] = useState(null);
  const [dates, setDates] = useState([twoMonthsAgo, today]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isDateRangeValid(dates)) {
      if (!loading) setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch surveys by date range; fetch work orders broadly (for client-side filtering)
    Promise.all([
      fetchSurveysByDateRange(dates[0], dates[1]),
      fetchWorkOrdersLaravel(),
    ])
      .then(([surveysResp, ordersResp]) => {
        setSurveyResponse(surveysResp);
        setWorkOrderResponse(ordersResp);
      })
      .catch((error) => console.error("Error fetching comparison data:", error))
      .finally(() => setLoading(false));
  }, [dates]);

  const filterColumns = useMemo(() => [
    { key: 'dates', header: 'Period', field: DateField, fieldProps: { placeholder: 'Select range', floating: true } },
  ], []);

  const onFilterChange = useCallback((vals) => {
    const fallback = [twoMonthsAgo, today];
    if (vals.dates === null || vals.dates === undefined || (Array.isArray(vals.dates) && vals.dates.length < 2)) {
      setDates(fallback);
    } else if (vals.dates?.length === 2) {
      setDates(vals.dates);
    }
  }, []);

  const data = useMemo(() => {
    const rawSurveys = surveyResponse?.data || (Array.isArray(surveyResponse) ? surveyResponse : []);
    const allWorkOrders = workOrderResponse?.data || (Array.isArray(workOrderResponse) ? workOrderResponse : []);

    if (!rawSurveys.length && !allWorkOrders.length) return null;

    const months = eachMonthOfInterval({ start: dates[0], end: dates[1] });
    const labels = months.map(d => format(d, 'yyyy-MM'));

    // Filter work orders to the selected date range
    const rawWorkOrders = allWorkOrders.filter(w => {
      const d = parseISO(w.requested_delivery || w.service_handover || w.submition || w.created_at);
      return isValid(d) && d >= dates[0] && d <= dates[1];
    });

    const surveyCounts = rawSurveys.reduce((acc, s) => {
      const d = parseISO(s.submition || s.created_at);
      if (!isValid(d)) return acc;
      const key = format(d, 'yyyy-MM');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const workOrderCounts = rawWorkOrders.reduce((acc, w) => {
      const d = parseISO(w.requested_delivery || w.service_handover || w.submition || w.created_at);
      if (!isValid(d)) return acc;
      const key = format(d, 'yyyy-MM');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const surveyDataset = { label: 'Total Surveys', data: labels.map(mon => surveyCounts[mon] || 0), backgroundColor: '#3b82f6', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 4, categoryPercentage: 0.6, barPercentage: 0.8, };
    const workOrderDataset = { label: 'Total Work Orders', data: labels.map(mon => workOrderCounts[mon] || 0), backgroundColor: '#10b981', borderColor: '#10b981', borderWidth: 1, borderRadius: 4, categoryPercentage: 0.6, barPercentage: 0.8, };

    return { labels, datasets: [surveyDataset, workOrderDataset] };
  }, [surveyResponse, workOrderResponse, dates]);

  const onChartClick = useCallback(
    ({ datasetIndex, value, label }) => {
      const type = data.datasets[datasetIndex].label;
      alert(`${type} in ${label}: ${value} recorded.`);
    },
    [data]
  );

  return (
    <div className="relative h-[450px] bg-white rounded-xl shadow-md p-10 flex flex-col">
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Monthly Survey vs. Work Order Comparison
      </h2>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <Chart
            type="bar"
            data={data}
            onClick={onChartClick}
            fallbackMessage="No data to compare for the selected period"
            filterColumns={filterColumns}
            onFilterChange={onFilterChange}
            options={{
              indexAxis: 'x',
              interaction: { mode: 'group', intersect: false },
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { grid: { color: 'rgba(243,244,246,0.8)' }, title: { display: true, text: 'Month' } },
                y: { grid: { color: 'rgba(243,244,246,0.8)' }, title: { display: true, text: 'Count' }, beginAtZero: true, },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}


/* ================================================================== */
/* 4.  BW Modification Chart (DECENTRALIZED FETCHING)                 */
/* ================================================================== */
function BWModificationChart() {
  const [rawResponse, setRawResponse] = useState(null);
  const [dates, setDates] = useState([twoMonthsAgo, today]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isDateRangeValid(dates)) {
      if (!loading) setLoading(false);
      return;
    }

    setLoading(true);

    const start = dates[0].toISOString().slice(0, 10);
    const end = dates[1].toISOString().slice(0, 10);

    // Assuming fetchBWModifications takes a filter object
    fetchBWModifications({ modification_date: [start, end] })
      .then(setRawResponse)
      .catch((error) => {
        console.error("Error fetching BW Modification data:", error);
        setRawResponse(null);
      })
      .finally(() => setLoading(false));
  }, [dates]);

  const filterColumns = useMemo(() => [
    { key: 'dates', header: 'Period', field: DateField, fieldProps: { placeholder: 'Select range', floating: true } },
  ], []);

  const onFilterChange = useCallback((vals) => {
    const fallback = [twoMonthsAgo, today];
    if (vals.dates === null || vals.dates === undefined || (Array.isArray(vals.dates) && vals.dates.length < 2)) {
      setDates(fallback);
    } else if (vals.dates?.length === 2) {
      setDates(vals.dates);
    }
  }, []);

  const data = useMemo(() => {
    const rawData = rawResponse?.data || (Array.isArray(rawResponse) ? rawResponse : []);

    if (!rawData.length) return null;

    const months = eachMonthOfInterval({ start: dates[0], end: dates[1] });
    const labels = months.map(d => format(d, 'yyyy-MM'));

    const aggregatedCounts = rawData.reduce((acc, item) => {
      const date = parseISO(item.created_at);
      if (!isValid(date)) return acc;

      const monthKey = format(date, 'yyyy-MM');
      const type = item.modification_type;

      if (type) {
        acc[type] = acc[type] || {};
        acc[type][monthKey] = (acc[type][monthKey] || 0) + 1;
      }
      return acc;
    }, {});

    const upgradeDataset = { label: 'Total Upgrades', data: labels.map(mon => aggregatedCounts['Upgrade']?.[mon] || 0), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: true, tension: 0.4, };
    const downgradeDataset = { label: 'Total Downgrades', data: labels.map(mon => aggregatedCounts['Downgrade']?.[mon] || 0), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', fill: true, tension: 0.4, };

    const datasets = [upgradeDataset, downgradeDataset].filter(d => d.data.length > 0);

    return { labels, datasets };
  }, [rawResponse, dates]);

  const onChartClick = useCallback(
    ({ datasetIndex, value, label }) => {
      const type = data.datasets[datasetIndex].label;
      alert(`${type} in ${label}: ${value} recorded.`);
    },
    [data]
  );

  return (
    <div className="relative h-[450px] bg-white rounded-xl shadow-md p-10 flex flex-col">
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        <Zap className="w-5 h-5 mr-2" />
        Monthly Bandwidth Modifications
      </h2>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <Chart
            type="line"
            data={data}
            onClick={onChartClick}
            fallbackMessage="No bandwidth modification data found for this period"
            filterColumns={filterColumns}
            onFilterChange={onFilterChange}
            options={{
              interaction: { mode: 'index', intersect: false },
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { grid: { color: 'rgba(243,244,246,0.8)' }, title: { display: true, text: 'Month' } },
                y: { grid: { color: 'rgba(243,244,246,0.8)' }, title: { display: true, text: 'Count' }, beginAtZero: true, },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}




/* ================================================================== */
/* 5.  Work-Orders by Client Category (30 Days) - UPDATED            */
/* ================================================================== */
function WorkOrderByClientCategoryChart() {
  const [rawWorkOrders, setRawWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fixed date range for the last 30 days
  const dateRange = useMemo(() => [thirtyDaysAgo, today], []);

  useEffect(() => {
    setLoading(true);
    
    // Fetch work orders broadly for client-side filtering
    fetchWorkOrdersLaravel()
      .then((ordersResp) => {
        const orders = Array.isArray(ordersResp) ? ordersResp : ordersResp.data || [];
        setRawWorkOrders(orders);
      })
      .finally(() => setLoading(false));
  }, []);

  const data = useMemo(() => {
    if (!rawWorkOrders.length) return null;

    const start = dateRange[0].getTime();
    const end = dateRange[1].getTime();

    // 1. Filter work orders to the last 30 days using service_handover or created_at
    const filteredOrders = rawWorkOrders.filter(w => {
      const d = parseISO(w.service_handover || w.created_at);
      if (!isValid(d)) return false;
      const time = d.getTime();
      return time >= start && time <= end;
    });

    if (!filteredOrders.length) return null;

    // 2. Count by Category Name - using cat_name from the API response
    const counts = filteredOrders.reduce((acc, w) => {
      const categoryName = w.cat_name;
      if (categoryName && categoryName.trim()) {
        const key = categoryName.trim();
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    // 3. Prepare Chart Data
    const chartLabels = Object.keys(counts);
    const chartData = Object.values(counts);
    const total = chartData.reduce((sum, count) => sum + count, 0);

    // Add percentage to labels
    const labelsWithPercentage = chartLabels.map((label, index) => {
      const percentage = total > 0 ? ((chartData[index] / total) * 100).toFixed(1) : 0;
      return `${label} (${percentage}%)`;
    });

    return {
      labels: labelsWithPercentage,
      datasets: [{
        data: chartData,
        backgroundColor: genColors(chartLabels.length),
        hoverOffset: 4,
      }]
    };
  }, [rawWorkOrders, dateRange]);

  // Custom tooltip to show count and percentage
  const chartOptions = useMemo(() => ({
    plugins: {
      legend: { 
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            // Remove the percentage from label since we'll show it in tooltip
            const cleanLabel = label.substring(0, label.lastIndexOf(' ('));
            
            return [
              `Category: ${cleanLabel}`,
              `Count: ${value}`,
              `Percentage: ${percentage}%`
            ];
          }
        }
      }
    },
    maintainAspectRatio: false,
  }), []);

  return (
    <div className="relative h-[450px] bg-white rounded-xl shadow-md p-10 flex flex-col">
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        <PieChart className="w-5 h-5 mr-2" />
        Work Orders by Client Category (30 Days)
      </h2>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <Chart
            type="pie"
            data={data}
            fallbackMessage="No work orders found in the last 30 days"
            options={chartOptions}
          />
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 6.  Surveys by Client Category (30 Days) - UPDATED                */
/* ================================================================== */
function SurveyByClientCategoryChart() {
  const [rawSurveys, setRawSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fixed date range for the last 30 days
  const dateRange = useMemo(() => [thirtyDaysAgo, today], []);

  useEffect(() => {
    setLoading(true);
    
    // Fetch surveys for the last 30 days
    fetchSurveysByDateRange(dateRange[0], dateRange[1])
      .then((surveysResp) => {
        const surveys = Array.isArray(surveysResp) ? surveysResp : surveysResp.data || [];
        setRawSurveys(surveys);
      })
      .finally(() => setLoading(false));
  }, []);

  const data = useMemo(() => {
    if (!rawSurveys.length) return null;

    // 1. Surveys are already filtered by date range from the API
    // 2. Count by Category Name - using cat_name from the API response
    const counts = rawSurveys.reduce((acc, survey) => {
      const categoryName = survey.cat_name;
      if (categoryName && categoryName.trim()) {
        const key = categoryName.trim();
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    // 3. Prepare Chart Data
    const chartLabels = Object.keys(counts);
    const chartData = Object.values(counts);
    const total = chartData.reduce((sum, count) => sum + count, 0);

    // Add percentage to labels
    const labelsWithPercentage = chartLabels.map((label, index) => {
      const percentage = total > 0 ? ((chartData[index] / total) * 100).toFixed(1) : 0;
      return `${label} (${percentage}%)`;
    });

    return {
      labels: labelsWithPercentage,
      datasets: [{
        data: chartData,
        backgroundColor: genColors(chartLabels.length),
        hoverOffset: 4,
        borderWidth: 2,
        borderColor: '#fff',
      }]
    };
  }, [rawSurveys]);

  const chartOptions = useMemo(() => ({
    plugins: {
      legend: { 
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            // Remove the percentage from label for cleaner tooltip
            const cleanLabel = label.substring(0, label.lastIndexOf(' ('));
            
            return [
              `Category: ${cleanLabel}`,
              `Surveys: ${value}`,
              `Percentage: ${percentage}%`
            ];
          }
        }
      }
    },
    maintainAspectRatio: false,
    cutout: '50%', // Makes it a doughnut chart
  }), []);

  return (
    <div className="relative h-[450px] bg-white rounded-xl shadow-md p-10 flex flex-col">
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        <PieChart className="w-5 h-5 mr-2" />
        Surveys by Client Category (30 Days)
      </h2>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <Chart
            type="doughnut"
            data={data}
            fallbackMessage="No surveys found in the last 30 days"
            options={chartOptions}
          />
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* HOOK: Unified Data Fetching for Stat Cards (FULL PAGE LOADER)      */
/* ================================================================== */
function useDashboardData() {
  const [data, setData] = useState({ surveys: [], workOrders: [], nttns: [], categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch 60 days of surveys for the trend calculation, and broad data for WOs/NTTNs/Categories
    Promise.all([
      fetchSurveysByDateRange(sixtyDaysAgo, today),
      fetchWorkOrdersLaravel(), // Broad fetch for trend calc
      fetchNTTNs(),
      fetchCategories(),
    ])
      .then(([sResp, wResp, nResp, cResp]) => {
        setData({
          surveys: sResp.data || sResp || [],
          workOrders: wResp.data || wResp || [],
          nttns: nResp.data || nResp || [],
          categories: cResp.data || cResp || [],
        });
      })
      .catch(error => {
        console.error("Dashboard failed to fetch initial data:", error);
        // On error, still stop loading to show the dashboard, maybe with empty data
        setData({ surveys: [], workOrders: [], nttns: [], categories: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  // --- STAT CARD CALCULATIONS ---
  const { surveys, workOrders, nttns, categories } = data;

  const [survey30, prev30] = useMemo(() => {
    const s30 = surveys.filter(s => parseISO(s.submition || s.created_at) >= thirtyDaysAgo).length;
    const p30 = surveys.filter(s => {
      const d = parseISO(s.submition || s.created_at);
      return isValid(d) && d >= sixtyDaysAgo && d < thirtyDaysAgo;
    }).length;
    return [s30, p30];
  }, [surveys]);

  const surveyChange = useMemo(() => {
    return prev30 === 0 ? (survey30 > 0 ? 100 : 0) : Math.round(((survey30 - prev30) / prev30) * 100);
  }, [survey30, prev30]);

  const wo30 = workOrders.filter(w => parseISO(w.service_handover || w.created_at) >= thirtyDaysAgo).length;
  const woPrev30 = workOrders.filter(w => {
    const d = parseISO(w.service_handover || w.created_at);
    return isValid(d) && d >= sixtyDaysAgo && d < thirtyDaysAgo;
  }).length;
  const woChange = useMemo(() => {
    return woPrev30 === 0 ? (wo30 > 0 ? 100 : 0) : Math.round(((wo30 - woPrev30) / woPrev30) * 100);
  }, [wo30, woPrev30]);

  const stats = useMemo(() => [
    { title: 'Surveys (30d)', value: survey30, icon: <FileText size={20} />, change: surveyChange },
    { title: 'Work Orders (30d)', value: wo30, icon: <Briefcase size={20} />, change: woChange },
    { title: 'Active NTTNs', value: nttns.length, icon: <MapPin size={20} />, change: null },
    { title: 'Client Categories', value: categories.length, icon: <Users size={20} />, change: null },
  ], [survey30, surveyChange, wo30, woChange, nttns.length, categories.length]);

  return { stats, loading };
}


/* ================================================================== */
/* 7.  DASHBOARD SHELL (MAIN COMPONENT)                               */
/* ================================================================== */
 const NTTDashboard =()=> {
  const { stats, loading } = useDashboardData();


  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <h1 className="text-3xl font-extrabold mb-2 text-center md:text-left">
        NTTN Survey & Work-Order Dashboard
      </h1>
      <p className="text-gray-500 mb-8 text-center md:text-left">
        Showing key metrics with trends and detailed chart breakdowns.
      </p>

      {/* ---------- stat cards (with real data and trends) ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, idx) => (
          <StatCard key={idx} title={s.title} value={s.value} icon={s.icon} change={s.change} />
        ))}
      </div>

      {/* ---------- charts row 1 & 2 (Bar/Line Charts) ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
        <SurveyByNttnChart />
        <WorkOrderByNttnChart />
        <SurveyVsWorkOrderChart />
        <BWModificationChart />
      </div>

      {/* ---------- charts row 3 (Pie Charts) - NEW CHARTS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <WorkOrderByClientCategoryChart />
        <SurveyByClientCategoryChart />
      </div>
    </div>
  );
}
export default NTTDashboard;