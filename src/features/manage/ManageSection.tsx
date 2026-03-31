import React from 'react'
import { exportToJson, importFromJson } from '../../utils/storage'

export const ManageSection: React.FC = () => {
  const handleExport = () => exportToJson()
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) await importFromJson(file)
    }
    input.click()
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="manage">
        <i className="fas fa-cog"></i>
        <span>УПРАВЛЕНИЕ</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <div className="manage-buttons">
          <div className="setting" style={{ marginBottom: 12 }}>
            <label style={{ flex: 1 }}>Имя проекта:</label>
            <input type="text" id="projectNameInput" style={{ flex: 2 }} placeholder="Введите название проекта" />
          </div>
          <button className="btn-secondary" onClick={handleExport}><i className="fas fa-file-export"></i><span> Экспорт JSON</span></button>
          <button className="btn-secondary" onClick={handleImport}><i className="fas fa-file-import"></i><span> Импорт JSON</span></button>
          <button className="btn-secondary" id="printReportBtnSidebar"><i className="fas fa-print"></i><span> Печать отчёта</span></button>
          <button className="btn-secondary" id="wikiBtnSidebar"><i className="fas fa-book"></i><span> Wiki</span></button>
          <button className="btn-danger" id="resetProjectBtn"><i className="fas fa-trash-alt"></i><span> Сброс проекта</span></button>
        </div>
      </div>
    </div>
  )
}
