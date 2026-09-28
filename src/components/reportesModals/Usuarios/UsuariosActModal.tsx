import React from 'react'
import {
  useReporteUsuariosActivos,
  PersonaReporteItem,
} from '@/hooks/reportes/usuarios/useReportActivas'
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

export interface UsuActModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const UsuActModal: React.FC<UsuActModalProps> = ({ visible, setVisible }) => {
  const {
    anoRegistro,
    setAnoRegistro,
    usuarios,
    isLoading,
    excelLink,
    handleGetActivas,
    handleDescargarExcel,
    handleReset,
  } = useReporteUsuariosActivos()

  const handleClose = () => {
    handleReset()
    setVisible(false)
  }

  const columns = [
    {
      key: 'cedula',
      label: 'Cédula',
      _style: { width: '18%' },
    },
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '22%' },
    },
    {
      key: 'apellido',
      label: 'Apellido',
      _style: { width: '22%' },
    },
    {
      key: 'fechaNacimiento',
      label: 'Fecha de Nacimiento',
      _style: { width: '18%' },
    },
    {
      key: 'correo',
      label: 'Correo Electrónico',
      _style: { width: '20%' },
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
          <span>Reporte de Usuarios Activos</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">Coloque el Año de Registro</CFormLabel>
                <CInputGroup size="sm">
                  <CInputGroupText>Año</CInputGroupText>
                  <CFormInput
                    type="number"
                    placeholder="Ej. 2024"
                    value={anoRegistro}
                    onChange={(e) => setAnoRegistro(e.target.value)}
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                <CButton
                  color="primary"
                  variant='outline'
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGetActivas}
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
              Usuarios Activos Encontrados
            </span>
            <span className="text-body-secondary small">
              Total: <strong>{usuarios.length}</strong>
            </span>
          </CCardHeader>
          <CCardBody className="p-0">
            <CSmartTable
              activePage={1}
              clickableRows
              columns={columns}
              columnSorter
              items={usuarios}
              itemsPerPageSelect
              itemsPerPage={60}
              tableFilterPlaceholder="Buscar en la tabla..."
              noItemsLabel={'Seleccione un año para generar el reporte'}
              scopedColumns={{
                cedula: (item: PersonaReporteItem) => (
                  <td>
                    <span className="font-monospace small text-muted">
                      {item.IDENTIFICACION_PERSONA}
                    </span>
                  </td>
                ),
                nombre: (item: PersonaReporteItem) => (
                  <td>
                    <span className='font-monospace'>
                      {item.NOMBRE_PERSONA}
                    </span>
                    </td>
                ),
                apellido: (item: PersonaReporteItem) => (
                  <td>
                    <span className='font-monospace'>{item.APELLIDO_PERSONA}</span>
                  </td>
                ),
                fechaNacimiento: (item: PersonaReporteItem) => (
                  <td>
                    {item.FECHA_PERSONA
                      ? new Date(item.FECHA_PERSONA).toLocaleDateString()
                      : '-'}
                  </td>
                ),
                correo: (item: PersonaReporteItem) => (
                  <td>
                    <span
                      className="font-monospace small text-body-secondary d-inline-block text-truncate"
                      style={{ maxWidth: '240px' }}
                      title={item.CORREO_PERSONA}
                    >
                      {item.CORREO_PERSONA}
                    </span>
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
          Mostrando <strong>{usuarios.length}</strong> registro(s)
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

export default UsuActModal