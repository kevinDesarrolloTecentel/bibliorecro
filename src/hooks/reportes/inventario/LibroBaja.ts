import { STORAGE_BASE_URL } from "@/.env"
import { librosBaja } from "@/Service/rco/libros"
import { useCallback, useState } from "react"
import Swal from "sweetalert2"

export interface  LibroInventarioItem {
    ID_LIBROS?: number | string
    CODIGO_LIBRO?: string
    TITULO_LIBRO?: string
    EDICION_LIBRO?: string
    DESCRIPCION_LIBRO?: string
    ESTADO_LIBRO?: number | string
    [key: string]: any
}

export const useReporteLibrosBaja = () => {
  const [anoBaja, setAnoBaja] = useState<string>('')
  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

const handleGetLibrosBaja = useCallback(async () =>{
    if(!anoBaja.trim()){
        Swal.mixin({
            toast: true,
            position:'top-end',
            timer:2500,
            timerProgressBar:false,
            showConfirmButton:false,
        }).fire({
            icon:'warning',
            title:'Por favor, ingrese o seleccione un ano'
        })
        return
    }
    setIsLoading(true)
    try {
        const params = {
            fechaMes: anoBaja.trim(),
            anoBaja: anoBaja.trim(),
            anio: anoBaja.trim(),
        }
        const data = await librosBaja(params)
        const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

        const librosFiltrados: LibroInventarioItem[] = rawList
        .filter((item:LibroInventarioItem) => item.ESTADO_LIBRO !== 1)
        .sort((a: LibroInventarioItem, b: LibroInventarioItem) =>
        Number(b.ESTADO_LIBRO || 0) - Number(a.ESTADO_LIBRO || 0)
    )

    setLibros(librosFiltrados)
    setExcelLink(data?.excel_path || null)
    }catch(error:any){
        Swal.mixin({
            toast: true,
            position:'top-end',
            timer:2500,
            timerProgressBar:false,
            showConfirmButton:false
        }).fire({
            icon:'warning',
            title:'Error hubo un problema al obtener los datos de los libros dados de baja'
        })
    }finally{
        setIsLoading(false)
    }
},[anoBaja])

const handleDescargarExcel = useCallback(()=>{
    if(excelLink){
        window.open(`${STORAGE_BASE_URL}/${excelLink}`,'_blank')
    }
},[excelLink])

const handleReset = useCallback(() =>{
    setAnoBaja('')
    setLibros([])
    setExcelLink(null)
},[])

  return {
    anoBaja,
    setAnoBaja,
    handleGetLibrosBaja,
    handleDescargarExcel,
    handleReset,
    libros,
    isLoading,
    excelLink,
  }
}

export const useReporteInventario = () => {
  const baja = useReporteLibrosBaja()

  return {
    baja,
  }
}