import { Proveedor } from "@/models/rco/proveedor";
import { ActualizarProvLib, EliminarProvLib, ListarProveedorLib, NuevoProvLib } from "@/Service/rco/ProveedorLib";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";


export type ProveedorItem = Proveedor

export interface UseProveedorProps{
  autoFetch?: boolean
  visible?: boolean
  setVisible?: (visible?: boolean) => void
  onProveedorCreado?: (proveedorNuevo: Proveedor) => void
  onProveedorActualizado?: (proveedorActualizado: Proveedor) => void
  onProveedorEliminado?: (id:number | string) => void
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true
})

export const useProveedor = ({
  autoFetch = true,
  visible: visibleProp,
  setVisible: setVisibleProp,
  onProveedorCreado,
  onProveedorActualizado,
  onProveedorEliminado,
}: UseProveedorProps ={}) => {
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

  const fetchProveedores = useCallback( async() => {
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
      setProveedorSeleccionado((prev) => {
        if (!prev) return null
        const prevId = String(prev.ID_PROVEEDOR ?? prev.id)
        const matched = parsedList.find(
          (c) => String(c.ID_PROVEEDOR ?? c.id) === prevId, 
        )
        return matched || null
      })
    }catch(error: any){
      Toast.fire({
        icon:'error',
        title:'No se pudo cargar los Proveedores'
      })
    } finally{
      setLoadingProveedor(false)
    }
  },[])

  useEffect(()=>{
    if(autoFetch){
      fetchProveedores()
    }
  }, [autoFetch,fetchProveedores])

  const handleOpen = useCallback(
    (proveedor?: Proveedor) => {
      if (proveedor) {
        setProveedorEnEdicion(proveedor)
        setNombreProveedor(String(proveedor.NOMBRE_PROVEEDOR || ''))
      } else {
        setProveedorEnEdicion(null)
        setNombreProveedor('')
      }

      if (setVisibleProp) {
        setVisibleProp(true)
      } else {
        setInternalVisible(true)
      }
    },
    [setVisibleProp],
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

  const handleGuardarProveedor = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!nombreProveedor.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos requeridos',
          text: 'Por favor ingrese el nombre del proveedor',
          confirmButtonColor: '#0d6efd',
        })
        return
      }

      setGuardando(true)
      try {
        const payload = {
          NOMBRE_PROVEEDOR: nombreProveedor.trim(),
        }
        if (proveedorEnEdicion) {
          const id = proveedorEnEdicion.ID_PROVEEDOR ?? proveedorEnEdicion.id
          await ActualizarProvLib(id, payload)

          Toast.fire({
            icon: 'success',
            title: 'Proveedor Actualizado Correctamente',
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

          Toast.fire({
            icon: 'success',
            title: 'Proveedor registrado con exito',
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
          confirmButtonColor: '#0d6efd',
        })
      } finally {
        setGuardando(false)
      }
    },[
          nombreProveedor,
          proveedorEnEdicion,
          fetchProveedores,
          handleClose,
          onProveedorActualizado,
          onProveedorCreado
        ]
    )

    const handleEliminarProveedor = useCallback(
      async (provParam?: Proveedor) =>{
        const prov = provParam || proveedorSeleccionado
        if(!prov) return
        
        const id = prov.ID_PROVEEDOR ?? prov.id
        if(!id) return 

        const confirmResult = await Swal.fire({
          icon:'warning',
          title:'Estas seguro eliminar al proveedor?',
          text:`Se eliminara al proveedor '${prov.NOMBRE_PROVEEDOR}'`,
          showCancelButton: true,
          confirmButtonColor:'#dc3545',
          cancelButtonColor:'#6c757d',
          confirmButtonText:'Si, eliminar',
          cancelButtonText:'Cancelar' 
        })

        if(confirmResult.isConfirmed){
          try{
            await EliminarProvLib(id)
            Toast.fire({
              icon:'success',
              title:'Proveedor eliminado correctamente'
            })
            if(
              proveedorSeleccionado  && String(
                proveedorSeleccionado.ID_PROVEEDOR ?? proveedorSeleccionado.id) === String(id)
            ){
              setProveedorSeleccionado(null)
            }
            await fetchProveedores()
            if(onProveedorEliminado){
              onProveedorEliminado(id)
            }
          }catch(error: any){
            const smg =
            error?.response?.data?.message ||
            'Error no se pudo eliminar el proveedor'
            Swal.fire({
              icon:'error',
              title:'Error al eliminar el proveedor',
              text: smg,
              confirmButtonColor:'#0d6efd'
            })
          }
        }
      },
      [proveedorSeleccionado, fetchProveedores, onProveedorEliminado]
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
    setGuardando,
    proveedoresFiltrados,
    handleGuardarProveedor,
    handleEliminarProveedor,
    guardando
  }
}

export default useProveedor