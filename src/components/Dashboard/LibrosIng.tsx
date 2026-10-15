import React from 'react'
import { CRow, CCol } from '@coreui/react-pro'
import { useLibrosIng, LibroIngresoItem } from '@/hooks/dashboard/useLibrosIng'
import LibrosIngFiltros from './LibrosIngFiltros'
import LibrosIngTabla from './LibrosIngTabla'

export interface LibrosIngProps {
  fechaDesde?: string
  fechaHasta?: string
  libros?: LibroIngresoItem[]
  loading?: boolean
  exportando?: boolean
  haBuscado?: boolean
  onDateChange?: (val: Date | string | null, field: 'desde' | 'hasta') => void
  onBuscarReporte?: () => void
  onExportarExcel?: () => void
}

const LibIng: React.FC<LibrosIngProps> = (props) => {
  const hookData = useLibrosIng()

  const fechaDesde = props.fechaDesde ?? hookData.fechaDesde
  const fechaHasta = props.fechaHasta ?? hookData.fechaHasta
  const libros = props.libros ?? hookData.libros
  const loading = props.loading ?? hookData.loading
  const exportando = props.exportando ?? hookData.exportando
  const haBuscado = props.haBuscado ?? hookData.haBuscado
  const onDateChange = props.onDateChange ?? hookData.handleDateChange
  const onBuscar = props.onBuscarReporte ?? hookData.handleBuscarReporte
  const onExportar = props.onExportarExcel ?? hookData.handleExportarExcel

  return (
    <CRow className="g-4">
      <CCol xs={12}>
        <LibrosIngFiltros
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          loading={loading}
          exportando={exportando}
          hasData={libros.length > 0}
          onDateChange={onDateChange}
          onBuscar={onBuscar}
          onExportar={onExportar}
        />
      </CCol>

      <CCol xs={12}>
        <LibrosIngTabla
          libros={libros}
          loading={loading}
          haBuscado={haBuscado}
        />
      </CCol>
    </CRow>
  )
}

export { LibrosIngFiltros, LibrosIngTabla }
export default LibIng