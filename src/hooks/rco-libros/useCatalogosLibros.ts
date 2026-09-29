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

export const useCatalogosLibros = (autoFetch: boolean = true) => {
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<CatalogoOption[]>([])
  const [generos, setGeneros] = useState<CatalogoOption[]>([])
  const [editoriales, setEditoriales] = useState<CatalogoOption[]>([])
  const [proveedores, setProveedores] = useState<CatalogoOption[]>([])
  const [formatos, setFormatos] = useState<CatalogoOption[]>([])
  const [tipos, setTipos] = useState<CatalogoOption[]>([])
  const [autores, setAutores] = useState<CatalogoOption[]>([])

  const fetchCatalogos = useCallback(async () => {
    setLoading(true)
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

      if (resCat.status === 'fulfilled') {
        const list = toArray(resCat.value)
        setCategorias(
          list
            .map((c: any) => ({
              value: c.ID_CATEGORIA ?? c.id ?? '',
              label: String(c.NOMBRE_CATEGORIA ?? c.nombre ?? c.name ?? '').trim(),
            }))
            .filter((c) => c.value !== '' && c.label !== ''),
        )
      }

      if (resGen.status === 'fulfilled') {
        const list = toArray(resGen.value)
        setGeneros(
          list
            .map((g: any) => ({
              value: g.ID_RCOGENERO ?? g.id ?? '',
              label: String(g.NOMBRE_RCOGENERO ?? g.nombre ?? g.name ?? '').trim(),
            }))
            .filter((g) => g.value !== '' && g.label !== ''),
        )
      }

      if (resEdit.status === 'fulfilled') {
        const list = toArray(resEdit.value)
        setEditoriales(
          list
            .map((e: any) => ({
              value: e.ID_EDITORIAL ?? e.id ?? '',
              label: String(e.NOMBRE_EDITORIAL ?? e.nombre ?? e.name ?? '').trim(),
            }))
            .filter((e) => e.value !== '' && e.label !== ''),
        )
      }

      if (resProv.status === 'fulfilled') {
        const list = toArray(resProv.value)
        setProveedores(
          list
            .map((p: any) => ({
              value: p.ID_PROVEEDOR ?? p.id ?? '',
              label: String(p.NOMBRE_PROVEEDOR ?? p.nombre ?? p.name ?? '').trim(),
            }))
            .filter((p) => p.value !== '' && p.label !== ''),
        )
      }

      if (resForm.status === 'fulfilled') {
        const list = toArray(resForm.value)
        setFormatos(
          list
            .map((f: any) => ({
              value: f.ID_FORMATOS ?? f.id ?? '',
              label: String(f.NOMBRE_FORMATOS ?? f.nombre ?? f.name ?? '').trim(),
            }))
            .filter((f) => f.value !== '' && f.label !== ''),
        )
      }

      if (resTipo.status === 'fulfilled') {
        const list = toArray(resTipo.value)
        setTipos(
          list
            .map((t: any) => ({
              value: t.ID_TIPO ?? t.id ?? '',
              label: String(t.NOMBRE_TIPO ?? t.nombre ?? t.name ?? '').trim(),
            }))
            .filter((t) => t.value !== '' && t.label !== ''),
        )
      }

      if (resAut.status === 'fulfilled') {
        const list = toArray(resAut.value)
        setAutores(
          list
            .map((a: any) => ({
              value: a.ID_AUTOR ?? a.id ?? '',
              label: String(a.NOMBRE_AUTOR ?? a.nombre ?? a.nombres ?? a.name ?? '').trim(),
            }))
            .filter((a) => a.value !== '' && a.label !== ''),
        )
      }
    } catch (err) {
      console.error('Error al cargar catálogos de libros:', err)
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
    loading,
    categorias,
    generos,
    editoriales,
    proveedores,
    formatos,
    tipos,
    autores,
    fetchCatalogos,
  }
}

export default useCatalogosLibros
