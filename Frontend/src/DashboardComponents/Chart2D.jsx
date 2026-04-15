import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend
);

// FIX: Wrapped the component in forwardRef to receive a ref from the parent (ChartDisplay)
const Chart2D = forwardRef(({ data, type }, ref) => {
  const chartRef = useRef(null);

  // FIX: Exposed a method to the parent component to get the raw canvas element.
  // This allows html2canvas to capture ONLY the chart, avoiding CSS parsing errors.
  useImperativeHandle(ref, () => ({
    getCanvas: () => {
      if (chartRef.current) {
        return chartRef.current.canvas;
      }
      return null;
    }
  }), []);

  // Process large datasets by sampling or aggregating
  const processedData = useMemo(() => {
    if (!data || !data.labels || !data.datasets || !data.datasets[0] || !data.datasets[0].data) {
      return {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Sample Data',
          data: [12, 19, 3, 5],
          backgroundColor: ['rgba(59, 130, 246, 0.8)','rgba(16, 185, 129, 0.8)','rgba(245, 158, 11, 0.8)','rgba(239, 68, 68, 0.8)'],
          borderColor: ['rgb(59, 130, 246)','rgb(16, 185, 129)','rgb(245, 158, 11)','rgb(239, 68, 68)'],
          borderWidth: 2
        }]
      };
    }

    let labels = data.labels;
    let datasets = data.datasets;

    // Handle large datasets (more than 50 data points)
    if (labels.length > 50) {
      if (type === 'pie') {
        const dataset = datasets[0];
        const dataWithLabels = labels.map((label, index) => ({ label, value: dataset.data[index] || 0 }));
        dataWithLabels.sort((a, b) => b.value - a.value);
        const top10 = dataWithLabels.slice(0, 10);
        const others = dataWithLabels.slice(10);
        if (others.length > 0) {
          const othersSum = others.reduce((sum, item) => sum + item.value, 0);
          top10.push({ label: `Others (${others.length})`, value: othersSum });
        }
        labels = top10.map(item => item.label);
        datasets = [{ ...dataset, data: top10.map(item => item.value) }];
      } else {
        const sampleRate = Math.ceil(labels.length / 50);
        labels = labels.filter((_, index) => index % sampleRate === 0);
        datasets = datasets.map((dataset) => ({
          ...dataset,
          data: dataset.data.filter((_, index) => index % sampleRate === 0)
        }));
      }
    }

    const colors = ['rgba(59, 130, 246, 0.8)','rgba(16, 185, 129, 0.8)','rgba(245, 158, 11, 0.8)','rgba(239, 68, 68, 0.8)','rgba(139, 92, 246, 0.8)','rgba(236, 72, 153, 0.8)','rgba(6, 182, 212, 0.8)','rgba(251, 146, 60, 0.8)'];
    const borderColors = colors.map(color => color.replace('0.8', '1'));

    return {
      labels,
      datasets: datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: type === 'pie' ? colors.slice(0, labels.length) : colors[index % colors.length],
        borderColor: type === 'pie' ? borderColors.slice(0, labels.length) : borderColors[index % borderColors.length],
        borderWidth: 2,
        ...(type === 'line' && { fill: false, tension: 0.4, pointBackgroundColor: borderColors[index % borderColors.length], pointBorderColor: '#ffffff', pointBorderWidth: 2, pointRadius: labels.length > 20 ? 2 : 4 })
      }))
    };
  }, [data, type]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { position: 'top', labels: { color: '#ffffff', font: { size: 12 }, usePointStyle: true, padding: 20 } },
      title: { display: true, text: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`, color: '#ffffff', font: { size: 16, weight: 'bold' }, padding: 20 },
      tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.9)', titleColor: '#ffffff', bodyColor: '#ffffff', callbacks: { label: (context) => `${context.dataset.label}: ${Number(context.parsed.y || context.parsed).toLocaleString()}` } }
    },
    ...(type !== 'pie' && {
      scales: {
        x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(156, 163, 175, 0.1)' } },
        y: { ticks: { color: '#9CA3AF', callback: (value) => Number(value).toLocaleString() }, grid: { color: 'rgba(156, 163, 175, 0.1)' } }
      }
    }),
  }), [type, processedData]);

  const renderChart = () => {
    switch (type) {
      case 'bar': return <Bar ref={chartRef} data={processedData} options={options} />;
      case 'line': return <Line ref={chartRef} data={processedData} options={options} />;
      case 'pie': return <Pie ref={chartRef} data={processedData} options={options} />;
      default: return <Bar ref={chartRef} data={processedData} options={options} />;
    }
  };

  return (
    <div className="w-full h-96 p-4 bg-gray-900 rounded-lg border border-gray-700">
      {renderChart()}
    </div>
  );
});

export default Chart2D;
