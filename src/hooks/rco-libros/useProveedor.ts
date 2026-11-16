import { Proveedor } from "@/models/rco/proveedor";
import { ActualizarProvLib, EliminarProvLib, ListarProveedorLib, NuevoProvLib } from "@/Service/rco/ProveedorLib";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { usePermissions } from "@/context/PermissionsContext";


export type ProveedorItem = Proveedor

export interface UseProveedorProps{
  autoFetch?: boolean
  visible?: boolean
  setVisible?: (visible?: boolean) => void
  onProveedorCreado?: (proveedorNuevo: Proveedor) => void
  onProveedorActualizado?: (proveedorActualizado: Proveedor) => void
  onProveedorEliminado?: (id:number | string) => void
}

export const useProveedor = ({
  autoFetch = true,
  visible: visibleProp,
  setVisible: setVisibleProp,
  onProveedorCreado,
  onProveedorActualizado,
  onProveedorEliminado,
}: UseProveedorProps ={}) => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canCrearProveedor = canDoAction('btn_crear_proveedor')
  const canGuardarProveedor = canDoAction('btn_guardar_proveedor')
  const canEditarProveedor = canDoAction('btn_editar_proveedor')
  const canActualizarProveedor = canDoAction('btn_actualizar_proveedor')
  const canEliminarProveedor = canDoAction('btn_eliminar_proveedor')
  const canVerInfoProveedor = canDoAction('btn_ver_info_proveedor')

  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visibleProp === 'boolean'
  const isVisible = isControlled ? visibleProp : internalVisible

  const [listaProveedores, setListaProveedores] = useState<Proveedor[]>([])
  const [loadingProveedor, setLoadingProveedor] = useState(false)
  const [busquedaProveedor, setBusquedaProveedor] = useState('')
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null)
  const [proveedorEnEdicion, setProveedorEnEdicion] = useState<Proveedor | null>(null)

  const [nombreProveedor, setNombreProveedor] = useState('')
  const [guardando, setGuardando] = useState(false)

  const fetchProveedores = useCallback( async(preserveSelection = true) => {
    setLoadingProveedor(true)
    try{
      const response =  await ListarProveedorLib()
      let rawList: any [] = [] 
      if(Array.isArray(response)){
        rawList = response
      }else if(Array.isArray(response?.data)){
        rawList = response.data
      }else if(Array.isArray(response?.data?.data)){
        rawList = response.data.data
      }else if(Array.isArray(response?.proveedor)){
        rawList = response.proveedor
      }

      const parsedList: Proveedor[] = rawList.map((item:any, index:number) =>({
        id: item.ID_PROVEEDOR ?? item.id ?? index + 1,
        ID_PROVEEDOR: item.ID_PROVEEDOR ?? item.id ?? index + 1,
        NOMBRE_PROVEEDOR: String(item.NOMBRE_PROVEEDOR ??  item.nombre).trim(),
        FECHAINGRESO_PROVEEDOR: item.FECHAINGRESO_PROVEEDOR ?? item.fecha_ingreso ?? null
      }))

      setListaProveedores(parsedList)
      if (preserveSelection) {
        setProveedorSeleccionado((prev) => {
          if (!prev) return null
          const prevId = String(prev.ID_PROVEEDOR ?? prev.id)
          const matched = parsedList.find(
            (c) => String(c.ID_PROVEEDOR ?? c.id) === prevId, 
          )
          return matched || null
        })
      } else {
        setProveedorSeleccionado(null)
      }
    }catch(error: any){
      console.error('Error al cargar proveedores:', error)
    } finally{
      setLoadingProveedor(false)
    }
  },[])

  useEffect(()=>{
    if(autoFetch){
      fetchProveedores()
    }
  }, [autoFetch,fetchProveedores])

  const handleRecargar = useCallback(async () => {
    setBusquedaProveedor('')
    setPaginaActual(1)
    setProveedorSeleccionado(null)
    await fetchProveedores(false)
  }, [fetchProveedores])

  const handleOpen = useCallback(
    (proveedor?: Proveedor) => {
      if (proveedor) {
        if (!canEditarProveedor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para editar proveedores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setProveedorEnEdicion(proveedor)
        setNombreProveedor(String(proveedor.NOMBRE_PROVEEDOR || ''))
      } else {
        if (!canCrearProveedor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para crear proveedores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setProveedorEnEdicion(null)
        setNombreProveedor('')
      }

      if (setVisibleProp) {
        setVisibleProp(true)
      } else {
        setInternalVisible(true)
      }
    },
    [setVisibleProp, canEditarProveedor, canCrearProveedor],
  )

  const handleClose = useCallback(() => {
    if (setVisibleProp) {
      setVisibleProp(false)
    } else {
      setInternalVisible(false)
    }
    setProveedorEnEdicion(null)
    setNombreProveedor('')
  }, [setVisibleProp])

  const proveedoresFiltrados = useMemo(() => {
    const Sorted = [...listaProveedores].sort((a, b) => {
      const numA = Number(a.ID_PROVEEDOR ?? a.id)
      const numB = Number(b.ID_PROVEEDOR ?? b.id)
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }
      return String(a.NOMBRE_PROVEEDOR).localeCompare(String(b.NOMBRE_PROVEEDOR), undefined, {
        numeric: true,
      })
    })

    if (!busquedaProveedor.trim()) return Sorted
    const q = busquedaProveedor.toLocaleLowerCase().trim()
    return Sorted.filter((prov) => {
      const nombre = (prov.NOMBRE_PROVEEDOR || '').toLocaleLowerCase()
      const id = String(prov.ID_PROVEEDOR ?? prov.id ?? '').toLocaleLowerCase()
      return nombre.includes(q) || id.includes(q)
    })
  }, [busquedaProveedor, listaProveedores])

  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 10

  useEffect(() => {
    setPaginaActual(1)
  }, [busquedaProveedor])

  const totalPaginas = Math.max(1, Math.ceil(proveedoresFiltrados.length / itemsPorPagina))

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas)
    }
  }, [totalPaginas, paginaActual])

  const proveedoresPaginados = useMemo(() => {
    const start = (paginaActual - 1) * itemsPorPagina
    return proveedoresFiltrados.slice(start, start + itemsPorPagina)
  }, [proveedoresFiltrados, paginaActual, itemsPorPagina])

  const handlePageChange = useCallback((page: number) => {
    setPaginaActual(page)
  }, [])

  const handleGuardarProveedor = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!nombreProveedor.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos requeridos',
          text: 'Por favor ingrese el nombre del proveedor.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      if (proveedorEnEdicion) {
        if (!canActualizarProveedor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar el proveedor.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_actualizar_proveedor')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar el proveedor.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      } else {
        if (!canGuardarProveedor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevos proveedores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_guardar_proveedor')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevos proveedores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      }

      setGuardando(true)
      try {
        const payload = {
          NOMBRE_PROVEEDOR: nombreProveedor.trim(),
        }
        if (proveedorEnEdicion) {
          const id = proveedorEnEdicion.ID_PROVEEDOR ?? proveedorEnEdicion.id
          await ActualizarProvLib(id, payload)

          Swal.fire({
            icon: 'success',
            title: '¡Proveedor actualizado!',
            text: 'El proveedor fue actualizado correctamente.',
            timer: 1800,
            showConfirmButton: false,
          })

          await fetchProveedores()
          if (onProveedorActualizado) {
            onProveedorActualizado({
              ...proveedorEnEdicion,
              ...payload,
            })
          }
        } else {
          const res = await NuevoProvLib(payload)

          Swal.fire({
            icon: 'success',
            title: '¡Proveedor registrado!',
            text: 'El proveedor fue registrado con éxito.',
            timer: 1800,
            showConfirmButton: false,
          })

          await fetchProveedores()
          if (onProveedorCreado) {
            onProveedorCreado(
              res?.data ||
                res || {
                  id: Date.now(),
                  ID_PROVEEDOR: Date.now(),
                  ...payload,
                },
            )
          }
        }

        handleClose()
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Error al procesar la solicitud'

        Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: errorMsg,
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      } finally {
        setGuardando(false)
      }
    },
    [
      nombreProveedor,
      proveedorEnEdicion,
      canActualizarProveedor,
      canGuardarProveedor,
      fetchProveedores,
      handleClose,
      onProveedorActualizado,
      onProveedorCreado,
    ],
  )

  const handleEliminarProveedor = useCallback(
    async (provParam?: Proveedor) => {
      if (!canEliminarProveedor) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para eliminar proveedores.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const prov = provParam || proveedorSeleccionado
      if (!prov) return

      const id = prov.ID_PROVEEDOR ?? prov.id
      if (!id) return

      const confirmResult = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro de eliminar el proveedor?',
        text: `Se eliminará el proveedor "${prov.NOMBRE_PROVEEDOR}"`,
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      })

      if (confirmResult.isConfirmed) {
        const tienePermiso = await verificarAccionEnServidor('btn_eliminar_proveedor')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para eliminar proveedores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }

        try {
          await EliminarProvLib(id)
          Swal.fire({
            icon: 'success',
            title: '¡Proveedor eliminado!',
            text: 'El proveedor fue eliminado correctamente.',
            timer: 1800,
            showConfirmButton: false,
          })
          if (
            proveedorSeleccionado &&
            String(proveedorSeleccionado.ID_PROVEEDOR ?? proveedorSeleccionado.id) === String(id)
          ) {
            setProveedorSeleccionado(null)
          }
          await fetchProveedores()
          if (onProveedorEliminado) {
            onProveedorEliminado(id)
          }
        } catch (error: any) {
          const smg =
            error?.response?.data?.message ||
            'Error al intentar eliminar el proveedor'
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: smg,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
        }
      }
    },
    [proveedorSeleccionado, canEliminarProveedor, fetchProveedores, onProveedorEliminado],
  )

  return {
    isVisible,
    handleOpen,
    handleClose,
    onProveedorCreado,
    onProveedorActualizado,
    onProveedorEliminado,
    listaProveedores,
    setListaProveedores,
    loadingProveedor,
    setLoadingProveedor,
    busquedaProveedor,
    setBusquedaProveedor,
    proveedorSeleccionado,
    setProveedorSeleccionado,
    proveedorEnEdicion,
    setProveedorEnEdicion,
    nombreProveedor,
    setNombreProveedor,
    proveedoresFiltrados,
    proveedoresPaginados,
    handleGuardarProveedor,
    handleEliminarProveedor,
    guardando,
    fetchProveedores,
    handleRecargar,
    paginaActual,
    totalPaginas,
    totalProveedores: listaProveedores.length,
    totalFiltrados: proveedoresFiltrados.length,
    handlePageChange,
    canCrearProveedor,
    canGuardarProveedor,
    canEditarProveedor,
    canActualizarProveedor,
    canEliminarProveedor,
    canVerInfoProveedor,
    verificarAccionEnServidor,
  }
}

export default useProveedor