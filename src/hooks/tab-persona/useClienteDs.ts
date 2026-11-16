import { useMemo } from 'react'
import { getUserImageUrl } from '@/utils/imageUtils'

import usePersonas, { deduplicarPersonas, debeExcluirDeRegistrados, extraerInscripcion } from './usePersonas'
import { ClienteItem } from '@/models/tab/persona.model'
import { sanitizarHistorialSanciones } from '@/utils/sancionUtils'

export type { ClienteItem }
export { extraerInscripcion }

export const getBadge = (estado: string) => {
  switch (estado) {
    case 'Activo':
      return 'success'
    case 'Inactivo':
      return 'danger'
    default:
      return 'secondary'
  }
}

export const getBadgeSancion = (sancionado: string) => {
  const s = String(sancionado || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
  if (s.includes('vet') || s.includes('vida')) {
    return 'danger'
  }
  if (s.includes('con sancion') || s.includes('sancionado')) {
    return 'warning'
  }
  if (s.includes('sin sancion')) {
    return 'secondary'
  }
  return 'secondary'
}
import { formatFecha, calcularFinUnAnio } from '@/utils/dateUtils'
export { formatFecha, calcularFinUnAnio }


export const mapearPersona = (item: any, index: number): ClienteItem => {
  const id = item.ID_PERSONA ?? item.id ?? (index + 1)
  const identificacion = item.IDENTIFICACION_PERSONA ?? item.identificacion ?? ''
  const nombre = item.NOMBRE_PERSONA ?? item.nombres ?? ''
  const apellido = item.APELLIDO_PERSONA ?? item.apellidos ?? ''
  const email = item.CORREO_PERSONA ?? item.correo ?? ''

  // Identificar si existe inscripción
  const inscActual = extraerInscripcion(item)
  const rawIdInscripcion = inscActual?.ID_INSCRIPCION ?? item.ID_INSCRIPCION ?? item.inscripcion?.ID_INSCRIPCION
  const rawInicio = inscActual?.FECHAINICIO_INSCRIPCION ?? item.FECHAINICIO_INSCRIPCION ?? item.inscripcion?.FECHAINICIO_INSCRIPCION
  const rawFin = inscActual?.FECHAFIN_INSCRIPCION ?? item.FECHAFIN_INSCRIPCION ?? item.inscripcion?.FECHAFIN_INSCRIPCION
  const rawCosto = inscActual?.COSTO_INSCRIPCION ?? item.COSTO_INSCRIPCION ?? item.inscripcion?.COSTO_INSCRIPCION

  const tieneInscripcion = Boolean(
    rawInicio ||
    (rawIdInscripcion !== null &&
      rawIdInscripcion !== undefined &&
      rawIdInscripcion !== '' &&
      rawIdInscripcion !== 0 &&
      rawIdInscripcion !== '0')
  )

  let inicio_inscripcion = 'Sin inscripción'
  let fin_inscripcion = 'Sin inscripción'

  if (tieneInscripcion) {
    if (rawInicio) {
      inicio_inscripcion = formatFecha(rawInicio)
      const finCalculado = rawFin || calcularFinUnAnio(rawInicio)
      fin_inscripcion = formatFecha(finCalculado)
    } else {
      // Inscripción histórica con ID o cobro pero fechas no registradas
      inicio_inscripcion = 'No registrada'
      fin_inscripcion = 'No registrada'
    }
  }

  // Costo
  let costo = '0.00'
  if (rawCosto !== null && rawCosto !== undefined && rawCosto !== '') {
    const num = parseFloat(String(rawCosto))
    costo = isNaN(num) ? String(rawCosto) : num.toFixed(2)
  } else if (tieneInscripcion) {
    costo = '10.00'
  } else {
    costo = '0.00'
  }

  // Procesar y sanitizar historial de sanciones y vetos
  const rawListSanciones: any[] = []
  if (Array.isArray(item.sanciones)) {
    rawListSanciones.push(...item.sanciones)
  }
  if (Array.isArray(item.vetos)) {
    rawListSanciones.push(...item.vetos)
  }
  if (rawListSanciones.length === 0 && Array.isArray(item.historial_sanciones)) {
    rawListSanciones.push(...item.historial_sanciones)
  }

  const historial_sanciones = sanitizarHistorialSanciones(rawListSanciones)

  //TIENE_VETO_PERMANENTE
  const esVetado = Boolean(
    Number(item.TIENE_VETO_PERMANENTE) === 1 ||
    Number(item.ESTADO_VETO) === 2 ||
    (Array.isArray(item.vetos) && item.vetos.some((v: any) => Number(v.ESTADO_VETO) === 2))
  )

  // TIENE_SANCION
  const tieneSancion = !esVetado && Boolean(
    Number(item.TIENE_SANCION) === 1 ||
    (Array.isArray(item.sanciones) && item.sanciones.some((s: any) => Number(s.ESTADO_SANCION) === 1))
  )

  // SANCIONES PREVIAS
  const tieneSancionPrevia = !esVetado && !tieneSancion && historial_sanciones.length > 0

  // ETIQUETA Y BADGE DE SANCIÓN
  let sancionado: 'Con sanción' | 'Sin sanción' | 'Vetado' = 'Sin sanción'
  if (esVetado) {
    sancionado = 'Vetado'
  } else if (tieneSancion) {
    sancionado = 'Con sanción'
  } else {
    sancionado = 'Sin sanción'
  }

  // 5. FECHAS Y MOTIVOS
  const masActualSancion = historial_sanciones[0]
  const vetoMasActual = historial_sanciones.find((s: any) => Number(s.estado) === 2 || s.fin === 'Indefinido')
  const sancionActiva = historial_sanciones.find((s: any) => Number(s.estado) === 1)

  let inicio_sancion = ''
  let fin_sancion = ''
  let motivo_sancion_actual = ''

  if (esVetado) {
    inicio_sancion = vetoMasActual?.inicio || formatFecha(item.FECHA_VETO) || masActualSancion?.inicio || ''
    fin_sancion = 'Indefinido'
    motivo_sancion_actual =
      (Array.isArray(item.vetos) && item.vetos[0]?.MOTIVO_VETO) ||
      vetoMasActual?.detalle ||
      item.MOTIVO_VETO ||
      'Veto permanente registrado en el sistema'
  } else if (tieneSancion) {
    const sAct = sancionActiva || masActualSancion
    inicio_sancion = sAct?.inicio || formatFecha(item.FECHAINICIO_SANCION) || ''
    fin_sancion = sAct?.fin || formatFecha(item.FECHAFIN_SANCION) || ''
    motivo_sancion_actual = sAct?.detalle || item.DETALLE_SANCION || item.ESTADO || 'Usuario con sanción activa'
  } else if (tieneSancionPrevia) {
    inicio_sancion = masActualSancion?.inicio || ''
    fin_sancion = masActualSancion?.fin || ''
    motivo_sancion_actual = masActualSancion?.detalle || item.DETALLE_SANCION || 'Sanción anterior registrada en el sistema'
  } else {
    motivo_sancion_actual = 'Sin sanciones vigentes'
  }

  const sancion = motivo_sancion_actual
  const otras_sanciones = historial_sanciones.slice(1)
  const total_sanciones = historial_sanciones.length

  //ESTADO DE LA PERSONA
  const estado: 'Activo' | 'Inactivo' = Number(item.ESTADO_PERSONA) === 1 ? 'Activo' : 'Inactivo'

  const fotoRaw = item.FOTO_PERSONA || item.IMAGEN_PERSONA || ''
  const fotografia = getUserImageUrl(fotoRaw)

  const tipoIdentificacionId =
    item.ID_TIPOIDENTIFICACION?.ID_TIPOIDENTIFICACION ??
    item.ID_TIPOIDENTIFICACION ??
    ''

  const nacionalidadId =
    item.ID_NACIONALIDAD?.ID_NACIONALIDAD ??
    item.ID_NACIONALIDAD ??
    ''

  const generoId =
    item.ID_GENERO?.ID_GENERO ??
    item.ID_GENERO ??
    ''

  const estadoCivilId =
    item.ID_ESTADOCIVIL?.ID_ESTADOCIVIL ??
    item.ID_ESTADOCIVIL ??
    ''

  const edad = item.EDAD_PERSONA ?? item.edad ?? ''
  const detalles = item.DETALLE_PERSONA ?? item.detalles ?? ''

  return {
    id,
    id_inscripcion: rawIdInscripcion,
    identificacion: String(identificacion),
    nombre: String(nombre),
    apellido: String(apellido),
    fotografia,
    email: String(email),
    inicio_inscripcion,
    fin_inscripcion,
    costo: String(costo),
    sancion: String(sancion),
    estado,
    sancionado,
    tiene_sancion: tieneSancion,
    tiene_sancion_previa: tieneSancionPrevia,
    es_vetado: esVetado,
    inicio_sancion,
    fin_sancion,
    motivo_sancion_actual,
    otras_sanciones,
    total_sanciones,
    historial_sanciones,
    inscripciones: item.inscripciones || item.raw?.inscripciones || (inscActual ? [inscActual] : []),
    sanciones: item.sanciones || item.raw?.sanciones || [],
    vetos: item.vetos || item.raw?.vetos || [],
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
    s === 'Sin inscripción' ||
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
    if (year > 1900) {
      const d = new Date(year, month, day)
      if (!isNaN(d.getTime())) return d.getTime()
    }
  }

  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (ymd) {
    const year = parseInt(ymd[1], 10)
    const month = parseInt(ymd[2], 10) - 1
    const day = parseInt(ymd[3], 10)
    if (year > 1900) {
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
  const insc = raw.inscripcion ?? raw.renovacion ?? {}
  const inscActual = extraerInscripcion(raw)

  const candidates = [
    inscActual?.FECHAINICIO_INSCRIPCION,
    raw.FECHAINICIO_INSCRIPCION ?? insc.FECHAINICIO_INSCRIPCION,
    raw.FECHAREGISTRO_PERSONA ?? cliente?.inicio_inscripcion,
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
    key: 'identificacion',
    label: 'Identificación',
    _style: { width: '14%' },
  },
  {
    key: 'nombre',
    label: 'Nombres',
    _style: { width: '18%' },
  },
  {
    key: 'apellido',
    label: 'Apellidos',
    _style: { width: '18%' },
  },
  {
    key: 'email',
    label: 'Email',
    _style: { width: '22%' },
  },
  {
    key: 'estado',
    label: 'Estado',
    _style: { width: '14%' },
  },
  {
    key: 'sancionado',
    label: 'Sanción',
    _style: { width: '14%' },
  },
]

export const useClienteDs = (customPersonaState?: ReturnType<typeof usePersonas>) => {
  const internalPersonaState = usePersonas()
  const personaState = customPersonaState || internalPersonaState

  const items = useMemo(() => {
    const rawList = deduplicarPersonas(personaState.personas || [])
    return rawList
      .filter((item: any) => !debeExcluirDeRegistrados(item))
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
    getBadgeSancion,
    loading: personaState.loading,
    details: personaState.details,
    toggleDetails: personaState.toggleDetails,
    handleAbrirEditar: personaState.handleAbrirEditar,
    handleEliminarPersona: personaState.handleEliminarPersona,
    canCrearUsuario: personaState.canCrearUsuario,
    canGuardarUsuario: personaState.canGuardarUsuario,
    canVerDetalles: personaState.canVerDetalles,
    canEditar: personaState.canEditarUsuario,
    canActualizar: personaState.canActualizarUsuario,
    canEliminar: personaState.canEliminarUsuario,
    canRenovar: personaState.canRenovarUsuario,
    canGuardarRenovacion: personaState.canGuardarRenovacion,
    tieneAcciones: personaState.tieneAcciones,
  }
}

export default useClienteDs
