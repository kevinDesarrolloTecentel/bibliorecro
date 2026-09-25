import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient";

const API_BASE_URL_LIBROS = `${BACKEND_API_BASE}/v1/libros`


//Metodos GET
export const getLibros = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/libros`)
  return data
}

export const ReporteIngresos = async () =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROS}/libros/reporte-ingresos`)
  return data
}

export const ReporteIngesosExcel = async () =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROS}/libros/reporte-ingresos/excel`)
  return data
}

export const ReporteIngesosPDF = async () =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROS}/libros/reporte-ingresos/pdf`)
  return data
}

export const listarLibros = async () =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROS}/librosC`)
  return data
}

export const librosPorCategoria = async () =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROS}/libroscategoria`)
  return data 
}

export const librosBaja = async() =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROS}/librosbaja`)
  return data
}

export const librosPDF = async () =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROS}/pdf`)
  return data
}

export const librosA = async () =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROS}/librosA`)
  return data
}

export const VerLibros = async (id:any) =>{
  const {data} = await apiClient.get(`${API_BASE_URL_LIBROS}/libro/${id}`)
  return data
}

//Metodos POST

export const NuevoLibro = async (payload?:any) =>{
  const {data} = await apiClient.post(`${API_BASE_URL_LIBROS}/librosNew`, payload)
  return data
}

export const Libro = async () =>{
  const {data} = await apiClient.post(`${API_BASE_URL_LIBROS}/libro`)
  return data
}

//Metodo PUT

export const ActualizarLibro = async (id:any, payload?:any) =>{
  const {data} = await apiClient.put(`${API_BASE_URL_LIBROS}/libro/${id}`, payload)
  return data
}

export const ActualizarEstado = async (id:any) =>{
  const {data} = await apiClient.put(`${API_BASE_URL_LIBROS}/estado/${id}`)
  return data
}

//Metodo DELETE

export const EliminarLibro = async(id:any) =>{
  const {data} = await apiClient.delete(`${API_BASE_URL_LIBROS}/libro/${id}`)
  return data
}