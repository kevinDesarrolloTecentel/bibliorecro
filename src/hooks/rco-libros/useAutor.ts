import { Autor } from "@/models/rco/autor";
import { ActualizarAutorLib, EliminarAutorLib, Autores, NuevoAutorLib } from "@/Service/rco/AutorLib";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

export type AutorItem = Autor

export interface UseAutorProps {
  autoFetch?: boolean
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onAutorCreado?: (autorNuevo: Autor) => void
  onAutorActualizado?: (autorActualizado: Autor) => void
  onAutorEliminado?: (id: number | string) => void
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  timer: 2500,
  timerProgressBar: false,
  showConfirmButton: false
})

export const useAutor = ({
  autoFetch = true,
  visible: visibleProp,
  setVisible: setVisibleProp,
  onAutorCreado,
  onAutorActualizado,
  onAutorEliminado

}: UseAutorProps = {}) => {
  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visibleProp === 'boolean'
  const isVisible = isControlled ? visibleProp : internalVisible

  const [listaAutores, setListaAutores] = useState<Autor[]>([])
  const [loadingAutores, setLoadingAutores] = useState(false)
  const [busquedaAutor, setBusquedaAutor] = useState('')
  const [autorSeleccionado, setAutorSeleccionado] = useState<Autor | null>(null)
  const [autorEnEdicion, setAutorEnEdicion] = useState<Autor | null>(null)

  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalAutores, setTotalAutores] = useState(0)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const [nombreAutor, setNombreAutor] = useState('')
  const [guardando, setGuardadno] = useState(false)

  const fetchAutores = useCallback(async (page: number = 1, searchQuery: string = '') => {
    setLoadingAutores(true)
    try {
      const q = searchQuery.trim()
      const response = await Autores({ page, search: q, per_page: 20 })
      let rawList: any[] = []
      let total = 0
      let lastPage = 1

      if (response && response.data) {
        rawList = Array.isArray(response.data) ? response.data : []
        total = Number(response.total ?? rawList.length)
        lastPage = Number(response.last_page ?? 1)
      } else if (Array.isArray(response)) {
        rawList = response
        total = response.length
        lastPage = 1
      }

      const parsedList: Autor[] = rawList.map((item: any, index: number) => ({
        id: item.ID_AUTOR ?? item.id ?? index + 1,
        ID_AUTOR: item.ID_AUTOR ?? item.id ?? index + 1,
        NOMBRE_AUTOR: String(item.NOMBRE_AUTOR ?? item.nombre ?? '').trim(),
        FECHAINGRESO_AUTOR: item.FECHAINGRESO_AUTOR ?? item.fecha_ingreso ?? null
      }))

      setListaAutores(parsedList)
      setTotalAutores(total)
      setTotalPaginas(Math.max(1, lastPage))
      setPaginaActual(page)

      setAutorSeleccionado((prev) => {
        if (!prev) return null
        const prevId = String(prev.ID_AUTOR ?? prev.id)
        const matched = parsedList.find((a) => String(a.ID_AUTOR ?? a.id) === prevId)
        return matched || prev
      })
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: 'No se pudieron cargar los autores'
      })
    } finally {
      setLoadingAutores(false)
    }
  }, [])

  useEffect(() => {
    if (!autoFetch) return
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    const delay = busquedaAutor.trim() ? 350 : 0
    searchDebounceRef.current = setTimeout(() => {
      fetchAutores(1, busquedaAutor)
    }, delay)

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [busquedaAutor, autoFetch, fetchAutores])

  const handlePageChange = useCallback((newPage: number) => {
    setPaginaActual(newPage)
    fetchAutores(newPage, busquedaAutor)
  }, [busquedaAutor, fetchAutores])

  const handleOpen = useCallback(
    (autores?: Autor) => {
      if (autores) {
        setAutorEnEdicion(autores)
        setNombreAutor(autores.NOMBRE_AUTOR || '')
      } else {
        setAutorEnEdicion(null)
        setNombreAutor('')
      }

      if (setVisibleProp) {
        setVisibleProp(true)
      } else {
        setInternalVisible(true)
      }
    }, [setVisibleProp]
  )

  const handleClose = useCallback(() => {
    if (setVisibleProp) {
      setVisibleProp(false)
    } else {
      setInternalVisible(false)
    }
    setAutorEnEdicion(null)
    setNombreAutor('')
  }, [setVisibleProp])


  const autoresFiltrados = listaAutores

  const handleGuardarAutor = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!nombreAutor.trim()) {
        Toast.fire({
          icon: 'error',
          title: 'El nombre del autor es requerido'
        })
        return
      }
      setGuardadno(true)
      try {
        const payload = {
          NOMBRE_AUTOR: nombreAutor.trim(),
        }

        if (autorEnEdicion) {
          const id = autorEnEdicion.ID_AUTOR ?? autorEnEdicion.id
          await ActualizarAutorLib(id, payload)

          Toast.mixin({
            toast: true,
            position: 'top-end',
            timer: 2500,
            timerProgressBar: false,
            showConfirmButton: false
          }).fire({
            icon: 'success',
            title: 'Autor actualizado correctamente'
          })
          await fetchAutores(paginaActual, busquedaAutor)
          if (onAutorActualizado) {
            onAutorActualizado({
              ...autorEnEdicion,
              ...payload
            })
          }
        } else {
          const res = await NuevoAutorLib(payload)

          Toast.mixin({
            toast: true,
            position: 'top-end',
            timer: 2500,
            timerProgressBar: false,
            showConfirmButton: false
          }).fire({
            icon: 'success',
            title: 'Autor registrado correctamente'
          })

          await fetchAutores(1, '')
          if (onAutorCreado) {
            onAutorCreado(
              res?.data ||
              res || {
                id: Date.now(),
                ID_AUTOR: Date.now(),
                ...payload
              }
            )
          }
        }

        handleClose()
      } catch (error: any) {
        console.error('Error al guardar categoría:', error)
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Error al procesar la solicitud con el servidor'
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: errorMsg,
          confirmButtonColor: '#0d6efd',
        })
      } finally {
        setGuardadno(false)
      }
    },
    [
      nombreAutor,
      autorEnEdicion,
      fetchAutores,
      handleClose,
      onAutorActualizado,
      onAutorCreado,
    ]
  )

  const handleElminiarAutor = useCallback (
    async(autParam?: Autor)=>{
      const aut = autParam || autorSeleccionado
      if(!aut) return

      const id =aut.ID_AUTOR ?? aut.id
      if(!id) return

      const confirmResult = await Swal.fire({
        title: 'Eliminar autor',
        text: `¿Estás seguro de eliminar el autor "${aut.NOMBRE_AUTOR}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })

      if(confirmResult.isConfirmed){
        try{
          await EliminarAutorLib(id)
          Toast.mixin({
            toast: true,
            position:'top-end',
            timer:2500,
            timerProgressBar:false
          }).fire({
            icon:'success',
            title:'Autor eliminado con exito'
          })
          if(
            autorSeleccionado && String(autorSeleccionado.ID_AUTOR ?? autorSeleccionado.id) === String(id)
          ){
            setAutorSeleccionado(null)
          }
          await fetchAutores(paginaActual, busquedaAutor)
          if(onAutorEliminado){
            onAutorEliminado(id)
          }
        }catch(error:any){
          const msg =  'No se pudo eliminar al Autor seleccionado'
          Swal.mixin({
            toast:true,
            position:'top-end',
            timer:2500,
            timerProgressBar:false,
            showConfirmButton:false
          }).fire({
            icon:'error',
            title: msg
          })
        }
      }
    },[autorSeleccionado, fetchAutores, onAutorEliminado]
  )
  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    listaAutores,
    setListaAutores,
    autoresFiltrados,
    loadingAutores,
    setLoadingAutores,
    busquedaAutor,
    setBusquedaAutor,
    autorSeleccionado,
    setAutorSeleccionado,
    autorEnEdicion,
    setAutorEnEdicion,
    nombreAutor,
    setNombreAutor,
    guardando,
    handleGuardarAutor,
    handleElminiarAutor,
    fetchAutores,
    paginaActual,
    totalPaginas,
    totalAutores,
    handlePageChange,
  }
}

export default useAutor