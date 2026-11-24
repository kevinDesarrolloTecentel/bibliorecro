import React, { useEffect, useRef, useMemo } from 'react'
import 'chart.js/auto'
import { CChartBar } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const mesesLabels = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const DEFAULT_NUEVOS = Array(12).fill(0)
const DEFAULT_RENOVACIONES = Array(12).fill(0)

export interface ChartBarExampleProps {
  nuevos?: number[]
  renovaciones?: number[]
  loading?: boolean
  selectedYear?: string | number
  selectedMonth?: string
}

export const ChartBarExample: React.FC<ChartBarExampleProps> = ({
  nuevos,
  renovaciones,
  loading = false,
  selectedYear = new Date().getFullYear().toString(),
  selectedMonth = 'todos',
}) => {
  const chartRef = useRef<any>(null)

  const dNuevos = nuevos && nuevos.length === 12 ? nuevos : DEFAULT_NUEVOS
  const dRenovaciones = renovaciones && renovaciones.length === 12 ? renovaciones : DEFAULT_RENOVACIONES

  // Filtrado si se selecciona un mes específico
  const isSingleMonth = selectedMonth !== 'todos' && selectedMonth !== ''
  const monthIndex = isSingleMonth ? parseInt(selectedMonth, 10) - 1 : -1

  const labels = isSingleMonth && monthIndex >= 0 ? [mesesLabels[monthIndex]] : mesesLabels
  const dataNuevos = isSingleMonth && monthIndex >= 0 ? [dNuevos[monthIndex] || 0] : dNuevos
  const dataRenovaciones = isSingleMonth && monthIndex >= 0 ? [dRenovaciones[monthIndex] || 0] : dRenovaciones

  // Sincronización en cambios de tema (modo oscuro / claro)
  useEffect(() => {
    const handleColorSchemeChange = () => {
      chartRef.current?.update()
    }
    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)
    return () => {
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
    }
  }, [])

  const currentBodyColor = typeof window !== 'undefined' ? (getStyle('--cui-body-color') || '#4f5d73') : '#4f5d73'
  const currentGridColor = typeof window !== 'undefined' ? (getStyle('--cui-border-color-translucent') || 'rgba(0,0,0,0.08)') : 'rgba(0,0,0,0.08)'

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: `Usuarios Nuevos ${selectedYear}`,
        backgroundColor: '#007D34',
        borderColor: '#007D34',
        borderRadius: 4,
        borderWidth: 0,
        maxBarThickness: 50,
        categoryPercentage: isSingleMonth ? 0.35 : 0.8,
        barPercentage: isSingleMonth ? 0.5 : 0.9,
        data: dataNuevos,
      },
      {
        label: `Renovaciones ${selectedYear}`,
        backgroundColor: '#D62728',
        borderColor: '#D62728',
        borderRadius: 4,
        borderWidth: 0,
        maxBarThickness: 50,
        categoryPercentage: isSingleMonth ? 0.35 : 0.8,
        barPercentage: isSingleMonth ? 0.5 : 0.9,
        data: dataRenovaciones,
      },
    ],
  }), [labels, selectedYear, isSingleMonth, dataNuevos, dataRenovaciones])

  const chartOptions: any = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
          boxWidth: 26,
          boxHeight: 12,
          padding: 20,
          color: currentBodyColor,
          font: {
            size: 11,
            weight: 500,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: currentGridColor,
        },
        ticks: {
          color: currentBodyColor,
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: currentBodyColor,
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Cantidad de Usuarios',
          color: currentBodyColor,
          font: {
            size: 11,
          },
        },
        grid: {
          color: currentGridColor,
        },
      },
    },
  }), [currentBodyColor, currentGridColor])

  return (
    <div style={{ width: '100%', height: '480px', position: 'relative' }}>
      {loading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-body bg-opacity-50"
          style={{ zIndex: 5 }}
        >
          <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}
      <CChartBar
        key={`${selectedYear}-${selectedMonth}-${dataNuevos.join(',')}-${dataRenovaciones.join(',')}`}
        ref={chartRef}
        style={{ height: '100%', width: '100%' }}
        data={chartData}
        options={chartOptions}
      />
    </div>
  )
}

export default ChartBarExample
