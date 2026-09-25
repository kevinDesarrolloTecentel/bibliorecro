import useUsers from "@/hooks/adm-user/useUsers"
import { cilReload, cilUserPlus } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CButtonGroup, CSpinner } from "@coreui/react-pro"

const headerUser = ({ userState }: { userState: ReturnType<typeof useUsers> }) => {
    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div className="d-flex gap-2">
                    <CButton color="success" onClick={() => userState.setModalVisible(true)} style={{ color: 'white' }}>
                        <CIcon icon={cilUserPlus} className="me-1" />
                        Nuevo Usuario
                    </CButton>
                    <CButton color="secondary" variant="outline" onClick={userState.fetchUsuarios} disabled={userState.loading}>
                        <CIcon icon={cilReload} className={`me-1 ${userState.loading ? 'rotate-animation' : ''}`} />
                        Refrescar
                    </CButton>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Filtrar rol:</span>
                    <CButtonGroup size="sm" role="group">
                        <CButton
                            color={userState.filtroRol === 'todos' ? 'primary' : 'secondary'}
                            variant={userState.filtroRol === 'todos' ? undefined : 'outline'}
                            onClick={() => userState.setFiltroRol('todos')}
                        >
                            Todos
                        </CButton>
                        {userState.rolesList.length > 0 ? (
                            userState.rolesList.map((r: any) => {
                                const id = String(r.ID_ROL ?? r.id ?? '')
                                const nombre = r.NOMBRE_ROL ?? r.nombre ?? r.name ?? id
                                const isSelected = userState.filtroRol.toLowerCase() === id.toLowerCase() || userState.filtroRol.toLowerCase() === nombre.toLowerCase()
                                return (
                                    <CButton
                                        key={id}
                                        color={isSelected ? 'info' : 'secondary'}
                                        variant={isSelected ? undefined : 'outline'}
                                        onClick={() => userState.setFiltroRol(isSelected ? 'todos' : id)}
                                    >
                                        {nombre}
                                    </CButton>
                                )
                            })
                        ) : (
                            <CButton
                                color={userState.filtroRol === 'bibliotecario' ? 'info' : 'secondary'}
                                variant={userState.filtroRol === 'bibliotecario' ? undefined : 'outline'}
                                onClick={() => userState.setFiltroRol(userState.filtroRol === 'bibliotecario' ? 'todos' : 'bibliotecario')}
                            >
                                Bibliotecarios
                            </CButton>
                        )}
                    </CButtonGroup>
                    {userState.loading && <CSpinner size="sm" color="primary" />}
                </div>
            </div>
        </>
    )
}
export default headerUser