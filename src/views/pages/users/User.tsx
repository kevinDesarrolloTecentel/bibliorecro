import { CButton } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilSync, cilPeople } from '@coreui/icons'

import ModalEdit from '@/components/users/ModalEdit'
import Newuser from '@/components/users/ModalNew_user'
import UserMatrixTable from '@/components/users/UserMatrixTable'
import useUsers from '@/hooks/adm-user/useUsers'
import useRoles from '@/hooks/admin-roles/useRoles'
import useRolesUsuariosMatriz from '@/hooks/admin-roles/useRolesUsuariosMatriz'

export const User = () => {
  const userState = useUsers({ fetchAll: false })
  const rolesState = useRoles()
  const matriz = useRolesUsuariosMatriz(rolesState.roles, rolesState.fetchRoles)

  const isLoading = rolesState.loading || matriz.loadingUsuarios

  const handleRefrescarTodo = async () => {
    try {
      await Promise.all([rolesState.fetchRoles(), matriz.fetchUsuarios()])
    } catch (error) {
      console.error('Error al refrescar:', error)
    }
  }

  return (
    <div className="w-100 pb-4">
      <Newuser
        userState={userState}
        onUserCreated={matriz.fetchUsuarios}
      />
      <ModalEdit
        userState={userState}
        onUserChanged={matriz.fetchUsuarios}
      />

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilPeople} size="lg" style={{ color: '#4731d3ff' }} />
            <span>Usuarios del Sistema</span>
          </h3>
          <p className="text-body-secondary mb-0">
            Administración de cuentas y asignación de roles por usuario.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={handleRefrescarTodo}
            disabled={isLoading}
            className="d-flex align-items-center gap-1 shadow-sm"
            title="Refrescar usuarios y roles"
          >
            <CIcon
              icon={cilSync}
              className={`me-1 ${isLoading ? 'rotate-animation' : ''}`}
            />
            <span>{isLoading ? 'Refrescando...' : 'Refrescar'}</span>
          </CButton>
          {userState.canCrearUsuario && (
            <CButton
              color="success"
              variant="outline"
              size="sm"
              onClick={userState.handleAbrirCrear}
              className="d-flex align-items-center gap-1 shadow-sm hover:text-white"
            >
              <CIcon icon={cilPlus} className="me-1" />
              <span>Nuevo Usuario</span>
            </CButton>
          )}
        </div>
      </div>

      <UserMatrixTable
        userState={userState}
        rolesState={rolesState}
        matriz={matriz}
      />
    </div>
  )
}

export default User
