import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient";

const API_BASE_URL_FORMATLIB = `${BACKEND_API_BASE}/v1/formatoLib`;

// Metodo GET
export const listarFormatLib = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_FORMATLIB}/formatos`);
    return data;
};

export const VerFormatLib = async (id: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_FORMATLIB}/formato/${id}`);
    return data;
};

// Metodo POST
export const NuevoFormatLib = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_FORMATLIB}/formato`, payload);
    return data;
};

// Metodo PUT
export const ActualizarFormatLib = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_FORMATLIB}/formato/${id}`, payload);
    return data;
};

// Metodo DELETE
export const EliminarFormatLib = async (id: any) => {
    const { data } = await apiClient.delete(`${API_BASE_URL_FORMATLIB}/formato/${id}`);
    return data;
};