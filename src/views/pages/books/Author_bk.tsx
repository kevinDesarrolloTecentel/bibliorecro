import React from 'react'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CInputGroup, CInputGroupText, CRow, CSpinner } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilInfo, cilPencil, cilPlus, cilSearch, cilTrash, cilUser, cilX } from '@coreui/icons'
import useAutor from '@/hooks/rco-libros/useAutor'
import ModalAt from '@/components/details_bk/author'

const Author: React.FC = () => {
  const autorHook = useAutor()
  const {
    handleOpen,
    autoresFiltrados,
    busquedaAutor,
    listaAutores,
    handleElminiarAutor,
    loadingAutores,
    setBusquedaAutor,
    autorSeleccionado,
    setAutorSeleccionado,
  } = autorHook

  const handleToggleSelect = (autor: any) => {
    const currentId = String(autorSeleccionado?.ID_AUTOR ?? autorSeleccionado?.id ?? '')
    const targetId = String(autor?.ID_AUTOR ?? autor?.id ?? '')
    if (currentId && currentId === targetId) {
      setAutorSeleccionado(null)
    } else {
      setAutorSeleccionado(autor)
    }
  }
  return (
    <>
      <ModalAt autorState={autorHook} />
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilUser} size="lg" style={{ color: '#0a9b05ff' }} />
            <span>Gestión de Autores</span>
          </h4>
          <p className="text-muted small mb-0">
            Administra el catálogo de autores, busca y consulta sus detalles y obras registradas.
          </p>
        </div>
        <div className="d-flex gap-2">
          <CButton
            color="success"
            variant="outline"
            className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
            onClick={() => handleOpen()}
          >
            <CIcon icon={cilPlus} />
            <span>Nuevo Autor</span>
          </CButton>
        </div>
      </div>

      <CRow className="g-4">
        <CCol xs={12} lg={7}>
          <CCard className="h-100 border shadow-sm">
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2 border-bottom">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilUser} size="lg" style={{ color: '#0a9b05ff' }} />
                <span>Catálogo de Autores</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {busquedaAutor && (
                  <CBadge color="info" shape="rounded-pill">
                    {autoresFiltrados.length} encontrados
                  </CBadge>
                )}
                <CBadge color="primary" shape="rounded-pill">
                  {listaAutores.length} Registrados
                </CBadge>
              </div>
            </CCardHeader>

            <CCardBody className="p-3">
              <label className="form-label small fw-semibold text-muted">
                Buscar autor por nombre o ID:
              </label>
              <CInputGroup className="mb-3">
                <CInputGroupText className="bg-body border">
                  <CIcon icon={cilSearch} className="text-muted" />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Ej: Gabriel García Márquez, Poe, 1..."
                  value={busquedaAutor}
                  onChange={(e) => setBusquedaAutor(e.target.value)}
                />
                {busquedaAutor && (
                  <CButton
                    type="button"
                    color="light"
                    variant="outline"
                    onClick={() => setBusquedaAutor('')}
                    title="Limpiar búsqueda"
                  >
                    <CIcon icon={cilX} />
                  </CButton>
                )}
              </CInputGroup>

              <div
                className="border rounded p-2 overflow-auto"
                style={{ maxHeight: '520px', minHeight: '360px' }}
              >
                {loadingAutores ? (
                  <div className="text-center py-5">
                    <CSpinner size="sm" color="success" />
                    <span className="ms-2 small text-muted">Cargando autores...</span>
                  </div>
                ) : listaAutores.length === 0 ? (
                  <div className="text-center text-muted py-5 small">
                    <div className="mb-2">
                      <CIcon icon={cilUser} size="xxl" className="opacity-25" />
                    </div>
                    <p className="mb-3">No hay autores registrados en el catálogo.</p>
                    <CButton
                      color="success"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpen()}
                    >
                      <CIcon icon={cilPlus} className="me-1" />
                      Registrar primer autor
                    </CButton>
                  </div>
                ) : autoresFiltrados.length === 0 ? (
                  <div className="text-center text-muted py-5 small">
                    <p className="mb-2">
                      No se encontraron autores coincidentes con &quot;{busquedaAutor}&quot;.
                    </p>
                    <CButton
                      color="secondary"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBusquedaAutor('')}
                    >
                      Limpiar búsqueda
                    </CButton>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {autoresFiltrados.map((autor) => {
                      const id = autor.ID_AUTOR ?? autor.id
                      const isSelected =
                        String(autorSeleccionado?.ID_AUTOR ?? autorSeleccionado?.id ?? '') ===
                        String(id)

                      return (
                        <div
                          key={id}
                          onClick={() => handleToggleSelect(autor)}
                          className={`p-3 rounded border d-flex align-items-center justify-content-between transition-all ${isSelected
                            ? 'border-success bg-success bg-opacity-10 shadow-sm'
                            : 'bg-body'
                            }`}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className={`rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm ${isSelected
                                ? 'bg-success text-white'
                                : 'bg-success bg-opacity-10 text-success'
                                }`}
                              style={{ width: '42px', height: '42px' }}
                            >
                              <CIcon icon={cilUser} size="lg" />
                            </div>
                            <div>
                              <div className="font-monospace fw-semibold text-body">
                                {autor.NOMBRE_AUTOR}
                              </div>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <span className="badge bg-body text-secondary border font-monospace">
                                  ID: #{id}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center ms-2">
                            {isSelected ? (
                              <CButton
                                color="success"
                                size="sm"
                                variant="ghost"
                                className="d-flex align-items-center gap-1 p-0 text-decoration-none"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAutorSeleccionado(null)
                                }}
                                title="Clic para deseleccionar"
                              >
                                <CBadge
                                  color="success"
                                  shape="rounded-pill"
                                  className="px-3 py-2 shadow-sm text-white"
                                >
                                  Seleccionado ✕
                                </CBadge>
                              </CButton>
                            ) : (
                              <CButton
                                color="success"
                                size="sm"
                                variant="outline"
                                className="px-3"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAutorSeleccionado(autor)
                                }}
                              >
                                Seleccionar
                              </CButton>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={5}>
          <CCard className="h-100 border shadow-sm">
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2 border-bottom">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilInfo} size="lg" style={{ color: '#0a9b05ff' }} />
                <span>Detalle del Autor</span>
              </div>
              {autorSeleccionado && (
                <CButton
                  color="secondary"
                  variant="ghost"
                  size="sm"
                  className="py-0 px-2 text-muted"
                  onClick={() => setAutorSeleccionado(null)}
                  title="Deseleccionar autor"
                >
                  <span className="small">Deseleccionar ✕</span>
                </CButton>
              )}
            </CCardHeader>

            <CCardBody className="p-4 d-flex flex-column justify-content-between">
              {autorSeleccionado ? (
                <div>
                  <div className="d-flex align-items-center gap-2 mb-3 text-success">
                    <CIcon icon={cilCheckCircle} size="lg" />
                    <span className="fw-bold small text-uppercase">Autor en visualización</span>
                  </div>

                  <div className="bg-body p-3 rounded border mb-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div
                        className="bg-success text-white rounded-circle p-3 d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: '56px', height: '56px' }}
                      >
                        <CIcon icon={cilUser} size="xl" />
                      </div>
                      <div>
                        <h5 className="fw-bold text-body mb-1">{autorSeleccionado.NOMBRE_AUTOR}</h5>
                        <span className="badge bg-body text-secondary border font-monospace">
                          ID: #{autorSeleccionado.ID_AUTOR ?? autorSeleccionado.id}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2 pt-2 border-top">
                      <div className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted small badge bg-body rounded-pill border">
                          Nombre:
                        </span>
                        <span className="fw-semibold small text-body font-monospace">
                          {autorSeleccionado.NOMBRE_AUTOR}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted small badge bg-body rounded-pill border">
                          Identificador del Sistema:
                        </span>
                        <span className="text-success font-monospace fw-semibold small badge bg-success bg-opacity-10 rounded-pill px-2 py-1">
                          #{autorSeleccionado.ID_AUTOR ?? autorSeleccionado.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    <CButton
                      color="danger"
                      variant="outline"
                      className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
                      onClick={() => handleElminiarAutor(autorSeleccionado)}
                    >
                      <CIcon icon={cilTrash} />
                      <span>Eliminar Autor</span>
                    </CButton>
                    <CButton
                      color="success"
                      variant="outline"
                      className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
                      onClick={() => handleOpen(autorSeleccionado)}
                    >
                      <CIcon icon={cilPencil} />
                      <span>Editar Autor</span>
                    </CButton>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 my-auto text-muted">
                  <div
                    className="bg-body border rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                    style={{ width: '84px', height: '84px' }}
                  >
                    <CIcon
                      icon={cilUser}
                      size="xxl"
                    />
                  </div>
                  <h6 className="fw-bold text-body mb-1">Ningún autor seleccionado</h6>
                  <p className="small text-muted mb-4 px-3">
                    Selecciona un autor de la lista izquierda para consultar sus detalles o modificarlo.
                  </p>
                  <CButton
                    color="success"
                    variant="outline"
                    size="sm"
                    className="d-inline-flex align-items-center gap-1 shadow-sm hover:text-white"
                    onClick={() => handleOpen()}
                  >
                    <CIcon icon={cilPlus} />
                    <span>Crear Nuevo Autor</span>
                  </CButton>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Author