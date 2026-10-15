import useUsers from "@/hooks/adm-user/useUsers"
import { cilReload, cilUserPlus } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CFormSelect, CSpinner } from "@coreui/react-pro"
import { usePermissions } from "@/context/PermissionsContext"

const headerUser = ({ userState }: { userState: ReturnType<typeof useUsers> }) => {

    const {canDoAction} = usePermissions()
    
    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div className="d-flex gap-2">
                    {canDoAction('btn_crear_usuario') && (
                    <CButton color="success" onClick={() => userState.setModalVisible(true)} style={{ color: 'white' }}>
                        <CIcon icon={cilUserPlus} className="me-1" />
                        Nuevo Usuario
                    </CButton>
                    )}
                    <CButton color="secondary" variant="outline" onClick={userState.fetchUsuarios} disabled={userState.loading}>
                        <CIcon icon={cilReload} className={`me-1 ${userState.loading ? 'rotate-animation' : ''}`} />
                        Refrescar
                    </CButton>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small fw-semibold text-nowrap">Filtrar rol:</span>
                    <CFormSelect
                        size="sm"
                        value={userState.filtroRol}
                        onChange={(e) => userState.setFiltroRol(e.target.value)}
                        style={{ minWidth: '180px', maxWidth: '240px' }}
                    >
                        <option value="todos">Todos los roles</option>
                        {userState.rolesList.map((r: any) => {
                            const id = String(r.ID_ROL ?? r.id ?? '')
                            const nombre = r.NOMBRE_ROL ?? r.nombre ?? r.name ?? `Rol ${id}`
                            return (
                                <option key={id} value={id}>
                                    {nombre}
                                </option>
                            )
                        })}
                    </CFormSelect>
                    {userState.loading && <CSpinner size="sm" color="primary" />}
                </div>
            </div>
        </>
    )
}
export default headerUser