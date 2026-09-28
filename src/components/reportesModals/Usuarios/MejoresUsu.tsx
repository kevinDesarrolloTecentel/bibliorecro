import React from 'react'
import {
  useReporteMejoresUsuarios,
  PersonaReporteItem,
} from '@/hooks/reportes/usuarios/useReporteMejores'
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

export interface UseMejoresProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const MejoresUModal: React.FC<UseMejoresProps> = ({ visible, setVisible }) => {
  const {
    anoMejor,
    setAnoMejor,
    usuarios,
    isLoading,
    excelLink,
    handleGetMejores,
    handleDescargarExcel,
    handleReset,
  } = useReporteMejoresUsuarios()

  const handleClose = () => {
    handleReset()
    setVisible(false)
  }

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '35%' },
    },
    {
      key: 'apellido',
      label: 'Apellido',
      _style: { width: '35%' },
    },
    {
      key: 'cantidad',
      label: 'Cantidad de Préstamos',
      _style: { width: '30%' },
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
          <span>Ranking de los Mejores Usuarios</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2">
              Filtro por Año de Actividad
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">Coloque el Año</CFormLabel>
                <CInputGroup size="sm">
                  <CInputGroupText>Año</CInputGroupText>
                  <CFormInput
                    type="number"
                    placeholder="Ej. 2024"
                    value={anoMejor}
                    onChange={(e) => setAnoMejor(e.target.value)}
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                <CButton
                  color="primary"
                  variant='outline'
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGetMejores}
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
          <CCardHeader className="d-flex justify-content-between align-items-center bg-body py-2">
            <span className="fw-semibold small text-uppercase">
              Ranking de Usuarios
            </span>
            <span className="text-body-secondary small">
              Total recibidos: <strong>{usuarios.length}</strong>
            </span>
          </CCardHeader>
          <CCardBody className="p-0">
            <CSmartTable
              activePage={1}
              columns={columns}
              items={usuarios}
              itemsPerPageSelect
              itemsPerPage={60}
              noItemsLabel={'Seleccione un año para generar el reporte'}
              scopedColumns={{
                nombre: (item: PersonaReporteItem) => (
                  <td>
                    <span className='font-monospace small'>{item.NOMBRE_PERSONA}</span>
                  </td>
                ),
                apellido: (item: PersonaReporteItem) => (
                  <td>
                    <span className='font-monospace small'>{item.APELLIDO_PERSONA}</span>
                  </td>
                ),
                cantidad: (item: PersonaReporteItem) => (
                  <td>
                    <span className='font-monospace text-success badge bg-white border'>{item.cantidad_prestamos ?? 0}</span>
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
          Mostrando <strong>{usuarios.length}</strong> usuario(s)
        </div>
        <div className="d-flex gap-2">
          <CButton color="danger" variant="outline" className='hover:text-white' onClick={handleClose}>
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>
          {excelLink && (
            <CButton
              color="success"
              variant="outline"
              className='hover:text-white'
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

export default MejoresUModal