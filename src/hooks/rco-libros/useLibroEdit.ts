import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { LibroFormData, Libros, initialLibroFormData } from '@/models/rco/libros.model'

import { useCatalogosLibros } from './useCatalogosLibros'
import { ActualizarLibro, VerLibros } from '@/Service/rco/Libros'
import { parseDatePickerValue } from '@/utils/dateUtils'
import { usePermissions } from '@/hooks/auth/usePermissions'

export interface UseLibroEditProps {
  libro: Libros | null
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onSuccess?: () => void
  canActualizarLibro?: boolean
}

export const useLibroEdit = ({
  libro,
  visible,
  setVisible,
  onSuccess,
  canActualizarLibro = true,
}: UseLibroEditProps) => {
  const { verificarAccionEnServidor } = usePermissions()

  const [internalVisible, setInternalVisible] = useState(false)
  const isVisible = visible !== undefined ? visible : internalVisible

  const [formData, setFormData] = useState<LibroFormData>(initialLibroFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const catalogos = useCatalogosLibros(true)

  const lastFetchedIdRef = React.useRef<string | number | null>(null)

  useEffect(() => {
    if (!isVisible) {
      lastFetchedIdRef.current = null
      return
    }

    if (libro && isVisible) {
      const fechaOrigen = libro.FECHAEDICION_LIBROS || ''
      const fechaEdicion = parseDatePickerValue(fechaOrigen as any)

      const catId = libro.ID_CATEGORIA ?? ''
      const editId = libro.ID_EDITORIAL ?? ''
      const provId = libro.ID_PROVEEDOR ?? ''
      const genId = libro.ID_RCOGENERO ?? ''
      const formId = libro.ID_FORMATOS ?? ''
      const tipoId = libro.ID_TIPO ?? ''
      const autorId = libro.ID_AUTOR ?? ''
      const estadoVal = String(libro.ESTADO_LIBROS ?? '1')

      setFormData({
        ID_CATEGORIA: catId,
        ID_EDITORIAL: editId,
        ID_PROVEEDOR: provId,
        ID_RCOGENERO: genId,
        ID_FORMATOS: formId,
        ID_TIPO: tipoId,
        ID_AUTOR: autorId,
        ISBN_LIBROS: String(libro.ISBN_LIBROS ?? ''),
        TITULO_LIBROS: String(libro.TITULO_LIBROS ?? ''),
        PRECIO_LIBROS: String(libro.PRECIO_LIBROS ?? ''),
        CODIGODEBARRAS_LIBROS: String(libro.CODIGODEBARRAS_LIBROS ?? ''),
        VOLUMEN_LIBROS: String(libro.VOLUMEN_LIBROS ?? ''),
        FECHAEDICION_LIBROS: fechaEdicion,
        PAIS_LIBROS: String(libro.PAIS_LIBROS ?? ''),
        DESCRIPCION_LIBROS: String(libro.DESCRIPCION_LIBROS ?? ''),
        TITULOTEJUELO_LIBROS: String(libro.TITULOTEJUELO_LIBROS ?? ''),
        AUTORTEJUELO_LIBROS: String(libro.AUTORTEJUELO_LIBROS ?? ''),
        ESTADO_LIBROS: estadoVal,
      })
      setErrors({})

      const id = libro.ID_LIBROS
      if (id && lastFetchedIdRef.current !== id) {
        lastFetchedIdRef.current = id
        VerLibros(id)
          .then((res: any) => {
            const data = res?.data || res
            if (data && typeof data === 'object') {
              const rawFecha = data.FECHAEDICION_LIBROS
              const parsedFecha = rawFecha ? parseDatePickerValue(rawFecha) : null
              setFormData((prev) => ({
                ...prev,
                ID_CATEGORIA: data.ID_CATEGORIA ?? prev.ID_CATEGORIA,
                ID_EDITORIAL: data.ID_EDITORIAL ?? prev.ID_EDITORIAL,
                ID_PROVEEDOR: data.ID_PROVEEDOR ?? prev.ID_PROVEEDOR,
                ID_RCOGENERO: data.ID_RCOGENERO ?? prev.ID_RCOGENERO,
                ID_FORMATOS: data.ID_FORMATOS ?? prev.ID_FORMATOS,
                ID_TIPO: data.ID_TIPO ?? prev.ID_TIPO,
                ID_AUTOR: data.ID_AUTOR ?? prev.ID_AUTOR,
                ISBN_LIBROS: String(data.ISBN_LIBROS ?? prev.ISBN_LIBROS),
                TITULO_LIBROS: String(data.TITULO_LIBROS ?? prev.TITULO_LIBROS),
                PRECIO_LIBROS: String(data.PRECIO_LIBROS ?? prev.PRECIO_LIBROS),
                CODIGODEBARRAS_LIBROS: String(data.CODIGODEBARRAS_LIBROS ?? prev.CODIGODEBARRAS_LIBROS),
                VOLUMEN_LIBROS: String(data.VOLUMEN_LIBROS ?? prev.VOLUMEN_LIBROS),
                FECHAEDICION_LIBROS: parsedFecha || prev.FECHAEDICION_LIBROS,
                PAIS_LIBROS: String(data.PAIS_LIBROS ?? prev.PAIS_LIBROS),
                DESCRIPCION_LIBROS: String(data.DESCRIPCION_LIBROS ?? prev.DESCRIPCION_LIBROS),
                TITULOTEJUELO_LIBROS: String(data.TITULOTEJUELO_LIBROS ?? prev.TITULOTEJUELO_LIBROS),
                AUTORTEJUELO_LIBROS: String(data.AUTORTEJUELO_LIBROS ?? prev.AUTORTEJUELO_LIBROS),
                ESTADO_LIBROS: String(data.ESTADO_LIBROS ?? prev.ESTADO_LIBROS),
              }))
            }
          })
          .catch((err) => {
            console.warn('VerLibros falló al precargar datos exactos del libro:', err)
          })
      }
    }
  }, [libro, isVisible])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    let sanitizedValue = value

    if (name === 'TITULOTEJUELO_LIBROS') {
      sanitizedValue = value.slice(0, 10)
    } else if (name === 'AUTORTEJUELO_LIBROS') {
      sanitizedValue = value.slice(0, 3).toUpperCase()
    } else if (name === 'PRECIO_LIBROS') {
      sanitizedValue = value.replace(/[^0-9.]/g, '')
      const parts = sanitizedValue.split('.')
      if (parts.length > 2) {
        sanitizedValue = `${parts[0]}.${parts.slice(1).join('')}`
      }
      if (parts.length === 2 && parts[1].length > 2) {
        sanitizedValue = `${parts[0]}.${parts[1].slice(0, 2)}`
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
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
    if (!formData.ISBN_LIBROS || !String(formData.ISBN_LIBROS).trim()) {
      newErrors.ISBN_LIBROS = 'El ISBN es obligatorio (o marque S/N)'
      camposFaltantes.push('ISBN')
    }
    if (!formData.VOLUMEN_LIBROS || !String(formData.VOLUMEN_LIBROS).trim()) {
      newErrors.VOLUMEN_LIBROS = 'El volumen es obligatorio'
      camposFaltantes.push('Volumen')
    }
    if (!formData.PAIS_LIBROS || !String(formData.PAIS_LIBROS).trim()) {
      newErrors.PAIS_LIBROS = 'Seleccione o ingrese un país'
      camposFaltantes.push('País')
    }
    if (!formData.CODIGODEBARRAS_LIBROS || !String(formData.CODIGODEBARRAS_LIBROS).trim()) {
      newErrors.CODIGODEBARRAS_LIBROS = 'El código de barras es obligatorio (o marque S/N)'
      camposFaltantes.push('Código de Barras')
    }
    if (!formData.PRECIO_LIBROS || !String(formData.PRECIO_LIBROS).trim()) {
      newErrors.PRECIO_LIBROS = 'El precio es obligatorio'
      camposFaltantes.push('Precio')
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(formData.PRECIO_LIBROS))) {
      newErrors.PRECIO_LIBROS = 'El precio debe contener solo números y hasta 2 decimales'
      camposFaltantes.push('Precio válido')
    }
    if (!formData.TITULOTEJUELO_LIBROS || !String(formData.TITULOTEJUELO_LIBROS).trim()) {
      newErrors.TITULOTEJUELO_LIBROS = 'El título tejuelo es obligatorio'
      camposFaltantes.push('Título tejuelo')
    } else if (String(formData.TITULOTEJUELO_LIBROS).length > 10) {
      newErrors.TITULOTEJUELO_LIBROS = 'El título tejuelo no debe superar 10 caracteres'
      camposFaltantes.push('Título tejuelo (máx 10)')
    }
    if (!formData.AUTORTEJUELO_LIBROS || !String(formData.AUTORTEJUELO_LIBROS).trim()) {
      newErrors.AUTORTEJUELO_LIBROS = 'El autor tejuelo es obligatorio'
      camposFaltantes.push('Autor tejuelo')
    } else if (String(formData.AUTORTEJUELO_LIBROS).length > 3) {
      newErrors.AUTORTEJUELO_LIBROS = 'El autor tejuelo no debe superar 3 caracteres'
      camposFaltantes.push('Autor tejuelo (máx 3)')
    }

    setErrors(newErrors)

    if (camposFaltantes.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos o inválidos',
        text: `Por favor, revisa los siguientes campos: ${camposFaltantes.join(', ')}.`,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!canActualizarLibro) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_actualizar_libro')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!libro) return
    const id = libro.ID_LIBROS
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
      payload.append('ISBN_LIBROS', String(formData.ISBN_LIBROS || 'S/N'))
      payload.append('TITULO_LIBROS', String(formData.TITULO_LIBROS || '').trim())
      payload.append('PRECIO_LIBROS', String(formData.PRECIO_LIBROS || '0'))
      payload.append('CODIGODEBARRAS_LIBROS', String(formData.CODIGODEBARRAS_LIBROS || 'S/N'))
      payload.append('VOLUMEN_LIBROS', String(formData.VOLUMEN_LIBROS || ''))
      const fechaNormalizada = parseDatePickerValue(formData.FECHAEDICION_LIBROS as any)
      payload.append('FECHAEDICION_LIBROS', String(fechaNormalizada || formData.FECHAEDICION_LIBROS || ''))
      payload.append('PAIS_LIBROS', String(formData.PAIS_LIBROS || ''))
      payload.append('DESCRIPCION_LIBROS', String(formData.DESCRIPCION_LIBROS || ''))
      payload.append('TITULOTEJUELO_LIBROS', String(formData.TITULOTEJUELO_LIBROS || ''))
      payload.append('AUTORTEJUELO_LIBROS', String(formData.AUTORTEJUELO_LIBROS || ''))
      payload.append('ESTADO_LIBROS', String(formData.ESTADO_LIBROS ?? '1'))
      payload.append('_method', 'PUT')

      await ActualizarLibro(id, payload)

      Swal.fire({
        icon: 'success',
        title: '¡Libro actualizado!',
        text: 'El libro fue actualizado exitosamente.',
        timer: 1800,
        showConfirmButton: false,
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
        title: 'Error al actualizar',
        text: errorMsg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
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
    canActualizarLibro,
    verificarAccionEnServidor,
  }
}

export default useLibroEdit
