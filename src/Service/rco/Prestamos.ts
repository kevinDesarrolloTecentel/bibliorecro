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

export const DashTotalPres = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/dashboard/totales`, { params });
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

export const Pendientes = async (params?: any) => {
    try {
        const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/pendientes`, { params });
        return data;
    } catch {
        const { data } = await apiClient.get(`${BACKEND_API_BASE}/prestamosPendientes`, { params });
        return data;
    }
};
export const prestamosPendientesReport = Pendientes;

export const Caducados = async (params?: any) => {
    try {
        const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/caducados`, { params });
        return data;
    } catch {
        const { data } = await apiClient.get(`${BACKEND_API_BASE}/prestamosCaducados`, { params });
        return data;
    }
};
export const prestamosCaducadosReport = Caducados;

export const Hoy = async (params?: any) => {
    try {
        const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/hoy`, { params });
        return data;
    } catch {
        const { data } = await apiClient.get(`${BACKEND_API_BASE}/prestamoshoy`, { params });
        return data;
    }
};
export const prestamosHoyReport = Hoy;

export const Mes = async (params?: any) => {
    try {
        const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/mes`, { params });
        return data;
    } catch {
        const { data } = await apiClient.get(`${BACKEND_API_BASE}/prestamosmes`, { params });
        return data;
    }
};
export const prestamosMesReport = Mes;

export const Anio = async (params?: any) => {
    try {
        const { data } = await apiClient.get(`${API_BASE_URL_PRESTAMOS}/anio`, { params });
        return data;
    } catch {
        const { data } = await apiClient.get(`${BACKEND_API_BASE}/prestamosaño`, { params });
        return data;
    }
};
export const prestamosAnioReport = Anio;

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