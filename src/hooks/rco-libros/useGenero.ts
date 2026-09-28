import { GeneroLib } from "@/models/rco/generoLb";
import { ActualizarGenLib, EliminarGenLib, ListarGeneroLib, NuevoGenLib } from "@/Service/rco/GenLib";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

export type GeneroLItem = GeneroLib
export type GeneroItem = GeneroLib

export interface UseGeneroLProps {
    autoFetch?:  boolean
    visible?: boolean
    setVisible?: (visible: boolean) => void
    onGenerolCreado?: (generolNuevo: GeneroLib) => void
    onGenerolActualizado?: (generolActualizado: GeneroLib) => void
    onGenerolEliminado?: (id: number | string) => void
    onGeneroCreado?: (generolNuevo: GeneroLib) => void
    onGeneroActualizado?: (generolActualizado: GeneroLib) => void
    onGeneroEliminado?: (id: number | string) => void
}

export type UseGeneroProps = UseGeneroLProps

const Toast = Swal.mixin({
    toast: true,
    position:'top-end',
    showConfirmButton: false,
    timer:2500,
    timerProgressBar: true,
    didOpen:(toast)=>{
        toast.onmouseenter = Swal.stopTimer
        toast.onmouseleave = Swal.resumeTimer
    }
})

export const useGeneroL = ({
    autoFetch= true,
    visible: visibleProp,
    setVisible: setVisibleProp,
    onGenerolCreado,
    onGenerolActualizado,
    onGenerolEliminado,
    onGeneroCreado,
    onGeneroActualizado,
    onGeneroEliminado
}: UseGeneroLProps = {}) => {
    const notifyCreado = onGenerolCreado || onGeneroCreado
    const notifyActualizado = onGenerolActualizado || onGeneroActualizado
    const notifyEliminado = onGenerolEliminado || onGeneroEliminado
    const [internalVisible, setInternalVisble] = useState(false)
    const isControlled = typeof visibleProp === 'boolean'
    const isVisible = isControlled ? visibleProp :  internalVisible

    const [listaGenerol, setListaGenerol] = useState<GeneroLib[]>([])
    const [loadingGenerol, setLoadingGenerol] = useState(false)
    const [busquedaGenerol, setBusquedaGenerol] = useState('')
    const [generoSeleccionado, setGeneroSeleccionado] = useState <GeneroLib | null>(null)
    const [generoEnEdicion, setGeneroEnEdicion] = useState<GeneroLib | null>(null)
    
    const [nombreGenerol, setNombreGenerol] = useState('')
    const [guardando, setGuardando] = useState(false)

    const fetchGenerol = useCallback(async()=>{
        setLoadingGenerol(true)
        try{
            const response = await ListarGeneroLib()
            let rawList: any[] = []
            if(Array.isArray(response)){
                rawList = response
            }else if(Array.isArray(response?.data)){
                rawList = response?.data
            }else if(Array.isArray(response?.data?.data)){
                rawList = response?.data?.data
            }else if(Array.isArray(response?.generol)){
                rawList = response?.generol
            }

            const  parsedList: GeneroLib[] = rawList.map((item:any, index:number) =>({
                id: item.ID_RCOGENERO ?? item.id ?? index + 1,
                ID_RCOGENERO: item.ID_RCOGENERO ?? item.id ?? index + 1,
                NOMBRE_RCOGENERO: String(item.NOMBRE_RCOGENERO ?? item.nombre ?? '').trim(),
                FECHAINGRESO_RCOGENERO: item.FECHAINGRESO_RCOGENERO ?? item.FECHAINGRESO_RCOGENERO ?? null
            }))

            setListaGenerol(parsedList)
            setGeneroSeleccionado((prev) =>{
                if(!prev) return null

                const prevId = String(prev.ID_RCOGENERO ?? prev.id)
                const matched = parsedList.find(
                    (g) => String(g.ID_RCOGENERO ?? g.id) === prevId
                )
                return matched || null
            })
        }catch(error: any){
            Toast.fire({
                icon:'error',
                title:'No se pudo cargar la lista de Generos'
            })
        }finally{
            setLoadingGenerol(false)
        }
    }, [])

    useEffect(()=>{
        if(autoFetch){fetchGenerol()}
    },[autoFetch, fetchGenerol])

    const handleOpen = useCallback(
        (generol?: GeneroLib) =>{
            if(generol){
                setGeneroEnEdicion(generol)
                setNombreGenerol(generol.NOMBRE_RCOGENERO || '')
            }else{
                setGeneroEnEdicion(null)
                setNombreGenerol('')
            }
            if(setVisibleProp){
                setVisibleProp(true)
            }else{
                setInternalVisble(true)
            }
        },[setVisibleProp]
    )

    const handleClose = useCallback(()=>{
        if(setVisibleProp){
            setVisibleProp(false)
        }else{
            setInternalVisble(false)
        }
        setGeneroEnEdicion(null)
        setNombreGenerol('')
    },[setVisibleProp])

    const generolFiltrado = useMemo(()=>{
        const sorted = [...listaGenerol].sort((a,b) =>{
            const numA = Number(a.ID_RCOGENERO ?? a.id)
            const numB = Number (b.ID_RCOGENERO ?? b.id)

            if(!isNaN(numA) && !isNaN(numB)){
                return numA - numB
            }
            return String(a.NOMBRE_RCOGENERO).localeCompare(String(b.NOMBRE_RCOGENERO), undefined,{
                numeric: true
            })
        })

        if(!busquedaGenerol.trim()) return sorted
        const q  = busquedaGenerol.toLowerCase().trim()
        return sorted.filter((gen) =>{
            const nombre = (gen.NOMBRE_RCOGENERO || '').toLowerCase()
            const id = String(gen.ID_RCOGENERO ?? gen.id ?? '').toLowerCase()
            return nombre.includes(q) || id.includes(q)
        }) 
    },[busquedaGenerol,  listaGenerol])

    const handleGuardarGenero = useCallback(
        async (e?: React.FormEvent)=>{
            if (e) e.preventDefault()
        
        if(!nombreGenerol.trim()){
            Swal.fire({
                icon:  'warning',
                title:'Campos requeridos',
                text:'Por favor ingrese el nombre del Género',
                confirmButtonColor:'#0d6efd'
            })
            return
        }

        setGuardando(true)
        try{
            const payload = {
                NOMBRE_RCOGENERO: nombreGenerol.trim(),
                NOMBRE_GENERO: nombreGenerol.trim()
            }
            if(generoEnEdicion){
                const id = generoEnEdicion.ID_RCOGENERO ?? generoEnEdicion.id ?? '';
                await ActualizarGenLib(id, payload)

                Toast.fire({
                    icon:'success',
                    title:'Género actualizado correctamente'
                })

                await fetchGenerol()
                if(notifyActualizado){
                    notifyActualizado({
                        ...generoEnEdicion,
                        ...payload
                    })
                }
            }else{
                const res = await NuevoGenLib(payload)

                Toast.fire({
                    icon:'success',
                    title:'Género registrado con éxito'
                })

                await fetchGenerol()
                if(notifyCreado){
                    notifyCreado(
                        res?.data || 
                        res || {
                            id:Date.now(),
                            ...payload
                        }
                    )
                }
            }

            handleClose()
        }catch (error: any){
            const errorMsg =
            error?.response?.data?. message ||
            'Error al procesar la  solicitud requeridda'
            Swal.fire({
                icon:'error',
                title:"Error al guardar",
                text: errorMsg,
            })
        } finally{
            setGuardando(false)
        }
    },[
        nombreGenerol, 
        generoEnEdicion, 
        fetchGenerol, 
        notifyActualizado, 
        notifyCreado, 
        handleClose
    ])

    const handleEliminarGnerol = useCallback(
        async (genParam?: GeneroLib) =>{
            const gen = genParam || generoSeleccionado 
            if(!gen) return

            const id = gen.ID_RCOGENERO ?? gen.id
            if(!id) return

            const confirmResult =  await Swal.fire({
                title:' Eliminar Genero?',
                text: `Estas seguro de que quieres eliminar el genero "${gen.NOMBRE_RCOGENERO}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor:'#dc3545',
                cancelButtonColor:'#6c757d',
                confirmButtonText:'Si, Eliminar',
                cancelButtonText:'Cancelar'
            })

            if(confirmResult.isConfirmed){
                try{
                    await EliminarGenLib(id)
                    Toast.fire({
                        icon:'success',
                        title:'Genero Eliminado con exito'
                    })

                    if(
                        generoSeleccionado &&
                        String(generoSeleccionado.ID_RCOGENERO ?? generoSeleccionado.id) === String(id)
                    ){
                        setGeneroSeleccionado(null)
                    }await fetchGenerol()
                    if(notifyEliminado){
                        notifyEliminado(id)
                    }
                }catch(error:any){
                    const msg =
                    error?.response?.data?.message ||
                    error?.response?.message ||
                    error?.message ||
                    'Error al eliminar el Genero'

                    Swal.fire({
                        icon:'error',
                        title:'Error al Eliminar',
                        text: msg,
                        confirmButtonColor: '#0d6efd'
                    })
                }
            }
        },[generoSeleccionado, fetchGenerol, notifyEliminado]
    )
    return {
        isVisible,
        isControlled,
        loadingGenerol,
        loadingGeneros: loadingGenerol,
        setLoadingGenerol,
        setLoadingGeneros: setLoadingGenerol,
        busquedaGenerol,
        busquedagenero: busquedaGenerol,
        setBusquedaGenerol,
        setBusquedaGenero: setBusquedaGenerol,
        listaGenerol,
        listaGeneros: listaGenerol,
        setListaGenerol,
        setListaGeneros: setListaGenerol,
        generoSeleccionado,
        setGeneroSeleccionado,
        generoEnEdicion,
        setGeneroEnEdicion,
        nombreGenerol,
        nombreGenero: nombreGenerol,
        setNombreGenerol,
        setNombreGenero: setNombreGenerol,
        guardando,
        handleOpen,
        handleClose,
        generolFiltrado,
        generoFiltrados: generolFiltrado,
        handleGuardarGenero,
        handleEliminarGnerol,
        handleEliminarGenero: handleEliminarGnerol,
        fetchGenerol,
        fetchGeneros: fetchGenerol,
    }
}

export const useGenero = useGeneroL
export default useGeneroL