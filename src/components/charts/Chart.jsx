// src/components/Chart.jsx
import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import clsx from 'clsx';
import Button from '../ui/Button'
import { SlidersHorizontal, X, Download } from 'lucide-react';
import { useOutside } from '../../hooks/useOutside';
import FilterMenu from '../table/FilterMenu';

ChartJS.register(...registerables, annotationPlugin);

const Chart = forwardRef(
  (
    {
      type,
      data,
      options,
      className,
      fallbackMessage = 'No data to display.',
      chartOptionsComponent,
      annotations = [],
      animationDuration = 1000,
      tooltipCallback,
      initialLoading = false,
      filterColumns,
      onFilterChange,
      filterMenuProps = {},
      onClick, // 👈 New onClick prop
    },
    ref
  ) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const optionsDrawerRef = useRef(null);
    const [isOptionsDrawerOpen, setIsOptionsDrawerOpen] = useState(false);
    const [chartLoaded, setChartLoaded] = useState(false);
    useOutside(optionsDrawerRef, () => setIsOptionsDrawerOpen(false));

    const hasData = useMemo(() => {
      if (!data || !data.datasets || data.datasets.length === 0) return false;
      return data.datasets.some(dataset =>
        Array.isArray(dataset.data) &&
        dataset.data.some(v => v !== null && v !== undefined && !Number.isNaN(Number(v)))
      );
    }, [data]);

    const handleSaveChart = useCallback(() => {
      if (chartInstanceRef.current) {
        const chart = chartInstanceRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = chart.width;
        tempCanvas.height = chart.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(chart.canvas, 0, 0);
        const url = tempCanvas.toDataURL('image/png', 1);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chart.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, []);

    // Updated onClick handler
    const handleClick = useCallback((event) => {
      if (!onClick || !chartInstanceRef.current) return;

      const chart = chartInstanceRef.current;
      const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

      if (elements.length > 0) {
        const firstElement = elements[0];
        const dataIndex = firstElement.index;
        const datasetIndex = firstElement.datasetIndex;
        const value = chart.data.datasets[datasetIndex].data[dataIndex];
        const label = chart.data.labels[dataIndex];

        onClick({ dataIndex, datasetIndex, value, label });
      }
    }, [onClick]);

    useEffect(() => {
      const cleanup = () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
      };

      if (!chartRef.current) {
        cleanup();
        setChartLoaded(false);
        return;
      }

      const ctx = chartRef.current.getContext('2d');

      if (!hasData) {
        cleanup();
        setChartLoaded(false);
        return;
      }

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: animationDuration,
          easing: 'easeOutQuart',
          onComplete: () => {
            setChartLoaded(true);
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#111827' },
          },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#111827',
            bodyColor: '#111827',
            borderColor: '#d1d5db',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: tooltipCallback,
          },
          annotation: { annotations: annotations },
        },
        scales: {
          x: {
            grid: { color: '#e5e7eb' },
            ticks: { color: '#111827' },
            title: { color: '#111827' },
          },
          y: {
            grid: { color: '#e5e7eb' },
            ticks: { color: '#111827' },
            title: { color: '#111827' },
          },
        },
        ...options,
        // Pass the new onClick handler to Chart.js options
        onClick: handleClick,
      };

      if (chartInstanceRef.current) {
        chartInstanceRef.current.data = data;
        chartInstanceRef.current.options = chartOptions;
        chartInstanceRef.current.update();
        setChartLoaded(true);
      } else {
        chartInstanceRef.current = new ChartJS(ctx, {
          type: type,
          data: data,
          options: chartOptions,
        });
        setChartLoaded(true);
      }
      return cleanup;
    }, [
      type,
      data,
      options,
      hasData,
      annotations,
      animationDuration,
      tooltipCallback,
      handleClick
    ]);

    useImperativeHandle(ref, () => ({
      getChartInstance: () => chartInstanceRef.current,
      saveAsImage: handleSaveChart,
    }));

    const showFallback = useMemo(() => !hasData && !initialLoading, [hasData, initialLoading]);

    return (
      <div className={clsx('relative w-full h-full bg-white', className)}>
        {/* <Button onClick={handleSaveChart} leftIcon={Download} variant="icon" title="Download Chart">
          Download
        </Button> */}
        {filterColumns && onFilterChange && (
          <FilterMenu
            columns={filterColumns}
            onFilterChange={onFilterChange}
            {...filterMenuProps}
          />
        )}
        <div className="absolute top-2 right-2 flex space-x-2 z-10">

          {chartOptionsComponent && (
            <Button
              onClick={() => setIsOptionsDrawerOpen(true)}
              leftIcon={SlidersHorizontal}
              variant="icon"
              title="Chart Options"
            >
              Parameters
            </Button>
          )}
        </div>
        {initialLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : showFallback ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
            <p className="text-lg font-semibold">{fallbackMessage}</p>
            <p className="text-sm mt-2">Check your data source or filters.</p>
          </div>
        ) : (
          <div className="relative h-full w-full p-2" style={{ visibility: chartLoaded ? 'visible' : 'hidden' }}>
            <canvas ref={chartRef} />
          </div>
        )}
        {isOptionsDrawerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setIsOptionsDrawerOpen(false)}
          ></div>
        )}
        <div
          ref={optionsDrawerRef}
          className={clsx(
            'fixed bottom-0 left-0 right-0 h-[33%] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col rounded-t-lg',
            isOptionsDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          <div className="flex-none flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <SlidersHorizontal className="h-5 w-5" /> Chart Options
            </h2>
            <Button onClick={() => setIsOptionsDrawerOpen(false)} variant="icon" size="sm" title="Close Options">
              <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">{chartOptionsComponent}</div>
        </div>
      </div>
    );
  }
);
Chart.displayName = 'Chart';
export default Chart;