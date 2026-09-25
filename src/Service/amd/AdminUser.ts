import { sessionExpired } from "@/authSlice"
import { UserData } from "@/models/auth"
import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient"
import store from "@/store"
import { clearAuthSession } from "@/utils/auth"


const API_BASE_URL = `${BACKEND_API_BASE}/adm-user`


export const listar = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL}/listar`)
    return data
}

export const ver = async (id: string | number) => {
    const { data } = await apiClient.get(`${API_BASE_URL}/ver/${id}`)
    return data
}

export const perfil = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL}/perfil`)
    return data
}

export const login = async (credentials: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL}/login`, credentials)
    return data
}

export const logout = async () => {
    try {
        const { data } = await apiClient.post(`${API_BASE_URL}/logout`)
        return data
    } finally {
        clearAuthSession()
        store.dispatch(sessionExpired())
    }
}

export const crear = async (userData?: UserData | any) => {
    const { data } = await apiClient.post(`${API_BASE_URL}/crear`, userData)
    return data
}

export const refrescar = async () => {
    const { data } = await apiClient.post(`${API_BASE_URL}/refrescar`)
    return data
}

export const actualizar = async (id: string | number, userData?: UserData | any) => {
    const { data } = await apiClient.put(`${API_BASE_URL}/actualizar/${id}`, userData)
    return data
}

export const eliminar = async (id: string | number) => {
    const { data } = await apiClient.delete(`${API_BASE_URL}/eliminar/${id}`)
    return data
}


