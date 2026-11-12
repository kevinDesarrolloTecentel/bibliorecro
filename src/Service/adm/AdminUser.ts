import { sessionExpired } from "@/authSlice"
import { LoginCredentials, UserData } from "@/models/auth"
import apiClient, { BACKEND_API_BASE } from "@/Service/ApiClient"
import store from "@/store"
import { clearAuthSession } from "@/utils/auth"
import { CreateUserPayload, UpdateUserPayload } from "@/models/adm/user.model"
import { encryptData } from "@/utils/storage"


const API_BASE_URL = `${BACKEND_API_BASE}/adm-user`



export const perfil = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL}/perfil`)
    return data
}

export const login = async (credentials: LoginCredentials) => {
    const safeCredentials: LoginCredentials = {
        ...credentials,
        PASSWORD_USUARIO: credentials.PASSWORD_USUARIO
            ? encryptData(credentials.PASSWORD_USUARIO)
            : credentials.PASSWORD_USUARIO
    }
    const { data } = await apiClient.post(`${API_BASE_URL}/login`, safeCredentials)
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

export const crear = async (userData?: CreateUserPayload | UserData | any) => {
    const { data } = await apiClient.post(`${API_BASE_URL}/crear`, userData)
    return data
}


export const actualizar = async (id: string | number, userData?: UpdateUserPayload | UserData | any) => {
    const { data } = await apiClient.put(`${API_BASE_URL}/actualizar/${id}`, userData)
    return data
}

export const eliminar = async (id: string | number) => {
    const { data } = await apiClient.delete(`${API_BASE_URL}/eliminar/${id}`)
    return data
}


