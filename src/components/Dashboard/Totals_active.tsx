import { useEffect, useRef } from 'react'
import 'chart.js/auto'
import { getStyle } from '@coreui/utils'
import { CChart } from '@coreui/react-chartjs'
import { Chart } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

export interface ChartLineExampleProps {
  data?: {
    activos?: number[]
    entregados?: number[]
  }
  loading?: boolean
}

export const ChartLineExample: React.FC<ChartLineExampleProps> = ({ data: propData, loading }) => {
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

  const defaultArray = Array(12).fill(0)
  const activosData = propData?.activos?.length ? propData.activos : defaultArray
  const entregadosData = propData?.entregados?.length ? propData.entregados : defaultArray
  const isAllZero = activosData.every((v) => v === 0) && entregadosData.every((v) => v === 0)

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update()
    }
  }, [activosData, entregadosData])

  const chartData: ChartData<'line'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [
      {
        label: 'Prestamos Activos',
        backgroundColor: 'rgba(201, 220, 231, 0.2)',
        borderColor: 'rgba(66, 211, 242, 1)',
        pointBackgroundColor: 'rgba(17, 65, 129, 1)',
        data: activosData, 
        fill: true,
      },
      {
        label: 'Prestamos Entregados',
        backgroundColor: 'rgba(173, 241, 204, 0.2)',
        borderColor: 'rgba(118, 226, 176, 1)',
        pointBackgroundColor: 'rgba(24, 131, 3, 1)',
        data: entregadosData,
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
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  }

  return (
    <div style={{ width: '100%', height: '340px', position: 'relative' }}>
      {loading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-body bg-opacity-50"
          style={{ zIndex: 5 }}
        >
          <div className="spinner-border text-info" role="status" style={{ width: '2rem', height: '2rem' }}>
            <span className="visually-hidden">Cargando datos...</span>
          </div>
        </div>
      )}
      {isAllZero && !loading && (
        <div
          className="position-absolute top-50 start-50 translate-middle text-center p-2 rounded bg-body shadow-sm border small text-muted"
          style={{ zIndex: 4, maxWidth: '80%' }}
        >
          No hay préstamos registrados para este período seleccionado.
        </div>
      )}
      <CChart
        key={`${activosData.join(',')}-${entregadosData.join(',')}`}
        type="line"
        data={chartData}
        options={options}
        ref={chartRef}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  )
}