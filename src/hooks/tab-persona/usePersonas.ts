import { useState, useEffect, useCallback, useRef } from 'react'
import Swal from 'sweetalert2'
import { Persona } from '@/models/tab/persona.model'
import { usePermissions } from '@/context/PermissionsContext'
import {
  ActualizarPersonaNueva,
  CrearPersonas,
  EliminarPersona,
  listarPersonas,
  PersonaEstado,
  PersonaNueva,
  verPersonas,
} from '@/Service/tab/Persona'

export interface PersonaColumnFilters {
  identificacion?: string
  nombre?: string
  apellido?: string
  email?: string
  estado?: string
  sancionado?: string
}

export const isUserSancionado = (u: any): boolean =>
  Boolean(
    u.ESTADO_SANCION === 1 ||
    u.ESTADO_SANCION === '1' ||
    u.ESTADO_PERSONA === 2 ||
    u.ESTADO_PERSONA === '2' ||
    (u.DETALLE_SANCION && !String(u.DETALLE_SANCION).toLowerCase().includes('sin sancion'))
  )



const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})

const formatApiError = (error: any, defaultMsg: string): string => {
  const data = error?.response?.data
  if (!data) return error?.message || defaultMsg
  if (typeof data === 'string') return data
  if (data.errors && typeof data.errors === 'object') {
    const msgs = Object.entries(data.errors)
      .map(([field, msgList]: [string, any]) => {
        const text = Array.isArray(msgList) ? msgList.join(', ') : String(msgList)
        return `${field}: ${text}`
      })
      .join(' | ')
    if (msgs) return msgs
  }
  if (data.message && typeof data.message === 'string') return data.message
  if (data.error && typeof data.error === 'string') return data.error
  if (data.msg && typeof data.msg === 'string') return data.msg
  return defaultMsg
}

export const deduplicarPersonas = (lista: any[]): any[] => {
  if (!Array.isArray(lista) || lista.length === 0) return []
  const map = new Map<string, any>()
  for (const item of lista) {
    if (!item) continue
    const key = String(
      item.ID_PERSONA ?? item.id ?? item.IDENTIFICACION_PERSONA ?? item.identificacion ?? ''
    ).trim()
    if (!key) continue

    if (!map.has(key)) {
      map.set(key, { ...item })
    } else {
      const existing = map.get(key)
      // Fusionar detalles de sanción para no perder información
      const detalleExistente = (existing.DETALLE_SANCION || '').trim()
      const detalleNuevo = (item.DETALLE_SANCION || '').trim()

      if (!detalleExistente && detalleNuevo) {
        existing.DETALLE_SANCION = detalleNuevo
      } else if (
        detalleExistente &&
        detalleNuevo &&
        detalleExistente !== detalleNuevo &&
        !detalleExistente.toLowerCase().includes(detalleNuevo.toLowerCase())
      ) {
        existing.DETALLE_SANCION = `${detalleExistente} | ${detalleNuevo}`
      }

      // Si cualquiera de las filas tiene sanción activa, prevalece
      if (
        item.ESTADO_SANCION === 1 ||
        item.ESTADO_SANCION === '1' ||
        item.ESTADO_PERSONA === 2 ||
        item.ESTADO_PERSONA === '2'
      ) {
        existing.ESTADO_SANCION = 1
      }

      // Preservar fechas de sanción si el nuevo las tiene
      if (!existing.FECHAINICIO_SANCION && item.FECHAINICIO_SANCION) {
        existing.FECHAINICIO_SANCION = item.FECHAINICIO_SANCION
      }
      if (!existing.FECHAFIN_SANCION && item.FECHAFIN_SANCION) {
        existing.FECHAFIN_SANCION = item.FECHAFIN_SANCION
      }

      // Preservar fechas de inscripción
      if (!existing.FECHAINICIO_INSCRIPCION && item.FECHAINICIO_INSCRIPCION) {
        existing.FECHAINICIO_INSCRIPCION = item.FECHAINICIO_INSCRIPCION
      }
      if (!existing.FECHAFIN_INSCRIPCION && item.FECHAFIN_INSCRIPCION) {
        existing.FECHAFIN_INSCRIPCION = item.FECHAFIN_INSCRIPCION
      }
      if (!existing.COSTO_INSCRIPCION && item.COSTO_INSCRIPCION) {
        existing.COSTO_INSCRIPCION = item.COSTO_INSCRIPCION
      }
    }
  }
  return Array.from(map.values())
}

interface InfoPaginacion {
  items: any[]
  total: number
  perPage: number
  lastPage: number
  currentPage: number
}

