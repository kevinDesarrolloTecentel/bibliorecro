import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Swal from 'sweetalert2'

import { LibroOption, UsuarioOption } from '@/models/rco/prestamos'
import { NuevoPrestamo } from '@/Service/rco/Prestamos'
import { BuscarLibros } from '@/Service/rco/Libros'
import { Personas } from '@/Service/tab/Persona'
import { formatFecha } from '@/utils/dateUtils'
import { deduplicarPersonas, isUserSancionado, isUserVetado } from '../tab-persona/usePersonas'
import { sanitizarHistorialSanciones } from '@/utils/sancionUtils'
import { usePermissions } from '@/context/PermissionsContext'

const toArray = (val: any): any[] => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (Array.isArray(val.personas?.data)) return val.personas.data
  if (Array.isArray(val.personas)) return val.personas
  if (Array.isArray(val.data?.data)) return val.data.data
  if (Array.isArray(val.data)) return val.data
  if (Array.isArray(val.usuarios?.data)) return val.usuarios.data
  if (Array.isArray(val.usuarios)) return val.usuarios
  if (Array.isArray(val.inscripciones?.data)) return val.inscripciones.data
  if (Array.isArray(val.inscripciones)) return val.inscripciones
  if (Array.isArray(val.registradas?.data)) return val.registradas.data
  if (Array.isArray(val.registradas)) return val.registradas
  return []
}

export const isUserActivoYDisponible = (u: any): boolean => {
  const estRaw = String(u.ESTADO_PERSONA ?? u.estado ?? '1').toLowerCase().trim()
  const isActivo = estRaw === '1' || estRaw === 'activo' || (!estRaw.includes('inactiv') && estRaw !== '0')

  const estInscRaw = String(u.ESTADO_INSCRIPCION ?? '').toLowerCase().trim()
  const hasInscripcionActiva =
    estInscRaw === '1' ||
    estInscRaw === 'activo' ||
    (!estInscRaw.includes('inactiv') && estInscRaw !== '0' && Boolean(u.ID_INSCRIPCION))
  const isInscrito = hasInscripcionActiva || Boolean(u.ID_INSCRIPCION)

  const esVetado = isUserVetado(u)
  const esSancionado = isUserSancionado(u)

  return isActivo && isInscrito && !esVetado && !esSancionado
}

export const isLibroDisponible = (l: any): boolean => {
  const activo =
    Number(l.ESTADO_LIBROS ?? l.ESTADO_LIBRO ?? 1) === 1 &&
    String(l.ESTADO_LIBRO ?? 'Activo').toLowerCase() !== 'inactivo'
  const prestado =
    Number(l.EN_PRESTAMO ?? 0) === 1 ||
    Number(l.DISPONIBILIDAD_LIBRO ?? 1) === 0 ||
    String(l.ESTADO_PRESTAMO || '').toLowerCase().includes('préstamo') ||
    String(l.DISPONIBILIDAD || '').toLowerCase().includes('préstamo')
  return activo && !prestado
}

const fetchInscripcionesData = async (busqueda: string = ''): Promise<any[]> => {
  try {
    const q = busqueda.trim()
    const res = await Personas(1, 50, q || undefined, 1, 0, 0)
    let list = toArray(res)

    if (list.length === 0) {
      const fallbackRes = await Personas(1, 50, q || undefined)
      list = toArray(fallbackRes)
    }

    const deduplicados = deduplicarPersonas(list)
    return deduplicados.filter(isUserActivoYDisponible)
  } catch (err) {
    console.warn('Error al consultar usuarios inscritos activos:', err)
  }
  return []
}

export interface UsePrestamoModalProps {
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onPrestamoCreado?: () => void
  canGuardarPrestamo?: boolean
}

