import { useTranslation } from 'react-i18next'
import Swal from 'sweetalert2'
import {
  CAvatar,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle
} from '@coreui/react-pro'
import {
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/auth/useAuth'
import userAvatar from '@/assets/images/user (2).png'
import { usePermissions } from '@/context/PermissionsContext'

const AppHeaderDropdown = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { canAccessPath } = usePermissions()

  const canAccessProfile = canAccessPath('/perfil')

  const userName =
    user?.NICK_USUARIO ||
    user?.usuario ||
    user?.NOMBRES_USUARIO ||
    user?.nombre ||
    user?.name ||
    t('Perfil')

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir del sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    })
    if (result.isConfirmed) {
      logout()
    }
  }

  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle className="py-0 pe-0 ms-0" caret={false}>
        <CAvatar src={userAvatar} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0">
        <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold rounded-top mb-2">
          Cuenta
        </CDropdownHeader>
        {canAccessProfile && (
          <CDropdownItem onClick={() => navigate('/perfil')} style={{ cursor: 'pointer' }}>
            <CIcon icon={cilUser} className="me-2" />
            <span className="text-truncate">{userName}</span>
          </CDropdownItem>
        )}
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          {t('Cerrar Sesión')}
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
