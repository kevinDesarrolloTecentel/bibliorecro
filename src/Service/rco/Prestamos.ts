import apiClient, { BACKEND_API_BASE } from "../apiClient";

const API_BASE_URL_PRESTAMOS = `${BACKEND_API_BASE}/v1/prestamos`;

// Metodo GET -- Consultas
export const Lista = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/list`, { params });
    return data;
};

export const buscar = async (params?: any) => {
    const query = typeof params === 'object' ? params : params ? { q: params } : undefined;
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/buscar`, { params: query });
    return data;
};

export const DashTotalPres = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/dashboard/totales`);
    return data;
};

export const listarPrestamos = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/reportes`, { params });
    return data;
};

export const listarPrestamosCedula = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/reportes-por-cedula`, { params });
    return data;
};

export const Pendientes = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/pendientes`);
    return data;
};

export const Caducados = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/caducados`);
    return data;
};

export const Hoy = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/hoy`);
    return data;
};

export const Mes = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/mes`);
    return data;
};

export const Anio = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/anio`);
    return data;
};

export const verPrestamo = async (id: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/${id}`);
    return data;
};

// Metodo POST -- Creacion
export const CearPrestamo = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_PRESTAMOS}/create`, payload);
    return data;
};

export const CrearPrestamo = CearPrestamo;

export const NuevoPrestamo = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_PRESTAMOS}/nuevo`, payload);
    return data;
};

// Metodo PUT -- Actualizacion  
export const Actualizarprestamo = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_PRESTAMOS}/${id}`, payload);
    return data;
};

export const CambioEstado = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_PRESTAMOS}/${id}/estado`, payload);
    return data;
};

export const CambioEstadoSancion = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_PRESTAMOS}/${id}/sancion`, payload);
    return data;
};

export const ExtenderFecha = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_PRESTAMOS}/${id}/extender`, payload);
    return data;
};

export const CambioEstadoLibro = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_PRESTAMOS}/${id}/danado`, payload);
    return data;
};

// Metodo DELETE
export const EliminarPrestamo = async (id: any, payload?: any) => {
    const { data } = await apiClient.delete(`${API_BASE_URL_PRESTAMOS}/${id}`, payload);
    return data;
};