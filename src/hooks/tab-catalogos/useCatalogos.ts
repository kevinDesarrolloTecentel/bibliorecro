import { useState, useEffect, useCallback } from 'react'
import { ListarEstadoCivil } from '@/Service/tab/EstadoCivil'
import { ListarGenero } from '@/Service/tab/Genero'
import { ListarNacionalidad } from '@/Service/tab/Nacionalidad'
import { listarTipoIdentificacion } from '@/Service/tab/TipoIdentificacion'
import { CatalogoItem } from '@/models/tab/catalogo.model'
import { TipoIdentificacion } from '@/models/tab/tipoIdentificacion.model'
import { Nacionalidad } from '@/models/tab/nacionalidad.model'
import { Genero } from '@/models/tab/genero.model'
import { EstadoCivil } from '@/models/tab/estadoCivil.model'

export type { CatalogoItem }

export interface CatalogosPersonaData {
  tiposId: CatalogoItem[]
  nacionalidades: CatalogoItem[]
  generos: CatalogoItem[]
  estadosCiviles: CatalogoItem[]
}

const defaultCatalogos: CatalogosPersonaData = {
  tiposId: [
    { id: 1, nombre: 'Cédula' },
    { id: 2, nombre: 'Pasaporte' },
  ],
  nacionalidades: [
    { id: 1, nombre: 'Ecuatoriana' },
    { id: 2, nombre: 'Extranjera' },
  ],
  generos: [
    { id: 1, nombre: 'Masculino' },
    { id: 2, nombre: 'Femenino' },
  ],
  estadosCiviles: [
    { id: 1, nombre: 'Soltero/a' },
    { id: 2, nombre: 'Casado/a' },
  ],
}

let cachedCatalogos: CatalogosPersonaData | null = null
let pendingCatalogosPromise: Promise<CatalogosPersonaData> | null = null
const listeners = new Set<() => void>()

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch (e) {
      console.error('Error al notificar listener de catálogos persona:', e)
    }
  })
}

export const clearCatalogosPersonaCache = () => {
  cachedCatalogos = null
  pendingCatalogosPromise = null
  notifyListeners()
}

export const fetchCatalogosPersonaData = async (
  forceRefresh: boolean = false,
): Promise<CatalogosPersonaData> => {
  if (!forceRefresh && cachedCatalogos) {
    return cachedCatalogos
  }
  if (!forceRefresh && pendingCatalogosPromise) {
    return pendingCatalogosPromise
  }

  pendingCatalogosPromise = (async () => {
    try {
      const [resTipos, resNac, resGen, resEst] = await Promise.allSettled([
        listarTipoIdentificacion(),
        ListarNacionalidad(),
        ListarGenero(),
        ListarEstadoCivil(),
      ])

      const data: CatalogosPersonaData = {
        tiposId: cachedCatalogos?.tiposId || defaultCatalogos.tiposId,
        nacionalidades: cachedCatalogos?.nacionalidades || defaultCatalogos.nacionalidades,
        generos: cachedCatalogos?.generos || defaultCatalogos.generos,
        estadosCiviles: cachedCatalogos?.estadosCiviles || defaultCatalogos.estadosCiviles,
      }

      if (resTipos.status === 'fulfilled') {
        const list = (resTipos.value?.data || resTipos.value) as TipoIdentificacion[]
        if (Array.isArray(list) && list.length > 0) {
          data.tiposId = list.map((item) => ({
            id: item.ID_TIPOIDENTIFICACION ?? (item as any).id ?? '',
            nombre: item.NOMBRE_TIPOIDENTIFICACION ?? (item as any).nombre ?? '',
          }))
        }
      }

      if (resNac.status === 'fulfilled') {
        const list = (resNac.value?.data || resNac.value) as Nacionalidad[]
        if (Array.isArray(list) && list.length > 0) {
          data.nacionalidades = list.map((item) => ({
            id: item.ID_NACIONALIDAD ?? (item as any).id ?? '',
            nombre: item.NOMBRE_NACIONALIDAD ?? (item as any).nombre ?? '',
          }))
        }
      }

      if (resGen.status === 'fulfilled') {
        const list = (resGen.value?.data || resGen.value) as Genero[]
        if (Array.isArray(list) && list.length > 0) {
          data.generos = list.map((item) => ({
            id: item.ID_GENERO ?? (item as any).id ?? (item as any).ID ?? '',
            nombre: item.NOMBRE_GENERO ?? (item as any).nombre ?? (item as any).genero ?? '',
          }))
        }
      }

      if (resEst.status === 'fulfilled') {
        const list = (resEst.value?.data || resEst.value) as EstadoCivil[]
        if (Array.isArray(list) && list.length > 0) {
          data.estadosCiviles = list.map((item) => ({
            id: item.ID_ESTADOCIVIL ?? (item as any).id ?? '',
            nombre: item.NOMBRE_ESTADOCIVIL ?? (item as any).nombre ?? '',
          }))
        }
      }

      cachedCatalogos = data
      notifyListeners()
      return data
    } catch (err) {
      console.error('Error al cargar catálogos de persona:', err)
      return cachedCatalogos || defaultCatalogos
    } finally {
      pendingCatalogosPromise = null
    }
  })()

  return pendingCatalogosPromise
}

export const useCatalogos = (autoFetch: boolean = true) => {
  const [, setTick] = useState(0)

  useEffect(() => {
    const update = () => setTick((t) => t + 1)
    listeners.add(update)
    return () => {
      listeners.delete(update)
    }
  }, [])

  const fetchCatalogos = useCallback(async (forceRefresh: boolean = false) => {
    if (!forceRefresh && cachedCatalogos) {
      return cachedCatalogos
    }
    return fetchCatalogosPersonaData(forceRefresh)
  }, [])

  useEffect(() => {
    if (autoFetch && !cachedCatalogos && !pendingCatalogosPromise) {
      fetchCatalogosPersonaData()
    }
  }, [autoFetch])

  return {
    tiposId: cachedCatalogos?.tiposId || defaultCatalogos.tiposId,
    nacionalidades: cachedCatalogos?.nacionalidades || defaultCatalogos.nacionalidades,
    generos: cachedCatalogos?.generos || defaultCatalogos.generos,
    estadosCiviles: cachedCatalogos?.estadosCiviles || defaultCatalogos.estadosCiviles,
    loading: !cachedCatalogos,
    fetchCatalogos,
  }
}

export default useCatalogos
