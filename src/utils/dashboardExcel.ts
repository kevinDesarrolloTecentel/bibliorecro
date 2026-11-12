import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface ExcelReportOptions {
    nombreArchivo: string
    tituloPrincipal: string
    subtituloFiltro: string
    totalRegistros: number | string
    headers: string[]
    rows: (string | number)[][]
}

export const generarExcelEstilizado = async ({
    nombreArchivo,
    tituloPrincipal,
    subtituloFiltro,
    totalRegistros,
    headers,
    rows,
}: ExcelReportOptions) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Reporte', {
        views: [{ showGridLines: true }]
    })
    const totalCols = headers.length
    const lastColLetter = worksheet.getColumn(totalCols).letter

    // Titulo principal

    worksheet.mergeCells(`A1:${lastColLetter}3`)
    const titleCell = worksheet.getCell('A1')
    titleCell.value = tituloPrincipal.toUpperCase()
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1B365D' }
    }

    //Subitulo de filtros

    worksheet.mergeCells(`A4:${lastColLetter}4`)
    const subCell = worksheet.getCell('A4')
    subCell.value = subtituloFiltro
    subCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF333333' } }
    subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    subCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEBF3FB' }
    }

    //Total y fecha de generacion

    worksheet.mergeCells(`A5:${lastColLetter}5`)
    const now = new Date()
    const fechaGen = now.toLocaleDateString('es-EC') + ' ' + now.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    const metaCell = worksheet.getCell('A5')
    metaCell.value = `Total de registros: ${totalRegistros} | Generado: ${fechaGen}`
    metaCell.font = { name: 'Calibri', size: 9, color: { argb: 'FF555555' } }
    metaCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    metaCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEBF3FB' }
    }

    //Espacio en blanco
    worksheet.getRow(6).height = 8

    // Encabezados de tabla

    const headerRow = worksheet.getRow(7)
    headerRow.height = 26
    headers.forEach((h, idx) => {
        const cell = headerRow.getCell(idx + 1)
        cell.value = h
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E5E9C' }
        }
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFB0C4DE' } },
            bottom: { style: 'medium', color: { argb: 'FF0F2C59' } },
            left: { style: 'thin', color: { argb: 'FFB0C4DE' } },
            right: { style: 'thin', color: { argb: 'FFB0C4DE' } },
        }
    })

    //Autofiltro

    worksheet.autoFilter = `A7:${lastColLetter}7`

    //Fila de datos

    rows.forEach((rowValues) => {
        const row = worksheet.addRow(rowValues)
        row.height = 20
        row.eachCell((cell, colNumber) => {
            cell.font = { name: 'Calibri', size: 10 }
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            }
            // Centrar número, cédula y fechas; alinear texto a la izquierda
            if (colNumber === 1 || colNumber === 2 || colNumber === 6) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
            } else {
                cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
            }
        })
    })

    //Autoajute de ancho de columnas

    worksheet.columns.forEach((column) => {
        let maxLength = 12
        column.eachCell?.({ includeEmpty: false }, (cell, rowNumber) => {
            if (rowNumber >= 7) {
                const val = cell.value ? String(cell.value) : ''
                if (val.length > maxLength) {
                    maxLength = val.length
                }
            }
        })
        column.width = Math.min(maxLength + 4, 45)
    })


    //Descargar el archivo .xlsx

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`)
}