const extraerInfoPaginacion = (res: any): InfoPaginacion => {
  let items: any[] = []
  let total = 0
  let perPage = 10
  let lastPage = 1
  let currentPage = 1

  if (!res) {
    return { items, total, perPage, lastPage, currentPage }
  }

  if (Array.isArray(res)) {
    items = res
  } else if (Array.isArray(res?.data?.data)) {
    items = res.data.data
  } else if (Array.isArray(res?.data)) {
    items = res.data
  } else if (Array.isArray(res?.personas?.data)) {
    items = res.personas.data
  } else if (Array.isArray(res?.personas)) {
    items = res.personas
  } else if (Array.isArray(res?.usuarios?.data)) {
    items = res.usuarios.data
  } else if (Array.isArray(res?.usuarios)) {
    items = res.usuarios
  }

  const metaSource =
    (res?.meta && typeof res.meta === 'object') ? res.meta :
    (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) ? res.data :
    (res?.personas && typeof res.personas === 'object' && !Array.isArray(res.personas)) ? res.personas :
    (typeof res === 'object' && !Array.isArray(res)) ? res :
    null

  if (metaSource) {
    if (metaSource.total !== undefined && metaSource.total !== null) {
      total = Number(metaSource.total) || 0
    }
    if (metaSource.per_page !== undefined && metaSource.per_page !== null) {
      perPage = Number(metaSource.per_page) || 10
    } else if (metaSource.perpage !== undefined && metaSource.perpage !== null) {
      perPage = Number(metaSource.perpage) || 10
    }
    if (metaSource.last_page !== undefined && metaSource.last_page !== null) {
      lastPage = Number(metaSource.last_page) || 1
    }
    if (metaSource.current_page !== undefined && metaSource.current_page !== null) {
      currentPage = Number(metaSource.current_page) || 1
    }
  }

  items = deduplicarPersonas(items)

  if (total === 0 && items.length > 0) {
    total = items.length
  } else if (total > 0 && total <= perPage) {
    total = items.length
  }
  if (lastPage === 1 && total > 0 && perPage > 0) {
    lastPage = Math.max(1, Math.ceil(total / perPage))
  }

  return { items, total, perPage, lastPage, currentPage }
}

