import { useRef, useEffect } from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CElementCover,
  CFormCheck,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilPeople } from '@coreui/icons'
import useUsers from '@/hooks/adm-user/useUsers'
import useRoles from '@/hooks/admin-roles/useRoles'
import useRolesUsuariosMatriz from '@/hooks/admin-roles/useRolesUsuariosMatriz'
import { AdminUsuario } from '@/models/adm/user.model'
import { AdminRol } from '@/models/adm/rol.model'

interface UserMatrixTableProps {
  userState: ReturnType<typeof useUsers>
  rolesState: ReturnType<typeof useRoles>
  matriz: ReturnType<typeof useRolesUsuariosMatriz>
}

export const UserMatrixTable = ({
  userState,
  rolesState,
  matriz,
}: UserMatrixTableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && !e.shiftKey) {
        if (el.scrollWidth > el.clientWidth) {
          e.preventDefault()
          el.scrollLeft += e.deltaY * 1.3
        }
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [matriz.loadingUsuarios, rolesState.roles])

  const isLoading = rolesState.loading || matriz.loadingUsuarios

  return (
    <CCard className="shadow-sm border-0 mb-4">
      <CCardHeader className="bg-transparent py-3 d-flex justify-content-between align-items-center">
        <span className="fw-semibold text-uppercase small d-inline-flex align-items-center gap-2">
          <CIcon icon={cilPeople} style={{ color: '#4731d3ff' }} />
          <span>Matriz de Usuarios y Roles</span>
        </span>
        <span className="text-body-secondary small">
          Total usuarios registrados: <strong>{matriz.usuarios.length}</strong>
        </span>
      </CCardHeader>

      <CCardBody className="p-0">
        {isLoading ? (
          <div className="position-relative py-5 px-3" style={{ minHeight: '160px' }}>
            <div className="text-center text-body-secondary py-3">
              Cargando usuarios y roles...
            </div>
            <CElementCover opacity={0.2} style={{ backgroundColor: 'transparent' }}>
              <CSpinner variant="grow" color="primary" />
            </CElementCover>
          </div>
        ) : matriz.usuarios.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <p className="mb-0">No se encontraron usuarios registrados en el sistema.</p>
          </div>
        ) : rolesState.roles.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <p className="mb-0">No se encontraron roles configurados.</p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <table
              className="table table-hover align-middle mb-0"
              style={{ minWidth: 'max-content', borderCollapse: 'separate', borderSpacing: 0 }}
            >
              <thead>
                <tr style={{ backgroundColor: 'var(--cui-tertiary-bg)' }}>
                  <th
                    className="py-3 px-3 text-start align-middle"
                    style={{
                      backgroundColor: 'var(--cui-body-bg)',
                      width: '260px',
                      minWidth: '260px',
                      borderRight: '2px solid var(--cui-border-color)',
                      borderBottom: '2px solid var(--cui-border-color)',
                    }}
                  >
                    Usuario / Nombres
                  </th>
                  {rolesState.roles.map((rol: AdminRol) => {
                    const rolId = Number(rol.ID_ROL)
                    const nombreRol = String(rol.NOMBRE_ROL || `Rol ${rolId}`)
                    const nivelRol = Number(rol.NIVEL_ROL || 1)

                    return (
                      <th
                        key={rolId}
                        className="py-3 px-3 text-center align-top"
                        style={{
                          minWidth: '170px',
                          maxWidth: '220px',
                          backgroundColor: 'var(--cui-tertiary-bg)',
                          borderRight: '1px solid var(--cui-border-color)',
                          borderBottom: '2px solid var(--cui-border-color)',
                        }}
                      >
                        <div className="d-flex flex-column align-items-center gap-1">
                          <span
                            className="fw-bold px-2 py-1 rounded text-truncate shadow-sm"
                            style={{
                              fontSize: '0.85rem',
                              backgroundColor: '#ede9fe',
                              color: '#5b21b6',
                              maxWidth: '190px',
                              border: '1px solid rgba(139, 92, 246, 0.25)',
                              userSelect: 'none',
                            }}
                            title={nombreRol}
                          >
                            {nombreRol}
                          </span>
                          <span className="text-secondary small fw-medium" style={{ fontSize: '0.75rem' }}>
                            Nivel {nivelRol}
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody>
                {matriz.usuarios.map((usuario: AdminUsuario) => {
                  const usuarioId = Number(usuario.ID_USUARIO ?? 0)
                  const nick = String(usuario.NICK_USUARIO || `ID ${usuarioId}`)
                  const nombres = String(usuario.NOMBRES_USUARIO || '')
                  const isActivo = Number(usuario.ESTADO_USUARIO) === 1
                  const isSavingThisUser = matriz.savingUserId === usuarioId

                  return (
                    <tr key={usuarioId}>
                      {/* Celda del usuario: clic para editar o eliminar */}
                      <td
                        className="px-3 py-3 text-start align-middle"
                        style={{
                          backgroundColor: 'var(--cui-body-bg)',
                          width: '260px',
                          minWidth: '260px',
                          borderRight: '2px solid var(--cui-border-color)',
                          borderBottom: '1px solid var(--cui-border-color)',
                          cursor: userState.canEditarUsuario ? 'pointer' : 'default',
                          transition: 'background-color 0.15s ease',
                        }}
                        onClick={() => {
                          if (userState.canEditarUsuario) {
                            userState.handleAbrirEditar(usuario)
                          }
                        }}
                        title={
                          userState.canEditarUsuario
                            ? 'Haz clic para editar o eliminar este usuario'
                            : nick
                        }
                      >
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center justify-content-between gap-2">
                            <span className="fw-bold text-body fs-6 text-truncate" title={nick}>
                              {nick}
                            </span>
                            <CBadge
                              color={isActivo ? 'success' : 'secondary'}
                              shape="rounded-pill"
                              className="px-2 py-1"
                              style={{ fontSize: '0.68rem' }}
                            >
                              {isActivo ? 'Activo' : 'Inactivo'}
                            </CBadge>
                          </div>

                          {nombres && nombres !== 'No disponible' && (
                            <span className="text-secondary small text-truncate" title={nombres}>
                              {nombres}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Celdas con Checkbox por cada Rol */}
                      {rolesState.roles.map((rol: AdminRol) => {
                        const rolId = Number(rol.ID_ROL)
                        const isChecked = matriz.isRolAsignado(usuarioId, rolId)
                        const nombreRol = String(rol.NOMBRE_ROL || `Rol ${rolId}`)
                        const isCellDisabled = !matriz.canCheckboxRoles || isSavingThisUser || !isActivo

                        return (
                          <td
                            key={rolId}
                            className="text-center align-middle py-3 px-2"
                            style={{
                              borderRight: '1px solid var(--cui-border-color-translucent)',
                              borderBottom: '1px solid var(--cui-border-color)',
                              backgroundColor: isChecked
                                ? (isActivo ? 'rgba(99, 102, 241, 0.12)' : 'rgba(108, 117, 125, 0.08)')
                                : undefined,
                              opacity: !isActivo ? 0.65 : 1,
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            <div className="d-flex justify-content-center align-items-center">
                              <CFormCheck
                                id={`user-role-${usuarioId}-${rolId}`}
                                checked={isChecked}
                                disabled={isCellDisabled}
                                onChange={() => {
                                  if (matriz.canCheckboxRoles && isActivo) {
                                    matriz.handleConfirmarCambioRol(usuario, rol)
                                  }
                                }}
                                title={
                                  !isActivo
                                    ? `No se pueden asignar ni quitar roles porque el usuario "${nick}" está inactivo.`
                                    : !matriz.canCheckboxRoles
                                      ? 'No tienes permiso para modificar la asignación de roles'
                                      : `${isChecked ? 'Quitar' : 'Asignar'} rol "${nombreRol}" a ${nick}`
                                }
                                style={{
                                  cursor: isCellDisabled
                                    ? 'not-allowed'
                                    : isSavingThisUser
                                      ? 'wait'
                                      : 'pointer',
                                  transform: 'scale(1.3)',
                                }}
                              />
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default UserMatrixTable
