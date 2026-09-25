
import { ListarEstadoCivil } from '@/Service/tab/EstadoCivil'
import { ListarGenero } from '@/Service/tab/Genero'
import { ListarNacionalidad } from '@/Service/tab/Nacionalidad'
import { useState, useEffect, useCallback } from 'react'

export interface CatalogoItem {
  id: number | string
  nombre: string
}

export const useCatalogos = (autoFetch: boolean = true) => {
  const [loading, setLoading] = useState(false)
  const [tiposId, setTiposId] = useState<CatalogoItem[]>([
    { id: 1, nombre: 'Cédula' },
    { id: 2, nombre: 'Pasaporte' },
  ])
  const [nacionalidades, setNacionalidades] = useState<CatalogoItem[]>([
    { id: 1, nombre: 'Ecuatoriana' },
    { id: 2, nombre: 'Extranjera' },
  ])
  const [generos, setGeneros] = useState<CatalogoItem[]>([
    { id: 1, nombre: 'Masculino' },
    { id: 2, nombre: 'Femenino' },
  ])
  const [estadosCiviles, setEstadosCiviles] = useState<CatalogoItem[]>([
    { id: 1, nombre: 'Soltero/a' },
    { id: 2, nombre: 'Casado/a' },
  ])

  const fetchCatalogos = useCallback(async () => {
    setLoading(true)
    try {
      const [resTipos, resNac, resGen, resEst] = await Promise.allSettled([
        (true),
        ListarNacionalidad(),
        ListarGenero(),
        ListarEstadoCivil(),
      ])

      if (resTipos.status === 'fulfilled') {
        const list = resTipos.value?.data || resTipos.value
        if (Array.isArray(list) && list.length > 0) {
          setTiposId(
            list.map((item: any) => ({
              id: item.ID_TIPOIDENTIFICACION,
              nombre: item.NOMBRE_TIPOIDENTIFICACION
            })),
          )
        }
      }

      if (resNac.status === 'fulfilled') {
        const list = resNac.value?.data || resNac.value
        if (Array.isArray(list) && list.length > 0) {
          setNacionalidades(
            list.map((item: any) => ({
              id: item.ID_NACIONALIDAD,
              nombre: item.NOMBRE_NACIONALIDAD
            })),
          )
        }
      }

      if (resGen.status === 'fulfilled') {
        const list = resGen.value?.data || resGen.value
        if (Array.isArray(list) && list.length > 0) {
          setGeneros(
            list.map((item: any) => ({
              id: item.ID_GENERO ?? item.id ?? item.ID,
              nombre: item.NOMBRE_GENERO ?? item.nombre ?? item.genero,
            })),
          )
        }
      }

      if (resEst.status === 'fulfilled') {
        const list = resEst.value?.data || resEst.value
        if (Array.isArray(list) && list.length > 0) {
          setEstadosCiviles(
            list.map((item: any) => ({
              id: item.ID_ESTADOCIVIL,
              nombre: item.NOMBRE_ESTADOCIVIL,
            })),
          )
        }
      }
    } catch (error) {
      console.error('Error al cargar catálogos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchCatalogos()
    }
  }, [autoFetch, fetchCatalogos])

  return {
    tiposId,
    nacionalidades,
    generos,
    estadosCiviles,
    loading,
    fetchCatalogos,
  }
}

export default useCatalogos
