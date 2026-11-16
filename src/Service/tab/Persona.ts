import apiClient, { BACKEND_API_BASE } from "../ApiClient";

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

export const PersonasNuevasDetalle = PersonaNueva;

export const AniosDisponibles = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/aniosDisponibles`);
    return data;
};

export const UsuActEG = async () => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasEG`);
    return data;
};

export const Personas = async (
    page?: number,
    per_page?: number,
    search?: string,
    estado?: number | string | null,
    sancion?: number | string | null,
    estado_veto?: number | string | null
) => {
    let valorEstadoVeto: number | null = null;
    if (estado_veto !== undefined && estado_veto !== '' && estado_veto !== null) {
        valorEstadoVeto = Number(estado_veto);
    }

    let valorEstado: number | null = null;
    if (estado !== undefined && estado !== '' && estado !== null) {
        valorEstado = Number(estado);
    }

    let valorSancion: number | null = null;
    if (sancion !== undefined && sancion !== '' && sancion !== null) {
        valorSancion = Number(sancion);
    }

    const filtrosObj = {
        nombre: search && search.trim() !== '' ? search.trim() : '',
        estado: valorEstado,
        sancion: valorSancion,
        estado_veto: valorEstadoVeto,
        per_page: per_page || 10,
    };

    const payload: Record<string, any> = {
        ...filtrosObj,
        filtros: filtrosObj,
        page: page || 1,
    };

    const options = page ? { params: { page } } : undefined;

    const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/personasRegistradas`, payload, options);
    return data;
};
export const listarPersonas = Personas;
export const PersonasRegistradas = Personas;

export const PersonasE = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasE`, { params });
    return data;
};

export const PersonasBiblio = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personas`, { params });
    return data;
};

// Reportes -- GET
// 1. Reporte de Usuarios por Edad y Género
export const ListarPersonaReport = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReport`, { params });
    return data;
};
export const personasReporte = ListarPersonaReport;
export const PersonasEdadGeneroReport = ListarPersonaReport;

// 2. Reporte de Usuarios Activos
export const PersonasActivasReport = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportActivas`, { params });
    return data;
};

// 3. Reporte de Usuarios Activos por Mes y Día
export const PersonasActivasMesReport = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportActivasMes`, { params });
    return data;
};
export const PersonasActivasMesDiaReport = PersonasActivasMesReport;

// 4. Reporte de Renovaciones por Día / Mes / Año
export const PersonasRenovacionesReport = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportRenovaciones`, { params });
    return data;
};

// 5. Reporte de Nuevos Usuarios por Día / Mes / Año
export const PersonasNuevasReport = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportNuevas`, { params });
    return data;
};
export const PersonasNuevasDiaMesAnoReport = PersonasNuevasReport;

// 6. Reporte de Historial de Libros por Usuario
import { listarPrestamosCedula } from '../rco/Prestamos';
export const PersonasHistorialLibrosReport = listarPrestamosCedula;
export const PrestamosReportPorUsuario = listarPrestamosCedula;

// 7. Reporte de Mejores Usuarios (Ranking)
export const PersonasMejoresReport = async (params?: any) => {
    const { data } = await apiClient.get(`${API_BASE_URL_PERSONA}/personasReportMejores`, { params });
    return data;
};
export const personasMejoresReport = PersonasMejoresReport;

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

// PUT / Actualización
export const ActualizarPersonaNueva = async (id: any, payload?: any) => {
    if (payload instanceof FormData) {
        if (!payload.has('_method')) {
            payload.append('_method', 'PUT');
        }
        const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/personaNew/${id}`, payload);
        return data;
    }
    const { data } = await apiClient.put(`${API_BASE_URL_PERSONA}/personaNew/${id}`, payload);
    return data;
}
export const ActualizarPersona = ActualizarPersonaNueva;
export const actualizarPersona = ActualizarPersonaNueva;

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

// Aceptación / Renovación de Inscripción


export const AceptarInscripcionNew = async (payload?: any) => {
    const { data } = await apiClient.post(`${API_BASE_URL_PERSONA}/aceptarNew`, payload);
    return data;
};