import { useState } from 'react'
import { CBadge, CButton, CCollapse, CSmartTable } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'

import HeaderUser from '@/components/users/headerUser'
import ModalEdit from '@/components/users/ModalEdit'
import Newuser from '@/components/users/ModalNew_user'
import useUsers from '@/hooks/adm-user/useUsers'
import { usePermissions } from '@/context/PermissionsContext'

const getBadge = (status: string) => {
    switch (status) {
        case 'Activo':
            return 'success'
        case 'Inactivo':
            return 'secondary'
        default:
            return 'primary'
    }
}

export const User = () => {
    const userState = useUsers()
    const { canDoAction } = usePermissions()
    const [details, setDetails] = useState<(string | number)[]>([])

    const toggleDetails = (id: string | number) => {
        setDetails((prev) => (prev.includes(id) ? [] : [id]))
    }

    const getBadgeRol = (rolName: string, item?: any) => {
        const rawRol = item?.raw?.ID_ROL ?? item?.raw?.rol ?? rolName
        const found = userState.rolesList.find((r: any) => {
            const id = String(r.ID_ROL ?? r.id ?? '')
            const nom = String(r.NOMBRE_ROL ?? r.nombre ?? '').toLowerCase().trim()
            return id === String(rawRol) || nom === String(rolName || '').toLowerCase().trim()
        })
        const nivel = Number(found?.NIVEL_ROL ?? found?.nivel ?? 1)
        if (nivel === 1) return 'danger'
        if (nivel === 2) return 'info'
        if (nivel === 3) return 'warning'
        return 'primary'
    }

    const items = userState.usuarios
        .filter((u: any) => {
            if (userState.filtroRol === 'todos') return true
            const rolVal = String(u.ID_ROL ?? u.rol ?? '').toLowerCase()
            const target = userState.filtroRol.toLowerCase()
            if (rolVal === target) return true
            const nomRol = userState.getRolNombre(u.ID_ROL ?? u.rol, u).toLowerCase()
            if (nomRol === target) return true

            const targetRole = userState.rolesList.find((r: any) => {
                const id = String(r.ID_ROL ?? r.id ?? '').toLowerCase()
                return id === target
            })
            if (targetRole) {
                const targetNom = String(targetRole.NOMBRE_ROL ?? targetRole.nombre ?? '').toLowerCase()
                if (targetNom && (targetNom === nomRol || targetNom === rolVal)) return true
            }
            return false
        })
        .map((u: any) => {
            const rawPass = u.PASSWORD_USUARIO || u.password || u.contrasena || ''
            return {
                id: u.ID_USUARIO || u.id,
                Usuario: u.NICK_USUARIO || u.usuario || u.email || '',
                Contraseña: rawPass,
                Nombres: u.NOMBRES_USUARIO || u.nombres || u.name || 'No disponible',
                Fecha_registro: u.FECHA_REGISTRO || u.fecha_registro || '',
                Rol: userState.getRolNombre(u.ID_ROL ?? u.rol, u),
                Estado: (String(u.ESTADO_USUARIO ?? u.estado).toLowerCase() === '1' || String(u.ESTADO_USUARIO ?? u.estado).toLowerCase() === 'activo') ? 'Activo' : 'Inactivo',
                raw: u
            }
        })

    const columns = [
        { key: 'Usuario', _style: { width: '18%' } },
        { key: 'Contraseña', _style: { width: '16%' } },
        { key: 'Nombres', _style: { width: '22%' } },
        { key: 'Fecha_registro', label: 'Fecha Registro', _style: { width: '20%' } },
        { key: 'Rol', _style: { width: '12%' } },
        { key: 'Estado', _style: { width: '12%' } },
    ]
    return (
        <>
            <HeaderUser userState={userState} />
            <Newuser userState={userState} />
            <ModalEdit userState={userState} />
            <CSmartTable
                activePage={1}
                clickableRows
                columns={columns}
                columnSorter
                items={items}
                itemsPerPageSelect
                onRowClick={(item: any) => {
                    const id = item?.id ?? item?.raw?.ID_USUARIO
                    if (id) toggleDetails(id)
                }}
                scopedColumns={{
                    Contraseña: () => (
                        <td>
                            <span className="font-monospace small">••••••••</span>
                        </td>
                    ),

                    Rol: (item: any) => (
                        <td>
                            <CBadge color={getBadgeRol(item.Rol, item)}>{item.Rol}</CBadge>
                        </td>
                    ),
                    Estado: (item: any) => (
                        <td>
                            <CBadge color={getBadge(item.Estado)}>{item.Estado}</CBadge>
                        </td>
                    ),
                    Fecha_registro: (item: any) => {
                        if (!item.Fecha_registro) return <td>-</td>
                        const date = new Date(item.Fecha_registro)
                        const options: Intl.DateTimeFormatOptions = {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }
                        return <td>{isNaN(date.getTime()) ? item.Fecha_registro : date.toLocaleDateString('es-ES', options)}</td>
                    },
                    details: (item: any) => {
                        const id = item?.id ?? item?.raw?.ID_USUARIO
                        const isVisible = details.includes(id)
                        return (
                            <CCollapse visible={isVisible} className="user-details-collapse">
                                <div className="p-3 bg-body-tertiary border-top border-bottom d-flex flex-wrap gap-2 justify-content-end align-items-center">
                                    {canDoAction('btn_editar_usuario') && (
                                        <CButton
                                            color="primary"
                                            variant="outline"
                                            size="sm"
                                            className="d-flex align-items-center gap-1 shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                userState.handleAbrirEditar(item)
                                            }}
                                        >
                                            <CIcon icon={cilPencil} className="me-1" />
                                            <span>Editar Usuario</span>
                                        </CButton>
                                    )}
                                    {canDoAction('btn_eliminar_usuario') && (
                                        <CButton
                                            color="danger"
                                            variant="outline"
                                            size="sm"
                                            className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                userState.handleEliminarUsuario(item.id, item.Nombres || item.Usuario)
                                            }}
                                        >
                                            <CIcon icon={cilTrash} className="me-1" />
                                            <span>Eliminar Usuario</span>
                                        </CButton>
                                    )}
                                </div>
                            </CCollapse>
                        )
                    }
                }}
                tableFilterPlaceholder="Buscar usuarios..."
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
export default User
