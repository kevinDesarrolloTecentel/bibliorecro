import { CBadge, CButton, CSmartTable } from "@coreui/react-pro"
import CIcon from "@coreui/icons-react"
import { cilColorBorder, cilLockLocked, cilLockUnlocked } from "@coreui/icons"
import { getStoredUser } from '../../../utils/auth'
import ModalProfile from "@/components/users/ModalProfile"
import useUsers from "@/hooks/adm-user/useUsers"
const getBadge = (Estado: string) => {
    switch (Estado) {
        case 'Activo': {
            return 'success'
        }
        case 'Inactivo': {
            return 'secondary'
        }
        default:
            return 'primary'
    }
}

const Profile = () => {
    const userState = useUsers()
    const columns = [
        {
            key: 'Usuario',
            _style: { width: '10%' },
        },
        {
            key: 'Contraseña',
            _style: { width: '15%' },
        },
        {
            key: 'Nombres',
            _style: { width: '15%' },
        },
        {
            key: 'fecha_registro',
            _style: { width: '15%' },
        },
        {
            key: 'Estado',
            _style: { width: '15%' },
        },
        {
            key: 'Editar',
            _style: { width: '9%' },
        },
    ]
    return (
        <>
            <ModalProfile userState={userState} />
            <CSmartTable
                activePage={1}
                clickableRows
                columns={columns}
                columnSorter
                items={userState.items}
                itemsPerPageSelect
                itemsPerPage={5}
                scopedColumns={{
                    Contraseña: () => {
                        const current = userState.user || getStoredUser()
                        const rawPass = current?.PASSWORD_USUARIO || current?.password || ''
                        return (
                            <td>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="font-monospace small">
                                        {userState.showTablePassword && rawPass ? rawPass : '••••••••'}
                                    </span>
                                    <CButton
                                        size="sm"
                                        color="light"
                                        variant="ghost"
                                        onClick={() => userState.setShowTablePassword(!userState.showTablePassword)}
                                        title={userState.showTablePassword ? "Ocultar contraseña" : "Ver contraseña"}
                                    >
                                        <CIcon size="sm" icon={userState.showTablePassword ? cilLockUnlocked : cilLockLocked} />
                                    </CButton>
                                </div>
                            </td>
                        )
                    },
                    fecha_registro: (item: any) => {
                        if (!item.fecha_registro) return <td>-</td>
                        const date = new Date(item.fecha_registro)
                        const options: Intl.DateTimeFormatOptions = {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }
                        return <td>{isNaN(date.getTime()) ? item.fecha_registro : date.toLocaleDateString('es-ES', options)}</td>
                    },
                    Estado: (item: any) => (
                        <td>
                            <CBadge color={getBadge(item.Estado)} shape="rounded-pill" className="px-2 py-1">
                                {item.Estado}
                            </CBadge>
                        </td>
                    ),
                    Editar: () => (
                        <td>
                            <CButton size="sm" color="primary" variant="ghost" onClick={userState.handleOpenEditModal} title="Editar perfil">
                                <CIcon size="sm" icon={cilColorBorder} />
                            </CButton>
                        </td>
                    )
                }}
                tableProps={{
                    responsive: true,
                    striped: true,
                    hover: true,
                }}
                tableBodyProps={{
                    className: 'align-middle',
                }}
            />
        </>
    )
}

export default Profile

