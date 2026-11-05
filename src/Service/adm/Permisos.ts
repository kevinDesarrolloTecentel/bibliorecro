import apiClient, {BACKEND_API_BASE} from "@/Service/ApiClient"
import {
  Accion,
  GuardarPermisosRolPayload,
  MisPermisosData,
  ModuloCatalogo,
  Pantalla,
  PermisosRolData,
} from "@/models/adm/permiso.model"

const API_BASE_URL_SEGURIDAD = `${BACKEND_API_BASE}/admin-seguridad`

// permisos del usuario logueado
export const obtenerMisPermisos = async (): Promise<{ success: boolean; data: MisPermisosData }> => {
  const { data } = await apiClient.get(`${API_BASE_URL_SEGURIDAD}/mis-permisos`)
  return data
}

// catalogo de pantallas y acciones solo admin
export const obtenerCatalogo = async (): Promise<{ success: boolean; message?: string; data: ModuloCatalogo[] }> => {
  const { data } = await apiClient.get(`${API_BASE_URL_SEGURIDAD}/catalogo`)
  return data
}

export const obtenerPantallas = async (): Promise<{ success: boolean; data: Pantalla[] }> => {
  const { data } = await apiClient.get(`${API_BASE_URL_SEGURIDAD}/pantallas`)
  return data
}

export const obtenerAcciones = async (): Promise<{ success: boolean; data: Accion[] }> => {
  const { data } = await apiClient.get(`${API_BASE_URL_SEGURIDAD}/acciones`)
  return data
}

export const crearAccion = async (accionData: Accion | any): Promise<any> => {
  const { data } = await apiClient.post(`${API_BASE_URL_SEGURIDAD}/acciones`, accionData)
  return data
}

export const actualizarAccion = async (id: string | number, accionData: Partial<Accion> | any): Promise<any> => {
  const { data } = await apiClient.put(`${API_BASE_URL_SEGURIDAD}/acciones/${id}`, accionData)
  return data
}

export const eliminarAccion = async (id: string | number): Promise<any> => {
  const { data } = await apiClient.delete(`${API_BASE_URL_SEGURIDAD}/acciones/${id}`)
  return data
}

//permisos por rol
export const obtenerPermisosRol = async (idRol: string | number): Promise<{ success: boolean; data: PermisosRolData }> => {
  const { data } = await apiClient.get(`${API_BASE_URL_SEGURIDAD}/roles/${idRol}/permisos`)
  return data
}

export const guardarPermisosRol = async (
  idRol: string | number,
  payload: GuardarPermisosRolPayload | any,
): Promise<any> => {
  const { data } = await apiClient.put(`${API_BASE_URL_SEGURIDAD}/roles/${idRol}/permisos`, payload)
  return data
}
