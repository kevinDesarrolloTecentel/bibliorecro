import apiClient, { BACKEND_API_BASE } from "../apiClient";

const API_BASE_URL_NACIONALIDAD = `${BACKEND_API_BASE}/tab-nacionalidad`

//Metodo GET

export  const ListarNacionalidad = async () =>{
    const {data} = await apiClient.get(`${API_BASE_URL_NACIONALIDAD}/nacionalidas`)
    return data
}

export const VerNacionalidad = async (id:any) =>{
    const {data} = await apiClient.get(`${API_BASE_URL_NACIONALIDAD}/nacionalidad/${id}`)
    return data
}

//Metodo POST

export const CrearNacionalidad = async () =>{
    const {data} = await apiClient.post(`${API_BASE_URL_NACIONALIDAD}/nacionalidad`)
    return data
}

//Metodo PUT

export const ActualizarNacionalidad = async (id:any) =>{
    const {data} = await apiClient.put(`${API_BASE_URL_NACIONALIDAD}/nacionalidad/${id}`)
    return data
}