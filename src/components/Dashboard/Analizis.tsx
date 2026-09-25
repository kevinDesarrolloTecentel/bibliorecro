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

export const ChartBarExample = () => {
  const chartRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)


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
      
      <CChartBar
        ref={chartRef}
        style={{ height: '100%', width: '100%' }}
        data={{
          labels: mesesLabels,
          datasets: [
            {
              label: `Usuarios Nuevos`,
              backgroundColor: '#1E90FF',
              borderRadius: 4,
              data: [],
            },
            {
              label: `Renovaciones`,
              backgroundColor: '#00BFFF',
              borderRadius: 4,
              data: [],
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