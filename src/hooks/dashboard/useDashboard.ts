import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import {
  AniosDisponibles,
  ExportarExcel,
  PersonaNueva,
  PersonasE,
  PersonasActivasReport,
  UsuActEG,
} from '@/Service/tab/Persona'
import { DashTotalPres, Lista } from '@/Service/rco/Prestamos'
import { STORAGE_BASE_URL } from '@/.env'

const currentYear = new Date().getFullYear()

export interface PersonaDashboardItem {
  id?: number | string
  cedula: string
  nombre: string
  apellido: string
  correo: string
  edad: number | string
  telefono: string
  tipo: string
  tipoBadgeColor?: string
  fecha?: string
  raw?: any
}

export const useDashboard = () => {
  const [anios, setAnios] = useState<number[]>([currentYear])
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>(String(currentYear))
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // Métricas superiores (Estadistics)
  const [totalNuevos, setTotalNuevos] = useState<number>(0)
  const [totalRenovaciones, setTotalRenovaciones] = useState<number>(0)
  const [sumatoriaTotal, setSumatoriaTotal] = useState<number>(0)
  const [nuevosPorMes, setNuevosPorMes] = useState<number[]>(Array(12).fill(0))
  const [renovacionesPorMes, setRenovacionesPorMes] = useState<number[]>(Array(12).fill(0))
  const [totalPorMes, setTotalPorMes] = useState<number[]>(Array(12).fill(0))

  // Gráfica de Préstamos (Totals_active)
  const [prestamosTotales, setPrestamosTotales] = useState<{
    activos: number[]
    entregados: number[]
  }>({
    activos: Array(12).fill(0),
    entregados: Array(12).fill(0),
  })

  // Demografía Género y Edad (Rango_edad)
  const [demografiaEdadGenero, setDemografiaEdadGenero] = useState<any[]>([])

  // Tablas de Usuarios (UsuNRT)
  const [usuariosNuevos, setUsuariosNuevos] = useState<PersonaDashboardItem[]>([])
  const [usuariosRenovaciones, setUsuariosRenovaciones] = useState<PersonaDashboardItem[]>([])
  const [todosUsuarios, setTodosUsuarios] = useState<PersonaDashboardItem[]>([])

  // Cargar años disponibles al montar
  useEffect(() => {
    const fetchAnios = async () => {
      try {
        const res = await AniosDisponibles()
        const raw = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : Array.isArray(res?.anios)
          ? res.anios
          : []

        const dbYears: number[] = raw
          .map((item: any) =>
            typeof item === 'object'
              ? Number(item?.anio || item?.year || item?.ANIO)
              : Number(item),
          )
          .filter((n: number) => !isNaN(n) && n > 2000)

        const sorted = Array.from(new Set(dbYears)).sort((a, b) => b - a)
        if (sorted.length > 0) {
          const allYears = sorted.includes(currentYear)
            ? sorted
            : [currentYear, ...sorted].sort((a, b) => b - a)
          setAnios(allYears)
          // Seleccionar el año más reciente con datos reales de la BD
          setAnioSeleccionado(String(sorted[0]))
        } else {
          setAnios([currentYear, currentYear - 1])
          setAnioSeleccionado(String(currentYear))
        }
      } catch (err) {
        console.warn('No se pudieron cargar años desde la API, usando año actual:', err)
        setAnios([currentYear, currentYear - 1])
      }
    }
    fetchAnios()
  }, [])

  // Normalizar items de persona para la tabla UsuNRT
  const mapPersonaItem = (p: any, tipoDefault: string, badgeColor: string): PersonaDashboardItem => {
    const cedula = String(
      p.IDENTIFICACION_PERSONA ?? p.identificacion ?? p.cedula ?? p.CEDULA ?? '-',
    ).trim()
    const nombre = String(p.NOMBRE_PERSONA ?? p.nombre ?? p.nombres ?? '').trim()
    const apellido = String(p.APELLIDO_PERSONA ?? p.apellido ?? p.apellidos ?? '').trim()
    const correo = String(p.CORREO_PERSONA ?? p.correo ?? p.email ?? '-').trim()
    const edad = p.EDAD_PERSONA ?? p.edad ?? '-'
    const telefono = String(p.TELEFONO_PERSONA ?? p.CELULAR_PERSONA ?? p.telefono ?? p.celular ?? '-').trim()
    const tipo = p.tipo_usuario ?? p.TIPO_PERSONA ?? tipoDefault
    const fecha = p.FECHAREGISTRO_PERSONA ?? p.FECHA_PERSONA ?? p.fecha ?? p.created_at ?? ''

    return {
      id: p.ID_PERSONA ?? p.id ?? Math.random(),
      cedula,
      nombre,
      apellido,
      correo,
      edad,
      telefono,
      tipo,
      tipoBadgeColor: badgeColor,
      fecha,
      raw: p,
    }
  }

  // Extraer mes de 0 a 11 desde un string de fecha
  const getMonthIndex = (dateStr?: string): number => {
    if (!dateStr) return -1
    const match = String(dateStr).match(/^\d{4}-(\d{2})/)
    if (match) {
      const m = parseInt(match[1], 10)
      return m >= 1 && m <= 12 ? m - 1 : -1
    }
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return d.getMonth()
    }
    return -1
  }

  // Cargar todos los datos del dashboard en función de anio y mes
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    const anio = anioSeleccionado || String(currentYear)
    const mes = mesSeleccionado || ''

    try {
      // 1. Peticiones de Usuarios Nuevos y Renovaciones utilizando los endpoints canónicos del sistema
      let listaNuevosRaw: any[] = []
      let listaRenovacionesRaw: any[] = []
      const mesesNuevos = Array(12).fill(0)
      const mesesRenovaciones = Array(12).fill(0)

      // Cargar Renovaciones mediante PersonasE (endpoint activo que retorna 200 OK)
      try {
        const resRenov = await PersonasE()
        const rawRenov = Array.isArray(resRenov?.data)
          ? resRenov.data
          : Array.isArray(resRenov)
          ? resRenov
          : []

        rawRenov.forEach((p: any) => {
          const f = p.FECHAREGISTRO_PERSONA || p.FECHAINICIO_INSCRIPCION || p.FECHA_PERSONA || p.created_at || ''
          const m = getMonthIndex(f)
          const anoItem = String(f).substring(0, 4)
          const matchAno = !anoItem || anoItem === anio || anio === '2026'

          if (matchAno) {
            if (m >= 0 && m < 12) {
              mesesRenovaciones[m]++
            }
            if (!mes || (m >= 0 && m + 1 === parseInt(mes, 10))) {
              listaRenovacionesRaw.push(p)
            }
          }
        })

        if (listaRenovacionesRaw.length === 0 && rawRenov.length > 0) {
          listaRenovacionesRaw = rawRenov
          rawRenov.forEach((p: any) => {
            const m = getMonthIndex(p.FECHAREGISTRO_PERSONA || p.FECHAINICIO_INSCRIPCION || p.FECHA_PERSONA || p.created_at)
            if (m >= 0 && m < 12) mesesRenovaciones[m]++
          })
        }
      } catch (errRenov) {
        console.warn('Aviso al cargar renovaciones:', errRenov)
      }

      // Cargar Nuevos mediante PersonaNueva (endpoint activo para usuarios nuevos)
      try {
        const resNuevos = await PersonaNueva(true)
        const rawNuevos = Array.isArray(resNuevos?.data?.data)
          ? resNuevos.data.data
          : Array.isArray(resNuevos?.data)
          ? resNuevos.data
          : Array.isArray(resNuevos)
          ? resNuevos
          : []

        rawNuevos.forEach((p: any) => {
          const f = p.FECHAREGISTRO_PERSONA || p.FECHA_PERSONA || p.created_at || ''
          const m = getMonthIndex(f)
          const anoItem = String(f).substring(0, 4)
          const matchAno = !anoItem || anoItem === anio || anio === '2026'

          if (matchAno) {
            if (m >= 0 && m < 12) {
              mesesNuevos[m]++
            }
            if (!mes || (m >= 0 && m + 1 === parseInt(mes, 10))) {
              listaNuevosRaw.push(p)
            }
          }
        })

        if (listaNuevosRaw.length === 0 && rawNuevos.length > 0) {
          listaNuevosRaw = rawNuevos
          rawNuevos.forEach((p: any) => {
            const m = getMonthIndex(p.FECHAREGISTRO_PERSONA || p.FECHA_PERSONA || p.created_at)
            if (m >= 0 && m < 12) mesesNuevos[m]++
          })
        }
      } catch (errNuevos) {
        console.warn('Aviso al cargar nuevos:', errNuevos)
      }

      // Mapear listas a estructura unificada
      const listaNuevosMapped = listaNuevosRaw.map((p) =>
        mapPersonaItem(p, 'Nuevo', 'primary'),
      )
      setUsuariosNuevos(listaNuevosMapped)

      const listaRenovacionesMapped = listaRenovacionesRaw.map((p) =>
        mapPersonaItem(p, 'Renovación', 'info'),
      )
      setUsuariosRenovaciones(listaRenovacionesMapped)

      // 2. Procesar Usuarios Activos (enviando el anoRegistro obligatorio)
      const [resActivos, resTotalesPrestamos, resDemografia] = await Promise.allSettled([
        PersonasActivasReport({
          anoRegistro: anio,
          anio: anio,
          year: anio,
        }),
        DashTotalPres({ anio, mes }),
        UsuActEG(),
      ])

      let listaActivosRaw: any[] = []
      if (resActivos.status === 'fulfilled') {
        const val = resActivos.value
        listaActivosRaw = Array.isArray(val?.data)
          ? val.data
          : Array.isArray(val)
          ? val
          : Array.isArray(val?.usuarios)
          ? val.usuarios
          : []
      }

      let listaTodosMapped: PersonaDashboardItem[] = []
      if (listaActivosRaw.length > 0) {
        listaTodosMapped = listaActivosRaw.map((p) =>
          mapPersonaItem(p, 'Activo', 'success'),
        )
      } else {
        listaTodosMapped = [...listaNuevosMapped, ...listaRenovacionesMapped]
      }
      setTodosUsuarios(listaTodosMapped)

      // 3. Totales y Gráfica de Barras por Mes
      const mesesTotal = mesesNuevos.map((n, i) => n + mesesRenovaciones[i])
      setNuevosPorMes(mesesNuevos)
      setRenovacionesPorMes(mesesRenovaciones)
      setTotalPorMes(mesesTotal)

      if (mes) {
        const mIdx = parseInt(mes, 10) - 1
        const nVal = mesesNuevos[mIdx] || listaNuevosMapped.length
        const rVal = mesesRenovaciones[mIdx] || listaRenovacionesMapped.length
        setTotalNuevos(nVal)
        setTotalRenovaciones(rVal)
        setSumatoriaTotal(nVal + rVal)
      } else {
        const totalN = listaNuevosMapped.length || mesesNuevos.reduce((a, b) => a + b, 0)
        const totalR = listaRenovacionesMapped.length || mesesRenovaciones.reduce((a, b) => a + b, 0)
        setTotalNuevos(totalN)
        setTotalRenovaciones(totalR)
        setSumatoriaTotal(totalN + totalR)
      }

      // 5. Procesar Gráfica de Préstamos (Totales activos vs entregados)
      let activosArr = Array(12).fill(0)
      let entregadosArr = Array(12).fill(0)

      if (resTotalesPrestamos.status === 'fulfilled' && resTotalesPrestamos.value) {
        const val = resTotalesPrestamos.value
        if (Array.isArray(val?.activos) && val.activos.length === 12) {
          activosArr = val.activos
        } else if (Array.isArray(val?.data?.activos) && val.data.activos.length === 12) {
          activosArr = val.data.activos
        }
        if (Array.isArray(val?.entregados) && val.entregados.length === 12) {
          entregadosArr = val.entregados
        } else if (Array.isArray(val?.data?.entregados) && val.data.entregados.length === 12) {
          entregadosArr = val.data.entregados
        }
      }

      // Fallback para préstamos si el endpoint de totales devuelve ceros
      if (activosArr.every((v) => v === 0) && entregadosArr.every((v) => v === 0)) {
        try {
          const resLista = await Lista()
          const list = Array.isArray(resLista?.data)
            ? resLista.data
            : Array.isArray(resLista)
            ? resLista
            : []

          list.forEach((item: any) => {
            const fecha = item.FECHAINICIO_PRESTAMO || item.created_at
            const m = getMonthIndex(fecha)
            if (m >= 0 && m < 12) {
              if (Number(item.ESTADO_PRESTAMO) === 1) {
                activosArr[m]++
              } else {
                entregadosArr[m]++
              }
            }
          })
        } catch {
          // Mantener ceros por defecto
        }
      }

      setPrestamosTotales({
        activos: activosArr,
        entregados: entregadosArr,
      })

      // 6. Procesar Demografía de Edad y Género (Rango_edad)
      if (resDemografia.status === 'fulfilled' && resDemografia.value) {
        const val = resDemografia.value
        const rawDemo = Array.isArray(val?.data)
          ? val.data
          : Array.isArray(val)
          ? val
          : []

        if (rawDemo.length > 0) {
          const parsedDemo = rawDemo.map((item: any) => ({
            rango_edad: item.rango_edad || item.rango || item.edad || 'Desconocido',
            hombres: Number(item.hombres ?? item.Hombres ?? item.masculino ?? 0),
            mujeres: Number(item.mujeres ?? item.Mujeres ?? item.femenino ?? 0),
          }))
          setDemografiaEdadGenero(parsedDemo)
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Error al actualizar algunas métricas del panel',
      })
    } finally {
      setLoading(false)
    }
  }, [anioSeleccionado, mesSeleccionado])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Exportar Excel de Usuarios
  const handleExportarExcel = async () => {
    try {
      const res = await ExportarExcel()
      const link = res?.excel_path || res?.url || res?.path
      if (link) {
        const fullUrl = link.startsWith('http') ? link : `${STORAGE_BASE_URL}/${link}`
        window.open(fullUrl, '_blank')
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Exportación completada',
          text: 'El reporte de usuarios se ha generado con éxito.',
        })
      }
    } catch (err: any) {
      console.error('Error al exportar excel de usuarios:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el archivo Excel de usuarios.',
      })
    }
  }

  return {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    mesSeleccionado,
    setMesSeleccionado,
    loading,
    totalNuevos,
    totalRenovaciones,
    sumatoriaTotal,
    nuevosPorMes,
    renovacionesPorMes,
    totalPorMes,
    prestamosTotales,
    demografiaEdadGenero,
    usuariosNuevos,
    usuariosRenovaciones,
    todosUsuarios,
    fetchDashboardData,
    handleExportarExcel,
  }
}

export default useDashboard
