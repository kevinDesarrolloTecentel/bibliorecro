import React, { useState, useMemo } from 'react'
import {
  useReportePrestamosMensuales,
  PrestamoReporteItem,
} from '@/hooks/reportes/prestamos/usePrestamosMensuales'
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
import { formatFecha } from '@/utils/dateUtils'

const formatFechaDisplay = (fecha?: string | null) => {
  if (!fecha) return 'Sin registrar'
  const res = formatFecha(fecha)
  return res === 'No registrada' || res === '-' ? 'Sin registrar' : res
}

export interface PrestamoMProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const PrestamoMModal: React.FC<PrestamoMProps> = ({ visible, setVisible }) => {
  const [tableKey, setTableKey] = useState<number>(0)

  const {
    fechaMes,
    setFechaMes,
    prestamos,
    isLoading,
    excelLink,
    haBuscado,
    handleGetMes,
    handleDescargarExcel,
    handleReset,
    canGenerarPrestamosMensuales,
    canDescargarPrestamosMensuales,
  } = useReportePrestamosMensuales()

  const handleFullReset = () => {
    handleReset()
    setTableKey((prev: number) => prev + 1)
  }

  const handleClose = () => {
    handleFullReset()
    setVisible(false)
  }

  const currentDate = useMemo(() => {
    if (!fechaMes) return null
    const [y, m] = fechaMes.split('-').map(Number)
    if (!y || !m) return null
    return new Date(y, m - 1, 1, 12, 0, 0)
  }, [fechaMes])

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
          <span>Préstamos Mensuales</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Seleccione el Mes y Año Requeridos
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">Año y Mes</CFormLabel>
                <CDatePicker
                  key={tableKey}
                  size="sm"
                  locale="es-ES"
                  selectionType="month"
                  placeholder="Seleccione el mes y año"
                  cleaner
                  inputReadOnly
                  inputDateFormat={(date: Date) => {
                    if (!date || isNaN(date.getTime())) return ''
                    const d = date.getHours() >= 18 ? new Date(date.getTime() + 6 * 3600 * 1000) : date
                    const monthName = d.toLocaleDateString('es-ES', { month: 'long' })
                    const year = d.getFullYear()
                    return `${monthName} de ${year}`
                  }}
                  inputDateParse={(val: string | Date) => {
                    if (val instanceof Date) return val
                    if (typeof val === 'string') {
                      const match = val.match(/^(\d{4})-(\d{1,2})/)
                      if (match) {
                        return new Date(Number(match[1]), Number(match[2]) - 1, 1, 12, 0, 0)
                      }
                    }
                    return new Date(val)
                  }}
                  date={currentDate}
                  onDateChange={(val: any) => {
                    if (!val) {
                      setFechaMes('')
                      return
                    }
                    if (val instanceof Date && !isNaN(val.getTime())) {
                      const d = val.getHours() >= 18 ? new Date(val.getTime() + 6 * 3600 * 1000) : val
                      const y = d.getFullYear()
                      const m = String(d.getMonth() + 1).padStart(2, '0')
                      setFechaMes(`${y}-${m}`)
                      return
                    }
                    if (typeof val === 'string') {
                      const match = val.match(/^(\d{4})-(\d{1,2})/)
                      if (match) {
                        setFechaMes(`${match[1]}-${match[2].padStart(2, '0')}`)
                        return
                      }
                      setFechaMes(val)
                    }
                  }}
                />
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                {canGenerarPrestamosMensuales && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGetMes()
                    }}
                    disabled={isLoading || !fechaMes}
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
              Préstamos del Mes
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
                  ? 'Cargando préstamos mensuales...'
                  : haBuscado
                    ? 'No se encontraron préstamos para el mes y año seleccionados'
                    : 'Seleccione un mes y año, y haga clic en Generar para ver el reporte'
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

          {canDescargarPrestamosMensuales && (
            <CButton
              color="success"
              size="sm"
              variant="outline"
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

export default PrestamoMModal