import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import {
  updateRow,
  addRow,
  deleteRow,
  addSection,
  toggleSectionCollapse,
  updateSectionName,
  SpecRow
} from '../../store/specificationSlice'

export const SpecificationTable: React.FC = () => {
  const dispatch = useDispatch()
  const sections = useSelector((state: RootState) => state.specification.sections)

  const handleCellChange = (sectionIdx: number, rowId: number, field: keyof SpecRow, value: string | number) => {
    dispatch(updateRow({ sectionIdx, rowId, updates: { [field]: value } }))
  }

  const getTotal = () => {
    let total = 0
    sections.forEach(s => s.rows.forEach(r => total += r.sumDisc))
    return total
  }

  let globalRowNumber = 1

  return (
    <div className="spec-card">
      <table className="spec-table">
        <thead>
          <tr>
            <th>№</th><th>Вендор</th><th>Модель</th><th>Наименование</th><th>Кол.</th><th>Ед.</th>
            <th>USD</th><th>EUR</th><th>+%</th><th>RUB/ед</th><th>Сумма RUB</th>
            <th>Скидка %</th><th>Сумма со скидкой</th><th>Поставщик</th><th>Срок</th><th></th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section, secIdx) => {
            const sectionRows = []
            // Строка раздела
            sectionRows.push(
              <tr key={`section-${secIdx}`} className="section-row">
                <td colSpan={16} onClick={() => dispatch(toggleSectionCollapse({ sectionIdx: secIdx }))}>
                  <i className={`fas fa-chevron-${section.collapsed ? 'right' : 'down'} section-icon`}></i>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => dispatch(updateSectionName({ sectionIdx: secIdx, name: e.currentTarget.textContent || 'Раздел' }))}
                    style={{ cursor: 'text', outline: 'none' }}
                  >
                    {section.name}
                  </span>
                </td>
              </tr>
            )
            if (!section.collapsed) {
              // Строки товаров
              section.rows.forEach(row => {
                const rowNumber = globalRowNumber++
                sectionRows.push(
                  <tr key={`row-${row.id}`} className="item-row">
                    <td>{rowNumber}</td>
                    <td><EditableCell value={row.vendor} onChange={(val) => handleCellChange(secIdx, row.id, 'vendor', val)} /></td>
                    <td><EditableCell value={row.model} onChange={(val) => handleCellChange(secIdx, row.id, 'model', val)} /></td>
                    <td><EditableCell value={row.name} onChange={(val) => handleCellChange(secIdx, row.id, 'name', val)} /></td>
                    <td><EditableCell type="number" value={row.qty} onChange={(val) => handleCellChange(secIdx, row.id, 'qty', parseFloat(val) || 0)} /></td>
                    <td><EditableCell value={row.unit} onChange={(val) => handleCellChange(secIdx, row.id, 'unit', val)} /></td>
                    <td><EditableCell type="number" value={row.usd} onChange={(val) => handleCellChange(secIdx, row.id, 'usd', parseFloat(val) || 0)} /></td>
                    <td><EditableCell type="number" value={row.eur} onChange={(val) => handleCellChange(secIdx, row.id, 'eur', parseFloat(val) || 0)} /></td>
                    <td><EditableCell type="number" value={row.markup} onChange={(val) => handleCellChange(secIdx, row.id, 'markup', parseFloat(val) || 0)} /></td>
                    <td className="sum-cell">{row.rubUnit.toLocaleString()}</td>
                    <td className="sum-cell">{row.sum.toLocaleString()}</td>
                    <td><EditableCell type="number" value={row.discount} onChange={(val) => handleCellChange(secIdx, row.id, 'discount', parseFloat(val) || 0)} /></td>
                    <td className="sum-cell">{row.sumDisc.toLocaleString()}</td>
                    <td><EditableCell value={row.supplier} onChange={(val) => handleCellChange(secIdx, row.id, 'supplier', val)} /></td>
                    <td><EditableCell value={row.delivery} onChange={(val) => handleCellChange(secIdx, row.id, 'delivery', val)} /></td>
                    <td><button className="delete-btn" onClick={() => dispatch(deleteRow({ sectionIdx: secIdx, rowId: row.id }))}><i className="fas fa-trash-alt"></i></button></td>
                  </tr>
                )
              })
              // Кнопка добавления строки
              sectionRows.push(
                <tr key={`add-${secIdx}`}>
                  <td colSpan={16}>
                    <button className="add-row-btn" onClick={() => dispatch(addRow({ sectionIdx: secIdx }))}>
                      <i className="fas fa-plus"></i> Добавить позицию в «{section.name}»
                    </button>
                  </td>
                </tr>
              )
            }
            return sectionRows
          })}
        </tbody>
      </table>
      <div className="footer-total">Итого: {Math.round(getTotal()).toLocaleString()} ₽</div>
    </div>
  )
}

// Компонент редактируемой ячейки
const EditableCell: React.FC<{ value: string | number; onChange: (val: string) => void; type?: 'text' | 'number' }> = ({ value, onChange, type = 'text' }) => {
  return (
    <input
      type={type === 'number' ? 'number' : 'text'}
      className="editable"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
