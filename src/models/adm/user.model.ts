import { Rol } from './rol.model'


// usuario del sistema administrativo
export interface AdminUser {
  ID_USUARIO?: number | string
  id?: number | string
  NICK_USUARIO?: string
  usuario?: string
  email?: string
  PASSWORD_USUARIO?: string
  password?: string
  contrasena?: string
  NOMBRES_USUARIO?: string
  nombres?: string
  name?: string
  FECHA_REGISTRO?: string
  fecha_registro?: string
  ID_ROL?: number | string
  rol?: number | string | Rol
  NOMBRE_ROL?: string
  nombre_rol?: string
  ESTADO_USUARIO?: number | string
  estado?: number | string
  [key: string]: any
}

// Datos del formulario para crear un nuevo usuario
export interface UserFormData {
  usuario: string
  password: string
  nombres: string
  rol: string
  estado: string
}


// Datos del formulario para editar un usuario existente
export interface UserEditFormData {
  id: string | number
  usuario: string
  password: string
  nombres: string
  rol: string
  estado: string
}

//crear un usuario
export interface CreateUserPayload {
  NICK_USUARIO: string
  PASSWORD_USUARIO: string
  NOMBRES_USUARIO: string
  ID_ROL?: number | string | null
  ESTADO_USUARIO: number
  rol?: number | string | null
  estado?: number
  usuario?: string
  password?: string
  nombres?: string
}

//actualizar usuario
export interface UpdateUserPayload {
  NICK_USUARIO?: string
  NOMBRES_USUARIO?: string
  ID_ROL?: number | string | null
  ESTADO_USUARIO?: number
  PASSWORD_USUARIO?: string
  rol?: number | string | null
  estado?: number
  password?: string
}

// Representación de cada fila
export interface UserTableItem {
  id: string | number
  Usuario: string
  Contraseña?: string
  Nombres: string
  Fecha_registro: string
  Rol?: string
  Estado: 'Activo' | 'Inactivo'
  raw: AdminUser
  [key: string]: any
}

// Datos del formulario para actualizar el perfil propio
export interface ProfileFormData {
  usuario: string
  nombres: string
  password: string
}

// Representación de la fila para el Perfil
export interface ProfileTableItem {
  id: string | number
  Usuario: string
  Nombres: string
  fecha_registro: string
  Estado: 'Activo' | 'Inactivo'
  raw?: any
  [key: string]: any
}

