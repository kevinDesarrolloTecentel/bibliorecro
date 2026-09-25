import { ElementType, JSX } from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBook,
  cilLibraryBuilding,
  cilPencil,
  cilPeople,
  cilPuzzle
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
}

const _nav: NavItem[] = [
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
        name: 'Roles',
        to: '/administracion/roles',
      },
      {
        component: CNavItem,
        name: 'Administracion de Roles',
        to: '/administracion/roles-admin',
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
        name: 'Libros Inventario',
        to: '/biblioteca/inventario',
      },
      {
        component: CNavItem,
        name: 'Libros en Prestamos',
        to: '/biblioteca/prestamos',
      },
      {
        component: CNavItem,
        name: 'Libros por Devolver',
        to: '/biblioteca/devoluciones',
      },
      {
        component: CNavGroup,
        name: 'Detalles de Libros',
        to: '/libro',
        icon: <CIcon icon={cilBook} customClassName="nav-icon" style={{color:'white'}}/>,
        items: [
          {
            component: CNavItem,
            name: 'Libro Categoría',
            to: '/libro/categoria',
          },
          {
            component: CNavItem,
            name: 'Libro Editorial',
            to: '/libro/editorial',
          },
          {
            component: CNavItem,
            name: 'Libro Proveedor',
            to: '/libro/proveedor',
          },
          {
            component: CNavItem,
            name: 'Libro Autor',
            to: '/libro/autor',
          },
          {
            component: CNavItem,
            name: 'Libro Género',
            to: '/libro/genero',
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
        name: 'Reporte de Usuario',
        to: '/reportes/usuario',
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
        to: '/reportes/tejuelo',
      },
    ],
  },
]

export default _nav
