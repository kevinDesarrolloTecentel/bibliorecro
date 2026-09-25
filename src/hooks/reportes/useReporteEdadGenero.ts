import { useState, useMemo, useCallback } from 'react'
import Swal from 'sweetalert2'


export interface UsuarioReporteItem {
  [key: string]: any
  id: string | number
  cedula: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  edad: number | null
  genero: string
  correo: string
  raw?: any
}

export const formatFecha = (f: any): string => {
  if (!f || f === 'No registrada') return 'No registrada'
  if (typeof f === 'string') {
    if (
      f.startsWith('0000-00-00') ||
      f.startsWith('1969-12-31') ||
      f.startsWith('1970-01-01')
    ) {
      return 'No registrada'
    }
    const clean = f.includes('T') ? f.split('T')[0] : f.includes(' ') ? f.split(' ')[0] : f
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, d] = clean.split('-')
      if (Number(y) <= 1920) return 'No registrada'
      return `${d}/${m}/${y}`
    }
    return clean
  }
  if (f instanceof Date && !isNaN(f.getTime())) {
    if (f.getFullYear() <= 1920) return 'No registrada'
    const d = String(f.getDate()).padStart(2, '0')
    const m = String(f.getMonth() + 1).padStart(2, '0')
    const y = f.getFullYear()
    return `${d}/${m}/${y}`
  }
  return String(f)
}

export const calcularEdad = (fechaNacimiento: any, edadDirecta?: any): number | null => {
  if (fechaNacimiento && fechaNacimiento !== 'No registrada') {
    const s = String(fechaNacimiento).trim()
    let birthDate: Date | null = null

    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const [y, m, d] = s.split('T')[0].split('-').map(Number)
      birthDate = new Date(y, m - 1, d)
    } else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(s)) {
      const parts = s.split(/[\/\-]/).map(Number)
      birthDate = new Date(parts[2], parts[1] - 1, parts[0])
    } else {
      const parsed = new Date(s)
      if (!isNaN(parsed.getTime())) birthDate = parsed
    }

    if (birthDate && !isNaN(birthDate.getTime()) && birthDate.getFullYear() > 1920) {
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      if (age >= 0 && age <= 130) return age
    }
  }

  if (edadDirecta !== undefined && edadDirecta !== null && edadDirecta !== '') {
    const num = Number(edadDirecta)
    if (!isNaN(num) && num > 0 && num <= 130) return num
  }

  return null
}

export const normalizarGenero = (item: any): string => {
  let val: any =
    item.genero?.NOMBRE_GENERO ??
    item.ID_GENERO?.NOMBRE_GENERO ??
    item.rco_genero?.NOMBRE_GENERO ??
    item.NOMBRE_GENERO ??
    item.GENERO ??
    item.genero_persona ??
    item.GENERO_PERSONA ??
    item.id_genero ??
    (typeof item.ID_GENERO === 'object' ? item.ID_GENERO?.ID_GENERO : item.ID_GENERO) ??
    (typeof item.genero === 'string' ? item.genero : '') ??
    ''

  if (typeof val === 'object' && val !== null) {
    val = val.NOMBRE_GENERO ?? val.nombre ?? val.ID_GENERO ?? val.id ?? ''
  }

  const s = String(val).trim().toUpperCase()
  if (s === '1' || s.includes('MASC') || s === 'M') return 'MASCULINO'
  if (s === '2' || s.includes('FEM') || s === 'F') return 'FEMENINO'
  if (s === '3' || s.includes('OTRO')) return 'OTROS'
  if (s && s !== '[OBJECT OBJECT]' && s !== 'UNDEFINED' && s !== 'NULL') return s
  return 'NO ESPECIFICADO'
}

const extraerLista = (res: any): any[] => {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.personas?.data)) return res.personas.data
  if (Array.isArray(res?.personas)) return res.personas
  if (Array.isArray(res?.usuarios?.data)) return res.usuarios.data
  if (Array.isArray(res?.usuarios)) return res.usuarios
  if (Array.isArray(res?.result)) return res.result
  if (Array.isArray(res?.personasReport)) return res.personasReport
  if (typeof res === 'object') {
    for (const key of Object.keys(res)) {
      if (Array.isArray(res[key])) return res[key]
    }
  }
  return []
}

