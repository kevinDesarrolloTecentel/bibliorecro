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
import { cilExitToApp, cilLibraryBuilding, cilPenAlt, cilPeople, cilSave } from '@coreui/icons'
import useAutor, { UseAutorProps } from '@/hooks/rco-libros/useAutor'

export interface ModalAutorProps extends UseAutorProps {
  autorState?: ReturnType<typeof useAutor>
}

// Retrocompatibilidad con el typo original
export type MadalAutorProps = ModalAutorProps

// Presentación desacoplada para evitar ejecuciones redundantes del hook
const ModalAutContent: React.FC<{ hook: ReturnType<typeof useAutor> }> = ({ hook }) => {
  const {
    isVisible,
    handleClose,
    nombreAutor,
    setNombreAutor,
    autorEnEdicion,
    guardando,
    handleGuardarAutor,
    canGuardarAutor,
    canActualizarAutor,
  } = hook

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sinNumeros = e.target.value.replace(/[0-9]/g, '')
    setNombreAutor(sinNumeros)
  }

  return (
    <CModal
      size="lg"
      visible={isVisible}
      onClose={handleClose}
      backdrop="static"
    >
      <CModalHeader closeButton className="bg-body">
        <CModalTitle className="d-flex align-items-center gap-2">
          <CIcon icon={cilPeople} size="xl" />
          <span>
            {autorEnEdicion ? 'Editar información del Autor' : 'Registrar nuevo Autor'}
          </span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="p-4">
        <CForm id="formModalAutor" onSubmit={handleGuardarAutor}>
          <CCol>
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold">
              <CIcon icon={cilPenAlt} />
              <span>DATOS GENERALES DEL AUTOR</span>
            </div>
          </CCol>

          <CCol className="mt-3">
            <label className="form-label small fw-semibold text-muted">
              Nombre del Autor <span className="text-danger">*</span>
            </label>
            <CInputGroup>
              <CInputGroupText className="bg-body">
                <CIcon icon={cilLibraryBuilding} />
              </CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Ej: Julio Verne"
                value={nombreAutor}
                onChange={handleNombreChange}
                required
                autoFocus
              />
            </CInputGroup>
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter className="bg-body d-flex justify-content-between align-items-center">
        <CButton
          color="danger"
          variant="outline"
          className="hover:text-white"
          size="sm"
          disabled={guardando}
          onClick={handleClose}
        >
          <CIcon icon={cilExitToApp} className="me-1" />
          Cancelar
        </CButton>
        {autorEnEdicion ? (
          canActualizarAutor && (
            <CButton
              color="success"
              size="sm"
              variant="outline"
              className="d-flex align-items-center gap-1 shadow-sm hover:text-white"
              type="submit"
              form="formModalAutor"
              disabled={guardando || !nombreAutor.trim()}
            >
              {guardando ? (
                <>
                  <CSpinner size="sm" className="me-1" />
                  Actualizando...
                </>
              ) : (
                <>
                  <CIcon icon={cilSave} className="me-1" />
                  Actualizar Autor
                </>
              )}
            </CButton>
          )
        ) : (
          canGuardarAutor && (
            <CButton
              color="success"
              variant="outline"
              className="d-flex align-items-center gap-1 shadow-sm hover:text-white"
              type="submit"
              form="formModalAutor"
              size="sm"
              disabled={guardando || !nombreAutor.trim()}
            >
              {guardando ? (
                <>
                  <CSpinner size="sm" className="me-1" />
                  Guardando...
                </>
              ) : (
                <>
                  <CIcon icon={cilSave} className="me-1" />
                  Guardar Autor
                </>
              )}
            </CButton>
          )
        )}
      </CModalFooter>
    </CModal>
  )
}

const ModalAutStandalone: React.FC<UseAutorProps> = (props) => {
  const hook = useAutor(props)
  return <ModalAutContent hook={hook} />
}

export const ModalAut: React.FC<ModalAutorProps> = (props) => {
  if (props.autorState) {
    return <ModalAutContent hook={props.autorState} />
  }
  return <ModalAutStandalone {...props} />
}

export default ModalAut
