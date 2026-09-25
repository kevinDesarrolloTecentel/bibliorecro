import { useMemo } from 'react'
import { getUserImageUrl } from '@/.env'

import usePersonas from './usePersonas'
import { ClienteItem } from '@/models/tab/persona.model'

export type { ClienteItem }

export const getBadge = (estado: string) => {
  switch (estado) {
    case 'Activo':
      return 'success'
    case 'Inactivo':
      return 'danger'
    case 'Sancionado':
      return 'warning'
    default:
      return 'primary'
  }
}

export const formatFecha = (f: any) => {
  if (!f) return 'No registrada'
  if (f === 'No registrada') return 'No registrada'
  if (typeof f === 'string') {
    if (
      f.startsWith('0000-00-00') ||
      f.startsWith('1969-12-31') ||
      f.startsWith('1970-01-01')
    ) {
      return 'No registrada'
    }
    const clean = f.includes('T') ? f.split('T')[0] : f.includes(' ') ? f.split(' ')[0] : f
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, d] = clean.split('-')
      if (Number(y) <= 1970) return 'No registrada'
      return `${d}/${m}/${y}`
    }
    return clean
  }
  if (f instanceof Date && !isNaN(f.getTime())) {
    if (f.getFullYear() <= 1970) return 'No registrada'
    const d = String(f.getDate()).padStart(2, '0')
    const m = String(f.getMonth() + 1).padStart(2, '0')
    const y = f.getFullYear()
    return `${d}/${m}/${y}`
  }
  return String(f)
}

