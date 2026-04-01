import React from 'react'

interface PowerCalculatorProps {
  onBack: () => void
}

export const PowerCalculator: React.FC<PowerCalculatorProps> = ({ onBack }) => {
  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h3>Калькулятор питания</h3>
        <button className="btn-secondary" onClick={onBack}>Назад к трактам</button>
      </div>
      <p>Функционал в разработке</p>
    </div>
  )
}
