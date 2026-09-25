import { CategoriaOption, useReporteLibrosCategoria } from "@/hooks/reportes/useReporteInventario"
import { cilBook, cilCloudDownload, cilExitToApp } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSmartTable } from "@coreui/react-pro"
import Select, { SingleValue } from "react-select"

export interface LibCategoriaProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const LibCategoriaModal: React.FC<LibCategoriaProps> = ({ visible, setVisible }) => {
  const {
    libros,
    categorias,
    selectedValue,
    setSelectedValue,
    handleReset,
    setSearchTerm,
    handleGetLibrosCategoria,
    handleDescargarExcel,
    excelLink
  } = useReporteLibrosCategoria()

  const handleClose = () => {
    handleReset()
    setVisible(false)
  }

  const handleSelectChange = (option: SingleValue<CategoriaOption>) => {
    setSelectedValue(option)
  }

  const handleSearchChange = (inputVal: string) => {
    setSearchTerm(inputVal)
  }
  const columns = [
    {
      key: 'isbn',
      label: 'ISBN',
      _style: { width: '15%' },
    },
    {
      key: 'titulo',
      label: 'Título',
      _style: { width: '25%' }
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
      _style: { width: '10%' },
    },
    {
      key: 'codigo',
      label: 'Código de Barras',
      _style: { width: '20%' },
    },
  ]
  return (
    <>
      <CModal
        size="xl"
        visible={visible}
        onClose={handleClose}
        scrollable
      >
        <CModalHeader>
          <CModalTitle className="text-secondary">
            <CIcon icon={cilBook} size="xl" className="me-2" />
            Libros por Categoría
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CCol>
              <Select
              className="bg-body"
                options={[{ value: '', label: 'Selecciona una Categoría' }, ...categorias]}
                value={selectedValue}
                onChange={handleSelectChange}
                onInputChange={handleSearchChange}
                placeholder='Selecciona una Categoría'
                isSearchable />
            </CCol>
          </CForm>
          <hr className="my-3" />
          <CCard>
            <CCardHeader>Libros</CCardHeader>
            <CCardBody>
              <p className="badge bg-body border text-primary font-monospace">Total de Libros: <strong>{libros.length}</strong></p>
              <CSmartTable
              
                items={libros.map((l) => ({
                  ...l,
                  isbn: l.ISBN_LIBROS,
                  titulo: l.TITULO_LIBROS,
                  titulotej: l.TITULOTEJUELO_LIBROS,
                  autortej: l.AUTORTEJUELO_LIBROS,
                  precio: l.PRECIO_LIBROS,
                  codigo: l.CODIGODEBARRAS_LIBROS
                }))}
                columns={columns}
                scopedColumns={{
                  isbn: (item: any) => (
                    <td>
                      <span className="font-monospace small text-muted badge bg-body border">{item.ISBN_LIBROS}</span>
                    </td>
                  ),
                  titulo: (item: any) => (
                    <td>
                      <span className="font-monospace small">{item.TITULO_LIBROS}</span>
                    </td>
                  ),
                  titulotej: (item: any) => (
                    <td>
                      <span className="font-monospace small">{item.TITULOTEJUELO_LIBROS || 'S/N'}</span>
                    </td>
                  ),
                  autortej: (item: any) => (
                    <td>
                      <span className="font-monospace small">{item.AUTORTEJUELO_LIBROS || 'S/A'}</span>
                    </td>
                  ),
                  precio: (item: any) => (
                    <td>
                      <span className="font-monospace text-success badge bg-body border">${item.PRECIO_LIBROS || '0.00'}</span>
                    </td>
                  ),
                  codigo: (item: any) => (
                    <td>
                      <span className="font-monospace small text-primary badge bg-body border">{item.CODIGODEBARRAS_LIBROS || 'S/C'}</span>
                    </td>
                  ),
                }}
                tableProps={{
                  className: 'add-this-custom-class',
                  responsive: true,
                  striped: true,
                  hover: true,
                }}
                tableBodyProps={{
                  className: 'align-middle',
                }}
              />
            </CCardBody>
          </CCard>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="danger"
            variant="outline"
            className="hover:text-white"
            onClick={handleClose}
          >
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>
          <CButton
            color="primary"
            variant="outline"
            className="hover:text-white"
            onClick={handleGetLibrosCategoria}
          >
            <CIcon icon={cilBook} className="me-1" />
            Generar
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
          
        </CModalFooter>
      </CModal>
    </>
  )
}
export default LibCategoriaModal