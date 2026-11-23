import { useState, useCallback, useEffect } from 'react'
import { UsuActEG } from '@/Service/tab/Persona'
import { RangoEdadItem } from '@/slices/dashboardSlice'

export type { RangoEdadItem }

export const useEdadGenero = () => {
  const [rangoEdadData, setRangoEdadData] = useState<RangoEdadItem[] | undefined>(undefined)
  const [loadingRangoEdad, setLoadingRangoEdad] = useState<boolean>(false)

  const fetchRangoEdad = useCallback(async () => {
    setLoadingRangoEdad(true)
    try {
      const res = await UsuActEG()
      const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      if (raw.length > 0) {
        setRangoEdadData(raw)
      }
    } catch (e) {
      console.warn('[useEdadGenero] Error al consultar distribución por edad y género:', e)
    } finally {
      setLoadingRangoEdad(false)
    }
  }, [])

  useEffect(() => {
    fetchRangoEdad()
  }, [fetchRangoEdad])

  return {
    rangoEdadData,
    loadingRangoEdad,
    fetchRangoEdad,
  }
}

export default useEdadGenero