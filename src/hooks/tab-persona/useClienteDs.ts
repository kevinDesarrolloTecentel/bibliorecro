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

  // Identificar si existe inscripción formal (compatible con array inscripciones, objeto o campos directos)
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

  // Procesar y sanitizar historial de sanciones
  const rawListSanciones: any[] = []
  if (Array.isArray(item.sanciones) && item.sanciones.length > 0) {
    rawListSanciones.push(...item.sanciones)
  } else if (Array.isArray(item.raw?.sanciones) && item.raw.sanciones.length > 0) {
    rawListSanciones.push(...item.raw.sanciones)
  }

  if (Array.isArray(item.vetos) && item.vetos.length > 0) {
    rawListSanciones.push(...item.vetos)
  } else if (Array.isArray(item.raw?.vetos) && item.raw.vetos.length > 0) {
    rawListSanciones.push(...item.raw.vetos)
  }

  if (rawListSanciones.length === 0) {
    if (Array.isArray(item.historial_sanciones) && item.historial_sanciones.length > 0) {
      rawListSanciones.push(...item.historial_sanciones)
    } else if (Array.isArray(item.raw?.historial_sanciones) && item.raw.historial_sanciones.length > 0) {
      rawListSanciones.push(...item.raw.historial_sanciones)
    }
  }

  // Solo si no hay sanciones en los arreglos se revisan campos individuales del objeto plano
  if (rawListSanciones.length === 0 && (item.ID_SANCION || item.id_sancion || item.ID_VETO || item.id_veto || (item.FECHAINICIO_SANCION && item.FECHAINICIO_SANCION !== 'No registrada'))) {
    rawListSanciones.push({
      id: item.ID_SANCION ?? item.id_sancion ?? item.ID_VETO ?? item.id_veto,
      inicio: item.FECHAINICIO_SANCION ?? item.FECHA_VETO ?? item.fecha_veto,
      fin: item.FECHAFIN_SANCION ?? ((item.ESTADO_VETO === 2 || item.ESTADO_VETO === '2' || item.estado_veto === 2 || item.estado_veto === '2' || item.TIENE_VETO_PERMANENTE === 1 || item.TIENE_VETO_PERMANENTE === '1') ? 'Indefinido' : ''),
      detalle: item.DETALLE_SANCION ?? item.MOTIVO_VETO ?? item.motivo_veto,
      estado: item.ESTADO_VETO ?? item.ESTADO_SANCION,
    })
  }

  const historial_sanciones = sanitizarHistorialSanciones(rawListSanciones)

  // Comprobar si el usuario tiene alguna sanción activa o veto de por vida:
  const esVetado = Boolean(
    (Array.isArray(item.vetos) && item.vetos.some((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2')) ||
    (Array.isArray(item.raw?.vetos) && item.raw.vetos.some((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2')) ||
    item.ESTADO_VETO === 2 ||
    item.ESTADO_VETO === '2' ||
    item.estado_veto === 2 ||
    item.estado_veto === '2' ||
    item.TIENE_VETO_PERMANENTE === 1 ||
    item.TIENE_VETO_PERMANENTE === '1' ||
    item.es_vetado ||
    (Array.isArray(historial_sanciones) && historial_sanciones.some((s: any) => s.estado === 2 || s.estado === '2' || s.fin === 'Indefinido'))
  )


  const esSinSancionExplicito = Boolean(
    item.sancion === 0 ||
    item.sancion === '0' ||
    item.TIENE_SANCION === 0 ||
    item.TIENE_SANCION === '0' ||
    item.ESTADO_SANCION === 0 ||
    item.ESTADO_SANCION === '0' ||
    item.estado_sancion === 0 ||
    item.estado_sancion === '0'
  )

  const esConSancionExplicito = Boolean(
    item.sancion === 1 ||
    item.sancion === '1' ||
    item.TIENE_SANCION === 1 ||
    item.TIENE_SANCION === '1' ||
    item.ESTADO_SANCION === 1 ||
    item.ESTADO_SANCION === '1' ||
    item.estado_sancion === 1 ||
    item.estado_sancion === '1'
  )

  const tieneSancion = !esSinSancionExplicito && esConSancionExplicito

  // Detectar si el usuario NO tiene sanción activa actualmente, pero SÍ registra sanciones previas en su historial:
  const tieneSancionPrevia = !tieneSancion && (
    historial_sanciones.length > 0 ||
    Boolean(
      (item.FECHAINICIO_SANCION && item.FECHAINICIO_SANCION !== 'No registrada') ||
      (item.FECHAFIN_SANCION && item.FECHAFIN_SANCION !== 'No registrada') ||
      (item.DETALLE_SANCION &&
        !String(item.DETALLE_SANCION).toLowerCase().includes('sin sancion') &&
        String(item.DETALLE_SANCION).trim() !== '')
    )
  )

  let sancionado: 'Con sanción' | 'Sin sanción' | 'Vetado' = 'Sin sanción'
  if (esVetado) {
    sancionado = 'Vetado'
  } else if (tieneSancion) {
    sancionado = 'Con sanción'
  } else {
    sancionado = 'Sin sanción'
  }

  const masActualSancion = historial_sanciones[0]
  const inicio_sancion =
    masActualSancion?.inicio ||
    formatFecha(item.FECHAINICIO_SANCION || item.FECHA_VETO || item.fecha_veto) ||
    ''
  const fin_sancion = esVetado
    ? 'Indefinido'
    : (masActualSancion?.fin || formatFecha(item.FECHAFIN_SANCION) || '')
  const total_sanciones = historial_sanciones.length

  let motivo_sancion_actual = ''
  const motivoMasActual = (masActualSancion?.detalle && masActualSancion.detalle !== 'Sin motivo especificado' && masActualSancion.detalle !== 'Sin detalle especificado')
    ? masActualSancion.detalle
    : ''

  if (esVetado) {
    motivo_sancion_actual = item.MOTIVO_VETO || motivoMasActual || 'Veto permanente registrado en el sistema'
  } else if (tieneSancion) {
    motivo_sancion_actual = motivoMasActual || item.DETALLE_SANCION || item.ESTADO || item.raw?.ESTADO || 'Usuario con sanción activa'
  } else if (tieneSancionPrevia) {
    motivo_sancion_actual = motivoMasActual || item.DETALLE_SANCION || (String(item.ESTADO || item.raw?.ESTADO || '').toLowerCase().includes('sancion') ? (item.ESTADO || item.raw?.ESTADO) : '') || 'Sanción anterior registrada en el sistema'
  } else {
    motivo_sancion_actual = 'Sin sanciones vigentes'
  }

  const sancion = motivo_sancion_actual
  const otras_sanciones = historial_sanciones.slice(1)

  const estadoRaw = String(item.ESTADO_PERSONA ?? item.estado ?? 'Activo')
  let estado: 'Activo' | 'Inactivo' = 'Activo'
  if (estadoRaw.toLowerCase().includes('inactiv') || estadoRaw === '0') {
    estado = 'Inactivo'
  }

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
