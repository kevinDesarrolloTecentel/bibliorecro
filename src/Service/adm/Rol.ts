import { Rol } from "@/models/adm/rol.model"
import apiClient, { BACKEND_API_BASE } from "@/Service/ApiClient"

const API_BASE_URL_ROLES = `${BACKEND_API_BASE}/admin-seguridad`

export const listarRoles = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_ROLES}/roles`)
  return data
}

export const verRol = async (id: string | number) => {
  const { data } = await apiClient.get(`${API_BASE_URL_ROLES}/roles/${id}`)
  return data
}

export const crearRol = async (rolData?: Rol | any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_ROLES}/roles`, rolData)
  return data
}

export const actualizarRol = async (id: string | number, rolData?: Rol | any) => {
  const { data } = await apiClient.put(`${API_BASE_URL_ROLES}/roles/${id}`, rolData)
  return data
}

export const eliminarRol = async (id: string | number) => {
  const { data } = await apiClient.delete(`${API_BASE_URL_ROLES}/roles/${id}`)
  return data
}

export const asignarRolesUsuario = async (
  idUsuario: string | number,
  roles: (number | string)[],
) => {
  const cleanRoles = roles.map(Number).filter((n) => !isNaN(n) && n > 0)
  const { data } = await apiClient.put(
    `${API_BASE_URL_ROLES}/usuarios/${idUsuario}/roles`,
    {
      ROLES: cleanRoles,
    },
  )
  return data
}

export const listarUsuariosConRoles = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_ROLES}/usuariosL`)
  return data
}
