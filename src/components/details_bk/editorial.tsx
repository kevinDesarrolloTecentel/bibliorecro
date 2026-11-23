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
import { cilBook, cilExitToApp, cilLibraryBuilding, cilSave } from '@coreui/icons'
import { useEditorial, UseEditorialProps } from '@/hooks/rco-libros/useEditorial'

export interface ModalEditorialProps extends UseEditorialProps {
  editorialState?: ReturnType<typeof useEditorial>
}

// Retrocompatibilidad con typo original
export type ModaleditorialProps = ModalEditorialProps

// Presentación desacoplada para evitar ejecuciones redundantes del hook
const EditoModalContent: React.FC<{ hook: ReturnType<typeof useEditorial> }> = ({ hook }) => {
  const {
    isVisible,
    handleClose,
    handleGuardarEditorial,
    editorialEnEdicion,
    nombreEditorial,
    setNombreEditorial,
    guardando,
    canGuardarEditorial,
    canActualizarEditorial,
  } = hook

  return (
    <CModal
      size="lg"
      visible={isVisible}
      onClose={handleClose}
      backdrop="static"
    >
      <CModalHeader className="bg-body" closeButton>
        <CModalTitle id="modaleditorial" className="d-flex align-items-center gap-2 fw-bold text-body">
          <CIcon icon={cilBook} />
          <span>{editorialEnEdicion ? 'Editar Editorial' : 'Registrar Editorial'}</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="p-4">
        <CForm id="formeditorialmodal" onSubmit={handleGuardarEditorial} className="row g-3">
          <CCol xs={12}>
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold">
              <CIcon icon={cilLibraryBuilding} />
              <span>DATOS GENERALES DE LA EDITORIAL</span>
            </div>
          </CCol>
          <CCol xs={12}>
            <label className="form-label small fw-semibold text-muted">
              Nombre de la Editorial <span className="text-danger">*</span>
            </label>
            <CInputGroup>
              <CInputGroupText className="bg-body">
                <CIcon icon={cilBook} />
              </CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Ej: Casa Española"
                value={nombreEditorial}
                onChange={(e) => setNombreEditorial(e.target.value)}
                required
                autoFocus
              />
            </CInputGroup>
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter className="bg-body d-flex align-items-center justify-content-between">
        <CButton
          size="sm"
          color="danger"
          variant="outline"
          className="hover:text-white"
          onClick={handleClose}
          disabled={guardando}
        >
          <CIcon className="me-1" icon={cilExitToApp} />
          Cancelar
        </CButton>
        {editorialEnEdicion ? (
          canActualizarEditorial && (
            <CButton
              size="sm"
              color="success"
              variant="outline"
              type="submit"
              form="formeditorialmodal"
              disabled={guardando || !nombreEditorial.trim()}
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
                  Actualizar Editorial
                </>
              )}
            </CButton>
          )
        ) : (
          canGuardarEditorial && (
            <CButton
              size="sm"
              color="success"
              variant="outline"
              type="submit"
              form="formeditorialmodal"
              disabled={guardando || !nombreEditorial.trim()}
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
                  Guardar Editorial
                </>
              )}
            </CButton>
          )
        )}
      </CModalFooter>
    </CModal>
  )
}

const EditoModalStandalone: React.FC<UseEditorialProps> = (props) => {
  const hook = useEditorial(props)
  return <EditoModalContent hook={hook} />
}

const EditoModal: React.FC<ModalEditorialProps> = (props) => {
  if (props.editorialState) {
    return <EditoModalContent hook={props.editorialState} />
  }
  return <EditoModalStandalone {...props} />
}

export default EditoModal
