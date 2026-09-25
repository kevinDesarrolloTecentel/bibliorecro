import { useEditorial, UseEditorialProps } from "@/hooks/rco-libros/useEditorial"
import { cilAccountLogout, cilBook, cilClipboard, cilDescription, cilLibraryBuilding } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CInputGroup, CInputGroupText, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"
import React from "react"

export interface ModaleditorialProps extends UseEditorialProps {
    editorialState?: ReturnType<typeof useEditorial>
}

const EditoModal: React.FC<ModaleditorialProps> = (props) => {
    const internalHook = useEditorial(props)
    const hook = props.editorialState || internalHook
    const {
        isVisible,
        handleClose,
        handleGuardarEditorial,
        editorialEnEdicion,
        nombreEditorial,
        setNombreEditorial,
        guardando

    } = hook
    return (
        <>
            <CModal
                size="lg"
                visible={isVisible}
                onClose={handleClose}
                backdrop="static">
                <CModalHeader className="bg-body" closeButton>
                    <CModalTitle id='modaleditorial' className="d-flex align-items-center gap-2 fw-bold text-body">
                        <CIcon icon={cilClipboard} />
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
                                    placeholder="Ej: Casa Espanola"
                                    value={nombreEditorial}
                                    onChange={(e) => setNombreEditorial(e.target.value)} />
                            </CInputGroup>
                        </CCol>
                    </CForm>
                </CModalBody>
                <CModalFooter className="bg-body d-flex align-items-center justify-content-between">
                    <CButton color="danger" variant="outline" className="hover:text-white" onClick={handleClose} disabled={guardando}>
                        <CIcon className="me-1" icon={cilAccountLogout} />
                        Cancelar
                    </CButton>
                    <CButton color="success" variant="outline" type="submit" form="formeditorialmodal" disabled={guardando} className="hover:text-white">
                        {guardando ?
                            (
                                <>
                                    <CSpinner size="sm" className="me-1" variant="grow" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <CIcon className="me-1" icon={cilDescription} />
                                    {editorialEnEdicion ? 'Actualizar Editorial' : 'Guardar Editorial'}
                                </>
                            )}
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}
export default EditoModal