import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { UsuarioItem, DashboardUsuarioItem } from '@/slices/dashboardSlice'
import { generarExcelEstilizado } from '@/utils/dashboardExcel'

export type { UsuarioItem, DashboardUsuarioItem }

// Normalización limpia y exacta a partir de las columnas canónicas de la base de datos
export const normalizeUsuario = (u: any, tipoDefault: 'Nuevo' | 'Renovación' = 'Nuevo'): UsuarioItem => {
  const cedula = String(u?.IDENTIFICACION_PERSONA || u?.cedula || '-').trim()
  const nombre = String(u?.NOMBRE_PERSONA || u?.nombre || '-').trim()
  const apellido = String(u?.APELLIDO_PERSONA || u?.apellido || '-').trim()
  const correo = String(u?.CORREO_PERSONA || u?.correo || '-').trim()
  const edad = u?.EDAD_PERSONA ?? u?.edad ?? '-'
  const telefono = String(u?.CELULAR_PERSONA || u?.TELEFONO_PERSONA || u?.telefono || '-').trim()
  const fecha = String(u?.FECHAREGISTRO_PERSONA || u?.FECHAINICIO_RENOVACIONES || u?.fecha || '').trim()

  const tipoStr = String(u?.TIPO_REGISTRO || tipoDefault || '').toUpperCase()
  const isRenov = tipoStr.includes('RENOV') || tipoDefault === 'Renovación'

  const idVal = u?.ID_PERSONA ?? u?.ID_RENOVACIONES ?? Math.random()

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
    raw: { ...u },
  }
}

export const sortByMasReciente = (a: UsuarioItem, b: UsuarioItem) => {
  const timeA = a.fecha ? new Date(a.fecha).getTime() : 0
  const timeB = b.fecha ? new Date(b.fecha).getTime() : 0
  if (timeA > 0 && timeB > 0 && timeA !== timeB) {
    return timeB - timeA
  }
  const idA = Number(a.raw?.ID_PERSONA ?? a.raw?.ID_RENOVACIONES ?? 0)
  const idB = Number(b.raw?.ID_PERSONA ?? b.raw?.ID_RENOVACIONES ?? 0)
  return idB - idA
}

export const useUsuNRT = () => {
  const [usuariosNuevosList, setUsuariosNuevosList] = useState<UsuarioItem[]>([])
  const [usuariosRenovacionesList, setUsuariosRenovacionesList] = useState<UsuarioItem[]>([])
  const [todosUsuariosList, setTodosUsuariosList] = useState<UsuarioItem[]>([])

  const procesarDetalleUsuarios = useCallback((detObj: any, monthFilter?: string) => {
    let rawNuevos: any[] = []
    let rawRenov: any[] = []

    if (Array.isArray(detObj)) {
      detObj.forEach((u: any) => {
        const isRenov = String(u?.TIPO_REGISTRO || '').toUpperCase().includes('RENOV')
        if (isRenov) {
          rawRenov.push(u)
        } else {
          rawNuevos.push(u)
        }
      })
    } else {
      rawNuevos = Array.isArray(detObj?.usuarios_nuevos) ? detObj.usuarios_nuevos : []
      rawRenov = Array.isArray(detObj?.usuarios_renovaciones) ? detObj.usuarios_renovaciones : []
    }

    let mappedNuevos = rawNuevos.filter(Boolean).map((u: any) => normalizeUsuario(u, 'Nuevo'))
    let mappedRenov = rawRenov.filter(Boolean).map((u: any) => normalizeUsuario(u, 'Renovación'))

    if (monthFilter && monthFilter !== 'todos' && monthFilter !== '') {
      const targetMonth = parseInt(monthFilter, 10)
      mappedNuevos = mappedNuevos.filter((item: UsuarioItem) => Number(item.raw?.MES) === targetMonth)
      mappedRenov = mappedRenov.filter((item: UsuarioItem) => Number(item.raw?.MES) === targetMonth)
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
