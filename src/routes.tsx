import React, { LazyExoticComponent, FC, ReactNode, ComponentType } from 'react'
import { Translation } from 'react-i18next'

export type Route = {
  element?: LazyExoticComponent<FC> | ComponentType<any>
  exact?: boolean
  name?: ReactNode
  path?: string
  auth?: boolean
  routes?: Route[]
}

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Profile = React.lazy(() => import('./views/pages/profile/Profile'))

// Admin
const User = React.lazy(() => import('./views/pages/users/User'))
const Roles = React.lazy(() => import('./views/pages/roles/Roles'))

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
  },
  {
    path: '/administracion/usuarios',
    name: 'Usuarios',
    element: User,
  },
  {
    path: '/administracion/roles',
    name: 'Roles y Permisos',
    element: Roles,
  },
  {
    path: '/administracion/perfil',
    name: 'Perfil',
    element: Profile,
  },

  {
    path: '/usuarios/registrados',
    name: 'Registrados',
    element: Cliente,
  },
  {
    path: '/usuarios/renovaciones',
    name: 'Renovaciones y Nuevos',
    element: Renovate,
  },

  {
    path: '/biblioteca/inventario',
    name: 'Libros Inventario',
    element: Inventary,
  },
  {
    path: '/biblioteca/prestamos',
    name: 'Libros en Prestamos',
    element: Loands,
  },
  {
    path: '/biblioteca/devoluciones',
    name: 'Libros por Devolver',
    element: BooksRT,
  },

  {
    path: '/libro/categoria',
    name: 'Libro Categoria',
    element: Category,
  },
  {
    path: '/libro/editorial',
    name: 'Libro Editorial',
    element: Editorial,
  },
  {
    path: '/libro/proveedor',
    name: 'Libro Proveedor',
    element: Supplier,
  },
  {
    path: '/libro/autor',
    name: 'Libro Autor',
    element: Author,
  },
  {
    path: '/libro/genero',
    name: 'Libro Genero',
    element: Genre,
  },

  {
    path: '/reportes',
    exact: true,
    name: 'Reportes',
    element: RP_usu,
  },
  {
    path: '/reportes/usuario',
    name: 'Reporte de Usuarios',
    element: RP_usu,
  },
  {
    path: '/reportes/prestamos',
    name: 'Reporte de Prestamos',
    element: RP_prest,
  },
  {
    path: '/reportes/inventario',
    name: 'Reporte de Inventario',
    element: RP_in,
  },
  {
    path: '/reportes/tejuelo',
    name: 'Impresión de Tejuelos',
    element: RP_tej,
  },

  { path: '/perfil', element: Profile },
  { path: '/usuarios', element: User },
  { path: '/roles', element: Roles },
  { path: '/clientes', element: Cliente },
  { path: '/renovacion-usuarios', element: Renovate },
  { path: '/inventariado', element: Inventary },
  { path: '/prestamos', element: Loands },
  { path: '/devoluciones', element: BooksRT },
  { path: '/categorias', element: Category },
  { path: '/editorial', element: Editorial },
  { path: '/proveedor', element: Supplier },
  { path: '/autor', element: Author },
  { path: '/generos', element: Genre },
  { path: '/reporte-usuario', element: RP_usu },
  { path: '/reporte-prestamos', element: RP_prest },
  { path: '/reporte-inventario', element: RP_in },
  { path: '/reporte-tejuelo', element: RP_tej },
]

export default routes
