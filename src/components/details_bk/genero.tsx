import { useGenero, UseGeneroProps } from "@/hooks/rco-libros/useGenero"
import { cilBank, cilClipboard, cilColorBorder, cilExitToApp, cilNewspaper } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CInputGroup, CInputGroupText, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

export interface ModalGeneroProps extends UseGeneroProps {
    generoState?: ReturnType<typeof useGenero>
}

const ModalGen: React.FC<ModalGeneroProps> = (props) => {
    const internalHook = useGenero({
        ...props,
        autoFetch: !props.generoState,
    })
    const hook = props.generoState || internalHook
    const {
        handleClose,
        isVisible,
        generoEnEdicion,
        handleGuardarGenero,
        nombreGenero,
        guardando,
        setNombreGenero
    } = hook

    return (
        <>
            <CModal
                size="lg"
                visible={isVisible}
                onClose={handleClose}
                aria-labelledby="ModalGenero"
                backdrop='static'
            >
                <CModalHeader closeButton className="bg-body">
                    <CModalTitle id="ModalGenero" className="d-flex align-items-center gap-2 fs-5 fw-bold text-body">
                        <CIcon icon={cilClipboard} />
                        <span>{generoEnEdicion ? 'Editar Género ' : 'Registrar Género'}</span>
                    </CModalTitle>
                </CModalHeader>

                <CModalBody className="p-4">
                    <CForm id="formmodalgenero" onSubmit={handleGuardarGenero} className="row g-3">
                        <CCol xs={12}>
                            <div className="d-flex allign-ites-center gap-2 pb-2 border-bottom fw-semibold ">
                                <CIcon icon={cilColorBorder} />
                                <span>DATOS GENERALES DEL GÉNERO</span>
                            </div>
                        </CCol>
                        <CCol xs={12} md={8}>
                            <label className="form-label small fw-semibold text-muted">
                                Nombre del Género <span className="text-danger">*</span>
                            </label>
                            <CInputGroup>
                                <CInputGroupText className="bg-body">
                                    <CIcon className="text-muted" icon={cilBank} />
                                </CInputGroupText>
                                <CFormInput
                                    type="texr"
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
                <CModalFooter className="bg-body d-flex justify-content-between aling-items-center">
                    <CButton color="danger" variant="outline" className="hover:text-white" onClick={handleClose} disabled={guardando}>
                        <CIcon className="me-1" icon={cilExitToApp} />
                        Cancelar
                    </CButton>
                    <CButton color="success" variant="outline" type="submit" form="formmodalgenero" disabled={guardando || !nombreGenero.trim()} className="d-flex align-items-center gap-1 shadow-sm hover:text-white">
                        {guardando ? (
                            <>
                                <CSpinner size="sm" className="me-1" variant="grow" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <CIcon className="me-1" icon={cilNewspaper} />
                                {generoEnEdicion ? 'Actualizar Género' : 'Guardar Género'}
                            </>
                        )}
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default ModalGen