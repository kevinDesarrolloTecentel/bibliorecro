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
import { cilExitToApp, cilNotes, cilSave } from '@coreui/icons'
import { useGenero, UseGeneroProps } from '@/hooks/rco-libros/useGenero'

export interface ModalGeneroProps extends UseGeneroProps {
  generoState?: ReturnType<typeof useGenero>
}

// Presentación desacoplada para evitar ejecuciones redundantes del hook
const ModalGenContent: React.FC<{ hook: ReturnType<typeof useGenero> }> = ({ hook }) => {
  const {
    handleClose,
    isVisible,
    generoEnEdicion,
    handleGuardarGenero,
    nombreGenero,
    guardando,
    setNombreGenero,
    canGuardarGenero,
    canActualizarGenero,
  } = hook

  return (
    <CModal
      size="lg"
      visible={isVisible}
      onClose={handleClose}
      aria-labelledby="ModalGenero"
      backdrop="static"
    >
      <CModalHeader closeButton className="bg-body">
        <CModalTitle id="ModalGenero" className="d-flex align-items-center gap-2 fs-5 fw-bold text-body">
          <CIcon icon={cilNotes} size="lg" className="text-primary" />
          <span>{generoEnEdicion ? 'Editar Información del Género' : 'Registrar Nuevo Género'}</span>
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-4">
        <CForm id="formmodalgenero" onSubmit={handleGuardarGenero} className="row g-3">
          <CCol xs={12}>
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold">
              <CIcon icon={cilNotes} />
              <span>DATOS GENERALES DEL GÉNERO</span>
            </div>
          </CCol>
          <CCol xs={12} md={8}>
            <label className="form-label small fw-semibold text-muted">
              Nombre del Género <span className="text-danger">*</span>
            </label>
            <CInputGroup>
              <CInputGroupText className="bg-body">
                <CIcon className="text-muted" icon={cilNotes} />
              </CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Ej: Musical"
                value={nombreGenero}
                onChange={(e) => setNombreGenero(e.target.value)}
                required
                autoFocus
              />
            </CInputGroup>
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter className="bg-body d-flex justify-content-between align-items-center">
        <CButton
          size="sm"
          color="danger"
          variant="outline"
          className="hover:text-white shadow-sm"
          onClick={handleClose}
          disabled={guardando}
        >
          <CIcon className="me-1" icon={cilExitToApp} />
          Cancelar
        </CButton>
        {generoEnEdicion ? (
          canActualizarGenero && (
            <CButton
              size="sm"
              color="success"
              variant="outline"
              type="submit"
              form="formmodalgenero"
              disabled={guardando || !nombreGenero.trim()}
              className="d-flex align-items-center gap-1 shadow-sm hover:text-white"
            >
              {guardando ? (
                <>
                  <CSpinner size="sm" className="me-1" />
                  Actualizando...
                </>
              ) : (
                <>
                  <CIcon className="me-1" icon={cilSave} />
                  Actualizar Género
                </>
              )}
            </CButton>
          )
        ) : (
          canGuardarGenero && (
            <CButton
              size="sm"
              color="success"
              variant="outline"
              type="submit"
              form="formmodalgenero"
              disabled={guardando || !nombreGenero.trim()}
              className="d-flex align-items-center gap-1 shadow-sm hover:text-white"
            >
              {guardando ? (
                <>
                  <CSpinner size="sm" className="me-1" />
                  Guardando...
                </>
              ) : (
                <>
                  <CIcon className="me-1" icon={cilSave} />
                  Guardar Género
                </>
              )}
            </CButton>
          )
        )}
      </CModalFooter>
    </CModal>
  )
}

const ModalGenStandalone: React.FC<UseGeneroProps> = (props) => {
  const hook = useGenero(props)
  return <ModalGenContent hook={hook} />
}

const ModalGen: React.FC<ModalGeneroProps> = (props) => {
  if (props.generoState) {
    return <ModalGenContent hook={props.generoState} />
  }
  return <ModalGenStandalone {...props} />
}

export default ModalGen