export const useReporteEdadGenero = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [edadDesde, setEdadDesde] = useState<string>('')
  const [edadHasta, setEdadHasta] = useState<string>('')
  const [genero, setGenero] = useState<string>('TODOS')
  const [busquedaTexto, setBusquedaTexto] = useState<string>('')
  const [usuarios, setUsuarios] = useState<UsuarioReporteItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const generarReporte = useCallback(
    async (overrideParams?: { desde?: string; hasta?: string; gen?: string }) => {
      setLoading(true)

      const dDesde = overrideParams?.desde !== undefined ? overrideParams.desde : edadDesde
      const dHasta = overrideParams?.hasta !== undefined ? overrideParams.hasta : edadHasta
      const dGen = overrideParams?.gen !== undefined ? overrideParams.gen : genero

      const params: Record<string, any> = {}
      if (dDesde !== '') {
        params.edad_desde = dDesde
        params.edadDesde = dDesde
        params.EDAD_DESDE = dDesde
        params.desde = dDesde
        params.edad_min = dDesde
      }
      if (dHasta !== '') {
        params.edad_hasta = dHasta
        params.edadHasta = dHasta
        params.EDAD_HASTA = dHasta
        params.hasta = dHasta
        params.edad_max = dHasta
      }
      if (dGen && dGen !== 'TODOS' && dGen !== '') {
        params.genero = dGen
        params.GENERO = dGen
        params.genero_persona = dGen
        params.id_genero = dGen === 'MASCULINO' ? 1 : dGen === 'FEMENINO' ? 2 : 3
        params.ID_GENERO = dGen === 'MASCULINO' ? 1 : dGen === 'FEMENINO' ? 2 : 3
      }

      try {
        let rawList: any[] = []
        try {
          const queryParams: Record<string, any> = {}
          const numDesde = dDesde !== '' ? Number(dDesde) : 0
          const numHasta = dHasta !== '' ? Number(dHasta) : 120

          queryParams.edad_desde = numDesde
          queryParams.edad_hasta = numHasta
          queryParams.desde = numDesde
          queryParams.hasta = numHasta

          if (dGen && dGen !== 'TODOS' && dGen !== '') {
            queryParams.genero = dGen
            queryParams.id_genero = dGen === 'MASCULINO' ? 1 : dGen === 'FEMENINO' ? 2 : 3
          }

          const res = await personasReporte(queryParams)
          rawList = extraerLista(res)
        } catch (errReport: any) {
          console.warn('Endpoint personasReport no disponible o con validación estricta, cargando personas del sistema:', errReport?.response?.data || errReport?.message)
        }

        if (!rawList || rawList.length === 0) {
          try {
            const firstPage = await listarPersonas(1, 100)
            const firstItems = extraerLista(firstPage)
            let lastPage = 1

            if (firstPage?.last_page) lastPage = Number(firstPage.last_page)
            else if (firstPage?.data?.last_page) lastPage = Number(firstPage.data.last_page)
            else if (firstPage?.meta?.last_page) lastPage = Number(firstPage.meta.last_page)

            if (lastPage > 1) {
              const pagesToFetch: number[] = []
              for (let p = 2; p <= Math.min(lastPage, 10); p++) {
                pagesToFetch.push(p)
              }
              const remainingResponses = await Promise.allSettled(
                pagesToFetch.map((p) => listarPersonas(p, 100))
              )
              const combined = [...firstItems]
              remainingResponses.forEach((r) => {
                if (r.status === 'fulfilled') {
                  combined.push(...extraerLista(r.value))
                }
              })
              rawList = combined
            } else {
              rawList = firstItems
            }
          } catch (errList: any) {
            console.error('Error al listar personas del sistema:', errList)
          }
        }

        const parsed: UsuarioReporteItem[] = (rawList || []).map((item: any, idx: number) => {
          const id = item.ID_PERSONA ?? item.id ?? item.ID ?? idx + 1
          const cedula = String(
            item.IDENTIFICACION_PERSONA ??
              item.identificacion ??
              item.identificación ??
              item.cedula ??
              item.CEDULA ??
              ''
          ).trim()
          const nombre = String(
            item.NOMBRE_PERSONA ?? item.nombre ?? item.nombres ?? item.NOMBRE ?? ''
          ).trim()
          const apellido = String(
            item.APELLIDO_PERSONA ?? item.apellido ?? item.apellidos ?? item.APELLIDO ?? ''
          ).trim()
          const fechaNacRaw =
            item.FECHA_PERSONA ??
            item.fecha_nacimiento ??
            item.FECHA_NACIMIENTO_PERSONA ??
            item.fechaNacimiento ??
            item.FECHA_NACIMIENTO ??
            item.FECHA_NAC ??
            ''
          const edadDirecta = item.EDAD_PERSONA ?? item.edad ?? item.EDAD
          const edad = calcularEdad(fechaNacRaw, edadDirecta)
          const gen = normalizarGenero(item)
          const correo = String(
            item.CORREO_PERSONA ?? item.correo ?? item.email ?? item.EMAIL ?? item.CORREO ?? ''
          ).trim()

          return {
            id,
            cedula: cedula || 'Sin cédula',
            nombre: nombre || 'Sin nombre',
            apellido: apellido || 'Sin apellido',
            fechaNacimiento: formatFecha(fechaNacRaw),
            edad,
            genero: gen,
            correo: correo || 'Sin correo',
            raw: item,
          }
        })

        const min = dDesde !== '' && !isNaN(Number(dDesde)) ? Number(dDesde) : null
        const max = dHasta !== '' && !isNaN(Number(dHasta)) ? Number(dHasta) : null
        const genFiltro = dGen && dGen !== 'TODOS' && dGen !== '' ? dGen.toUpperCase() : null

        const localFiltered = parsed.filter((u) => {
          if (min !== null) {
            if (u.edad === null || u.edad < min) return false
          }
          if (max !== null) {
            if (u.edad === null || u.edad > max) return false
          }
          if (genFiltro) {
            if (u.genero.toUpperCase() !== genFiltro) return false
          }
          return true
        })

        setUsuarios(localFiltered)

        if (localFiltered.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No se encontraron usuarios para los filtros seleccionados.',
            timer: 2000,
            showConfirmButton: false,
          })
        }
      } catch (err: any) {
        console.error('Error generando reporte:', err)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el reporte con los filtros seleccionados.',
        })
      } finally {
        setLoading(false)
      }
    },
    [edadDesde, edadHasta, genero]
  )

  const usuariosFiltrados = useMemo(() => {
    if (!busquedaTexto.trim()) return usuarios
    const q = busquedaTexto.toLowerCase().trim()
    return usuarios.filter(
      (u) =>
        u.cedula.toLowerCase().includes(q) ||
        u.nombre.toLowerCase().includes(q) ||
        u.apellido.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.genero.toLowerCase().includes(q)
    )
  }, [usuarios, busquedaTexto])

  const limpiarFiltros = useCallback(() => {
    setEdadDesde('')
    setEdadHasta('')
    setGenero('TODOS')
    setBusquedaTexto('')
  }, [])

  const descargarReporte = useCallback(() => {
    if (usuariosFiltrados.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin datos',
        text: 'No hay usuarios para descargar en el reporte.',
        confirmButtonColor: '#0d6efd',
      })
      return
    }

    const headers = ['#', 'CÉDULA', 'NOMBRE', 'APELLIDO', 'GÉNERO', 'FECHA DE NACIMIENTO', 'EDAD', 'CORREO']
    const rows = usuariosFiltrados.map((u, i) => [
      i + 1,
      `"${u.cedula}"`,
      `"${u.nombre}"`,
      `"${u.apellido}"`,
      `"${u.genero}"`,
      `"${u.fechaNacimiento}"`,
      u.edad !== null ? u.edad : 'No registrada',
      `"${u.correo}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fecha = new Date().toISOString().slice(0, 10)
    a.download = `Reporte_Usuarios_Edad_${edadDesde || 'Min'}-${edadHasta || 'Max'}_${genero || 'TODOS'}_${fecha}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    Swal.fire({
      icon: 'success',
      title: 'Reporte Descargado',
      text: `Se descargaron ${usuariosFiltrados.length} registros con éxito.`,
      timer: 2000,
      showConfirmButton: false,
    })
  }, [usuariosFiltrados, edadDesde, edadHasta, genero])

  const abrirModal = useCallback(() => {
    setModalVisible(true)
  }, [])

  const cerrarModal = useCallback(() => {
    setModalVisible(false)
  }, [])

  return {
    modalVisible,
    setModalVisible,
    abrirModal,
    cerrarModal,
    edadDesde,
    setEdadDesde,
    edadHasta,
    setEdadHasta,
    genero,
    setGenero,
    busquedaTexto,
    setBusquedaTexto,
    usuarios: usuariosFiltrados,
    totalRecibidos: usuariosFiltrados.length,
    loading,
    generarReporte,
    descargarReporte,
    limpiarFiltros,
  }
}

export default useReporteEdadGenero
