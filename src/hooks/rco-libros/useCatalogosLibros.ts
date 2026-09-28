import { useState, useEffect, useCallback } from 'react'
import { CatalogoOption } from '@/models/rco/libros'
import { Autores } from '@/Service/rco/AutorLib'
import { CatLibros } from '@/Service/rco/CatLib'
import { ListarGeneroLib } from '@/Service/rco/GenLib'
import { ListarEditLib } from '@/Service/rco/EditLib'
import { ListarProveedorLib } from '@/Service/rco/ProveedorLib'
import { listarFormatLib } from '@/Service/rco/FormatLib'
import { ListarTipoLib } from '@/Service/rco/TipLib'

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
        Autores(),
      ])

      if (resCat.status === 'fulfilled' && Array.isArray(resCat.value)) {
        setCategorias(
          resCat.value.map((c: any) => ({
            value: c.ID_CATEGORIA,
            label: c.NOMBRE_CATEGORIA || c.nombre || '',
          })),
        )
      }

      if (resGen.status === 'fulfilled' && Array.isArray(resGen.value)) {
        setGeneros(
          resGen.value.map((g: any) => ({
            value: g.ID_RCOGENERO,
            label: g.NOMBRE_RCOGENERO || g.nombre || '',
          })),
        )
      }

      if (resEdit.status === 'fulfilled' && Array.isArray(resEdit.value)) {
        setEditoriales(
          resEdit.value.map((e: any) => ({
            value: e.ID_EDITORIAL,
            label: e.NOMBRE_EDITORIAL || e.nombre || '',
          })),
        )
      }

      if (resProv.status === 'fulfilled' && Array.isArray(resProv.value)) {
        setProveedores(
          resProv.value.map((p: any) => ({
            value: p.ID_PROVEEDOR,
            label: p.NOMBRE_PROVEEDOR || p.nombre || '',
          })),
        )
      }

      if (resForm.status === 'fulfilled' && Array.isArray(resForm.value)) {
        setFormatos(
          resForm.value.map((f: any) => ({
            value: f.ID_FORMATOS,
            label: f.NOMBRE_FORMATOS || f.nombre || '',
          })),
        )
      }

      if (resTipo.status === 'fulfilled' && Array.isArray(resTipo.value)) {
        setTipos(
          resTipo.value.map((t: any) => ({
            value: t.ID_TIPO,
            label: t.NOMBRE_TIPO || t.nombre || '',
          })),
        )
      }

      if (resAut.status === 'fulfilled' && Array.isArray(resAut.value)) {
        setAutores(
          resAut.value.map((a: any) => ({
            value: a.ID_AUTOR,
            label: a.NOMBRE_AUTOR || a.nombre || '',
          })),
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
