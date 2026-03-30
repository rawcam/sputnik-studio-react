import React from 'react'

export const ManageSection: React.FC = () => {
  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="manage">
        <i className="fas fa-cog"></i>
        <span>УПРАВЛЕНИЕ</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content" id="manageContent">
        <div className="manage-buttons">
          <button className="btn-secondary" id="saveToBrowserBtn"><i className="fas fa-database"></i><span> Сохранить в браузере</span></button>
          <button className="btn-secondary" id="exportJsonBtn"><i className="fas fa-file-export"></i><span> Экспорт JSON</span></button>
          <button className="btn-secondary" id="importJsonBtn"><i className="fas fa-file-import"></i><span> Импорт JSON</span></button>
          <button className="btn-secondary" id="printReportBtnSidebar"><i className="fas fa-print"></i><span> Печать отчёта</span></button>
          <button className="btn-secondary" id="wikiBtnSidebar"><i className="fas fa-book"></i><span> Wiki</span></button>
          <button className="btn-danger" id="resetProjectBtn"><i className="fas fa-trash-alt"></i><span> Сброс проекта</span></button>
        </div>
      </div>
    </div>
  )
}
