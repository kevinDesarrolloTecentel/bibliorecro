import React from 'react'
import {
  useReportePrestamosMensuales,
  PrestamoReporteItem,
} from '@/hooks/reportes/useReportePrestamos'
import {
  cilCloudDownload,
  cilExitToApp,
  cilSave,
  cilSync,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSmartTable,
  CSpinner,
} from '@coreui/react-pro'

export interface PrestamoMProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const PrestamoMModal: React.FC<PrestamoMProps> = ({ visible, setVisible }) => {
  const {
    fechaMes,
    setFechaMes,
    prestamos,
    isLoading,
    excelLink,
    handleGetMes,
    handleDescargarExcel,
    handleReset,
  } = useReportePrestamosMensuales()

  const handleClose = () => {
    handleReset()
    setVisible(false)
  }

  const columns = [
    {
      key: 'titulo',
      label: 'Título',
      _style: { width: '20%' },
    },
    {
      key: 'fechaEntrega',
      label: 'Fecha de Entrega',
      _style: { width: '14%' },
    },
    {
      key: 'cedula',
      label: 'Cédula',
      _style: { width: '12%' },
    },
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '16%' },
    },
    {
      key: 'apellido',
      label: 'Apellido',
      _style: { width: '16%' },
    },
    {
      key: 'correo',
      label: 'Correo',
      _style: { width: '12%' },
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      _style: { width: '10%' },
    },
  ]

  return (
    <CModal
      size="xl"
      scrollable
      visible={visible}
      onClose={handleClose}
      backdrop="static"
    >
      <CModalHeader closeButton>
        <CModalTitle className="d-flex align-items-center gap-2">
          <span>Préstamos Mensuales</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2">
              Seleccione el Mes y Año Requeridos
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="fw-semibold mb-1">Año y Mes</CFormLabel>
                <CInputGroup size="sm">
                  <CInputGroupText>Mes</CInputGroupText>
                  <CFormInput
                    type="month"
                    value={fechaMes}
                    onChange={(e) => setFechaMes(e.target.value)}
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                <CButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGetMes}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <CSpinner size="sm" className="me-1" />
                      <span>Cargando...</span>
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilSave} className="me-1" />
                      <span>Generar</span>
                    </>
                  )}
                </CButton>
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  title="Limpiar filtros"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <CIcon icon={cilSync} />
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="border shadow-sm">
          <CCardHeader className="d-flex justify-content-between align-items-center bg-transparent py-2">
            <span className="fw-semibold small text-uppercase">
              Préstamos del Mes
            </span>
            <span className="text-body-secondary small">
              Total recibidos: <strong>{prestamos.length}</strong>
            </span>
          </CCardHeader>
          <CCardBody className="p-0">
            <CSmartTable
              activePage={1}
              columns={columns}
              columnSorter
              items={prestamos}
              itemsPerPage={60}
              noItemsLabel={
                isLoading ? (
                  'Cargando registros...'
                ) : (
                  <div className="d-flex justify-content-center">
                    <CSpinner color="primary" size="sm" variant="grow" />
                  </div>
                )
              }
              scopedColumns={{
                titulo: (item: PrestamoReporteItem) => (
                  <td>
                    <span className="font-monospace small fw-semibold">
                      {item.TITULO_LIBROS}
                    </span>
                  </td>
                ),
                fechaEntrega: (item: PrestamoReporteItem) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-primary">
                      {item.FECHAFIN_PRESTAMO
                        ? new Date(item.FECHAFIN_PRESTAMO).toLocaleDateString()
                        : '-'}
                    </span>
                  </td>
                ),
                cedula: (item: PrestamoReporteItem) => (
                  <td>
                    <span className="font-monospace small text-muted badge bg-body border">
                      {item.IDENTIFICACION_PERSONA}
                    </span>
                  </td>
                ),
                nombre: (item: PrestamoReporteItem) => (
                  <td>
                    <span className="font-monospace small">
                      {item.NOMBRE_PERSONA}
                    </span>
                  </td>
                ),
                apellido: (item: PrestamoReporteItem) => (
                  <td>
                    <span className="font-monospace small">
                      {item.APELLIDO_PERSONA}
                    </span>
                  </td>
                ),
                correo: (item: PrestamoReporteItem) => (
                  <td>
                    <span className="font-monospace small badge rounded-pill border px-3 text-muted">
                      {item.CORREO_PERSONA || 'Sin Correo'}
                    </span>
                  </td>
                ),
                telefono: (item: PrestamoReporteItem) => (
                  <td>
                    <span className="font-monospace small badge text-success border">{item.TELEFONO_PERSONA || '-'}</span>
                  </td>
                ),
              }}
              tableProps={{
                responsive: true,
                striped: true,
                hover: true,
                className: 'mb-0',
              }}
              tableBodyProps={{
                className: 'align-middle',
              }}
            />
          </CCardBody>
        </CCard>
      </CModalBody>
      <CModalFooter className="d-flex justify-content-between align-items-center">
        <div className="text-body-secondary small">
          Mostrando <strong>{prestamos.length}</strong> registro(s)
        </div>
        <div className="d-flex gap-2">
          <CButton color="danger" variant="outline" onClick={handleClose}>
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>
          {excelLink && (
            <CButton
              color="success"
              variant="outline"
              onClick={handleDescargarExcel}
            >
              <CIcon icon={cilCloudDownload} className="me-1" />
              Descargar
            </CButton>
          )}
        </div>
      </CModalFooter>
    </CModal>
  )
}

export default PrestamoMModal