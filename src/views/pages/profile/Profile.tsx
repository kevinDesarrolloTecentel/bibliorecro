import { useState } from 'react'
import { CBadge, CButton, CCollapse, CSmartTable } from "@coreui/react-pro"
import CIcon from "@coreui/icons-react"
import { cilLockLocked, cilLockUnlocked, cilPencil } from "@coreui/icons"
import { getStoredUser } from '../../../utils/auth'
import ModalProfile from "@/components/users/ModalProfile"
import useUsers from "@/hooks/adm-user/useUsers"
import { usePermissions } from "@/context/PermissionsContext"
const getEstadoNombre = (estado: any) => {
    const s = String(estado ?? '').toLowerCase().trim()
    return (s === '1' || s === 'activo') ? 'Activo' : 'Inactivo'
}

const getBadge = (Estado: any) => {
    return getEstadoNombre(Estado) === 'Activo' ? 'success' : 'secondary'
}

const Profile = () => {
    const userState = useUsers({ fetchAll: false })
    const { canDoAction } = usePermissions()
    const [details, setDetails] = useState<(string | number)[]>([])

    const toggleDetails = (id: string | number) => {
        setDetails((prev) => (prev.includes(id) ? [] : [id]))
    }

    const columns = [
        {
            key: 'Usuario',
            _style: { width: '18%' },
        },
        {
            key: 'Contraseña',
            _style: { width: '18%' },
        },
        {
            key: 'Nombres',
            _style: { width: '24%' },
        },
        {
            key: 'fecha_registro',
            label: 'Fecha Registro',
            _style: { width: '24%' },
        },
        {
            key: 'Estado',
            _style: { width: '16%' },
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
                onRowClick={(item: any) => {
                    const id = item?.id ?? item?.raw?.ID_USUARIO ?? 1
                    if (id) toggleDetails(id)
                }}
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
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            userState.setShowTablePassword(!userState.showTablePassword)
                                        }}
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
                    Estado: (item: any) => {
                        const estadoTexto = getEstadoNombre(item.Estado)
                        return (
                            <td>
                                <CBadge color={getBadge(item.Estado)} shape="rounded-pill" className="px-3 py-1">
                                    {estadoTexto}
                                </CBadge>
                            </td>
                        )
                    },
                    details: (item: any) => {
                        const id = item?.id ?? item?.raw?.ID_USUARIO ?? 1
                        const isVisible = details.includes(id)
                        return (
                            <CCollapse visible={isVisible} className="user-details-collapse">
                                <div className="p-3 bg-body-tertiary border-top border-bottom d-flex flex-wrap gap-2 justify-content-end align-items-center">
                                    {canDoAction('btn_editar_perfil') && (
                                        <CButton
                                            color="primary"
                                            variant="outline"
                                            size="sm"
                                            className="d-flex align-items-center gap-1 shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                userState.handleOpenEditModal()
                                            }}
                                        >
                                            <CIcon icon={cilPencil} className="me-1" />
                                            <span>Editar Perfil</span>
                                        </CButton>
                                    )}
                                </div>
                            </CCollapse>
                        )
                    }
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

