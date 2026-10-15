import React from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilBook, cilExitToApp, cilSave, cilSearch, cilUser } from '@coreui/icons'
import usePrestamoModal, { UsePrestamoModalProps } from '@/hooks/rco-prestamos/usePrestamoModal'
import { usePermissions } from '@/context/PermissionsContext'

interface ModalPrestamoProps extends UsePrestamoModalProps {}

const Modal_prestamo: React.FC<ModalPrestamoProps> = (props) => {
  const { canDoAction } = usePermissions()
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
    guardando,
    handleGuardarPrestamo,
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
          <CCard className="mb-3 border rounded-3 shadow-none">
            <CCardBody className="p-3">
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

              <div className="border rounded-3 p-2 bg-body" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                        className={`border rounded-3 p-3 mb-2 d-flex justify-content-between align-items-center ${
                          isSelected ? 'border-primary bg-body' : 'bg-body'
                        }`}
                      >
                        <div className='bg-body'>
                          <div className="fw-bold text-body mb-1 d-flex align-items-center">
                            <span>{libro.titulo}</span>
                            <CBadge color="success" className="ms-2 py-1 px-2" style={{ fontSize: '0.72rem' }}>
                              Disponible
                            </CBadge>
                          </div>
                          <div className="text-body small">
                            {libro.autor || 'Sin autor'} • {libro.isbn || 'S/N'}
                          </div>
                        </div>
                        <div>
                          <CButton
                            color={isSelected ? 'success' : 'primary'}
                            variant={isSelected ? undefined : 'outline'}
                            size="sm"
                            className={`px-3 ${isSelected ? 'text-white' : ''}`}
                            onClick={() => setSelectedLibro(isSelected ? null : libro)}
                          >
                            {isSelected ? 'Seleccionado' : 'Seleccionar'}
                          </CButton>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CCardBody>
          </CCard>

          <CCard className="border rounded-3 shadow-none mb-1">
            <CCardHeader className="bg-body d-flex align-items-center gap-2 py-2 border-bottom">
              <CIcon icon={cilUser} className="text-secondary" />
              <span className="fw-semibold text-secondary">Búsqueda y Selección del Usuario</span>
            </CCardHeader>
            <CCardBody className="p-3">
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

              <div className="border rounded-3 p-2 bg-body" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                        className={`border rounded-3 p-3 mb-2 d-flex justify-content-between align-items-center ${
                          isSelected ? 'border-primary bg-body' : 'bg-body'
                        }`}
                      >
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold text-body text-uppercase">
                              {usuario.nombre || usuario.apellido
                                ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()
                                : usuario.label}
                            </span>
                            <CBadge color="success" shape="rounded-pill" className="px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                              Activo
                            </CBadge>
                          </div>
                          <div className="text-muted small font-monospace">
                            {usuario.cedula || 'Sin cédula'}
                          </div>
                        </div>
                        <div>
                          <CButton
                            color={isSelected ? 'success' : 'primary'}
                            variant={isSelected ? undefined : 'outline'}
                            size="sm"
                            className={`px-3 ${isSelected ? 'text-white' : ''}`}
                            onClick={() => setSelectedUsuario(isSelected ? null : usuario)}
                          >
                            {isSelected ? 'Seleccionado' : 'Seleccionar'}
                          </CButton>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CCardBody>
          </CCard>
        </CForm>
      </CModalBody>

      <CModalFooter className="bg-body border-top d-flex justify-content-start gap-2 py-2 px-3">
        <CButton
          color="danger"
          variant="outline"
          className="hover:text-white d-flex align-items-center gap-1"
          onClick={handleClose}
          disabled={guardando}
        >
          <CIcon icon={cilExitToApp} className="me-1" />
          Cancelar
        </CButton>
        {canDoAction('btn_crear_prestamo') && (
          <CButton
            color="success"
            variant='outline'
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