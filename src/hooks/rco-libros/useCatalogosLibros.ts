import { useState, useEffect, useCallback } from 'react'
import { CatalogoOption } from '@/models/rco/libros'
import { Autores, ListarAutorLib } from '@/Service/rco/AutorLib'
import { CatLibros } from '@/Service/rco/CatLib'
import { ListarGeneroLib } from '@/Service/rco/GenLib'
import { ListarEditLib } from '@/Service/rco/EditLib'
import { ListarProveedorLib } from '@/Service/rco/ProveedorLib'
import { listarFormatLib } from '@/Service/rco/FormatLib'
import { ListarTipoLib } from '@/Service/rco/TipLib'

const toArray = (val: any): any[] => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (Array.isArray(val.data)) return val.data
  if (Array.isArray(val.data?.data)) return val.data.data
  if (Array.isArray(val.autores)) return val.autores
  if (Array.isArray(val.autors)) return val.autors
  if (Array.isArray(val.categorias)) return val.categorias
  if (Array.isArray(val.generos)) return val.generos
  if (Array.isArray(val.editoriales)) return val.editoriales
  if (Array.isArray(val.editorials)) return val.editorials
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

export interface CatalogosLibrosData {
  categorias: CatalogoOption[]
  generos: CatalogoOption[]
  editoriales: CatalogoOption[]
  proveedores: CatalogoOption[]
  formatos: CatalogoOption[]
  tipos: CatalogoOption[]
  autores: CatalogoOption[]
}

const emptyCatalogos: CatalogosLibrosData = {
  categorias: [],
  generos: [],
  editoriales: [],
  proveedores: [],
  formatos: [],
  tipos: [],
  autores: [],
}

let cachedCatalogos: CatalogosLibrosData | null = null
let pendingCatalogosPromise: Promise<CatalogosLibrosData> | null = null
const listeners = new Set<() => void>()

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch (e) {
      console.error('Error notifying catalog listener:', e)
    }
  })
}

export const clearCatalogosCache = () => {
  cachedCatalogos = null
  pendingCatalogosPromise = null
  notifyListeners()
}

export const fetchCatalogosData = async (
  forceRefresh: boolean = false,
): Promise<CatalogosLibrosData> => {
  if (!forceRefresh && cachedCatalogos) {
    return cachedCatalogos
  }
  if (!forceRefresh && pendingCatalogosPromise) {
    return pendingCatalogosPromise
  }

  pendingCatalogosPromise = (async () => {
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
            value: c.ID_CATEGORIA ?? c.id ?? '',
            label: String(c.NOMBRE_CATEGORIA ?? c.nombre ?? c.name ?? '').trim(),
          }))
          .filter((c) => c.value !== '' && c.label !== '')
      }

      if (resGen.status === 'fulfilled') {
        const list = toArray(resGen.value)
        data.generos = list
          .map((g: any) => ({
            value: g.ID_RCOGENERO ?? g.id ?? '',
            label: String(g.NOMBRE_RCOGENERO ?? g.nombre ?? g.name ?? '').trim(),
          }))
          .filter((g) => g.value !== '' && g.label !== '')
      }

      if (resEdit.status === 'fulfilled') {
        const list = toArray(resEdit.value)
        data.editoriales = list
          .map((e: any) => ({
            value: e.ID_EDITORIAL ?? e.id ?? '',
            label: String(e.NOMBRE_EDITORIAL ?? e.nombre ?? e.name ?? '').trim(),
          }))
          .filter((e) => e.value !== '' && e.label !== '')
      }

      if (resProv.status === 'fulfilled') {
        const list = toArray(resProv.value)
        data.proveedores = list
          .map((p: any) => ({
            value: p.ID_PROVEEDOR ?? p.id ?? '',
            label: String(p.NOMBRE_PROVEEDOR ?? p.nombre ?? p.name ?? '').trim(),
          }))
          .filter((p) => p.value !== '' && p.label !== '')
      }

      if (resForm.status === 'fulfilled') {
        const list = toArray(resForm.value)
        data.formatos = list
          .map((f: any) => ({
            value: f.ID_FORMATOS ?? f.id ?? '',
            label: String(f.NOMBRE_FORMATOS ?? f.nombre ?? f.name ?? '').trim(),
          }))
          .filter((f) => f.value !== '' && f.label !== '')
      }

      if (resTipo.status === 'fulfilled') {
        const list = toArray(resTipo.value)
        data.tipos = list
          .map((t: any) => ({
            value: t.ID_TIPO ?? t.id ?? '',
            label: String(t.NOMBRE_TIPO ?? t.nombre ?? t.name ?? '').trim(),
          }))
          .filter((t) => t.value !== '' && t.label !== '')
      }

      if (resAut.status === 'fulfilled') {
        const list = toArray(resAut.value)
        data.autores = list
          .map((a: any) => ({
            value: a.ID_AUTOR ?? a.id ?? '',
            label: String(a.NOMBRE_AUTOR ?? a.nombre ?? a.nombres ?? a.name ?? '').trim(),
          }))
          .filter((a) => a.value !== '' && a.label !== '')
      }

      cachedCatalogos = data
      notifyListeners()
      return data
    } catch (err) {
      console.error('Error al cargar catálogos de libros:', err)
      return cachedCatalogos || emptyCatalogos
    } finally {
      pendingCatalogosPromise = null
    }
  })()

  return pendingCatalogosPromise
}

export const useCatalogosLibros = (autoFetch: boolean = true) => {
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
    return fetchCatalogosData(forceRefresh)
  }, [])

  useEffect(() => {
    if (autoFetch && !cachedCatalogos && !pendingCatalogosPromise) {
      fetchCatalogosData()
    }
  }, [autoFetch])

  return {
    loading: !cachedCatalogos,
    categorias: cachedCatalogos?.categorias || emptyCatalogos.categorias,
    generos: cachedCatalogos?.generos || emptyCatalogos.generos,
    editoriales: cachedCatalogos?.editoriales || emptyCatalogos.editoriales,
    proveedores: cachedCatalogos?.proveedores || emptyCatalogos.proveedores,
    formatos: cachedCatalogos?.formatos || emptyCatalogos.formatos,
    tipos: cachedCatalogos?.tipos || emptyCatalogos.tipos,
    autores: cachedCatalogos?.autores || emptyCatalogos.autores,
    fetchCatalogos,
  }
}

export default useCatalogosLibros
