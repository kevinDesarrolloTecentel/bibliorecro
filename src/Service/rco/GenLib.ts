import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient";

const API_BASE_URL_GENLIB = `${BACKEND_API_BASE}/v1/generoLib`

//Metodo GET

export const ListarGeneroLib = async () =>{
    const {data} = await apiClient.get(`${API_BASE_URL_GENLIB}/generosLib`)
    return data
}

export const  VerGenLib = async (id:any) =>{
    const {data} = await apiClient.get(`${API_BASE_URL_GENLIB}/generoLi/${id}`)
    return data
}

//Metodo POST

export const NuevoGenLib = async (payload?:any) =>{
    const {data} = await apiClient.post(`${API_BASE_URL_GENLIB}/generoLi`, payload)
    return data
}

//Metodo PUT

export const ActualizarGenLib = async (id:any, payload?: any) =>{
    const {data} = await apiClient.put(`${API_BASE_URL_GENLIB}/generoLi/${id}`, payload)
    return data
}

//Metodo DELETE

export const EliminarGenLib = async (id:any) =>{
    const {data} = await apiClient.delete(`${API_BASE_URL_GENLIB}/generoLi/${id}`)
    return data
}