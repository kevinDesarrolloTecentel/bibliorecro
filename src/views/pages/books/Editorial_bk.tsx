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
  CSpinner,
} from '@coreui/react-pro'

const Editorial = () => {
  const editoHook = useEditorial()
  const {
    handleOpen,
    listaEditorial,
    busquedaEditorial,
    setBusquedaEditorial,
    loadingEditorial,
    editorialFiltrados,
    editorialSeleccionado,
    setEditorialSeleccionado,
    handleEliminarEditorial,
  } = editoHook

  const handleToggleSelect = (edi: any) => {
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
          <p className="text-muted small mb-0">Gestiona el Catálogo de las Editoriales</p>
        </div>
        <div>
          <CButton
            color="success"
            variant="outline"
            className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
            onClick={() => handleOpen()}
          >
            <CIcon icon={cilPlus} />
            <span>Nueva Editorial</span>
          </CButton>
        </div>
      </div>
      <CRow className="g-4">
        <CCol xs={12} lg={7}>
          <CCard className="h-100 border shadow-sm">
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilFile} size="lg" style={{ color: '#36BBA7' }} />
                <span>Catálogo de Editoriales</span>
              </div>
              <CBadge color="primary" shape="rounded-pill">
                {listaEditorial.length} Registradas
              </CBadge>
            </CCardHeader>
            <CCardBody className="p-3">
              <label className="form-label small fw-semibold text-muted">
                Busca la Editorial por su Nombre o Código:
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
                    {editorialFiltrados.map((edi) => {
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
                            cursor: 'pointer',
                            borderColor: isSelected ? '#0d6efd' : '#dee2e6',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.borderColor = '#0d6efd'
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.borderColor = '#dee2e6'
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
                              <span className="text-muted small font-monospace">ID: #{id}</span>
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            {isSelected ? (
                              <CButton
                                color="primary"
                                size="sm"
                                variant="ghost"
                                className="d-flex align-items-center gap-1 p-0 text-decoration-none"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditorialSeleccionado(null)
                                }}
                                title="Clic para deseleccionar"
                              >
                                <CBadge className="px-3 py-2" color="primary" shape="rounded-pill">
                                  Seleccionado ✕
                                </CBadge>
                              </CButton>
                            ) : (
                              <CButton
                                color="primary"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditorialSeleccionado(edi)
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
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilInfo} size="lg" style={{ color: '#36BBA7' }} />
                <span>Detalle de la Editorial</span>
              </div>
              {editorialSeleccionado && (
                <CButton
                  color="secondary"
                  variant="ghost"
                  size="sm"
                  className="py-0 px-2 text-muted"
                  onClick={() => setEditorialSeleccionado(null)}
                  title="Deseleccionar editorial"
                >
                  <span className="small">Deseleccionar ✕</span>
                </CButton>
              )}
            </CCardHeader>
            <CCardBody className="p-4 d-flex flex-column justify-content-between">
              {editorialSeleccionado ? (
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
                        <span className="badge bg-body text-secondary border font-monospace">
                          ID: #{editorialSeleccionado.ID_EDITORIAL || editorialSeleccionado.id}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2 pt-2 border-top">
                      <div className="d-flex justify-content-between py-1 border-bottom">
                        <span className="text-muted small badge bg-body rounded-pill border">Nombre:</span>
                        <span className="text-body font-monospace fw-semibold small">
                          {editorialSeleccionado.NOMBRE_EDITORIAL}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom">
                        <span className="text-muted small badge bg-body border rounded-pill">Identificador del Sistema:</span>
                        <span className="text-primary font-monospace fw-semibold small bagde bg-primary text-white rounded-pill px-2 py-1">
                          #{editorialSeleccionado.ID_EDITORIAL || editorialSeleccionado.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2 justify-content-end">
                    <CButton
                      color="danger"
                      variant="outline"
                      className="hover:text-white d-flex align-items-center gap-2 shadow-sm"
                      onClick={() => handleEliminarEditorial(editorialSeleccionado)}
                    >
                      <CIcon icon={cilTrash} />
                      <span>Eliminar</span>
                    </CButton>
                    <CButton
                      color="success"
                      variant='outline'
                      className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
                      onClick={() => handleOpen(editorialSeleccionado)}
                    >
                      <CIcon icon={cilPen} />
                      <span>Editar Editorial</span>
                    </CButton>
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
                    Selecciona una editorial de la lista izquierda para consultar sus detalles o modificarla.
                  </p>
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