import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSmartPagination,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilBookmark,
  cilCheckCircle,
  cilInfo,
  cilPencil,
  cilPlus,
  cilSearch,
  cilSync,
  cilTrash,
  cilX,
} from '@coreui/icons'
import ModalCate from '@/components/details_bk/category'
import useCategoria from '@/hooks/rco-libros/useCategoria'
import { Categoria } from '@/models/rco/categoria'
import { formatFecha } from '@/utils/dateUtils'

const Category = () => {
  const categoriaHook = useCategoria()

  const {
    handleOpen,
    handleRecargar,
    categoriasFiltradas,
    categoriasPaginadas,
    loadingCategorias,
    busquedaCategoria,
    setBusquedaCategoria,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    handleEliminarCategoria,
    paginaActual,
    totalPaginas,
    totalCategorias,
    totalFiltradas,
    handlePageChange,
    canCrearCategoria,
    canEditarCategoria,
    canEliminarCategoria,
    canVerInfoCategoria,
  } = categoriaHook

  const handleToggleSelect = (cat: Categoria) => {
    if (!canVerInfoCategoria) return

    const currentId = String(categoriaSeleccionada?.ID_CATEGORIA ?? categoriaSeleccionada?.id ?? '')
    const targetId = String(cat?.ID_CATEGORIA ?? cat?.id ?? '')
    if (currentId && currentId === targetId) {
      setCategoriaSeleccionada(null)
    } else {
      setCategoriaSeleccionada(cat)
    }
  }

  return (
    <>
      <ModalCate categoriaState={categoriaHook} />
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilBookmark} style={{ color: '#D97706' }} />
            <span>Gestión de Categorías</span>
          </h3>
          <p className="text-body-secondary mb-0">
            Administra el catálogo de categorías, clasifica y organiza los libros registrados.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            disabled={loadingCategorias}
            className="d-flex align-items-center gap-1 shadow-sm"
            onClick={() => handleRecargar()}
            title="Refrescar lista y reiniciar filtros"
          >
            <CIcon icon={cilSync} className={`me-1 ${loadingCategorias ? 'rotate-animation' : ''}`} />
            <span>{loadingCategorias ? 'Refrescando...' : 'Refrescar'}</span>
          </CButton>
          {canCrearCategoria && (
            <CButton
              color="success"
              variant="outline"
              size="sm"
              className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
              onClick={() => handleOpen()}
            >
              <CIcon icon={cilPlus} />
              <span>Nueva Categoría</span>
            </CButton>
          )}
        </div>
      </div>

      <CRow className="g-4">
        <CCol xs={12} lg={7}>
          <CCard className="h-100 border shadow-sm">
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilBookmark} size="lg" style={{ color: '#D97706' }} />
                <span>Catálogo de Categorías</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {busquedaCategoria && (
                  <CBadge color="info" shape="rounded-pill">
                    {totalFiltradas} encontradas
                  </CBadge>
                )}
                <CBadge color="primary" shape="rounded-pill">
                  {totalCategorias} Registradas
                </CBadge>
              </div>
            </CCardHeader>

            <CCardBody className="p-3">
              <label className="form-label small fw-semibold text-muted">
                Buscar categoría por nombre o código:
              </label>
              <CInputGroup className="mb-3">
                <CInputGroupText className="bg-body">
                  <CIcon icon={cilSearch} className="text-muted" />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Ej: Ficción, CAT-001, 1..."
                  value={busquedaCategoria}
                  onChange={(e) => setBusquedaCategoria(e.target.value)}
                />
                {busquedaCategoria && (
                  <CButton
                    type="button"
                    color="light"
                    variant="outline"
                    onClick={() => setBusquedaCategoria('')}
                  >
                    <CIcon icon={cilX} />
                  </CButton>
                )}
              </CInputGroup>

              <div
                className="border rounded p-2 overflow-auto"
                style={{ maxHeight: '500px', minHeight: '350px' }}
              >
                {loadingCategorias ? (
                  <div className="text-center py-5">
                    <CSpinner size="sm" color="primary" />
                    <span className="ms-2 small text-muted">Cargando categorías...</span>
                  </div>
                ) : categoriasFiltradas.length === 0 ? (
                  <div className="text-center text-muted py-5 small">
                    No se encontraron categorías coincidentes con &quot;{busquedaCategoria}&quot;.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {categoriasPaginadas.map((cat) => {
                      const id = cat.ID_CATEGORIA || cat.id
                      const isSelected =
                        String(categoriaSeleccionada?.ID_CATEGORIA || categoriaSeleccionada?.id) ===
                        String(id)

                      return (
                        <div
                          key={id}
                          onClick={() => handleToggleSelect(cat)}
                          className={`p-3 rounded border d-flex align-items-center justify-content-between transition-all ${isSelected
                            ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                            : 'bg-body'
                            }`}
                          style={{
                            cursor: canVerInfoCategoria ? 'pointer' : 'default',
                            borderColor: isSelected ? '#0d6efd' : '#dee2e6',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (canVerInfoCategoria && !isSelected) e.currentTarget.style.borderColor = '#0d6efd'
                          }}
                          onMouseLeave={(e) => {
                            if (canVerInfoCategoria && !isSelected) e.currentTarget.style.borderColor = '#dee2e6'
                          }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${isSelected
                                ? 'bg-primary text-white'
                                : 'bg-primary bg-opacity-10 text-primary'
                                }`}
                              style={{ width: '40px', height: '40px' }}
                            >
                              <CIcon icon={cilBookmark} />
                            </div>
                            <div>
                              <h6 className="font-monospace small fw-bold text-body mb-0">{cat.NOMBRE_CATEGORIA}</h6>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <span className="badge bg-body text-body border font-monospace">
                                  {cat.CODIGO_CATEGORIA}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <CBadge color="primary" shape="rounded-pill" className="px-3 py-2 shadow-sm text-white">
                              Seleccionado ✕
                            </CBadge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 mt-2 border-top bg-body">
                <span className="text-muted small">
                  Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong> ({totalFiltradas} categorías)
                </span>
                <CSmartPagination
                  size="sm"
                  activePage={paginaActual}
                  pages={totalPaginas}
                  onActivePageChange={handlePageChange}
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} lg={5}>
          <CCard className="h-100 border shadow-sm">
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilInfo} className="text-primary" />
                <span>Detalle de la Categoría</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <CButton
                  color="secondary"
                  variant="ghost"
                  size="sm"
                  disabled={loadingCategorias}
                  className="p-1 text-muted"
                  onClick={() => handleRecargar()}
                  title="Refrescar información"
                >
                  <CIcon icon={cilSync} className={loadingCategorias ? 'rotate-animation' : ''} />
                </CButton>
                {categoriaSeleccionada && (
                  <CButton
                    color="secondary"
                    variant="ghost"
                    size="sm"
                    className="p-1 text-muted"
                    onClick={() => setCategoriaSeleccionada(null)}
                    title="Cerrar detalle"
                  >
                    <CIcon icon={cilX} />
                  </CButton>
                )}
              </div>
            </CCardHeader>

            <CCardBody className="p-4 d-flex flex-column justify-content-between">
              {!canVerInfoCategoria ? (
                <div className="text-center py-5 my-auto text-muted">
                  <div
                    className="bg-body rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <CIcon icon={cilBookmark} size="xxl" className="text-danger opacity-50" />
                  </div>
                  <h6 className="fw-bold text-body mb-1">Información no disponible</h6>

                </div>
              ) : categoriaSeleccionada ? (
                <div>
                  <div className="d-flex align-items-center gap-2 mb-3 text-success">
                    <CIcon icon={cilCheckCircle} size="lg" />
                    <span className="fw-bold small text-uppercase">Categoría en visualización</span>
                  </div>

                  <div className="bg-body p-3 rounded border mb-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div
                        className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: '54px', height: '54px' }}
                      >
                        <CIcon icon={cilBookmark} size="xl" />
                      </div>
                      <div>
                        <h5 className="font-monospace text-body mb-1">
                          {categoriaSeleccionada.NOMBRE_CATEGORIA}
                        </h5>
                        <span className="badge bg-body text-secondary border font-monospace">
                          {categoriaSeleccionada.CODIGO_CATEGORIA}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2 pt-2 border-top">
                      <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                        <span className="text-muted small badge bg-body rounded-pill border d-inline-flex align-items-center justify-content-center">Código:</span>
                        <span className="font-monospace fw-semibold small text-body">
                          {categoriaSeleccionada.CODIGO_CATEGORIA}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-1">
                        <span className="text-muted small badge bg-body rounded-pill border d-inline-flex align-items-center justify-content-center">Nombre:</span>
                        <span className="fw-semibold small text-body text-end ms-2">
                          {categoriaSeleccionada.NOMBRE_CATEGORIA}
                        </span>
                      </div>
                      {categoriaSeleccionada.FECHAINGRESO_CATEGORIA && (
                        <div className="d-flex justify-content-between align-items-center py-1 border-top">
                          <span className="text-muted small badge bg-body rounded-pill border d-inline-flex align-items-center justify-content-center">Fecha de Registro:</span>
                          <span className="font-monospace fw-semibold small text-body">
                            {formatFecha(categoriaSeleccionada.FECHAINGRESO_CATEGORIA)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    {canEliminarCategoria && (
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        className="hover:text-white d-flex align-items-center gap-2 shadow-sm"
                        onClick={() => handleEliminarCategoria(categoriaSeleccionada)}
                      >
                        <CIcon icon={cilTrash} />
                        <span>Eliminar</span>
                      </CButton>
                    )}

                    {canEditarCategoria && (
                      <CButton
                        color="success"
                        size="sm"
                        variant="outline"
                        className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
                        onClick={() => handleOpen(categoriaSeleccionada)}
                      >
                        <CIcon icon={cilPencil} />
                        <span>Editar Categoría</span>
                      </CButton>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 my-auto text-muted">
                  <div
                    className="bg-body rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <CIcon icon={cilBookmark} size="xxl" className="text-secondary opacity-50" />
                  </div>
                  <h6 className="fw-bold text-body mb-1">Ninguna categoría seleccionada</h6>
                  <p className="small text-muted mb-4 px-3">
                    Selecciona una categoría de la lista para consultar sus detalles o modificarla.
                  </p>
                  {canCrearCategoria && (
                    <CButton
                      color="primary"
                      variant="outline"
                      size="sm"
                      className="d-inline-flex align-items-center gap-1"
                      onClick={() => handleOpen()}
                    >
                      <CIcon icon={cilPlus} />
                      <span>Crear Nueva Categoría</span>
                    </CButton>
                  )}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Category