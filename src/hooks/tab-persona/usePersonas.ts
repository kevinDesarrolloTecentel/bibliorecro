import { useState, useEffect, useCallback, useRef } from 'react'
import Swal from 'sweetalert2'
import { Persona } from '@/models/tab/persona.model'
import { usePermissions } from '@/context/PermissionsContext'
import {
  ActualizarPersonaNueva,
  CrearPersonas,
  EliminarPersona,
  listarPersonas,
  PersonaEstado,
  PersonaNueva,
  PersonasNueva,
  verPersonas,
} from '@/Service/tab/Persona'
import { sanitizarHistorialSanciones } from '@/utils/sancionUtils'

export interface PersonaColumnFilters {
  identificacion?: string
  nombre?: string
  apellido?: string
  email?: string
  estado?: string
  sancionado?: string
}

export const isUserSancionado = (u: any): boolean => {
  if (!u) return false
  const esSinSancion = Boolean(
    u.sancion === 0 ||
    u.sancion === '0' ||
    u.TIENE_SANCION === 0 ||
    u.TIENE_SANCION === '0' ||
    u.ESTADO_SANCION === 0 ||
    u.ESTADO_SANCION === '0' ||
    u.estado_sancion === 0 ||
    u.estado_sancion === '0'
  )
  if (esSinSancion) return false

  return Boolean(
    u.sancion === 1 ||
    u.sancion === '1' ||
    u.TIENE_SANCION === 1 ||
    u.TIENE_SANCION === '1' ||
    u.ESTADO_SANCION === 1 ||
    u.ESTADO_SANCION === '1' ||
    u.estado_sancion === 1 ||
    u.estado_sancion === '1'
  )
}

export const debeExcluirDeRegistrados = (item: any): boolean => {
  if (!item) return false
  const raw = item.raw || item

  // Estado de la persona: 0 o inactivo
  const estPersona = String(raw.ESTADO_PERSONA ?? item.estado ?? '').toLowerCase().trim()
  const esPersonaInactiva = estPersona === '0' || estPersona === 'inactivo'

  // Estado de inscripción: 1 o true (solicitud activa / renovación pendiente)
  const rawEstInsc =
    raw.ESTADOINSCRIPCION_PERSONA ??
    raw.inscripcion?.ESTADOINSCRIPCION_PERSONA ??
    item.estadoinscripcion_persona

  if (rawEstInsc === undefined || rawEstInsc === null || rawEstInsc === '') {
    return false
  }

  const estInscripcion = String(rawEstInsc).toLowerCase().trim()
  const esInscripcionPendiente = estInscripcion === '1' || estInscripcion === 'true'

  return esPersonaInactiva && esInscripcionPendiente
}

export const parseDateFallback = (val: any): number => {
  if (!val) return 0
  if (val instanceof Date) return isNaN(val.getTime()) ? 0 : val.getTime()
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const s = String(val).trim()
  if (!s || s === 'No registrada' || s.startsWith('0000') || s.startsWith('1970')) return 0

  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (dmy) {
    const d = new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10))
    if (!isNaN(d.getTime())) return d.getTime()
  }
  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (ymd) {
    const d = new Date(parseInt(ymd[1], 10), parseInt(ymd[2], 10) - 1, parseInt(ymd[3], 10))
    if (!isNaN(d.getTime())) return d.getTime()
  }
  const yearMatch = s.match(/\b(20[1-3]\d)\b/)
  if (yearMatch) return new Date(parseInt(yearMatch[1], 10), 0, 1).getTime()
  const parsed = new Date(s.replace(' ', 'T')).getTime()
  return isNaN(parsed) ? 0 : parsed
}

export const extraerInscripcion = (item: any): any | null => {
  if (!item) return null
  let inscripcionesList: any[] = []
  if (Array.isArray(item.inscripciones) && item.inscripciones.length > 0) {
    inscripcionesList = [...item.inscripciones]
  } else if (Array.isArray(item.raw?.inscripciones) && item.raw.inscripciones.length > 0) {
    inscripcionesList = [...item.raw.inscripciones]
  } else if (item.inscripcion && typeof item.inscripcion === 'object') {
    inscripcionesList = [item.inscripcion]
  } else if (item.raw?.inscripcion && typeof item.raw.inscripcion === 'object') {
    inscripcionesList = [item.raw.inscripcion]
  }

  if (inscripcionesList.length > 0) {
    inscripcionesList.sort((a, b) => {
      const timeA = parseDateFallback(a.FECHAFIN_INSCRIPCION || a.FECHAINICIO_INSCRIPCION || a.fecha_fin || a.fecha_inicio)
      const timeB = parseDateFallback(b.FECHAFIN_INSCRIPCION || b.FECHAINICIO_INSCRIPCION || b.fecha_fin || b.fecha_inicio)
      if (timeA !== timeB) return timeB - timeA
      const idA = Number(a.ID_INSCRIPCION || a.id || 0)
      const idB = Number(b.ID_INSCRIPCION || b.id || 0)
      return idB - idA
    })
    return inscripcionesList[0]
  }

  if (
    item.ID_INSCRIPCION ||
    item.FECHAINICIO_INSCRIPCION ||
    item.FECHAFIN_INSCRIPCION ||
    item.COSTO_INSCRIPCION ||
    item.raw?.ID_INSCRIPCION ||
    item.raw?.FECHAINICIO_INSCRIPCION ||
    item.raw?.FECHAFIN_INSCRIPCION ||
    item.raw?.COSTO_INSCRIPCION
  ) {
    return {
      ID_INSCRIPCION: item.ID_INSCRIPCION ?? item.raw?.ID_INSCRIPCION,
      FECHAINICIO_INSCRIPCION: item.FECHAINICIO_INSCRIPCION ?? item.raw?.FECHAINICIO_INSCRIPCION,
      FECHAFIN_INSCRIPCION: item.FECHAFIN_INSCRIPCION ?? item.raw?.FECHAFIN_INSCRIPCION,
      COSTO_INSCRIPCION: item.COSTO_INSCRIPCION ?? item.raw?.COSTO_INSCRIPCION,
      DETALLE_INSCRIPCION: item.DETALLE_INSCRIPCION ?? item.raw?.DETALLE_INSCRIPCION,
      ESTADO_INSCRIPCION: item.ESTADO_INSCRIPCION ?? item.raw?.ESTADO_INSCRIPCION,
    }
  }

  return null
}