export const mapearPersona = (item: any, index: number): ClienteItem => {
  const id = item.ID_PERSONA ?? item.id ?? item.ID ?? (index + 1)
  const identificacion = item.IDENTIFICACION_PERSONA ?? item.identificacion ?? ''
  const nombre = item.NOMBRE_PERSONA ?? item.nombres ?? ''
  const apellido = item.APELLIDO_PERSONA ?? item.apellidos ?? ''
  const email = item.CORREO_PERSONA ?? item.correo ?? ''
  const inicio_inscripcion =
    item.FECHAINICIO_INSCRIPCION ??
    item.FECHA_INICIO_INSCRIPCION ??
    item.FECHAINICIO ??
    item.FECHA_INICIO ??
    item.fecha_inicio_inscripcion ??
    item.fecha_inicio ??
    item.inicio_inscripcion ??
    item.Fecha_inscripcion ??
    item.fecha_inscripcion ??
    item.FECHA_INSCRIPCION ??
    item.FECHAREGISTRO_PERSONA ??
    item.inscripcion?.FECHAINICIO_INSCRIPCION ??
    item.inscripcion?.FECHA_INICIO_INSCRIPCION ??
    item.inscripciones?.[0]?.FECHAINICIO_INSCRIPCION ??
    item.inscripciones?.[0]?.fecha_inicio ??
    item.renovacion?.FECHAINICIO_RENOVACIONES ??
    item.renovaciones?.[0]?.FECHAINICIO_RENOVACIONES ??
    null

  const fin_inscripcion =
    item.FECHAFIN_INSCRIPCION ??
    item.FECHA_FIN_INSCRIPCION ??
    item.FECHAFIN ??
    item.FECHA_FIN ??
    item.fecha_fin_inscripcion ??
    item.fecha_fin ??
    item.fin_inscripcion ??
    item.Fecha_fin_inscripcion ??
    item.fecha_fin_inscripcion ??
    item.FECHA_FIN_INSCRIPCION ??
    item.inscripcion?.FECHAFIN_INSCRIPCION ??
    item.inscripcion?.FECHA_FIN_INSCRIPCION ??
    item.inscripcion?.FECHAFIN ??
    item.inscripcion?.fecha_fin ??
    item.inscripcions?.[0]?.FECHAFIN_INSCRIPCION ??
    item.inscripcions?.[0]?.FECHA_FIN_INSCRIPCION ??
    item.inscripciones?.[0]?.FECHAFIN_INSCRIPCION ??
    item.inscripciones?.[0]?.FECHA_FIN_INSCRIPCION ??
    item.inscripciones?.[0]?.fecha_fin ??
    item.renovacion?.FECHAFIN_RENOVACIONES ??
    item.renovaciones?.[0]?.FECHAFIN_RENOVACIONES ??
    inicio_inscripcion

  const costo =
    item.COSTO_INSCRIPCION ??
    item.COSTO ??
    item.costo ??
    item.inscripcion?.COSTO_INSCRIPCION ??
    item.inscripcion?.costo ??
    item.inscripcions?.[0]?.COSTO_INSCRIPCION ??
    item.inscripciones?.[0]?.COSTO_INSCRIPCION ??
    '10.00'

  const sancion =
    item.ESTADO_SANCION ??
    item.DETALLE_SANCION ??
    'Sin sanciones'

  const estadoRaw = String(item.ESTADO_PERSONA ?? item.estado ?? 'Activo')
  let estado: 'Activo' | 'Inactivo' | 'Sancionado' = 'Activo'
  if (estadoRaw.toLowerCase().includes('inactiv') || estadoRaw === '0') {
    estado = 'Inactivo'
  } else if (estadoRaw.toLowerCase().includes('sancion') || estadoRaw === '2') {
    estado = 'Sancionado'
  }

  const fotoRaw = item.FOTO_PERSONA || item.IMAGEN_PERSONA || ''
  const fotografia = getUserImageUrl(fotoRaw)

  const tipoIdentificacionId =
    item.ID_TIPOIDENTIFICCACION?.ID_TIPOIDENTIFICACION ??
    item.ID_TIPOIDENTIFICACION?.ID_TIPOIDENTIFICACION ??
    ''

  const nacionalidadId =
    item.ID_NACIONALIDAD?.ID_NACIONALIDAD ??
    item.ID_NACIONALIDAD ??
    item.id_nacionalidad ??
    ''

  const generoId =
    item.ID_GENERO?.ID_GENERO ??
    item.ID_GENERO ??
    item.id_genero ??
    ''

  const estadoCivilId =
    item.ID_ESTADOCIVIL?.ID_ESTADOCIVIL ??
    item.ID_ESTADOCIVIL?.ID_ESTADO_CIVIL ??
    item.ID_ESTADO_CIVIL ??
    item.ID_ESTADOCIVIL ??
    item.id_estado_civil ??
    ''

  const edad = item.EDAD_PERSONA ?? item.edad ?? ''
  const detalles = item.DETALLE_PERSONA ?? item.detalles ?? ''

  return {
    id,
    identificación: String(identificacion),
    nombre: String(nombre),
    apellido: String(apellido),
    fotografia,
    FOTO_PERSONA: fotografia,
    email: String(email),
    correo: String(email),
    inicio_inscripcion: formatFecha(inicio_inscripcion),
    fin_inscripcion: formatFecha(fin_inscripcion),
    costo: String(costo),
    sancion: String(sancion),
    estado,
    id_tipo_identificacion: String(tipoIdentificacionId),
    id_nacionalidad: String(nacionalidadId),
    id_genero: String(generoId),
    id_estado_civil: String(estadoCivilId),
    edad: String(edad),
    detalles: String(detalles),
    telefono: item.TELEFONO_PERSONA || item.telefono || '',
    celular: item.CELULAR_PERSONA || item.celular || '',
    direccion: item.DIRECCION_PERSONA || item.direccion || '',
    fecha_nacimiento: formatFecha(item.FECHA_PERSONA || item.FECHA_NACIMIENTO_PERSONA),
    raw: item,
  }
}

