import { useEffect, useRef } from 'react'
import 'chart.js/auto'
import { CChartBar } from '@coreui/react-chartjs'



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

export interface ChartBarExampleProps {
  nuevos?: number[]
  renovaciones?: number[]
  loading?: boolean
}

export const ChartBarExample: React.FC<ChartBarExampleProps> = ({
  nuevos = [],
  renovaciones = [],
  loading = false,
}) => {
  const chartRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const dNuevos = nuevos?.length ? nuevos : Array(12).fill(0)
  const dRenovaciones = renovaciones?.length ? renovaciones : Array(12).fill(0)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          chartRef.current?.resize()
        }
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '340px', position: 'relative' }}>
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
        key={`${dNuevos.join(',')}-${dRenovaciones.join(',')}`}
        ref={chartRef}
        style={{ height: '100%', width: '100%' }}
        data={{
          labels: mesesLabels,
          datasets: [
            {
              label: `Usuarios Nuevos`,
              backgroundColor: '#1E90FF',
              borderRadius: 4,
              data: dNuevos,
            },
            {
              label: `Renovaciones`,
              backgroundColor: '#00BFFF',
              borderRadius: 4,
              data: dRenovaciones,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { size: 13 },
              },
            },
            tooltip: {
              enabled: true,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
            },
          },
        }}
      />
    </div>
  )
}

export default ChartBarExample