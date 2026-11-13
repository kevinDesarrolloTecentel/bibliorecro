import React, { useState, useMemo } from 'react'
import {
  useReporteLibrosSistema,
  LibroInventarioItem,
} from '@/hooks/reportes/inventario/useLibroSistema'
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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSmartTable,
  CSpinner,
} from '@coreui/react-pro'

export interface LibSistemaProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const LibSistemaModal: React.FC<LibSistemaProps> = ({ visible, setVisible }) => {
  const [tableKey, setTableKey] = useState<number>(0)

  const {
    libros,
    excelLink,
    isLoading,
    haBuscado,
    handleDescargarExcel,
    handleGetLibrosSistema,
    handleReset,
    canGenerarLibrosSistema,
    canDescargarLibrosSistema,
  } = useReporteLibrosSistema()

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
      label: 'Título del libro',
      _style: { minWidth: '220px' },
    },
    {
      key: 'precioLibro',
      label: 'Precio',
      _style: { minWidth: '100px' },
    },
    {
      key: 'codigoBarras',
      label: 'Código de barras',
      _style: { minWidth: '180px' },
    },
    {
      key: 'tituloTejuelo',
      label: 'Título tejuelo',
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
          <span>Reporte de Libros en el Sistema</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Generar Reporte
            </div>
            <CRow className="g-3 align-items-center">
              <CCol xs={12} sm={8} md={8}>

              </CCol>

              <CCol xs={12} sm={4} md={4} className="d-flex gap-2 justify-content-sm-end">
                {canGenerarLibrosSistema && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGetLibrosSistema()
                    }}
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
                )}
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  title="Limpiar reporte"
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
              Listado General de Libros
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
              tableFilterPlaceholder="Buscar libro por título, ISBN..."
              loading={isLoading}
              cleaner
              items={tableItems}
              itemsPerPage={60}
              pagination
              noItemsLabel={
                isLoading
                  ? 'Cargando libros del sistema...'
                  : haBuscado
                    ? 'No se encontraron libros en el sistema'
                    : 'Haga clic en Generar para cargar los libros del sistema'
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

          {canDescargarLibrosSistema && (
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

export default LibSistemaModal