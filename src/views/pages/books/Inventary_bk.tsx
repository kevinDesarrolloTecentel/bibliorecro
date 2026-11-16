import React, { useMemo } from 'react'
import {
  cilBan,
  cilBarcode,
  cilBook,
  cilCalendar,
  cilCheckCircle,
  cilClipboard,
  cilColorBorder,
  cilCommentSquare,
  cilDescription,
  cilEducation,
  cilGlobeAlt,
  cilLibraryBuilding,
  cilSync,
  cilTag,
  cilTrash,
  cilTruck,
  cilUser,
  cilWallet,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CCollapse,
  CRow,
  CSmartPagination,
  CSmartTable,
} from '@coreui/react-pro'
import useLibro, { getBadgeEstado, getBadgeDisponibilidad } from '@/hooks/rco-libros/useLibros'
import { useCatalogosLibros } from '@/hooks/rco-libros/useCatalogosLibros'
import Registro_bk from '@/components/details_bk/Register_bk'
import Modal_Edit_bk from '@/components/details_bk/Modal_Edit_bk'
import ModalInactivarLibro from '@/components/details_bk/ModalInactivarLibro'


const Inventary: React.FC = () => {

  useCatalogosLibros(true)

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
    handleAbrirCrear,
    handleAbrirEditar,
    modalInactivar,
    setModalInactivar,
    libroAInactivar,
    handleInactivarLibro,
    handleActivarLibro,
    handleEliminarLibro,
    fetchLibros,
    handleColumnFilterChange,
    canCrearLibro,
    canEditarLibro,
    canInactivarLibro,
    canActivarLibro,
    canEliminarLibro,
    canMostrarInfoLibro,
    canGuardarLibro,
    canActualizarLibro,
    canConfirmarInactivarLibro,
  } = libroState

  const columns = useMemo(
    () => [
      { key: 'ISBN_LIBROS', label: 'ISBN', _style: { width: '12%' }, filter: false },
      { key: 'TITULO_LIBROS', label: 'Título', _style: { width: '2%' }, filter: false },
      { key: 'NOMBRE_AUTOR', label: 'Autor', _style: { width: '15%' }, filter: false },
      { key: 'NOMBRE_CATEGORIA', label: 'Categoría', _style: { width: '16%' }, filter: false },
      {
        key: 'ESTADOS_PRESTAMO',
        label: 'Disponibilidad',
        _style: { width: '10.5%' },
        filter: (_values: unknown[], onChange: (val: string | number) => void, filterValue?: string | number) => (
          <select
            className="form-select form-select-sm"
            value={String(filterValue || '')}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Filtrar por disponibilidad"
          >
            <option value="">Todo</option>
            <option value="disponible">Disponible</option>
            <option value="prestamo">En préstamo</option>
          </select>
        ),
      },
      {
        key: 'ESTADO',
        label: 'Estado',
        _style: { width: '6%' },
        filter: (_values: unknown[], onChange: (val: string | number) => void, filterValue?: string | number) => (
          <select
            className="form-select form-select-sm"
            value={String(filterValue || '')}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="">Todo</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        ),
      },
    ],
    []
  )

  return (
    <div className="pb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilLibraryBuilding} size="lg" style={{ color: '#104299ff' }} />
            <span>
              Inventario de Libros
            </span>
          </h3>
          <p className="text-body-secondary mb-0">
            Administración de los libros del sistema.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            disabled={loading}
            className="d-flex align-items-center gap-1 shadow-sm"
            onClick={() => libroState.handleRecargar()}
            title="Refrescar lista y reiniciar filtros"
          >
            <CIcon icon={cilSync} className={`me-1 ${loading ? 'rotate-animation' : ''}`} />
            <span>{loading ? 'Refrescando...' : 'Refrescar'}</span>
          </CButton>
          {canCrearLibro && (
            <CButton
              color="primary"
              size="sm"
              variant="outline"
              className="hover:text-white shadow-sm" onClick={handleAbrirCrear}
            >
              <CIcon icon={cilBook} className="me-1" />
              <span>Nuevo Libro</span>
            </CButton>
          )}
        </div>
      </div>

      <Registro_bk
        visible={modalRegister}
        setVisible={setModalRegister}
        onSuccess={() => fetchLibros()}
        canGuardarLibro={canGuardarLibro}
      />

      <Modal_Edit_bk
        libro={libroSeleccionado}
        visible={modalEdit}
        setVisible={setModalEdit}
        onSuccess={() => fetchLibros()}
        canActualizarLibro={canActualizarLibro}
      />

      <ModalInactivarLibro
        libro={libroAInactivar}
        visible={modalInactivar}
        setVisible={setModalInactivar}
        onSuccess={() => {
          libroState.setDetails([])
          fetchLibros()
        }}
        canInactivarLibro={canInactivarLibro}
        canConfirmarInactivarLibro={canConfirmarInactivarLibro}
      />


      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-uppercase small d-inline-flex align-items-center gap-2">
            <CIcon icon={cilLibraryBuilding} style={{ color: '#104299ff' }} />
            Listado de Libros
          </span>
          <span className="text-body-secondary small">
            Total registrados: <strong>{totalItems}</strong>
          </span>
        </CCardHeader>

        <CCardBody className="p-0">
          <CSmartTable
            key={libroState.tableKey}
            clickableRows={canMostrarInfoLibro}
            columns={columns}
            columnSorter
            columnFilter={{ external: true }}
            onColumnFilterChange={(filtros: any) => handleColumnFilterChange(filtros)}
            loading={loading}
            items={libros}
            tableFilter={{ external: true }}
            tableFilterPlaceholder="Buscar por ISBN, título, autor, categoría..."
            onTableFilterChange={(busqueda) => libroState.handleBuscarGlobal(busqueda || '')}
            onRowClick={(item: any) => {
              if (!canMostrarInfoLibro) return
              const id = item?.id ?? item?.ID_LIBROS
              if (id) toggleDetails(id)
            }}
            noItemsLabel={
              loading ? (
                'Cargando libros...'
              ) : (
                'No se encontraron Libros'
              )
            }
            tableProps={{
              responsive: true,
              striped: true,
              hover: true,
              className: 'mb-0',
            }}
            tableBodyProps={{
              className: 'align-middle',
            }}
            scopedColumns={{
              ISBN_LIBROS: (item: any) => (
                <td>
                  <span className="font-monospace small text-muted badge bg-body border">
                    {item.ISBN_LIBROS || 'S/N'}
                  </span>
                </td>
              ),
              TITULO_LIBROS: (item: any) => (
                <td style={{ minWidth: '220px', whiteSpace: 'normal' }}>
                  <span className="fw-semibold text-body">{item.TITULO_LIBROS || '-'}</span>
                </td>
              ),
              NOMBRE_AUTOR: (item: any) => (
                <td>
                  <span className="text-body">{item.NOMBRE_AUTOR || 'Sin autor'}</span>
                </td>
              ),
              NOMBRE_CATEGORIA: (item: any) => (
                <td>
                  <span className="badge bg-body border text-body-secondary font-monospace">
                    {item.NOMBRE_CATEGORIA || 'Sin categoría'}
                  </span>
                </td>
              ),
              ESTADOS_PRESTAMO: (item: any) => (
                <td>
                  <CBadge
                    color={getBadgeDisponibilidad(item.ESTADOS_PRESTAMO)}
                    shape="rounded-pill"
                    className="px-3 py-1"
                  >
                    {item.ESTADOS_PRESTAMO}
                  </CBadge>
                </td>
              ),
              ESTADO: (item: any) => (
                <td>
                  <CBadge
                    color={getBadgeEstado(item.ESTADO)}
                    shape="rounded-pill"
                    className="px-3 py-1"
                  >
                    {item.ESTADO}
                  </CBadge>
                </td>
              ),
              details: (item: any) => {
                if (!canMostrarInfoLibro) return null
                const rowId = item.id ?? item.ID_LIBROS
                const isOpened = details.includes(rowId) || (item.id && details.includes(item.id)) || (item.ID_LIBROS && details.includes(item.ID_LIBROS))
                const isActivo =
                  String(item.ESTADO || item.ESTADO_LIBROS || '').toLowerCase().trim() === 'activo' ||
                  String(item.ESTADO_LIBROS ?? '') === '1'

                return (
                  <CCollapse visible={isOpened} className="user-details-collapse">
                    <div className="p-3 p-md-4 bg-body-tertiary border-top border-bottom rounded-bottom">
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
                          <span className="text-body-secondary small mb-2">{item.NOMBRE_AUTOR}</span>
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
                              className="px-3 py-1"
                            >
                              {item.ESTADO}
                            </CBadge>
                          </div>
                        </CCol>

                        {/* Lado derecho: Tarjetas informativas en Grid */}
                        <CCol xs={12} md={8} lg={9}>
                          <CRow className="g-2">
                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
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
                                  <span className="text-muted small d-block mb-1">
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
                                  <span className="text-muted small d-block mb-1">
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
                                  <span className="text-muted small d-block mb-1">
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
                                  <span className="text-muted small d-block mb-1">
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
                                  <span className="text-muted small d-block mb-1">
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
                                  <span className="text-muted small d-block mb-1">
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
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilWallet} className="me-1 text-secondary" />
                                    Precio
                                  </span>
                                  <span className="font-monospace small fw-bold text-success">${Number(item.PRECIO_LIBROS || 0).toFixed(2)}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
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
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilClipboard} className="me-1 text-secondary" />
                                    Título Tejuelo
                                  </span>
                                  <span className="font-monospace small fw-bold text-body">{item.TITULOTEJUELO_LIBROS || '-'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilUser} className="me-1 text-secondary" />
                                    Autor Tejuelo
                                  </span>
                                  <span className="font-monospace small fw-bold text-body">{item.AUTORTEJUELO_LIBROS || '-'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilCalendar} className="me-1 text-secondary" />
                                    Fecha de Edición
                                  </span>
                                  <span className="badge bg-body border rounded-pill text-primary">
                                    {item.FECHAEDICION_LIBROS}
                                  </span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilCalendar} className="me-1 text-secondary" />
                                    Fecha de Registro
                                  </span>
                                  <span className="badge bg-body border rounded-pill text-success">
                                    {item.FECHAREGISTRO_LIBROS}
                                  </span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={!isActivo ? 4 : 8}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilCommentSquare} className="me-1 text-secondary" />
                                    Notas y Detalles:
                                  </span>
                                  <span className="text-body small">{item.DESCRIPCION_LIBROS || 'Sin detalles registrados.'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            {!isActivo && (
                              <CCol xs={12} sm={6} lg={4}>
                                <CCard className="h-100 shadow-sm border-0 bg-body">
                                  <CCardBody className="p-2">
                                    <span className="text-danger small d-block mb-1 fw-semibold">
                                      <CIcon icon={cilBan} className="me-1 text-danger" />
                                      Motivo de la Baja:
                                    </span>
                                    <span className="text-body small fw-medium">
                                      {item.MOTIVO_BAJA_LIBRO || item.motivo_baja_libro || 'Sin motivo registrado.'}
                                    </span>
                                  </CCardBody>
                                </CCard>
                              </CCol>
                            )}
                          </CRow>

                          {/* Acciones dentro del detalle */}
                          <div className="d-flex flex-wrap gap-2 justify-content-end mt-3 pt-2 border-top">
                            {canEditarLibro || canInactivarLibro || canActivarLibro || canEliminarLibro ? (
                              <>
                                {canEditarLibro && (
                                  <CButton
                                    color="info"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAbrirEditar(item)}
                                    title="Editar libro"
                                    className="d-flex align-items-center gap-1 shadow-sm px-3 hover:text-white"
                                  >
                                    <CIcon icon={cilColorBorder} size="sm" />
                                    <span>Editar</span>
                                  </CButton>
                                )}
                                {isActivo && canInactivarLibro && (
                                  <CButton
                                    color="warning"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleInactivarLibro(item)}
                                    title="Inactivar libro"
                                    className="d-flex align-items-center gap-1 shadow-sm px-3 hover:text-white"
                                  >
                                    <CIcon icon={cilBan} size="sm" />
                                    <span>Inactivar</span>
                                  </CButton>
                                )}
                                {!isActivo && canActivarLibro && (
                                  <CButton
                                    color="success"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleActivarLibro(item)}
                                    title="Activar libro"
                                    className="d-flex align-items-center gap-1 shadow-sm px-3 hover:text-white"
                                  >
                                    <CIcon icon={cilCheckCircle} size="sm" />
                                    <span>Activar</span>
                                  </CButton>
                                )}
                                {canEliminarLibro && (
                                  <CButton
                                    color="danger"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEliminarLibro(item)}
                                    title="Eliminar libro"
                                    className="d-flex align-items-center gap-1 shadow-sm px-3 hover:text-white"
                                  >
                                    <CIcon icon={cilTrash} size="sm" />
                                    <span>Eliminar Libro</span>
                                  </CButton>
                                )}
                              </>
                            ) : (
                              <span className="text-danger small fw-semibold py-1">
                                No tienes acceso a las acciones del inventario.
                              </span>
                            )}
                          </div>
                        </CCol>
                      </CRow>
                    </div>
                  </CCollapse>
                )
              },
            }}
          />
        </CCardBody>

        <CCardFooter className="bg-transparent border-top py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-1">
            <span className="text-muted small">
              Mostrando {libros.length} de {totalItems} libros (Página {currentPage} de {totalPages})
            </span>
            <CSmartPagination
              activePage={currentPage}
              pages={totalPages}
              onActivePageChange={handlePageChange}
            />
          </div>
        </CCardFooter>
      </CCard>
    </div>
  )
}

export default Inventary