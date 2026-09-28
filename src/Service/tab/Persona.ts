import apiClient, { BACKEND_API_BASE } from "../apiClient";

const API_BASE_URL_PERSONA = `${BACKEND_API_BASE}/tab-persona`;

// Metodos GET -- Consultas
export const ListaPersonaWeb = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/persWeb`);
    return data;
};

export const PersonaNueva = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasNuevas`, { params });
    return data;
};

export const AniosDisponibles = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/aniosDisponibles`);
    return data;
};

export const UsuActEG = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasEG`);
    return data;
};

export const Personas = async (page?: number, per_page?: number, search?: string) => {
    const params: Record<string, any> = {};
    if (page !== undefined) params.page = page;
    if (per_page !== undefined) params.per_page = per_page;
    if (search !== undefined && search !== '') params.search = search;
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personas`, { params });
    return data;
};
export const listarPersonas = Personas;

export const PersonasE = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasE`);
    return data;
};

// POST
export const PersonasRegistradas = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasRegistradas`);
    return data;
};
export const getInscripcionesUsuarios = PersonasRegistradas;

// Reportes -- GET
export const ListarPersonaReport = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReport`, { params });
    return data;
};
export const personasReporte = ListarPersonaReport;

export const PersonasActivasReport = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportActivas`);
    return data;
};

export const PersonasActivasMesReport = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportActivasMes`);
    return data;
};

export const PersonasRenovacionesReport = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportRenovaciones`);
    return data;
};

export const PersonasNuevasReport = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportNuevas`);
    return data;
};

export const PersonasMejoresReport = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportMejores`);
    return data;
};

// Mantenimiento
export const ExportarExcel = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/exportarPersonasExcel`);
    return data;
};

export const Verificacion = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/verificacion`);
    return data;
};

export const caducidad = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/caducidad`);
    return data;
};

// CRUD Personas
// GET
export const verPersonas = async (id: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/persona/${id}`);
    return data;
};

// POST
export const CrearPersonas = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/persona`, payload);
    return data;
};

export const PersonasNueva = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/personaNew`, payload);
    return data;
};

export const PersonaUsuario = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/personaUsuario`, payload);
    return data;
};

// PUT
export const ActualizarPersonaNueva = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_PERSONA}/personaNew/${id}`, payload);
    return data;
};
export const actualizarPersona = ActualizarPersonaNueva;
export const ActualizarPersona = ActualizarPersonaNueva;

export const PersonaWeb = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_PERSONA}/personaWeb/${id}`, payload);
    return data;
};

export const PersonaEstado = async (id: any, payload?: any) => {
    const { data } = await apiClient.put(`${API_BASE_URL_PERSONA}/personaEstado/${id}`, payload);
    return data;
};

// Eliminar
export const EliminarPersona = async (id: any) => {
    const { data } = await apiClient.delete(`${API_BASE_URL_PERSONA}/persona/${id}`);
    return data;
};