export const usePrestamoModal = ({
  visible,
  setVisible,
  onPrestamoCreado,
  canGuardarPrestamo = true,
}: UsePrestamoModalProps = {}) => {
  const { verificarAccionEnServidor } = usePermissions()

  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visible === 'boolean'
  const isVisible = isControlled ? visible : internalVisible

  const [libros, setLibros] = useState<LibroOption[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([])
  const [loadingCatalogos, setLoadingCatalogos] = useState(false)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)

  const [selectedLibro, setSelectedLibro] = useState<LibroOption | null>(null)
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioOption | null>(null)
  const [busquedaLibro, setBusquedaLibro] = useState('')
  const [busquedaUsuario, setBusquedaUsuario] = useState('')
  const [detallePrestamo, setDetallePrestamo] = useState('')
  const [guardando, setGuardando] = useState(false)

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const searchLibroDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchUsuarios = useCallback(async (query: string = '') => {
    try {
      setLoadingUsuarios(true)
      const rawData = await fetchInscripcionesData(query)
      const mapped: UsuarioOption[] = rawData
        .map((p: any) => {
          const idInscripcion =
            p.ID_INSCRIPCION ??
            p.id_inscripcion ??
            p.idInscripcion ??
            p.inscripcion?.ID_INSCRIPCION ??
            p.inscripcion?.id ??
            p.ID_PERSONA ??
            p.id_persona ??
            p.id

          const cedula = String(
            p.IDENTIFICACION_PERSONA ??
            p.identificacion ??
            p.identificacion_persona ??
            p.cedula ??
            p.CEDULA ??
            '',
          ).trim()

          const nombre = String(
            p.NOMBRE_PERSONA ??
            p.nombre ??
            p.nombres ??
            p.NOMBRES_PERSONA ??
            '',
          ).trim()

          const apellido = String(
            p.APELLIDO_PERSONA ??
            p.apellido ??
            p.apellidos ??
            p.APELLIDOS_PERSONA ??
            '',
          ).trim()

          const fullName = `${nombre} ${apellido}`.trim()
          const labelParts: string[] = []
          if (cedula) labelParts.push(cedula)
          if (fullName) labelParts.push(fullName)

          const rawListSanciones = [
            ...(Array.isArray(p.vetos) ? p.vetos : []),
            ...(Array.isArray(p.raw?.vetos) ? p.raw.vetos : []),
            ...(Array.isArray(p.historial_sanciones) ? p.historial_sanciones : []),
            ...(Array.isArray(p.sanciones) ? p.sanciones : []),
            ...(Array.isArray(p.raw?.sanciones) ? p.raw.sanciones : []),
            ...(p.FECHAINICIO_SANCION || p.FECHAFIN_SANCION || p.DETALLE_SANCION || p.MOTIVO_VETO || p.FECHA_VETO ? [{
              id: p.ID_SANCION ?? p.id_sancion ?? p.id,
              inicio: p.FECHAINICIO_SANCION ?? p.FECHA_VETO,
              fin: p.FECHAFIN_SANCION ?? (isUserVetado(p) ? 'Indefinido' : ''),
              detalle: p.DETALLE_SANCION ?? p.MOTIVO_VETO ?? p.detalle_sancion,
              estado: p.ESTADO_VETO ?? p.ESTADO_SANCION,
            }] : [])
          ]

          const historialSanitizado = sanitizarHistorialSanciones(rawListSanciones)
          const sancionMasActual = historialSanitizado[0] || null

          const rawSancion =
            sancionMasActual ||
            (p.sancion && typeof p.sancion === 'object' ? p.sancion : null) ||
            null

          const tieneSancion = Boolean(
            rawSancion &&
            (
              rawSancion.inicio ||
              rawSancion.fin ||
              (rawSancion.detalle && !String(rawSancion.detalle).toLowerCase().includes('sin sancion')) ||
              rawSancion.id ||
              isUserSancionado(p) ||
              historialSanitizado.length > 0
            )
          )

          const detalleFinal = String(
            sancionMasActual?.detalle ||
            p.DETALLE_SANCION ||
            p.detalle_sancion ||
            p.MOTIVO_SANCION ||
            p.MOTIVO_VETO ||
            rawSancion?.detalle ||
            ''
          ).trim()

          const fechaInicioFinal =
            sancionMasActual?.inicio ||
            (p.FECHAINICIO_SANCION ? formatFecha(p.FECHAINICIO_SANCION) : '') ||
            rawSancion?.inicio ||
            ''

          const fechaFinFinal =
            sancionMasActual?.fin ||
            (p.FECHAFIN_SANCION ? formatFecha(p.FECHAFIN_SANCION) : '') ||
            rawSancion?.fin ||
            ''

          const sancionObj = tieneSancion
            ? {
              inicio: fechaInicioFinal,
              fin: fechaFinFinal,
              detalle: detalleFinal || 'Sanción registrada',
              estado: sancionMasActual?.estado ?? rawSancion?.estado ?? p.ESTADO_SANCION ?? 0,
            }
            : null

          return {
            value: idInscripcion,
            label: labelParts.join(' - ') || `Usuario #${idInscripcion}`,
            cedula,
            nombre,
            apellido,
            estado: 'Activo',
            tieneSancion,
            sancion: sancionObj,
            raw: p,
          }
        })
        .filter((u: UsuarioOption) => u.value !== undefined && u.value !== null && u.value !== '')

      const deduplicadosPorValor: UsuarioOption[] = []
      const vistos = new Set<string>()
      for (const u of mapped) {
        const k = String(u.value || u.cedula).trim()
        if (k && !vistos.has(k)) {
          vistos.add(k)
          deduplicadosPorValor.push(u)
        }
      }

      setUsuarios(deduplicadosPorValor)
    } catch (err) {
      console.error('Error al cargar inscripciones de usuarios:', err)
      setUsuarios([])
    } finally {
      setLoadingUsuarios(false)
    }
  }, [])

  const fetchLibros = useCallback(async (query: string = '') => {
    try {
      setLoadingCatalogos(true)
      const res = await BuscarLibros(query.trim(), 1, 30)
      const list = toArray(res)
      const disponibles = list.filter(isLibroDisponible)

      const mapped: LibroOption[] = disponibles.map((l: any) => {
        const idLibro = l.ID_LIBROS ?? l.id
        const isbn = String(l.ISBN_LIBROS ?? l.isbn ?? '').trim()
        const titulo = String(l.TITULO_LIBROS ?? l.titulo ?? 'Sin título').trim()
        const autor = String(l.NOMBRE_AUTOR ?? l.AUTORTEJUELO_LIBROS ?? l.autor ?? '').trim()
        const tejuelo = String(l.TITULOTEJUELO_LIBROS ?? l.AUTORTEJUELO_LIBROS ?? '').trim()

        return {
          value: idLibro,
          label: `ISBN: ${isbn || 'S/N'} - Título: ${titulo} - Autor: ${autor || '-'}`,
          isbn,
          titulo,
          autor: autor || tejuelo,
        }
      })
      setLibros(mapped)
    } catch (err) {
      console.error('Error al cargar libros disponibles:', err)
      setLibros([])
    } finally {
      setLoadingCatalogos(false)
    }
  }, [])

  // Carga y búsqueda dinámica de libros disponibles
  useEffect(() => {
    if (!isVisible) return

    if (searchLibroDebounceRef.current) {
      clearTimeout(searchLibroDebounceRef.current)
    }

    const delay = busquedaLibro.trim() ? 350 : 0
    searchLibroDebounceRef.current = setTimeout(() => {
      fetchLibros(busquedaLibro)
    }, delay)

    return () => {
      if (searchLibroDebounceRef.current) {
        clearTimeout(searchLibroDebounceRef.current)
      }
    }
  }, [busquedaLibro, isVisible, fetchLibros])

  // Carga y búsqueda dinámica de usuarios
  useEffect(() => {
    if (!isVisible) return

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    const delay = busquedaUsuario.trim() ? 350 : 0
    searchDebounceRef.current = setTimeout(() => {
      fetchUsuarios(busquedaUsuario)
    }, delay)

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [busquedaUsuario, isVisible, fetchUsuarios])

  const handleBuscarLibro = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setBusquedaLibro(q)
  }

  const handleBuscarLibroText = (q: string) => {
    setBusquedaLibro(q)
  }

  const handleOpen = () => {
    if (setVisible) {
      setVisible(true)
    } else {
      setInternalVisible(true)
    }
  }

  const handleClose = () => {
    setSelectedLibro(null)
    setSelectedUsuario(null)
    setBusquedaLibro('')
    setBusquedaUsuario('')
    setDetallePrestamo('')
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    if (searchLibroDebounceRef.current) {
      clearTimeout(searchLibroDebounceRef.current)
    }
    if (setVisible) {
      setVisible(false)
    } else {
      setInternalVisible(false)
    }
  }

  const handleGuardarPrestamo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!canGuardarPrestamo) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No cuenta con permisos para registrar nuevos préstamos.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_prestamo')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No cuenta con permisos para registrar nuevos préstamos.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!selectedLibro || !selectedUsuario) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, seleccione el libro y el usuario para el préstamo.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    // Si el usuario tiene sanción registrada, pedir confirmacion
    if (selectedUsuario.tieneSancion) {
      const fechaInicio = formatFecha(selectedUsuario.sancion?.inicio)
      const fechaFin = formatFecha(selectedUsuario.sancion?.fin)
      const detalle =
        selectedUsuario.sancion?.detalle ||
        selectedUsuario.raw?.DETALLE_SANCION ||
        'Sin detalle especificado'

      const result = await Swal.fire({
        title: '¿Está seguro de realizar el préstamo?',
        html: `
          <div style="text-align: left; font-size: 0.95rem;">
            <p style="margin-bottom: 0.8rem; color: #495057;">
              El usuario <strong>${selectedUsuario.nombre} ${selectedUsuario.apellido}</strong> cuenta con un registro de sanción:
            </p>
            <div style="background-color: #fff3cd; color: #664d03; border: 1px solid #ffe69c; border-radius: 8px; padding: 12px; margin-bottom: 0.8rem;">
              <div style="font-weight: 700; margin-bottom: 6px; font-size: 0.95rem;">Información de la Sanción:</div>
              <div style="font-size: 0.88rem; line-height: 1.6; background-color: rgba(255,255,255,0.7); padding: 8px; border-radius: 6px;">
                <div><strong>Fecha Inicio Sanción:</strong> ${fechaInicio}</div>
                <div><strong>Fecha Fin Sanción:</strong> ${fechaFin}</div>
                <div><strong>Detalle de la Sanción:</strong> ${detalle}</div>
              </div>
            </div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, registrar préstamo',
        cancelButtonText: 'Cancelar',
      })

      if (!result.isConfirmed) {
        return
      }
    }

    setGuardando(true)
    try {
      const formData = new FormData()
      formData.append('ID_INSCRIPCION', String(selectedUsuario.value))
      formData.append('ID_LIBROS', String(selectedLibro.value))
      formData.append('ESTADO_PRESTAMO', '1')
      if (detallePrestamo.trim()) {
        formData.append('DETALLE_PRESTAMO', detallePrestamo.trim())
        formData.append('detalle_prestamo', detallePrestamo.trim())
      }

      await NuevoPrestamo(formData)

      Swal.fire({
        icon: 'success',
        title: '¡Préstamo registrado!',
        text: 'El préstamo se registró exitosamente.',
        timer: 1800,
        showConfirmButton: false,
      })

      handleClose()
      if (onPrestamoCreado) {
        onPrestamoCreado()
      }
    } catch (err: any) {
      console.error(err)
      const data = err?.response?.data
      if (data?.error === 'El libro ya está en préstamo') {
        Swal.fire({
          icon: 'error',
          title: 'Libro no disponible',
          text: 'El libro ya se encuentra en préstamo actualmente.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      } else if (data?.alerta_sancion) {
        const alerta = data.alerta_sancion
        const fechaInicio = formatFecha(alerta.FECHAINICIO_SANCION)
        const fechaFin = formatFecha(alerta.FECHAFIN_SANCION)
        const detalle = alerta.DETALLE_SANCION || alerta.detalle || alerta.motivo || alerta.MOTIVO_SANCION || 'Sanción activa'
        Swal.fire({
          icon: 'warning',
          title: 'Usuario Sancionado',
          html: `
            <div style="text-align: left; font-size: 0.95rem;">
              <p style="margin-bottom: 8px;">${alerta.mensaje || data.message || 'El usuario cuenta con una sanción activa.'}</p>
              <div style="background-color: #fff3cd; color: #664d03; border: 1px solid #ffe69c; border-radius: 6px; padding: 10px;">
                <div><strong>Fecha Inicio Sanción:</strong> ${fechaInicio}</div>
                <div><strong>Fecha Fin Sanción:</strong> ${fechaFin}</div>
                <div><strong>Detalle de la Sanción:</strong> ${detalle}</div>
              </div>
            </div>
          `,
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      } else if (data?.sancion) {
        Swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: data.sancion,
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      } else if (data?.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: data.message,
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: 'Hubo un error al guardar los datos del préstamo.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setGuardando(false)
    }
  }

  const librosFiltrados = useMemo(() => {
    let list = libros
    // Si hay un libro seleccionado que no está en la lista actual de resultados de búsqueda, lo incluimos al inicio para que no desaparezca
    if (selectedLibro && !list.some((l) => l.value === selectedLibro.value)) {
      list = [selectedLibro, ...list]
    }
    return list
  }, [libros, selectedLibro])

  const usuariosFiltrados = useMemo(() => {
    let list = usuarios
    // Si hay un usuario seleccionado que no está en la lista actual de resultados de búsqueda, lo incluimos al inicio para que no desaparezca
    if (selectedUsuario && !list.some((u) => u.value === selectedUsuario.value)) {
      list = [selectedUsuario, ...list]
    }
    return list
  }, [usuarios, selectedUsuario])

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    libros,
    usuarios,
    loadingCatalogos,
    loadingUsuarios,
    selectedLibro,
    setSelectedLibro,
    selectedUsuario,
    setSelectedUsuario,
    busquedaLibro,
    setBusquedaLibro,
    handleBuscarLibro,
    handleBuscarLibroText,
    busquedaUsuario,
    setBusquedaUsuario,
    detallePrestamo,
    setDetallePrestamo,
    guardando,
    handleGuardarPrestamo,
    canGuardarPrestamo,
    verificarAccionEnServidor,

    libroSeleccionado: selectedLibro,
    setLibroSeleccionado: setSelectedLibro,
    usuarioSeleccionado: selectedUsuario,
    setUsuarioSeleccionado: setSelectedUsuario,
    librosFiltrados,
    usuariosFiltrados,
  }
}

export default usePrestamoModal
