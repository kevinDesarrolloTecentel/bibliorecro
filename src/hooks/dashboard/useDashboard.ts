import { useState, useEffect, useMemo, useCallback } from 'react'
import { AniosDisponibles, PersonasNuevasDetalle, UsuActEG } from '@/Service/tab/Persona'
import { DashTotalPres } from '@/Service/rco/Prestamos'
import Swal from 'sweetalert2'

export const MESES_DEL_ANIO = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const DEFAULT_NUEVOS = Array(12).fill(0)
const DEFAULT_RENOVACIONES = Array(12).fill(0)

export const useDashboard = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2026')
  const [selectedMonth, setSelectedMonth] = useState<string>('todos')
  const [aniosDisponibles, setAniosDisponibles] = useState<string[]>(['2026', '2025', '2024'])

  const [nuevosData, setNuevosData] = useState<number[]>(DEFAULT_NUEVOS)
  const [renovacionesData, setRenovacionesData] = useState<number[]>(DEFAULT_RENOVACIONES)
  const [backendTotals, setBackendTotals] = useState<{
    totalNuevos?: number
    totalRenovaciones?: number
    sumatoriaTotal?: number
  } | null>(null)
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(false)
  const [resetKey, setResetKey] = useState<number>(0)

  // Datos para gráficos complementarios
  const [prestamosData, setPrestamosData] = useState<{
    activos?: number[]
    entregados?: number[]
    totalPrestamos?: number
    totalEntregados?: number
  } | undefined>(undefined)
  const [loadingPrestamos, setLoadingPrestamos] = useState<boolean>(false)
  const [rangoEdadData, setRangoEdadData] = useState<any[] | undefined>(undefined)
  const [loadingRangoEdad, setLoadingRangoEdad] = useState<boolean>(false)

  // Listas detalladas de usuarios
  const [usuariosNuevosList, setUsuariosNuevosList] = useState<any[]>([])
  const [usuariosRenovacionesList, setUsuariosRenovacionesList] = useState<any[]>([])
  const [todosUsuariosList, setTodosUsuariosList] = useState<any[]>([])

  // 1. Cargar catálogo de años disponibles
  useEffect(() => {
    const fetchAnios = async () => {
      try {
        const res = await AniosDisponibles()
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        if (raw.length > 0) {
          const mapped = raw.map((item: any) => String(item.anio || item.ANIO || item)).filter(Boolean)
          if (!mapped.includes('2026')) mapped.unshift('2026')
          setAniosDisponibles(Array.from(new Set(mapped)))
        }
      } catch (err) {
        console.warn('[useDashboard] No se pudo cargar años del backend, usando lista predeterminada', err)
      }
    }
    fetchAnios()
  }, [])

  // 2. Cargar datos de usuarios nuevos y renovaciones según año y mes
  const fetchUsuariosData = useCallback(async (yearOverride?: string, monthOverride?: string) => {
    setLoadingUsuarios(true)
    try {
      const year = yearOverride !== undefined ? yearOverride : selectedYear
      const month = monthOverride !== undefined ? monthOverride : selectedMonth
      const params: any = { anio: year, _t: Date.now() }
      if (month !== 'todos' && month !== '') {
        params.mes = month
      }

      // 1. Consultar resumen y detalle completo en una sola llamada limpia al endpoint api/personasNuevas?tipo=detalle
      const res = await PersonasNuevasDetalle({ ...params, tipo: 'detalle' })

      // 1.1 Procesar respuesta del gráfico: res.datos = [{ MES: 1, USUARIOS_NUEVOS: 22, RENOVACIONES: 37 }, ...]
      const rawDatos = Array.isArray(res?.datos)
        ? res.datos
        : Array.isArray(res?.data?.datos)
        ? res.data.datos
        : []

      const arrNuevos = Array(12).fill(0)
      const arrRenov = Array(12).fill(0)
      let sumNuevos = 0
      let sumRenov = 0

      if (rawDatos.length > 0) {
        rawDatos.forEach((item: any) => {
          const m = parseInt(item.MES, 10) - 1
          const n = parseInt(item.USUARIOS_NUEVOS, 10) || 0
          const r = parseInt(item.RENOVACIONES, 10) || 0

          if (m >= 0 && m < 12) {
            arrNuevos[m] = n
            arrRenov[m] = r
          }
          sumNuevos += n
          sumRenov += r
        })

        setNuevosData(arrNuevos)
        setRenovacionesData(arrRenov)
        setBackendTotals({
          totalNuevos: sumNuevos,
          totalRenovaciones: sumRenov,
          sumatoriaTotal: sumNuevos + sumRenov,
        })
      }

      // 2. Extraer listas de usuarios reales directamente desde res.detalle
      try {
        const detObj = res?.detalle ?? res?.data?.detalle ?? {}
        const rawNuevos: any[] = Array.isArray(detObj.usuarios_nuevos) ? detObj.usuarios_nuevos : []
        const rawRenov: any[] = Array.isArray(detObj.usuarios_renovaciones) ? detObj.usuarios_renovaciones : []

        // Conservar todos los registros devueltos por el backend (incluyendo huérfanos/sin cruce)
        const listActivas = rawNuevos.filter(Boolean)
        const listRenov = rawRenov.filter(Boolean)

        const normalizeUsuario = (u: any, tipoDefault: 'Nuevo' | 'Renovación' = 'Nuevo') => {
          const persona = u.PERSONA || u.persona || u
          const renovaciones = Array.isArray(u.RENOVACIONES)
            ? u.RENOVACIONES
            : Array.isArray(u.renovaciones)
            ? u.renovaciones
            : []
          const primeraRenovacion = renovaciones[0] || {}

          const cedula = String(
            u.cedula ||
            persona.IDENTIFICACION_PERSONA ||
            u.IDENTIFICACION_PERSONA ||
            u.identificacion ||
            u.CEDULA ||
            '-'
          ).trim()
          const nombre = String(u.nombre || persona.NOMBRE_PERSONA || u.NOMBRE_PERSONA || u.nombres || '-').trim() || '-'
          const apellido = String(u.apellido || persona.APELLIDO_PERSONA || u.APELLIDO_PERSONA || u.apellidos || '-').trim() || '-'
          const correo = String(u.correo || persona.CORREO_PERSONA || u.CORREO_PERSONA || u.email || '-').trim()
          const edad = u.edad ?? u.EDAD_PERSONA ?? persona.EDAD_PERSONA ?? '-'
          const telefono = String(
            u.telefono ||
            persona.TELEFONO_PERSONA ||
            persona.CELULAR_PERSONA ||
            u.TELEFONO_PERSONA ||
            u.CELULAR_PERSONA ||
            u.celular ||
            '-'
          ).trim()

          const fecha =
            u.fecha ||
            primeraRenovacion.FECHAINICIO_RENOVACIONES ||
            u.FECHAINICIO_RENOVACIONES ||
            persona.FECHAREGISTRO_PERSONA ||
            u.FECHAREGISTRO_PERSONA ||
            u.FECHAINICIO_INSCRIPCION ||
            persona.FECHA_PERSONA ||
            u.FECHA_PERSONA ||
            ''

          const isRenov =
            tipoDefault === 'Renovación' ||
            u.es_renovacion === true ||
            u.es_renovacion === 1 ||
            u.es_renovacion === '1' ||
            String(u.tipo || '').toLowerCase().includes('renov')

          const idVal = u.ID_PERSONA ?? persona.ID_PERSONA ?? u.id_renovacion ?? Math.random()

          return {
            id: `${idVal}_${isRenov ? 'Renovación' : 'Nuevo'}_${cedula}`,
            cedula,
            nombre,
            apellido,
            correo,
            edad,
            telefono,
            tipo: isRenov ? 'Renovación' : 'Nuevo',
            tipoBadgeColor: isRenov ? 'info' : 'success',
            fecha,
            raw: { ...persona, ...u },
          }
        }

        // 2.2 Mapear Nuevos y Renovaciones directamente de los datos reales del backend
        let mappedNuevos = listActivas.map((u: any) => normalizeUsuario(u, 'Nuevo'))
        let mappedRenov = listRenov.map((u: any) => normalizeUsuario(u, 'Renovación'))

        // 2.3 Ordenar de forma DESCENDENTE: Los usuarios más nuevos y recientes siempre en PÁGINA 1
        const sortByMasReciente = (a: any, b: any) => {
          const timeA = a.fecha ? new Date(a.fecha).getTime() : 0
          const timeB = b.fecha ? new Date(b.fecha).getTime() : 0
          if (timeA > 0 && timeB > 0 && timeA !== timeB) {
            return timeB - timeA
          }
          const idA = Number(a.raw?.id_renovacion ?? a.raw?.ID_PERSONA ?? a.raw?.id ?? 0)
          const idB = Number(b.raw?.id_renovacion ?? b.raw?.ID_PERSONA ?? b.raw?.id ?? 0)
          return idB - idA
        }

        mappedNuevos.sort(sortByMasReciente)
        mappedRenov.sort(sortByMasReciente)
        const todos = [...mappedNuevos, ...mappedRenov].sort(sortByMasReciente)

        setUsuariosNuevosList(mappedNuevos)
        setUsuariosRenovacionesList(mappedRenov)
        setTodosUsuariosList(todos)
      } catch (repErr) {
        console.warn('[useDashboard] Aviso al consultar reporte de usuarios:', repErr)
      }
    } catch (err) {
      console.warn('[useDashboard] Usando datos de referencia para el gráfico', err)
    } finally {
      setLoadingUsuarios(false)
    }
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    fetchUsuariosData()
  }, [fetchUsuariosData])

  // Estado para guardar la respuesta original de la API de totales de préstamos
  const [rawPrestamos, setRawPrestamos] = useState<{
    totalPrestamos: number
    totalEntregados: number
    activos?: number[]
    entregados?: number[]
  } | null>(null)

  // 3. Cargar datos de préstamos: Solo hace petición HTTP cuando cambia el año seleccionado
  const fetchPrestamosTotales = useCallback(async (yearOverride?: string) => {
    setLoadingPrestamos(true)
    try {
      const year = yearOverride !== undefined ? yearOverride : selectedYear
      const res = await DashTotalPres({ anio: year, _t: Date.now() })
      const totalPrestamos = Number(res?.TotalPrestamos ?? res?.data?.TotalPrestamos ?? 0)
      const totalEntregados = Number(res?.TotalEntregados ?? res?.data?.TotalEntregados ?? 0)
      const activos = Array.isArray(res?.activos)
        ? res.activos
        : Array.isArray(res?.data?.activos)
        ? res.data.activos
        : undefined
      const entregados = Array.isArray(res?.entregados)
        ? res.entregados
        : Array.isArray(res?.data?.entregados)
        ? res.data.entregados
        : undefined

      setRawPrestamos({ totalPrestamos, totalEntregados, activos, entregados })
    } catch (e) {
      console.warn('[useDashboard] Error al consultar totales de préstamos:', e)
    } finally {
      setLoadingPrestamos(false)
    }
  }, [selectedYear])

  useEffect(() => {
    fetchPrestamosTotales()
  }, [fetchPrestamosTotales])

  useEffect(() => {
    if (!rawPrestamos) return

    const { totalPrestamos, totalEntregados, activos, entregados } = rawPrestamos

    if (activos && entregados) {
      setPrestamosData({
        activos,
        entregados,
        totalPrestamos,
        totalEntregados,
      })
      return
    }

    const arrActivos = Array(12).fill(0)
    const arrEntregados = Array(12).fill(0)

    if (selectedMonth !== 'todos' && selectedMonth !== '') {
      const m = parseInt(selectedMonth, 10) - 1
      if (m >= 0 && m < 12) {
        arrActivos[m] = totalPrestamos
        arrEntregados[m] = totalEntregados
      }
    } else {
      const currentMonthIdx = Math.min(new Date().getMonth(), 11)
      const totalActividad = nuevosData.reduce((acc, curr) => acc + curr, 0) || 1

      for (let i = 0; i <= currentMonthIdx; i++) {
        const peso = (nuevosData[i] || 1) / totalActividad
        arrActivos[i] = Math.round(totalPrestamos * peso)
      }
      arrEntregados[currentMonthIdx] = totalEntregados

      if (arrActivos.every((v) => v === 0) && totalPrestamos > 0) {
        arrActivos[currentMonthIdx] = totalPrestamos
      }
    }

    setPrestamosData({
      activos: arrActivos,
      entregados: arrEntregados,
      totalPrestamos,
      totalEntregados,
    })
  }, [rawPrestamos, selectedMonth, nuevosData])

  // 4. Cargar rango de edad y género: Petición HTTP única al inicio
  const fetchRangoEdad = useCallback(async () => {
    setLoadingRangoEdad(true)
    try {
      const res = await UsuActEG()
      const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      if (raw.length > 0) {
        setRangoEdadData(raw)
      }
    } catch (e) {
    } finally {
      setLoadingRangoEdad(false)
    }
  }, [])

  useEffect(() => {
    fetchRangoEdad()
  }, [fetchRangoEdad])



  const calcTotalNuevos = useMemo(() => {
    if (!loadingUsuarios && usuariosNuevosList !== undefined) {
      return usuariosNuevosList.length
    }
    return backendTotals?.totalNuevos ?? 0
  }, [usuariosNuevosList, loadingUsuarios, backendTotals])

  const calcTotalRenovaciones = useMemo(() => {
    if (!loadingUsuarios && usuariosRenovacionesList !== undefined) {
      return usuariosRenovacionesList.length
    }
    return backendTotals?.totalRenovaciones ?? 0
  }, [usuariosRenovacionesList, loadingUsuarios, backendTotals])

  const calcSumatoriaTotal = useMemo(() => {
    if (!loadingUsuarios && todosUsuariosList !== undefined) {
      return todosUsuariosList.length
    }
    return calcTotalNuevos + calcTotalRenovaciones
  }, [todosUsuariosList, loadingUsuarios, calcTotalNuevos, calcTotalRenovaciones])

  const calcTotalPorMes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const n = i < nuevosData.length ? Number(nuevosData[i]) || 0 : 0
      const r = i < renovacionesData.length ? Number(renovacionesData[i]) || 0 : 0
      return n + r
    })
  }, [nuevosData, renovacionesData])

  // Exportación directa a Excel / CSV (Compatible con Microsoft Excel, UTF-8 BOM)
  const handleExportarExcel = async () => {
    const listToExport =
      todosUsuariosList.length > 0
        ? todosUsuariosList
        : [...usuariosNuevosList, ...usuariosRenovacionesList]

    if (!listToExport || listToExport.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin datos para exportar',
        text: 'No hay usuarios registrados para el período seleccionado.',
        confirmButtonColor: '#321fdb',
      })
      return
    }

    const headers = ['#', 'Cédula', 'Nombre', 'Apellido', 'Correo', 'Edad', 'Teléfono', 'Tipo']
    const rows = listToExport.map((u, idx) => [
      idx + 1,
      `"${u.cedula || ''}"`,
      `"${(u.nombre || '').replace(/"/g, '""')}"`,
      `"${(u.apellido || '').replace(/"/g, '""')}"`,
      `"${u.correo || ''}"`,
      `"${u.edad ?? ''}"`,
      `"${u.telefono || ''}"`,
      `"${u.tipo || ''}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_usuarios_${selectedYear}_${selectedMonth || 'todos'}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    Swal.fire({
      icon: 'success',
      title: 'Archivo exportado',
      text: `Se descargó exitosamente el reporte con ${listToExport.length} usuarios.`,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const refetch = useCallback(async () => {
    const defaultYear = aniosDisponibles[0] || '2026'
    setSelectedYear(defaultYear)
    setSelectedMonth('todos')
    setResetKey((prev) => prev + 1)

    try {
      await Promise.all([
        fetchUsuariosData(defaultYear, 'todos'),
        fetchPrestamosTotales(defaultYear),
        fetchRangoEdad(),
      ])
    } catch (e) {
      console.warn('[useDashboard] Error al refrescar datos:', e)
    }
  }, [aniosDisponibles, fetchUsuariosData, fetchPrestamosTotales, fetchRangoEdad])

  return {
    resetKey,
    // Filtros
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    aniosDisponibles,
    meses: MESES_DEL_ANIO,

    // Datos y estados de carga
    nuevosData,
    renovacionesData,
    loadingUsuarios,

    // Totales calculados para las tarjetas
    calcTotalNuevos,
    calcTotalRenovaciones,
    calcSumatoriaTotal,
    calcTotalPorMes,

    // Préstamos
    prestamosData,
    loadingPrestamos,

    // Rango de Edad y Género
    rangoEdadData,
    loadingRangoEdad,

    // Listas para la tabla UsuNRT
    usuariosNuevosList,
    usuariosRenovacionesList,
    todosUsuariosList,

    // Acciones
    handleExportarExcel,
    refetch,
  }
}

export default useDashboard
