
// Utilidades para formateo y manipulación de fechas en la aplicación.
export const formatFecha = (f: any): string => {
  if (!f) return 'No registrada'
  if (f === 'No registrada' || f === 'Sin inscripción') return f
  if (typeof f === 'string') {
    if (
      f.startsWith('0000-00-00')
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

export const calcularFinUnAnio = (fecha: any): string | null => {
  if (!fecha) return null
  try {
    const s = String(fecha).trim()
    const clean = s.includes('T') ? s.split('T')[0] : s.includes(' ') ? s.split(' ')[0] : s
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, d] = clean.split('-')
      const nextYear = parseInt(y, 10) + 1
      return `${nextYear}-${m}-${d}`
    }
  } catch {
    return null
  }
  return null
}

// Convierte un string de fecha (YYYY-MM-DD, ISO o DD/MM/YYYY) a un objeto Date local
// con hora a mediodía para evitar cualquier desfase horario en CDatePicker.
export const aFechaLocal = (str?: string | null): Date | undefined => {
  if (!str) return undefined
  const match = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const y = Number(match[1])
    const m = Number(match[2])
    const d = Number(match[3])
    return new Date(y, m - 1, d, 12, 0, 0)
  }
  const esMatch = String(str).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
  if (esMatch) {
    const d = Number(esMatch[1])
    const m = Number(esMatch[2])
    const y = Number(esMatch[3])
    return new Date(y, m - 1, d, 12, 0, 0)
  }
  return undefined
}

// Normaliza cualquier valor proveniente de un CDatePicker (Date, string o null)
// al formato estandarizado YYYY-MM-DD esperado por los modelos y la API.
export const parseDatePickerValue = (val: Date | string | null): string => {
  if (!val) return ''
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return ''
    if (val.getHours() >= 18) {
      const y = val.getUTCFullYear()
      const m = String(val.getUTCMonth() + 1).padStart(2, '0')
      const d = String(val.getUTCDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    const y = val.getFullYear()
    const m = String(val.getMonth() + 1).padStart(2, '0')
    const d = String(val.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof val === 'string') {
    const isoMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`

    const esMatch = val.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
    if (esMatch) {
      const d = esMatch[1].padStart(2, '0')
      const m = esMatch[2].padStart(2, '0')
      const y = esMatch[3]
      return `${y}-${m}-${d}`
    }

    const parsed = new Date(val)
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear()
      const m = String(parsed.getMonth() + 1).padStart(2, '0')
      const d = String(parsed.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
  }
  return ''
}

