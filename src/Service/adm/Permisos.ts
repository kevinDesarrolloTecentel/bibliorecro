import apiClient, { BACKEND_API_BASE } from "@/Service/ApiClient"

const API_BASE_URL_SEGURIDAD = `${BACKEND_API_BASE}/admin-seguridad`

// Permisos del usuario logueado
export const obtenerMisPermisos = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_SEGURIDAD}/mis-permisos`)
  return data
}

// Catálogo de pantallas y acciones (solo admin)
export const obtenerCatalogo = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_SEGURIDAD}/catalogo`)
  return data
}

// Listar pantallas (admin_permiso)
export const obtenerPantallas = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_SEGURIDAD}/pantallas`)
  return data
}

// Listar acciones (admin_permiso_accion)
export const obtenerAcciones = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_SEGURIDAD}/acciones`)
  return data
}

export const crearAccion = async (accionData: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_SEGURIDAD}/acciones`, accionData)
  return data
}

export const actualizarAccion = async (id: string | number, accionData: any) => {
  const { data } = await apiClient.put(`${API_BASE_URL_SEGURIDAD}/acciones/${id}`, accionData)
  return data
}

export const eliminarAccion = async (id: string | number) => {
  const { data } = await apiClient.delete(`${API_BASE_URL_SEGURIDAD}/acciones/${id}`)
  return data
}

// Permisos por rol
export const obtenerPermisosRol = async (idRol: string | number) => {
  const { data } = await apiClient.get(`${API_BASE_URL_SEGURIDAD}/roles/${idRol}/permisos`)
  return data
}

export const guardarPermisosRol = async (
  idRol: string | number,
  payload: any,
) => {
  const { data } = await apiClient.put(`${API_BASE_URL_SEGURIDAD}/roles/${idRol}/permisos`, payload)
  return data
}
