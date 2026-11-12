import React, { useState, useMemo } from 'react'
import {
  useReporteUsuariosActivos,
  PersonaReporteItem,
} from '@/hooks/reportes/usuarios/useReportActivas'
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
  CDatePicker,
  CFormLabel,
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

const formatFechaDisplay = (fecha?: string | null): string => {
  if (!fecha) return '-'
  const res = formatFecha(fecha)
  return res === 'No registrada' ? '-' : res
}

const UsuActModal: React.FC<UsuActModalProps> = ({ visible, setVisible }) => {
  const [tableKey, setTableKey] = useState<number>(0)

  const {
    anoRegistro,
    setAnoRegistro,
    usuarios,
    isLoading,
    excelLink,
    handleGetActivas,
    handleDescargarExcel,
    handleReset,
    haBuscado,
    canGenerarUsuariosActivos,
    canDescargarUsuariosActivos,
  } = useReporteUsuariosActivos()

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
      const fechaNacimiento = formatFechaDisplay(item.FECHA_PERSONA || (item as any).FECHA_NACIMIENTO_PERSONA || (item as any).fecha_nacimiento)
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
      }} backdrop="static"
    >
      <CModalHeader closeButton={!isLoading}>
        <CModalTitle className="d-flex align-items-center gap-2">
          <span>Reporte de Usuarios Activos</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Filtros de Búsqueda
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">Año de Registro</CFormLabel>
                <CDatePicker
                  key={tableKey}
                  size="sm"
                  locale="es-ES"
                  selectionType="year"
                  placeholder="Seleccione el año"
                  cleaner
                  inputReadOnly
                  inputDateFormat={(date: Date) => {
                    if (!date || isNaN(date.getTime())) return ''
                    const year = date.getHours() >= 18 ? date.getUTCFullYear() : date.getFullYear()
                    return String(year)
                  }}
                  inputDateParse={(val: string | Date) => {
                    if (val instanceof Date) return val
                    const num = Number(val)
                    return !isNaN(num) && num > 1900 ? new Date(num, 0, 1, 12, 0, 0) : new Date(val)
                  }}
                  date={anoRegistro ? new Date(Number(anoRegistro), 0, 1, 12, 0, 0) : null}
                  onDateChange={(val: any, formatted?: string) => {
                    if (!val) {
                      setAnoRegistro('')
                      return
                    }
                    if (typeof val === 'string') {
                      const match = val.match(/\b(19\d{2}|20\d{2})\b/) || val.match(/^(\d{4})/)
                      if (match) {
                        setAnoRegistro(match[1])
                        return
                      }
                    }
                    if (val instanceof Date && !isNaN(val.getTime())) {
                      const year = val.getHours() >= 18 ? val.getUTCFullYear() : val.getFullYear()
                      setAnoRegistro(String(year))
                      return
                    }
                    if (formatted) {
                      const match = formatted.match(/\b(19\d{2}|20\d{2})\b/) || formatted.match(/^(\d{4})/)
                      if (match) {
                        setAnoRegistro(match[1])
                      }
                    }
                  }}
                />
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                {canGenerarUsuariosActivos && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGetActivas()
                    }}
                    disabled={isLoading || !anoRegistro}                  >
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
              Usuarios Activos Encontrados
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
                  ? 'Cargando usuarios activos...'
                  : haBuscado
                    ? `No se encontraron usuarios activos para el año ${anoRegistro || ''}`
                    : 'Seleccione un año para generar el reporte'
              }
              scopedColumns={{
                nombres: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.nombres || item.NOMBRE_PERSONA || '-'}
                    </span>
                  </td>
                ),
                apellidos: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.apellidos || item.APELLIDO_PERSONA || '-'}
                    </span>
                  </td>
                ),
                identificacion: (item: any) => (
                  <td>
                    <span className="font-monospace small text-muted badge bg-body border">
                      {item.identificacion || item.IDENTIFICACION_PERSONA || '-'}
                    </span>
                  </td>
                ),
                correo: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-muted">
                      {item.correo || item.CORREO_PERSONA || '-'}
                    </span>
                  </td>
                ),
                edad: (item: any) => (
                  <td>
                    <span className="badge bg-body border text-primary font-monospace">
                      {item.edad !== undefined && item.edad !== '' ? item.edad : '-'}
                    </span>
                  </td>
                ),
                genero: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.genero || item.NOMBRE_GENERO || '-'}
                    </span>
                  </td>
                ),
                fechaNacimiento: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-primary">
                      {item.fechaNacimiento || formatFechaDisplay(item.FECHA_PERSONA)}
                    </span>
                  </td>
                ),
                inicioInscripcion: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-info">
                      {item.inicioInscripcion || formatFechaDisplay(item.FECHAINICIO_INSCRIPCION)}
                    </span>
                  </td>
                ),
                finInscripcion: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-info">
                      {item.finInscripcion || formatFechaDisplay(item.FECHAFIN_INSCRIPCION)}
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
                        className={`badge font-monospace ${
                          esActiva
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
            size="sm"
            variant="outline"
            className="hover:text-white shadow-sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>

          {canDescargarUsuariosActivos && (
            <CButton
              color="success"
              size="sm"
              variant="outline"
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

export default UsuActModal