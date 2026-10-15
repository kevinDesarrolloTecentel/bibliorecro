import { useTranslation } from 'react-i18next'
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
import useAuth from '@/hooks/useAuth'
import userAvatar from '@/assets/images/user (2).png'


const AppHeaderDropdown = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
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
        <CDropdownItem onClick={() => navigate('/administracion/perfil')} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilUser} className="me-2 text-dark" />
          {t('Perfil')}
        </CDropdownItem>
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          {t('Cerrar Sesión')}
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
