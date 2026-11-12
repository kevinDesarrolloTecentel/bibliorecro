
import useRoles from "@/hooks/admin-roles/useRoles"
import { cilExitToApp, cilPenNib, cilPlus} from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

const ModalCreate = ({ userState }: { userState: ReturnType<typeof useRoles> }) => {
    const nombreLimpio = userState.formData.nombre.trim()
    const nombreDuplicado = Boolean(
        nombreLimpio &&
        userState.roles.some((r: any) => {
            const rNombre = String(r.NOMBRE_ROL ?? r.nombre ?? r.name ?? '').trim().toLowerCase()
            return rNombre === nombreLimpio.toLowerCase()
        })
    )

    return (
        <CModal visible={userState.modalCrear} onClose={userState.handleCerrarCrear}>
            <CModalHeader>
                <CModalTitle className=" mb-1 text-body d-flex align-items-center gap-2">
                    <CIcon icon={cilPlus} size="lg" className="text-body" />
                  <span>Crear Nuevo Rol</span>
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
                            invalid={nombreDuplicado}
                            feedbackInvalid="Ya existe un rol registrado con este nombre."
                            onChange={(e) => userState.setFormData({ ...userState.formData, nombre: e.target.value })}
                        />
                    </CCol>
                    <CCol xs={12}>
                        <CFormInput
                            type="number"
                            id="inputNivelRol"
                            label="Nivel del Rol *"
                            min={1}
                            max={100}
                            placeholder="1"
                            value={userState.formData.nivel}
                            onChange={(e) => userState.setFormData({ ...userState.formData, nivel: Number(e.target.value) })}
                        />
                    </CCol>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton size="sm" color="danger" variant="outline" className="hover:text-white shadow-sm" onClick={userState.handleCerrarCrear} disabled={userState.guardando}>
                    <CIcon icon={cilExitToApp} className="me-1" />
                    Cancelar
                </CButton>
                {userState.canGuardarRol && (
                    <CButton
                        color="success"
                        variant="outline"
                        size="sm"
                        className="hover:text-white shadow-sm" onClick={userState.handleGuardarRol}
                        disabled={userState.guardando || nombreDuplicado || !nombreLimpio}
                    >
                        {userState.guardando ? <CSpinner size="sm" className="me-1" /> : null}
                        <CIcon icon={cilPenNib} className="me-1" />
                        Guardar Rol
                    </CButton>
                )}
            </CModalFooter>
        </CModal>
    )
}

export default ModalCreate