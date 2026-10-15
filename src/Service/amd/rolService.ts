import { Rol } from "@/models/adm/rol.model"
import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient"

const API_BASE_URL_ROLES = `${BACKEND_API_BASE}/admin-seguridad/roles`

export const listarRoles = async () => {
  const { data } = await apiClient.get(API_BASE_URL_ROLES)
  return data
}

export const verRol = async (id: string | number) => {
  const { data } = await apiClient.get(`${API_BASE_URL_ROLES}/${id}`)
  return data
}

export const crearRol = async (rolData?: Rol | any) => {
  const { data } = await apiClient.post(API_BASE_URL_ROLES, rolData)
  return data
}

export const actualizarRol = async (id: string | number, rolData?: Rol | any) => {
  const { data } = await apiClient.put(`${API_BASE_URL_ROLES}/${id}`, rolData)
  return data
}

export const eliminarRol = async (id: string | number) => {
  const { data } = await apiClient.delete(`${API_BASE_URL_ROLES}/${id}`)
  return data
}
