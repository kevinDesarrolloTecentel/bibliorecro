import apiClient, { BACKEND_API_BASE } from "@/Service/apiClient";

const API_BASE_URL_PROVVEDORLIB = `${BACKEND_API_BASE}/v1/proveedorLib`

//Metodo GET

export const ListarProveedorLib = async () =>{
    const {data} = await apiClient.get(`${API_BASE_URL_PROVVEDORLIB}/proveedores`)
    return data
}

export const VerProLib =  async (id:any) =>{
    const {data} = await apiClient.get(`${API_BASE_URL_PROVVEDORLIB}/proveedor/${id}`)
    return data
}

//Metodo POST

export const NuevoProvLib = async (payload?:any) =>{
    const {data} = await apiClient.post(`${API_BASE_URL_PROVVEDORLIB}/proveedor`, payload)
    return data
}

//Metodoo PUT

export const ActualizarProvLib = async (id:any, payload?: any) =>{
    const {data} = await apiClient.put(`${API_BASE_URL_PROVVEDORLIB}/proveedor/${id}`, payload)
    return data
}

//Metodo DELETE

export const EliminarProvLib = async (id:any) =>{
    const {data} = await apiClient.delete(`${API_BASE_URL_PROVVEDORLIB}/proveedor/${id}`)
    return data
}