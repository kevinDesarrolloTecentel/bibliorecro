import { useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCollapse,
  CSmartTable,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilPencil, cilShieldAlt, cilUser } from '@coreui/icons'
import ModalProfile from '@/components/users/ModalProfile'
import ModalVerRoles from '@/components/users/ModalVerRoles'
import ModalVerPermisos from '@/components/users/ModalVerPermisos'
import useProfile from '@/hooks/adm-user/useProfile'
import { usePermissions } from '@/hooks/auth/usePermissions'

const getEstadoNombre = (estado: number | string | null | undefined) => {
  return Number(estado) === 1 ? 'Activo' : 'Inactivo'
}

const getBadge = (estado: number | string | null | undefined) => {
  return Number(estado) === 1 ? 'success' : 'secondary'
}

const Profile = () => {
  const profileState = useProfile()
  const { roles, modulos, loadingPermisos } = usePermissions()
  const [details, setDetails] = useState<(string | number)[]>([])
  const [modalRolesVisible, setModalRolesVisible] = useState(false)
  const [modalPermisosVisible, setModalPermisosVisible] = useState(false)

  const toggleDetails = (id: string | number) => {
    setDetails((prev) => (prev.includes(id) ? [] : [id]))
  }

  const columns = [
    {
      key: 'NICK_USUARIO',
      label: 'Usuario',
      _style: { width: '25%' },
    },
    {
      key: 'NOMBRES_USUARIO',
      label: 'Nombres',
      _style: { width: '35%' },
    },
    {
      key: 'FECHA_REGISTRO',
      label: 'Fecha Registro',
      _style: { width: '25%' },
    },
    {
      key: 'ESTADO_USUARIO',
      label: 'Estado',
      _style: { width: '15%' },
    },
  ]

  const nickActivo = profileState.user?.NICK_USUARIO || ''
  const nombreCompleto = profileState.user?.NOMBRES_USUARIO || nickActivo

  return (
    <div className="pb-4">
      <ModalProfile profileState={profileState} />

      <ModalVerRoles
        visible={modalRolesVisible}
        setVisible={setModalRolesVisible}
        roles={roles}
        loading={loadingPermisos}
        userName={nombreCompleto}
      />

      <ModalVerPermisos
        visible={modalPermisosVisible}
        setVisible={setModalPermisosVisible}
        modulos={modulos}
        roles={roles}
        loading={loadingPermisos}
        userName={nombreCompleto}
      />

      {/* Encabezado */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
          <CIcon icon={cilUser} size="lg" className="text-primary" />
          <span>Perfil de Usuario</span>
        </h3>
        <p className="text-body-secondary mb-0">
          Consulta y administración de la información de tu cuenta.
        </p>
      </div>

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-uppercase small d-inline-flex align-items-center gap-2">
            <CIcon icon={cilUser} className="text-primary" />
            <span>Información del Perfil</span>
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
            items={profileState.items as any}
            itemsPerPageSelect
            itemsPerPage={5}
            onRowClick={(item: any) => {
              if (profileState.canMostrarBotonEditar && item?.ID_USUARIO) {
                toggleDetails(item.ID_USUARIO)
              }
            }}
            scopedColumns={{
              FECHA_REGISTRO: (item: any) => {
                if (!item.FECHA_REGISTRO) return <td>-</td>
                const date = new Date(item.FECHA_REGISTRO)
                const options: Intl.DateTimeFormatOptions = {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }
                return (
                  <td>
                    {isNaN(date.getTime())
                      ? item.FECHA_REGISTRO
                      : date.toLocaleDateString('es-ES', options)}
                  </td>
                )
              },
              ESTADO_USUARIO: (item: any) => {
                const estadoTexto = getEstadoNombre(item.ESTADO_USUARIO)
                return (
                  <td>
                    <CBadge
                      color={getBadge(item.ESTADO_USUARIO)}
                      shape="rounded-pill"
                      className="px-3 py-1"
                    >
                      {estadoTexto}
                    </CBadge>
                  </td>
                )
              },
              details: (item: any) => {
                if (!profileState.canMostrarBotonEditar || !item?.ID_USUARIO) return null
                const isVisible = details.includes(item.ID_USUARIO)
                return (
                  <CCollapse visible={isVisible} className="user-details-collapse">
                    <div className="p-3 bg-body-tertiary border-top border-bottom d-flex flex-wrap gap-2 justify-content-end align-items-center">
                      {profileState.canEditarPerfil ||
                      profileState.canVermisRoles ||
                      profileState.canVermisPermisos ? (
                        <>
                          {profileState.canVermisRoles && (
                            <CButton
                              color="info"
                              variant="outline"
                              size="sm"
                              className="d-flex align-items-center gap-1 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setModalRolesVisible(true)
                              }}
                            >
                              <CIcon icon={cilShieldAlt} className="me-1" />
                              <span>Ver Roles</span>
                            </CButton>
                          )}

                          {profileState.canVermisPermisos && (
                            <CButton
                              color="success"
                              variant="outline"
                              size="sm"
                              className="d-flex align-items-center gap-1 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setModalPermisosVisible(true)
                              }}
                            >
                              <CIcon icon={cilLockLocked} className="me-1" />
                              <span>Ver Permisos</span>
                            </CButton>
                          )}

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
                        </>
                      ) : (
                        <span className="text-danger small fw-semibold d-inline-flex align-items-center py-1">
                          No tienes acceso a las acciones del perfil.
                        </span>
                      )}
                    </div>
                  </CCollapse>
                )
              },
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
