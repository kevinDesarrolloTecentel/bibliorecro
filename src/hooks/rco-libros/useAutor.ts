import { Autor } from "@/models/rco/autor";
import { ActualizarAutorLib, EliminarAutorLib, ListarAutorLib, NuevoAutorLib } from "@/Service/rco/AutorLib";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

  const [nombreAutor, setNombreAutor] = useState('')
  const [guardando, setGuardadno] = useState(false)

  const fetchAutores = useCallback(async () => {
    setLoadingAutores(true)
    try {
      const response = await ListarAutorLib()
      let rawList: any[] = []
      if (Array.isArray(response)) {
        rawList = response
      } else if (Array.isArray(response?.data)) {
        rawList = response.data
      } else if (Array.isArray(response?.data?.data)) {
        rawList = response.data.data
      } else if (Array.isArray(response?.autores)) {
        rawList = response.autores
      }

      const parsedList: Autor[] = rawList.map((item: any, index: number) => ({
        id: item.ID_AUTOR ?? item.id ?? index + 1,
        ID_AUTOR: item.ID_AUTOR ?? item.id ?? index + 1,
        NOMBRE_AUTOR: String(item.NOMBRE_AUTOR ?? item.nombre ?? '').trim(),
        FECHAINGRESO_AUTOR: item.FECHAINGRESO_AUTOR ?? item.fecha_ingreso ?? null
      }))


      setListaAutores(parsedList)
      setAutorSeleccionado((prev) => {
        if (!prev) return null
        const prevId = String(prev.ID_AUTOR ?? prev.id)
        const matched = parsedList.find((a) => String(a.ID_AUTOR ?? a.id) === prevId)
        return matched || null
      })
    } catch (error: any) {
      Toast.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false
      }).fire({
        icon: 'error',
        title: 'No se pudieron cargar los autores'
      })
    } finally {
      setLoadingAutores(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchAutores()
    }
  }, [autoFetch, fetchAutores])

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


  const autoresFiltrados = useMemo(() => {
    const sorted = [...listaAutores].sort((a, b) => {
      const numA = Number(a.ID_AUTOR ?? a.id)
      const numB = Number(b.ID_AUTOR ?? b.id)
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }
      return String(a.NOMBRE_AUTOR).localeCompare(String(b.NOMBRE_AUTOR), undefined, {
        numeric: true,
      })
    })

    if (!busquedaAutor.trim()) return sorted
    const q = busquedaAutor.toLowerCase().trim()
    return sorted.filter((aut) => {
      const nombre = (aut.NOMBRE_AUTOR || '').toLowerCase()
      const id = String(aut.ID_AUTOR ?? aut.id ?? '').toLowerCase()
      return nombre.includes(q) || id.includes(q)
    })
  }, [busquedaAutor, listaAutores])

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
          await fetchAutores()
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

          await fetchAutores()
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
          await fetchAutores()
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
    fetchAutores
  }
}

export default useAutor