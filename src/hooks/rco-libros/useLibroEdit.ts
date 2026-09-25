import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { LibroFormData, Libros, initialLibroFormData } from '@/models/rco/libros'

import { useCatalogosLibros } from './useCatalogosLibros'
import { ActualizarLibro } from '@/Service/rco/libros'

export interface UseLibroEditProps {
  libro: Libros | null
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onSuccess?: () => void
}

export const useLibroEdit = ({
  libro,
  visible,
  setVisible,
  onSuccess,
}: UseLibroEditProps) => {
  const [internalVisible, setInternalVisible] = useState(false)
  const isVisible = visible !== undefined ? visible : internalVisible

  const [formData, setFormData] = useState<LibroFormData>(initialLibroFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const catalogos = useCatalogosLibros(isVisible)

  useEffect(() => {
    if (libro) {
      let fechaEdicion = ''
      if (libro.FECHAEDICION_LIBROS) {
        try {
          const d = new Date(libro.FECHAEDICION_LIBROS)
          if (!isNaN(d.getTime())) {
            fechaEdicion = d.toISOString().split('T')[0]
          } else {
            fechaEdicion = String(libro.FECHAEDICION_LIBROS).split('T')[0]
          }
        } catch {
          fechaEdicion = String(libro.FECHAEDICION_LIBROS).split('T')[0]
        }
      }

      setFormData({
        ID_CATEGORIA: libro.ID_CATEGORIA ?? '',
        ID_EDITORIAL: libro.ID_EDITORIAL ?? '',
        ID_PROVEEDOR: libro.ID_PROVEEDOR ?? '',
        ID_RCOGENERO: libro.ID_RCOGENERO ?? '',
        ID_FORMATOS: libro.ID_FORMATOS ?? '',
        ID_TIPO: libro.ID_TIPO ?? '',
        ID_AUTOR: libro.ID_AUTOR ?? '',
        ISBN_LIBROS: String(libro.ISBN_LIBROS ?? libro.ISBN ?? ''),
        TITULO_LIBROS: String(libro.TITULO_LIBROS ?? libro.Titulo ?? ''),
        PRECIO_LIBROS: String(libro.PRECIO_LIBROS ?? libro.Precio ?? ''),
        CODIGODEBARRAS_LIBROS: String(libro.CODIGODEBARRAS_LIBROS ?? libro.CodigoBarras ?? ''),
        VOLUMEN_LIBROS: String(libro.VOLUMEN_LIBROS ?? libro.Volumen ?? ''),
        FECHAEDICION_LIBROS: fechaEdicion,
        PAIS_LIBROS: String(libro.PAIS_LIBROS ?? libro.Pais ?? ''),
        DESCRIPCION_LIBROS: String(libro.DESCRIPCION_LIBROS ?? libro.Descripcion ?? ''),
        TITULOTEJUELO_LIBROS: String(libro.TITULOTEJUELO_LIBROS ?? libro.TituloTejuelo ?? ''),
        AUTORTEJUELO_LIBROS: String(libro.AUTORTEJUELO_LIBROS ?? libro.AutorTejuelo ?? ''),
        ESTADO_LIBROS: String(libro.ESTADO_LIBROS ?? '1'),
      })
      setErrors({})
    }
  }, [libro])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleSelectChange = (name: keyof LibroFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleClose = () => {
    setErrors({})
    if (setVisible) {
      setVisible(false)
    } else {
      setInternalVisible(false)
    }
  }

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    const camposFaltantes: string[] = []

    if (!formData.TITULO_LIBROS || !formData.TITULO_LIBROS.trim()) {
      newErrors.TITULO_LIBROS = 'El título es obligatorio'
      camposFaltantes.push('Título')
    }
    if (!formData.FECHAEDICION_LIBROS) {
      newErrors.FECHAEDICION_LIBROS = 'La fecha de edición es obligatoria'
      camposFaltantes.push('Fecha de Edición')
    }
    if (formData.ESTADO_LIBROS === '' || formData.ESTADO_LIBROS === undefined) {
      newErrors.ESTADO_LIBROS = 'Seleccione el estado'
      camposFaltantes.push('Estado')
    }
    if (!formData.ID_CATEGORIA) {
      newErrors.ID_CATEGORIA = 'Seleccione una categoría'
      camposFaltantes.push('Categoría')
    }
    if (!formData.ID_AUTOR) {
      newErrors.ID_AUTOR = 'Seleccione un autor'
      camposFaltantes.push('Autor')
    }
    if (!formData.ID_EDITORIAL) {
      newErrors.ID_EDITORIAL = 'Seleccione una editorial'
      camposFaltantes.push('Editorial')
    }
    if (!formData.ID_PROVEEDOR) {
      newErrors.ID_PROVEEDOR = 'Seleccione un proveedor'
      camposFaltantes.push('Proveedor')
    }
    if (!formData.ID_RCOGENERO) {
      newErrors.ID_RCOGENERO = 'Seleccione un género'
      camposFaltantes.push('Género')
    }
    if (!formData.ID_FORMATOS) {
      newErrors.ID_FORMATOS = 'Seleccione un formato'
      camposFaltantes.push('Formato')
    }
    if (!formData.ID_TIPO) {
      newErrors.ID_TIPO = 'Seleccione un tipo'
      camposFaltantes.push('Tipo')
    }

    setErrors(newErrors)

    if (camposFaltantes.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Campos requeridos',
        text: `Por favor, completa los siguientes campos: ${camposFaltantes.join(', ')}.`,
        confirmButtonColor: '#044c8c',
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!libro) return
    const id = libro.ID_LIBROS ?? libro.id
    if (!id) return

    if (!validate()) return

    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('ID_CATEGORIA', String(formData.ID_CATEGORIA))
      payload.append('ID_EDITORIAL', String(formData.ID_EDITORIAL))
      payload.append('ID_PROVEEDOR', String(formData.ID_PROVEEDOR))
      payload.append('ID_RCOGENERO', String(formData.ID_RCOGENERO))
      payload.append('ID_FORMATOS', String(formData.ID_FORMATOS))
      payload.append('ID_TIPO', String(formData.ID_TIPO))
      payload.append('ID_AUTOR', String(formData.ID_AUTOR))
      payload.append('ISBN_LIBROS', formData.ISBN_LIBROS || 'S/C')
      payload.append('TITULO_LIBROS', formData.TITULO_LIBROS.trim())
      payload.append('PRECIO_LIBROS', String(formData.PRECIO_LIBROS || '0'))
      payload.append('CODIGODEBARRAS_LIBROS', formData.CODIGODEBARRAS_LIBROS || 'S/C')
      payload.append('VOLUMEN_LIBROS', formData.VOLUMEN_LIBROS || '')
      payload.append('FECHAEDICION_LIBROS', formData.FECHAEDICION_LIBROS)
      payload.append('PAIS_LIBROS', formData.PAIS_LIBROS || '')
      payload.append('DESCRIPCION_LIBROS', formData.DESCRIPCION_LIBROS || '')
      payload.append('TITULOTEJUELO_LIBROS', formData.TITULOTEJUELO_LIBROS || '')
      payload.append('AUTORTEJUELO_LIBROS', formData.AUTORTEJUELO_LIBROS || '')
      payload.append('ESTADO_LIBROS', String(formData.ESTADO_LIBROS ?? '1'))
      payload.append('_method', 'PUT')

      await ActualizarLibro(id, payload)

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Libro actualizado exitosamente.',
        confirmButtonColor: '#044c8c',
      })

      handleClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error(err)
      const errorMsg =
        err?.response?.data?.message ||
        'Ocurrió un error al actualizar el libro. Por favor intenta de nuevo.'
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
        confirmButtonColor: '#d33',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    isVisible,
    formData,
    loading,
    errors,
    catalogos,
    handleChange,
    handleSelectChange,
    handleClose,
    handleSubmit,
  }
}

export default useLibroEdit
