import apiClient, { BACKEND_API_BASE } from "../ApiClient";
import { listarPersonas } from "../tab/Persona";

const API_BASE_URL_PRESTAMOS = `${BACKEND_API_BASE}/v1/prestamos`;

export const buscarSancionados = async (
    busqueda: string = '',
    page: number = 1,
    estado_veto?: number | string | null,
    estado?: number | string | null
) => {
    return await listarPersonas(page, 10, busqueda, estado ?? undefined, 1, estado_veto);
};

export const QuitarSancion = async (idSancion: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_PRESTAMOS}/sanciones/${idSancion}/quitar`, payload || {});
    return data;
};

export const SancionarDePorVida = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_PRESTAMOS}/sancionar-de-por-vida`, payload || {});
    return data;
};
