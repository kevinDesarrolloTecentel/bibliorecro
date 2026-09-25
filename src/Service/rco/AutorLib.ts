import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient";

const API_BASE_URL_AUTORLIB = `${BACKEND_API_BASE}/v1/autorLib`

//Metodo GET

export const ListarAutorLib = async () =>{
    const {data} = await apiClient.get(`${API_BASE_URL_AUTORLIB}/autors`)
    return data
}

export const Autores = async () =>{
    const {data} = await apiClient.get(`${API_BASE_URL_AUTORLIB}/autores`)
    return data
}

export const VerAutorLib = async (id:any) =>{
    const {data} = await apiClient.get(`${API_BASE_URL_AUTORLIB}/autor/${id}`)
    return data
}

//Metodo POST

export const NuevoAutorLib = async (payload?:any) =>{
    const {data} = await apiClient.post(`${API_BASE_URL_AUTORLIB}/autor`,payload)
    return data
}

//Metoodo PUT

export const ActualizarAutorLib = async (id:any, payload?:any) =>{
    const {data} = await apiClient.put(`${API_BASE_URL_AUTORLIB}/autor/${id}`,payload)
    return data
}

//Metodo DELETE

export const EliminarAutorLib = async (id:any) =>{
    const {data} = await apiClient.delete(`${API_BASE_URL_AUTORLIB}/autor/${id}`)
    return data
}
