
import useRoles from "@/hooks/admin-roles/useRoles"
import { cilExitToApp, cilPenNib, cilShieldAlt } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

const ModalCreate = ({ userState }: { userState: ReturnType<typeof useRoles> }) => {
    return (
        <CModal visible={userState.modalCrear} onClose={() => userState.setModalCrear(false)}>
            <CModalHeader>
                <CModalTitle className="d-flex align-items-center">
                    <CIcon icon={cilShieldAlt} className="me-2 text-primary" />
                    Crear Nuevo Rol
                </CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm className="row g-3">
                    <CCol xs={12}>
                        <CFormInput
                            type="text"
                            id="inputNombreRol"
                            label="Nombre del Rol *"
                            placeholder="Ej. Administrador, Bibliotecario, Supervisor..."
                            value={userState.formData.nombre}
                            onChange={(e) => userState.setFormData({ ...userState.formData, nombre: e.target.value })}
                        />
                    </CCol>
                    <CCol xs={12} sm={6}>
                        <CFormInput
                            type="number"
                            id="inputNivelRol"
                            label="Nivel del Rol *"
                            min={1}
                            max={10}
                            placeholder="1"
                            value={userState.formData.nivel}
                            onChange={(e) => userState.setFormData({ ...userState.formData, nivel: Number(e.target.value) })}
                        />
                    </CCol>
                    <CCol xs={12} sm={6}>
                        <CFormSelect
                            id="inputEstadoRol"
                            label="Estado"
                            value={userState.formData.estado}
                            onChange={(e) => userState.setFormData({ ...userState.formData, estado: e.target.value })}
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </CFormSelect>
                    </CCol>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color="danger" variant="outline" className="hover:text-white" onClick={() => userState.setModalCrear(false)} disabled={userState.guardando}>
                    <CIcon icon={cilExitToApp} className="me-1"/>
                    Cancelar
                </CButton>
                <CButton color="success" variant="outline" className="hover:text-white" onClick={userState.handleGuardarRol} disabled={userState.guardando}>
                    {userState.guardando ? <CSpinner size="sm" className="me-1" /> : null}
                    <CIcon icon={cilPenNib} className="me-1"/>
                    Guardar Rol
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default ModalCreate