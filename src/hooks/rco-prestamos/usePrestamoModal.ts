import React, { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'

import { LibroOption, UsuarioOption } from '@/models/rco/prestamos'
import { Lista, NuevoPrestamo } from '@/Service/rco/Prestamos'

export interface UsePrestamoModalProps {
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onPrestamoCreado?: () => void
}

export const usePrestamoModal = ({
  visible,
  setVisible,
  onPrestamoCreado,
}: UsePrestamoModalProps = {}) => {
  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visible === 'boolean'
  const isVisible = isControlled ? visible : internalVisible

  const [libros, setLibros] = useState<LibroOption[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([])
  const [loadingCatalogos, setLoadingCatalogos] = useState(false)

  const [selectedLibro, setSelectedLibro] = useState<LibroOption | null>(null)
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioOption | null>(null)
  const [busquedaLibro, setBusquedaLibro] = useState('')
  const [busquedaUsuario, setBusquedaUsuario] = useState('')
  const [guardando, setGuardando] = useState(false)

  const fetchUsuarios = useCallback(async () => {
    try {
      const data = await getInscripcionesUsuarios()
      if (Array.isArray(data)) {
        const mapped: UsuarioOption[] = data
          .filter((p: any) => p.ID_INSCRIPCION)
          .map((p: any) => ({
            value: p.ID_INSCRIPCION,
            label: `${p.IDENTIFICACION_PERSONA || ''} - ${p.NOMBRE_PERSONA || ''} ${p.APELLIDO_PERSONA || ''}`.trim(),
            cedula: p.IDENTIFICACION_PERSONA || '',
            nombre: p.NOMBRE_PERSONA || '',
            apellido: p.APELLIDO_PERSONA || '',
          }))
        setUsuarios(mapped)
      }
    } catch (err) {
      console.error('Error al cargar inscripciones de usuarios:', err)
    }
  }, [])

  const fetchLibros = useCallback(async () => {
    try {
      const res = await Lista()
      const list = res?.data || (Array.isArray(res) ? res : [])
      const mapped: LibroOption[] = list.map((l: any) => ({
        value: l.ID_LIBROS,
        label: `ISBN: ${l.ISBN_LIBROS || 'S/N'} - Título: ${l.TITULO_LIBROS || 'Sin título'} - Autor: ${l.AUTORTEJUELO_LIBROS || l.NOMBRE_AUTOR || '-'}`,
        isbn: l.ISBN_LIBROS || '',
        titulo: l.TITULO_LIBROS || '',
        autor: l.AUTORTEJUELO_LIBROS || l.NOMBRE_AUTOR || '',
      }))
      setLibros(mapped)
    } catch (err) {
      console.error('Error al cargar libros disponibles:', err)
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
      setLoadingCatalogos(true)
      Promise.allSettled([fetchUsuarios(), fetchLibros()]).finally(() => {
        setLoadingCatalogos(false)
      })
    }
  }, [isVisible, fetchUsuarios, fetchLibros])

  const handleBuscarLibro = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setBusquedaLibro(q)
    fetchLibros(q)
  }

  const handleBuscarLibroText = (q: string) => {
    setBusquedaLibro(q)
    fetchLibros(q)
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
    if (setVisible) {
      setVisible(false)
    } else {
      setInternalVisible(false)
    }
  }

  const handleGuardarPrestamo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!selectedLibro || !selectedUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, seleccione el libro y el usuario para el préstamo.',
        confirmButtonColor: '#044c8c',
      })
      return
    }

    setGuardando(true)
    try {
      const formData = new FormData()
      formData.append('ID_INSCRIPCION', String(selectedUsuario.value))
      formData.append('ID_LIBROS', String(selectedLibro.value))
      formData.append('ESTADO_PRESTAMO', '1')

      await NuevoPrestamo(formData)

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Préstamo registrado con éxito.',
        confirmButtonColor: '#044c8c',
      })

      handleClose()
      if (onPrestamoCreado) {
        onPrestamoCreado()
      }
    } catch (err: any) {
      console.error(err)
      if (err?.response?.data?.error === 'El libro ya está en préstamo') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El libro ya está en préstamo.',
          confirmButtonColor: '#d33',
        })
      } else if (err?.response?.data?.sancion) {
        Swal.fire({
          icon: 'question',
          title: 'Atención',
          text: err.response.data.sancion,
          confirmButtonColor: '#044c8c',
        })
      } else if (err?.response?.data?.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response.data.message,
          confirmButtonColor: '#d33',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al guardar los datos del préstamo.',
          confirmButtonColor: '#d33',
        })
      }
    } finally {
      setGuardando(false)
    }
  }

  const librosFiltrados = libros.filter((l) => {
    if (!busquedaLibro.trim()) return true
    const q = busquedaLibro.toLowerCase()
    return (
      (l.titulo && l.titulo.toLowerCase().includes(q)) ||
      (l.autor && l.autor.toLowerCase().includes(q)) ||
      (l.isbn && l.isbn.toLowerCase().includes(q)) ||
      (l.label && l.label.toLowerCase().includes(q))
    )
  })

  const usuariosFiltrados = usuarios.filter((u) => {
    if (!busquedaUsuario.trim()) return true
    const q = busquedaUsuario.toLowerCase()
    return (
      (u.label && u.label.toLowerCase().includes(q)) ||
      (u.cedula && u.cedula.toLowerCase().includes(q)) ||
      (u.nombre && u.nombre.toLowerCase().includes(q)) ||
      (u.apellido && u.apellido.toLowerCase().includes(q))
    )
  })

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    libros,
    usuarios,
    loadingCatalogos,
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
    guardando,
    handleGuardarPrestamo,

    libroSeleccionado: selectedLibro,
    setLibroSeleccionado: setSelectedLibro,
    usuarioSeleccionado: selectedUsuario,
    setUsuarioSeleccionado: setSelectedUsuario,
    librosFiltrados,
    usuariosFiltrados,
    loadingUsuarios: loadingCatalogos,
  }
}

export default usePrestamoModal
