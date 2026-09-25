import React from 'react'
import {
  useReporteHistorialLibrosUsuario,
  PrestamoReporteItem,
} from '@/hooks/reportes/useReporteUsuarios'
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
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSmartTable,
  CSpinner,
} from '@coreui/react-pro'

export interface HistLibProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const LibroUModal: React.FC<HistLibProps> = ({ visible, setVisible }) => {
  const {
    cedula,
    setCedula,
    libros,
    isLoading,
    excelLink,
    handleGetPrestamos,
    handleDescargarExcel,
    handleReset,
  } = useReporteHistorialLibrosUsuario()

  const handleClose = () => {
    handleReset()
    setVisible(false)
  }

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '12%' },
    },
    {
      key: 'apellido',
      label: 'Apellido',
      _style: { width: '12%' },
    },
    {
      key: 'isbn',
      label: 'ISBN',
      _style: { width: '16%' },
    },
    {
      key: 'titulo',
      label: 'Nombre del Libro',
      _style: { width: '18%' },
    },
    {
      key: 'nombreaut',
      label: 'Autor del Libro',
      _style: { width: '16%' },
    },
    {
      key: 'precio',
      label: 'Costo del Libro',
      _style: { width: '12%' },
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
          <span>Historial de Libros por Usuario</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 ">
              Búsqueda por Identificación
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">Ingrese el número de cédula:</CFormLabel>
                <CInputGroup size="sm">
                  <CInputGroupText>Cédula</CInputGroupText>
                  <CFormInput
                    type="text"
                    placeholder="Ingrese el número de cédula"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                <CButton
                  color="primary"
                  variant='outline'
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGetPrestamos}
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
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  title="Limpiar filtros"
                  onClick={handleReset}
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
            <span className="fw-semibold">
              Historial de Libros Prestados
            </span>
            <span className="text-body-secondary small">
              Total libros: <strong>{libros.length}</strong>
            </span>
          </CCardHeader>
          <CCardBody className="p-0">
            <CSmartTable
              activePage={1}
              clickableRows
              columns={columns}
              columnSorter
              items={libros}
              itemsPerPage={60}
              noItemsLabel={
                isLoading
                  ? 'Cargando registros...'
                  : <div className='d-flex justify-content-center '>
                    <CSpinner color='primary' size='sm' variant='grow' />
                  </div>
              }
              scopedColumns={{
                nombre: (item: PrestamoReporteItem) => (
                  <td>
                    <span className='font-monospace small'>
                      {item.NOMBRE_PERSONA}
                    </span>
                  </td>
                ),
                apellido: (item: PrestamoReporteItem) => (
                  <td>
                    <span className='font-monospace small'>
                      {item.APELLIDO_PERSONA}
                    </span>
                  </td>
                ),
                isbn: (item: PrestamoReporteItem) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-muted">
                      {item.ISBN_LIBROS}
                    </span>
                  </td>
                ),
                titulo: (item: PrestamoReporteItem) => (
                  <td>
                    <span className='font-monospace small'>
                      {item.TITULO_LIBROS}
                    </span>
                  </td>
                ),
                nombreaut: (item: PrestamoReporteItem) => (
                  <td>
                    <span className='font-monospace small'>
                      {item.NOMBRE_AUTOR}
                    </span>
                  </td>
                ),
                precio: (item: PrestamoReporteItem) => (
                  <td>
                    <span className="font-monospace badge bg-white border text-success">
                      {item.PRECIO_LIBROS !== undefined && item.PRECIO_LIBROS !== null
                        ? `$${Number(item.PRECIO_LIBROS).toFixed(2)}`
                        : '-'}
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
          Mostrando <strong>{libros.length}</strong> registro(s)
        </div>
        <div className="d-flex gap-2">
          <CButton color="danger" variant="outline" className='hover:text-white' onClick={handleClose}>
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>
          {excelLink && (
            <CButton
              color="success"
              variant="outline"
              className='hover:text-white'
              onClick={handleDescargarExcel}
            >
              <CIcon icon={cilCloudDownload} className="me-1" />
              Descargar
            </CButton>
          )}
        </div>
      </CModalFooter>
    </CModal>
  )
}

export default LibroUModal