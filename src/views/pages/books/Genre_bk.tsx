import ModalGen from "@/components/details_bk/genero"
import { useGenero } from "@/hooks/rco-libros/useGenero"
import { cilLibraryBuilding, cilNewspaper, cilNoteAdd, cilNotes, cilPenNib, cilPlus, cilSearch, cilSync, cilTrash, cilX } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CInputGroup, CInputGroupText, CRow, CSpinner, CSmartPagination } from "@coreui/react-pro"

const Genre = () => {
  const generoHook = useGenero()
  const {
    handleOpen,
    handleRecargar,
    busquedagenero,
    setBusquedaGenero,
    loadingGeneros,
    generoFiltrados,
    generoPaginados,
    generoSeleccionado,
    setGeneroSeleccionado,
    handleEliminarGnerol,
    paginaActual,
    totalPaginas,
    totalGeneros,
    totalFiltrados,
    handlePageChange,
    canCrearGenero,
    canEditarGenero,
    canEliminarGenero,
    canVerInfoGenero,
  } = generoHook

  const handleToggleSelect = (genero: any) => {
    if (!canVerInfoGenero) return

    const currentId = String(generoSeleccionado?.ID_RCOGENERO ?? generoSeleccionado?.id ?? '')
    const targetId = String(genero?.ID_RCOGENERO ?? genero?.id ?? '')
    if (currentId && currentId === targetId) {
      setGeneroSeleccionado(null)
    } else {
      setGeneroSeleccionado(genero)
    }
  }

  return (
    <>
      <ModalGen generoState={generoHook} />
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilNewspaper} size="lg" style={{ color: '#1C69A8' }} />
            <span>Gestión de Géneros</span>
          </h4>
          <p className="text-muted small mb-0">Administra el catálogo de los géneros.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            disabled={loadingGeneros}
            className="d-flex align-items-center gap-1 shadow-sm"
            onClick={() => handleRecargar()}
            title="Refrescar lista y reiniciar filtros"
          >
            <CIcon icon={cilSync} className={`me-1 ${loadingGeneros ? 'rotate-animation' : ''}`} />
            <span>{loadingGeneros ? 'Refrescando...' : 'Refrescar'}</span>
          </CButton>
          {canCrearGenero && (
            <CButton
              color="success"
              variant="outline"
              size="sm"
              className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
              onClick={() => handleOpen()}
            >
              <CIcon icon={cilPlus} />
              <span>Nuevo Género</span>
            </CButton>
          )}
        </div>
      </div>
      <CRow className="g-4">
        <CCol xs={12} lg={7}>
          <CCard className="h-100 border shadow-sm">
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilNoteAdd} style={{ color: '#1C69A8' }} />
                <span>Catálogo de Géneros</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {busquedagenero && (
                  <CBadge color="info" shape="rounded-pill">
                    {totalFiltrados} encontrados
                  </CBadge>
                )}
                <CBadge color="primary" shape="rounded-pill">
                  {totalGeneros} Registrados
                </CBadge>
              </div>

            </CCardHeader>
            <CCardBody className="p-3">
              <label className="form-label small fw-semibold text-muted">
                Buscar el Género por el Nombre:
              </label>
              <CInputGroup className="mb-3">
                <CInputGroupText className="bg-body">
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Ej: Drama, Accion, 1..."
                  value={busquedagenero}
                  onChange={(e) => setBusquedaGenero(e.target.value)}
                />
                {busquedagenero && (
                  <CButton
                    type="button"
                    color="light"
                    variant="outline"
                    onClick={() => setBusquedaGenero('')}
                    title="Limpiar búsqueda"
                  >
                    <CIcon icon={cilX} />
                  </CButton>
                )}
              </CInputGroup>

              <div className="border rounded p-2 overflow-auto" style={{ maxHeight: '500px', minWidth: '350px' }}>
                {loadingGeneros ? (
                  <div className="text-center py-5">
                    <CSpinner size="sm" color="primary" />
                    <span className="ms-2 small text-muted">Cargando generos...</span>
                  </div>
                ) : generoFiltrados.length === 0 ? (
                  <>
                    <div className="text-center text-muted py-5 small">
                      No se encontraron coincidencias con &quot;{busquedagenero}&quot;.
                    </div>
                  </>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {generoPaginados.map((genero) => {
                      const id = genero.ID_RCOGENERO || genero.id
                      const isSelected = String(generoSeleccionado?.ID_RCOGENERO || generoSeleccionado?.id) === String(id)
                      return (
                        <div
                          key={id}
                          onClick={() => handleToggleSelect(genero)}
                          className={`p-3 rounded border d-flex align-items-center justify-content-between transition-all
                        ${isSelected ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'bg-body'}`}
                          style={{
                            cursor: canVerInfoGenero ? 'pointer' : 'default',
                            borderColor: isSelected ? '#0d6efd' : '#dee2e6',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (canVerInfoGenero && !isSelected) e.currentTarget.style.borderColor = '#0d6efd'
                          }}
                          onMouseLeave={(e) => {
                            if (canVerInfoGenero && !isSelected) e.currentTarget.style.borderColor = '#dee2e6'
                          }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center 
                            ${isSelected ? 'bg-primary text-white' : ' bg-primary bg-opacity-10 text-primary'}`}
                              style={{ width: '40px', height: '40px' }}>
                              <CIcon icon={cilNotes} />
                            </div>
                            <div>
                              <div className="font-monospace text-body small fw-semibold">{genero.NOMBRE_RCOGENERO}</div>
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
                  Página <strong> {paginaActual} </strong> de <strong> {totalPaginas}</strong> ({totalFiltrados} géneros)
                </span>
                <CSmartPagination size="sm" activePage={paginaActual} pages={totalPaginas} onActivePageChange={handlePageChange} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={5}>
          <CCard className="h-100 border shadow-sm">
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilNotes} />
                <span>Detalle del Género</span>
              </div>
            </CCardHeader>
            <CCardBody className="p-4 d-flex flex-column justify-content-between">
              {!canVerInfoGenero ? (
                <div className="text-center py-5 my-auto text-muted">
                  <div
                    className="bg-body rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <CIcon icon={cilNewspaper} size="xxl" className="text-danger opacity-50" />
                  </div>
                  <h6 className="fw-bold text-body mb-1">Información no disponible</h6>
                  <p className="small text-muted mb-0 px-3">
                    No cuentas con los permisos necesarios para visualizar la información y las acciones de este género.
                  </p>
                </div>
              ) : generoSeleccionado ? (
                <div>
                  <div className="d-flex align-items-center gap-2 mb-3 text-success">
                    <CIcon icon={cilLibraryBuilding} />
                    <span className="fw-bold small text-uppercase">Información del Género</span>
                  </div>
                  <div className="bg-body p-3 border mb-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center "
                        style={{ width: '54px', height: '54px' }}>
                        <CIcon icon={cilNotes} />
                      </div>
                      <div>
                        <h5 className="fw-bold font-monospace text-body mb-1">{generoSeleccionado.NOMBRE_RCOGENERO}</h5>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2 border-top">
                      <div className="d-flex justify-content-between py-1 border-bottom">
                        <span className="badge bg-body rounded-pill border text-muted small"> Nombre del Género:</span>
                        <span className="fw-semibold small text-body">{generoSeleccionado.NOMBRE_RCOGENERO}</span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2 justify-content-end align-items-center mt-3 pt-2 border-top">
                    {canEliminarGenero || canEditarGenero ? (
                      <>
                        {canEliminarGenero && (
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
                            onClick={() => handleEliminarGnerol(generoSeleccionado)}>
                            <CIcon icon={cilTrash} />
                            <span>Eliminar Género</span>
                          </CButton>
                        )}
                        {canEditarGenero && (
                          <CButton
                            color="success"
                            variant="outline"
                            size="sm"
                            className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
                            onClick={() => handleOpen(generoSeleccionado)}>
                            <CIcon icon={cilPenNib} />
                            <span>Editar Género</span>
                          </CButton>
                        )}
                      </>
                    ) : (
                      <span className="text-danger small fw-semibold py-1">
                        No tienes acceso a las acciones de géneros.
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
                  <h6 className="fw-bold text-body mb-1">Ningún Género Seleccionado</h6>
                  <p className="small text-muted mb-4 px-3">
                    Selecciona un género de la lista para consultar sus detalles o modificarlo.
                  </p>
                  {canCrearGenero && (
                    <CButton
                      color="primary"
                      variant="outline"
                      size="sm"
                      className="d-inline-flex align-items-center gap-1 shadow-sm hover:text-white"
                      onClick={() => handleOpen()}
                    >
                      <CIcon icon={cilPlus} />
                      <span>Crear nuevo Género</span>
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

export default Genre