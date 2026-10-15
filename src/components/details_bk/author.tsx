import useAutor, { UseAutorProps } from "@/hooks/rco-libros/useAutor"
import { cilExitToApp, cilLibraryBuilding, cilPenAlt, cilPeople, cilSave } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CInputGroup, CInputGroupText, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

export interface MadalAutorProps extends UseAutorProps {
  autorState?: ReturnType<typeof useAutor>
}

export const ModalAut: React.FC<MadalAutorProps> = (props) => {
  const InternalHook = useAutor({
    ...props,
    autoFetch: !props.autorState,
  })

  const hook = props.autorState || InternalHook
  const {
    isVisible,
    handleClose,
    nombreAutor,
    setNombreAutor,
    autorEnEdicion,
    guardando,
    handleGuardarAutor } = hook

  return (
    <>
      <CModal
        size="lg"
        visible={isVisible}
        onClose={handleClose}
        >
          <CModalHeader closeButton className="bg-body">
            <CModalTitle className="d-flex align-items-center gap-2 ">
              <CIcon icon={cilPeople} size="xl"/>
              <span>
                {autorEnEdicion ? 'Editar informacion del Autor' : 'Registrar nuevo Autor'}
              </span>
            </CModalTitle>
          </CModalHeader>
          <CModalBody className="p-4">
              <CForm>
                <CCol id="formModalAutor" onSubmit={handleGuardarAutor} >
                  <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold">
                    <CIcon icon={cilPenAlt}/>
                    <span>DATOS GENERALES DEL AUTOR</span>
                  </div>
                </CCol>

                <CCol>
                  <label className="form-label small fw-semibold text-muted">Nombre del Autor</label>
                  <CInputGroup>
                    <CInputGroupText className="bg-body">
                      <CIcon icon={cilLibraryBuilding}/>
                    </CInputGroupText>
                    <CFormInput 
                    type="text"
                    placeholder="Ej: Julio Verne"
                    value={nombreAutor}
                    onChange={(e)=>setNombreAutor(e.target.value)}
                    required
                    autoFocus/>
                  </CInputGroup>
                </CCol>
              </CForm>
            </CModalBody>
            <CModalFooter className="bg-body d-flex justify-content-between align-items-center">
              <CButton
              color="danger"
              variant="outline"
              onClick={handleClose}>
                <CIcon icon={cilExitToApp} className="me-1"/>
                Cancelar
              </CButton>
              <CButton
              color="success"
              variant="outline"
              type="submit"
              form=" formModalAutor"
              disabled={guardando || !nombreAutor.trim()}
              onClick={handleGuardarAutor}
              >{guardando?(
                <>
                <CSpinner size="sm" className="me-1" variant="grow"/>
                Guardando...
                </>
              ):(
              <>
              <CIcon icon={cilSave} className="me-1"/>
              {autorEnEdicion? 'Actualizar Autor': 'Guardar Autor'}
              </>
            )}</CButton>
            </CModalFooter>
      </CModal>
    </>
  )
}
export default ModalAut