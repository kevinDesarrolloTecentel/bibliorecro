import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient";

const API_BASE_URL_TIPOLIB = `${BACKEND_API_BASE}/v1/tipoLib`

//Metodo GET

export const ListarTipoLib = async() =>{
    const {data} = await apiClient.get(`${API_BASE_URL_TIPOLIB}/tipos`)
    return data
} 

export const VerTipLib = async (id:any) =>{
    const {data} = await apiClient.get(`${API_BASE_URL_TIPOLIB}/tipo/${id}`)
    return data
}

//Metodo POST

export const NuevoTipLib = async () =>{
    const {data} = await apiClient.post(`${API_BASE_URL_TIPOLIB}/tipo`)
    return data
}

//Metodo PUT

export const ActualizarTipLib = async (id:any) =>{
    const {data} = await apiClient.put(`${API_BASE_URL_TIPOLIB}/tipo/${id}`)
    return data
}

//Metodo DELETE

export const EliminarTipLib = async (id:any) =>{
    const {data} = await apiClient.delete(`${API_BASE_URL_TIPOLIB}/tipo/${id}`)
    return data
}