import { CBadge, CButton, CSmartTable } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import ModalCreate from '@/components/roles/ModalCreate'
import ModalRolActu from '@/components/roles/ModalRol'
import HeaderRol from '@/components/roles/ModalHeader'
import useRoles from '@/hooks/admin-roles/useRoles'

export const Roles = () => {
    const userState = useRoles()
    const columns = [
        { key: 'ID', _style: { width: '8%' } },
        { key: 'Nombre', _style: { width: '22%' } },
        { key: 'Nivel', label: 'Nivel', _style: { width: '10%' } },
        { key: 'Estado', _style: { width: '12%' } },
        { key: 'Acciones', label: 'Acciones', _style: { width: '16%' }, filter: false, sorter: false }
    ]

    const items = userState.roles.map((r: any) => {
        const id = r.ID_ROL ?? r.id ?? ''
        const nombre = r.NOMBRE_ROL ?? r.nombre ?? r.name ?? ''
        const nivel = r.NIVEL_ROL ?? r.nivel_rol ?? r.nivel ?? 1
        const estadoRaw = r.ESTADO_ROL ?? r.estado ?? r.status ?? 'Activo'
        const estado = (String(estadoRaw).toLowerCase() === '1' || String(estadoRaw).toLowerCase() === 'activo') ? 'Activo' : 'Inactivo'

        return {
            ID: id,
            Nombre: nombre,
            Nivel: nivel,
            Estado: estado,
            raw: r
        }
    })

    return (
        <>
        <ModalCreate userState={userState} />
        <ModalRolActu userState={userState}/>
        <HeaderRol userState={userState}/>
            <CSmartTable
                activePage={1}
                clickableRows
                columns={columns}
                columnSorter
                items={items}
                itemsPerPageSelect
                itemsPerPage={5}
                pagination
                scopedColumns={{
                    Nombre: (item: any) => (
                        <td>
                            <span className="fw-semibold">{item.Nombre}</span>
                        </td>
                    ),
                    Nivel: (item: any) => (
                        <td>
                            <CBadge color="info" className="text-white px-2 py-1">
                                Nivel {item.Nivel}
                            </CBadge>
                        </td>
                    ),
                    Estado: (item: any) => (
                        <td>
                            <CBadge color={item.Estado === 'Activo' ? 'success' : 'secondary'}>
                                {item.Estado}
                            </CBadge>
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
                                    title="Editar rol"
                                >
                                    <CIcon icon={cilPencil} className="me-1" />
                                    Editar
                                </CButton>
                                <CButton
                                    color="danger"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => userState.handleEliminarRol(item.ID, item.Nombre)}
                                    title="Eliminar rol"
                                >
                                    <CIcon icon={cilTrash} className="me-1" />
                                    Eliminar
                                </CButton>
                            </div>
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

export default Roles
