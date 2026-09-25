import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient";

const API_BASE_URL_LIBROCAT = `${BACKEND_API_BASE}/v1/categoriaLib`

//Metodo GET

export const CatLibros = async () =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROCAT}/categorias`)
  return data 
}

export const VerCatLib = async (id:any) =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROCAT}/categoria/${id}`)
  return data 
}

//Metodo POST

export const NuevaCatLib = async (payload?:any) =>{
  const {data} = await apiClient.post(`${API_BASE_URL_LIBROCAT}/categoria`,payload)
  return data
}

//Metodo PUT

export const ActualizarCatLib = async (id:any, payload?:any) =>{
  const {data} = await apiClient.put(`${API_BASE_URL_LIBROCAT}/categoria/${id}`,payload)
  return data
}

//Metodo DELETE

export const EliminarCatLib = async (id:any) =>{
  const {data} = await apiClient.delete(`${API_BASE_URL_LIBROCAT}/categoria/${id}`)
  return data
}