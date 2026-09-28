import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

ChartJS.defaults.color = '#8B8B9E';
ChartJS.defaults.borderColor = 'rgba(30, 30, 42, 0.5)';
ChartJS.defaults.font.family = 'ui-sans-serif, system-ui, sans-serif';

ChartJS.defaults.plugins.tooltip.backgroundColor = '#121218';
ChartJS.defaults.plugins.tooltip.titleColor = '#EEEEF0';
ChartJS.defaults.plugins.tooltip.bodyColor = '#8B8B9E';
ChartJS.defaults.plugins.tooltip.borderColor = '#1E1E2A';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;

ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.pointStyleWidth = 8;
ChartJS.defaults.plugins.legend.labels.boxHeight = 8;
