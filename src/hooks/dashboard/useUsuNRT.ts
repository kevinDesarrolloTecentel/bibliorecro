import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { UsuarioItem, DashboardUsuarioItem } from '@/models/dashboard/dashboard.model'
import { generarExcelEstilizado } from '@/utils/dashboardExcel'

export type { UsuarioItem, DashboardUsuarioItem }

export const normalizeUsuario = (u: any, tipoDefault: 'Nuevo' | 'Renovación' = 'Nuevo'): UsuarioItem => {
  const persona = u?.PERSONA || u?.persona || u || {}
  const renovaciones = Array.isArray(u?.RENOVACIONES)
    ? u.RENOVACIONES
    : Array.isArray(u?.renovaciones)
      ? u.renovaciones
      : []
  const primeraRenovacion = renovaciones[0] || {}

  const cedula = String(
    u?.cedula ||
    persona?.IDENTIFICACION_PERSONA ||
    u?.IDENTIFICACION_PERSONA ||
    u?.identificacion ||
    u?.CEDULA ||
    '-'
  ).trim()
  const nombre = String(u?.nombre || persona?.NOMBRE_PERSONA || u?.NOMBRE_PERSONA || u?.nombres || '-').trim() || '-'
  const apellido = String(u?.apellido || persona?.APELLIDO_PERSONA || u?.APELLIDO_PERSONA || u?.apellidos || '-').trim() || '-'
  const correo = String(u?.correo || persona?.CORREO_PERSONA || u?.CORREO_PERSONA || u?.email || '-').trim()
  const edad = u?.edad ?? u?.EDAD_PERSONA ?? persona?.EDAD_PERSONA ?? '-'
  const telefono = String(
    u?.telefono ||
    persona?.TELEFONO_PERSONA ||
    persona?.CELULAR_PERSONA ||
    u?.TELEFONO_PERSONA ||
    u?.CELULAR_PERSONA ||
    u?.celular ||
    '-'
  ).trim()

  const fecha =
    u?.fecha ||
    primeraRenovacion?.FECHAINICIO_RENOVACIONES ||
    u?.FECHAINICIO_RENOVACIONES ||
    persona?.FECHAREGISTRO_PERSONA ||
    u?.FECHAREGISTRO_PERSONA ||
    u?.FECHAINICIO_INSCRIPCION ||
    persona?.FECHA_PERSONA ||
    u?.FECHA_PERSONA ||
    ''

  const tipoStr = String(
    u?.TIPO_REGISTRO ||
    u?.tipo_usuario ||
    persona?.tipo_usuario ||
    u?.tipo ||
    persona?.tipo ||
    tipoDefault ||
    ''
  ).trim().toLowerCase()

  const isRenov =
    tipoStr.includes('renov') ||
    u?.es_renovacion === true ||
    u?.es_renovacion === 1 ||
    u?.es_renovacion === '1' ||
    Number(u?.ESTADO_RENOVACIONES) === 1

  const idVal = u?.ID_RENOVACIONES ?? u?.ID_PERSONA ?? persona?.ID_PERSONA ?? u?.id_renovacion ?? Math.random()

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

export const sortByMasReciente = (a: UsuarioItem, b: UsuarioItem) => {
  const timeA = a.fecha ? new Date(a.fecha).getTime() : 0
  const timeB = b.fecha ? new Date(b.fecha).getTime() : 0
  if (timeA > 0 && timeB > 0 && timeA !== timeB) {
    return timeB - timeA
  }
  const idA = Number(a.raw?.id_renovacion ?? a.raw?.ID_PERSONA ?? a.raw?.id ?? 0)
  const idB = Number(b.raw?.id_renovacion ?? b.raw?.ID_PERSONA ?? b.raw?.id ?? 0)
  return idB - idA
}

export const useUsuNRT = () => {
  const [usuariosNuevosList, setUsuariosNuevosList] = useState<UsuarioItem[]>([])
  const [usuariosRenovacionesList, setUsuariosRenovacionesList] = useState<UsuarioItem[]>([])
  const [todosUsuariosList, setTodosUsuariosList] = useState<UsuarioItem[]>([])

  const procesarDetalleUsuarios = useCallback((detObj: any, monthFilter?: string) => {
    let rawNuevos: any[] = []
    let rawRenov: any[] = []

    const sourceObj =
      detObj?.data?.detalle ??
      detObj?.detalle ??
      (detObj?.usuarios_nuevos || detObj?.usuarios_renovaciones ? detObj : null) ??
      (detObj?.data?.usuarios_nuevos || detObj?.data?.usuarios_renovaciones ? detObj.data : null) ??
      (detObj?.nuevos || detObj?.renovaciones ? detObj : null) ??
      (detObj?.data?.nuevos || detObj?.data?.renovaciones ? detObj.data : null) ??
      detObj?.data ??
      detObj

    if (Array.isArray(sourceObj)) {
      sourceObj.forEach((u: any) => {
        const tipoStr = String(
          u?.tipo_usuario ||
          u?.tipo ||
          u?.TIPO_PERSONA ||
          ''
        ).toLowerCase()

        const isRenov =
          tipoStr.includes('renov') ||
          Number(u?.ESTADO_RENOVACIONES) === 1 ||
          u?.es_renovacion === true

        if (isRenov) {
          rawRenov.push(u)
        } else {
          rawNuevos.push(u)
        }
      })
    } else {
      rawNuevos = Array.isArray(sourceObj?.usuarios_nuevos)
        ? sourceObj.usuarios_nuevos
        : Array.isArray(sourceObj?.data?.usuarios_nuevos)
          ? sourceObj.data.usuarios_nuevos
          : Array.isArray(sourceObj?.nuevos)
            ? sourceObj.nuevos
            : []
      rawRenov = Array.isArray(sourceObj?.usuarios_renovaciones)
        ? sourceObj.usuarios_renovaciones
        : Array.isArray(sourceObj?.data?.usuarios_renovaciones)
          ? sourceObj.data.usuarios_renovaciones
          : Array.isArray(sourceObj?.renovaciones)
            ? sourceObj.renovaciones
            : []

      if (rawNuevos.length === 0 && rawRenov.length === 0) {
        const fallbackList = Array.isArray(sourceObj?.data)
          ? sourceObj.data
          : Array.isArray(sourceObj?.activos)
            ? sourceObj.activos
            : Array.isArray(sourceObj?.usuarios)
              ? sourceObj.usuarios
              : []
        fallbackList.forEach((u: any) => {
          const tipoStr = String(
            u?.tipo_usuario ||
            u?.tipo ||
            u?.TIPO_PERSONA ||
            ''
          ).toLowerCase()

          const isRenov =
            tipoStr.includes('renov') ||
            Number(u?.ESTADO_RENOVACIONES) === 1 ||
            u?.es_renovacion === true

          if (isRenov) {
            rawRenov.push(u)
          } else {
            rawNuevos.push(u)
          }
        })
      }
    }

    let mappedNuevos = rawNuevos.filter(Boolean).map((u: any) => normalizeUsuario(u, 'Nuevo'))
    let mappedRenov = rawRenov.filter(Boolean).map((u: any) => normalizeUsuario(u, 'Renovación'))

    if (monthFilter && monthFilter !== 'todos' && monthFilter !== '') {
      const targetMonth = parseInt(monthFilter, 10)
      const matchesMonth = (item: UsuarioItem) => {
        const mesDirecto = item.raw?.MES ?? item.raw?.mes
        if (mesDirecto !== undefined && mesDirecto !== null && mesDirecto !== '') {
          return Number(mesDirecto) === targetMonth
        }
        if (!item.fecha) return true
        const d = new Date(item.fecha)
        if (isNaN(d.getTime())) return true
        return d.getMonth() + 1 === targetMonth
      }
      mappedNuevos = mappedNuevos.filter(matchesMonth)
      mappedRenov = mappedRenov.filter(matchesMonth)
    }

    mappedNuevos.sort(sortByMasReciente)
    mappedRenov.sort(sortByMasReciente)
    const todos = [...mappedNuevos, ...mappedRenov].sort(sortByMasReciente)

    setUsuariosNuevosList(mappedNuevos)
    setUsuariosRenovacionesList(mappedRenov)
    setTodosUsuariosList(todos)
  }, [])

  const handleExportarExcel = useCallback(async (year: string = '2026', month: string = 'todos') => {
    const listToExport =
      todosUsuariosList.length > 0
        ? todosUsuariosList
        : [...usuariosNuevosList, ...usuariosRenovacionesList]

    if (!listToExport || listToExport.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin datos para exportar',
        text: 'No hay usuarios registrados para el período seleccionado.',
        confirmButtonColor: '#044c8c',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const headers = ['#', 'Cédula', 'Nombre', 'Apellido', 'Correo', 'Edad', 'Teléfono', 'Tipo']
    const rows = listToExport.map((u, idx) => [
      idx + 1,
      String(u.cedula || ''),
      u.nombre || '',
      u.apellido || '',
      u.correo || '',
      u.edad ?? '',
      u.telefono || '',
      u.tipo || '',
    ])

    await generarExcelEstilizado({
      nombreArchivo: `reporte_usuarios_${year}_${month || 'todos'}.xlsx`,
      tituloPrincipal: 'Reporte de Usuarios del Sistema',
      subtituloFiltro: `Usuarios registrados | Año: ${year} | Mes: ${month ? month : 'Todos los meses'}`,
      totalRegistros: listToExport.length,
      headers,
      rows,
    })

    Swal.fire({
      icon: 'success',
      title: 'Archivo exportado',
      text: `Se descargó exitosamente el reporte con ${listToExport.length} usuarios.`,
      timer: 1800,
      showConfirmButton: false,
    })
  }, [todosUsuariosList, usuariosNuevosList, usuariosRenovacionesList])

  const resetUsuarios = useCallback(() => {
    setUsuariosNuevosList([])
    setUsuariosRenovacionesList([])
    setTodosUsuariosList([])
  }, [])

  return {
    usuariosNuevosList,
    usuariosRenovacionesList,
    todosUsuariosList,
    procesarDetalleUsuarios,
    handleExportarExcel,
    resetUsuarios,
  }
}

export default useUsuNRT
