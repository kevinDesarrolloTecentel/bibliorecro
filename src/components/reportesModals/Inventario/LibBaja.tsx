import React, { useState, useMemo } from 'react'
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
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilExitToApp,
  cilSave,
  cilSync,
} from '@coreui/icons'
import {
  useReporteLibrosBaja,
  LibroInventarioItem,
} from '@/hooks/reportes/inventario/useLibroBaja'

export interface LibBajaProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const LibBajaModal: React.FC<LibBajaProps> = ({ visible, setVisible }) => {
  const [tableKey, setTableKey] = useState<number>(0)

  const {
    handleReset,
    anoBaja,
    setAnoBaja,
    libros,
    isLoading,
    handleGetLibrosBaja,
    excelLink,
    handleDescargarExcel,
    haBuscado,
    canGenerarLibrosBaja,
    canDescargarLibrosBaja,
  } = useReporteLibrosBaja()

  const handleFullReset = () => {
    handleReset()
    setTableKey((prev: number) => prev + 1)
  }

  const handleClose = () => {
    handleFullReset()
    setVisible(false)
  }

  const tableItems = useMemo(() => {
    return libros.map((l: LibroInventarioItem) => {
      const idLibro =
        l.ID_LIBROS !== undefined && l.ID_LIBROS !== null && l.ID_LIBROS !== ''
          ? String(l.ID_LIBROS)
          : 'Sin registrar'
      const isbn = l.ISBN_LIBROS?.trim() || 'Sin registrar'
      const tituloLibro = l.TITULO_LIBROS?.trim() || 'Sin registrar'

      const val = l.PRECIO_LIBROS
      const precioNum = Number(val)
      const precioLibro =
        val !== undefined && val !== null && val !== '' && !isNaN(precioNum)
          ? `$${precioNum.toFixed(2)}`
          : '$0.00'

      const codigoBarras = l.CODIGODEBARRAS_LIBROS?.trim() || 'Sin registrar'
      const tituloTejuelo = l.TITULOTEJUELO_LIBROS?.trim() || 'Sin registrar'
      const autorTejuelo = l.AUTORTEJUELO_LIBROS?.trim() || 'Sin registrar'

      return {
        ...l,
        idLibro,
        isbn,
        tituloLibro,
        precioLibro,
        codigoBarras,
        tituloTejuelo,
        autorTejuelo,
      }
    })
  }, [libros])

  const columns = [
    {
      key: 'idLibro',
      label: 'ID libro',
      _style: { minWidth: '100px' },
    },
    {
      key: 'isbn',
      label: 'ISBN',
      _style: { minWidth: '140px' },
    },
    {
      key: 'tituloLibro',
      label: 'Titulo del libro',
      _style: { minWidth: '220px' },
    },
    {
      key: 'precioLibro',
      label: 'Precio del libro',
      _style: { minWidth: '130px' },
    },
    {
      key: 'codigoBarras',
      label: 'Código de barras',
      _style: { minWidth: '180px' },
    },
    {
      key: 'tituloTejuelo',
      label: 'Titulo tejuelo',
      _style: { minWidth: '150px' },
    },
    {
      key: 'autorTejuelo',
      label: 'Autor tejuelo',
      _style: { minWidth: '150px' },
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
          <span>Libros Dados de Baja</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Filtro por Año de Baja
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">Año</CFormLabel>
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
                  date={anoBaja ? new Date(Number(anoBaja), 0, 1, 12, 0, 0) : null}
                  onDateChange={(val: any) => {
                    if (!val) {
                      setAnoBaja('')
                      return
                    }
                    if (typeof val === 'string') {
                      const match = val.match(/\b(19\d{2}|20\d{2})\b/) || val.match(/^(\d{4})/)
                      if (match) {
                        setAnoBaja(match[1])
                        return
                      }
                    }
                    if (val instanceof Date && !isNaN(val.getTime())) {
                      const year = val.getHours() >= 18 ? val.getUTCFullYear() : val.getFullYear()
                      setAnoBaja(String(year))
                      return
                    }
                  }}
                />
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                {canGenerarLibrosBaja && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGetLibrosBaja()
                    }}
                    disabled={isLoading || !anoBaja}
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
              Libros Dados de Baja
            </span>
            <span className="text-body-secondary small">
              Total libros: <strong>{libros.length}</strong>
            </span>
          </CCardHeader>
          <CCardBody className="p-0">
            <CSmartTable
              key={tableKey}
              activePage={1}
              columns={columns}
              columnSorter
              tableFilter={haBuscado && !isLoading && libros.length > 0}
              tableFilterLabel="Buscar:"
              tableFilterPlaceholder="Buscar en la tabla..."
              loading={isLoading}
              cleaner
              items={tableItems}
              itemsPerPage={60}
              pagination
              noItemsLabel={
                isLoading
                  ? 'Cargando libros dados de baja...'
                  : haBuscado
                    ? 'No se encontraron libros dados de baja para el año seleccionado'
                    : 'Seleccione un año y haga clic en Generar para ver el reporte'
              }
              scopedColumns={{
                idLibro: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-muted">
                      {item.idLibro && item.idLibro !== '-' ? item.idLibro : 'Sin registrar'}
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
                tituloLibro: (item: any) => (
                  <td>
                    <span className="font-monospace small fw-semibold">
                      {item.tituloLibro && item.tituloLibro !== '-' ? item.tituloLibro : 'Sin registrar'}
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
                codigoBarras: (item: any) => (
                  <td>
                    <span className="font-monospace small text-primary badge bg-body border">
                      {item.codigoBarras && item.codigoBarras !== '-' ? item.codigoBarras : 'Sin registrar'}
                    </span>
                  </td>
                ),
                tituloTejuelo: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-secondary">
                      {item.tituloTejuelo && item.tituloTejuelo !== '-' ? item.tituloTejuelo : 'Sin registrar'}
                    </span>
                  </td>
                ),
                autorTejuelo: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-secondary">
                      {item.autorTejuelo && item.autorTejuelo !== '-' ? item.autorTejuelo : 'Sin registrar'}
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
          Mostrando <strong>{libros.length}</strong> libro(s)
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

          {canDescargarLibrosBaja && (
            <CButton
              color="success"
              variant="outline"
              size="sm"
              className="hover:text-white shadow-sm"
              onClick={handleDescargarExcel}
              disabled={
                isLoading ||
                !haBuscado ||
                libros.length === 0 ||
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

export default LibBajaModal