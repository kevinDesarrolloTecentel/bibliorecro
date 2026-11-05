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
      const isbn = l.ISBN_LIBROS || l.isbn || 'S/N'
      const titulo = l.TITULO_LIBROS || l.titulo || 'Sin título'
      const codigo = l.CODIGODEBARRAS_LIBROS || l.codigo || 'S/C'

      return {
        ...l,
        isbn,
        titulo,
        codigo,
      }
    })
  }, [libros])

  const columns = [
    {
      key: 'isbn',
      label: 'ISBN',
      _style: { width: '20%' },
    },
    {
      key: 'titulo',
      label: 'Título',
      _style: { width: '55%' },
    },
    {
      key: 'codigo',
      label: 'Código de Barras',
      _style: { width: '25%' },
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
              Total recibidos: <strong>{libros.length}</strong>
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
              cleaner
              items={tableItems}
              itemsPerPage={60}
              pagination
              noItemsLabel={
                haBuscado
                  ? 'No se encontraron libros en el sistema'
                  : 'Haga clic en Generar para cargar los libros del sistema'
              }
              scopedColumns={{
                isbn: (item: any) => (
                  <td>
                    <span className="font-monospace small text-muted badge bg-body border">
                      {item.isbn}
                    </span>
                  </td>
                ),
                titulo: (item: any) => (
                  <td>
                    <span className="font-monospace small fw-semibold">
                      {item.titulo}
                    </span>
                  </td>
                ),
                codigo: (item: any) => (
                  <td>
                    <span className="font-monospace small text-primary badge bg-body border">
                      {item.codigo}
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