const usePersonas = (autoFetch: boolean = true) => {
  const { canDoAction } = usePermissions()
  const [personas, setPersonas] = useState<(Persona | any)[]>([])
  const [personasNuevas, setPersonasNuevas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [porPagina, setPorPagina] = useState(10)
  const [columnFilters, setColumnFilters] = useState<PersonaColumnFilters>({})
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [tableKey, setTableKey] = useState<number>(0)
  const columnFiltersRef = useRef<PersonaColumnFilters>({})
  const currentSearchRef = useRef<string>('')
  const lastSearchTermRef = useRef<string>('')
  const searchDebounceRef = useRef<any>(null)

  const [modalRegister, setModalRegister] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Persona | any | null>(null)
  const [details, setDetails] = useState<(number | string)[]>([])

  const toggleDetails = (id: number | string) => {
    setDetails((prev) => (prev.includes(id) ? [] : [id]))
  }

  const handleAbrirEditar = (item: any) => {
    setSelectedUser(item)
    setModalEdit(true)
  }

  const parseDateFallback = (val: any): number => {
    if (!val) return 0
    if (val instanceof Date) return isNaN(val.getTime()) ? 0 : val.getTime()
    if (typeof val === 'number') return isNaN(val) ? 0 : val
    const s = String(val).trim()
    if (!s || s === 'No registrada' || s.startsWith('0000') || s.startsWith('1970')) return 0

    const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
    if (dmy) {
      const d = new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10))
      if (!isNaN(d.getTime())) return d.getTime()
    }
    const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
    if (ymd) {
      const d = new Date(parseInt(ymd[1], 10), parseInt(ymd[2], 10) - 1, parseInt(ymd[3], 10))
      if (!isNaN(d.getTime())) return d.getTime()
    }
    const yearMatch = s.match(/\b(20[1-3]\d)\b/)
    if (yearMatch) return new Date(parseInt(yearMatch[1], 10), 0, 1).getTime()
    const parsed = new Date(s.replace(' ', 'T')).getTime()
    return isNaN(parsed) ? 0 : parsed
  }

  const ordenarPorFechaReciente = (lista: any[]) => {
    if (!Array.isArray(lista)) return []
    const deduped = deduplicarPersonas(lista)
    return [...deduped].sort((a: any, b: any) => {
      const rawA = a?.FECHAINICIO_INSCRIPCION ?? a?.FECHAREGISTRO_PERSONA ?? ''
      const rawB = b?.FECHAINICIO_INSCRIPCION ?? b?.FECHAREGISTRO_PERSONA ?? ''

      const timeA = parseDateFallback(rawA)
      const timeB = parseDateFallback(rawB)

      if (timeA !== timeB) {
        return timeB - timeA
      }

      const idA = Number(a?.ID_PERSONA || a?.id || 0)
      const idB = Number(b?.ID_PERSONA || b?.id || 0)
      return idB - idA
    })
  }

  const fetchPersonas = useCallback(
    (
      page?: number,
      perPage?: number,
      search?: string,
      clearSearch?: boolean,
      customFilters?: PersonaColumnFilters
    ) => {
      const isSearchParamGiven = typeof search === 'string'

      let areFiltersChanged = false
      if (customFilters !== undefined) {
        const prevF = JSON.stringify(columnFiltersRef.current)
        const nextF = JSON.stringify(customFilters)
        if (prevF !== nextF) {
          areFiltersChanged = true
          columnFiltersRef.current = customFilters
          setColumnFilters(customFilters)
        }
      }

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }

      const executeFetch = async () => {
        const targetUiPage =
          typeof page === 'number' && page > 0 ? page : (typeof page === 'number' ? 1 : paginaActual)
        let validUiPage = targetUiPage
        const S = typeof perPage === 'number' && perPage > 0 ? perPage : porPagina

        if (clearSearch) {
          currentSearchRef.current = ''
          lastSearchTermRef.current = ''
          columnFiltersRef.current = {}
          setColumnFilters({})
          setSearchTerm('')
          setTableKey((k) => k + 1)
          setDetails([])
        } else if (isSearchParamGiven) {
          const trimmed = search.trim()
          currentSearchRef.current = trimmed
          setSearchTerm(trimmed)
          validUiPage = 1
        }

        if (areFiltersChanged) {
          validUiPage = 1
        }

        const filters = columnFiltersRef.current || {}
        const actualSearch = currentSearchRef.current || undefined
        const estadoFilter = (filters.estado || '').trim()
        const sancionadoFilter = (filters.sancionado || '').trim()

        setLoading(true)
        setErrorMsg(null)

        try {
          // Mapeo de filtros: estado (1=Activo, 0=Inactivo) y sanción (1=Con sanción, 0=Sin sanción)
          let estadoParam: number | undefined = undefined
          if (estadoFilter === 'Activo') {
            estadoParam = 1
          } else if (estadoFilter === 'Inactivo') {
            estadoParam = 0
          }

          let sancionParam: number | undefined = undefined
          if (sancionadoFilter === 'Con sanción' || sancionadoFilter === 'Sancionado') {
            sancionParam = 1
          } else if (sancionadoFilter === 'Sin sanción') {
            sancionParam = 0
          }

          // Determinar término para búsqueda en backend
          const idF = (filters.identificacion || '').trim()
          const nomF = (filters.nombre || '').trim()
          const apeF = (filters.apellido || '').trim()
          const emailF = (filters.email || '').trim()
          const genF = (actualSearch || '').trim()

          let backendTerm: string | undefined = undefined
          if (idF) {
            backendTerm = idF
          } else if (nomF && apeF) {
            backendTerm = `${nomF} ${apeF}`.trim()
          } else if (nomF) {
            backendTerm = nomF
          } else if (apeF) {
            backendTerm = apeF
          } else if (genF) {
            backendTerm = genF
          } else if (emailF) {
            backendTerm = emailF.includes('@') ? emailF.split('@')[0] : emailF
          }

          // Petición directa al backend con paginación y filtros nativos
          const res = await listarPersonas(validUiPage, S, backendTerm, estadoParam, sancionParam)
          const info = extraerInfoPaginacion(res)

          let pageItems = info.items || []

          // Filtro local complementario para campos adicionales si se ingresaron
          if (emailF) {
            pageItems = pageItems.filter((u: any) => {
              const em = String(u.CORREO_PERSONA || u.correo || u.email || '').toLowerCase()
              return em.includes(emailF.toLowerCase())
            })
          }
          if (idF && !backendTerm) {
            pageItems = pageItems.filter((u: any) => {
              const id = String(u.IDENTIFICACION_PERSONA || u.identificacion || '').toLowerCase()
              return id.includes(idF.toLowerCase())
            })
          }

          const totalItems = info.total > 0 ? info.total : pageItems.length
          const totalPages = info.lastPage > 0 ? info.lastPage : Math.max(1, Math.ceil(totalItems / S))
          const currentPageNum = info.currentPage > 0 ? info.currentPage : validUiPage

          setPersonas(ordenarPorFechaReciente(pageItems))
          setPaginaActual(currentPageNum)
          setTotalPaginas(totalPages)
          setTotalRegistros(totalItems)
          setPorPagina(S)
        } catch (error: any) {
          console.error('[usePersonas] Error al obtener clientes:', error)
          const msg = formatApiError(error, 'Error al obtener la lista de clientes.')
          setErrorMsg(msg)
          Toast.fire({ icon: 'error', title: msg })
        } finally {
          setLoading(false)
        }
      }

      if (!clearSearch && (isSearchParamGiven || areFiltersChanged)) {
        searchDebounceRef.current = setTimeout(executeFetch, 350)
      } else {
        return executeFetch()
      }
    },
    [paginaActual, porPagina],
  )

  const handleRecargar = useCallback(async () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    await fetchPersonas(1, porPagina, '', true, {})
  }, [fetchPersonas, porPagina])

  const handleColumnFilterChange = useCallback(
    (filters: PersonaColumnFilters) => {
      fetchPersonas(1, porPagina, undefined, false, filters)
    },
    [fetchPersonas, porPagina],
  )


  const handleCrearPersonaNew = async (data: any) => {
    setGuardando(true)
    try {
      await CrearPersonas(data)
      Toast.fire({ icon: 'success', title: 'Registrado correctamente' })
      await fetchPersonas(1, porPagina, undefined, true)
      return true
    } catch (e: any) {
      console.error('Error detallado de backend al registrar con personaNew:', e?.response?.data || e)
      Swal.fire('Error', formatApiError(e, 'Error al registrar'), 'error')
      return false
    } finally {
      setGuardando(false)
    }
  }

  const fetchPersonasNuevas = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const response = await PersonaNueva(true)
      let list: any[] = []
      if (Array.isArray(response)) {
        list = response
      } else if (Array.isArray(response?.data?.data)) {
        list = response.data.data
      } else if (Array.isArray(response?.data)) {
        list = response.data
      } else if (Array.isArray(response?.personas)) {
        list = response.personas
      }
      setPersonasNuevas(list)
    } catch (error: any) {
      const msg = formatApiError(error, 'Error al obtener personas nuevas/renovaciones.')
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCrearPersona = async (personaData: Persona): Promise<boolean> => {
    setGuardando(true)
    try {
      await CrearPersonas(personaData)
      Toast.fire({ icon: 'success', title: 'Persona registrada exitosamente' })
      await fetchPersonas(1, porPagina, undefined, true)
      return true
    } catch (error: any) {
      console.error('Error detallado de backend al registrar persona:', error?.response?.data || error)
      const msg = formatApiError(error, 'No se pudo registrar la persona')
      Swal.fire('Error', msg, 'error')
      return false
    } finally {
      setGuardando(false)
    }
  }

  const handleActualizarPersona = async (
    id: string | number,
    personaData: any,
  ): Promise<boolean> => {
    setGuardando(true)
    try {
      if (personaData instanceof FormData) {
        await ActualizarPersonaNueva(id, personaData)
      } else {
        await ActualizarPersonaNueva(id, personaData)
      }
      Toast.fire({ icon: 'success', title: 'Datos actualizados correctamente' })
      await fetchPersonas(paginaActual, porPagina)
      return true
    } catch (error: any) {
      console.error('Error detallado de backend al actualizar persona:', error?.response?.data || error)
      const msg = formatApiError(error, 'No se pudo actualizar la persona')
      Swal.fire('Error', msg, 'error')
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
      Toast.fire({ icon: 'success', title: 'Estado actualizado' })
      await fetchPersonas(paginaActual, porPagina)
      return true
    } catch (error: any) {
      const msg = formatApiError(error, 'No se pudo actualizar el estado')
      Toast.fire({ icon: 'error', title: msg })
      return false
    }
  }

  const obtenerPersona = async (id: string | number) => {
    try {
      const res = await verPersonas(id)
      return res?.data || res
    } catch (error: any) {
      Toast.fire({ icon: 'error', title: 'Error al consultar persona' })
      return null
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchPersonas()
    }
  }, [autoFetch, fetchPersonas])



  const handleEliminarPersona = async (id: string | number): Promise<boolean> => {
    if (!canDoAction('btn_eliminar_usuario_gestion_usuario')) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar usuarios.',
      })
      return false
    }
    setGuardando(true)
    try {
      await EliminarPersona(id)
      Toast.fire({ icon: 'success', title: 'Usuario eliminado exitosamente' })
      await fetchPersonas(paginaActual, porPagina)
      return true
    } catch (error: any) {
      console.error('Error al eliminar persona:', error)
      const msg = formatApiError(error, 'No se pudo eliminar el usuario')
      Swal.fire('Error', msg, 'error')
      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    personas,
    personasNuevas,
    loading,
    guardando,
    errorMsg,
    fetchPersonas,
    fetchPersonasNuevas,
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
    selectedUser,
    setSelectedUser,
    details,
    setDetails,
    toggleDetails,
    handleAbrirEditar,
    paginaActual,
    totalPaginas,
    totalRegistros,
    porPagina,
    setPaginaActual,
    setPorPagina,
    columnFilters,
    setColumnFilters,
    handleColumnFilterChange,
    searchTerm,
    setSearchTerm,
    tableKey,
    setTableKey,
    handleRecargar,
  }
}

export { usePersonas }
export default usePersonas
