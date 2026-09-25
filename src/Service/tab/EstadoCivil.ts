import apiClient, { BACKEND_API_BASE } from "../apiClient";

const API_BASE_URL_ESTADOCIVIL = `${BACKEND_API_BASE}/tab-estadoCivil`

//Metodo GET

export const ListarEstadoCivil = async () =>{
    const {data} = await apiClient.get(`${API_BASE_URL_ESTADOCIVIL}/estadoCivils`)
    return data
}

export const VerEstadoCivil = async (id:any) =>{
    const {data} = await apiClient.get(`${API_BASE_URL_ESTADOCIVIL}/estadoCivil/${id}`)
    return data
}

//Metodo POST

export const CrearEstadoCivil = async () =>{
    const {data} = await apiClient.post(`${API_BASE_URL_ESTADOCIVIL}/estadoCivil`)
    return data
}

//Metodo PUT

export const ActualizarEstadoCivil = async (id:any) =>{
    const {data} = await apiClient.put(`${API_BASE_URL_ESTADOCIVIL}/estadoCivil/${id}`)
    return data
}