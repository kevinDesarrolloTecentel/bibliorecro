import apiClient, { BACKEND_API_BASE } from "@/Service/ApiClient";

const API_BASE_URL_PRESTAMOS = `${BACKEND_API_BASE}/v1/prestamos`;

export const QuitarSancion = async (idSancion: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_PRESTAMOS}/sanciones/${idSancion}/quitar`, payload || {});
    return data;
};

export const SancionarDePorVida = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_PRESTAMOS}/sancionar-de-por-vida`, payload || {});
    return data;
};
