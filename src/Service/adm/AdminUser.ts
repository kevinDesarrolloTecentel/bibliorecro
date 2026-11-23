import apiClient, { BACKEND_API_BASE } from "@/Service/ApiClient"

const API_BASE_URL = `${BACKEND_API_BASE}/adm-user`

export const perfil = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL}/perfil`)
  return data
}

export const login = async (credentials?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL}/login`, credentials)
  return data
}

export const logout = async () => {
  const { data } = await apiClient.post(`${API_BASE_URL}/logout`)
  return data
}

export const crear = async (userData?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL}/crear`, userData)
  return data
}

export const actualizar = async (id: string | number, userData?: any) => {
  const { data } = await apiClient.put(`${API_BASE_URL}/actualizar/${id}`, userData)
  return data
}

export const eliminar = async (id: string | number) => {
  const { data } = await apiClient.delete(`${API_BASE_URL}/eliminar/${id}`)
  return data
}
