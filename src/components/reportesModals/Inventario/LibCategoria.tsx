import React, { useState, useMemo } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
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
import { SearchableSelect } from '@/components/details_bk/SearchableSelect'
import {
  useReporteLibrosCategoria,
  LibroInventarioItem,
} from '@/hooks/reportes/inventario/useLibroCategoria'

export interface LibCategoriaProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const LibCategoriaModal: React.FC<LibCategoriaProps> = ({ visible, setVisible }) => {
  const [tableKey, setTableKey] = useState<number>(0)

  const {
    libros,
    categorias,
    selectedValue,
    setSelectedValue,
    handleReset,
    handleGetLibrosCategoria,
    handleDescargarExcel,
    excelLink,
    haBuscado,
    isLoading,
    canGenerarLibrosCategoria,
    canDescargarLibrosCategoria,
  } = useReporteLibrosCategoria()

  const handleFullReset = () => {
    handleReset()
    setTableKey((prev: number) => prev + 1)
  }

  const handleClose = () => {
    handleFullReset()
    setVisible(false)
  }

  const handleCategoryChange = (val: string | number) => {
    const found = categorias.find((c) => String(c.value) === String(val))
    setSelectedValue(found || null)
  }

  const tableItems = useMemo(() => {
    return libros.map((l: LibroInventarioItem) => {
      const isbn = l.ISBN_LIBROS || l.isbn || ''
      const titulo = l.TITULO_LIBROS || l.titulo || ''
      const titulotej = l.TITULOTEJUELO_LIBROS || l.titulotej || 'S/N'
      const autortej = l.AUTORTEJUELO_LIBROS || l.autortej || 'S/A'
      const rawPrecio = l.PRECIO_LIBROS ?? l.precio
      const precioDisplay =
        rawPrecio !== undefined && rawPrecio !== null && rawPrecio !== ''
          ? `$${Number(rawPrecio).toFixed(2)}`
          : '$0.00'
      const codigo = l.CODIGODEBARRAS_LIBROS || l.codigo || 'S/C'

      return {
        ...l,
        isbn,
        titulo,
        titulotej,
        autortej,
        precio: rawPrecio,
        precioDisplay,
        codigo,
      }
    })
  }, [libros])

  const columns = [
    {
      key: 'isbn',
      label: 'ISBN',
      _style: { width: '16%' },
    },
    {
      key: 'titulo',
      label: 'Título',
      _style: { width: '24%' },
    },
    {
      key: 'titulotej',
      label: 'Título Tejuelo',
      _style: { width: '15%' },
    },
    {
      key: 'autortej',
      label: 'Autor Tejuelo',
      _style: { width: '15%' },
    },
    {
      key: 'precio',
      label: 'Precio',
      _style: { width: '12%' },
    },
    {
      key: 'codigo',
      label: 'Código de Barras',
      _style: { width: '18%' },
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
          <span>Libros por Categoría</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Filtro por Categoría
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">Categoría</CFormLabel>
                <SearchableSelect
                  name="categoria"
                  value={selectedValue?.value ?? ''}
                  onChange={handleCategoryChange}
                  options={categorias}
                  placeholder="Seleccione o escriba para buscar..."
                />
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                {canGenerarLibrosCategoria && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGetLibrosCategoria()
                    }}
                    disabled={isLoading || !selectedValue}                  >
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
              Libros por Categoría
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
              tableFilterPlaceholder="Buscar en la tabla..."
              loading={isLoading}
              cleaner
              items={tableItems}
              itemsPerPage={60}
              pagination
              noItemsLabel={
                isLoading
                  ? 'Cargando libros por categoría...'
                  : haBuscado
                    ? 'No se encontraron libros para la categoría seleccionada'
                    : 'Seleccione una categoría y haga clic en Generar para ver el reporte'
              }
              scopedColumns={{
                isbn: (item: any) => (
                  <td>
                    <span className="font-monospace small text-muted badge bg-body border">
                      {item.isbn || '-'}
                    </span>
                  </td>
                ),
                titulo: (item: any) => (
                  <td>
                    <span className="font-monospace small">{item.titulo || '-'}</span>
                  </td>
                ),
                titulotej: (item: any) => (
                  <td>
                    <span className="font-monospace small">{item.titulotej || '-'}</span>
                  </td>
                ),
                autortej: (item: any) => (
                  <td>
                    <span className="font-monospace small">{item.autortej || '-'}</span>
                  </td>
                ),
                precio: (item: any) => (
                  <td>
                    <span className="font-monospace small text-success badge bg-body border">
                      {item.precioDisplay}
                    </span>
                  </td>
                ),
                codigo: (item: any) => (
                  <td>
                    <span className="font-monospace small text-primary badge bg-body border">
                      {item.codigo || '-'}
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
            size="sm"
            variant="outline"
            className="hover:text-white shadow-sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>

          {canDescargarLibrosCategoria && (
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

export default LibCategoriaModal