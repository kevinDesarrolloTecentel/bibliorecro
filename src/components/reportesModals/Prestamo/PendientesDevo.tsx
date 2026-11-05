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
      const titulo = item.TITULO_LIBROS || ''
      const fechaEntrega = item.FECHAFIN_PRESTAMO
        ? new Date(item.FECHAFIN_PRESTAMO).toLocaleDateString()
        : '-'
      const cedula = item.IDENTIFICACION_PERSONA || ''
      const nombre =
        [item.NOMBRE_PERSONA, item.APELLIDO_PERSONA].filter(Boolean).join(' ') ||
        item.NOMBRE_PERSONA ||
        ''
      const correo = item.CORREO_PERSONA || ''
      const celular = item.CELULAR_PERSONA || ''
      const telefono = item.TELEFONO_PERSONA || ''
      const referencias = item.DETALLE_PERSONA || ''

      return {
        ...item,
        titulo,
        fechaEntrega,
        cedula,
        nombre,
        correo,
        celular,
        telefono,
        referencias,
      }
    })
  }, [prestamos])

  const columns = [
    {
      key: 'titulo',
      label: 'Título',
      _style: { width: '18%' },
    },
    {
      key: 'fechaEntrega',
      label: 'Fecha de Entrega',
      _style: { width: '12%' },
    },
    {
      key: 'cedula',
      label: 'Cédula',
      _style: { width: '10%' },
    },
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '14%' },
    },
    {
      key: 'correo',
      label: 'Correo',
      _style: { width: '16%' },
    },
    {
      key: 'celular',
      label: 'Celular',
      _style: { width: '10%' },
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      _style: { width: '10%' },
    },
    {
      key: 'referencias',
      label: 'Referencias',
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
              Total recibidos: <strong>{prestamos.length}</strong>
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
              cleaner
              items={tableItems}
              itemsPerPage={60}
              pagination
              noItemsLabel={
                haBuscado
                  ? 'No se encontraron libros pendientes en el rango de fechas seleccionado'
                  : 'Seleccione un rango de fechas para generar el reporte'
              }
              scopedColumns={{
                titulo: (item: any) => (
                  <td>
                    <span className="font-monospace small fw-semibold">
                      {item.titulo}
                    </span>
                  </td>
                ),
                fechaEntrega: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-primary">
                      {item.fechaEntrega}
                    </span>
                  </td>
                ),
                cedula: (item: any) => (
                  <td>
                    <span className="font-monospace small text-muted badge bg-body border">
                      {item.cedula}
                    </span>
                  </td>
                ),
                nombre: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.nombre}
                    </span>
                  </td>
                ),
                correo: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-muted rounded-pill py-1 px-2">
                      {item.correo || '-'}
                    </span>
                  </td>
                ),
                celular: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border rounded-pill text-primary">
                      {item.celular || '-'}
                    </span>
                  </td>
                ),
                telefono: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border rounded-pill text-success">
                      {item.telefono || '-'}
                    </span>
                  </td>
                ),
                referencias: (item: any) => (
                  <td>
                    <span className="font-monospace small text-muted" style={{ whiteSpace: 'pre-line' }}>
                      {item.referencias || '-'}
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
          <CButton size="sm" color="danger" variant="outline" className="hover:text-white shadow-sm" onClick={handleClose}>
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