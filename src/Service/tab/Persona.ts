import apiClient, { BACKEND_API_BASE } from '@/Service/ApiClient'
import { listarPrestamosCedula } from '../rco/Prestamos'

const API_BASE_URL_PERSONA = `${BACKEND_API_BASE}/tab-persona`

// --- Consultas y Listados ---
export const ListaPersonaWeb = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/persWeb`)
  return data
}

export const PersonaNueva = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasNuevas`, { params })
  return data
}
export const PersonasNuevasDetalle = PersonaNueva

export const AniosDisponibles = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/aniosDisponibles`)
  return data
}

export const UsuActEG = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasEG`)
  return data
}

// Listado paginado de personas registradas
export const Personas = async (payload?: any, params?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/personasRegistradas`, payload, { params })
  return data
}
export const listarPersonas = Personas
export const PersonasRegistradas = Personas

// Solicitudes de nuevos y renovaciones
export const PersonasE = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasE`, { params })
  return data
}

export const PersonasBiblio = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personas`, { params })
  return data
}

// --- Reportes ---
export const ListarPersonaReport = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReport`, { params })
  return data
}
export const personasReporte = ListarPersonaReport
export const PersonasEdadGeneroReport = ListarPersonaReport

export const PersonasActivasReport = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportActivas`, { params })
  return data
}

export const PersonasActivasMesReport = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportActivasMes`, { params })
  return data
}
export const PersonasActivasMesDiaReport = PersonasActivasMesReport

export const PersonasRenovacionesReport = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportRenovaciones`, { params })
  return data
}

export const PersonasNuevasReport = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportNuevas`, { params })
  return data
}
export const PersonasNuevasDiaMesAnoReport = PersonasNuevasReport

export const PersonasHistorialLibrosReport = listarPrestamosCedula
export const PrestamosReportPorUsuario = listarPrestamosCedula

export const PersonasMejoresReport = async (params?: any) => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportMejores`, { params })
  return data
}
export const personasMejoresReport = PersonasMejoresReport

// --- Mantenimiento ---
export const ExportarExcel = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/exportarPersonasExcel`)
  return data
}

export const Verificacion = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/verificacion`)
  return data
}

export const caducidad = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/caducidad`)
  return data
}

// --- CRUD Personas ---
export const verPersonas = async (id: string | number) => {
  const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/persona/${id}`)
  return data
}

export const CrearPersonas = async (personaData?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/persona`, personaData)
  return data
}

export const PersonasNueva = async (personaData?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/personaNew`, personaData)
  return data
}

export const PersonaUsuario = async (personaData?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/personaUsuario`, personaData)
  return data
}

export const ActualizarPersonaNueva = async (id: string | number, personaData?: any) => {
  if (personaData instanceof FormData) {
    if (!personaData.has('_method')) {
      personaData.append('_method', 'PUT')
    }
    const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/personaNew/${id}`, personaData)
    return data
  }
  const { data } = await apiClient.put(`${API_BASE_URL_PERSONA}/personaNew/${id}`, personaData)
  return data
}
export const ActualizarPersona = ActualizarPersonaNueva
export const actualizarPersona = ActualizarPersonaNueva

export const PersonaWeb = async (id: string | number, personaData?: any) => {
  const { data } = await apiClient.put(`${API_BASE_URL_PERSONA}/personaWeb/${id}`, personaData)
  return data
}

export const PersonaEstado = async (id: string | number, estadoData?: any) => {
  const { data } = await apiClient.put(`${API_BASE_URL_PERSONA}/personaEstado/${id}`, estadoData)
  return data
}

export const EliminarPersona = async (id: string | number) => {
  const { data } = await apiClient.delete(`${API_BASE_URL_PERSONA}/persona/${id}`)
  return data
}

// --- Aceptación / Renovación de Inscripción ---
export const AceptarInscripcionNew = async (inscripcionData?: any) => {
  const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/aceptarNew`, inscripcionData)
  return data
}
