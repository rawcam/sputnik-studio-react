import React from 'react'
import { exportToJson, importFromJson, saveToLocalStorage, loadFromLocalStorage, resetProject } from '../../utils/storage'

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
  const handleSave = () => saveToLocalStorage()
  const handleLoad = () => loadFromLocalStorage()
  const handleReset = () => resetProject()
  const handlePrint = () => alert('Функция печати будет реализована позже')
  const handleWiki = () => window.open('/wiki.html', '_blank')

  return (
    <div className="section-content-inner">
      <div className="setting" style={{ marginBottom: 12 }}>
        <label style={{ flex: 1 }}>Имя проекта:</label>
        <input type="text" id="projectNameInput" style={{ flex: 2 }} placeholder="Введите название проекта" />
      </div>
      <div className="manage-buttons">
        <button className="mode-btn" onClick={handleSave}>
          <i className="fas fa-database"></i> Сохранить в браузере
        </button>
        <button className="mode-btn" onClick={handleLoad}>
          <i className="fas fa-upload"></i> Загрузить из браузера
        </button>
        <button className="mode-btn" onClick={handleExport}>
          <i className="fas fa-file-export"></i> Экспорт JSON
        </button>
        <button className="mode-btn" onClick={handleImport}>
          <i className="fas fa-file-import"></i> Импорт JSON
        </button>
        <button className="mode-btn" onClick={handlePrint}>
          <i className="fas fa-print"></i> Печать отчёта
        </button>
        <button className="mode-btn" onClick={handleWiki}>
          <i className="fas fa-book"></i> Wiki
        </button>
        <button className="mode-btn danger" onClick={handleReset}>
          <i className="fas fa-trash-alt"></i> Сброс проекта
        </button>
      </div>
    </div>
  )
}
