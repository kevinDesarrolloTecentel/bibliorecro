import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient";

const API_BASE_URL_EDITLIB = `${BACKEND_API_BASE}/v1/editorialLib`;

// Metodo GET
export const ListarEditLib = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_EDITLIB}/editorials`);
    return data;
};

export const VerEditLib = async (id: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_EDITLIB}/editorial/${id}`);
    return data;
};

// Metodo POST
export const NuevaEditLib = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_EDITLIB}/editorial`, payload);
    return data;
};

// Metodo PUT
export const ActualizarEditLib = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_EDITLIB}/editorial/${id}`, payload);
    return data;
};

// Metodo DELETE
export const EliminarEditLib = async (id: any) => {
    const { data } = await apiClient.delete(`${API_BASE_URL_EDITLIB}/editorial/${id}`);
    return data;
};