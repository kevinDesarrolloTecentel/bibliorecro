import React, { useState, useMemo } from 'react'
import {
  useReportePrestamosAnuales,
  PrestamoReporteItem,
} from '@/hooks/reportes/prestamos/usePrestamosAnuales'
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

export interface PrestamoAProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const PrestamoAModal: React.FC<PrestamoAProps> = ({ visible, setVisible }) => {
  const [tableKey, setTableKey] = useState<number>(0)

  const {
    fechaAno,
    setFechaAno,
    prestamos,
    isLoading,
    excelLink,
    haBuscado,
    handleGetAnual,
    handleDescargarExcel,
    handleReset,
    canGenerarPrestamosAnuales,
    canDescargarPrestamosAnuales,
  } = useReportePrestamosAnuales()

  const handleFullReset = () => {
    handleReset()
    setTableKey((prev: number) => prev + 1)
  }

  const handleClose = () => {
    handleFullReset()
    setVisible(false)
  }

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
          <span>Préstamos Anuales</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Seleccione el Año Requerido
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">Año de Préstamo</CFormLabel>
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
                  date={fechaAno ? new Date(Number(fechaAno), 0, 1, 12, 0, 0) : null}
                  onDateChange={(val: any) => {
                    if (!val) {
                      setFechaAno('')
                      return
                    }
                    if (typeof val === 'string') {
                      const match = val.match(/\b(19\d{2}|20\d{2})\b/) || val.match(/^(\d{4})/)
                      if (match) {
                        setFechaAno(match[1])
                        return
                      }
                    }
                    if (val instanceof Date && !isNaN(val.getTime())) {
                      const year = val.getHours() >= 18 ? val.getUTCFullYear() : val.getFullYear()
                      setFechaAno(String(year))
                      return
                    }
                  }}
                />
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                {canGenerarPrestamosAnuales && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGetAnual()
                    }}
                    disabled={isLoading || !fechaAno}                  >
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
              Préstamos Registrados en el Año
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
                  ? 'No se encontraron préstamos para el año seleccionado'
                  : 'Seleccione un año y haga clic en Generar para ver el reporte'
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

          {canDescargarPrestamosAnuales && (
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

export default PrestamoAModal