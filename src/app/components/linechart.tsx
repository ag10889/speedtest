'use client'

import Highcharts, { SeriesAreaOptions } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface SpeedLineChartProps {
  speeds: number[];
  intervalMs?: number;
  chartKey: number; // unique key to force re-mount
}

const SpeedLineChart: React.FC<SpeedLineChartProps> = ({ speeds, intervalMs = 1000, chartKey }) => {

  const options: Highcharts.Options = {
    chart: {
      type: 'area',
      backgroundColor: '#000000'
    },
    title: {
      text: 'Speed Over Time',
      style: {
        color: '#ffffff'
      }
    },
    xAxis: {
      type: 'linear',
      title: {
        text: 'Time (s)',
        style: {
          color: '#ffffff'
        }
      },
      lineColor: '#ffffff',
      tickColor: '#ffffff',
      labels: {
        style: {
          color: '#ffffff'
        },
        formatter: function () {
          const pointIndex = this.value as number;
          const timeInSeconds = (pointIndex * intervalMs) / 1000;
          return `${timeInSeconds.toFixed(1)}s`;
        }
      },
      gridLineColor: '#ffffff'
    },
    yAxis: {
      title: {
        text: 'Speed (Mbps)',
        style: {
          color: '#ffffff'
        }
      },
      labels: {
        style: {
          color: '#ffffff'
        }
      },
      lineColor: '#ffffff',
      tickColor: '#ffffff',
      gridLineColor: '#ffffff'
    },
    legend: {
      enabled: false
    },
    series: [
      {
        name: 'Speed',
        type: 'area',
        data: speeds.map((speed, idx) => [idx, speed]),
        color: '#ff0000',
        marker: {
          enabled: false
        },
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(255, 0, 0, 0)'],
            [1, 'rgba(255, 0, 0, 0.7)']
          ]
        }
      } as SeriesAreaOptions
    ],
    credits: {
      enabled: false
    }
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <HighchartsReact
        key={chartKey} // Use the key to force unmount/mount
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default SpeedLineChart;