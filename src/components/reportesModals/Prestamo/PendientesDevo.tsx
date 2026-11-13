import React, { useState, useMemo } from 'react'
import {
  useReportePendientesDevolver,
  PrestamoReporteItem,
} from '@/hooks/reportes/prestamos/usePendientes'
import {
  cilCloudDownload,
  cilExitToApp,
  cilSave,
  cilSync,
  cilWarning,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDateRangePicker,
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
import { aFechaLocal, parseDatePickerValue, formatFecha } from '@/utils/dateUtils'

const formatFechaDisplay = (fecha?: string | null) => {
  if (!fecha) return 'Sin registrar'
  const res = formatFecha(fecha)
  return res === 'No registrada' || res === '-' ? 'Sin registrar' : res
}

export interface LibPendientesProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const PendientesModal: React.FC<LibPendientesProps> = ({ visible, setVisible }) => {
  const [tableKey, setTableKey] = useState<number>(0)

  const {
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    prestamos,
    isLoading,
    excelLink,
    haBuscado,
    handleGetPendientes,
    handleDescargarExcel,
    handleReset,
    canGenerarLibrosPendientes,
    canDescargarLibrosPendientes,
  } = useReportePendientesDevolver()

  const handleFullReset = () => {
    handleReset()
    setTableKey((prev: number) => prev + 1)
  }

  const handleClose = () => {
    handleFullReset()
    setVisible(false)
  }

  const isRangoInvalido = Boolean(
    fechaDesde && fechaHasta && new Date(fechaHasta) < new Date(fechaDesde)
  )

  const diasDiferencia = useMemo(() => {
    if (!fechaDesde || !fechaHasta || isRangoInvalido) return 0
    const d1 = new Date(fechaDesde)
    const d2 = new Date(fechaHasta)
    const diffTime = d2.getTime() - d1.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 ? diffDays : 0
  }, [fechaDesde, fechaHasta, isRangoInvalido])

  const tableItems = useMemo(() => {
    return prestamos.map((item: PrestamoReporteItem) => {
      const nombres = item.NOMBRE_PERSONA?.trim() || 'Sin registrar'
      const apellidos = item.APELLIDO_PERSONA?.trim() || 'Sin registrar'
      const identificacion = item.IDENTIFICACION_PERSONA?.trim() || 'Sin registrar'
      const correo = item.CORREO_PERSONA?.trim() || 'Sin registrar'
      const edad =
        item.EDAD_PERSONA !== undefined && item.EDAD_PERSONA !== null
          ? String(item.EDAD_PERSONA)
          : 'Sin registrar'
      const celular = item.CELULAR_PERSONA?.trim() || 'Sin registrar'
      const telefono = item.TELEFONO_PERSONA?.trim() || 'Sin registrar'
      const tituloLibro = item.TITULO_LIBROS?.trim() || 'Sin registrar'
      const isbn = item.ISBN_LIBROS?.trim() || 'Sin registrar'
      const autor = item.NOMBRE_AUTOR?.trim() || 'Sin registrar'

      const val = item.PRECIO_LIBROS
      const precioNum = Number(val)
      const precioLibro =
        val !== undefined && val !== null && val !== '' && !isNaN(precioNum)
          ? `$${precioNum.toFixed(2)}`
          : '$0.00'

      const detallePrestamo = item.DETALLE_PRESTAMO?.trim() || 'Sin registrar'

      let estadoPrestamo = 'En préstamo'
      const estP = String(item.ESTADO_PRESTAMO ?? '').trim().toLowerCase()
      if (estP === '0' || estP === 'devuelto') {
        estadoPrestamo = 'Devuelto'
      } else if (
        estP === '1' ||
        estP === 'en prestamo' ||
        estP === 'en préstamo' ||
        estP === 'activo'
      ) {
        estadoPrestamo = 'En préstamo'
      } else if (estP === '2' || estP.includes('sancion')) {
        estadoPrestamo = 'Sancionado'
      } else if (estP) {
        estadoPrestamo = String(item.ESTADO_PRESTAMO)
      }

      const inicioPrestamo =
        item.FECHAINICIO_PRESTAMO_FORMATO ||
        formatFechaDisplay(item.FECHAINICIO_PRESTAMO || item.FECHAPRESTAMO_PRESTAMO)
      const finPrestamo =
        item.FECHAFIN_PRESTAMO_FORMATO ||
        formatFechaDisplay(item.FECHAFIN_PRESTAMO)
      const fechaEntrega =
        item.FECHAENTREGA_PRESTAMO_FORMATO ||
        formatFechaDisplay(item.FECHAENTREGA_PRESTAMO)

      return {
        ...item,
        nombres,
        apellidos,
        identificacion,
        correo,
        edad,
        celular,
        telefono,
        tituloLibro,
        isbn,
        autor,
        precioLibro,
        detallePrestamo,
        estadoPrestamo,
        inicioPrestamo,
        finPrestamo,
        fechaEntrega,
      }
    })
  }, [prestamos])

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
      _style: { minWidth: '180px' },
    },
    {
      key: 'edad',
      label: 'Edad',
      _style: { minWidth: '80px' },
    },
    {
      key: 'celular',
      label: 'Celular',
      _style: { minWidth: '120px' },
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      _style: { minWidth: '120px' },
    },
    {
      key: 'tituloLibro',
      label: 'Titulo del libro',
      _style: { minWidth: '180px' },
    },
    {
      key: 'isbn',
      label: 'ISBN',
      _style: { minWidth: '130px' },
    },
    {
      key: 'autor',
      label: 'Autor',
      _style: { minWidth: '150px' },
    },
    {
      key: 'precioLibro',
      label: 'Precio',
      _style: { minWidth: '120px' },
    },
    {
      key: 'detallePrestamo',
      label: 'Detalle del préstamo',
      _style: { minWidth: '250px' },
    },
    {
      key: 'estadoPrestamo',
      label: 'Estado del préstamo',
      _style: { minWidth: '140px' },
    },
    {
      key: 'inicioPrestamo',
      label: 'Inicio del préstamo',
      _style: { minWidth: '135px' },
    },
    {
      key: 'finPrestamo',
      label: 'Fin del préstamo',
      _style: { minWidth: '135px' },
    },
    {
      key: 'fechaEntrega',
      label: 'Fecha de entrega',
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
          <span>Libros Pendientes por Devolver</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Seleccione el Rango de Fechas Requerido
            </div>
            <CFormLabel className="small fw-semibold mb-1">
              Rango de Fechas (Desde - Hasta)
            </CFormLabel>
            <CRow className="g-3 align-items-center">
              <CCol xs={12} md={8}>
                <CDateRangePicker
                  key={`daterange-${tableKey}`}
                  size="sm"
                  locale="es-ES"
                  cleaner
                  inputReadOnly
                  calendars={2}
                  startDate={aFechaLocal(fechaDesde)}
                  endDate={aFechaLocal(fechaHasta)}
                  invalid={isRangoInvalido}
                  feedbackInvalid="La Fecha (Hasta) no puede ser anterior a la Fecha (Desde)."
                  placeholder={['Fecha desde', 'Fecha hasta']}
                  cancelButton="Cancelar"
                  confirmButton="Aceptar"
                  onStartDateChange={(val) => {
                    const parsed = parseDatePickerValue(val ?? null)
                    setFechaDesde(parsed)
                    if (parsed && fechaHasta && parsed > fechaHasta) {
                      setFechaHasta(parsed)
                    }
                  }}
                  onEndDateChange={(val) => {
                    const parsed = parseDatePickerValue(val ?? null)
                    if (parsed && fechaDesde && parsed < fechaDesde) {
                      setFechaHasta(fechaDesde)
                    } else {
                      setFechaHasta(parsed)
                    }
                  }}
                />
              </CCol>

              <CCol xs={12} md={4} className="d-flex gap-2 align-items-center">
                {canGenerarLibrosPendientes && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGetPendientes()
                    }}
                    disabled={
                      isLoading ||
                      !fechaDesde ||
                      !fechaHasta ||
                      isRangoInvalido
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

            {isRangoInvalido ? (
              <div className="alert alert-danger py-2 px-3 mt-2 small d-flex align-items-center gap-2 mb-0">
                <CIcon icon={cilWarning} className="text-danger flex-shrink-0" />
                <span>
                  <strong>Rango inválido:</strong> La Fecha (Desde) no puede ser posterior a la Fecha (Hasta).
                </span>
              </div>
            ) : (
              fechaDesde &&
              fechaHasta && (
                <div className="d-flex align-items-center gap-2 mt-2 text-muted small">
                  <span>
                    Periodo: <strong>{formatFecha(fechaDesde)}</strong> al <strong>{formatFecha(fechaHasta)}</strong>
                  </span>
                  {diasDiferencia >= 0 && (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                      {diasDiferencia} día{diasDiferencia !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )
            )}
          </CCardBody>
        </CCard>

        <CCard className="border shadow-sm">
          <CCardHeader className="d-flex justify-content-between align-items-center bg-transparent py-2">
            <span className="fw-semibold small text-uppercase">
              Libros Pendientes
            </span>
            <span className="text-body-secondary small">
              Total libros: <strong>{prestamos.length}</strong>
            </span>
          </CCardHeader>
          <CCardBody className="p-0">
            <CSmartTable
              key={tableKey}
              activePage={1}
              columns={columns}
              columnSorter
              tableFilter={haBuscado && !isLoading && prestamos.length > 0}
              tableFilterLabel="Buscar:"
              tableFilterPlaceholder="Buscar en la tabla..."
              loading={isLoading}
              cleaner
              items={tableItems}
              itemsPerPage={60}
              pagination
              noItemsLabel={
                isLoading
                  ? 'Cargando libros pendientes...'
                  : haBuscado
                    ? 'No se encontraron libros pendientes en el rango de fechas seleccionado'
                    : 'Seleccione un rango de fechas para generar el reporte'
              }
              scopedColumns={{
                nombres: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.nombres && item.nombres !== '-' ? item.nombres : 'Sin registrar'}
                    </span>
                  </td>
                ),
                apellidos: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.apellidos && item.apellidos !== '-' ? item.apellidos : 'Sin registrar'}
                    </span>
                  </td>
                ),
                identificacion: (item: any) => (
                  <td>
                    <span className="font-monospace small text-muted badge bg-body border">
                      {item.identificacion && item.identificacion !== '-' ? item.identificacion : 'Sin registrar'}
                    </span>
                  </td>
                ),
                correo: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-muted">
                      {item.correo && item.correo !== '-' ? item.correo : 'Sin registrar'}
                    </span>
                  </td>
                ),
                edad: (item: any) => (
                  <td>
                    <span className="badge bg-body border text-primary font-monospace">
                      {item.edad !== undefined && item.edad !== '' && item.edad !== '-' ? item.edad : 'Sin registrar'}
                    </span>
                  </td>
                ),
                celular: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-success">
                      {item.celular && item.celular !== '-' ? item.celular : 'Sin registrar'}
                    </span>
                  </td>
                ),
                telefono: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-secondary">
                      {item.telefono && item.telefono !== '-' ? item.telefono : 'Sin registrar'}
                    </span>
                  </td>
                ),
                tituloLibro: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.tituloLibro && item.tituloLibro !== '-' ? item.tituloLibro : 'Sin registrar'}
                    </span>
                  </td>
                ),
                isbn: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-muted">
                      {item.isbn && item.isbn !== '-' ? item.isbn : 'Sin registrar'}
                    </span>
                  </td>
                ),
                autor: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.autor && item.autor !== '-' ? item.autor : 'Sin registrar'}
                    </span>
                  </td>
                ),
                precioLibro: (item: any) => (
                  <td>
                    <span className="font-monospace small text-success fw-semibold">
                      {item.precioLibro}
                    </span>
                  </td>
                ),
                detallePrestamo: (item: any) => (
                  <td>
                    <span className="font-monospace small text-muted">
                      {item.detallePrestamo && item.detallePrestamo !== '-' ? item.detallePrestamo : 'Sin registrar'}
                    </span>
                  </td>
                ),
                estadoPrestamo: (item: any) => {
                  const est = item.estadoPrestamo
                  const badgeClass =
                    est === 'Devuelto'
                      ? 'bg-success-subtle text-success border border-success-subtle'
                      : est === 'Sancionado'
                        ? 'bg-danger-subtle text-danger border border-danger-subtle'
                        : 'bg-warning-subtle text-warning border border-warning-subtle'
                  return (
                    <td>
                      <span className={`badge font-monospace ${badgeClass}`}>
                        {est}
                      </span>
                    </td>
                  )
                },
                inicioPrestamo: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-info">
                      {item.inicioPrestamo && item.inicioPrestamo !== '-' ? item.inicioPrestamo : 'Sin registrar'}
                    </span>
                  </td>
                ),
                finPrestamo: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-info">
                      {item.finPrestamo && item.finPrestamo !== '-' ? item.finPrestamo : 'Sin registrar'}
                    </span>
                  </td>
                ),
                fechaEntrega: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-primary">
                      {item.fechaEntrega && item.fechaEntrega !== '-' ? item.fechaEntrega : 'Sin registrar'}
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
          Mostrando <strong>{prestamos.length}</strong> registro(s)
        </div>
        <div className="d-flex gap-2">
          <CButton size="sm" color="danger" variant="outline" className="hover:text-white shadow-sm" onClick={handleClose} disabled={isLoading}>
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>

          {canDescargarLibrosPendientes && (
            <CButton
              color="success"
              variant="outline"
              size="sm"
              className="hover:text-white shadow-sm"
              onClick={handleDescargarExcel}
              disabled={
                isLoading ||
                !haBuscado ||
                prestamos.length === 0 ||
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

export default PendientesModal