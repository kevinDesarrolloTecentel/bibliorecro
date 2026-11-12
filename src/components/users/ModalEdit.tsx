import { useState } from "react"
import useUsers from "@/hooks/adm-user/useUsers"
import { cilExitToApp, cilLockLocked, cilLockUnlocked, cilPenNib, cilTrash, cilPencil, cilBan, cilCheckCircle } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CInputGroup, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

interface ModalEditProps {
    userState: ReturnType<typeof useUsers>
    onUserChanged?: () => void
}

const ModalEdit = ({ userState, onUserChanged }: ModalEditProps) => {
    const [actionLoading, setActionLoading] = useState<'actualizar' | 'eliminar' | 'estado' | null>(null)

    const isBusy = userState.guardando || actionLoading !== null

    const isActivo =
        String(userState.editFormData.estado).toLowerCase() === 'activo' ||
        String(userState.editFormData.estado) === '1'


    const handleGuardar = async () => {
        setActionLoading('actualizar')
        try {
            const ok = await userState.handleActualizarUsuario(userState.editFormData.id, userState.editFormData)
            if (ok) {
                userState.setModalEdit(false)
                if (onUserChanged) onUserChanged()
            }
        } finally {
            setActionLoading(null)
        }
    }

    const handleEliminar = async () => {
        setActionLoading('eliminar')
        try {
            const ok = await userState.handleEliminarUsuario(
                userState.editFormData.id,
                userState.editFormData.nombres || userState.editFormData.usuario
            )
            if (ok) {
                userState.setModalEdit(false)
                if (onUserChanged) onUserChanged()
            }
        } finally {
            setActionLoading(null)
        }
    }

    const handleCambiarEstado = async () => {
        setActionLoading('estado')
        try {
            const ok = await userState.cambiarEstadoUsuario({
                id: userState.editFormData.id,
                Usuario: userState.editFormData.usuario,
                usuario: userState.editFormData.usuario,
                Nombres: userState.editFormData.nombres,
                nombres: userState.editFormData.nombres,
                Estado: userState.editFormData.estado,
                estado: userState.editFormData.estado,
                Rol: userState.editFormData.rol,
            })
            if (ok) {
                userState.setModalEdit(false)
                if (onUserChanged) onUserChanged()
            }
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <CModal
            size="lg"
            visible={userState.modalEdit}
            onClose={() => userState.setModalEdit(false)}
        >
            <CModalHeader>
                <CModalTitle className=" mb-1 text-body d-flex align-items-center gap-2">
                    <CIcon icon={cilPencil} size="lg" className="text-body" />
                    <span>Actualizar o Eliminar Usuario</span>
                </CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm className="row g-3">
                    <CCol md={6}>
                        <CFormInput
                            type="text"
                            id="editUsuario"
                            label="Usuario"
                            disabled
                            value={userState.editFormData.usuario}
                            onChange={(e) => userState.setEditFormData({ ...userState.editFormData, usuario: e.target.value })}
                        />
                    </CCol>
                    <CCol md={6}>
                        <label className='form-label'>Contraseña</label>
                        <CInputGroup>
                            <CFormInput
                                type={userState.showPassword ? 'text' : 'password'}
                                placeholder='Dejar en blanco para conservar'
                                value={userState.editFormData.password}
                                onChange={(e) => userState.setEditFormData({ ...userState.editFormData, password: e.target.value })}
                            />
                            {userState.verContraseñaUsuario && (
                                <CButton
                                    type='button'
                                    color='secondary'
                                    variant='outline'
                                    onClick={() => userState.setShowPassword(!userState.showPassword)}
                                    title={userState.showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    <CIcon icon={userState.showPassword ? cilLockUnlocked : cilLockLocked} />
                                </CButton>
                            )}
                        </CInputGroup>
                    </CCol>
                    <CCol xs={12}>
                        <CFormInput
                            id="editNombres"
                            label="Nombres Completos"
                            value={userState.editFormData.nombres}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
                                userState.setEditFormData({ ...userState.editFormData, nombres: val })
                            }}
                        />
                    </CCol>
                </CForm>
            </CModalBody>
            <CModalFooter className="d-flex flex-nowrap align-items-center justify-content-end gap-2">
                <CButton size="sm" className="text-nowrap hover:text-white shadow-sm" color="secondary" variant="outline" onClick={() => userState.setModalEdit(false)} disabled={isBusy}>
                    <CIcon icon={cilExitToApp} className="me-1" />
                    Cerrar
                </CButton>
                {isActivo && userState.canInactivarUsuario && (
                    <CButton
                        color="warning"
                        variant="outline"
                        size="sm"
                        className="text-nowrap hover:text-white shadow-sm"
                        onClick={handleCambiarEstado}
                        disabled={isBusy}
                    >
                        {actionLoading === 'estado' ? <CSpinner size="sm" className="me-1" /> : null}
                        <CIcon icon={cilBan} className="me-1" />
                        Inactivar
                    </CButton>
                )}
                {!isActivo && userState.canActivarUsuario && (
                    <CButton
                        color="success"
                        variant="outline"
                        size="sm"
                        className="text-nowrap hover:text-white shadow-sm"
                        onClick={handleCambiarEstado}
                        disabled={isBusy}
                    >
                        {actionLoading === 'estado' ? <CSpinner size="sm" className="me-1" /> : null}
                        <CIcon icon={cilCheckCircle} className="me-1" />
                        Activar
                    </CButton>
                )}
                {userState.canEliminarUsuario && (
                    <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        className="text-nowrap hover:text-white shadow-sm"
                        onClick={handleEliminar}
                        disabled={isBusy}
                    >
                        {actionLoading === 'eliminar' ? <CSpinner size="sm" className="me-1" /> : null}
                        <CIcon icon={cilTrash} className="me-1" />
                        Eliminar Usuario
                    </CButton>
                )}
                {userState.canActualizarUsuario && (
                    <CButton
                        color="success"
                        variant="outline"
                        size="sm"
                        className="text-nowrap hover:text-white shadow-sm"
                        onClick={handleGuardar}
                        disabled={isBusy}
                    >
                        {actionLoading === 'actualizar' ? <CSpinner size="sm" className="me-1" /> : null}
                        <CIcon icon={cilPenNib} className="me-1" />
                        Actualizar Usuario
                    </CButton>
                )}
            </CModalFooter>
        </CModal>
    )
}

export default ModalEdit
