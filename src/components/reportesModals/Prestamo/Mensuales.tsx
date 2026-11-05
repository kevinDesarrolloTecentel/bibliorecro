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
      const titulo = item.TITULO_LIBROS || ''
      const fechaEntrega = item.FECHAFIN_PRESTAMO
        ? new Date(item.FECHAFIN_PRESTAMO).toLocaleDateString()
        : '-'
      const cedula = item.IDENTIFICACION_PERSONA || ''
      const nombre = item.NOMBRE_PERSONA || ''
      const apellido = item.APELLIDO_PERSONA || ''
      const correo = item.CORREO_PERSONA || ''
      const telefono = item.TELEFONO_PERSONA || ''

      return {
        ...item,
        titulo,
        fechaEntrega,
        cedula,
        nombre,
        apellido,
        correo,
        telefono,
      }
    })
  }, [prestamos])

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
                  ? 'No se encontraron préstamos para el mes y año seleccionados'
                  : 'Seleccione un mes y año, y haga clic en Generar para ver el reporte'
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
                apellido: (item: any) => (
                  <td>
                    <span className="font-monospace small">
                      {item.apellido}
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
                telefono: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border rounded-pill text-success">
                      {item.telefono || '-'}
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