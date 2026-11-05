import React, { useEffect, useRef } from 'react'
import 'chart.js/auto'
import { getStyle } from '@coreui/utils'
import { CChart } from '@coreui/react-chartjs'
import { DashboardPrestamosTotals } from '@/models/dashboard/dashboard.model'

export interface ChartLineExampleProps {
  data?: DashboardPrestamosTotals
  loading?: boolean
  selectedMonth?: string
  selectedYear?: string | number
}

const MESES_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export const ChartLineExample: React.FC<ChartLineExampleProps> = ({
  data: propData,
  loading,
  selectedMonth = 'todos',
  selectedYear = '2026',
}) => {
  const chartRef = useRef<any>(null)

  useEffect(() => {
    const handleColorSchemeChange = () => {
      const chartInstance = chartRef.current
      if (chartInstance) {
        chartInstance.update()
      }
    }

    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)
    return () => {
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
    }
  }, [])

  const defaultArray = Array(12).fill(0)
  const activosData = propData?.activos?.length === 12 ? propData.activos : defaultArray
  const entregadosData = propData?.entregados?.length === 12 ? propData.entregados : defaultArray

  const isSingleMonth = selectedMonth !== 'todos' && selectedMonth !== ''
  const monthIndex = isSingleMonth ? parseInt(selectedMonth, 10) - 1 : -1

  const totalActivosVal = propData?.totalPrestamos !== undefined ? propData.totalPrestamos : activosData.reduce((a, b) => a + b, 0)
  const totalEntregadosVal = propData?.totalEntregados !== undefined ? propData.totalEntregados : entregadosData.reduce((a, b) => a + b, 0)
  const totalRegistrados = totalActivosVal + totalEntregadosVal

  const isAllZero = totalRegistrados === 0

  const hasYearlyBreakdown =
    !isSingleMonth &&
    activosData.filter((v) => v > 0).length > 1

  let displayLabels: string[]
  let displayActivos: number[]
  let displayEntregados: number[]

  if (isSingleMonth && monthIndex >= 0) {
    displayLabels = [MESES_LABELS[monthIndex]]
    displayActivos = [activosData[monthIndex] || totalActivosVal]
    displayEntregados = [entregadosData[monthIndex] || totalEntregadosVal]
  } else if (hasYearlyBreakdown) {
    displayLabels = MESES_LABELS
    displayActivos = activosData
    displayEntregados = entregadosData
  } else {
    // Vista general de Totales del Año
    displayLabels = [selectedYear ? `Total Anual ${selectedYear}` : 'Total Anual']
    displayActivos = [totalActivosVal]
    displayEntregados = [totalEntregadosVal]
  }

  const isGroupedYear = hasYearlyBreakdown

  const chartData: any = {
    labels: displayLabels,
    datasets: [
      {
        label: 'Préstamos Activos',
        backgroundColor: 'rgba(66, 211, 242, 0.75)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1.5,
        hoverBackgroundColor: 'rgba(66, 211, 242, 0.95)',
        data: displayActivos,
        borderRadius: 6,
        barPercentage: isGroupedYear ? 0.65 : 0.45,
        categoryPercentage: isGroupedYear ? 0.75 : 0.5,
      },
      {
        label: 'Préstamos Entregados',
        backgroundColor: 'rgba(118, 226, 176, 0.75)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1.5,
        hoverBackgroundColor: 'rgba(118, 226, 176, 0.95)',
        data: displayEntregados,
        borderRadius: 6,
        barPercentage: isGroupedYear ? 0.65 : 0.45,
        categoryPercentage: isGroupedYear ? 0.75 : 0.5,
      },
    ],
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: getStyle('--cui-body-color') || '#4f5d73',
          font: { size: 12, weight: 500 },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.raw || 0
            return ` ${ctx.dataset.label}: ${val}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: getStyle('--cui-border-color-translucent') || 'rgba(0,0,0,0.06)',
        },
        ticks: {
          color: getStyle('--cui-body-color') || '#4f5d73',
          font: { size: 13, weight: 600 },
        },
      },
      y: {
        grid: {
          color: getStyle('--cui-border-color-translucent') || 'rgba(0,0,0,0.06)',
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
      {/* Encabezado con totales */}
      <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1 small">
            <strong>Activos:</strong> {totalActivosVal}
          </span>
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 small">
            <strong>Entregados:</strong> {totalEntregadosVal}
          </span>
        </div>
        <div className="text-secondary small font-monospace" style={{ fontSize: '11px' }}>
          Total Registrados: {totalRegistrados}
        </div>
      </div>

      {/* Contenedor del gráfico de barras */}
      <div style={{ height: 'calc(100% - 44px)', width: '100%', position: 'relative' }}>
        {loading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-body bg-opacity-50"
            style={{ zIndex: 10 }}
          >
            <div className="spinner-border text-info" role="status" style={{ width: '2rem', height: '2rem' }}>
              <span className="visually-hidden">Cargando datos...</span>
            </div>
          </div>
        )}

        {isAllZero && !loading && (
          <div
            className="position-absolute top-50 start-50 translate-middle text-center p-3 rounded bg-body shadow-sm border small text-muted"
            style={{ zIndex: 4, maxWidth: '80%' }}
          >
            No hay préstamos registrados para este período seleccionado.
          </div>
        )}

        <CChart
          key={`bar-${displayLabels.join(',')}-${displayActivos.join(',')}-${displayEntregados.join(',')}-${selectedMonth}-${selectedYear}`}
          type="bar"
          data={chartData}
          options={options}
          ref={chartRef}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  )
}