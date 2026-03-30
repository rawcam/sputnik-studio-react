import React from 'react'

export const PowerSection: React.FC = () => {
  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="power">
        <i className="fas fa-bolt"></i>
        <span>ЭНЕРГИЯ</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content" id="powerContent">
        <p>Калькулятор питания будет реализован позже</p>
      </div>
    </div>
  )
}
