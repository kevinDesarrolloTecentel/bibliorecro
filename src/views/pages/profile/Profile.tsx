import { useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCollapse,
  CSmartTable,
} from "@coreui/react-pro"
import CIcon from "@coreui/icons-react"
import { cilPencil } from "@coreui/icons"
import ModalProfile from "@/components/users/ModalProfile"
import useProfile from "@/hooks/adm-user/useProfile"

const getEstadoNombre = (estado: any) => {
    const s = String(estado ?? '').toLowerCase().trim()
    return (s === '1' || s === 'activo') ? 'Activo' : 'Inactivo'
}

const getBadge = (Estado: any) => {
    return getEstadoNombre(Estado) === 'Activo' ? 'success' : 'secondary'
}

const Profile = () => {
    const profileState = useProfile()
    const [details, setDetails] = useState<(string | number)[]>([])

    const toggleDetails = (id: string | number) => {
        setDetails((prev) => (prev.includes(id) ? [] : [id]))
    }

    const columns = [
        {
            key: 'Usuario',
            _style: { width: '25%' },
        },
        {
            key: 'Nombres',
            _style: { width: '35%' },
        },
        {
            key: 'fecha_registro',
            label: 'Fecha Registro',
            _style: { width: '25%' },
        },
        {
            key: 'Estado',
            _style: { width: '15%' },
        },
    ]

    const nickActivo =
        profileState.currentUser?.NICK_USUARIO ||
        (profileState.user || profileState.getStoredUser?.())?.NICK_USUARIO ||
        ''

    return (
        <div className="pb-4">
            <ModalProfile profileState={profileState} />

            {/* Encabezado */}
            <div className="mb-4">
                <h3 className="fw-bold mb-1">Perfil de Usuario</h3>
                <p className="text-body-secondary mb-0">
                    Consulta y administración de la información de tu cuenta y credenciales de acceso.
                </p>
            </div>

            <CCard className="shadow-sm border-0">
                <CCardHeader className="bg-transparent py-3 d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-uppercase small">
                        Información del Perfil
                    </span>
                    <span className="text-body-secondary small">
                        Usuario activo: <strong>{nickActivo}</strong>
                    </span>
                </CCardHeader>
                <CCardBody className="p-0">
                    <CSmartTable
                        activePage={1}
                        clickableRows={profileState.canMostrarBotonEditar}
                        columns={columns}
                        columnSorter
                        items={profileState.items}
                        itemsPerPageSelect
                        itemsPerPage={5}
                        onRowClick={(item: any) => {
                            if (profileState.canMostrarBotonEditar) {
                                const id = item?.id ?? item?.raw?.ID_USUARIO ?? 1
                                if (id) toggleDetails(id)
                            }
                        }}
                        scopedColumns={{
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
                                if (!profileState.canMostrarBotonEditar) return null
                                const id = item?.id ?? item?.raw?.ID_USUARIO ?? 1
                                const isVisible = details.includes(id)
                                return (
                                    <CCollapse visible={isVisible} className="user-details-collapse">
                                        <div className="p-3 bg-body-tertiary border-top border-bottom d-flex flex-wrap gap-2 justify-content-end align-items-center">
                                            {profileState.canEditarPerfil && (
                                                <CButton
                                                    color="primary"
                                                    variant="outline"
                                                    size="sm"
                                                    className="d-flex align-items-center gap-1 shadow-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        profileState.handleOpenEditModal()
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
                </CCardBody>
            </CCard>
        </div>
    )
}

export default Profile
