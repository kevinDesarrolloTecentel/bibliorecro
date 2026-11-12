import apiClient, { BACKEND_API_BASE } from "@/Service/ApiClient";

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

export const listarLibros = async (params?: any, config?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/librosC`, {
    params,
    timeout: 180000,
    ...config,
  });
  return data;
};

export const librosPorCategoria = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/libroscategoria`, { params });
  return data;
};

export const librosBaja = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/librosbaja`, { params });
  return data;
};

export const librosPDF = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_LIBROS}/pdf`, { params });
  return data;
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
export interface BuscarLibrosFiltros {
  estado_prestamo?: string | null
  estado_libro?: string | null
}

export const BuscarLibros = async (
  busqueda: string = '',
  page: number = 1,
  per_page?: number,
  filtros?: BuscarLibrosFiltros,
) => {
  const payload: any = { busqueda }
  if (per_page) payload.per_page = per_page
  if (filtros?.estado_prestamo) payload.estado_prestamo = filtros.estado_prestamo
  if (filtros?.estado_libro) payload.estado_libro = filtros.estado_libro

  const params: any = { page }
  if (per_page) params.per_page = per_page
  if (busqueda) params.busqueda = busqueda
  if (filtros?.estado_prestamo) params.estado_prestamo = filtros.estado_prestamo
  if (filtros?.estado_libro) params.estado_libro = filtros.estado_libro

  const { data } = await apiClient.post(
    `${API_BASE_URL_LIBROS}/librosNew`,
    payload,
    { params },
  )
  return data
}

export const NuevoLibro = async (payload?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_LIBROS}/libro`, payload);
  return data;
};

export const Libro = async (payload?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_LIBROS}/libro`, payload);
  return data;
};

// Metodos PUT
export const ActualizarLibro = async (id: any, payload?: any) => {
  if (payload instanceof FormData) {
    if (!payload.has('_method')) {
      payload.append('_method', 'PUT');
    }
    const { data } = await apiClient.post(`${API_BASE_URL_LIBROS}/libro/${id}`, payload);
    return data;
  }
  const { data } = await apiClient.put(`${API_BASE_URL_LIBROS}/libro/${id}`, payload);
  return data;
};

export const ActualizarEstado = async (id: any, payload?: any) => {
  const body = payload ?? {
    ESTADO_LIBROS: 0
  };
  const { data } = await apiClient.put(`${API_BASE_URL_LIBROS}/estado/${id}`, body);
  return data;
};

export const ActivarLibro = async (id: any, payload?: any) => {
  const body = payload ?? {
    ESTADO_LIBROS: 1,
    estado: 1,
    estado_libros: 1,
    ESTADO_LIBRO: 1,
    ESTADO: 1,
  };
  const { data } = await apiClient.put(`${API_BASE_URL_LIBROS}/libro/${id}/activar`, body);
  return data;
};

// Metodo DELETE
export const EliminarLibro = async (id: any) => {
  const { data } = await apiClient.delete(`${API_BASE_URL_LIBROS}/libro/${id}`);
  return data;
};