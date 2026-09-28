import { CBadge, CButton, CSmartTable } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilLockUnlocked, cilLockLocked, cilTrash } from '@coreui/icons'

import HeaderUser from '@/components/users/headerUser'
import ModalEdit from '@/components/users/ModalEdit'
import Newuser from '@/components/users/ModalNew_user'
import useUsers from '@/hooks/adm-user/useUsers'

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

const getBadgeRol = (rol: string) => {
    const r = String(rol).toLowerCase()
    if (r === 'administrador' || r === 'admin') return 'danger'
    if (r === 'bibliotecario') return 'info'
    return 'primary'
}

export const User = () => {
    const userState = useUsers()

    const items = userState.usuarios
        .filter((u: any) => {
            if (userState.filtroRol === 'todos') return true
            const rolVal = String(u.ID_ROL ?? u.rol ?? '').toLowerCase()
            const target = userState.filtroRol.toLowerCase()
            if (rolVal === target) return true
            const nomRol = userState.getRolNombre(u.ID_ROL ?? u.rol).toLowerCase()
            return nomRol === target
        })
        .map((u: any) => {
            const rawPass = u.PASSWORD_USUARIO || u.password || u.contrasena || ''
            return {
                id: u.ID_USUARIO || u.id,
                Usuario: u.NICK_USUARIO || u.usuario || u.email || '',
                Contraseña: rawPass,
                Nombres: u.NOMBRES_USUARIO || u.nombres || u.name || 'No disponible',
                Fecha_registro: u.FECHA_REGISTRO || u.fecha_registro || '',
                Rol: userState.getRolNombre(u.ID_ROL ?? u.rol),
                Estado: (String(u.ESTADO_USUARIO ?? u.estado).toLowerCase() === '1' || String(u.ESTADO_USUARIO ?? u.estado).toLowerCase() === 'activo') ? 'Activo' : 'Inactivo',
                raw: u
            }
        })

    const columns = [
        { key: 'Usuario', _style: { width: '14%' } },
        { key: 'Contraseña', _style: { width: '15%' } },
        { key: 'Nombres', _style: { width: '17%' } },
        { key: 'Fecha_registro', label: 'Fecha Registro', _style: { width: '17%' } },
        { key: 'Rol', _style: { width: '13%' } },
        { key: 'Estado', _style: { width: '11%' } },
        { key: 'Acciones', label: 'Acciones', _style: { width: '13%' }, filter: false, sorter: false }
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
                scopedColumns={{
                    Contraseña: (u: any) => {
                        const current = u?.raw || u
                        const id = u.id || current?.ID_USUARIO
                        const rawPass = current?.PASSWORD_USUARIO || current?.password || current?.contrasena || (u.Contraseña && u.Contraseña !== '••••••••' ? u.Contraseña : '')
                        const isVisible = userState.visiblePasswords[id] ?? userState.showTablePassword

                        return (
                            <td>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="font-monospace small">
                                        {isVisible && rawPass ? rawPass : '••••••••'}
                                    </span>
                                    <CButton
                                        size="sm"
                                        color="light"
                                        variant="ghost"
                                        onClick={() => userState.togglePasswordVisibility(id)}
                                        title={isVisible ? "Ocultar contraseña" : "Ver contraseña"}
                                    >
                                        <CIcon icon={isVisible ? cilLockUnlocked : cilLockLocked} />
                                    </CButton>
                                </div>
                            </td>
                        )
                    },

                    Rol: (item: any) => (
                        <td>
                            <CBadge color={getBadgeRol(item.Rol)}>{item.Rol}</CBadge>
                        </td>
                    ),
                    Estado: (item: any) => (
                        <td>
                            <CBadge color={getBadge(item.Estado)}>{item.Estado}</CBadge>
                        </td>
                    ),
                    Acciones: (item: any) => (
                        <td>
                            <div className="d-flex align-items-center gap-1">
                                <CButton
                                    color="info"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => userState.handleAbrirEditar(item)}
                                    title="Editar usuario"
                                >
                                    <CIcon icon={cilPencil} className="me-1" />
                                    Editar
                                </CButton>
                                <CButton
                                    color="danger"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => userState.handleEliminarUsuario(item.id, item.Nombres || item.Usuario)}
                                    title="Eliminar usuario"
                                >
                                    <CIcon icon={cilTrash} className="me-1" />
                                    Eliminar
                                </CButton>
                            </div>
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
