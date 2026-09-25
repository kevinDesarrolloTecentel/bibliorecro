import useRoles from "@/hooks/admin-roles/useRoles"
import { cilPlus, cilReload } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CSpinner } from "@coreui/react-pro"

const HeaderRol = ({ userState }: { userState: ReturnType<typeof useRoles> }) => {
    return (
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <div className="d-flex gap-2">
                <CButton color="success" onClick={() => userState.setModalCrear(true)} style={{ color: 'white' }}>
                    <CIcon icon={cilPlus} className="me-1" />
                    Nuevo Rol
                </CButton>
                <CButton color="secondary" variant="outline" onClick={userState.fetchRoles} disabled={userState.loading}>
                    <CIcon icon={cilReload} className={`me-1 ${userState.loading ? 'rotate-animation' : ''}`} />
                    Refrescar
                </CButton>
            </div>
            {userState.loading && <CSpinner size="sm" color="primary" />}
        </div>
    )
}
export default HeaderRol