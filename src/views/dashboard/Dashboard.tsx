import { ChartBarExample } from "@/components/Dashboard/Analizis"
import { ChartPolarAreaExample } from "@/components/Dashboard/Rango_edad"
import { ChartLineExample } from "@/components/Dashboard/Totals_active"
import { CButton, CCard, CCardBody, CCardHeader, CCol, CFormLabel, CFormSelect, CInputGroup, CInputGroupText, CRow} from "@coreui/react-pro"
import { Estadistics } from "@/components/Dashboard/estacs"
import CIcon from "@coreui/icons-react"
import { cilChartPie, cilSpeedometer, cilBarChart, cilGraph, cilPeople, cilBook, cilSync } from "@coreui/icons"
import UsuNRT from "@/components/Dashboard/UsuNRT"
import LibIng from "@/components/Dashboard/LibrosIng"

const meses = [ 'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre', ]

const Dashboard = () => {


  return (
    <div className="pb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilSpeedometer} size="xl" style={{ color: '#d12020' }} />
            <span>Panel de Estadísticas y Control</span>
          </h3>
          <p className="text-muted mb-0 small">
            Métricas de usuarios, préstamos y análisis demográfico de la biblioteca.
          </p>
        </div>
      </div>
      <CCard>
        <CCardHeader>
          <span className="fw-semibold">Selecciona el Mes y el Año</span>
        </CCardHeader>
        <CCardBody className="d-flex align-items-center gap-3 justify-content-between">
          <CCol xs={12} sm={4} md={3}>
            <CFormLabel className="small fw-semibold">Seleccione el Año</CFormLabel>
            <CInputGroup size="sm">
              <CInputGroupText>Año:</CInputGroupText>
              <CFormSelect
              >
              </CFormSelect>
            </CInputGroup>
          </CCol>
          <CCol xs={12} sm={4} md={3}>
            <CFormLabel className="small fw-semibold">Seleccione el Mes</CFormLabel>
            <CInputGroup size="sm">
              <CInputGroupText>Mes:</CInputGroupText>
              <CFormSelect
              >
                <option value="">Todo el año</option>
                {meses.map((nombreMes, idx) => (
                  <option key={idx + 1} value={String(idx + 1)}>
                    {nombreMes}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={4} md={2}>
            <CButton
              color="primary"
              variant="outline"
              size="sm"
              className="w-100 d-flex align-items-center justify-content-center"
            >
              {
                <>
                  <CIcon icon={cilSync} className="me-2" />
                  <span className="hover:text-white">Actualizar</span>
                </>
              }
            </CButton>
          </CCol>
        </CCardBody>
      </CCard>
      <hr />
      <CCol>
        <Estadistics/>
      </CCol>
      <hr />

      <CRow className="g-4">
        <CCol xs={12} lg={6}>
          <CCard className="h-100 shadow-sm border-0">
            <CCardHeader className="bg-body py-3 border-bottom d-flex align-items-center gap-2">
              <CIcon icon={cilBarChart} className="text-primary" size="xl" />
              <span className="fw-bold text-body">Nuevos Usuarios y Renovaciones</span>
            </CCardHeader>
            <CCardBody className="p-3">
              <ChartBarExample />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} lg={6}>
          <CCard className="h-100 shadow-sm border-0">
            <CCardHeader className="bg-body py-3 border-bottom d-flex align-items-center gap-2">
              <CIcon icon={cilGraph} className="text-info" size="xl" />
              <span className="fw-bold text-body">Total de Préstamos (Activos vs Entregados)</span>
            </CCardHeader>
            <CCardBody className="p-3">
              <ChartLineExample />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-body py-3 border-bottom d-flex align-items-center gap-2">
              <CIcon icon={cilChartPie} className="text-warning" size="xl" />
              <span className="fw-bold text-body">Distribución de Usuarios por Rango de Edad y Género</span>
            </CCardHeader>
            <CCardBody className="p-3">
              <ChartPolarAreaExample />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-body py-3 border-bottom d-flex align-items-center gap-2">
              <CIcon icon={cilPeople} className="me-2" size="xl" style={{ color: '#224bd4' }} />
              <span className="fw-bold text-body">Tabla de Usuarios Nuevos, Renovaciones y Total</span>
            </CCardHeader>
            <CCardBody className="p-3">
              <UsuNRT
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-body py-3 border-bottom d-flex align-items-center gap-2">
              <CIcon icon={cilBook} className="me-2" size="xl" style={{ color: '#07b681ff' }} />
              <span className="fw-bold  text-body">Reporte de Libros Ingresados por Fechas</span>
            </CCardHeader>
            <CCardBody className="p-3">
              <LibIng />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard
