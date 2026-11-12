import ModalEditorial from '@/components/details_bk/editorial'
import { useEditorial } from '@/hooks/rco-libros/useEditorial'
import {
  cilDescription,
  cilFile,
  cilInfo,
  cilPen,
  cilPenNib,
  cilPlus,
  cilSearch,
  cilSync,
  cilTrash,
  cilX,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
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

const Editorial = () => {
  const editoHook = useEditorial()
  const {
    handleOpen,
    handleRecargar,
    busquedaEditorial,
    setBusquedaEditorial,
    loadingEditorial,
    editorialFiltrados,
    editorialPaginados,
    editorialSeleccionado,
    setEditorialSeleccionado,
    handleEliminarEditorial,
    paginaActual,
    totalPaginas,
    totalEditoriales,
    totalFiltrados,
    handlePageChange,
    canCrearEditorial,
    canEditarEditorial,
    canEliminarEditorial,
    canVerInfoEditorial,
  } = editoHook

  const handleToggleSelect = (edi: any) => {
    if (!canVerInfoEditorial) return

    const currentId = String(editorialSeleccionado?.ID_EDITORIAL ?? editorialSeleccionado?.id ?? '')

    const targetId = String(edi?.ID_EDITORIAL ?? edi?.id ?? '')
    if (currentId && currentId === targetId) {
      setEditorialSeleccionado(null)
    } else {
      setEditorialSeleccionado(edi)
    }
  }

  return (
    <>
      <ModalEditorial editorialState={editoHook} />
      <div className="d-flex align-items-center flex-wrap justify-content-between mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilDescription} size="lg" style={{ color: '#36BBA7' }} />
            <span>Gestión de Editoriales</span>
          </h4>
          <p className="text-muted small mb-0">Administra el catálogo de las editoriales.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            disabled={loadingEditorial}
            className="d-flex align-items-center gap-1 shadow-sm"
            onClick={() => handleRecargar()}
            title="Refrescar lista y reiniciar filtros"
          >
            <CIcon icon={cilSync} className={`me-1 ${loadingEditorial ? 'rotate-animation' : ''}`} />
            <span>{loadingEditorial ? 'Refrescando...' : 'Refrescar'}</span>
          </CButton>
          {canCrearEditorial && (
            <CButton
              color="success"
              variant="outline"
              size="sm"
              className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
              onClick={() => handleOpen()}
            >
              <CIcon icon={cilPlus} />
              <span>Nueva Editorial</span>
            </CButton>
          )}
        </div>
      </div>
      <CRow className="g-4">
        <CCol xs={12} lg={7}>
          <CCard className="h-100 border shadow-sm">
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilFile} style={{ color: '#36BBA7' }} />
                <span>Catálogo de Editoriales</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {busquedaEditorial && (
                  <CBadge color="info" shape="rounded-pill">
                    {totalFiltrados} encontradas
                  </CBadge>
                )}
                <CBadge color="primary" shape="rounded-pill">
                  {totalEditoriales} Registradas
                </CBadge>
              </div>
            </CCardHeader>
            <CCardBody className="p-3">
              <label className="form-label small fw-semibold text-muted">
                Busca la Editorial por su Nombre:
              </label>
              <CInputGroup className="mb-3">
                <CInputGroupText className="bg-body">
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Ej: La Casa Espanola, La Luz, 1..."
                  value={busquedaEditorial}
                  onChange={(e) => setBusquedaEditorial(e.target.value)}
                />
                {busquedaEditorial && (
                  <CButton
                    type="button"
                    color="light"
                    variant="outline"
                    onClick={() => setBusquedaEditorial('')}
                  >
                    <CIcon icon={cilX} />
                  </CButton>
                )}
              </CInputGroup>
              <div
                className="border rounded p-2 overflow-auto"
                style={{ maxHeight: '550px', minWidth: '350px' }}
              >
                {loadingEditorial ? (
                  <div className="text-center py-5">
                    <CSpinner size="sm" color="primary" />
                    <span className="ms-2 small text-muted">Cargando Editoriales...</span>
                  </div>
                ) : editorialFiltrados.length === 0 ? (
                  <div className="text-center text-muted py-5 small">
                    No se encontraron coincidencias con &quot;{busquedaEditorial}&quot;.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {editorialPaginados.map((edi) => {
                      const id = edi.ID_EDITORIAL || edi.id
                      const isSelected =
                        String(editorialSeleccionado?.ID_EDITORIAL || editorialSeleccionado?.id) ===
                        String(id)
                      return (
                        <div
                          key={id}
                          onClick={() => handleToggleSelect(edi)}
                          className={`p-3 rounded border d-flex align-items-center justify-content-between transition-all ${isSelected
                            ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                            : 'bg-body'
                            }`}
                          style={{
                            cursor: canVerInfoEditorial ? 'pointer' : 'default',
                            borderColor: isSelected ? '#0d6efd' : '#dee2e6',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (canVerInfoEditorial && !isSelected) e.currentTarget.style.borderColor = '#0d6efd'
                          }}
                          onMouseLeave={(e) => {
                            if (canVerInfoEditorial && !isSelected) e.currentTarget.style.borderColor = '#dee2e6'
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
                              <CIcon icon={cilInfo} />
                            </div>
                            <div>
                              <div className=" font-monospace small fw-bold text-body">{edi.NOMBRE_EDITORIAL}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <CBadge className="px-3 py-2 shadow-sm text-white" color="primary" shape="rounded-pill">
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
                  Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong> ({totalFiltrados} editoriales)
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
                <CIcon icon={cilInfo} size="lg" style={{ color: '#36BBA7' }} />
                <span>Detalle de la Editorial</span>
              </div>
            </CCardHeader>
            <CCardBody className="p-4 d-flex flex-column justify-content-between">
              {!canVerInfoEditorial ? (
                <div className="text-center py-5 my-auto text-muted">
                  <div
                    className="bg-body rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <CIcon icon={cilDescription} size="xxl" className="text-danger opacity-50" />
                  </div>
                  <h6 className="fw-bold text-body mb-1">Información no disponible</h6>
                  <p className="small text-muted mb-0 px-3">
                    No cuentas con los permisos necesarios para visualizar la información y las acciones de esta editorial.
                  </p>
                </div>
              ) : editorialSeleccionado ? (
                <div>
                  <div className="d-flex align-items-center gap-2 mb-3 text-success">
                    <CIcon icon={cilPenNib} size="lg" />
                    <span className="fw-bold small text-uppercase">Visualización de la Editorial</span>
                  </div>
                  <div className="bg-body p-3 rounded border mb-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div
                        className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: '54px', height: '54px' }}
                      >
                        <CIcon icon={cilInfo} size="xl" />
                      </div>
                      <div>
                        <h5 className="fw-bold text-body mb-1">
                          {editorialSeleccionado.NOMBRE_EDITORIAL}
                        </h5>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2 pt-2 border-top">
                      <div className="d-flex justify-content-between align-items-center py-1">
                        <span className="text-muted small badge bg-body rounded-pill border d-inline-flex align-items-center justify-content-center">Nombre:</span>
                        <span className="text-body font-monospace fw-semibold small text-end ms-2">
                          {editorialSeleccionado.NOMBRE_EDITORIAL}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2 justify-content-end align-items-center mt-3 pt-2 border-top">
                    {canEliminarEditorial || canEditarEditorial ? (
                      <>
                        {canEliminarEditorial && (
                          <CButton
                            color="danger"
                            size="sm"
                            variant="outline"
                            className="hover:text-white d-flex align-items-center gap-2 shadow-sm"
                            onClick={() => handleEliminarEditorial(editorialSeleccionado)}
                          >
                            <CIcon icon={cilTrash} />
                            <span>Eliminar</span>
                          </CButton>
                        )}
                        {canEditarEditorial && (
                          <CButton
                            color="success"
                            variant="outline"
                            size="sm"
                            className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
                            onClick={() => handleOpen(editorialSeleccionado)}
                          >
                            <CIcon icon={cilPen} />
                            <span>Editar Editorial</span>
                          </CButton>
                        )}
                      </>
                    ) : (
                      <span className="text-danger small fw-semibold py-1">
                        No tienes acceso a las acciones de editorales.
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 my-auto text-muted">
                  <div
                    className="bg-body rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <CIcon icon={cilPenNib} size="xxl" className="text-secondary opacity-50" />
                  </div>
                  <h6 className="fw-bold text-body mb-1">Ninguna Editorial Seleccionada</h6>
                  <p className="small text-muted mb-4 px-3">
                    Selecciona una editorial de la lista para consultar sus detalles o modificarla.
                  </p>
                  {canCrearEditorial && (
                    <CButton
                      color="primary"
                      variant="outline"
                      size="sm"
                      className="d-inline-flex align-items-center gap-1"
                      onClick={() => handleOpen()}
                    >
                      <CIcon icon={cilPlus} />
                      <span>Crear Nueva Editorial</span>
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

export default Editorial