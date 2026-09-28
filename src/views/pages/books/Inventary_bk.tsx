import React from 'react'
import { cilBan, cilBarcode, cilBook, cilCalendar, cilClipboard, cilColorBorder, cilCommentSquare, cilDescription, cilEducation, cilGlobeAlt, cilLibraryBuilding, cilTag, cilTrash, cilTruck, cilUser, cilWallet, } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CCollapse, CContainer, CRow, CSmartPagination, CSmartTable } from '@coreui/react-pro'
import useLibro from '@/hooks/rco-libros/useLibros'
import HeaderLibros from '@/components/details_bk/HeaderLibros'
import Registro_bk from '@/components/details_bk/Register_bk'
import Modal_Edit_bk from '@/components/details_bk/Modal_Edit_bk'

const getBadgeEstado = (status: any) => {
  const s = String(status || '').toLowerCase().trim()
  if (s === 'activo' || s === '1') return 'success'
  if (s === 'inactivo' || s === '0') return 'danger'
  return 'secondary'
}

const getBadgeDisponibilidad = (status: any) => {
  const s = String(status || '').toLowerCase().trim()
  if (s === 'disponible' || s === '0') return 'success'
  if (s === 'en préstamo' || s === 'en prestamo' || s === '1') return 'danger'
  return 'primary'
}