export const extraerSancionDeFila = (raw: any): any | null => {
  if (!raw) return null
  const idSancion = raw.ID_SANCION ?? raw.id_sancion
  const idVeto = raw.ID_VETO ?? raw.id_veto
  const inicio = raw.FECHAINICIO_SANCION ?? raw.inicio_sancion ?? raw.FECHA_VETO ?? raw.fecha_veto ?? raw.inicio ?? ''
  const fin = raw.FECHAFIN_SANCION ?? raw.fin_sancion ?? raw.fin ?? ((raw.ESTADO_VETO === 2 || raw.ESTADO_VETO === '2' || raw.estado_veto === 2 || raw.estado_veto === '2' || raw.TIENE_VETO_PERMANENTE === 1 || raw.TIENE_VETO_PERMANENTE === '1') ? 'Indefinido' : '')
  let detalle = (raw.DETALLE_SANCION ?? raw.detalle_sancion ?? raw.MOTIVO_VETO ?? raw.motivo_veto ?? raw.detalle ?? '').trim()
  const estado = raw.ESTADO_VETO ?? raw.ESTADO_SANCION ?? ((raw.ESTADO_VETO === 2 || raw.ESTADO_VETO === '2' || raw.estado_veto === 2 || raw.estado_veto === '2') ? 2 : 1)

  // Solo se considera sanción real si tiene ID de sanción/veto o fechas de sanción específicas
  if (!idSancion && !idVeto && !inicio && !fin) {
    return null
  }

  const id = idSancion ?? idVeto ?? (!raw.ID_PERSONA ? raw.id : undefined)

  return {
    id,
    inicio,
    fin,
    detalle,
    estado,
  }
}

const formatApiError = (error: any, defaultMsg: string): string => {
  const data = error?.response?.data
  if (!data) return error?.message || defaultMsg
  if (typeof data === 'string') return data
  if (data.errors && typeof data.errors === 'object') {
    const msgs = Object.entries(data.errors)
      .map(([field, msgList]: [string, any]) => {
        const text = Array.isArray(msgList) ? msgList.join(', ') : String(msgList)
        return `${field}: ${text}`
      })
      .join(' | ')
    if (msgs) return msgs
  }
  if (data.message && typeof data.message === 'string') return data.message
  if (data.error && typeof data.error === 'string') return data.error
  if (data.msg && typeof data.msg === 'string') return data.msg
  return defaultMsg
}

