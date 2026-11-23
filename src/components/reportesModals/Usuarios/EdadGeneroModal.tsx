import React, { useState, useMemo } from 'react'
import {
  useReporteUsuariosEdadGenero,
  PersonaReporteItem,
} from '@/hooks/reportes/usuarios/useReporteEdadGenero'
import { formatFecha } from '@/utils/dateUtils'
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

const formatFechaDisplay = (fecha?: string | null): string => {
  if (!fecha) return '-'
  const res = formatFecha(fecha)
  return res === 'No registrada' ? '-' : res
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
    return usuarios.map((item: PersonaReporteItem) => {
      const nombres = item.NOMBRE_PERSONA?.trim() || ''
      const apellidos = item.APELLIDO_PERSONA?.trim() || ''
      const identificacion = item.IDENTIFICACION_PERSONA?.trim() || ''
      const correo = item.CORREO_PERSONA?.trim() || ''
      const edad = item.EDAD_PERSONA !== undefined && item.EDAD_PERSONA !== null ? String(item.EDAD_PERSONA) : ''
      const genero = item.NOMBRE_GENERO?.trim() || ''
      const fechaNacimiento = formatFechaDisplay(item.FECHA_PERSONA)
      const inicioInscripcion = formatFechaDisplay(item.FECHAINICIO_INSCRIPCION)
      const finInscripcion = formatFechaDisplay(item.FECHAFIN_INSCRIPCION)

      // Costo de inscripción
      const costoNum = Number(item.COSTO_INSCRIPCION)
      const costoInscripcion = !isNaN(costoNum)
        ? `$${costoNum.toFixed(2)}`
        : item.COSTO_INSCRIPCION
          ? `$${item.COSTO_INSCRIPCION}`
          : '$0.00'

      // Estado de inscripción
      let estadoInscripcion = 'Inactiva'
      const estStr = String(item.ESTADO_INSCRIPCION ?? '').trim().toLowerCase()
      if (estStr === '1' || estStr === 'true' || estStr === 'activa' || estStr === 'activo') {
        estadoInscripcion = 'Activa'
      } else if (estStr && estStr !== '0' && estStr !== 'false' && estStr !== 'inactiva' && estStr !== 'inactivo') {
        estadoInscripcion = String(item.ESTADO_INSCRIPCION)
      }

      return {
        ...item,
        nombres,
        apellidos,
        identificacion,
        correo,
        edad,
        genero,
        fechaNacimiento,
        inicioInscripcion,
        finInscripcion,
        costoInscripcion,
        estadoInscripcion,
      }
    })
  }, [usuarios])

  const esRangoInvalido = Boolean(
    edadDesde !== '' && edadHasta !== '' && Number(edadDesde) > Number(edadHasta)
  )

  const columns = [
    {
      key: 'nombres',
      label: 'Nombres',
      _style: { minWidth: '150px' },
    },
    {
      key: 'apellidos',
      label: 'Apellidos',
      _style: { minWidth: '150px' },
    },
    {
      key: 'identificacion',
      label: 'Identificación',
      _style: { minWidth: '150px' },
    },
    {
      key: 'correo',
      label: 'Correo electrónico',
      _style: { minWidth: '150px' },
    },
    {
      key: 'edad',
      label: 'Edad',
      _style: { minWidth: '80px' },
    },
    {
      key: 'genero',
      label: 'Género',
      _style: { minWidth: '110px' },
    },
    {
      key: 'fechaNacimiento',
      label: 'Fecha de nacimiento',
      _style: { minWidth: '130px' },
    },
    {
      key: 'inicioInscripcion',
      label: 'Inicio de inscripción',
      _style: { minWidth: '135px' },
    },
    {
      key: 'finInscripcion',
      label: 'Fin de inscripción',
      _style: { minWidth: '135px' },
    },
    {
      key: 'costoInscripcion',
      label: 'Costo de inscripción',
      _style: { minWidth: '125px' },
    },
    {
      key: 'estadoInscripcion',
      label: 'Estado de inscripción',
      _style: { minWidth: '135px' },
    },
  ]

  return (
    <CModal
      size="xl"
      scrollable
      visible={visible}
      onClose={() => {
        if (!isLoading) handleClose()
       }}
      backdrop="static"
    >
      <CModalHeader closeButton = {!isLoading}>
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
              loading={isLoading}
              pagination
              tableFilter={haBuscado && !isLoading && usuarios.length > 0}
              tableFilterLabel="Buscar:"
              tableFilterPlaceholder="Buscar en la tabla..."
              cleaner
              noItemsLabel={
                isLoading
                  ? 'Cargando usuarios...'
                  : haBuscado
                  ? 'No se encontraron usuarios registrados con los filtros seleccionados'
                  : 'Seleccione un Rango de Edad y el Género para la consulta'
              }
              scopedColumns={{
                nombres: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.nombres || '-'}
                    </span>
                  </td>
                ),
                apellidos: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.apellidos || '-'}
                    </span>
                  </td>
                ),
                identificacion: (item: any) => (
                  <td>
                    <span className="font-monospace small text-muted badge bg-body border">
                      {item.identificacion || '-'}
                    </span>
                  </td>
                ),
                correo: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-muted">
                      {item.correo || '-'}
                    </span>
                  </td>
                ),
                edad: (item: any) => (
                  <td>
                    <span className="badge bg-body border text-primary font-monospace">
                      {item.edad || '-'}
                    </span>
                  </td>
                ),
                genero: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.genero || '-'}
                    </span>
                  </td>
                ),
                fechaNacimiento: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-primary">
                      {item.fechaNacimiento || '-'}
                    </span>
                  </td>
                ),
                inicioInscripcion: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-info">
                      {item.inicioInscripcion || '-'}
                    </span>
                  </td>
                ),
                finInscripcion: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-info">
                      {item.finInscripcion || '-'}
                    </span>
                  </td>
                ),
                costoInscripcion: (item: any) => (
                  <td>
                    <span className="font-monospace small text-success fw-semibold">
                      {item.costoInscripcion}
                    </span>
                  </td>
                ),
                estadoInscripcion: (item: any) => {
                  const esActiva = item.estadoInscripcion === 'Activa'
                  return (
                    <td>
                      <span
                        className={`badge font-monospace ${esActiva
                            ? 'bg-success-subtle text-success border border-success-subtle'
                            : 'bg-danger-subtle text-danger border border-danger-subtle'
                          }`}
                      >
                        {item.estadoInscripcion}
                      </span>
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
          <CButton
            color="danger"
            variant="outline"
            size="sm"
            className="hover:text-white shadow-sm"
            onClick={handleClose}
            disabled={isLoading}
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
              Descargar Excel
            </CButton>
          )}

        </div>
      </CModalFooter>
    </CModal>
  )
}

export default EGModal