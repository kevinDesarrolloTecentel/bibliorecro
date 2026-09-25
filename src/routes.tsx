import React, { LazyExoticComponent, FC, ReactNode, ComponentType } from 'react'
import { Translation } from 'react-i18next'
import { hasPermission } from '@/components/guards/ProtectedRoute'

export type Route = {
  element?: LazyExoticComponent<FC> | ComponentType<any>
  exact?: boolean
  name?: ReactNode
  path?: string
  auth?: boolean
  roles?: (string | number)[]
  routes?: Route[]
}

export { hasPermission }

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Profile = React.lazy(() => import('./views/pages/profile/Profile'))

// Admin
const User = React.lazy(() => import('./views/pages/users/User'))
const Roles = React.lazy(() => import('./views/pages/roles/Roles'))
const AdminRoles = React.lazy(() => import('./views/pages/roles/admin_roles'))

// Clientes / Usuarios Lectores
const Cliente = React.lazy(() => import('./views/pages/clients/ClienteDs'))
const Renovate = React.lazy(() => import('./views/pages/clients/Renovate'))

// Libros / Biblioteca
const Inventary = React.lazy(() => import('./views/pages/books/Inventary_bk'))
const Loands = React.lazy(() => import('./views/pages/books/Loands_bk'))
const BooksRT = React.lazy(() => import('./views/pages/books/Return_bk'))
const Category = React.lazy(() => import('./views/pages/books/Category_bk'))
const Editorial = React.lazy(() => import('./views/pages/books/Editorial_bk'))
const Supplier = React.lazy(() => import('./views/pages/books/Supplier_bk'))
const Author = React.lazy(() => import('./views/pages/books/Author_bk'))
const Genre = React.lazy(() => import('./views/pages/books/Genre_bk'))

// Reportes
const RP_usu = React.lazy(() => import('./views/pages/reports/Reports_usu'))
const RP_prest = React.lazy(() => import('./views/pages/reports/Reports_loands'))
const RP_in = React.lazy(() => import('./views/pages/reports/Reports_Inventary'))
const RP_tej = React.lazy(() => import('./views/pages/reports/Reports_teju'))

const routes: Route[] = [
  { path: '/', exact: true, name: <Translation>{(t) => t('Inicio')}</Translation> },
  {
    path: '/dashboard',
    name: <Translation>{(t) => t('dashboard')}</Translation>,
    element: Dashboard,
  },

  {
    path: '/administracion',
    exact: true,
    name: 'Administración',
    element: User,
    roles: [1],
  },
  {
    path: '/administracion/usuarios',
    name: 'Usuarios',
    element: User,
    roles: [1],
  },
  {
    path: '/administracion/roles',
    name: 'Gestión de Roles',
    element: Roles,
    roles: [1],
  },
  {
    path: '/administracion/roles-admin',
    name: 'Asignación de Roles',
    element: AdminRoles,
    roles: [1],
  },
  {
    path: '/administracion/perfil',
    name: 'Perfil',
    element: Profile,
    roles: [1, 2],
  },

  {
    path: '/usuarios/registrados',
    name: 'Registrados',
    element: Cliente,
    roles: [1, 2],
  },
  {
    path: '/usuarios/renovaciones',
    name: 'Renovaciones y Nuevos',
    element: Renovate,
    roles: [1, 2],
  },

  {
    path: '/biblioteca/inventario',
    name: 'Libros Inventario',
    element: Inventary,
    roles: [1, 2],
  },
  {
    path: '/biblioteca/prestamos',
    name: 'Libros en Prestamos',
    element: Loands,
    roles: [1, 2],
  },
  {
    path: '/biblioteca/devoluciones',
    name: 'Libros por Devolver',
    element: BooksRT,
    roles: [1, 2],
  },

  {
    path: '/libro/categoria',
    name: 'Libro Categoria',
    element: Category,
    roles: [1, 2],
  },
  {
    path: '/libro/editorial',
    name: 'Libro Editorial',
    element: Editorial,
    roles: [1, 2],
  },
  {
    path: '/libro/proveedor',
    name: 'Libro Proveedor',
    element: Supplier,
    roles: [1, 2],
  },
  {
    path: '/libro/autor',
    name: 'Libro Autor',
    element: Author,
    roles: [1, 2],
  },
  {
    path: '/libro/genero',
    name: 'Libro Genero',
    element: Genre,
    roles: [1, 2],
  },

  {
    path: '/reportes',
    exact: true,
    name: 'Reportes',
    element: RP_usu,
    roles: [1, 2],
  },
  {
    path: '/reportes/usuario',
    name: 'Reporte de Usuarios',
    element: RP_usu,
    roles: [1, 2],
  },
  {
    path: '/reportes/prestamos',
    name: 'Reporte de Prestamos',
    element: RP_prest,
    roles: [1, 2],
  },
  {
    path: '/reportes/inventario',
    name: 'Reporte de Inventario',
    element: RP_in,
    roles: [1, 2],
  },
  {
    path: '/reportes/tejuelo',
    name: 'Impresión de Tejuelos',
    element: RP_tej,
    roles: [1, 2],
  },

  { path: '/perfil', element: Profile, roles: [1, 2] },
  { path: '/usuarios', element: User, roles: [1] },
  { path: '/roles', element: Roles, roles: [1] },
  { path: '/roles-admin', element: AdminRoles, roles: [1] },
  { path: '/clientes', element: Cliente, roles: [1, 2] },
  { path: '/renovacion-usuarios', element: Renovate, roles: [1, 2] },
  { path: '/inventariado', element: Inventary, roles: [1, 2] },
  { path: '/prestamos', element: Loands, roles: [1, 2] },
  { path: '/devoluciones', element: BooksRT, roles: [1, 2] },
  { path: '/categorias', element: Category, roles: [1, 2] },
  { path: '/editorial', element: Editorial, roles: [1, 2] },
  { path: '/proveedor', element: Supplier, roles: [1, 2] },
  { path: '/autor', element: Author, roles: [1, 2] },
  { path: '/generos', element: Genre, roles: [1, 2] },
  { path: '/reporte-usuario', element: RP_usu, roles: [1, 2] },
  { path: '/reporte-prestamos', element: RP_prest, roles: [1, 2] },
  { path: '/reporte-inventario', element: RP_in, roles: [1, 2] },
  { path: '/reporte-tejuelo', element: RP_tej, roles: [1, 2] },
]

export default routes
