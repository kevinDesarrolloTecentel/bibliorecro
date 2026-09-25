import useRoles from "@/hooks/admin-roles/useRoles"
import { cilExitToApp, cilPenNib, cilShieldAlt, cilTrash } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

const ModalRolActu = ({ userState }: { userState: ReturnType<typeof useRoles> }) => {
    return(
                    <CModal visible={userState.modalEditar} onClose={() => userState.setModalEditar(false)}>
                        <CModalHeader>
                            <CModalTitle className="d-flex align-items-center">
                                <CIcon icon={cilShieldAlt} className="me-2 text-primary" />
                                Actualizar Rol
                            </CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <CForm className="row g-3">
                                <CCol xs={12}>
                                    <CFormInput
                                        type="text"
                                        id="editNombreRol"
                                        label="Nombre del Rol *"
                                        value={userState.editFormData.nombre}
                                        onChange={(e) => userState.setEditFormData({ ...userState.editFormData, nombre: e.target.value })}
                                    />
                                </CCol>
                                <CCol xs={12} sm={6}>
                                    <CFormInput
                                        type="number"
                                        id="editNivelRol"
                                        label="Nivel del Rol *"
                                        min={1}
                                        max={10}
                                        value={userState.editFormData.nivel}
                                        onChange={(e) => userState.setEditFormData({ ...userState.editFormData, nivel: Number(e.target.value) })}
                                    />
                                </CCol>
                                <CCol xs={12} sm={6}>
                                    <CFormSelect
                                        id="editEstadoRol"
                                        label="Estado"
                                        value={userState.editFormData.estado}
                                        onChange={(e) => userState.setEditFormData({ ...userState.editFormData, estado: e.target.value })}
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </CFormSelect>
                                </CCol>
                            </CForm>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="danger" variant="outline" className="hover:text-white" onClick={() => userState.setModalEditar(false)} disabled={userState.guardando}>
                                <CIcon icon={cilExitToApp} className="me-1"/>
                                Cerrar
                            </CButton>
                            <CButton
                                color="warning"
                                variant="outline"
                                className="hover:text-white"
                                onClick={() => userState.handleEliminarRol(userState.editFormData.id, userState.editFormData.nombre)}
                                disabled={userState.guardando}
                            >
                                {userState.guardando ? <CSpinner size="sm" className="me-1" /> : null}
                                <CIcon icon={cilTrash} className="me-1"/>
                                Eliminar Rol
                            </CButton>
                            <CButton color="success" variant="outline" className="hover:text-white" onClick={userState.handleActualizarRol} disabled={userState.guardando}>
                                {userState.guardando ? <CSpinner size="sm" className="me-1" /> : null}
                                <CIcon icon={cilPenNib} className="me-1"/>
                                Actualizar Rol
                            </CButton>
                        </CModalFooter>
                    </CModal>
    )
}
export default ModalRolActu