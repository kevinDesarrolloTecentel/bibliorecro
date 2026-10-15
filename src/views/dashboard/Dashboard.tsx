
import { ChartBarExample } from "@/components/Dashboard/Analizis"
import { ChartPolarAreaExample } from "@/components/Dashboard/Rango_edad"
import { ChartLineExample } from "@/components/Dashboard/Totals_active"
import { CButton, CCard, CCardBody, CCardHeader, CCol, CFormSelect, CRow } from "@coreui/react-pro"
import { Estadistics } from "@/components/Dashboard/estacs"
import CIcon from "@coreui/icons-react"
import { cilChartPie, cilGraph, cilPeople, cilBook, cilSync } from "@coreui/icons"
import UsuNRT from "@/components/Dashboard/UsuNRT"
import LibIng from "@/components/Dashboard/LibrosIng"
import useDashboard from "@/hooks/dashboard/useDashboard"
import { usePermissions } from "@/context/PermissionsContext"

const Dashboard = () => {
  const { canDoAction } = usePermissions()

  const {
    resetKey,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    aniosDisponibles,
    meses,
    nuevosData,
    renovacionesData,
    loadingUsuarios,
    calcTotalNuevos,
    calcTotalRenovaciones,
    calcSumatoriaTotal,
    calcTotalPorMes,
    prestamosData,
    loadingPrestamos,
    rangoEdadData,
    loadingRangoEdad,
    usuariosNuevosList,
    usuariosRenovacionesList,
    todosUsuariosList,
    handleExportarExcel,
    refetch,
  } = useDashboard()

  return (

    <div className="pb-4">
      <CCard className="mb-4 shadow-sm border-0" style={{ borderRadius: '6px' }}>
        <CCardBody className="py-2 px-3 d-flex align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="text-body-secondary small" style={{ fontSize: '13px' }}>Seleccionar Año:</span>
            <CFormSelect
              size="sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ width: 'auto', minWidth: '95px', fontSize: '13px' }}
            >
              {aniosDisponibles.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </CFormSelect>
          </div>

          <div className="d-flex align-items-center gap-2 ms-sm-3">
            <span className="text-body-secondary small" style={{ fontSize: '13px' }}>Mes:</span>
            <CFormSelect
              size="sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: 'auto', minWidth: '160px', fontSize: '13px' }}
            >
              <option value="todos">Todos los meses</option>
              {meses.map((m, idx) => (
                <option key={idx + 1} value={String(idx + 1)}>{m}</option>
              ))}
            </CFormSelect>
          </div>
          {canDoAction('btn_actualizar_info') && (
            <div className="ms-auto">
              <CButton
                color="primary"
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loadingUsuarios || loadingPrestamos}
                className="d-flex align-items-center gap-1"
                title="Limpiar filtros y actualizar dashboard"
              >
                <CIcon icon={cilSync} className={(loadingUsuarios || loadingPrestamos) ? 'rotate-animation' : ''} />
                <span>{(loadingUsuarios || loadingPrestamos) ? 'Actualizando...' : 'Actualizar'}</span>
              </CButton>
            </div>
          )}
        </CCardBody>
      </CCard>

      <CCard className="mb-4 shadow-sm border-0" style={{ borderRadius: '6px' }}>
        <CCardHeader className="bg-body border-bottom py-3 px-3 fw-bold text-body" style={{ fontSize: '14px' }}>
          Usuarios Nuevos y Renovaciones {selectedYear}
        </CCardHeader>
        <CCardBody className="p-3">
          <ChartBarExample
            nuevos={nuevosData}
            renovaciones={renovacionesData}
            loading={loadingUsuarios}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </CCardBody>
      </CCard>

      <hr />
      <CCol>
        <Estadistics
          totalNuevos={calcTotalNuevos}
          totalRenovaciones={calcTotalRenovaciones}
          sumatoriaTotal={calcSumatoriaTotal}
          nuevosPorMes={nuevosData}
          renovacionesPorMes={renovacionesData}
          totalPorMes={calcTotalPorMes}
          loading={loadingUsuarios}
        />
      </CCol>
      <hr />

      <CRow className="g-4">
        <CCol xs={12}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-body py-3 border-bottom d-flex align-items-center gap-2">
              <CIcon icon={cilPeople} className="me-2" size="xl" style={{ color: '#224bd4' }} />
              <span className="fw-bold text-body">Tabla de Usuarios Nuevos, Renovaciones y Total</span>
            </CCardHeader>
            <CCardBody className="p-3">
              <UsuNRT
                key={`usunrt-${resetKey}`}
                usuariosNuevos={usuariosNuevosList}
                usuariosRenovaciones={usuariosRenovacionesList}
                todosUsuarios={todosUsuariosList}
                loading={loadingUsuarios}
                onExportarExcel={handleExportarExcel}
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-body py-3 border-bottom d-flex align-items-center gap-2">
              <CIcon icon={cilGraph} className="text-info" size="xl" />
              <span className="fw-bold text-body">Total de Préstamos (Activos vs Entregados)</span>
            </CCardHeader>
            <CCardBody className="p-3">
              <ChartLineExample
                data={prestamosData}
                loading={loadingPrestamos}
              />
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
              <ChartPolarAreaExample
                data={rangoEdadData}
                loading={loadingRangoEdad}
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-body py-3 border-bottom d-flex align-items-center gap-2">
              <CIcon icon={cilBook} className="me-2" size="xl" style={{ color: '#07b681ff' }} />
              <span className="fw-bold text-body">Reporte de Libros Ingresados por Fechas</span>
            </CCardHeader>
            <CCardBody className="p-3">
              <LibIng key={`libing-${resetKey}`} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard

