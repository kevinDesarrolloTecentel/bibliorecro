import React, { useState, useMemo } from 'react'
import {
  useReporteHistorialLibrosUsuario,
  PrestamoReporteItem,
} from '@/hooks/reportes/usuarios/useReporteHistorialLibros'
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
  const [tableKey, setTableKey] = useState<number>(0)

  const {
    cedula,
    setCedula,
    libros,
    isLoading,
    excelLink,
    haBuscado,
    handleGetPrestamos,
    handleDescargarExcel,
    handleReset,
    canGenerarLibrosUsuario,
    canDescargarLibrosUsuarios,
  } = useReporteHistorialLibrosUsuario()

  const handleFullReset = () => {
    handleReset()
    setTableKey((prev: number) => prev + 1)
  }

  const handleClose = () => {
    handleFullReset()
    setVisible(false)
  }

  const bloquearCaracteresNoNumericos = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
      e.preventDefault()
    }
  }

  const tableItems = useMemo(() => {
    return libros.map((item: PrestamoReporteItem) => {
      const nombre =
        item.NOMBRE_PERSONA ||
        item.nombre_persona ||
        item.nombre ||
        item.persona?.NOMBRE_PERSONA ||
        item.persona?.nombre ||
        ''
      const apellido =
        item.APELLIDO_PERSONA ||
        item.apellido_persona ||
        item.apellido ||
        item.persona?.APELLIDO_PERSONA ||
        item.persona?.apellido ||
        ''
      const isbn =
        item.ISBN_LIBROS ||
        item.isbn_libros ||
        item.isbn ||
        item.libro?.ISBN_LIBROS ||
        item.libro?.isbn ||
        ''
      const titulo =
        item.TITULO_LIBROS ||
        item.titulo_libros ||
        item.titulo ||
        item.libro?.TITULO_LIBROS ||
        item.libro?.titulo ||
        ''
      const nombreaut =
        item.NOMBRE_AUTOR ||
        item.nombre_autor ||
        item.autor ||
        item.libro?.NOMBRE_AUTOR ||
        item.libro?.autor?.NOMBRE_AUTOR ||
        item.libro?.autor?.nombre ||
        item.libro?.autor ||
        ''
      const val =
        item.PRECIO_LIBROS ??
        item.precio_libros ??
        item.precio ??
        item.libro?.PRECIO_LIBROS ??
        item.libro?.precio
      const precio =
        val !== undefined && val !== null && val !== '' ? `$${Number(val).toFixed(2)}` : '-'

      return {
        ...item,
        nombre,
        apellido,
        isbn,
        titulo,
        nombreaut,
        precio,
      }
    })
  }, [libros])

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '15%' },
    },
    {
      key: 'apellido',
      label: 'Apellido',
      _style: { width: '15%' },
    },
    {
      key: 'isbn',
      label: 'ISBN',
      _style: { width: '15%' },
    },
    {
      key: 'titulo',
      label: 'Nombre del Libro',
      _style: { width: '22%' },
    },
    {
      key: 'nombreaut',
      label: 'Autor del Libro',
      _style: { width: '20%' },
    },
    {
      key: 'precio',
      label: 'Costo del Libro',
      _style: { width: '13%' },
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
          <span>Historial de Libros por Usuario</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Búsqueda por Identificación
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">
                  Ingrese el número de cédula:
                </CFormLabel>
                <CInputGroup size="sm">
                  <CInputGroupText>Cédula</CInputGroupText>
                  <CFormInput
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Ingrese el número de cédula"
                    value={cedula}
                    onKeyDown={bloquearCaracteresNoNumericos}
                    onChange={(e) =>
                      setCedula(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                {canGenerarLibrosUsuario && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGetPrestamos()
                    }}
                    disabled={
                      isLoading ||
                      cedula.trim().length !== 10
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
          </CCardBody>
        </CCard>

        <CCard className="border shadow-sm">
          <CCardHeader className="d-flex justify-content-between align-items-center bg-transparent py-2">
            <span className="fw-semibold small text-uppercase">
              Historial de Libros Prestados
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
              tableFilterPlaceholder="Buscar en el historial..."
              loading={isLoading}
              cleaner
              items={tableItems}
              itemsPerPage={60}
              pagination
              noItemsLabel={
                isLoading
                  ? 'Cargando historial de lirbros...'
                  : haBuscado
                    ? 'No se encontraron registros para la cédula ingresada'
                    : 'Ingrese un número de cédula y haga clic en Generar para ver el reporte'
              }
              scopedColumns={{
                nombre: (item: any) => (
                  <td>
                    <span className="font-monospace small">{item.nombre || '-'}</span>
                  </td>
                ),
                apellido: (item: any) => (
                  <td>
                    <span className="font-monospace small">{item.apellido || '-'}</span>
                  </td>
                ),
                isbn: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-muted">
                      {item.isbn || '-'}
                    </span>
                  </td>
                ),
                titulo: (item: any) => (
                  <td>
                    <span className="font-monospace small">{item.titulo || '-'}</span>
                  </td>
                ),
                nombreaut: (item: any) => (
                  <td>
                    <span className="font-monospace small">{item.nombreaut || '-'}</span>
                  </td>
                ),
                precio: (item: any) => (
                  <td>
                    <span className="font-monospace badge bg-body border text-success fw-semibold">
                      {item.precio}
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

          {canDescargarLibrosUsuarios && (
            <CButton
              color="success"
              size="sm"
              variant="outline"
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

export default LibroUModal