export const deduplicarPersonas = (lista: any[]): any[] => {
  if (!Array.isArray(lista) || lista.length === 0) return []
  const map = new Map<string, any>()
  for (const item of lista) {
    if (!item) continue
    const key = String(
      item.ID_PERSONA ?? item.id ?? item.IDENTIFICACION_PERSONA ?? item.identificacion ?? ''
    ).trim()
    if (!key) continue

    const sancionFila = extraerSancionDeFila(item)

    if (!map.has(key)) {
      const clone = { ...item }
      clone.historial_sanciones = []
      if (Array.isArray(item.sanciones) && item.sanciones.length > 0) {
        item.sanciones.forEach((s: any) => {
          const sObj = extraerSancionDeFila(s)
          if (sObj) clone.historial_sanciones.push(sObj)
        })
      }
      if (Array.isArray(item.vetos) && item.vetos.length > 0) {
        item.vetos.forEach((v: any) => {
          const vObj = extraerSancionDeFila(v)
          if (vObj) clone.historial_sanciones.push(vObj)
        })
      }
      if (clone.historial_sanciones.length === 0 && sancionFila) {
        clone.historial_sanciones.push(sancionFila)
      }

      // Extraer datos de inscripción más reciente en el objeto base si vienen en item.inscripciones
      const inscActual = extraerInscripcion(item)
      if (inscActual) {
        if (!clone.ID_INSCRIPCION && inscActual.ID_INSCRIPCION) clone.ID_INSCRIPCION = inscActual.ID_INSCRIPCION
        if (!clone.FECHAINICIO_INSCRIPCION && inscActual.FECHAINICIO_INSCRIPCION) clone.FECHAINICIO_INSCRIPCION = inscActual.FECHAINICIO_INSCRIPCION
        if (!clone.FECHAFIN_INSCRIPCION && inscActual.FECHAFIN_INSCRIPCION) clone.FECHAFIN_INSCRIPCION = inscActual.FECHAFIN_INSCRIPCION
        if (!clone.COSTO_INSCRIPCION && inscActual.COSTO_INSCRIPCION) clone.COSTO_INSCRIPCION = inscActual.COSTO_INSCRIPCION
        if (!clone.DETALLE_INSCRIPCION && inscActual.DETALLE_INSCRIPCION) clone.DETALLE_INSCRIPCION = inscActual.DETALLE_INSCRIPCION
        if (clone.ESTADO_INSCRIPCION === undefined && inscActual.ESTADO_INSCRIPCION !== undefined) clone.ESTADO_INSCRIPCION = inscActual.ESTADO_INSCRIPCION
      }

      map.set(key, clone)
    } else {
      const existing = map.get(key)
      if (!Array.isArray(existing.historial_sanciones)) {
        existing.historial_sanciones = []
      }

      if (Array.isArray(item.historial_sanciones)) {
        item.historial_sanciones.forEach((s: any) => {
          const yaExiste = existing.historial_sanciones.some(
            (prev: any) =>
              (s.id && prev.id && String(prev.id) === String(s.id)) ||
              (prev.inicio === s.inicio && prev.fin === s.fin && prev.detalle === s.detalle)
          )
          if (!yaExiste) existing.historial_sanciones.push(s)
        })
      }

      if (Array.isArray(item.sanciones)) {
        item.sanciones.forEach((s: any) => {
          const sObj = extraerSancionDeFila(s)
          if (sObj) {
            const yaExiste = existing.historial_sanciones.some(
              (prev: any) =>
                (sObj.id && prev.id && String(prev.id) === String(sObj.id)) ||
                (prev.inicio === sObj.inicio && prev.fin === sObj.fin && prev.detalle === sObj.detalle)
            )
            if (!yaExiste) existing.historial_sanciones.push(sObj)
          }
        })
      }

      if (Array.isArray(item.vetos)) {
        item.vetos.forEach((v: any) => {
          const vObj = extraerSancionDeFila(v)
          if (vObj) {
            const yaExiste = existing.historial_sanciones.some(
              (prev: any) =>
                (vObj.id && prev.id && String(prev.id) === String(vObj.id)) ||
                (prev.inicio === vObj.inicio && prev.fin === vObj.fin && prev.detalle === vObj.detalle)
            )
            if (!yaExiste) existing.historial_sanciones.push(vObj)
          }
        })
      }

      if (existing.historial_sanciones.length === 0 && sancionFila) {
        const yaExiste = existing.historial_sanciones.some(
          (prev: any) =>
            (sancionFila.id && prev.id && String(prev.id) === String(sancionFila.id)) ||
            (prev.inicio === sancionFila.inicio &&
              prev.fin === sancionFila.fin &&
              prev.detalle === sancionFila.detalle)
        )
        if (!yaExiste) existing.historial_sanciones.push(sancionFila)
      }

      // Si cualquiera de las filas tiene sanción activa o veto permanente, prevalece
      if (
        item.ESTADO_VETO === 2 ||
        item.ESTADO_VETO === '2' ||
        item.ID_VETO ||
        item.id_veto ||
        item.TIENE_VETO ||
        item.tiene_veto ||
        Boolean(item.veto) ||
        (Array.isArray(item.vetos) && item.vetos.length > 0) ||
        Boolean(item.MOTIVO_VETO) ||
        Boolean(item.FECHA_VETO) ||
        item.ESTADO_SANCION === 1 ||
        item.ESTADO_SANCION === '1' ||
        item.ESTADO_PERSONA === 2 ||
        item.ESTADO_PERSONA === '2' ||
        item.TIENE_SANCION === 1 ||
        item.TIENE_SANCION === '1' ||
        (String(item.ESTADO || '').toLowerCase().includes('sancion') &&
          !String(item.ESTADO || '').toLowerCase().includes('sin sancion')) ||
        String(item.ESTADO || '').toLowerCase().includes('vet')
      ) {
        if (item.ESTADO_VETO !== undefined) existing.ESTADO_VETO = item.ESTADO_VETO
        if (item.ID_VETO) existing.ID_VETO = item.ID_VETO
        if (item.id_veto) existing.id_veto = item.id_veto
        if (item.MOTIVO_VETO) existing.MOTIVO_VETO = item.MOTIVO_VETO
        if (item.motivo_veto) existing.motivo_veto = item.motivo_veto
        if (item.FECHA_VETO) existing.FECHA_VETO = item.FECHA_VETO
        if (item.fecha_veto) existing.fecha_veto = item.fecha_veto
        if (item.TIENE_VETO !== undefined) existing.TIENE_VETO = item.TIENE_VETO
        if (item.tiene_veto !== undefined) existing.tiene_veto = item.tiene_veto
        if (item.veto) existing.veto = item.veto
        if (item.vetos) existing.vetos = item.vetos

        const esVet = Boolean(
          (
            item.ESTADO_VETO === 2 ||
            item.ESTADO_VETO === '2' ||
            item.estado_veto === 2 ||
            item.estado_veto === '2' ||
            item.TIENE_VETO_PERMANENTE === 1 ||
            item.TIENE_VETO_PERMANENTE === '1'
          ) &&
          item.ESTADO_VETO !== 0 &&
          item.ESTADO_VETO !== '0' &&
          item.estado_veto !== 0 &&
          item.estado_veto !== '0'
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

        const esSancionadoDirecto = !esSinSancionExplicito && Boolean(
          item.sancion === 1 ||
          item.sancion === '1' ||
          item.TIENE_SANCION === 1 ||
          item.TIENE_SANCION === '1' ||
          item.ESTADO_SANCION === 1 ||
          item.ESTADO_SANCION === '1' ||
          item.estado_sancion === 1 ||
          item.estado_sancion === '1'
        )

        existing.ESTADO_SANCION = esVet ? 2 : (esSancionadoDirecto ? 1 : 0)
        existing.TIENE_SANCION = (esVet || esSancionadoDirecto) ? 1 : 0
        existing.ESTADO = esVet ? 'Vetado de por vida' : (esSancionadoDirecto ? (item.ESTADO || 'Sancionado') : (item.ESTADO || 'Activo'))
        if (item.DETALLE_SANCION && !String(item.DETALLE_SANCION).includes(' | ')) {
          existing.DETALLE_SANCION = item.DETALLE_SANCION
        }
      } else if (!existing.DETALLE_SANCION && item.DETALLE_SANCION) {
        existing.DETALLE_SANCION = item.DETALLE_SANCION
      }

      // Comparar fechas de sanción para conservar siempre la más reciente
      const timeExistente = parseDateFallback(existing.FECHAINICIO_SANCION || existing.FECHAFIN_SANCION)
      const timeNuevo = parseDateFallback(item.FECHAINICIO_SANCION || item.FECHAFIN_SANCION)
      if (timeNuevo >= timeExistente && (item.FECHAINICIO_SANCION || item.FECHAFIN_SANCION)) {
        if (item.FECHAINICIO_SANCION) existing.FECHAINICIO_SANCION = item.FECHAINICIO_SANCION
        if (item.FECHAFIN_SANCION) existing.FECHAFIN_SANCION = item.FECHAFIN_SANCION
      } else {
        if (!existing.FECHAINICIO_SANCION && item.FECHAINICIO_SANCION) {
          existing.FECHAINICIO_SANCION = item.FECHAINICIO_SANCION
        }
        if (!existing.FECHAFIN_SANCION && item.FECHAFIN_SANCION) {
          existing.FECHAFIN_SANCION = item.FECHAFIN_SANCION
        }
      }

      // Preservar fechas de inscripción
      const inscExistente = extraerInscripcion(existing)
      const inscNueva = extraerInscripcion(item)
      if (inscNueva) {
        const timeExistente = parseDateFallback(inscExistente?.FECHAFIN_INSCRIPCION || inscExistente?.FECHAINICIO_INSCRIPCION)
        const timeNueva = parseDateFallback(inscNueva?.FECHAFIN_INSCRIPCION || inscNueva?.FECHAINICIO_INSCRIPCION)
        if (timeNueva >= timeExistente || !inscExistente) {
          if (inscNueva.ID_INSCRIPCION) existing.ID_INSCRIPCION = inscNueva.ID_INSCRIPCION
          if (inscNueva.FECHAINICIO_INSCRIPCION) existing.FECHAINICIO_INSCRIPCION = inscNueva.FECHAINICIO_INSCRIPCION
          if (inscNueva.FECHAFIN_INSCRIPCION) existing.FECHAFIN_INSCRIPCION = inscNueva.FECHAFIN_INSCRIPCION
          if (inscNueva.COSTO_INSCRIPCION) existing.COSTO_INSCRIPCION = inscNueva.COSTO_INSCRIPCION
          if (inscNueva.DETALLE_INSCRIPCION) existing.DETALLE_INSCRIPCION = inscNueva.DETALLE_INSCRIPCION
        }
      } else {
        if (!existing.FECHAINICIO_INSCRIPCION && item.FECHAINICIO_INSCRIPCION) {
          existing.FECHAINICIO_INSCRIPCION = item.FECHAINICIO_INSCRIPCION
        }
        if (!existing.FECHAFIN_INSCRIPCION && item.FECHAFIN_INSCRIPCION) {
          existing.FECHAFIN_INSCRIPCION = item.FECHAFIN_INSCRIPCION
        }
        if (!existing.COSTO_INSCRIPCION && item.COSTO_INSCRIPCION) {
          existing.COSTO_INSCRIPCION = item.COSTO_INSCRIPCION
        }
      }

      if (Array.isArray(item.inscripciones)) {
        if (!Array.isArray(existing.inscripciones)) {
          existing.inscripciones = [...item.inscripciones]
        } else {
          item.inscripciones.forEach((ins: any) => {
            const yaEsta = existing.inscripciones.some((prev: any) => prev.ID_INSCRIPCION && ins.ID_INSCRIPCION && String(prev.ID_INSCRIPCION) === String(ins.ID_INSCRIPCION))
            if (!yaEsta) existing.inscripciones.push(ins)
          })
        }
      }
    }
  }

  for (const person of map.values()) {
    person.historial_sanciones = sanitizarHistorialSanciones(person.historial_sanciones)
    if (person.historial_sanciones.length > 0) {
      const masActual = person.historial_sanciones[0]
      if (masActual.inicio && (!person.FECHAINICIO_SANCION || person.FECHAINICIO_SANCION === 'No registrada')) {
        person.FECHAINICIO_SANCION = masActual.inicio
      }
      if (masActual.fin && (!person.FECHAFIN_SANCION || person.FECHAFIN_SANCION === 'No registrada')) {
        person.FECHAFIN_SANCION = masActual.fin
      }
      if (masActual.detalle && (!person.DETALLE_SANCION || person.DETALLE_SANCION.includes(' | '))) {
        person.DETALLE_SANCION = masActual.detalle
      }

      const esVet = Boolean(
        (Array.isArray(person.vetos) && person.vetos.some((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2')) ||
        (Array.isArray(person.raw?.vetos) && person.raw.vetos.some((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2')) ||
        person.ESTADO_VETO === 2 ||
        person.ESTADO_VETO === '2' ||
        person.estado_veto === 2 ||
        person.estado_veto === '2' ||
        person.TIENE_VETO_PERMANENTE === 1 ||
        person.TIENE_VETO_PERMANENTE === '1' ||
        masActual.ESTADO_VETO === 2 ||
        masActual.ESTADO_VETO === '2' ||
        masActual.estado_veto === 2 ||
        masActual.estado_veto === '2' ||
        masActual.fin === 'Indefinido'
      )

      const esSinSancionExplicito = Boolean(
        person.sancion === 0 ||
        person.sancion === '0' ||
        person.TIENE_SANCION === 0 ||
        person.TIENE_SANCION === '0' ||
        person.ESTADO_SANCION === 0 ||
        person.ESTADO_SANCION === '0' ||
        person.estado_sancion === 0 ||
        person.estado_sancion === '0'
      )

      if (esVet) {
        person.TIENE_SANCION = 1
        person.ESTADO_SANCION = 2
        if (!person.ESTADO || !person.ESTADO.toLowerCase().includes('vet')) {
          person.ESTADO = 'Vetado de por vida'
        }
      } else if (!esSinSancionExplicito && (
        person.sancion === 1 ||
        person.sancion === '1' ||
        person.TIENE_SANCION === 1 ||
        person.TIENE_SANCION === '1' ||
        person.ESTADO_SANCION === 1 ||
        person.ESTADO_SANCION === '1' ||
        person.estado_sancion === 1 ||
        person.estado_sancion === '1' ||
        masActual.estado === 1 ||
        masActual.estado === '1' ||
        masActual.ESTADO_SANCION === 1 ||
        masActual.ESTADO_SANCION === '1'
      )) {
        person.TIENE_SANCION = 1
        person.ESTADO_SANCION = 1
        if (!person.ESTADO || !person.ESTADO.toLowerCase().includes('vet')) {
          person.ESTADO = 'Sancionado'
        }
      }
    }
  }

  return Array.from(map.values())
}

interface InfoPaginacion {
  items: any[]
  total: number
  perPage: number
  lastPage: number
  currentPage: number
}

const extraerInfoPaginacion = (res: any): InfoPaginacion => {
  let items: any[] = []
  let total = 0
  let perPage = 10
  let lastPage = 1
  let currentPage = 1

  if (!res) {
    return { items, total, perPage, lastPage, currentPage }
  }

  if (Array.isArray(res)) {
    items = res
  } else if (Array.isArray(res?.data?.data)) {
    items = res.data.data
  } else if (Array.isArray(res?.data)) {
    items = res.data
  } else if (Array.isArray(res?.personas?.data)) {
    items = res.personas.data
  } else if (Array.isArray(res?.personas)) {
    items = res.personas
  } else if (Array.isArray(res?.usuarios?.data)) {
    items = res.usuarios.data
  } else if (Array.isArray(res?.usuarios)) {
    items = res.usuarios
  }

  const metaSource =
    (res?.meta && typeof res.meta === 'object') ? res.meta :
    (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) ? res.data :
    (res?.personas && typeof res.personas === 'object' && !Array.isArray(res.personas)) ? res.personas :
    (typeof res === 'object' && !Array.isArray(res)) ? res :
    null

  if (metaSource) {
    if (metaSource.total !== undefined && metaSource.total !== null) {
      total = Number(metaSource.total) || 0
    }
    if (metaSource.per_page !== undefined && metaSource.per_page !== null) {
      perPage = Number(metaSource.per_page) || 10
    } else if (metaSource.perpage !== undefined && metaSource.perpage !== null) {
      perPage = Number(metaSource.perpage) || 10
    }
    if (metaSource.last_page !== undefined && metaSource.last_page !== null) {
      lastPage = Number(metaSource.last_page) || 1
    }
    if (metaSource.current_page !== undefined && metaSource.current_page !== null) {
      currentPage = Number(metaSource.current_page) || 1
    }
  }

  items = deduplicarPersonas(items)

  if (total === 0 && items.length > 0) {
    total = items.length
  } else if (total > 0 && total <= perPage) {
    total = items.length
  }
  if (lastPage === 1 && total > 0 && perPage > 0) {
    lastPage = Math.max(1, Math.ceil(total / perPage))
  }

  return { items, total, perPage, lastPage, currentPage }
}

const usePersonas = (autoFetch: boolean = true) => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  // Permisos centralizados para Gestión de Usuarios - Registrados
  const canCrearUsuario = canDoAction('btn_crear_usuario_gestion_usuario')
  const canGuardarUsuario = canDoAction('btn_guardar_gestion_usuario')
  const canVerDetalles = canDoAction('btn_mostrar_info_gestion_usuario')
  const canEditarUsuario = canDoAction('btn_editar_usuario_gestion_usuario')
  const canActualizarUsuario = canDoAction('btn_actualizar_gestion_usuario')
  const canEliminarUsuario = canDoAction('btn_eliminar_usuario_gestion_usuario')
  const canRenovarUsuario = canDoAction('btn_renovar_usuario_gestion_usuario')
  const canGuardarRenovacion = canDoAction('btn_guardar_renovacion_gestion_usuario')
  const tieneAcciones = canEditarUsuario || canEliminarUsuario || canRenovarUsuario

  const [personas, setPersonas] = useState<(Persona | any)[]>([])
  const [personasNuevas, setPersonasNuevas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [porPagina, setPorPagina] = useState(10)
  const [columnFilters, setColumnFilters] = useState<PersonaColumnFilters>({})
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [tableKey, setTableKey] = useState<number>(0)
  const columnFiltersRef = useRef<PersonaColumnFilters>({})
  const currentSearchRef = useRef<string>('')
  const lastSearchTermRef = useRef<string>('')
  const searchDebounceRef = useRef<any>(null)
  const paginaActualRef = useRef<number>(paginaActual)
  const porPaginaRef = useRef<number>(porPagina)

  useEffect(() => {
    paginaActualRef.current = paginaActual
  }, [paginaActual])

  useEffect(() => {
    porPaginaRef.current = porPagina
  }, [porPagina])

  const [modalRegister, setModalRegister] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Persona | any | null>(null)
  const [details, setDetails] = useState<(number | string)[]>([])

  const toggleDetails = (id: number | string) => {
    if (!canVerDetalles) return
    setDetails((prev) => (prev.includes(id) ? [] : [id]))
  }

  const handleAbrirEditar = (item: any) => {
    if (!canEditarUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para editar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }
    setSelectedUser(item)
    setModalEdit(true)
  }

  const handleAbrirCrear = () => {
    if (!canCrearUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }
    setModalRegister(true)
  }


  const ordenarPorFechaReciente = (lista: any[]) => {
    if (!Array.isArray(lista)) return []
    const deduped = deduplicarPersonas(lista)
    return [...deduped].sort((a: any, b: any) => {
      const inscA = extraerInscripcion(a)
      const inscB = extraerInscripcion(b)
      const rawA = a?.FECHAINICIO_INSCRIPCION ?? inscA?.FECHAINICIO_INSCRIPCION ?? a?.FECHAREGISTRO_PERSONA ?? ''
      const rawB = b?.FECHAINICIO_INSCRIPCION ?? inscB?.FECHAINICIO_INSCRIPCION ?? b?.FECHAREGISTRO_PERSONA ?? ''

      const timeA = parseDateFallback(rawA)
      const timeB = parseDateFallback(rawB)

      if (timeA !== timeB) {
        return timeB - timeA
      }

      const idA = Number(a?.ID_PERSONA || a?.id || 0)
      const idB = Number(b?.ID_PERSONA || b?.id || 0)
      return idB - idA
    })
  }

  const fetchPersonas = useCallback(
    (
      page?: number,
      perPage?: number,
      search?: string,
      clearSearch?: boolean,
      customFilters?: PersonaColumnFilters
    ) => {
      const isSearchParamGiven = typeof search === 'string'

      let areFiltersChanged = false
      if (customFilters !== undefined) {
        const prevF = JSON.stringify(columnFiltersRef.current)
        const nextF = JSON.stringify(customFilters)
        if (prevF !== nextF) {
          areFiltersChanged = true
          columnFiltersRef.current = customFilters
          setColumnFilters(customFilters)
        }
      }

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }

      const executeFetch = async () => {
        const targetUiPage =
          typeof page === 'number' && page > 0 ? page : (typeof page === 'number' ? 1 : paginaActualRef.current)
        let validUiPage = targetUiPage
        const S = typeof perPage === 'number' && perPage > 0 ? perPage : porPaginaRef.current

        if (clearSearch) {
          currentSearchRef.current = ''
          lastSearchTermRef.current = ''
          columnFiltersRef.current = {}
          setColumnFilters({})
          setSearchTerm('')
          setTableKey((k) => k + 1)
          setDetails([])
        } else if (isSearchParamGiven) {
          const trimmed = search.trim()
          currentSearchRef.current = trimmed
          setSearchTerm(trimmed)
          validUiPage = 1
        }

        if (areFiltersChanged) {
          validUiPage = 1
        }

        const filters = columnFiltersRef.current || {}
        const actualSearch = currentSearchRef.current || undefined
        const estadoFilter = (filters.estado || '').trim()
        const sancionadoFilter = (filters.sancionado || '').trim()

        setLoading(true)
        setErrorMsg(null)

        try {
          // Mapeo de filtros: estado (1=Activo, 0=Inactivo) y sanción (1=Con sanción, 0=Sin sanción)
          let estadoParam: number | string | undefined = undefined
          if (estadoFilter === 'Activo' || estadoFilter === '1') {
            estadoParam = '1'
          } else if (estadoFilter === 'Inactivo' || estadoFilter === '0') {
            estadoParam = '0'
          }

          let sancionParam: number | string | undefined = undefined
          if (sancionadoFilter === 'Con sanción' || sancionadoFilter === 'Sancionado' || sancionadoFilter === '1') {
            sancionParam = '1'
          } else if (sancionadoFilter === 'Sin sanción' || sancionadoFilter === '0') {
            sancionParam = '0'
          }

          // Determinar término para búsqueda en backend a través de la barra de búsqueda general
          const genF = (actualSearch || '').trim()
          const backendTerm: string | undefined = genF || undefined

          // Petición directa al backend con paginación y filtros nativos (estado y sanción)
          let backendPageToFetch = validUiPage
          let res = await listarPersonas(backendPageToFetch, S, backendTerm, estadoParam, sancionParam)
          let info = extraerInfoPaginacion(res)

          let pageItems = info.items || []
          let itemsValidos = pageItems.filter((item: any) => !debeExcluirDeRegistrados(item))

          // Si filtramos por Inactivo (o un filtro activo) y la página retornada quedó vacía por exclusiones de solicitudes pendientes
          // pero el backend reporta que hay más páginas disponibles, avanzamos automáticamente a la siguiente página con datos reales
          if (itemsValidos.length === 0 && info.total > 0 && backendPageToFetch < info.lastPage) {
            backendPageToFetch++
            const nextRes = await listarPersonas(backendPageToFetch, S, backendTerm, estadoParam, sancionParam)
            const nextInfo = extraerInfoPaginacion(nextRes)
            const nextValidos = (nextInfo.items || []).filter((item: any) => !debeExcluirDeRegistrados(item))
            if (nextValidos.length > 0) {
              itemsValidos = nextValidos
              info = nextInfo
            }
          }

          const totalItems = info.total > 0 ? info.total : itemsValidos.length
          const totalPages = info.lastPage > 0 ? info.lastPage : Math.max(1, Math.ceil(totalItems / S))
          const currentPageNum = info.currentPage > 0 ? info.currentPage : validUiPage

          setPersonas(ordenarPorFechaReciente(itemsValidos))
          setPaginaActual(currentPageNum)
          setTotalPaginas(totalPages)
          setTotalRegistros(totalItems)
          setPorPagina(S)
        } catch (error: any) {
          console.error('[usePersonas] Error al obtener clientes:', error)
          const msg = formatApiError(error, 'Error al obtener la lista de clientes.')
          setErrorMsg(msg)
        } finally {
          setLoading(false)
        }
      }

      if (!clearSearch && (isSearchParamGiven || areFiltersChanged)) {
        searchDebounceRef.current = setTimeout(executeFetch, 350)
      } else {
        return executeFetch()
      }
    },
    [],
  )

  const handleRecargar = useCallback(async () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    await fetchPersonas(1, porPaginaRef.current, '', true, {})
  }, [fetchPersonas])

  const handleColumnFilterChange = useCallback(
    (filters: PersonaColumnFilters) => {
      fetchPersonas(1, porPaginaRef.current, undefined, false, filters)
    },
    [fetchPersonas],
  )


  const handleCrearPersonaNew = async (data: any) => {
    if (!canGuardarUsuario && !canCrearUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_gestion_usuario')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    setGuardando(true)
    try {
      if (data instanceof FormData) {
        const nom = data.get('NOMBRE_PERSONA')
        if (typeof nom === 'string') data.set('NOMBRE_PERSONA', nom.trim().toUpperCase())
        const ape = data.get('APELLIDO_PERSONA')
        if (typeof ape === 'string') data.set('APELLIDO_PERSONA', ape.trim().toUpperCase())
      }
      await PersonasNueva(data)
      await fetchPersonas(1, porPagina, undefined, true)
      return true
    } catch (e: any) {
      console.error('Error detallado de backend al registrar con personaNew:', e?.response?.data || e)
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: formatApiError(e, 'Error al registrar el usuario.'),
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    } finally {
      setGuardando(false)
    }
  }

  const fetchPersonasNuevas = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const response = await PersonaNueva(true)
      let list: any[] = []
      if (Array.isArray(response)) {
        list = response
      } else if (Array.isArray(response?.data?.data)) {
        list = response.data.data
      } else if (Array.isArray(response?.data)) {
        list = response.data
      } else if (Array.isArray(response?.personas)) {
        list = response.personas
      }
      setPersonasNuevas(list)
    } catch (error: any) {
      const msg = formatApiError(error, 'Error al obtener personas nuevas/renovaciones.')
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCrearPersona = async (personaData: Persona): Promise<boolean> => {
    if (!canGuardarUsuario && !canCrearUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_gestion_usuario')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    setGuardando(true)
    try {
      const payload = {
        ...personaData,
        NOMBRE_PERSONA: personaData.NOMBRE_PERSONA ? personaData.NOMBRE_PERSONA.trim().toUpperCase() : '',
        APELLIDO_PERSONA: personaData.APELLIDO_PERSONA ? personaData.APELLIDO_PERSONA.trim().toUpperCase() : '',
      }
      await CrearPersonas(payload)
      await fetchPersonas(1, porPagina, undefined, true)
      return true
    } catch (error: any) {
      console.error('Error detallado de backend al registrar persona:', error?.response?.data || error)
      const msg = formatApiError(error, 'No se pudo registrar la persona')
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    } finally {
      setGuardando(false)
    }
  }

  const handleActualizarPersona = async (
    id: string | number,
    personaData: any,
  ): Promise<boolean> => {
    if (
      !canActualizarUsuario &&
      !canEditarUsuario
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const tienePermiso = await verificarAccionEnServidor('btn_actualizar_gestion_usuario')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    setGuardando(true)
    try {
      if (personaData instanceof FormData) {
        const nom = personaData.get('NOMBRE_PERSONA')
        if (typeof nom === 'string') personaData.set('NOMBRE_PERSONA', nom.trim().toUpperCase())
        const ape = personaData.get('APELLIDO_PERSONA')
        if (typeof ape === 'string') personaData.set('APELLIDO_PERSONA', ape.trim().toUpperCase())
        await ActualizarPersonaNueva(id, personaData)
      } else {
        const payload = {
          ...personaData,
          NOMBRE_PERSONA: personaData.NOMBRE_PERSONA ? String(personaData.NOMBRE_PERSONA).trim().toUpperCase() : '',
          APELLIDO_PERSONA: personaData.APELLIDO_PERSONA ? String(personaData.APELLIDO_PERSONA).trim().toUpperCase() : '',
        }
        await ActualizarPersonaNueva(id, payload)
      }
      await fetchPersonas(paginaActual, porPagina)
      return true
    } catch (error: any) {
      console.error('Error detallado de backend al actualizar persona:', error?.response?.data || error)
      const msg = formatApiError(error, 'No se pudo actualizar la persona')
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    } finally {
      setGuardando(false)
    }
  }

  const handleActualizarEstado = async (
    id: string | number,
    nuevoEstado: string | number,
  ): Promise<boolean> => {
    try {
      await PersonaEstado(id, { ESTADO_PERSONA: nuevoEstado })
      Swal.fire({
        icon: 'success',
        title: '¡Estado actualizado!',
        text: 'El estado del usuario se actualizó correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })
      await fetchPersonas(paginaActual, porPagina)
      return true
    } catch (error: any) {
      const msg = formatApiError(error, 'No se pudo actualizar el estado')
      Swal.fire({
        icon: 'error',
        title: 'Error de estado',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }
  }

  const obtenerPersona = async (id: string | number) => {
    try {
      const res = await verPersonas(id)
      return res?.data || res
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al consultar',
        text: 'No se pudo consultar la información del usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return null
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchPersonas(1)
    }
  }, [autoFetch, fetchPersonas])



  const handleEliminarPersona = async (id: string | number): Promise<boolean> => {
    if (!canEliminarUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const tienePermiso = await verificarAccionEnServidor('btn_eliminar_usuario_gestion_usuario')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    setGuardando(true)
    try {
      await EliminarPersona(id)
      await fetchPersonas(paginaActual, porPagina)
      return true
    } catch (error: any) {
      console.error('Error al eliminar persona:', error)
      const errStr = JSON.stringify(error?.response?.data || error?.message || '').toLowerCase()
      let msg = formatApiError(error, 'No se pudo eliminar el usuario')

      if (
        errStr.includes('prestamo') ||
        errStr.includes('préstamo') ||
        errStr.includes('foreign key') ||
        errStr.includes('constraint') ||
        errStr.includes('1451') ||
        errStr.includes('tab_prestamo')
      ) {
        msg = 'No se puede eliminar el usuario porque se encuentra en préstamo o tiene registros asociados en el sistema.'
      }

      Swal.fire({
        icon: 'error',
        title: 'No se puede eliminar',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    personas,
    personasNuevas,
    loading,
    guardando,
    errorMsg,
    fetchPersonas,
    fetchPersonasNuevas,
    handleCrearPersona,
    handleActualizarPersona,
    handleActualizarEstado,
    handleEliminarPersona,
    handleCrearPersonaNew,
    obtenerPersona,
    modalRegister,
    setModalRegister,
    modalEdit,
    setModalEdit,
    selectedUser,
    setSelectedUser,
    details,
    setDetails,
    toggleDetails,
    handleAbrirEditar,
    paginaActual,
    totalPaginas,
    totalRegistros,
    porPagina,
    setPaginaActual,
    setPorPagina,
    columnFilters,
    setColumnFilters,
    handleColumnFilterChange,
    searchTerm,
    setSearchTerm,
    tableKey,
    setTableKey,
    handleRecargar,
    handleAbrirCrear,
    canCrearUsuario,
    canGuardarUsuario,
    canVerDetalles,
    canEditarUsuario,
    canActualizarUsuario,
    canEliminarUsuario,
    canRenovarUsuario,
    canGuardarRenovacion,
    tieneAcciones,
    verificarAccionEnServidor,
  }
}

export { usePersonas }
export default usePersonas