export const parseDateToTimestamp = (val: any): number => {
  if (!val) return 0
  if (val instanceof Date) return isNaN(val.getTime()) ? 0 : val.getTime()
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const s = String(val).trim()
  if (
    !s ||
    s === 'No registrada' ||
    s.startsWith('0000-00-00') ||
    s.startsWith('1970-01-01') ||
    s.startsWith('1969-12-31')
  ) {
    return 0
  }
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (dmy) {
    const day = parseInt(dmy[1], 10)
    const month = parseInt(dmy[2], 10) - 1
    const year = parseInt(dmy[3], 10)
    if (year > 1970) {
      const d = new Date(year, month, day)
      if (!isNaN(d.getTime())) return d.getTime()
    }
  }

  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (ymd) {
    const year = parseInt(ymd[1], 10)
    const month = parseInt(ymd[2], 10) - 1
    const day = parseInt(ymd[3], 10)
    if (year > 1970) {
      const d = new Date(year, month, day)
      if (!isNaN(d.getTime())) return d.getTime()
    }
  }

  const yearMatch = s.match(/\b(20[1-3]\d)\b/)
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10)
    return new Date(year, 0, 1).getTime()
  }

  const parsed = new Date(s.replace(' ', 'T')).getTime()
  if (!isNaN(parsed) && parsed > 0) return parsed

  return 0
}

export const obtenerTimestampInscripcion = (cliente: ClienteItem | any): number => {
  const raw = cliente?.raw || cliente || {}
  const insc =
    raw.inscripcion ||
    (Array.isArray(raw.inscripciones) ? raw.inscripciones[0] : null) ||
    (Array.isArray(raw.inscripcions) ? raw.inscripcions[0] : null) ||
    {}
  const reno =
    raw.renovacion ||
    (Array.isArray(raw.renovaciones) ? raw.renovaciones[0] : null) ||
    {}

  const candidates = [
    insc.FECHAINICIO_INSCRIPCION,
    insc.FECHA_INICIO_INSCRIPCION,
    insc.fecha_inicio,
    reno.FECHAINICIO_RENOVACIONES,
    raw.FECHAINICIO_INSCRIPCION,
    raw.FECHA_INICIO_INSCRIPCION,
    raw.FECHAINICIO,
    raw.FECHA_INICIO,
    raw.fecha_inicio_inscripcion,
    raw.fecha_inicio,
    raw.inicio_inscripcion,
    raw.Fecha_inscripcion,
    raw.fecha_inscripcion,
    raw.FECHA_INSCRIPCION,
    raw.FECHAREGISTRO_PERSONA,
    raw.FECHA_REGISTRO_PERSONA,
    raw.created_at,
    raw.CREATED_AT,
    cliente?.inicio_inscripcion,
  ]

  for (const c of candidates) {
    if (c !== null && c !== undefined && c !== '') {
      const t = parseDateToTimestamp(c)
      if (t > 0) return t
    }
  }

  return 0
}

export const clienteColumns = [
  {
    key: 'identificación',
    label: 'Identificación',
    _style: { width: '15%' },
  },
  {
    key: 'nombre',
    label: 'Nombres',
    _style: { width: '15%' },
  },
  {
    key: 'apellido',
    label: 'Apellidos',
    _style: { width: '15%' },
  },
  {
    key: 'email',
    label: 'Email',
    _style: { width: '10%' },
  },
  {
    key: 'estado',
    label: 'Estado',
    _style: { width: '10%' },
  },
  {
    key: 'show_details',
    label: 'Acciones',
    _style: { width: '10%' },
    filter: false,
    sorter: false,
  },
]

export const useClienteDs = (customPersonaState?: ReturnType<typeof usePersonas>) => {
  const internalPersonaState = usePersonas()
  const personaState = customPersonaState || internalPersonaState

  const items = useMemo(() => {
    return (personaState.personas || [])
      .map((item, idx) => mapearPersona(item, idx))
      .sort((a, b) => {
        const timeA = obtenerTimestampInscripcion(a)
        const timeB = obtenerTimestampInscripcion(b)

        if (timeA !== timeB) {
          return timeB - timeA
        }

        const idA = Number(a.id) || 0
        const idB = Number(b.id) || 0
        return idB - idA
      })
  }, [personaState.personas])

  return {
    personaState,
    items,
    columns: clienteColumns,
    getBadge,
    loading: personaState.loading,
    details: personaState.details,
    toggleDetails: personaState.toggleDetails,
    handleAbrirEditar: personaState.handleAbrirEditar,
    handleEliminarPersona: personaState.handleEliminarPersona,
  }
}

export default useClienteDs
