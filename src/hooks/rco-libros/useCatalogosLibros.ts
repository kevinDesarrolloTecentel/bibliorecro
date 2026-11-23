import { useState, useEffect, useCallback } from 'react'
import { CatalogoOption } from '@/slices/libroSlice'
import { Autores, ListarAutorLib } from '@/Service/rco/AutorLib'
import { CatLibros } from '@/Service/rco/CatLib'
import { ListarGeneroLib } from '@/Service/rco/GenLib'
import { ListarEditLib } from '@/Service/rco/EditLib'
import { ListarProveedorLib } from '@/Service/rco/ProveedorLib'
import { listarFormatLib } from '@/Service/rco/FormatLib'
import { ListarTipoLib } from '@/Service/rco/TipLib'

export interface CatalogosLibrosData {
  categorias: CatalogoOption[]
  generos: CatalogoOption[]
  editoriales: CatalogoOption[]
  proveedores: CatalogoOption[]
  formatos: CatalogoOption[]
  tipos: CatalogoOption[]
  autores: CatalogoOption[]
}

export const emptyCatalogos: CatalogosLibrosData = {
  categorias: [],
  generos: [],
  editoriales: [],
  proveedores: [],
  formatos: [],
  tipos: [],
  autores: [],
}

const toArray = (val: any): any[] => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (Array.isArray(val.data)) return val.data
  if (Array.isArray(val.data?.data)) return val.data.data
  if (Array.isArray(val.autores)) return val.autores
  if (Array.isArray(val.categorias)) return val.categorias
  if (Array.isArray(val.generos)) return val.generos
  if (Array.isArray(val.editoriales)) return val.editoriales
  if (Array.isArray(val.proveedores)) return val.proveedores
  if (Array.isArray(val.formatos)) return val.formatos
  if (Array.isArray(val.tipos)) return val.tipos
  return []
}

const fetchAutoresList = async (): Promise<any[]> => {
  try {
    const res = await ListarAutorLib()
    const list = toArray(res)
    if (list.length > 0) return list
  } catch (err) {
    console.warn('ListarAutorLib falló en catálogos, intentando con Autores():', err)
  }

  try {
    const res2 = await Autores()
    return toArray(res2)
  } catch (err) {
    console.warn('Autores() falló en catálogos:', err)
    return []
  }
}

// Caché en memoria compartido (evita saturar el estado global de Redux y previene lag en DevTools)
let cachedCatalogos: CatalogosLibrosData | null = null
let pendingPromise: Promise<CatalogosLibrosData> | null = null
const listeners = new Set<(data: CatalogosLibrosData) => void>()

export const clearCatalogosCache = () => {
  cachedCatalogos = null
  pendingPromise = null
}

