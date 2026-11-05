import { useState, useEffect, useMemo, useCallback } from 'react'
import Swal from 'sweetalert2'
import { AniosDisponibles, PersonaNueva } from '@/Service/tab/Persona'
import { DashTotalPres } from '@/Service/rco/Prestamos'
import {
  DashboardTotals,
  DashboardPrestamosTotals,
} from '@/models/dashboard/dashboard.model'
import { useEdadGenero } from './useEdadGenero'
import { useUsuNRT } from './useUsuNRT'
import { usePermissions } from '@/context/PermissionsContext'

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
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canActualizar = canDoAction('btn_actualizar_info')
  const canExportarExcelUsuarios = canDoAction('btn_exportar_excel_usuario')

  const [selectedYear, setSelectedYear] = useState<string>('2026')
  const [selectedMonth, setSelectedMonth] = useState<string>('todos')
  const [aniosDisponibles, setAniosDisponibles] = useState<string[]>(['2026', '2025', '2024'])

  const [nuevosData, setNuevosData] = useState<number[]>(DEFAULT_NUEVOS)
  const [renovacionesData, setRenovacionesData] = useState<number[]>(DEFAULT_RENOVACIONES)
  const [backendTotals, setBackendTotals] = useState<DashboardTotals | null>(null)
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(false)
  const [resetKey, setResetKey] = useState<number>(0)

  // Sub-hook para distribución por Rango de Edad y Género
  const { rangoEdadData, loadingRangoEdad, fetchRangoEdad } = useEdadGenero()

  // Sub-hook para listas y tabla de Usuarios (UsuNRT)
  const {
    usuariosNuevosList,
    usuariosRenovacionesList,
    todosUsuariosList,
    procesarDetalleUsuarios,
    handleExportarExcel: exportarExcelNRT,
    resetUsuarios,
  } = useUsuNRT()

  // Datos para gráficos complementarios
  const [prestamosData, setPrestamosData] = useState<DashboardPrestamosTotals | undefined>(undefined)
  const [loadingPrestamos, setLoadingPrestamos] = useState<boolean>(false)

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
      const isMonthFilter = month !== 'todos' && month !== ''
      const params: Record<string, any> = { anio: year }
      if (isMonthFilter) {
        params.mes = month
      }

      const res = await PersonaNueva(params)

      // 1.1 Procesar respuesta mensual del gráfico y tarjetas
      const rawDatos = Array.isArray(res?.data?.datos)
        ? res.data.datos
        : Array.isArray(res?.datos)
        ? res.datos
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
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
      }

      setNuevosData(arrNuevos)
      setRenovacionesData(arrRenov)

      // 1.2 Totales para las tarjetas según el mes seleccionado o todo el año
      const targetMonth = isMonthFilter ? parseInt(month, 10) : null
      const mesItem = targetMonth ? rawDatos.find((d: any) => parseInt(d.MES, 10) === targetMonth) : null

      if (isMonthFilter && mesItem) {
        const mNuevos = parseInt(mesItem.USUARIOS_NUEVOS, 10) || (Array.isArray(mesItem.DETALLE_USUARIOS_NUEVOS) ? mesItem.DETALLE_USUARIOS_NUEVOS.length : 0)
        const mRenov = parseInt(mesItem.RENOVACIONES, 10) || (Array.isArray(mesItem.DETALLE_RENOVACIONES) ? mesItem.DETALLE_RENOVACIONES.length : 0)
        const mTotal = parseInt(mesItem.TOTAL_GENERAL, 10) || (mNuevos + mRenov)

        setBackendTotals({
          totalNuevos: mNuevos,
          totalRenovaciones: mRenov,
          sumatoriaTotal: mTotal,
        })
      } else {
        const directTotalNuevos =
          res?.data?.totales?.total_usuarios_nuevos ??
          res?.data?.totales?.usuarios_nuevos ??
          res?.data?.totales?.total_nuevos ??
          res?.totales?.total_usuarios_nuevos ??
          res?.totales?.usuarios_nuevos ??
          res?.totales?.total_nuevos ??
          res?.data?.total_nuevos ??
          res?.total_nuevos
        const directTotalRenov =
          res?.data?.totales?.total_renovaciones ??
          res?.data?.totales?.usuarios_renovaciones ??
          res?.data?.totales?.total_renovaciones ??
          res?.totales?.total_renovaciones ??
          res?.totales?.usuarios_renovaciones ??
          res?.totales?.renovaciones ??
          res?.data?.total_renovaciones ??
          res?.total_renovaciones
        const directTotalGeneral =
          res?.data?.totales?.total_general ??
          res?.totales?.total_general

        const finalTotalNuevos = directTotalNuevos !== undefined ? Number(directTotalNuevos) : sumNuevos
        const finalTotalRenov = directTotalRenov !== undefined ? Number(directTotalRenov) : sumRenov
        const finalTotalGeneral = directTotalGeneral !== undefined ? Number(directTotalGeneral) : (finalTotalNuevos + finalTotalRenov)

        setBackendTotals({
          totalNuevos: finalTotalNuevos,
          totalRenovaciones: finalTotalRenov,
          sumatoriaTotal: finalTotalGeneral,
        })
      }

      // 1.3 Alimentar la Tabla UsuNRT exclusivamente desde personasNuevas
      let listNuevos: any[] = []
      let listRenovaciones: any[] = []

      // Extraer usuarios del mes seleccionado o de todos los meses de personasNuevas
      const mesesAProcesar = isMonthFilter && targetMonth
        ? rawDatos.filter((d: any) => parseInt(d.MES, 10) === targetMonth)
        : rawDatos

      mesesAProcesar.forEach((mItem: any) => {
        if (Array.isArray(mItem.DETALLE_USUARIOS_NUEVOS)) {
          mItem.DETALLE_USUARIOS_NUEVOS.forEach((u: any) => {
            listNuevos.push({ ...u, MES: u.MES ?? mItem.MES })
          })
        }
        if (Array.isArray(mItem.DETALLE_RENOVACIONES)) {
          mItem.DETALLE_RENOVACIONES.forEach((u: any) => {
            listRenovaciones.push({ ...u, MES: u.MES ?? mItem.MES })
          })
        }
      })

      // Soporte para estructura plana si el endpoint retornara los listados en la raíz
      if (listNuevos.length === 0 && listRenovaciones.length === 0) {
        const altNuevos =
          res?.data?.usuarios_nuevos ??
          res?.data?.detalle?.usuarios_nuevos ??
          res?.usuarios_nuevos ??
          res?.detalle?.usuarios_nuevos
        const altRenov =
          res?.data?.usuarios_renovaciones ??
          res?.data?.detalle?.usuarios_renovaciones ??
          res?.usuarios_renovaciones ??
          res?.detalle?.usuarios_renovaciones

        if (Array.isArray(altNuevos)) listNuevos = altNuevos
        if (Array.isArray(altRenov)) listRenovaciones = altRenov
      }

      procesarDetalleUsuarios(
        {
          usuarios_nuevos: listNuevos,
          usuarios_renovaciones: listRenovaciones,
        },
        month
      )
    } catch (err) {
      console.warn('[useDashboard] Error al consultar datos de personasNuevas:', err)
      procesarDetalleUsuarios({ usuarios_nuevos: [], usuarios_renovaciones: [] }, monthOverride)
    } finally {
      setLoadingUsuarios(false)
    }
  }, [selectedYear, selectedMonth, procesarDetalleUsuarios])

  useEffect(() => {
    fetchUsuariosData()
  }, [fetchUsuariosData])

  // 3. Cargar datos de préstamos según año y mes desde /api/v1/prestamos/dashboard/totales (1 sola petición)
  const fetchPrestamosTotales = useCallback(async (yearOverride?: string, monthOverride?: string) => {
    setLoadingPrestamos(true)
    try {
      const year = yearOverride !== undefined ? yearOverride : selectedYear
      const month = monthOverride !== undefined ? monthOverride : selectedMonth
      const isMonthFilter = month !== 'todos' && month !== '' && month !== undefined

      // Se realiza 1 sola petición HTTP hacia /api/v1/prestamos/dashboard/totales
      const params: Record<string, any> = { anio: year }
      if (isMonthFilter) {
        params.mes = parseInt(month, 10)
      }

      const res = await DashTotalPres(params)
      const totalPrestamos = Number(res?.TotalPrestamos ?? res?.data?.TotalPrestamos ?? 0)
      const totalEntregados = Number(res?.TotalEntregados ?? res?.data?.TotalEntregados ?? 0)

      // Si el backend entrega series mensuales en el futuro
      const directActivos = Array.isArray(res?.activos)
        ? res.activos
        : Array.isArray(res?.data?.activos)
        ? res.data.activos
        : null
      const directEntregados = Array.isArray(res?.entregados)
        ? res.entregados
        : Array.isArray(res?.data?.entregados)
        ? res.data.entregados
        : null

      if (directActivos && directEntregados) {
        setPrestamosData({
          activos: directActivos,
          entregados: directEntregados,
          totalPrestamos,
          totalEntregados,
        })
        return
      }

      const arrActivos = Array(12).fill(0)
      const arrEntregados = Array(12).fill(0)

      if (isMonthFilter) {
        const mIdx = parseInt(month, 10) - 1
        if (mIdx >= 0 && mIdx < 12) {
          arrActivos[mIdx] = totalPrestamos
          arrEntregados[mIdx] = totalEntregados
        }
      } else {
        const mBackend = typeof res?.mes === 'number' ? res.mes - 1 : Math.min(new Date().getMonth(), 11)
        if (mBackend >= 0 && mBackend < 12) {
          arrActivos[mBackend] = totalPrestamos
          arrEntregados[mBackend] = totalEntregados
        }
      }

      setPrestamosData({
        activos: arrActivos,
        entregados: arrEntregados,
        totalPrestamos,
        totalEntregados,
      })
    } catch (e) {
      console.warn('[useDashboard] Error al consultar totales de préstamos:', e)
      setPrestamosData({
        activos: Array(12).fill(0),
        entregados: Array(12).fill(0),
        totalPrestamos: 0,
        totalEntregados: 0,
      })
    } finally {
      setLoadingPrestamos(false)
    }
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    fetchPrestamosTotales()
  }, [fetchPrestamosTotales])

  const calcTotalNuevos = useMemo(() => {
    if (selectedMonth !== 'todos' && selectedMonth !== '') {
      const idx = parseInt(selectedMonth, 10) - 1
      if (idx >= 0 && idx < 12 && nuevosData[idx] > 0) {
        return nuevosData[idx]
      }
      return usuariosNuevosList.length
    }
    if (backendTotals?.totalNuevos !== undefined) {
      return backendTotals.totalNuevos
    }
    return usuariosNuevosList.length
  }, [selectedMonth, nuevosData, backendTotals, usuariosNuevosList])

  const calcTotalRenovaciones = useMemo(() => {
    if (selectedMonth !== 'todos' && selectedMonth !== '') {
      const idx = parseInt(selectedMonth, 10) - 1
      if (idx >= 0 && idx < 12 && renovacionesData[idx] > 0) {
        return renovacionesData[idx]
      }
      return usuariosRenovacionesList.length
    }
    if (backendTotals?.totalRenovaciones !== undefined) {
      return backendTotals.totalRenovaciones
    }
    return usuariosRenovacionesList.length
  }, [selectedMonth, renovacionesData, backendTotals, usuariosRenovacionesList])

  const calcSumatoriaTotal = useMemo(() => {
    if (selectedMonth !== 'todos' && selectedMonth !== '') {
      return calcTotalNuevos + calcTotalRenovaciones
    }
    if (backendTotals?.sumatoriaTotal !== undefined) {
      return backendTotals.sumatoriaTotal
    }
    return calcTotalNuevos + calcTotalRenovaciones
  }, [selectedMonth, calcTotalNuevos, calcTotalRenovaciones, backendTotals])

  const calcTotalPorMes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const n = i < nuevosData.length ? Number(nuevosData[i]) || 0 : 0
      const r = i < renovacionesData.length ? Number(renovacionesData[i]) || 0 : 0
      return n + r
    })
  }, [nuevosData, renovacionesData])

  // Exportación directa a Excel / CSV delegada al hook useUsuNRT con validación de permiso Just-in-Time
  const handleExportarExcel = useCallback(async () => {
    if (!canExportarExcelUsuarios) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para exportar usuarios a Excel.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_exportar_excel_usuario')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para exportar usuarios a Excel.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    exportarExcelNRT(selectedYear, selectedMonth)
  }, [canExportarExcelUsuarios, verificarAccionEnServidor, exportarExcelNRT, selectedYear, selectedMonth])

  const refetch = useCallback(async () => {
    if (!canActualizar) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar la información del dashboard.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setLoadingUsuarios(true)
    setLoadingPrestamos(true)

    const tienePermiso = await verificarAccionEnServidor('btn_actualizar_info')
    if (!tienePermiso) {
      setLoadingUsuarios(false)
      setLoadingPrestamos(false)
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar la información del dashboard.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const defaultYear = aniosDisponibles[0] || '2026'
    setSelectedYear(defaultYear)
    setSelectedMonth('todos')
    setResetKey((prev) => prev + 1)
    resetUsuarios()

    try {
      await Promise.all([
        fetchUsuariosData(defaultYear, 'todos'),
        fetchPrestamosTotales(defaultYear, 'todos'),
        fetchRangoEdad(),
      ])
    } catch (e) {
      console.warn('[useDashboard] Error al refrescar datos:', e)
    } finally {
      setLoadingUsuarios(false)
      setLoadingPrestamos(false)
    }
  }, [canActualizar, verificarAccionEnServidor, aniosDisponibles, fetchUsuariosData, fetchPrestamosTotales, fetchRangoEdad, resetUsuarios])

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

    // Acciones y permisos
    canActualizar,
    canExportarExcelUsuarios,
    handleExportarExcel,
    refetch,
  }
}

export default useDashboard
