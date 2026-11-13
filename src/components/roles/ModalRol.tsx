import { useState } from "react"
import useRoles from "@/hooks/admin-roles/useRoles"
import { cilExitToApp, cilPenNib, cilTrash, cilPencil} from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

const ModalRolActu = ({ userState }: { userState: ReturnType<typeof useRoles> }) => {
    const [actionLoading, setActionLoading] = useState<'actualizar' | 'eliminar' | null>(null)

    const isBusy = userState.guardando || actionLoading !== null

    const nombreLimpio = userState.editFormData.nombre.trim()
    const nombreDuplicado = Boolean(
        nombreLimpio &&
        userState.roles.some((r: any) => {
            const rId = String(r.ID_ROL ?? r.id ?? '')
            const rNombre = String(r.NOMBRE_ROL ?? r.nombre ?? r.name ?? '').trim().toLowerCase()
            return rId !== String(userState.editFormData.id) && rNombre === nombreLimpio.toLowerCase()
        })
    )

    const handleActualizar = async () => {
        if (nombreDuplicado || !nombreLimpio) return
        setActionLoading('actualizar')
        try {
            await userState.handleActualizarRol()
        } finally {
            setActionLoading(null)
        }
    }

    const handleEliminar = async () => {
        setActionLoading('eliminar')
        try {
            await userState.handleEliminarRol(userState.editFormData.id, userState.editFormData.nombre)
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <CModal visible={userState.modalEditar} onClose={userState.handleCerrarEditar}>
            <CModalHeader>
                <CModalTitle className="mb-1 text-body d-flex align-items-center gap-2">
                    <CIcon icon={cilPencil} size="lg" className="text-body" />
                    <span>Actualizar o Eliminar Rol</span>
                </CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm className="row g-3">
                    <CCol xs={12}>
                        <CFormInput
                            type="text"
                            id="editNombreRol"
                            label="Nombre del Rol *"
                            maxLength={25}
                            value={userState.editFormData.nombre}
                            invalid={nombreDuplicado || userState.editFormData.nombre.length > 25}
                            feedbackInvalid={userState.editFormData.nombre.length > 25 ? "El nombre del rol no puede superar los 25 caracteres." : "Ya existe otro rol registrado con este nombre."}
                            onChange={(e) => userState.setEditFormData({ ...userState.editFormData, nombre: e.target.value.slice(0, 25) })}
                        />
                    </CCol>
                    <CCol xs={12}>
                        <CFormInput
                            type="number"
                            id="editNivelRol"
                            label="Nivel del Rol *"
                            min={1}
                            max={100}
                            value={userState.editFormData.nivel}
                            onChange={(e) => userState.setEditFormData({ ...userState.editFormData, nivel: Number(e.target.value) })}
                        />
                    </CCol>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton size="sm" className="hover:text-white shadow-sm" color="secondary" variant="outline" onClick={userState.handleCerrarEditar} disabled={isBusy}>
                    <CIcon icon={cilExitToApp} className="me-1" />
                    Cerrar
                </CButton>
                {userState.canEliminarRol && (
                    <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        className="hover:text-white shadow-sm"
                        onClick={handleEliminar}
                        disabled={isBusy}
                    >
                        {actionLoading === 'eliminar' ? <CSpinner size="sm" className="me-1" /> : null}
                        <CIcon icon={cilTrash} className="me-1" />
                        Eliminar Rol
                    </CButton>
                )}
                {userState.canActualizarRol && (
                    <CButton
                        color="success"
                        size="sm"
                        className="hover:text-white shadow-sm"
                        onClick={handleActualizar}
                        disabled={isBusy || nombreDuplicado || !nombreLimpio || nombreLimpio.length > 25}
                        variant="outline"
                    >
                        {actionLoading === 'actualizar' ? <CSpinner size="sm" className="me-1" /> : null}
                        <CIcon icon={cilPenNib} className="me-1" />
                        Actualizar Rol
                    </CButton>
                )}
            </CModalFooter>
        </CModal>
    )
}
export default ModalRolActu