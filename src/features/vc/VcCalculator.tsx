import React from 'react'

interface VcCalculatorProps {
  onBack: () => void
}

export const VcCalculator: React.FC<VcCalculatorProps> = ({ onBack }) => {
  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h3>ВКС-калькулятор</h3>
        <button className="btn-secondary" onClick={onBack}>Назад к трактам</button>
      </div>
      <p>Функционал в разработке</p>
    </div>
  )
}
