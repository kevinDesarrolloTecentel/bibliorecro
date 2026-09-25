import React from 'react'
import {
  useReporteUsuariosEdadGenero,
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
  CFormSelect,
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

export interface EGModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const EGModal: React.FC<EGModalProps> = ({ visible, setVisible }) => {
  const {
    generos,
    generoId,
    setGeneroId,
    edadDesde,
    setEdadDesde,
    edadHasta,
    setEdadHasta,
    usuarios,
    isLoading,
    excelLink,
    handleGet,
    handleDescargarExcel,
    handleReset,
  } = useReporteUsuariosEdadGenero()

  const handleClose = () => {
    handleReset()
    setVisible(false)
  }

  const columns = [
    {
      key: 'cedula',
      label: 'Cédula',
      _style: { width: '15%' },
    },
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '18%' },
    },
    {
      key: 'apellido',
      label: 'Apellido',
      _style: { width: '18%' },
    },
    {
      key: 'fechaNacimiento',
      label: 'Fecha de Nacimiento',
      _style: { width: '15%' },
    },
    {
      key: 'edad',
      label: 'Edad',
      _style: { width: '10%' },
    },
    {
      key: 'correo',
      label: 'Correo',
      _style: { width: '24%' },
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
          <span>Usuarios por Rango de Edad y Género</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Filtros de Búsqueda
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={6} md={3}>
                <CFormLabel className="small fw-semibold mb-1">Edad Desde</CFormLabel>
                <CInputGroup size="sm">
                  <CInputGroupText>Mín</CInputGroupText>
                  <CFormInput
                    type="number"
                    min={0}
                    max={120}
                    placeholder="Ej. 1"
                    value={edadDesde}
                    onChange={(e) => setEdadDesde(e.target.value)}
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12} sm={6} md={3}>
                <CFormLabel className="small fw-semibold mb-1">Edad Hasta</CFormLabel>
                <CInputGroup size="sm">
                  <CInputGroupText>Máx</CInputGroupText>
                  <CFormInput
                    type="number"
                    min={0}
                    max={120}
                    placeholder="Ej. +65"
                    value={edadHasta}
                    onChange={(e) => setEdadHasta(e.target.value)}
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12} sm={6} md={3}>
                <CFormLabel className="small fw-semibold mb-1">Género</CFormLabel>
                <CFormSelect
                  size="sm"
                  value={generoId}
                  onChange={(e) => setGeneroId(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {generos.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol xs={12} sm={6} md={3} className="d-flex gap-2">
                <CButton
                  color="primary"
                  variant='outline'
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGet}
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
              Información de los Usuarios
            </span>
            <span className="text-body-secondary small">
              Total recibidos: <strong>{usuarios.length}</strong>
            </span>
          </CCardHeader>
          <CCardBody className="p-0">
            <CSmartTable
              activePage={1}
              clickableRows
              columns={columns}
              columnSorter
              items={usuarios}
              itemsPerPage={60}
              pagination
              tableFilterPlaceholder="Buscar en la tabla..."
              noItemsLabel={
                isLoading
                  ? 'Cargando registros...'
                  :
                    <div className='text-center'>
                      <CSpinner color='primary' size='sm' variant='grow'/>
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
                    <span className='font-monospace small'>{item.APELLIDO_PERSONA}</span>
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
                edad: (item: PersonaReporteItem) => (
                  <td>
                    <span className="badge bg-body border text-primary font-monospace">
                      {item.EDAD_PERSONA ?? '-'}
                    </span>
                  </td>
                ),
                correo: (item: PersonaReporteItem) => (
                  <td>
                    <span className='font-monospace badge bg-body border text-muted'>
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
          <CButton 
          color="danger" 
          variant="outline"
          className='hover:text-white' 
          onClick={handleClose}
          >
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

export default EGModal