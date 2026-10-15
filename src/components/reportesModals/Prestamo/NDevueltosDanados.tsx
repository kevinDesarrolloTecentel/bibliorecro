import React from 'react'
import {
  useReporteNoDevueltosDanados,
  PrestamoReporteItem,
} from '@/hooks/reportes/prestamos/NoDevueltos'
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

export interface LibPendientesProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const NoDevueltosDanados: React.FC<LibPendientesProps> = ({ visible, setVisible }) => {
  const {
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    prestamos,
    isLoading,
    excelLink,
    haBuscado,
    handleGetCaducados,
    handleDescargarExcel,
    handleReset,
  } = useReporteNoDevueltosDanados()

  const handleClose = () => {
    handleReset()
    setVisible(false)
  }

  const aFechaLocal = (str: string, finDelDia = false): Date | undefined => {
    if (!str) return undefined
    const [y, m, d] = str.split('-').map(Number)
    if (!y || !m || !d) return undefined
    return finDelDia ? new Date(y, m - 1, d, 23, 59, 59) : new Date(y, m - 1, d, 0, 0, 0)
  }

  const formatearFecha = (val: Date | string | null): string => {
    if (!val) return ''
    if (val instanceof Date) {
      const y = val.getFullYear()
      const m = String(val.getMonth() + 1).padStart(2, '0')
      const d = String(val.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    if (typeof val === 'string') {
      const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (match) return match[0]
      const ddmmyyyy = val.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
      if (ddmmyyyy) {
        const d = ddmmyyyy[1].padStart(2, '0')
        const m = ddmmyyyy[2].padStart(2, '0')
        const y = ddmmyyyy[3]
        return `${y}-${m}-${d}`
      }
      return val
    }
    return ''
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
          <span>Libros No Devueltos y Dañados</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2">
              Seleccione el Rango de Fechas Requerido
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={6} md={4}>
                <CFormLabel className="fw-semibold mb-1">Desde</CFormLabel>
                <CDatePicker
                  size="sm"
                  locale="es-ES"
                  placeholder="Seleccione fecha inicial"
                  date={aFechaLocal(fechaDesde)}
                  maxDate={aFechaLocal(fechaHasta, true)}
                  onDateChange={(val) => {
                    const str = formatearFecha(val)
                    setFechaDesde(str)
                    if (fechaHasta && str && str > fechaHasta) {
                      setFechaHasta(str)
                    }
                  }}
                />
              </CCol>

              <CCol xs={12} sm={6} md={4}>
                <CFormLabel className="fw-semibold mb-1">Hasta</CFormLabel>
                <CDatePicker
                  size="sm"
                  locale="es-ES"
                  placeholder="Seleccione fecha final"
                  date={aFechaLocal(fechaHasta)}
                  minDate={aFechaLocal(fechaDesde)}
                  onDateChange={(val) => {
                    const str = formatearFecha(val)
                    setFechaHasta(str)
                  }}
                />
              </CCol>

              <CCol xs={12} sm={12} md={4} className="d-flex gap-2">
                <CButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGetCaducados}
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
              Libros Caducados o No Devueltos
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
                haBuscado
                  ? 'No se encontraron libros no devueltos o dañados en el rango de fechas seleccionado'
                  : 'Seleccione un rango de fechas para generar el reporte'
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
                    <span className="font-monospace small badge border rounded-pill px-3 text-muted">
                      {item.CORREO_PERSONA}
                    </span>
                  </td>
                ),
                telefono: (item: PrestamoReporteItem) => (
                  <td>
                    <span className="font-monospace small">{item.TELEFONO_PERSONA || '-'}</span>
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
          <CButton color="danger" variant="outline" className="hover:text-white" onClick={handleClose}>
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>
          {excelLink && (
            <CButton
              color="success"
              variant="outline"
              className="hover:text-white"
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

export default NoDevueltosDanados