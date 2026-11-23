import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState } from '@/store'
import { TabPersona, ClienteItem, Persona } from '@/models/tab/persona.model'
import { getUserImageUrl } from '@/utils/imageUtils'
import { sanitizarHistorialSanciones } from '@/utils/sancionUtils'
import { formatFecha, calcularFinUnAnio } from '@/utils/dateUtils'
import {
  setRegistrados,
  setPersonaSeleccionada,
  eliminarRegistrado,
} from '@/slices/personaSlice'

export interface FiltrosRegistrados {
  nombre: string
  estado: number | string | null
  sancion: number | string | null
  estado_veto: number | string | null
  per_page: number
}
import {
  PersonasRegistradas,
  PersonasNueva,
  CrearPersonas,
  ActualizarPersonaNueva,
  PersonaEstado,
  EliminarPersona,
  verPersonas,
} from '@/Service/tab/Persona'
import { usePermissions } from '@/hooks/auth/usePermissions'
import { parseApiErrors, showErrorAlert } from '@/utils/errors'

export const getBadge = (estado: string) => {
  switch (estado) {
    case 'Activo':
      return 'success'
    case 'Inactivo':
      return 'danger'
    default:
      return 'secondary'
  }
}

export const getBadgeSancion = (sancionado: string) => {
  const s = String(sancionado || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
  if (s.includes('vet') || s.includes('vida')) {
    return 'danger'
  }
  if (s.includes('sin sancion')) {
    return 'secondary'
  }
  if (s.includes('con sancion') || s.includes('sancionado')) {
    return 'warning'
  }
  return 'secondary'
}

export const mapearPersona = (item: TabPersona | any): ClienteItem => {
  // Identificar si existe inscripción
  const inscActual = extraerInscripcion(item)
  const rawIdInscripcion = inscActual?.ID_INSCRIPCION ?? item.ID_INSCRIPCION
  const rawInicio = inscActual?.FECHAINICIO_INSCRIPCION ?? item.FECHAINICIO_INSCRIPCION
  const rawFin = inscActual?.FECHAFIN_INSCRIPCION ?? item.FECHAFIN_INSCRIPCION
  const rawCosto = inscActual?.COSTO_INSCRIPCION ?? item.COSTO_INSCRIPCION

  const tieneInscripcion = Boolean(
    rawInicio ||
      (rawIdInscripcion !== null &&
        rawIdInscripcion !== undefined &&
        rawIdInscripcion !== '' &&
        rawIdInscripcion !== 0 &&
        rawIdInscripcion !== '0'),
  )

  let inicio_inscripcion = 'Sin inscripción'
  let fin_inscripcion = 'Sin inscripción'

  if (tieneInscripcion) {
    if (rawInicio) {
      inicio_inscripcion = formatFecha(rawInicio)
      const finCalculado = rawFin || calcularFinUnAnio(rawInicio)
      fin_inscripcion = formatFecha(finCalculado)
    } else {
      inicio_inscripcion = 'No registrada'
      fin_inscripcion = 'No registrada'
    }
  }

  // Costo
  let costo = '0.00'
  if (rawCosto !== null && rawCosto !== undefined && rawCosto !== '') {
    const num = parseFloat(String(rawCosto))
    costo = isNaN(num) ? String(rawCosto) : num.toFixed(2)
  } else if (tieneInscripcion) {
    costo = '10.00'
  }

  // Procesar y sanitizar historial de sanciones y vetos
  const rawListSanciones: any[] = []
  if (Array.isArray(item.sanciones)) {
    rawListSanciones.push(...item.sanciones)
  }
  if (Array.isArray(item.vetos)) {
    rawListSanciones.push(...item.vetos)
  }
  if (rawListSanciones.length === 0 && Array.isArray(item.historial_sanciones)) {
    rawListSanciones.push(...item.historial_sanciones)
  }

  const historial_sanciones = sanitizarHistorialSanciones(rawListSanciones)

  // VETO PERMANENTE
  const esVetado = Boolean(
    Number(item.TIENE_VETO_PERMANENTE) === 1 ||
      Number(item.ESTADO_VETO) === 2 ||
      (Array.isArray(item.vetos) && item.vetos.some((v: any) => Number(v.ESTADO_VETO) === 2)) ||
      (String(item.ESTADO || '').toLowerCase().includes('veto') &&
        !String(item.ESTADO || '').toLowerCase().includes('sin veto')),
  )

  // TIENE SANCIÓN ACTIVA
  const esSinSancionExplicito = Boolean(
    Number(item.TIENE_SANCION) === 0 ||
      String(item.ESTADO || '').toLowerCase().includes('sin sancion') ||
      String(item.ESTADO || '').toLowerCase().includes('sin sanción'),
  )

  const tieneSancion =
    !esVetado &&
    !esSinSancionExplicito &&
    Boolean(
      Number(item.TIENE_SANCION) === 1 ||
        Number(item.ESTADO_SANCION) === 1 ||
        (Array.isArray(item.sanciones) && item.sanciones.some((s: any) => Number(s.ESTADO_SANCION) === 1)),
    )

  // SANCIONES PREVIAS
  const tieneSancionPrevia = !esVetado && !tieneSancion && historial_sanciones.length > 0

  // ETIQUETA Y BADGE DE SANCIÓN
  let sancionado: 'Con sanción' | 'Sin sanción' | 'Vetado' = 'Sin sanción'
  if (esVetado) {
    sancionado = 'Vetado'
  } else if (tieneSancion) {
    sancionado = 'Con sanción'
  } else {
    sancionado = 'Sin sanción'
  }

  // FECHAS Y MOTIVOS
  const masActualSancion = historial_sanciones[0]
  const vetoMasActual = historial_sanciones.find((s: any) => Number(s.estado) === 2 || s.fin === 'Indefinido')
  const sancionActiva = historial_sanciones.find((s: any) => Number(s.estado) === 1)

  let inicio_sancion = ''
  let fin_sancion = ''
  let motivo_sancion_actual = ''

  if (esVetado) {
    inicio_sancion = vetoMasActual?.inicio || formatFecha(item.FECHA_VETO) || masActualSancion?.inicio || ''
    fin_sancion = 'Indefinido'
    motivo_sancion_actual =
      (Array.isArray(item.vetos) && item.vetos[0]?.MOTIVO_VETO) ||
      vetoMasActual?.detalle ||
      item.MOTIVO_VETO ||
      'Veto permanente registrado en el sistema'
  } else if (tieneSancion) {
    const sAct = sancionActiva || masActualSancion
    inicio_sancion = sAct?.inicio || formatFecha(item.FECHAINICIO_SANCION) || ''
    fin_sancion = sAct?.fin || formatFecha(item.FECHAFIN_SANCION) || ''
    motivo_sancion_actual = sAct?.detalle || item.DETALLE_SANCION || item.ESTADO || 'Usuario con sanción activa'
  } else if (tieneSancionPrevia) {
    inicio_sancion = masActualSancion?.inicio || ''
    fin_sancion = masActualSancion?.fin || ''
    motivo_sancion_actual = masActualSancion?.detalle || item.DETALLE_SANCION || 'Sanción anterior registrada en el sistema'
  } else {
    motivo_sancion_actual = 'Sin sanciones vigentes'
  }

  const otras_sanciones = historial_sanciones.slice(1)
  const total_sanciones = historial_sanciones.length

  // ESTADO DE LA PERSONA
  const estado: 'Activo' | 'Inactivo' = Number(item.ESTADO_PERSONA) === 1 ? 'Activo' : 'Inactivo'

  const fotoRaw = item.FOTO_PERSONA || item.IMAGEN_PERSONA || ''
  const fotografia = getUserImageUrl(fotoRaw)

  return {
    ...item,
    ID_INSCRIPCION: rawIdInscripcion ?? item.ID_INSCRIPCION,
    fotografia,
    inicio_inscripcion,
    fin_inscripcion,
    costo,
    estado,
    sancionado,
    tiene_sancion: tieneSancion,
    tiene_sancion_previa: tieneSancionPrevia,
    es_vetado: esVetado,
    inicio_sancion,
    fin_sancion,
    motivo_sancion_actual,
    otras_sanciones,
    total_sanciones,
    historial_sanciones,
  }
}

export const isUserVetado = (u: any): boolean => {
  if (!u) return false
  const est = String(u.ESTADO || '').toLowerCase()
  return Boolean(
    Number(u.TIENE_VETO_PERMANENTE) === 1 ||
      Number(u.ESTADO_VETO) === 2 ||
      (Array.isArray(u.vetos) && u.vetos.some((v: any) => Number(v.ESTADO_VETO) === 2)) ||
      (est.includes('veto') && !est.includes('sin veto')),
  )
}

export const isUserSancionado = (u: any): boolean => {
  if (!u) return false
  if (isUserVetado(u)) return false

  const est = String(u.ESTADO || '').toLowerCase()
  if (Number(u.TIENE_SANCION) === 0 || est.includes('sin sancion') || est.includes('sin sanción')) {
    return false
  }

  return Boolean(
    Number(u.TIENE_SANCION) === 1 ||
      Number(u.ESTADO_SANCION) === 1 ||
      (Array.isArray(u.sanciones) && u.sanciones.some((s: any) => Number(s.ESTADO_SANCION) === 1)) ||
      (est.includes('sancion') && !est.includes('sin sancion')),
  )
}

export const debeExcluirDeRegistrados = (item: any): boolean => {
  if (!item) return false
  const estPersona = Number(item.ESTADO_PERSONA)
  const estInsc = Number(item.ESTADOINSCRIPCION_PERSONA)
  return estPersona === 0 && estInsc === 1
}

export const extraerInscripcion = (item: any): any | null => {
  if (!item) return null
  if (Array.isArray(item.inscripciones) && item.inscripciones.length > 0) {
    return item.inscripciones[0]
  }
  if (item.inscripcion && typeof item.inscripcion === 'object') {
    return item.inscripcion
  }
  if (item.ID_INSCRIPCION) {
    return {
      ID_INSCRIPCION: item.ID_INSCRIPCION,
      FECHAINICIO_INSCRIPCION: item.FECHAINICIO_INSCRIPCION,
      FECHAFIN_INSCRIPCION: item.FECHAFIN_INSCRIPCION,
      COSTO_INSCRIPCION: item.COSTO_INSCRIPCION,
      DETALLE_INSCRIPCION: item.DETALLE_INSCRIPCION,
      ESTADO_INSCRIPCION: item.ESTADO_INSCRIPCION,
    }
  }
  return null
}

export const deduplicarPersonas = (lista: any[]): any[] => {
  if (!Array.isArray(lista) || lista.length === 0) return []
  const map = new Map<string, any>()
  for (const item of lista) {
    if (!item) continue
    const key = String(item.ID_PERSONA ?? item.id ?? item.IDENTIFICACION_PERSONA ?? '').trim()
    if (!key) continue
    if (!map.has(key)) {
      map.set(key, item)
    }
  }
  return Array.from(map.values())
}

const usePersonas = (autoFetch: boolean = true) => {
  const dispatch = useDispatch()
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  // Permisos centralizados
  const canCrearUsuario = canDoAction('btn_crear_usuario_gestion_usuario')
  const canGuardarUsuario = canDoAction('btn_guardar_gestion_usuario')
  const canVerDetalles = canDoAction('btn_mostrar_info_gestion_usuario')
  const canEditarUsuario = canDoAction('btn_editar_usuario_gestion_usuario')
  const canActualizarUsuario = canDoAction('btn_actualizar_gestion_usuario')
  const canEliminarUsuario = canDoAction('btn_eliminar_usuario_gestion_usuario')
  const canRenovarUsuario = canDoAction('btn_renovar_usuario_gestion_usuario')
  const canGuardarRenovacion = canDoAction('btn_guardar_renovacion_gestion_usuario')
  const tieneAcciones = canEditarUsuario || canEliminarUsuario || canRenovarUsuario

  // Estado global desde Redux Toolkit
  const personas = useSelector((state: RootState) => state.personas.registrados)
  const paginacionRegistrados = useSelector((state: RootState) => state.personas.paginacionRegistrados)
  const selectedUser = useSelector((state: RootState) => state.personas.personaSeleccionada)

  // Estados locales de UI y Filtros
  const [filtros, setFiltros] = useState<FiltrosRegistrados>({
    nombre: '',
    estado: null,
    sancion: null,
    estado_veto: null,
    per_page: 10,
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [tableKey, setTableKey] = useState<number>(0)
  const [modalRegister, setModalRegister] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [modalRenovaciones, setModalRenovaciones] = useState(false)
  const [details, setDetails] = useState<(number | string)[]>([])

  const isFetchingRef = useRef<boolean>(false)
  const searchDebounceRef = useRef<any>(null)
  const hasMountedRef = useRef<boolean>(false)

  const filtrosRef = useRef(filtros)
  filtrosRef.current = filtros

  const paginacionRef = useRef(paginacionRegistrados)
  paginacionRef.current = paginacionRegistrados

  const toggleDetails = (id: number | string) => {
    if (!canVerDetalles) return
    setDetails((prev) => (prev.includes(id) ? [] : [id]))
  }

  const handleAbrirEditar = (item: any) => {
    if (!canEditarUsuario) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para editar usuarios.'])
      return
    }
    const entidadPura = personas.find((p) => p.ID_PERSONA === item.ID_PERSONA) || item
    dispatch(setPersonaSeleccionada(entidadPura))
    setModalEdit(true)
  }

  const handleAbrirCrear = () => {
    if (!canCrearUsuario) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para registrar usuarios.'])
      return
    }
    setModalRegister(true)
  }

  const handleAbrirRenovar = (item: any) => {
    if (!canRenovarUsuario) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para renovar inscripciones.'])
      return
    }
    const entidadPura = personas.find((p) => p.ID_PERSONA === item.ID_PERSONA) || item
    dispatch(setPersonaSeleccionada(entidadPura))
    setModalRenovaciones(true)
  }

  // Petición al backend conectada directamente a Redux
  const fetchPersonas = useCallback(
    (
      page?: number,
      perPage?: number,
      search?: string,
      clearSearch?: boolean,
      customFilters?: Partial<FiltrosRegistrados>,
    ) => {
      const isSearchParamGiven = typeof search === 'string'

      if (customFilters !== undefined) {
        setFiltros((prev) => ({ ...prev, ...customFilters }))
      }

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }

      const executeFetch = async () => {
        if (isFetchingRef.current) return
        isFetchingRef.current = true

        setLoading(true)
        setErrorMsg(null)

        if (clearSearch) {
          setFiltros({
            nombre: '',
            estado: null,
            sancion: null,
            estado_veto: null,
            per_page: 10,
          })
          setTableKey((k) => k + 1)
          setDetails([])
        } else if (isSearchParamGiven) {
          setFiltros((prev) => ({ ...prev, nombre: search.trim() }))
        }

        const targetPage = typeof page === 'number' && page > 0 ? page : paginacionRef.current.current_page || 1
        const targetPerPage =
          typeof perPage === 'number' && perPage > 0 ? perPage : paginacionRef.current.per_page || 10

        if (targetPage !== paginacionRef.current.current_page) {
          setDetails([])
        }

        const payload: any = {
          page: targetPage,
          nombre: clearSearch ? '' : (isSearchParamGiven ? search.trim() : filtrosRef.current.nombre || ''),
          estado: customFilters?.estado !== undefined ? customFilters.estado : filtrosRef.current.estado,
          sancion: customFilters?.sancion !== undefined ? customFilters.sancion : filtrosRef.current.sancion,
          estado_veto:
            customFilters?.estado_veto !== undefined ? customFilters.estado_veto : filtrosRef.current.estado_veto,
          per_page: targetPerPage,
        }

        try {
          const res = await PersonasRegistradas(payload, { page: targetPage, per_page: targetPerPage })
          dispatch(setRegistrados(res))
        } catch (error: any) {
          console.error('[usePersonas] Error al obtener personas registradas:', error)
          const { title, messages } = parseApiErrors(error, 'Error al consultar usuarios registrados.')
          setErrorMsg(messages.join(', '))
          showErrorAlert(title, messages)
        } finally {
          isFetchingRef.current = false
          setLoading(false)
        }
      }

      if (!clearSearch && isSearchParamGiven) {
        const trimmed = search.trim()
        if (trimmed === (filtrosRef.current.nombre || '') && !customFilters) {
          return
        }
        searchDebounceRef.current = setTimeout(executeFetch, 350)
      } else {
        return executeFetch()
      }
    },
    [dispatch],
  )

  const handleRecargar = useCallback(async () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    setFiltros({
      nombre: '',
      estado: null,
      sancion: null,
      estado_veto: null,
      per_page: 10,
    })
    setTableKey((k) => k + 1)
    setDetails([])
    await fetchPersonas(1, paginacionRegistrados.per_page, '', true)
  }, [fetchPersonas, paginacionRegistrados.per_page])

  const handleColumnFilterChange = useCallback(
    (filters: Record<string, any>) => {
      const estadoFilter = (filters?.estado || '').trim()
      const sancionadoFilter = (filters?.sancionado || '').trim()

      let estadoParam: number | null = null
      if (estadoFilter === 'Activo' || estadoFilter === '1') {
        estadoParam = 1
      } else if (estadoFilter === 'Inactivo' || estadoFilter === '0') {
        estadoParam = 0
      }

      let sancionParam: number | null = null
      let estadoVetoParam: number | null = null

      if (sancionadoFilter === 'Vetado') {
        estadoVetoParam = 2
      } else if (sancionadoFilter === 'Con sanción' || sancionadoFilter === '1') {
        sancionParam = 1
      } else if (sancionadoFilter === 'Sin sanción' || sancionadoFilter === '0') {
        sancionParam = 0
        estadoVetoParam = 0
      }

      const nuevosFiltros: Partial<FiltrosRegistrados> = {
        estado: estadoParam,
        sancion: sancionParam,
        estado_veto: estadoVetoParam,
      }

      // Evitar disparo redundante si los filtros de columna no han cambiado
      if (
        estadoParam === filtrosRef.current.estado &&
        sancionParam === filtrosRef.current.sancion &&
        estadoVetoParam === filtrosRef.current.estado_veto
      ) {
        return
      }

      setFiltros((prev) => ({ ...prev, ...nuevosFiltros }))
      fetchPersonas(1, paginacionRegistrados.per_page, undefined, false, nuevosFiltros)
    },
    [fetchPersonas, paginacionRegistrados.per_page],
  )

  const handleCrearPersona = async (data: FormData | Persona | any): Promise<boolean> => {
    if (!canGuardarUsuario && !canCrearUsuario) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para registrar usuarios.'])
      return false
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_gestion_usuario')
    if (!tienePermiso) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para registrar usuarios.'])
      return false
    }

    setGuardando(true)
    try {
      if (data instanceof FormData) {
        const nom = data.get('NOMBRE_PERSONA')
        if (typeof nom === 'string') data.set('NOMBRE_PERSONA', nom.trim().toUpperCase())
        const ape = data.get('APELLIDO_PERSONA')
        if (typeof ape === 'string') data.set('APELLIDO_PERSONA', ape.trim().toUpperCase())
        await PersonasNueva(data)
      } else {
        const payload = {
          ...data,
          NOMBRE_PERSONA: data.NOMBRE_PERSONA ? String(data.NOMBRE_PERSONA).trim().toUpperCase() : '',
          APELLIDO_PERSONA: data.APELLIDO_PERSONA ? String(data.APELLIDO_PERSONA).trim().toUpperCase() : '',
        }
        await CrearPersonas(payload)
      }
      await fetchPersonas(1, paginacionRegistrados.per_page, undefined, true)
      return true
    } catch (e: any) {
      console.error('[usePersonas] Error al registrar persona:', e)
      const { title, messages } = parseApiErrors(e, 'Error al registrar el usuario.')
      showErrorAlert(title, messages)
      return false
    } finally {
      setGuardando(false)
    }
  }

  const handleCrearPersonaNew = handleCrearPersona

  const handleActualizarPersona = async (
    id: string | number,
    personaData: any,
  ): Promise<boolean> => {
    if (!canActualizarUsuario && !canEditarUsuario) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para actualizar usuarios.'])
      return false
    }

    const tienePermiso = await verificarAccionEnServidor('btn_actualizar_gestion_usuario')
    if (!tienePermiso) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para actualizar usuarios.'])
      return false
    }

    setGuardando(true)
    try {
      if (personaData instanceof FormData) {
        const nom = personaData.get('NOMBRE_PERSONA')
        if (typeof nom === 'string') personaData.set('NOMBRE_PERSONA', nom.trim().toUpperCase())
        const ape = personaData.get('APELLIDO_PERSONA')
        if (typeof ape === 'string') personaData.set('APELLIDO_PERSONA', ape.trim().toUpperCase())
        await ActualizarPersonaNueva(id, personaData)
      } else {
        const payload = {
          ...personaData,
          NOMBRE_PERSONA: personaData.NOMBRE_PERSONA ? String(personaData.NOMBRE_PERSONA).trim().toUpperCase() : '',
          APELLIDO_PERSONA: personaData.APELLIDO_PERSONA ? String(personaData.APELLIDO_PERSONA).trim().toUpperCase() : '',
        }
        await ActualizarPersonaNueva(id, payload)
      }
      await fetchPersonas(paginacionRegistrados.current_page, paginacionRegistrados.per_page)
      return true
    } catch (error: any) {
      console.error('[usePersonas] Error al actualizar persona:', error)
      const { title, messages } = parseApiErrors(error, 'No se pudo actualizar la persona.')
      showErrorAlert(title, messages)
      return false
    } finally {
      setGuardando(false)
    }
  }

  const handleActualizarEstado = async (
    id: string | number,
    nuevoEstado: string | number,
  ): Promise<boolean> => {
    try {
      await PersonaEstado(id, { ESTADO_PERSONA: nuevoEstado })
      Swal.fire({
        icon: 'success',
        title: '¡Estado actualizado!',
        text: 'El estado del usuario se actualizó correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })
      await fetchPersonas(paginacionRegistrados.current_page, paginacionRegistrados.per_page)
      return true
    } catch (error: any) {
      const { title, messages } = parseApiErrors(error, 'No se pudo actualizar el estado.')
      showErrorAlert(title, messages)
      return false
    }
  }

  const obtenerPersona = async (id: string | number) => {
    try {
      const res = await verPersonas(id)
      return res?.data || res
    } catch (error: any) {
      showErrorAlert('Error al consultar', ['No se pudo consultar la información del usuario.'])
      return null
    }
  }

  const handleEliminarPersona = async (id: string | number): Promise<boolean> => {
    if (!canEliminarUsuario) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para eliminar usuarios.'])
      return false
    }

    const tienePermiso = await verificarAccionEnServidor('btn_eliminar_usuario_gestion_usuario')
    if (!tienePermiso) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para eliminar usuarios.'])
      return false
    }

    setGuardando(true)
    try {
      await EliminarPersona(id)
      dispatch(eliminarRegistrado(id))
      await fetchPersonas(paginacionRegistrados.current_page, paginacionRegistrados.per_page)
      return true
    } catch (error: any) {
      console.error('[usePersonas] Error al eliminar persona:', error)
      const errStr = JSON.stringify(error?.response?.data || error?.message || '').toLowerCase()
      let msg = 'No se pudo eliminar el usuario.'
      if (
        errStr.includes('prestamo') ||
        errStr.includes('préstamo') ||
        errStr.includes('foreign key') ||
        errStr.includes('constraint') ||
        errStr.includes('1451') ||
        errStr.includes('tab_prestamo')
      ) {
        msg = 'No se puede eliminar el usuario porque se encuentra en préstamo o tiene registros asociados en el sistema.'
      }
      showErrorAlert('No se puede eliminar', [msg])
      return false
    } finally {
      setGuardando(false)
    }
  }

  useEffect(() => {
    if (autoFetch && !hasMountedRef.current) {
      hasMountedRef.current = true
      fetchPersonas(1)
    }
  }, [autoFetch, fetchPersonas])

  const totalCalculado = paginacionRegistrados.total ?? personas.length
  const porPaginaVal = paginacionRegistrados.per_page || 10
  const totalPaginasCalculado =
    paginacionRegistrados.last_page || Math.max(1, Math.ceil(totalCalculado / porPaginaVal))

  const items = useMemo(() => {
    const rawList = personas || []
    return rawList
      .filter((item: any) => !debeExcluirDeRegistrados(item))
      .map((item: any) => mapearPersona(item))
  }, [personas])

  return {
    items,
    getBadge,
    getBadgeSancion,
    personas,
    loading,
    guardando,
    errorMsg,
    fetchPersonas,
    handleCrearPersona,
    handleActualizarPersona,
    handleActualizarEstado,
    handleEliminarPersona,
    handleCrearPersonaNew,
    obtenerPersona,
    modalRegister,
    setModalRegister,
    modalEdit,
    setModalEdit,
    modalRenovaciones,
    setModalRenovaciones,
    selectedUser,
    setSelectedUser: (user: any) => {
      const entidadPura = user?.ID_PERSONA
        ? personas.find((p) => p.ID_PERSONA === user.ID_PERSONA) || user
        : user
      dispatch(setPersonaSeleccionada(entidadPura))
    },
    details,
    setDetails,
    toggleDetails,
    handleAbrirEditar,
    handleAbrirCrear,
    handleAbrirRenovar,
    paginaActual: paginacionRegistrados.current_page || 1,
    totalPaginas: totalPaginasCalculado,
    totalRegistros: totalCalculado,
    porPagina: porPaginaVal,
    setPaginaActual: (page: number) => fetchPersonas(page, porPaginaVal),
    setPorPagina: (perPage: number) => fetchPersonas(1, perPage),
    columnFilters: filtros,
    setColumnFilters: (filters: Partial<FiltrosRegistrados>) => {
      setFiltros((prev) => ({ ...prev, ...filters }))
    },
    handleColumnFilterChange,
    searchTerm: filtros.nombre || '',
    setSearchTerm: (term: string) => {
      setFiltros((prev) => ({ ...prev, nombre: term }))
      fetchPersonas(1, porPaginaVal, term)
    },
    tableKey,
    setTableKey,
    handleRecargar,
    canCrearUsuario,
    canGuardarUsuario,
    canVerDetalles,
    canEditarUsuario,
    canActualizarUsuario,
    canEliminarUsuario,
    canRenovarUsuario,
    canGuardarRenovacion,
    canEditar: canEditarUsuario,
    canEliminar: canEliminarUsuario,
    canRenovar: canRenovarUsuario,
    tieneAcciones,
    verificarAccionEnServidor,
  }
}

export { usePersonas }
export default usePersonas
