import React, { useEffect, useRef, useState, useMemo } from 'react'
import 'chart.js/auto'
import { CChartPolarArea } from '@coreui/react-chartjs'
import { CButton, CButtonGroup } from '@coreui/react-pro'
import { getStyle } from '@coreui/utils'
import { RangoEdadItem } from '@/slices/dashboardSlice'

export interface ChartPolarAreaExampleProps {
  data?: RangoEdadItem[]
  loading?: boolean
}

const DEFAULT_ITEMS: RangoEdadItem[] = [
  { rango_edad: '0-17', hombres: 0, mujeres: 0 },
  { rango_edad: '18-25', hombres: 0, mujeres: 0 },
  { rango_edad: '26-35', hombres: 0, mujeres: 0 },
  { rango_edad: '36-50', hombres: 0, mujeres: 0 },
  { rango_edad: '51+', hombres: 0, mujeres: 0 },
]

export const ChartPolarAreaExample: React.FC<ChartPolarAreaExampleProps> = ({
  data: propData,
  loading = false,
}) => {
  const chartRef = useRef<any>(null)
  const [filtro, setFiltro] = useState<'todos' | 'hombres' | 'mujeres'>('todos')

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

  const chartData = useMemo(() => {
    const items: RangoEdadItem[] = propData && propData.length > 0 ? propData : DEFAULT_ITEMS

    if (filtro === 'hombres') {
      return {
        labels: items.map((item) => `${item.rango_edad} años (Hombre)`),
        datasets: [
          {
            data: items.map((item) => Number(item.hombres) || 0),
            backgroundColor: [
              '#64B5F6',
              '#2196F3',
              '#1E88E5',
              '#1976D2',
              '#0D47A1',
            ],
          },
        ],
      }
    }

    if (filtro === 'mujeres') {
      return {
        labels: items.map((item) => `${item.rango_edad} años (Mujer)`),
        datasets: [
          {
            data: items.map((item) => Number(item.mujeres) || 0),
            backgroundColor: [
              '#FF80AB',
              '#FF4081',
              '#F50057',
              '#C51162',
              '#880E4F',
            ],
          },
        ],
      }
    }

    // Filtro 'todos' (Ambos géneros intercalados)
    const labels: string[] = []
    const data: number[] = []
    const colors: string[] = []

    const colorPairs = [
      { m: 'rgba(255, 99, 132, 0.85)', h: 'rgba(54, 162, 235, 0.85)' },
      { m: 'rgba(255, 64, 129, 0.85)', h: 'rgba(33, 150, 243, 0.85)' },
      { m: 'rgba(233, 30, 99, 0.85)', h: 'rgba(30, 136, 229, 0.85)' },
      { m: 'rgba(194, 24, 91, 0.85)', h: 'rgba(25, 118, 210, 0.85)' },
      { m: 'rgba(173, 20, 87, 0.85)', h: 'rgba(13, 71, 161, 0.85)' },
    ]

    items.forEach((item, idx) => {
      const pair = colorPairs[idx % colorPairs.length]
      labels.push(`${item.rango_edad} años (Mujer)`)
      data.push(Number(item.mujeres) || 0)
      colors.push(pair.m)

      labels.push(`${item.rango_edad} años (Hombre)`)
      data.push(Number(item.hombres) || 0)
      colors.push(pair.h)
    })

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 1,
        },
      ],
    }
  }, [propData, filtro])

  const chartOptions: any = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 12 },
          color: currentBodyColor,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      r: {
        grid: {
          color: currentGridColor,
        },
        ticks: {
          color: currentBodyColor,
          backdropColor: 'transparent',
          precision: 0,
        },
      },
    },
  }), [currentBodyColor, currentGridColor])

  return (
    <div className="w-100 p-2">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold small text-muted">Filtrar Género:</span>
          <CButtonGroup size="sm" role="group">
            <CButton
              color={filtro === 'todos' ? 'primary' : 'secondary'}
              variant={filtro === 'todos' ? undefined : 'outline'}
              onClick={() => setFiltro('todos')}
            >
              Todos (Ambos)
            </CButton>
            <CButton
              color={filtro === 'mujeres' ? 'danger' : 'secondary'}
              variant={filtro === 'mujeres' ? undefined : 'outline'}
              onClick={() => setFiltro('mujeres')}
            >
              Mujeres
            </CButton>
            <CButton
              color={filtro === 'hombres' ? 'info' : 'secondary'}
              variant={filtro === 'hombres' ? undefined : 'outline'}
              onClick={() => setFiltro('hombres')}
            >
              Hombres
            </CButton>
          </CButtonGroup>
        </div>
      </div>

      <div style={{ width: '100%', height: '360px', position: 'relative' }}>
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
        <CChartPolarArea
          ref={chartRef}
          style={{ height: '100%', width: '100%' }}
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  )
}

export default ChartPolarAreaExample
