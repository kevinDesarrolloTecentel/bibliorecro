import { formatFecha } from './dateUtils'
import { parseDateToTimestamp } from '../hooks/tab-persona/useClienteDs'

export interface SancionHistorialItem {
  id?: string | number
  inicio: string
  fin: string
  detalle: string
  estado?: string | number
  rawFin?: string
}

export const sanitizarHistorialSanciones = (lista: any[]): SancionHistorialItem[] => {
  if (!Array.isArray(lista) || lista.length === 0) return []

  const unicos: SancionHistorialItem[] = []

  for (const item of lista) {
    if (!item) continue

    const detalle = (item.DETALLE_SANCION || item.MOTIVO_VETO || item.detalle || '').trim()
    const inicio = formatFecha(item.FECHAINICIO_SANCION || item.FECHA_VETO || item.inicio)
    const esVeto = Number(item.ESTADO_VETO) === 2 || item.TIENE_VETO_PERMANENTE === 1
    const fin = esVeto ? 'Indefinido' : formatFecha(item.FECHAFIN_SANCION || item.fin)
    const id = item.ID_SANCION ?? item.ID_VETO ?? item.id
    const estado = item.ESTADO_VETO ?? item.ESTADO_SANCION ?? item.estado

    // Si no tiene fechas válidas ni es veto indefinido, se descarta para evitar sanciones fantasmas
    const tieneFechasValidas = Boolean(
      (inicio && inicio !== 'No registrada' && inicio !== 'Sin fecha') ||
      (fin && fin !== 'No registrada' && fin !== 'Sin fecha') ||
      fin === 'Indefinido'
    )
    if (!tieneFechasValidas) continue

    const motivoFinal = detalle || 'Sin motivo especificado'

    const sancionItem: SancionHistorialItem = {
      id,
      inicio,
      fin,
      detalle: motivoFinal,
      estado,
      rawFin: item.FECHAFIN_SANCION || item.fin,
    }

    // Evitar duplicados
    const yaExiste = unicos.some((prev) => {
      const hasIdS = sancionItem.id !== undefined && sancionItem.id !== null && String(sancionItem.id).trim() !== ''
      const hasIdPrev = prev.id !== undefined && prev.id !== null && String(prev.id).trim() !== ''

      //Si ambos tienen ID numérico de base de datos
      if (hasIdS && hasIdPrev) {
        return String(sancionItem.id).trim() === String(prev.id).trim()
      }

      // Si no hay ID en uno o ambos para comparar, deben coincidir fecha inicio, fin y detalle
      const mismasFechas = Boolean(sancionItem.inicio && sancionItem.fin && sancionItem.inicio === prev.inicio && sancionItem.fin === prev.fin)
      if (!mismasFechas) return false

      return (sancionItem.detalle || '').toLowerCase().trim() === (prev.detalle || '').toLowerCase().trim()
    })

    if (!yaExiste) {
      unicos.push(sancionItem)
    }
  }

  // Ordenar:
  // Veto permanente
  unicos.sort((a, b) => {
    const getPrio = (item: SancionHistorialItem) => {
      const est = Number(item.estado)
      if (est === 2 || item.fin === 'Indefinido') return 2
      if (est === 1) return 1
      return 0
    }
    const prioA = getPrio(a)
    const prioB = getPrio(b)
    if (prioA !== prioB) return prioB - prioA

    // Por ID numérico descendente
    const idA = Number(a.id) || 0
    const idB = Number(b.id) || 0
    if (idA > 0 && idB > 0 && idA !== idB) {
      return idB - idA
    }

    //  Fallback por fecha descendente
    const tA = parseDateToTimestamp(a.rawFin || a.fin || a.inicio)
    const tB = parseDateToTimestamp(b.rawFin || b.fin || b.inicio)
    return tB - tA
  })

  return unicos
}
