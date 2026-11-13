import React from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
  CFormTextarea,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilBook, cilExitToApp, cilPencil, cilSave, cilSearch, cilUser } from '@coreui/icons'
import usePrestamoModal, { UsePrestamoModalProps } from '@/hooks/rco-prestamos/usePrestamoModal'

interface ModalPrestamoProps extends UsePrestamoModalProps { }

const Modal_prestamo: React.FC<ModalPrestamoProps> = (props) => {
  const {
    isVisible,
    handleClose,
    loadingCatalogos,
    selectedLibro,
    setSelectedLibro,
    selectedUsuario,
    setSelectedUsuario,
    busquedaLibro,
    handleBuscarLibro,
    busquedaUsuario,
    setBusquedaUsuario,
    detallePrestamo,
    setDetallePrestamo,
    guardando,
    handleGuardarPrestamo,
    canGuardarPrestamo,
    librosFiltrados,
    usuariosFiltrados,
    loadingUsuarios,
  } = usePrestamoModal(props)

  return (
    <CModal size="xl" alignment="center" scrollable visible={isVisible} onClose={handleClose}>
      <CModalHeader closeButton className="border-bottom">
        <CModalTitle className="d-flex align-items-center gap-2 fs-5 fw-bold text-body">
          <CIcon icon={cilBook} size="lg" style={{ color: '#5856d6' }} />
          <span className='text-body'>Registrar Nuevo Préstamo</span>
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-3">
        <CForm onSubmit={handleGuardarPrestamo}>
          <CRow className="g-3">
            <CCol xs={12} md={6}>
              <CCard className="h-100 border rounded-3 shadow-none mb-0">
                <CCardHeader className="bg-body d-flex align-items-center gap-2 py-2 border-bottom">
                  <CIcon icon={cilBook} className="text-secondary" />
                  <span className="fw-semibold text-secondary">Búsqueda y Selección del Libro</span>
                </CCardHeader>
                <CCardBody className="p-3 d-flex flex-column">
                  <label className="form-label text-secondary fw-semibold mb-2">
                    Buscar libro por título, autor o ISBN:
                  </label>
                  <CInputGroup className="mb-3">
                    <CInputGroupText className="bg-body border-end-0 text-secondary">
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Ej: El Principito, Coelho, 978..."
                      value={busquedaLibro}
                      onChange={handleBuscarLibro}
                      className="border-start-0 ps-1"
                    />
                    {loadingCatalogos && (
                      <CInputGroupText className="bg-body border-start-0 text-primary">
                        <CSpinner size="sm" />
                      </CInputGroupText>
                    )}
                  </CInputGroup>

                  <div className="border rounded-3 p-2 bg-body flex-grow-1" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {librosFiltrados.length === 0 ? (
                      <div className="text-center text-body py-3 small">
                        {loadingCatalogos ? 'Cargando libros...' : 'No se encontraron libros disponibles'}
                      </div>
                    ) : (
                      librosFiltrados.map((libro) => {
                        const isSelected = selectedLibro?.value === libro.value
                        return (
                          <div
                            key={libro.value}
                            onClick={() => setSelectedLibro(isSelected ? null : libro)}
                           className={`border rounded-3 p-3 mb-2 d-flex flex-column align-items-start gap-2 ${  isSelected ? 'border-primary bg-primary-subtle shadow-sm' : 'bg-body'
                              }`}
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.15s ease-in-out',
                              borderWidth: isSelected ? '2px' : '1px',
                            }}
                          >
                            <div>
                              <div className="fw-bold text-body mb-1 d-flex flex-column align-items-start gap-1">                            <span>{libro.titulo}</span>
                                <CBadge color="success" className="ms-2 py-1 px-2" style={{ fontSize: '0.72rem' }}>
                                  Disponible
                                </CBadge>
                              </div>
                              <div className="d-flex flex-column gap-1 text-secondary small">
                                <span>Autor: {libro.autor || 'Sin autor'}</span>
                                <span>ISBN: {libro.isbn || 'S/N'}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <div>
                                <CBadge color="primary" shape="rounded-pill" className="px-3 py-1 fw-semibold" style={{ fontSize: '0.78rem' }}>
                                  ✓ Seleccionado
                                </CBadge>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol xs={12} md={6}>
              <CCard className="h-100 border rounded-3 shadow-none mb-0">
                <CCardHeader className="bg-body d-flex align-items-center gap-2 py-2 border-bottom">
                  <CIcon icon={cilUser} className="text-secondary" />
                  <span className="fw-semibold text-secondary">Búsqueda y Selección del Usuario</span>
                </CCardHeader>
                <CCardBody className="p-3 d-flex flex-column">
                  <label className="form-label text-secondary fw-semibold mb-2">
                    Buscar usuario activo por cédula o nombre y apellido:
                  </label>
                  <CInputGroup className="mb-3">
                    <CInputGroupText className="bg-body border-end-0 text-secondary">
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Ej: 1725... o Juan Pérez (solo activos)"
                      value={busquedaUsuario}
                      onChange={(e) => setBusquedaUsuario(e.target.value)}
                      className="border-start-0 ps-1"
                    />
                    {loadingUsuarios && (
                      <CInputGroupText className="bg-body border-start-0 text-primary">
                        <CSpinner size="sm" />
                      </CInputGroupText>
                    )}
                  </CInputGroup>

                  <div className="border rounded-3 p-2 bg-body flex-grow-1" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {usuariosFiltrados.length === 0 ? (
                      <div className="text-center text-muted py-3 small">
                        {loadingUsuarios ? (
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <CSpinner size="sm" color="primary" />
                            <span>Cargando usuarios activos...</span>
                          </div>
                        ) : (
                          'No se encontraron usuarios activos inscritos'
                        )}
                      </div>
                    ) : (
                      usuariosFiltrados.map((usuario) => {
                        const isSelected = selectedUsuario?.value === usuario.value
                        return (
                          <div
                            key={usuario.value}
                            onClick={() => setSelectedUsuario(isSelected ? null : usuario)}
    className={`border rounded-3 p-3 mb-2 d-flex flex-column align-items-start gap-2 ${isSelected ? 'border-primary bg-primary-subtle shadow-sm' : 'bg-body'
                              }`}
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.15s ease-in-out',
                              borderWidth: isSelected ? '2px' : '1px',
                            }}
                          >
                            <div>
    <div className="d-flex flex-column align-items-start gap-2 mb-1">                            <span className="fw-bold text-body text-uppercase">
                                  {usuario.nombre || usuario.apellido
                                    ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()
                                    : usuario.label}
                                </span>
                                <CBadge color="success" shape="rounded-pill" className="px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                                  Activo
                                </CBadge>
                                {usuario.tieneSancion && (
                                  <CBadge color="warning" shape="rounded-pill" className="px-2 py-0.5 text-dark ms-1" style={{ fontSize: '0.72rem' }}>
                                    Sanción previa
                                  </CBadge>
                                )}
                              </div>
                              <div className="text-muted small font-monospace">
                                {usuario.cedula || 'Sin cédula'}
                              </div>
                            </div>
                            {isSelected && (
                              <div>
                                <CBadge color="primary" shape="rounded-pill" className="px-3 py-1 fw-semibold" style={{ fontSize: '0.78rem' }}>
                                  ✓ Seleccionado
                                </CBadge>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol xs={12}>
              <CCard className="border rounded-3 shadow-none mb-0 bg-body">
                <CCardBody className="p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label text-secondary fw-semibold mb-0 d-flex align-items-center gap-1">
                      <CIcon icon={cilPencil} className="text-primary me-1" />
                      <span>Detalle del Préstamo:</span>
                    </label>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                        {detallePrestamo.length}/255
                      </span>
                      <CBadge color="secondary" shape="rounded-pill" className="px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                        Opcional
                      </CBadge>
                    </div>
                  </div>
                  <CFormTextarea
                    rows={2}
                    maxLength={255}
                    placeholder="Ej: Libro con portada desgastada, préstamo especial para fin de semana, etc."
                    value={detallePrestamo}
                    onChange={(e) => setDetallePrestamo(e.target.value)}
                    className="bg-body text-body"
                    style={{ resize: 'none' }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CForm>
      </CModalBody>

      <CModalFooter className="bg-body border-top d-flex justify-content-start gap-2 py-2 px-3">
        <CButton
          color="danger"
          variant="outline"
          size="sm"
          className="hover:text-white d-flex align-items-center gap-1"
          onClick={handleClose}
          disabled={guardando}
        >
          <CIcon icon={cilExitToApp} className="me-1" />
          Cancelar
        </CButton>
        {canGuardarPrestamo && (
          <CButton
            color="success"
            variant='outline'
            size="sm"
            className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
            onClick={() => handleGuardarPrestamo()}
            disabled={guardando || !selectedLibro || !selectedUsuario}
          >
            {guardando ? (
              <>
                <CSpinner size="sm" className="me-1" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CIcon icon={cilSave} className="me-1" />
                <span>Guardar Préstamo</span>
              </>
            )}
          </CButton>
        )}
      </CModalFooter>
    </CModal>
  )
}

export default Modal_prestamo