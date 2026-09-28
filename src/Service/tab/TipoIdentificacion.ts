import apiClient, { BACKEND_API_BASE } from "../apiClient";

const API_BASE_URL_TIPOIDENTIFICACION = `${BACKEND_API_BASE}/tab-tipoidentificacion`;

// Metodo GET
export const listarTipoIdentificacion = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_TIPOIDENTIFICACION}/tipoIdentificacions`);
    return data;
};

export const VerTipoIdentificacion = async (id: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_TIPOIDENTIFICACION}/tipoIdentificacion/${id}`);
    return data;
};

// Metodo POST
export const CrearTipoIdentificacion = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_TIPOIDENTIFICACION}/tipoIdentificacion`, payload);
    return data;
};

// Metodo PUT
export const ActualizarTipoIdentificacion = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_TIPOIDENTIFICACION}/tipoIdentificacion/${id}`, payload);
    return data;
};