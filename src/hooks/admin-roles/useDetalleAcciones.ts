import { useState, useCallback, useMemo } from 'react'
import Swal from 'sweetalert2'
import { Accion, Pantalla } from '@/models/adm/permiso.model'
import { usePermissions } from '@/context/PermissionsContext'

export const useDetalleAcciones = () => {
  const { canDoAction } = usePermissions()

  // Permisos para ver la descripción de acciones por módulo
  const canDescripcionAccionesDashboard = canDoAction('btn_descripcion_acciones_dashboard')
  const canDescripcionAccionesUsuarioAdm = canDoAction('btn_descripcion_acciones_usuario_adm')
  const canDescripcionAccionesRol = canDoAction('btn_descripcion_acciones_rol')
  const canDescripcionAccionesPerfil = canDoAction('btn_descripcion_acciones_perfil')
  const canDescripcionAccionesGestionUsuario = canDoAction('btn_descripcion_acciones_gestion_usuario')
  const canDescripcionAccionesRenovaciones = canDoAction('btn_descripcion_acciones_renovaciones')
  const canDescripcionAccionesLibro = canDoAction('btn_descripcion_acciones_libro')
  const canDescripcionAccionesPrestamo = canDoAction('btn_descripcion_acciones_prestamo')
  const canDescripcionAccionesSancion = canDoAction('btn_descripcion_acciones_sancion')
  const canDescripcionAccionesCategoria = canDoAction('btn_descripcion_acciones_categoria')
  const canDescripcionAccionesEditorial = canDoAction('btn_descripcion_acciones_editorial')
  const canDescripcionAccionesProveedor = canDoAction('btn_descripcion_acciones_proveedor')
  const canDescripcionAccionesAutor = canDoAction('btn_descripcion_acciones_autor')
  const canDescripcionAccionesGenero = canDoAction('btn_descripcion_acciones_genero')
  const canDescripcionAccionesReportUsuarios = canDoAction('btn_descripcion_acciones_report_usuarios')
  const canDescripcionAccionesReportPrestamos = canDoAction('btn_descripcion_acciones_report_prestamos')
  const canDescripcionAccionesReportInventario = canDoAction('btn_descripcion_acciones_report_inventario')
  const canDescripcionAccionesReportTejuelos = canDoAction('btn_descripcion_acciones_report_tejuelos')

  const mapaPermisos: Record<string, boolean> = useMemo(
    () => ({
      btn_descripcion_acciones_dashboard: canDescripcionAccionesDashboard,
      btn_descripcion_acciones_usuario_adm: canDescripcionAccionesUsuarioAdm,
      btn_descripcion_acciones_rol: canDescripcionAccionesRol,
      btn_descripcion_acciones_perfil: canDescripcionAccionesPerfil,
      btn_descripcion_acciones_gestion_usuario: canDescripcionAccionesGestionUsuario,
      btn_descripcion_acciones_renovaciones: canDescripcionAccionesRenovaciones,
      btn_descripcion_acciones_libro: canDescripcionAccionesLibro,
      btn_descripcion_acciones_prestamo: canDescripcionAccionesPrestamo,
      btn_descripcion_acciones_sancion: canDescripcionAccionesSancion,
      btn_descripcion_acciones_categoria: canDescripcionAccionesCategoria,
      btn_descripcion_acciones_editorial: canDescripcionAccionesEditorial,
      btn_descripcion_acciones_proveedor: canDescripcionAccionesProveedor,
      btn_descripcion_acciones_autor: canDescripcionAccionesAutor,
      btn_descripcion_acciones_genero: canDescripcionAccionesGenero,
      btn_descripcion_acciones_report_usuarios: canDescripcionAccionesReportUsuarios,
      btn_descripcion_acciones_report_prestamos: canDescripcionAccionesReportPrestamos,
      btn_descripcion_acciones_report_inventario: canDescripcionAccionesReportInventario,
      btn_descripcion_acciones_report_tejuelos: canDescripcionAccionesReportTejuelos,
    }),
    [
      canDescripcionAccionesDashboard,
      canDescripcionAccionesUsuarioAdm,
      canDescripcionAccionesRol,
      canDescripcionAccionesPerfil,
      canDescripcionAccionesGestionUsuario,
      canDescripcionAccionesRenovaciones,
      canDescripcionAccionesLibro,
      canDescripcionAccionesPrestamo,
      canDescripcionAccionesSancion,
      canDescripcionAccionesCategoria,
      canDescripcionAccionesEditorial,
      canDescripcionAccionesProveedor,
      canDescripcionAccionesAutor,
      canDescripcionAccionesGenero,
      canDescripcionAccionesReportUsuarios,
      canDescripcionAccionesReportPrestamos,
      canDescripcionAccionesReportInventario,
      canDescripcionAccionesReportTejuelos,
    ],
  )

  // Estado del modal y la acción seleccionada
  const [accionSeleccionada, setAccionSeleccionada] = useState<Accion | null>(null)
  const [modalDetalleOpen, setModalDetalleOpen] = useState<boolean>(false)

  // Validar si tiene permiso según las acciones que la base de datos devuelve para la pantalla
  const puedeVerDescripcionPantalla = useCallback(
    (pantalla?: Pantalla | null, accionesDeLaPantalla?: Accion[]): boolean => {
      const lista = accionesDeLaPantalla || pantalla?.ACCIONES || []
      const accionEncontrada = lista.find(
        (a) => a.CODIGO_ACCION && a.CODIGO_ACCION in mapaPermisos,
      )

      if (accionEncontrada && accionEncontrada.CODIGO_ACCION) {
        return Boolean(mapaPermisos[accionEncontrada.CODIGO_ACCION])
      }

      return true
    },
    [mapaPermisos],
  )

  // Abrir el modal validando según la acción de descripción que tiene esta pantalla en BD
  const verDetalleAccion = useCallback(
    (accion: Accion, pantalla?: Pantalla | null, accionesDeLaPantalla?: Accion[]) => {
      let tienePermiso = true
      const lista = accionesDeLaPantalla || pantalla?.ACCIONES || []

      const accionEncontrada = lista.find(
        (a) => a.CODIGO_ACCION && a.CODIGO_ACCION in mapaPermisos,
      )

      if (accionEncontrada && accionEncontrada.CODIGO_ACCION) {
        tienePermiso = Boolean(mapaPermisos[accionEncontrada.CODIGO_ACCION])
      }

      if (!tienePermiso) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: `No tienes permisos para ver la descripción de las acciones de este módulo.`,
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      setAccionSeleccionada(accion)
      setModalDetalleOpen(true)
    },
    [mapaPermisos],
  )

  // Cerrar el modal
  const cerrarDetalleAccion = useCallback(() => {
    setModalDetalleOpen(false)
    setAccionSeleccionada(null)
  }, [])

  return {
    accionSeleccionada,
    modalDetalleOpen,
    verDetalleAccion,
    cerrarDetalleAccion,
    puedeVerDescripcionPantalla,
    canDescripcionAccionesDashboard,
    canDescripcionAccionesUsuarioAdm,
    canDescripcionAccionesRol,
    canDescripcionAccionesPerfil,
    canDescripcionAccionesGestionUsuario,
    canDescripcionAccionesRenovaciones,
    canDescripcionAccionesLibro,
    canDescripcionAccionesPrestamo,
    canDescripcionAccionesSancion,
    canDescripcionAccionesCategoria,
    canDescripcionAccionesEditorial,
    canDescripcionAccionesProveedor,
    canDescripcionAccionesAutor,
    canDescripcionAccionesGenero,
    canDescripcionAccionesReportUsuarios,
    canDescripcionAccionesReportPrestamos,
    canDescripcionAccionesReportInventario,
    canDescripcionAccionesReportTejuelos,
  }
}

export default useDetalleAcciones
