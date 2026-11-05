import React, { useState, useMemo } from 'react'
import {
  useReporteUsuariosEdadGenero,
  PersonaReporteItem,
} from '@/hooks/reportes/usuarios/useReporteEdadGenero'
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
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRangeSlider,
  CRow,
  CSmartTable,
  CSpinner,
} from '@coreui/react-pro'

export interface EGModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const EGModal: React.FC<EGModalProps> = ({ visible, setVisible }) => {
  const [tableKey, setTableKey] = useState<number>(0)

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
    haBuscado,
    handleGet,
    handleDescargarExcel,
    handleReset,
    canGenerarUsuariosInscritos,
    canDescargarUsuariosInscritos,
  } = useReporteUsuariosEdadGenero()

  const handleFullReset = () => {
    handleReset()
    setTableKey((prev: number) => prev + 1)
  }

  const handleClose = () => {
    handleFullReset()
    setVisible(false)
  }

  const tableItems = useMemo(() => {
    return usuarios.map((item) => ({
      ...item,
      cedula: item.IDENTIFICACION_PERSONA || '',
      nombre: item.NOMBRE_PERSONA || '',
      apellido: item.APELLIDO_PERSONA || '',
      fechaNacimiento: item.FECHA_PERSONA
        ? new Date(item.FECHA_PERSONA).toLocaleDateString()
        : '',
      edad: item.EDAD_PERSONA !== undefined && item.EDAD_PERSONA !== null ? String(item.EDAD_PERSONA) : '',
      correo: item.CORREO_PERSONA || '',
    }))
  }, [usuarios])

  const esRangoInvalido = Boolean(
    edadDesde !== '' && edadHasta !== '' && Number(edadDesde) > Number(edadHasta)
  )

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
              <CCol xs={12} md={7}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <CFormLabel className="small fw-semibold mb-0">Rango de Edad</CFormLabel>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 font-monospace">
                    {edadDesde !== '' ? edadDesde : '1'} - {edadHasta !== '' ? edadHasta : '100'} años
                  </span>
                </div>
                <div className="pt-3 pb-1 px-2">
                  <CRangeSlider
                    min={1}
                    max={100}
                    step={1}
                    value={[
                      edadDesde !== '' ? Number(edadDesde) : 1,
                      edadHasta !== '' ? Number(edadHasta) : 100,
                    ]}
                    tooltips
                    tooltipsFormat={(val: number) => `${val} años`}
                    labels={[
                      { value: 1, label: '1' },
                      { value: 20, label: '20' },
                      { value: 40, label: '40' },
                      { value: 60, label: '60' },
                      { value: 80, label: '80' },
                      { value: 100, label: '100+' },
                    ]}
                    onChange={(val: number[]) => {
                      if (Array.isArray(val) && val.length >= 2) {
                        setEdadDesde(String(val[0]))
                        setEdadHasta(String(val[1]))
                      }
                    }}
                  />
                </div>
              </CCol>

              <CCol xs={12} sm={7} md={3}>
                <CFormLabel className="small fw-semibold mb-1">Género</CFormLabel>
                <CFormSelect
                  size="sm"
                  value={generoId}
                  onChange={(e) => setGeneroId(e.target.value)}
                >
                  <option value="">Todos los géneros</option>
                  {generos.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol xs={12} sm={5} md={2} className="d-flex gap-2">
                {canGenerarUsuariosInscritos && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGet()
                    }}
                    disabled={
                      isLoading ||
                      !edadDesde ||
                      !edadHasta ||
                      esRangoInvalido
                    }                  >
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
                )}
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  title="Limpiar filtros"
                  onClick={handleFullReset}
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
          <CCardBody className="p-3">
            <CSmartTable
              key={tableKey}
              activePage={1}
              clickableRows
              columns={columns}
              columnSorter
              items={tableItems}
              itemsPerPage={60}
              pagination
              tableFilter={haBuscado && !isLoading && usuarios.length > 0}
              tableFilterLabel="Buscar:"
              tableFilterPlaceholder="Buscar en la tabla..."
              cleaner
              noItemsLabel={
                haBuscado
                  ? 'No se encontraron usuarios registrados con los filtros seleccionados'
                  : 'Seleccione un Rango de Edad y el Género para la consulta'
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
            size="sm"
            className="hover:text-white shadow-sm"
            onClick={handleClose}
          >
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>

          {canDescargarUsuariosInscritos && (
            <CButton
              color="success"
              variant="outline"
              size="sm"
              className="hover:text-white shadow-sm"
              onClick={handleDescargarExcel}
              disabled={
                isLoading ||
                !haBuscado ||
                usuarios.length === 0 ||
                !excelLink
              }
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