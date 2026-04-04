import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { SpecificationTable } from '../components/specification/SpecificationTable'
import { resetSpecification } from '../store/specificationSlice'
import * as XLSX from 'xlsx'
import './SpecificationPage.css'

export const SpecificationPage: React.FC = () => {
  const dispatch = useDispatch()
  const sections = useSelector((state: RootState) => state.specification.sections)

  const exportToExcel = () => {
    const wsData: any[][] = []
    wsData.push(['№','Вендор','Модель','Наименование','Кол.','Ед.','USD','EUR','+%','RUB/ед','Сумма RUB','Скидка %','Сумма со скидкой','Поставщик','Срок поставки'])
    let rowNum = 1
    sections.forEach(section => {
      wsData.push([section.name, '', '', '', '', '', '', '', '', '', '', '', '', '', ''])
      section.rows.forEach(row => {
        wsData.push([
          rowNum++, row.vendor, row.model, row.name, row.qty, row.unit,
          row.usd, row.eur, row.markup, row.rubUnit, row.sum, row.discount, row.sumDisc,
          row.supplier, row.delivery
        ])
      })
    })
    wsData.push(['','','','','','','','','','','','','Итого:', sections.reduce((sum,s)=>sum + s.rows.reduce((s2,r)=>s2+r.sumDisc,0),0), ''])
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Спецификация')
    XLSX.writeFile(wb, `specification_${new Date().toISOString().slice(0,19)}.xlsx`)
  }

  return (
    <div className="specification-page">
      <div className="spec-header">
        <h1><i className="fas fa-file-alt"></i> Спецификация оборудования</h1>
        <div className="actions">
          <button className="btn" onClick={exportToExcel}><i className="fas fa-file-excel"></i> Экспорт в Excel</button>
          <button className="btn btn-primary" onClick={() => dispatch(resetSpecification())}><i className="fas fa-undo-alt"></i> Сбросить</button>
        </div>
      </div>
      <SpecificationTable />
    </div>
  )
}
