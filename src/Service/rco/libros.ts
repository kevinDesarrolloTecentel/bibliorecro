import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient";

const API_BASE_URL_LIBROS = `${BACKEND_API_BASE}/v1/libros`;

// Metodos GET
export const getLibros = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/libros`, { params });
  return data;
};

export const ReporteIngresos = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/libros/reporte-ingresos`, { params });
  return data;
};

export const ReporteIngesosExcel = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/libros/reporte-ingresos/excel`, { params });
  return data;
};

export const ReporteIngesosPDF = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/libros/reporte-ingresos/pdf`, { params });
  return data;
};

export const listarLibros = async (params?: any) => {
  try {
    const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/librosC`, { params });
    return data;
  } catch {
    const { data } = await apiClient.get(`${BACKEND_API_BASE}/librosC`, { params });
    return data;
  }
};

export const librosPorCategoria = async (params?: any) => {
  try {
    const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/libroscategoria`, { params });
    return data;
  } catch {
    const { data } = await apiClient.get(`${BACKEND_API_BASE}/libroscategoria`, { params });
    return data;
  }
};

export const librosBaja = async (params?: any) => {
  try {
    const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/librosbaja`, { params });
    return data;
  } catch {
    const { data } = await apiClient.get(`${BACKEND_API_BASE}/librosbaja`, { params });
    return data;
  }
};

export const librosPDF = async (params?: any) => {
  try {
    const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/pdf`, { params });
    return data;
  } catch {
    const { data } = await apiClient.get(`${BACKEND_API_BASE}/pdf`, { params });
    return data;
  }
};

export const librosA = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/librosA`, { params });
  return data;
};

export const VerLibros = async (id: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/libro/${id}`);
  return data;
};

// Metodos POST
export const NuevoLibro = async (payload?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_LIBROS}/librosNew`, payload);
  return data;
};

export const Libro = async (payload?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_LIBROS}/libro`, payload);
  return data;
};

// Metodos PUT
export const ActualizarLibro = async (id: any, payload?: any) => {
  const { data } = await apiClient.put(`${API_BASE_URL_LIBROS}/libro/${id}`, payload);
  return data;
};

export const ActualizarEstado = async (id: any, payload?: any) => {
  const { data } = await apiClient.put(`${API_BASE_URL_LIBROS}/estado/${id}`, payload);
  return data;
};

// Metodo DELETE
export const EliminarLibro = async (id: any) => {
  const { data } = await apiClient.delete(`${API_BASE_URL_LIBROS}/libro/${id}`);
  return data;
};