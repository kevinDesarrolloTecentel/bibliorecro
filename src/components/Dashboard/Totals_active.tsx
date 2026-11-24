import React, { useEffect, useRef, useMemo } from 'react'
import 'chart.js/auto'
import { getStyle } from '@coreui/utils'
import { CChart } from '@coreui/react-chartjs'
import { DashboardPrestamosTotals } from '@/slices/dashboardSlice'

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
  selectedYear = new Date().getFullYear().toString(),
}) => {
  const chartRef = useRef<any>(null)

  useEffect(() => {
    const handleColorSchemeChange = () => {
      chartRef.current?.update()
    }

    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)
    return () => {
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
    }
  }, [])

  const totalActivosVal = Number(propData?.totalPrestamos ?? 0)
  const totalEntregadosVal = Number(propData?.totalEntregados ?? 0)
  const totalRegistrados = Number(propData?.totalGeneral ?? (totalActivosVal + totalEntregadosVal))
  const isAllZero = totalRegistrados === 0

  const isSingleMonth = selectedMonth !== 'todos' && selectedMonth !== ''
  const monthIndex = isSingleMonth ? parseInt(selectedMonth, 10) - 1 : -1

  const displayLabels = useMemo(() => {
    if (isSingleMonth && monthIndex >= 0 && monthIndex < 12) {
      return [MESES_LABELS[monthIndex]]
    }
    return [selectedYear ? `Total Anual ${selectedYear}` : 'Total Anual']
  }, [isSingleMonth, monthIndex, selectedYear])

  const currentBodyColor = typeof window !== 'undefined' ? (getStyle('--cui-body-color') || '#4f5d73') : '#4f5d73'
  const currentGridColor = typeof window !== 'undefined' ? (getStyle('--cui-border-color-translucent') || 'rgba(0,0,0,0.06)') : 'rgba(0,0,0,0.06)'

  const chartData: any = useMemo(() => ({
    labels: displayLabels,
    datasets: [
      {
        label: 'Préstamos Activos',
        backgroundColor: 'rgba(66, 211, 242, 0.75)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1.5,
        hoverBackgroundColor: 'rgba(66, 211, 242, 0.95)',
        data: [totalActivosVal],
        borderRadius: 4,
        maxBarThickness: 50,
        barPercentage: 0.5,
        categoryPercentage: 0.35,
      },
      {
        label: 'Préstamos Entregados',
        backgroundColor: 'rgba(118, 226, 176, 0.75)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1.5,
        hoverBackgroundColor: 'rgba(118, 226, 176, 0.95)',
        data: [totalEntregadosVal],
        borderRadius: 4,
        maxBarThickness: 50,
        barPercentage: 0.5,
        categoryPercentage: 0.35,
      },
    ],
  }), [displayLabels, totalActivosVal, totalEntregadosVal])

  const options: any = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: currentBodyColor,
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
          color: currentGridColor,
        },
        ticks: {
          color: currentBodyColor,
          font: { size: 13, weight: 600 },
        },
      },
      y: {
        grid: {
          color: currentGridColor,
        },
        ticks: {
          color: currentBodyColor,
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  }), [currentBodyColor, currentGridColor])

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

export default ChartLineExample
