import React from 'react'
import {
  useReporteNuevosUsuarios,
  PersonaReporteItem,
} from '@/hooks/reportes/useReporteUsuarios'
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

export interface useNuevosProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const UsuNuevoModal: React.FC<useNuevosProps> = ({ visible, setVisible }) => {
  const {
    diaRegistro,
    setDiaRegistro,
    mesRegistro,
    setMesRegistro,
    anoRegistro,
    setAnoRegistro,
    usuarios,
    isLoading,
    excelLink,
    handleGetNuevosUsuarios,
    handleDescargarExcel,
    handleReset,
  } = useReporteNuevosUsuarios()

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
      label: 'Correo',
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
          <span>Nuevos Usuarios por Mes y Día</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2">
              Coloque la Fecha de Registro
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={4} md={3}>
                <CFormLabel className="small fw-semibold mb-1">Día</CFormLabel>
                <CInputGroup size="sm">
                  <CInputGroupText>Día</CInputGroupText>
                  <CFormInput
                    type="number"
                    min={1}
                    max={31}
                    placeholder="1-31"
                    value={diaRegistro}
                    onChange={(e) => setDiaRegistro(e.target.value)}
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12} sm={4} md={3}>
                <CFormLabel className="small fw-semibold mb-1">Mes</CFormLabel>
                <CInputGroup size="sm">
                  <CInputGroupText>Mes</CInputGroupText>
                  <CFormInput
                    type="number"
                    min={1}
                    max={12}
                    placeholder="1-12"
                    value={mesRegistro}
                    onChange={(e) => setMesRegistro(e.target.value)}
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12} sm={4} md={3}>
                <CFormLabel className="small fw-semibold mb-1">Año</CFormLabel>
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

              <CCol xs={12} sm={12} md={3} className="d-flex gap-2">
                <CButton
                  color="primary"
                  variant='outline'
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGetNuevosUsuarios}
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
              Nuevos Usuarios Encontrados
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
              itemsPerPage={60}
              noItemsLabel={
                isLoading
                  ? 'Cargando registros...'
                  : <div className='d-flex justify-content-center'>
                    <CSpinner size='sm' variant='grow' color='primary'/>
                  </div>
              }
              scopedColumns={{
                cedula: (item: PersonaReporteItem) => (
                  <td>
                    <span className="font-monospace small text-muted badge bg-body border">
                      {item.IDENTIFICACION_PERSONA}
                    </span>
                  </td>
                ),
                nombre: (item: PersonaReporteItem) => (
                  <td>
                    <span className='font-monospace small'>
                      {item.NOMBRE_PERSONA}
                    </span>
                  </td>
                ),
                apellido: (item: PersonaReporteItem) => (
                  <td>
                    <span className='font-monospace small'>
                      {item.APELLIDO_PERSONA}
                    </span>
                  </td>
                ),
                fechaNacimiento: (item: PersonaReporteItem) => (
                  <td>
                    <span className='font-monospace small badge bg-body border text-primary'>
                      {item.FECHA_PERSONA
                      ? new Date(item.FECHA_PERSONA).toLocaleDateString()
                      : '-'}
                    </span>
                  </td>
                ),
                correo: (item: PersonaReporteItem) => (
                  <td>
                    <span className='font-monospace small rounded-pill border px-3 text-muted'>
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

export default UsuNuevoModal