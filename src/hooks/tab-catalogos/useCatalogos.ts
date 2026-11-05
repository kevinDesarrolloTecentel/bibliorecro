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
        listarTipoIdentificacion(),
        ListarNacionalidad(),
        ListarGenero(),
        ListarEstadoCivil(),
      ])

      if (resTipos.status === 'fulfilled') {
        const list = (resTipos.value?.data || resTipos.value) as TipoIdentificacion[]
        if (Array.isArray(list) && list.length > 0) {
          setTiposId(
            list.map((item) => ({
              id: item.ID_TIPOIDENTIFICACION ?? (item as any).id ?? '',
              nombre: item.NOMBRE_TIPOIDENTIFICACION ?? (item as any).nombre ?? '',
            })),
          )
        }
      }

      if (resNac.status === 'fulfilled') {
        const list = (resNac.value?.data || resNac.value) as Nacionalidad[]
        if (Array.isArray(list) && list.length > 0) {
          setNacionalidades(
            list.map((item) => ({
              id: item.ID_NACIONALIDAD ?? (item as any).id ?? '',
              nombre: item.NOMBRE_NACIONALIDAD ?? (item as any).nombre ?? '',
            })),
          )
        }
      }

      if (resGen.status === 'fulfilled') {
        const list = (resGen.value?.data || resGen.value) as Genero[]
        if (Array.isArray(list) && list.length > 0) {
          setGeneros(
            list.map((item) => ({
              id: item.ID_GENERO ?? (item as any).id ?? (item as any).ID ?? '',
              nombre: item.NOMBRE_GENERO ?? (item as any).nombre ?? (item as any).genero ?? '',
            })),
          )
        }
      }

      if (resEst.status === 'fulfilled') {
        const list = (resEst.value?.data || resEst.value) as EstadoCivil[]
        if (Array.isArray(list) && list.length > 0) {
          setEstadosCiviles(
            list.map((item) => ({
              id: item.ID_ESTADOCIVIL ?? (item as any).id ?? '',
              nombre: item.NOMBRE_ESTADOCIVIL ?? (item as any).nombre ?? '',
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
