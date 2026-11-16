import { GeneroLib } from "@/models/rco/generoLb";
import { ActualizarGenLib, EliminarGenLib, ListarGeneroLib, NuevoGenLib } from "@/Service/rco/GenLib";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { usePermissions } from "@/context/PermissionsContext";

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
    const { canDoAction, verificarAccionEnServidor } = usePermissions()

    const canCrearGenero = canDoAction('btn_crear_genero')
    const canGuardarGenero = canDoAction('btn_guardar_genero')
    const canEditarGenero = canDoAction('btn_editar_genero')
    const canActualizarGenero = canDoAction('btn_actualizar_genero')
    const canEliminarGenero = canDoAction('btn_eliminar_genero')
    const canVerInfoGenero = canDoAction('btn_ver_info_genero')

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

    const fetchGenerol = useCallback(async(preserveSelection = true)=>{
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
            if (preserveSelection) {
                setGeneroSeleccionado((prev) =>{
                    if(!prev) return null

                    const prevId = String(prev.ID_RCOGENERO ?? prev.id)
                    const matched = parsedList.find(
                        (g) => String(g.ID_RCOGENERO ?? g.id) === prevId
                    )
                    return matched || null
                })
            } else {
                setGeneroSeleccionado(null)
            }
        }catch(error: any){
            console.error('Error al cargar géneros:', error)
        }finally{
            setLoadingGenerol(false)
        }
    }, [])

    useEffect(()=>{
        if(autoFetch){fetchGenerol()}
    },[autoFetch, fetchGenerol])

    const handleRecargar = useCallback(async () => {
        setBusquedaGenerol('')
        setPaginaActual(1)
        setGeneroSeleccionado(null)
        await fetchGenerol(false)
    }, [fetchGenerol])

    const handleOpen = useCallback(
        (generol?: GeneroLib) =>{
            if(generol){
                if (!canEditarGenero) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso Denegado',
                        text: 'No tienes permisos para editar géneros.',
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Entendido',
                    })
                    return
                }
                setGeneroEnEdicion(generol)
                setNombreGenerol(generol.NOMBRE_RCOGENERO || '')
            }else{
                if (!canCrearGenero) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso Denegado',
                        text: 'No tienes permisos para crear géneros.',
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Entendido',
                    })
                    return
                }
                setGeneroEnEdicion(null)
                setNombreGenerol('')
            }
            if(setVisibleProp){
                setVisibleProp(true)
            }else{
                setInternalVisble(true)
            }
        },[setVisibleProp, canEditarGenero, canCrearGenero]
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

    const [paginaActual, setPaginaActual] = useState(1)
    const itemsPorPagina = 10

    useEffect(()=>{ 
        setPaginaActual(1)
    }, [busquedaGenerol])

    const totalPaginas = Math.max(1, Math.ceil(generolFiltrado.length / itemsPorPagina))

    useEffect(()=>{
        if (paginaActual > totalPaginas){
            setPaginaActual(totalPaginas)
        }
    }, [totalPaginas, paginaActual])

    const generoPaginados = useMemo(() =>{
        const start = (paginaActual -1) * itemsPorPagina
        return generolFiltrado.slice(start, start + itemsPorPagina)
    }, [generolFiltrado, paginaActual, itemsPorPagina])

    const handlePageChange = useCallback((page: number) =>{
        setPaginaActual(page)
    },[])

    const handleGuardarGenero = useCallback(
        async (e?: React.FormEvent)=>{
            if (e) e.preventDefault()
        
        if(!nombreGenerol.trim()){
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor ingrese el nombre del género.',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Entendido',
            })
            return
        }

        if (generoEnEdicion) {
            if (!canActualizarGenero) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso Denegado',
                    text: 'No tienes permisos para actualizar el género.',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido',
                })
                return
            }
            const tienePermiso = await verificarAccionEnServidor('btn_actualizar_genero')
            if (!tienePermiso) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso Denegado',
                    text: 'No tienes permisos para actualizar el género.',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido',
                })
                return
            }
        } else {
            if (!canGuardarGenero) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso Denegado',
                    text: 'No tienes permisos para guardar nuevos géneros.',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido',
                })
                return
            }
            const tienePermiso = await verificarAccionEnServidor('btn_guardar_genero')
            if (!tienePermiso) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso Denegado',
                    text: 'No tienes permisos para guardar nuevos géneros.',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido',
                })
                return
            }
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

                Swal.fire({
                    icon: 'success',
                    title: '¡Género actualizado!',
                    text: 'El género fue actualizado correctamente.',
                    timer: 1800,
                    showConfirmButton: false,
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

                Swal.fire({
                    icon: 'success',
                    title: '¡Género registrado!',
                    text: 'El género fue registrado con éxito.',
                    timer: 1800,
                    showConfirmButton: false,
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
            error?.response?.data?.message ||
            'Error al procesar la solicitud con el servidor.'
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: errorMsg,
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Entendido',
            })
        } finally{
            setGuardando(false)
        }
    },[
        nombreGenerol, 
        generoEnEdicion, 
        canActualizarGenero,
        canGuardarGenero,
        fetchGenerol, 
        notifyActualizado, 
        notifyCreado, 
        handleClose
    ])

    const handleEliminarGnerol = useCallback(
        async (genParam?: GeneroLib) =>{
            if (!canEliminarGenero) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso Denegado',
                    text: 'No tienes permisos para eliminar géneros.',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido',
                })
                return
            }

            const gen = genParam || generoSeleccionado 
            if(!gen) return

            const id = gen.ID_RCOGENERO ?? gen.id
            if(!id) return

            const confirmResult =  await Swal.fire({
                title: '¿Eliminar género?',
                text: `¿Estás seguro de que deseas eliminar el género "${gen.NOMBRE_RCOGENERO}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            })

            if(confirmResult.isConfirmed){
                const tienePermiso = await verificarAccionEnServidor('btn_eliminar_genero')
                if (!tienePermiso) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso Denegado',
                        text: 'No tienes permisos para eliminar géneros.',
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Entendido',
                    })
                    return
                }

                try{
                    await EliminarGenLib(id)
                    Swal.fire({
                        icon: 'success',
                        title: '¡Género eliminado!',
                        text: 'El género fue eliminado con éxito.',
                        timer: 1800,
                        showConfirmButton: false,
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
                    'Error al intentar eliminar el género.'

                    Swal.fire({
                        icon: 'error',
                        title: 'Error al eliminar',
                        text: msg,
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Entendido',
                    })
                }
            }
        },[generoSeleccionado, canEliminarGenero, fetchGenerol, notifyEliminado]
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
        handleRecargar,
        generoPaginados,
        paginaActual,
        totalPaginas,
        totalGeneros: listaGenerol?.length,
        totalFiltrados:generolFiltrado.length,
        handlePageChange,
        canCrearGenero,
        canGuardarGenero,
        canEditarGenero,
        canActualizarGenero,
        canEliminarGenero,
        canVerInfoGenero,
        verificarAccionEnServidor,
    }
}

export const useGenero = useGeneroL
export default useGeneroL