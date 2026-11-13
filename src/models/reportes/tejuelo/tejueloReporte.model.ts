export interface LibroTejueloItem {
  ID_LIBROS?: number | string
  CODIGO_CATEGORIA?: string
  AUTORTEJUELO_LIBROS?: string
  TITULOTEJUELO_LIBROS?: string
  [key: string]: any
}

export interface UseReportTejReturn {
  startDate: string
  setStartDate: (val: string) => void
  endDate: string
  setEndDate: (val: string) => void
  pdfPath: string | null
  setPdfPath: (val: string | null) => void
  libros: LibroTejueloItem[]
  setLibros: (val: LibroTejueloItem[]) => void
  isLoading: boolean
  activeTab: 'etiquetas' | 'tabla' | 'pdf'
  setActiveTab: (tab: 'etiquetas' | 'tabla' | 'pdf') => void
  handleGeneratePdf: () => Promise<void>
  handleReset: () => void
  handleDescargarPdf?: () => void | Promise<void>
  handleImprimir?: () => void
  canGenerarReporteTejuelos?: boolean
  canDescargarPdfTejuelos?: boolean
  verificarAccionEnServidor?: (codigoAccion: string) => Promise<boolean>
  filtroTexto?: string
  setFiltroTexto?: (val: string) => void
  totalGenerados?: number
  totalFiltrados?: number
  totalTejuelos?: number
  totalPaginas?: number
  haBuscado?: boolean
}
