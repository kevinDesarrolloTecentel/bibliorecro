import React from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { CCol, CRow, CWidgetStatsA, CSpinner } from '@coreui/react-pro'

const mesesLabels = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

const chartOptions = {
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
  maintainAspectRatio: false,
  scales: {
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: { display: false },
    },
    y: {
      beginAtZero: true,
      display: false,
      grid: { display: false },
      ticks: { display: false },
    },
  },
  elements: {
    line: { borderWidth: 2, tension: 0.4 },
    point: { radius: 2, hitRadius: 10, hoverRadius: 5 },
  },
}

export interface EstadisticsProps {
  totalNuevos?: number
  totalRenovaciones?: number
  sumatoriaTotal?: number
  nuevosPorMes?: number[]
  renovacionesPorMes?: number[]
  totalPorMes?: number[]
  loading?: boolean
}

export const Estadistics: React.FC<EstadisticsProps> = ({
  totalNuevos = 0,
  totalRenovaciones = 0,
  sumatoriaTotal = 0,
  nuevosPorMes = [],
  renovacionesPorMes = [],
  totalPorMes = [],
  loading = false,
}) => {
  const defaultZeros = Array(12).fill(0)
  const dNuevos = nuevosPorMes?.length === 12 ? nuevosPorMes : defaultZeros
  const dRenovaciones = renovacionesPorMes?.length === 12 ? renovacionesPorMes : defaultZeros
  const dTotal = totalPorMes?.length === 12 ? totalPorMes : defaultZeros

  return (
    <CRow className="g-3 mb-4">
      <CCol xs={12} sm={6} md={4}>
        <CWidgetStatsA
          className="shadow-sm border-0"
          color="success"
          title={<span className="text-white fw-semibold">Usuarios Nuevos</span>}
          value={
            <div className="fs-3 fw-bold text-white my-1">
              {loading ? <CSpinner size="sm" /> : totalNuevos}
            </div>
          }
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: mesesLabels,
                datasets: [
                  {
                    label: 'Usuarios Nuevos',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.75)',
                    pointBackgroundColor: '#2eb85c',
                    data: dNuevos,
                  },
                ],
              }}
              options={chartOptions}
            />
          }
        />
      </CCol>

      <CCol xs={12} sm={6} md={4}>
        <CWidgetStatsA
          className="shadow-sm border-0"
          color="primary"
          title={<span className="text-white fw-semibold">Renovaciones</span>}
          value={
            <div className="fs-3 fw-bold text-white my-1">
              {loading ? <CSpinner size="sm" /> : totalRenovaciones}
            </div>
          }
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: mesesLabels,
                datasets: [
                  {
                    label: 'Renovaciones',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.75)',
                    pointBackgroundColor: '#5856d6',
                    data: dRenovaciones,
                  },
                ],
              }}
              options={chartOptions}
            />
          }
        />
      </CCol>

      <CCol xs={12} sm={6} md={4}>
        <CWidgetStatsA
          className="shadow-sm border-0"
          color="info"
          title={<span className="text-white fw-semibold">Total General</span>}
          value={
            <div className="fs-3 fw-bold text-white my-1">
              {loading ? <CSpinner size="sm" /> : sumatoriaTotal}
            </div>
          }
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: mesesLabels,
                datasets: [
                  {
                    label: 'Total General',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.75)',
                    pointBackgroundColor: '#39f',
                    data: dTotal,
                  },
                ],
              }}
              options={chartOptions}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

export default Estadistics
