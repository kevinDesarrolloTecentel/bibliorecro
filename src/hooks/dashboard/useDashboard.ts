import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import { AniosDisponibles, PersonaNueva } from '@/Service/tab/Persona'
import { DashTotalPres } from '@/Service/rco/Prestamos'
import {
  DashboardTotals,
  DashboardPrestamosTotals,
  setSelectedYear as setReduxSelectedYear,
  setSelectedMonth as setReduxSelectedMonth,
  setTotalesUsuarios,
  setTotalesPrestamos,
  resetDashboardFiltros,
} from '@/slices/dashboardSlice'
import { useEdadGenero } from './useEdadGenero'
import { useUsuNRT } from './useUsuNRT'
import { usePermissions } from '@/hooks/auth/usePermissions'

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

  const dispatch = useDispatch<AppDispatch>()
  const dashboardState = useSelector((state: RootState) => state.dashboard)

  const selectedYear = dashboardState.selectedYear
  const setSelectedYear = useCallback((val: string) => {
    dispatch(setReduxSelectedYear(val))
  }, [dispatch])

  const selectedMonth = dashboardState.selectedMonth
  const setSelectedMonth = useCallback((val: string) => {
    dispatch(setReduxSelectedMonth(val))
  }, [dispatch])

  const [aniosDisponibles, setAniosDisponibles] = useState<string[]>(['2026', '2025', '2024'])

  const [nuevosData, setNuevosData] = useState<number[]>(DEFAULT_NUEVOS)
  const [renovacionesData, setRenovacionesData] = useState<number[]>(DEFAULT_RENOVACIONES)
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

  // 1. Cargar catálogo de años disponibles (campo canónico ANIO)
  useEffect(() => {
    const fetchAnios = async () => {
      try {
        const res = await AniosDisponibles()
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        if (raw.length > 0) {
          const mapped = raw.map((item: any) => String(item?.ANIO ?? item?.anio ?? item)).filter(Boolean)
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
  // Estructura canónica del backend: res.data = { anio, totales: { total_usuarios_nuevos, total_renovaciones, total_general }, datos: [{ MES, USUARIOS_NUEVOS, RENOVACIONES, TOTAL_GENERAL, DETALLE_USUARIOS_NUEVOS, DETALLE_RENOVACIONES }] }
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
      const dataPayload = res?.data ?? res
      const rawDatos: any[] = Array.isArray(dataPayload?.datos) ? dataPayload.datos : []

      const arrNuevos = Array(12).fill(0)
      const arrRenov = Array(12).fill(0)
      let sumNuevos = 0
      let sumRenov = 0

      rawDatos.forEach((item: any) => {
        const m = parseInt(item.MES, 10) - 1
        const n = Number(item.USUARIOS_NUEVOS) || 0
        const r = Number(item.RENOVACIONES) || 0

        if (m >= 0 && m < 12) {
          arrNuevos[m] = n
          arrRenov[m] = r
        }
        sumNuevos += n
        sumRenov += r
      })

      setNuevosData(arrNuevos)
      setRenovacionesData(arrRenov)

      // 1.2 Totales para las tarjetas según el mes seleccionado o todo el año
      const targetMonth = isMonthFilter ? parseInt(month, 10) : null
      const mesItem = targetMonth ? rawDatos.find((d: any) => parseInt(d.MES, 10) === targetMonth) : null

      if (isMonthFilter && mesItem) {
        const mNuevos = Number(mesItem.USUARIOS_NUEVOS) || 0
        const mRenov = Number(mesItem.RENOVACIONES) || 0
        const mTotal = Number(mesItem.TOTAL_GENERAL)

        const totals: DashboardTotals = {
          totalNuevos: mNuevos,
          totalRenovaciones: mRenov,
          sumatoriaTotal: mTotal,
        }
        dispatch(setTotalesUsuarios(totals))
      } else {
        const backendTotales = dataPayload?.totales
        const totalNuevos = backendTotales?.total_usuarios_nuevos !== undefined
          ? Number(backendTotales.total_usuarios_nuevos)
          : sumNuevos
        const totalRenovaciones = backendTotales?.total_renovaciones !== undefined
          ? Number(backendTotales.total_renovaciones)
          : sumRenov
        const sumatoriaTotal = backendTotales?.total_general !== undefined
          ? Number(backendTotales.total_general)
          : (totalNuevos + totalRenovaciones)

        const finalTotals: DashboardTotals = {
          totalNuevos,
          totalRenovaciones,
          sumatoriaTotal,
        }
        dispatch(setTotalesUsuarios(finalTotals))
      }

      // 1.3 Alimentar la Tabla UsuNRT exclusivamente desde los detalles mensuales reales
      const listNuevos: any[] = []
      const listRenovaciones: any[] = []

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

      procesarDetalleUsuarios(
        {
          usuarios_nuevos: listNuevos,
          usuarios_renovaciones: listRenovaciones,
        },
        month
      )
    } catch (err) {
      console.warn('[useDashboard] Error al consultar datos de personasNuevas:', err)
      dispatch(setTotalesUsuarios({ totalNuevos: 0, totalRenovaciones: 0, sumatoriaTotal: 0 }))
      procesarDetalleUsuarios({ usuarios_nuevos: [], usuarios_renovaciones: [] }, monthOverride)
    } finally {
      setLoadingUsuarios(false)
    }
  }, [selectedYear, selectedMonth, procesarDetalleUsuarios, dispatch])

  useEffect(() => {
    fetchUsuariosData()
  }, [fetchUsuariosData])

  // 3. Cargar datos de préstamos según año y mes desde /api/v1/prestamos/dashboard/totales
  // Estructura canónica del backend: { TotalPrestamos: number, TotalEntregados: number }
  const fetchPrestamosTotales = useCallback(async (yearOverride?: string, monthOverride?: string) => {
    setLoadingPrestamos(true)
    try {
      const year = yearOverride !== undefined ? yearOverride : selectedYear
      const month = monthOverride !== undefined ? monthOverride : selectedMonth
      const isMonthFilter = month !== 'todos' && month !== '' && month !== undefined

      const params: Record<string, any> = { anio: year }
      if (isMonthFilter) {
        params.mes = parseInt(month, 10)
      }

      const res = await DashTotalPres(params)
      const dataPayload = res?.data ?? res
      const totalPrestamos = Number(dataPayload?.TotalPrestamos ?? 0)
      const totalEntregados = Number(dataPayload?.TotalEntregados ?? 0)
      const totalGeneral = Number(dataPayload?.TotalGeneral ?? (totalPrestamos + totalEntregados))

      const arrActivos = Array(12).fill(0)
      const arrEntregados = Array(12).fill(0)

      if (isMonthFilter) {
        const mIdx = parseInt(month, 10) - 1
        if (mIdx >= 0 && mIdx < 12) {
          arrActivos[mIdx] = totalPrestamos
          arrEntregados[mIdx] = totalEntregados
        }
      }

      const pData: DashboardPrestamosTotals = {
        activos: arrActivos,
        entregados: arrEntregados,
        totalPrestamos,
        totalEntregados,
        totalGeneral,
      }
      setPrestamosData(pData)
      dispatch(setTotalesPrestamos({ totalPrestamos, totalEntregados, totalGeneral }))
    } catch (e) {
      console.warn('[useDashboard] Error al consultar totales de préstamos:', e)
      const emptyPData: DashboardPrestamosTotals = {
        activos: Array(12).fill(0),
        entregados: Array(12).fill(0),
        totalPrestamos: 0,
        totalEntregados: 0,
        totalGeneral: 0,
      }
      setPrestamosData(emptyPData)
      dispatch(setTotalesPrestamos({ totalPrestamos: 0, totalEntregados: 0, totalGeneral: 0 }))
    } finally {
      setLoadingPrestamos(false)
    }
  }, [selectedYear, selectedMonth, dispatch])

  useEffect(() => {
    fetchPrestamosTotales()
  }, [fetchPrestamosTotales])

  // Totales canónicos sincronizados con el estado de Redux
  const calcTotalNuevos = dashboardState.totalesUsuarios.totalNuevos ?? 0
  const calcTotalRenovaciones = dashboardState.totalesUsuarios.totalRenovaciones ?? 0
  const calcSumatoriaTotal = dashboardState.totalesUsuarios.sumatoriaTotal ?? (calcTotalNuevos + calcTotalRenovaciones)

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
    dispatch(resetDashboardFiltros())
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
  }, [canActualizar, verificarAccionEnServidor, aniosDisponibles, fetchUsuariosData, fetchPrestamosTotales, fetchRangoEdad, resetUsuarios, dispatch, setSelectedYear, setSelectedMonth])

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