const Inventary: React.FC = () => {
  const libroState = useLibro()
  const {
    libros,
    loading,
    currentPage,
    totalPages,
    totalItems,
    handlePageChange,
    modalRegister,
    setModalRegister,
    modalEdit,
    setModalEdit,
    libroSeleccionado,
    details,
    toggleDetails,
    handleAbrirEditar,
    handleInactivarLibro,
    handleEliminarLibro,
    fetchLibros,
  } = libroState

  const columns = [
    { key: 'ISBN_LIBROS', label: 'ISBN', _style: { width: '10%' } },
    { key: 'TITULO_LIBROS', label: 'Título', _style: { width: '18%' } },
    { key: 'NOMBRE_AUTOR', label: 'Autor', _style: { width: '12%' } },
    { key: 'NOMBRE_CATEGORIA', label: 'Categoría', _style: { width: '12%' } },
    { key: 'show_details', label: '', _style: { width: '1%' }, filter: false, sorter: false },
  ]

  return (
    <CContainer fluid className="mb-4">
      <HeaderLibros libroState={libroState} />

      <Registro_bk
        visible={modalRegister}
        setVisible={setModalRegister}
        onSuccess={() => fetchLibros()}
      />

      <Modal_Edit_bk
        libro={libroSeleccionado}
        visible={modalEdit}
        setVisible={setModalEdit}
        onSuccess={() => fetchLibros()}
      />

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-body py-3 border-bottom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <CIcon icon={cilBook} style={{ color: '#34A6F4' }} size="xl" />
            <h5 className="mb-0 fw-bold text-body">Inventario de Libros</h5>
          </div>
          <span className="badge bg-body text-body border px-2 py-1">
            Total Registros: <strong>{totalItems}</strong>
          </span>
        </CCardHeader>

        <CCardBody className="p-0">
          <CSmartTable
            items={libros.map((l) => ({
              ...l,
              ISBN_LIBROS: l.ISBN_LIBROS || 'S/N',
              TITULO_LIBROS: l.TITULO_LIBROS || '-',
              NOMBRE_AUTOR: l.NOMBRE_AUTOR || 'Sin autor',
              NOMBRE_CATEGORIA: l.NOMBRE_CATEGORIA || 'Sin categoría',
              NOMBRE_EDITORIAL: l.NOMBRE_EDITORIAL || 'Sin editorial',
              NOMBRE_PROVEEDOR: l.NOMBRE_PROVEEDOR || 'Sin proveedor',
              NOMBRE_FORMATOS: l.NOMBRE_FORMATOS || 'Libros',
              NOMBRE_TIPO: l.NOMBRE_TIPO || 'General',
              FECHAEDICION_LIBROS: l.FECHA_EDICION_FORMAT || '-',
              ESTADOS_PRESTAMO: l.EN_PRESTAMO === 0 ? 'Disponible' : 'En préstamo',
              FECHAREGISTRO_LIBROS: l.FECHA_REGISTRO_FORMAT || '-',
              ESTADO: Number(l.ESTADO_LIBROS) === 1 ? 'Activo' : 'Inactivo',
            }))}
            columns={columns}
            loading={loading}
            tableProps={{
              responsive: true,
              hover: true,
              className: 'align-middle mb-0 text-nowrap',
            }}
            scopedColumns={{
              ISBN_LIBROS: (item: any) => (
                <td>
                  <span className="font-monospace small fw-semibold text-body badge bg-body border">
                    {item.ISBN_LIBROS}
                  </span>
                </td>
              ),
              TITULO_LIBROS: (item: any) => (
                <td style={{ minWidth: '200px', whiteSpace: 'normal' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="font-monospace small fw-semibold text-body">{item.TITULO_LIBROS}</span>
                  </div>
                </td>
              ),
              NOMBRE_AUTOR: (item: any) => (
                <td>
                  <span className="font-monospace small fw-semibold text-body">{item.NOMBRE_AUTOR}</span>
                </td>
              ),
              NOMBRE_CATEGORIA: (item: any) => (
                <td>
                  <CBadge className="text-body border px-2 py-1">
                    {item.NOMBRE_CATEGORIA}
                  </CBadge>
                </td>
              ),
              NOMBRE_EDITORIAL: (item: any) => (
                <td>
                  <span className="text-body small">{item.NOMBRE_EDITORIAL}</span>
                </td>
              ),
              NOMBRE_PROVEEDOR: (item: any) => (
                <td>
                  <span className="text-body small">{item.NOMBRE_PROVEEDOR}</span>
                </td>
              ),
              NOMBRE_FORMATOS: (item: any) => (
                <td>
                  <span className="text-body small">{item.NOMBRE_FORMATOS}</span>
                </td>
              ),
              NOMBRE_TIPO: (item: any) => (
                <td>
                  <span className="text-body small">{item.NOMBRE_TIPO}</span>
                </td>
              ),
              FECHAEDICION_LIBROS: (item: any) => (
                <td>
                  <span className="font-monospace small">{item.FECHAEDICION_LIBROS}</span>
                </td>
              ),
              ESTADOS_PRESTAMO: (item: any) => (
                <td>
                  <CBadge
                    color={getBadgeDisponibilidad(item.ESTADOS_PRESTAMO)}
                    shape="rounded-pill"
                    className="px-2 py-1"
                  >
                    {item.ESTADOS_PRESTAMO}
                  </CBadge>
                </td>
              ),
              FECHAREGISTRO_LIBROS: (item: any) => (
                <td>
                  <span className="font-monospace small">{item.FECHAREGISTRO_LIBROS}</span>
                </td>
              ),
              ESTADO: (item: any) => (
                <td>
                  <CBadge
                    color={getBadgeEstado(item.ESTADO)}
                    shape="rounded-pill"
                    className="px-2 py-1"
                  >
                    {item.ESTADO}
                  </CBadge>
                </td>
              ),
              show_details: (item: any) => {
                const isOpened = details.includes(item.id)
                return (
                  <td className="py-2 text-end">
                    <CButton
                      color="primary"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDetails(item.id)}
                      title={isOpened ? 'Ocultar ficha' : 'Ver ficha completa'}
                    >
                      {isOpened ? 'Ocultar' : 'Mostrar'}
                    </CButton>
                  </td>
                )
              },
              details: (item: any) => {
                const isOpened = details.includes(item.id)
                return (
                  <CCollapse visible={isOpened}>
                    <div className="p-3 p-md-4 bg-body-tertiary border-top border-bottom">
                      <CRow className="g-3">
                        <CCol
                          xs={12}
                          md={4}
                          lg={3}
                          className="d-flex flex-column align-items-center justify-content-center text-center border-end-md pb-3 pb-md-0"
                        >
                          <div
                            className="bg-primary bg-opacity-10 text-primary p-3 rounded-4 shadow-sm mb-3 d-flex align-items-center justify-content-center"
                            style={{ width: '120px', height: '120px' }}
                          >
                            <CIcon icon={cilBook} size="3xl" />
                          </div>
                          <h6 className="fw-bold mb-1 text-body">{item.TITULO_LIBROS}</h6>
                          <span className="text-body small mb-2">{item.NOMBRE_AUTOR}</span>
                          <span className="badge bg-body text-body border font-monospace mb-2">
                            ISBN: {item.ISBN_LIBROS}
                          </span>
                          <div className="d-flex gap-2 flex-wrap justify-content-center">
                            <CBadge
                              color={getBadgeDisponibilidad(item.ESTADOS_PRESTAMO)}
                              shape="rounded-pill"
                              className="px-3 py-1"
                            >
                              {item.ESTADOS_PRESTAMO}
                            </CBadge>
                            <CBadge
                              color={getBadgeEstado(item.ESTADO)}
                              shape="rounded-pill"
                              className="px-2 py-1"
                            >
                              {item.ESTADO}
                            </CBadge>
                          </div>
                        </CCol>

                        <CCol xs={12} md={8}>
                          <CRow className="g-2">
                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilGlobeAlt} className="me-1 text-secondary" />
                                    País
                                  </span>
                                  <span className="font-monospace small fw-bold text-body">{item.PAIS_LIBROS || item.Pais || 'No indicado'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilLibraryBuilding} className="me-1 text-secondary" />
                                    Editorial
                                  </span>
                                  <span className="font-monospace small fw-bold text-body">{item.NOMBRE_EDITORIAL || 'No tiene Editorial'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilDescription} className="me-1 text-secondary" />
                                    Formato
                                  </span>
                                  <span className="font-monospace small fw-bold text-body">{item.NOMBRE_FORMATOS || 'Libros'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilTruck} className="me-1 text-secondary" />
                                    Proveedor
                                  </span>
                                  <span className="font-monospace small fw-bold text-body">{item.NOMBRE_PROVEEDOR || 'No tiene Proveedor'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilTag} className="me-1 text-secondary" />
                                    Género
                                  </span>
                                  <span className="font-monospace small fw-bold text-body">{item.NOMBRE_RCOGENERO || item.Genero || 'No tiene Género'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilEducation} className="me-1 text-secondary" />
                                    Tipo
                                  </span>
                                  <span className="font-monospace small fw-bold text-body">{item.NOMBRE_TIPO || 'No tiene Tipo'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilBook} className="me-1 text-secondary" />
                                    Volumen
                                  </span>
                                  <span className="font-monospace small fw-bold text-body">{item.VOLUMEN_LIBROS || 'S/V'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilWallet} className="me-1 text-secondary" />
                                    Precio
                                  </span>
                                  <span className="font-monospace smallfw-bold text-success">${Number(item.PRECIO_LIBROS || 0).toFixed(2)}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilBarcode} className="me-1 text-secondary" />
                                    Código de Barras
                                  </span>
                                  <span className="font-monospace small fw-bold text-body">{item.CODIGODEBARRAS_LIBROS || 'S/C'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilClipboard} className="me-1 text-secondary" />
                                    Título Tejuelo
                                  </span>
                                  <span className="font-monospace smallfw-bold text-body">{item.TITULOTEJUELO_LIBROS || '-'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilUser} className="me-1 text-secondary" />
                                    Autor Tejuelo
                                  </span>
                                  <span className="font-monospace smallfw-bold text-body">{item.AUTORTEJUELO_LIBROS || '-'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilCalendar} className="me-1 text-secondary" />
                                    Fecha de Edición
                                  </span>
                                  <CBadge color='light' shape='rounded-pill' className='px-2 py-1 text-primary'>
                                    <span>{item.FECHAEDICION_LIBROS}</span>
                                  </CBadge>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className='h-100 shadow-sm border-0 bg-body'>
                                <CCardBody className='p-2'>
                                  <span className='text-body small d-block mb-1'>
                                    <CIcon icon={cilCalendar} className='me-1 text-secondary' />
                                    Fecha de Registro
                                  </span>
                                  <CBadge color='light' shape='rounded-pill' className='px-2 py-1 text-success'>
                                    <span>{item.FECHAREGISTRO_LIBROS}</span>
                                  </CBadge>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-body small d-block mb-1">
                                    <CIcon icon={cilCommentSquare} className="me-1 text-secondary" />
                                    Notas y Detalles:
                                  </span>
                                  <span className="text-body small">{item.DESCRIPCION_LIBROS || 'Sin detalles registrados.'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>
                          </CRow>
                        </CCol>
                        <div className='d-flex flex-wrap gap-2 justify-content-end mt-3 pt-2 border-top'>
                          <CButton
                            color="info"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAbrirEditar(item)}
                            title="Editar libro"
                            className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
                          >
                            <CIcon icon={cilColorBorder} />
                            <span>Editar</span>
                          </CButton>
                          <CButton
                            color="warning"
                            variant="outline"
                            size="sm"
                            onClick={() => handleInactivarLibro(item)}
                            title="Dar de baja / Inactivar"
                            className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
                          >
                            <CIcon icon={cilBan} />
                            <span>Inactivar</span>
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEliminarLibro(item)}
                            title="Eliminar libro"
                            className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
                          >
                            <CIcon icon={cilTrash} />
                            <span>Eliminar Libro</span>
                          </CButton>
                        </div>
                      </CRow>
                    </div>
                  </CCollapse>
                )
              },
            }}
          />
          <div className="d-flex flex-wrap justify-content-between align-items-center p-3 border-top bg-body">
            <span className="text-body small">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (Total: {totalItems} libros)
            </span>
            <CSmartPagination
              size="sm"
              activePage={currentPage}
              pages={totalPages}
              onActivePageChange={handlePageChange}
            />
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Inventary