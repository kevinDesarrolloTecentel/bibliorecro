import ImpresionTej from '@/components/reportesModals/Tejuelo/ImpresionTej'

const Rep_teju = () => {
  return (
    <div className="pb-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Reportes de Tejuelos</h3>
        <p className="text-body-secondary mb-0">
          Generación e impresión de etiquetas de tejuelo para la catalogación física de libros.
        </p>
      </div>
      <ImpresionTej />
    </div>
  )
}

export default Rep_teju