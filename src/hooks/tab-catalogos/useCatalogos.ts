import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setCatalogos, CatalogosPersona } from '@/slices/personaSlice'
import { ListarEstadoCivil } from '@/Service/tab/EstadoCivil'
import { ListarGenero } from '@/Service/tab/Genero'
import { ListarNacionalidad } from '@/Service/tab/Nacionalidad'
import { listarTipoIdentificacion } from '@/Service/tab/TipoIdentificacion'
import { TabTipoIdentificacion } from '@/models/tab/tipoIdentificacion.model'
import { TabNacionalidad } from '@/models/tab/nacionalidad.model'
import { TabGenero } from '@/models/tab/genero.model'
import { TabEstadoCivil } from '@/models/tab/estadoCivil.model'

// Promesa y bandera compartida a nivel de módulo para evitar peticiones duplicadas simultáneas
let inFlightCatalogosPromise: Promise<void> | null = null
let catalogosFetchedOnce = false

/**
 * Hook canónico para la gestión de catálogos auxiliares de persona.
 * Conectado directamente a personaSlice en Redux Toolkit (Única Fuente de Verdad).
 * Consume directamente las entidades reales de base de datos sin intermediarios.
 */
export const useCatalogos = (autoFetch: boolean = true) => {
  const dispatch = useDispatch()
  const catalogos = useSelector((state: RootState) => state.personas.catalogos)
  const [loading, setLoading] = useState(false)

  const fetchCatalogos = useCallback(
    async (forceRefresh: boolean = false) => {
      const yaCargados =
        catalogos.tiposIdentificacion.length > 0 &&
        catalogos.nacionalidades.length > 0 &&
        catalogos.generos.length > 0 &&
        catalogos.estadosCiviles.length > 0

      if (!forceRefresh && (yaCargados || catalogosFetchedOnce)) {
        return
      }

      if (inFlightCatalogosPromise) {
        return inFlightCatalogosPromise
      }

      catalogosFetchedOnce = true
      setLoading(true)

      inFlightCatalogosPromise = (async () => {
        try {
          const [resTipos, resNac, resGen, resEst] = await Promise.allSettled([
            listarTipoIdentificacion(),
            ListarNacionalidad(),
            ListarGenero(),
            ListarEstadoCivil(),
          ])

          const nuevosCatalogos: Partial<CatalogosPersona> = {}

          if (resTipos.status === 'fulfilled') {
            const list = (resTipos.value?.data || resTipos.value) as TabTipoIdentificacion[]
            if (Array.isArray(list) && list.length > 0) {
              nuevosCatalogos.tiposIdentificacion = list
            }
          }

          if (resNac.status === 'fulfilled') {
            const list = (resNac.value?.data || resNac.value) as TabNacionalidad[]
            if (Array.isArray(list) && list.length > 0) {
              nuevosCatalogos.nacionalidades = list
            }
          }

          if (resGen.status === 'fulfilled') {
            const list = (resGen.value?.data || resGen.value) as TabGenero[]
            if (Array.isArray(list) && list.length > 0) {
              nuevosCatalogos.generos = list
            }
          }

          if (resEst.status === 'fulfilled') {
            const list = (resEst.value?.data || resEst.value) as TabEstadoCivil[]
            if (Array.isArray(list) && list.length > 0) {
              nuevosCatalogos.estadosCiviles = list
            }
          }

          dispatch(setCatalogos(nuevosCatalogos))
        } catch (err) {
          console.error('[useCatalogos] Error al cargar catálogos de persona:', err)
        } finally {
          inFlightCatalogosPromise = null
          setLoading(false)
        }
      })()

      return inFlightCatalogosPromise
    },
    [dispatch, catalogos],
  )

  useEffect(() => {
    const yaCargados =
      catalogos.tiposIdentificacion.length > 0 &&
      catalogos.nacionalidades.length > 0 &&
      catalogos.generos.length > 0 &&
      catalogos.estadosCiviles.length > 0

    if (
      autoFetch &&
      !catalogosFetchedOnce &&
      !yaCargados &&
      !loading &&
      !inFlightCatalogosPromise
    ) {
      fetchCatalogos()
    }
  }, [autoFetch, catalogos.tiposIdentificacion.length, loading, fetchCatalogos])

  return {
    catalogos,
    tiposIdentificacion: catalogos.tiposIdentificacion,
    nacionalidades: catalogos.nacionalidades,
    generos: catalogos.generos,
    estadosCiviles: catalogos.estadosCiviles,
    loading,
    fetchCatalogos,
  }
}

export default useCatalogos
