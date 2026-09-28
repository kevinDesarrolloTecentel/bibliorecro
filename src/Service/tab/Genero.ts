import apiClient, { BACKEND_API_BASE } from "../apiClient";

const API_BASE_URL_GENERO = `${BACKEND_API_BASE}/tab-genero`;

// Metodo GET
export const ListarGenero = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_GENERO}/generos`);
    return data;
};

export const verGenero = async (id: any, payload?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_GENERO}/genero/${id}`, payload);
    return data;
};

// Metodo POST
export const crearGenero = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_GENERO}/genero`, payload);
    return data;
};

// Metodo PUT
export const actualizarGenero = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_GENERO}/genero/${id}`, payload);
    return data;
};
