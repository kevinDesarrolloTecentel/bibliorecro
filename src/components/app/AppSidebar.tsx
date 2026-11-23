import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CNavTitle,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { RootState } from '@/store'
import { logo } from '@/assets/brand/logo'
import { sygnet } from '@/assets/brand/sygnet'
import { AppSidebarNav } from './AppSidebarNav'
import { UserData } from '@/slices/authSlice'
import navigation, { NavItem } from '@/_nav'
import { usePermissions } from '@/hooks/auth/usePermissions'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state: RootState) => state.ui.sidebarUnfoldable)
  const sidebarShow = useSelector((state: RootState) => state.ui.sidebarShow)
  const user = useSelector((state: RootState) => state.auth.user) as UserData | null
  const { canAccessPath, hasPermission, hasAnyRole } = usePermissions()

  const filteredNav: NavItem[] = useMemo(() => {
    if (!user) return navigation

    const filterItem = (item: NavItem): NavItem | null => {
      // 1. Si requiere roles específicos y el usuario no tiene ninguno
      if (item.roles && item.roles.length > 0) {
        if (!hasAnyRole(item.roles)) {
          return null
        }
      }

      // 2. Si tiene sub-elementos (grupo o submenú)
      if (item.items && item.items.length > 0) {
        const filteredChildren = item.items
          .map(filterItem)
          .filter((child): child is NavItem => child !== null)

        if (filteredChildren.length === 0) {
          return null
        }

        return {
          ...item,
          items: filteredChildren,
        }
      }

      // 3. Si tiene permiso explícito declarado
      if (item.permission) {
        if (!hasPermission(item.permission)) {
          return null
        }
      } else if (item.to) {
        // 4. Si no tiene permiso explícito pero sí ruta destino
        if (!canAccessPath(item.to)) {
          return null
        }
      }

      return item
    }

    const filtered = navigation
      .map(filterItem)
      .filter((item): item is NavItem => item !== null)

    const cleanedNav: NavItem[] = []
    for (let i = 0; i < filtered.length; i++) {
      const current = filtered[i]
      if (current.component === CNavTitle) {
        let hasChildren = false
        for (let j = i + 1; j < filtered.length; j++) {
          if (filtered[j].component === CNavTitle) break
          hasChildren = true
          break
        }
        if (hasChildren) {
          cleanedNav.push(current)
        }
      } else {
        cleanedNav.push(current)
      }
    }

    return cleanedNav
  }, [user, canAccessPath, hasPermission, hasAnyRole])

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      style={{
        backgroundColor: '#030b58ff',
      }}
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand as={NavLink} to="/">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={filteredNav} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default AppSidebar
