import useAutor, { UseAutorProps } from "@/hooks/rco-libros/useAutor";
import { cilPen } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

import { CButton, CCol, CForm, CFormInput, CInputGroup, CInputGroupText, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro";

export interface ModalAutorProps extends UseAutorProps{
  autorState?: ReturnType<typeof useAutor>
}

const ModalAut: React.FC<ModalAutorProps>=(props)=>{
  const internalHook = useAutor({
    ...props,
    autoFetch: !props.autorState
  })

  const hook = props.autorState || internalHook

  const {
    isVisible,
    handleClose,
    autorEnEdicion,
    nombreAutor,
    setNombreAutor,
    guardando,
    handleGuardarAutor
  } = hook

  return(
    <>
    <CModal
    size="xl"
    visible={isVisible}
    onClose={handleClose}
    aria-labelledby="ModalAutorLabel">
      <CModalHeader closeButton className="bg-body">
        <CModalTitle id="ModalAutorLabel" className="d-flex align-items-cenetr gap-2 fs -5 fw-bold text-dark">
          <CIcon/>
          <span>
            {autorEnEdicion ? 'Editar la Información del Autor' : 'Registrar Nuevo Autor' }
          </span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="p-4">
        <CForm id="formModalAutor" onSubmit={handleGuardarAutor} className="row g-3">
          <CCol xs={12}>
            <div className="d-flex align-items-cenetr gap-2 pb-2 border-bottom fw-semibold">
              <CIcon/>
              <span>DATOS GENERALES DEL AUTOR</span>
            </div>
          </CCol>

          <CCol xs={12} md={8}>
            <label className="form-label small fw-semibold text-muted">Nombre del Autor</label>
            <CInputGroup>
              <CInputGroupText className="bg-body">
                <CIcon/>
              </CInputGroupText>
              <CFormInput 
              type="text"
              placeholder="Ej: Julio Verne"
              value={nombreAutor}
              onChange={(e)=>setNombreAutor(e.target.value)}
              required/>
            </CInputGroup>
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter className="bg-body d-flex justofy-content-between align-items-center">
        <CButton
        color="danger"
        variant="outline"
        onClick={handleClose}
        className="hover:text-white">
          Cerrar
        </CButton>
        <CButton
        color="success"
        variant="outline"
        type="submit"
        className="d-flex align-items-cenetr gap-1 shadow-sm hover:text-white"
        disabled={!nombreAutor.trim()}>
          {guardando?(
            <CSpinner variant="grow"/>
          ):(
            <>
            <CIcon icon={cilPen}/>
            {autorEnEdicion ? 'Actualizar Autor' : 'Guardar Autor'}
            </>
        )}
        </CButton>
      </CModalFooter>
    </CModal>
    </>
  )
}
export default ModalAut