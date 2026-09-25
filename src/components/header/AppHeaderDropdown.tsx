import { useTranslation } from 'react-i18next'
import {
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


const AppHeaderDropdown = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle className="py-0" caret={false}>
        <CIcon icon={cilUser}/>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0">
        <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold rounded-top mb-2">
          {user?.NICK_USUARIO || t('Cuenta')}
        </CDropdownHeader>
        <CDropdownItem onClick={() => navigate('/perfil')} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilUser} className="me-2" />
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