export const fetchCatalogosData = async (
  forceRefresh: boolean = false,
): Promise<CatalogosLibrosData> => {
  if (!forceRefresh && cachedCatalogos) {
    return cachedCatalogos
  }
  if (!forceRefresh && pendingPromise) {
    return pendingPromise
  }

  pendingPromise = (async () => {
    try {
      const [
        resCat,
        resGen,
        resEdit,
        resProv,
        resForm,
        resTipo,
        resAut,
      ] = await Promise.allSettled([
        CatLibros(),
        ListarGeneroLib(),
        ListarEditLib(),
        ListarProveedorLib(),
        listarFormatLib(),
        ListarTipoLib(),
        fetchAutoresList(),
      ])

      const data: CatalogosLibrosData = {
        categorias: [],
        generos: [],
        editoriales: [],
        proveedores: [],
        formatos: [],
        tipos: [],
        autores: [],
      }

      if (resCat.status === 'fulfilled') {
        const list = toArray(resCat.value)
        data.categorias = list
          .map((c: any) => ({
            value: c.ID_CATEGORIA,
            label: String(c.NOMBRE_CATEGORIA || '').trim(),
          }))
          .filter((c) => c.value !== undefined && c.value !== null && c.value !== '' && c.label !== '')
      }

      if (resGen.status === 'fulfilled') {
        const list = toArray(resGen.value)
        data.generos = list
          .map((g: any) => ({
            value: g.ID_RCOGENERO,
            label: String(g.NOMBRE_RCOGENERO || '').trim(),
          }))
          .filter((g) => g.value !== undefined && g.value !== null && g.value !== '' && g.label !== '')
      }

      if (resEdit.status === 'fulfilled') {
        const list = toArray(resEdit.value)
        data.editoriales = list
          .map((e: any) => ({
            value: e.ID_EDITORIAL,
            label: String(e.NOMBRE_EDITORIAL || '').trim(),
          }))
          .filter((e) => e.value !== undefined && e.value !== null && e.value !== '' && e.label !== '')
      }

      if (resProv.status === 'fulfilled') {
        const list = toArray(resProv.value)
        data.proveedores = list
          .map((p: any) => ({
            value: p.ID_PROVEEDOR,
            label: String(p.NOMBRE_PROVEEDOR || '').trim(),
          }))
          .filter((p) => p.value !== undefined && p.value !== null && p.value !== '' && p.label !== '')
      }

      if (resForm.status === 'fulfilled') {
        const list = toArray(resForm.value)
        data.formatos = list
          .map((f: any) => ({
            value: f.ID_FORMATOS,
            label: String(f.NOMBRE_FORMATOS || '').trim(),
          }))
          .filter((f) => f.value !== undefined && f.value !== null && f.value !== '' && f.label !== '')
      }

      if (resTipo.status === 'fulfilled') {
        const list = toArray(resTipo.value)
        data.tipos = list
          .map((t: any) => ({
            value: t.ID_TIPO,
            label: String(t.NOMBRE_TIPO || '').trim(),
          }))
          .filter((t) => t.value !== undefined && t.value !== null && t.value !== '' && t.label !== '')
      }

      if (resAut.status === 'fulfilled') {
        const list = toArray(resAut.value)
        data.autores = list
          .map((a: any) => ({
            value: a.ID_AUTOR,
            label: String(a.NOMBRE_AUTOR || '').trim(),
          }))
          .filter((a) => a.value !== undefined && a.value !== null && a.value !== '' && a.label !== '')
      }

      cachedCatalogos = data
      listeners.forEach((listener) => {
        try {
          listener(data)
        } catch (e) {
          console.error('Error notifying catalog listener:', e)
        }
      })
      return data
    } catch (err) {
      console.error('Error al cargar catálogos de libros:', err)
      return cachedCatalogos || emptyCatalogos
    } finally {
      pendingPromise = null
    }
  })()

  return pendingPromise
}

export const useCatalogosLibros = (autoFetch: boolean = true) => {
  const [catalogos, setCatalogos] = useState<CatalogosLibrosData>(
    cachedCatalogos || emptyCatalogos,
  )
  const [loading, setLoading] = useState<boolean>(!cachedCatalogos)

  useEffect(() => {
    const listener = (data: CatalogosLibrosData) => {
      setCatalogos(data)
      setLoading(false)
    }
    listeners.add(listener)

    if (cachedCatalogos) {
      setCatalogos(cachedCatalogos)
      setLoading(false)
    } else if (autoFetch) {
      setLoading(true)
      fetchCatalogosData().catch((err) => {
        console.error('Error fetching catalogos:', err)
        setLoading(false)
      })
    }

    return () => {
      listeners.delete(listener)
    }
  }, [autoFetch])

  const fetchCatalogos = useCallback(async (forceRefresh: boolean = false) => {
    if (!forceRefresh && cachedCatalogos) {
      return cachedCatalogos
    }
    setLoading(true)
    try {
      const data = await fetchCatalogosData(forceRefresh)
      setCatalogos(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    categorias: catalogos.categorias,
    generos: catalogos.generos,
    editoriales: catalogos.editoriales,
    proveedores: catalogos.proveedores,
    formatos: catalogos.formatos,
    tipos: catalogos.tipos,
    autores: catalogos.autores,
    fetchCatalogos,
  }
}

export default useCatalogosLibros
