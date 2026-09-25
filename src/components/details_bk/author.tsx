import React from 'react'
import {
  CButton,
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
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilExitToApp,
  cilPencil,
  cilPlus,
  cilSave,
  cilUser,
} from '@coreui/icons'
import useAutor, { UseAutorProps } from '@/hooks/rco-libros/useAutor'

export interface ModalAutorProps extends UseAutorProps {
  autorState?: ReturnType<typeof useAutor>
}

const ModalAt: React.FC<ModalAutorProps> = (props) => {
  const internalHook = useAutor(props)
  const hook = props.autorState || internalHook

  const {
    isVisible,
    handleClose,
    autorEnEdicion,
    guardando,
    handleGuardarAutor,
    nombreAutor,
    setNombreAutor,
  } = hook

  return (
    <CModal
      size="lg"
      visible={isVisible}
      onClose={handleClose}
      aria-labelledby="ModalAutorLabel"
      backdrop="static"
    >
      <CModalHeader closeButton className="bg-body border-bottom">
        <CModalTitle id="ModalAutorLabel" className="d-flex align-items-center gap-2 fs-5 fw-bold text-body">
          <CIcon
            icon={autorEnEdicion ? cilPencil : cilPlus}
            size="lg"
            style={{ color: '#0a9b05ff' }}
          />
          <span>{autorEnEdicion ? 'Editar Información del Autor' : 'Registrar Nuevo Autor'}</span>
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-4 bg-body">
        <CForm id="formModalAutor" onSubmit={handleGuardarAutor} className="row g-3">
          <CCol xs={12}>
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold text-body">
              <CIcon icon={cilUser} style={{ color: '#0a9b05ff' }} />
              <span>DATOS GENERALES DEL AUTOR</span>
            </div>
          </CCol>

          <CCol xs={12}>
            <label className="form-label small fw-semibold text-muted">
              Nombre Completo del Autor <span className="text-danger">*</span>
            </label>
            <CInputGroup>
              <CInputGroupText className="bg-body border">
                <CIcon icon={cilUser} className="text-muted" />
              </CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Ej: Gabriel García Márquez"
                value={nombreAutor}
                onChange={(e) => setNombreAutor(e.target.value)}
                required
                autoFocus
                disabled={guardando}
              />
            </CInputGroup>
            <div className="form-text small text-muted mt-1">
              Ingresa el nombre o seudónimo del autor tal como aparecerá en el catálogo de libros.
            </div>
          </CCol>
        </CForm>
      </CModalBody>

      <CModalFooter className="bg-body border-top d-flex justify-content-between align-items-center">
        <CButton
          color="danger"
          variant="outline"
          className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
          onClick={handleClose}
          disabled={guardando}
        >
          <CIcon icon={cilExitToApp} />
          <span>Cancelar</span>
        </CButton>
        <CButton
          color="success"
          variant="outline"
          type="submit"
          form="formModalAutor"
          disabled={guardando || !nombreAutor.trim()}
          className="d-flex align-items-center gap-1 shadow-sm hover:text-white"
        >
          {guardando ? (
            <>
              <CSpinner size="sm" className="me-1" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <CIcon icon={cilSave} className="me-1" />
              <span>{autorEnEdicion ? 'Actualizar Autor' : 'Guardar Autor'}</span>
            </>
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalAt