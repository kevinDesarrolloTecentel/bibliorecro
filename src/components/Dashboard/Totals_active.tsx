import { useEffect, useRef } from 'react'
import 'chart.js/auto'
import { getStyle } from '@coreui/utils'
import { CChart } from '@coreui/react-chartjs'
import { Chart } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

export const ChartLineExample = () => {
  const chartRef = useRef<Chart<'line'> | null>(null)

  useEffect(() => {
    const handleColorSchemeChange = () => {
      const chartInstance = chartRef.current
      if (chartInstance) {
        const { options } = chartInstance

        if (options.plugins?.legend?.labels) {
          options.plugins.legend.labels.color = getStyle('--cui-body-color') || '#4f5d73'
        }

        if (options.scales?.x) {
          if (options.scales.x.grid) {
            options.scales.x.grid.color = getStyle('--cui-border-color-translucent') || 'rgba(0,0,0,0.08)'
          }
          if (options.scales.x.ticks) {
            options.scales.x.ticks.color = getStyle('--cui-body-color') || '#4f5d73'
          }
        }

        if (options.scales?.y) {
          if (options.scales.y.grid) {
            options.scales.y.grid.color = getStyle('--cui-border-color-translucent') || 'rgba(0,0,0,0.08)'
          }
          if (options.scales.y.ticks) {
            options.scales.y.ticks.color = getStyle('--cui-body-color') || '#4f5d73'
          }
        }

        chartInstance.update()
      }
    }

    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)

    return () => {
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
    }
  }, [])

  const data: ChartData<'line'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [
      {
        label: 'Prestamos Activos',
        backgroundColor: 'rgba(201, 220, 231, 0.2)',
        borderColor: 'rgba(66, 211, 242, 1)',
        pointBackgroundColor: 'rgba(17, 65, 129, 1)',
        data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 80, 10, 0], 
        fill: true,
      },
      {
        label: 'Prestamos Entregados',
        backgroundColor: 'rgba(173, 241, 204, 0.2)',
        borderColor: 'rgba(118, 226, 176, 1)',
        pointBackgroundColor: 'rgba(24, 131, 3, 1)',
        data: [50, 12, 28, 29, 7, 25, 12, 70, 60, 71, 26, 59],
        fill: true,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: getStyle('--cui-body-color') || '#4f5d73',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: getStyle('--cui-border-color-translucent') || 'rgba(0,0,0,0.08)',
        },
        ticks: {
          color: getStyle('--cui-body-color') || '#4f5d73',
        },
        type: 'category',
      },
      y: {
        grid: {
          color: getStyle('--cui-border-color-translucent') || 'rgba(0,0,0,0.08)',
        },
        ticks: {
          color: getStyle('--cui-body-color') || '#4f5d73',
        },
        beginAtZero: true,
      },
    },
  }

  return (
    <div style={{ width: '100%', height: '340px', position: 'relative' }}>
      <CChart type="line" data={data} options={options} ref={chartRef} style={{ height: '100%', width: '100%' }} />
    </div>
  )
}