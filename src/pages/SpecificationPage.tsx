import React from 'react'
import { useDispatch } from 'react-redux'
import { SpecificationTable } from '../components/specification/SpecificationTable'
import { resetSpecification } from '../store/specificationSlice'
import * as XLSX from 'xlsx'
import './SpecificationPage.css'

export const SpecificationPage: React.FC = () => {
  const dispatch = useDispatch()

  const exportToExcel = () => {
    // Собираем данные из Redux store (пришлось бы импортировать store, но проще получить через useSelector – но здесь неудобно. Временно сделаем через глобальный объект, но для чистоты можно вынести в отдельный thunk.
    // Чтобы не усложнять, экспорт будет работать после того, как мы подключим store. Пока сделаем заглушку.
    alert('Экспорт в Excel будет реализован в следующей версии. Сейчас вы можете сохранить данные через localStorage.')
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
