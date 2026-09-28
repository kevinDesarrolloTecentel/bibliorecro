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
  cilBank,
  cilExitToApp,
  cilSave,
  cilTruck,
} from '@coreui/icons'
import useProveedor, { UseProveedorProps } from '@/hooks/rco-libros/useProveedor'

export interface ModalProveedorProps extends UseProveedorProps {
  proveedorState?: ReturnType<typeof useProveedor>
}

const ModalPv: React.FC<ModalProveedorProps> = (props) => {
  const internalHook = useProveedor({
    ...props,
    autoFetch: !props.proveedorState,
  })
  const hook = props.proveedorState || internalHook

  const {
    isVisible,
    handleClose,
    proveedorEnEdicion,
    handleGuardarProveedor,
    nombreProveedor,
    setNombreProveedor,
    guardando
  } = hook

  return (
    <>
      <CModal
        size="lg"
        visible={isVisible}
        onClose={handleClose}
        aria-labelledby="ModalProveedor"
        backdrop="static"
      >
        <CModalHeader closeButton className="bg-body">
          <CModalTitle id="ModalProveedor" className="d-flex align-items-center gap-2 fs-5 fw-bold text-dark">
            <CIcon icon={cilTruck} size="lg" className="text-primary" />
            <span>{proveedorEnEdicion ? 'Editar Información del Proveedor' : 'Registrar Nuevo Proveedor'}</span>
          </CModalTitle>
        </CModalHeader>

        <CModalBody className="p-4">
          <CForm id="formModalProveedor" onSubmit={handleGuardarProveedor} className="row g-3">
            <CCol xs={12}>
              <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold ">
                <CIcon icon={cilTruck} />
                <span>DATOS GENERALES DEL PROVEEDOR</span>
              </div>
            </CCol>

            <CCol xs={12} md={8}>
              <label className="form-label small fw-semibold text-muted">
                Nombre del Proveedor <span className="text-danger">*</span>
              </label>
              <CInputGroup>
                <CInputGroupText className="bg-body">
                  <CIcon icon={cilBank} className="text-muted" />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Ej: Casa de la Cultura"
                  value={nombreProveedor}
                  onChange={(e) => setNombreProveedor(e.target.value)}
                  required
                  autoFocus
                />
              </CInputGroup>
            </CCol>
          </CForm>
        </CModalBody>

        <CModalFooter className="bg-body d-flex justify-content-between align-items-center">
          <CButton color="danger" variant="outline" className='hover:text-white' onClick={handleClose} disabled={guardando}>
            <CIcon icon={cilExitToApp} className="me-1" />
            Cancelar
          </CButton>
          <CButton
            color="success"
            variant='outline'
            type="submit"
            form="formModalProveedor"
            disabled={guardando || !nombreProveedor.trim()}
            className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
          >
            {guardando ? (
              <>
                <CSpinner size="sm" className="me-1" />
                Guardando...
              </>
            ) : (
              <>
                <CIcon icon={cilSave} className="me-1" />
                {proveedorEnEdicion ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ModalPv