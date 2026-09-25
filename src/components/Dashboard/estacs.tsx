import { CChartLine } from '@coreui/react-chartjs'
import { CCol, CRow, CWidgetStatsA } from '@coreui/react-pro'



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

export const Estadistics = () => {

  return (
    <>
      <CRow className="g-3 mb-4">
        <CCol xs={12} sm={6} md={4}>
          <CWidgetStatsA
            className="shadow-sm border-0"
            color="primary"
            title={<span className='badge bg-gray-200 text-primary font-monospace '>Total de Usuarios Nuevos</span>}
            value={<></>}
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
                        pointBackgroundColor: '#5856d6',
                        data: [],
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
            value={<></>}
            title={<span className='border badge bg-gray-200 text-info font-monospace'>Total de Renovaciones</span>}
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
                      pointBackgroundColor: '#39f',
                      data: [],
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
            color="success"
            value={<></>}
            title={<span className='badge bg-gray-200 text-success font-monospace'>Sumatoria Total</span>}
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
                      pointBackgroundColor: '#2eb85c',
                      data: [],
                    },
                  ],
                }}
                options={chartOptions}
              />
            }
          />
        </CCol>
      </CRow>
    </>
  )
}

export default Estadistics
