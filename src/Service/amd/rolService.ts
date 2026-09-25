import { Rol } from "@/models/adm/rol.model"
import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient"


const API_BASE_URL_ROLES = `${BACKEND_API_BASE}/admin-roles`

export const listarRoles = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_ROLES}/roles`)
  return data
}

export const verRol = async (id: string | number) => {
  const { data } = await apiClient.get(`${API_BASE_URL_ROLES}/rol/${id}`)
  return data
}

export const crearRol = async (rolData?: Rol | any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_ROLES}/rol`, rolData)
  return data
}

export const actualizarRol = async (id: string | number, rolData?: Rol | any) => {
  const { data } = await apiClient.put(`${API_BASE_URL_ROLES}/rol/${id}`, rolData)
  return data
}

export const eliminarRol = async (id: string | number) => {
  const { data } = await apiClient.delete(`${API_BASE_URL_ROLES}/rol/${id}`)
  return data
}
