import { ElementType, JSX } from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBook,
  cilLibraryBuilding,
  cilPencil,
  cilPeople,
  cilPuzzle,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react-pro'
import { Translation } from 'react-i18next'

export type Badge = {
  color: string
  text: string
}

export type NavItem = {
  badge?: Badge
  component: string | ElementType
  href?: string
  icon?: string | JSX.Element
  items?: NavItem[]
  name: string | JSX.Element
  to?: string
  permission?: string
  roles?: string[]
}

const _nav: NavItem[] = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" style={{ color: 'white' }} />,
  },
  {
    component: CNavTitle,
    name: <Translation>{(t) => t('ADMINISTRACIÓN')}</Translation>,
  },
  {
    component: CNavGroup,
    name: <Translation>{(t) => t('Administración')}</Translation>,
    to: '/administracion',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" style={{color:'white'
    }}/>,
    items: [
      {
        component: CNavItem,
        name: 'Usuarios',
        to: '/administracion/usuarios',
      },
      {
        component: CNavItem,
        name: 'Permisos y Roles',
        to: '/administracion/permisosyroles',
      },
    ],
  },
  {
    component: CNavTitle,
    name: <Translation>{(t) => t('ADMINISTRACION USUARIOS')}</Translation>,
  },
  {
    component: CNavGroup,
    name: <Translation>{(t) => t('Gestion de Usuarios')}</Translation>,
    to: '/usuarios',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" style={{color:'white'}}/>,
    items: [
      {
        component: CNavItem,
        name: 'Registrados',
        to: '/usuarios/registrados',
      },
      {
        component: CNavItem,
        name: 'Renovaciones y Nuevos',
        to: '/usuarios/renovaciones',
      },
    ],
  },
  {
    component: CNavTitle,
    name: <Translation >{(t) => t('BIBLIOTECA')}</Translation>,
  },
  {
    component: CNavGroup,
    name: <Translation>{(t) => t('Biblioteca')}</Translation>,
    to: '/biblioteca',
    icon: <CIcon icon={cilLibraryBuilding} customClassName="nav-icon" style={{color:"white"}}/>,
    items: [
      {
        component: CNavItem,
        name: 'Inventario',
        to: '/biblioteca/inventario',
      },
      {
        component: CNavItem,
        name: 'Préstamos y Devolucion',
        to: '/biblioteca/prestamos',
      },
      {
        component: CNavItem,
        name: 'Sancionados',
        to: '/biblioteca/sancionados',
      },
      {
        component: CNavGroup,
        name: 'Detalles de Libros',
        to: '/libro',
        icon: <CIcon icon={cilBook} customClassName="nav-icon" style={{color:'white'}}/>,
        items: [
          {
            component: CNavItem,
            name: 'Categorías',
            to: '/libro/categorias',
          },
          {
            component: CNavItem,
            name: 'Editoriales',
            to: '/libro/editoriales',
          },
          {
            component: CNavItem,
            name: 'Proveedores',
            to: '/libro/proveedores',
          },
          {
            component: CNavItem,
            name: 'Autores',
            to: '/libro/autores',
          },
          {
            component: CNavItem,
            name: 'Géneros',
            to: '/libro/generos',
          },
        ],
      },
    ],
  },
  {
    component: CNavTitle,
    name: <Translation>{(t) => t('REPORTES')}</Translation>,
  },
  {
    component: CNavGroup,
    name: <Translation>{(t) => t('Reportes')}</Translation>,
    to: '/reportes',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" style={{color:'white'}}/>,
    items: [
      {
        component: CNavItem,
        name: 'Reporte de Usuarios',
        to: '/reportes/usuarios',
      },
      {
        component: CNavItem,
        name: 'Reporte de Préstamos',
        to: '/reportes/prestamos',
      },
      {
        component: CNavItem,
        name: 'Reporte de Inventario',
        to: '/reportes/inventario',
      },
      {
        component: CNavItem,
        name: 'Reporte de Tejuelos',
        to: '/reportes/tejuelos',
      },
    ],
  },
]

export default _nav
