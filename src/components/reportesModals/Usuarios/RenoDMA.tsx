import React from 'react'
import {
  useReporteRenovaciones,
  PersonaReporteItem,
} from '@/hooks/reportes/usuarios/useReporteRenovaciones'
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

export interface UsuMDAModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const MDAModal: React.FC<UsuMDAModalProps> = ({ visible, setVisible }) => {
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
    haBuscado,
    handleGetRenovaciones,
    handleDescargarExcel,
    handleReset,
  } = useReporteRenovaciones()

  const handleClose = () => {
    handleReset()
    setVisible(false)
  }

  const bloquearCaracteresNoNumericos=(e:React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
      e.preventDefault()
    }
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
      label: 'Correo ',
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
          <span>Renovaciones de Usuarios por Día, Mes y Año</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small">
              Coloca la fecha de Renovacion
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={4} md={3}>
                <CFormLabel className="fw-semibold mb-1">Día</CFormLabel>
                <CInputGroup size="sm">
                  <CInputGroupText>Día</CInputGroupText>
                  <CFormInput
                    type="number"
                    min={1}
                    max={31}
                    placeholder="1-31"
                    value={diaRegistro}
                    onKeyDown={bloquearCaracteresNoNumericos}
                    onChange={(e) => setDiaRegistro(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    onBlur={()=>{
                      if (diaRegistro && Number(diaRegistro) > 31)
                        setDiaRegistro('31')
                      if (diaRegistro && Number(diaRegistro)<1)
                        setDiaRegistro('1')
                    }}
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
                    onKeyDown={bloquearCaracteresNoNumericos}
                    onChange={(e) => setMesRegistro(e.target.value.replace(/\D/g, '').slice(0,2))}
                    onBlur={() =>{
                      if (mesRegistro && Number(mesRegistro) > 12)
                        setMesRegistro('12')
                      if (mesRegistro && Number(mesRegistro)<1)
                        setMesRegistro('1')
                    }}
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
                    onKeyDown={bloquearCaracteresNoNumericos}
                    onChange={(e) => setAnoRegistro(e.target.value.replace(/\D/g, '').slice(0,4))}
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12} sm={12} md={3} className="d-flex gap-2">
                <CButton
                  color="primary"
                  variant='outline'
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGetRenovaciones}
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
              Renovaciones Registradas
            </span>
            <span className="text-body-secondary small">
              Total recibidas: <strong>{usuarios.length}</strong>
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
              noItemsLabel={
                haBuscado
                  ? 'No se encontraron renovaciones para la fecha seleccionada'
                  : 'Inserte un día, mes y año para generar el reporte'
              }
              scopedColumns={{
                cedula: (item: PersonaReporteItem) => {
                  const cedula = item.IDENTIFICACION_PERSONA || item.PERSONA?.IDENTIFICACION_PERSONA || '-'
                  return (
                    <td>
                      <span className="font-monospace fw-semibold badge bg-body border text-muted">
                        {cedula}
                      </span>
                    </td>
                  )
                },
                nombre: (item: PersonaReporteItem) => (
                  <td>
                    <span className="fw-medium">
                      {item.NOMBRE_PERSONA || item.PERSONA?.NOMBRE_PERSONA || '-'}
                    </span>
                  </td>
                ),
                apellido: (item: PersonaReporteItem) => (
                  <td>
                    <span className="fw-medium">
                      {item.APELLIDO_PERSONA || item.PERSONA?.APELLIDO_PERSONA || '-'}
                    </span>
                  </td>
                ),
                fechaNacimiento: (item: PersonaReporteItem) => {
                  const fechaRaw = item.FECHA_PERSONA || item.PERSONA?.FECHA_PERSONA
                  if (!fechaRaw) return <td><span className="text-muted">-</span></td>
                  const parsed = new Date(fechaRaw)
                  const esValida = !isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100
                  return (
                    <td>
                      <span className="font-monospace small badge bg-body border text-primary">
                        {esValida ? parsed.toLocaleDateString() : '-'}
                      </span>
                    </td>
                  )
                },
                correo: (item: PersonaReporteItem) => {
                  const correo = item.CORREO_PERSONA || item.PERSONA?.CORREO_PERSONA
                  return (
                    <td>
                      {correo ? (
                        <span
                          className="font-monospace small rounded-pill border px-2 text-muted d-inline-block text-truncate"
                          style={{ maxWidth: '240px' }}
                          title={correo}
                        >
                          {correo}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  )
                },
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
              onClick={handleDescargarExcel}
            >
              <CIcon icon={cilCloudDownload} className="me-1" />
              Descargar Excel
            </CButton>
          )}
        </div>
      </CModalFooter>
    </CModal>
  )
}

export default MDAModal