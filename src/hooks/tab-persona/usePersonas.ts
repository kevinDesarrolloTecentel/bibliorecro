import { useState, useEffect, useCallback, useRef } from 'react'
import Swal from 'sweetalert2'
import { Persona } from '@/models/tab/persona.model'
import {
  ActualizarPersonaNueva,
  actualizarPersona,
  CrearPersonas,
  EliminarPersona,
  listarPersonas,
  PersonaEstado,
  PersonaNueva,
  verPersonas,
} from '@/Service/tab/Persona'



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

  if (total === 0 && items.length > 0) {
    total = items.length
  }
  if (lastPage === 1 && total > 0 && perPage > 0) {
    lastPage = Math.max(1, Math.ceil(total / perPage))
  }

  return { items, total, perPage, lastPage, currentPage }
}

const usePersonas = (autoFetch: boolean = true) => {
  const [personas, setPersonas] = useState<(Persona | any)[]>([])
  const [personasNuevas, setPersonasNuevas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [porPagina, setPorPagina] = useState(60)
  const knownTotal = useRef<number>(3764)
  const knownBackendPerPage = useRef<number>(10)
  const backendPageCache = useRef<Map<number, any[]>>(new Map())
  const [modalRegister, setModalRegister] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Persona | any | null>(null)
  const [details, setDetails] = useState<(number | string)[]>([])

  const toggleDetails = (id: number | string) => {
    setDetails((prev) => {
      const position = prev.indexOf(id)
      if (position === -1) {
        return [...prev, id]
      }
      const newDetails = [...prev]
      newDetails.splice(position, 1)
      return newDetails
    })
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
    return [...lista].sort((a: any, b: any) => {
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
    async (page?: number, perPage?: number, search?: string, clearCache?: boolean) => {
      const targetUiPage = typeof page === 'number' && page > 0 ? page : 1
      const actualPerPage = typeof perPage === 'number' && perPage > 0 ? perPage : porPagina
      const actualSearch = typeof search === 'string' && search.trim().length > 0 ? search.trim() : undefined

      if (clearCache) {
        backendPageCache.current.clear()
      }

      setLoading(true)
      setErrorMsg(null)

      try {
        if (actualSearch) {
          backendPageCache.current.clear()
          const response = await listarPersonas(targetUiPage, actualPerPage, actualSearch)
          const info = extraerInfoPaginacion(response)
          setTotalPaginas(info.lastPage || 1)
          setTotalRegistros(info.total || info.items.length)
          setPaginaActual(targetUiPage)
          setPersonas(ordenarPorFechaReciente(info.items))
          return
        }

        const S = actualPerPage
        let B = knownBackendPerPage.current || 10
        let T = knownTotal.current || 3764

        let itemEnd = T - (targetUiPage - 1) * S
        let itemStart = Math.max(1, T - targetUiPage * S + 1)

        let bFirst = Math.max(1, Math.floor((itemStart - 1) / B) + 1)
        let bLast = Math.max(1, Math.floor((itemEnd - 1) / B) + 1)

        const missingPages: number[] = []
        for (let b = bFirst; b <= bLast; b++) {
          if (!backendPageCache.current.has(b)) {
            missingPages.push(b)
          }
        }

        if (missingPages.length > 0) {
          const results = await Promise.allSettled(
            missingPages.map((b) => listarPersonas(b, B))
          )

          let metadataChanged = false
          results.forEach((result, idx) => {
            const bPage = missingPages[idx]
            if (result.status === 'fulfilled') {
              const info = extraerInfoPaginacion(result.value)
              backendPageCache.current.set(bPage, info.items)

              if (info.total > 0 && info.total !== knownTotal.current) {
                knownTotal.current = info.total
                T = info.total
                metadataChanged = true
              }
              if (info.perPage > 0 && info.perPage !== knownBackendPerPage.current) {
                knownBackendPerPage.current = info.perPage
                B = info.perPage
                metadataChanged = true
              }
            } else {
              console.warn(`[usePersonas] Página ${bPage} no pudo cargarse:`, result.reason)
              backendPageCache.current.set(bPage, [])
            }
          })

          if (metadataChanged) {
            itemEnd = T - (targetUiPage - 1) * S
            itemStart = Math.max(1, T - targetUiPage * S + 1)
            bFirst = Math.max(1, Math.floor((itemStart - 1) / B) + 1)
            bLast = Math.max(1, Math.floor((itemEnd - 1) / B) + 1)

            const extraMissing: number[] = []
            for (let b = bFirst; b <= bLast; b++) {
              if (!backendPageCache.current.has(b)) {
                extraMissing.push(b)
              }
            }
            if (extraMissing.length > 0) {
              const extraResults = await Promise.allSettled(
                extraMissing.map((b) => listarPersonas(b, B))
              )
              extraResults.forEach((res, idx) => {
                const bPage = extraMissing[idx]
                if (res.status === 'fulfilled') {
                  const info = extraerInfoPaginacion(res.value)
                  backendPageCache.current.set(bPage, info.items)
                } else {
                  backendPageCache.current.set(bPage, [])
                }
              })
            }
          }
        }

        const pageItems: any[] = []
        for (let b = bFirst; b <= bLast; b++) {
          const itemsDePagina = backendPageCache.current.get(b) || []
          itemsDePagina.forEach((item: any, idx: number) => {
            const globalIdx = (b - 1) * B + idx + 1
            if (globalIdx >= itemStart && globalIdx <= itemEnd) {
              pageItems.push(item)
            }
          })
        }

        // Si no se obtuvieron registros mediante cálculo inverso, usar consulta directa como respaldo
        if (pageItems.length === 0) {
          try {
            const fallbackRes = await listarPersonas(targetUiPage, actualPerPage)
            const fallbackInfo = extraerInfoPaginacion(fallbackRes)
            if (fallbackInfo.items.length > 0) {
              setTotalPaginas(fallbackInfo.lastPage || 1)
              setTotalRegistros(fallbackInfo.total || fallbackInfo.items.length)
              setPaginaActual(targetUiPage)
              setPorPagina(actualPerPage)
              setPersonas(ordenarPorFechaReciente(fallbackInfo.items))
              return
            }
          } catch (e) {
            console.warn('[usePersonas] Fallback de paginación falló:', e)
          }
        }

        const totalUiPages = Math.max(1, Math.ceil(T / S))
        const sortedItems = ordenarPorFechaReciente(pageItems)

        setTotalPaginas(totalUiPages)
        setTotalRegistros(T)
        setPaginaActual(targetUiPage)
        setPorPagina(S)
        setPersonas(sortedItems)
      } catch (error: any) {
        console.error('[usePersonas] Error al obtener clientes:', error)
        if (personas.length === 0) {
          const msg = formatApiError(error, 'Error al obtener la lista de clientes.')
          setErrorMsg(msg)
          Toast.fire({ icon: 'error', title: msg })
        }
      } finally {
        setLoading(false)
      }
    },
    [porPagina],
  )


  const handleCrearPersonaNew = async (data: any) => {
    setGuardando(true)
    try {
      await CrearPersonas(data)
      Toast.fire({ icon: 'success', title: 'Registrado correctamente' })
      backendPageCache.current.clear()
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
      backendPageCache.current.clear()
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
        await actualizarPersona(id, personaData)
      }
      Toast.fire({ icon: 'success', title: 'Datos actualizados correctamente' })
      backendPageCache.current.clear()
      await fetchPersonas(paginaActual, porPagina, undefined, true)
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
      backendPageCache.current.clear()
      await fetchPersonas(paginaActual, porPagina, undefined, true)
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
    setGuardando(true)
    try {
      await EliminarPersona(id)
      Toast.fire({ icon: 'success', title: 'Usuario eliminado exitosamente' })
      backendPageCache.current.clear()
      await fetchPersonas(paginaActual, porPagina, undefined, true)
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
  }
}

export { usePersonas }
export default usePersonas
