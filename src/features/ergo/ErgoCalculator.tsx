import React from 'react'

interface ErgoCalculatorProps {
  onBack: () => void
}

export const ErgoCalculator: React.FC<ErgoCalculatorProps> = ({ onBack }) => {
  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h3>Калькулятор эргономики</h3>
        <button className="btn-secondary" onClick={onBack}>Назад к трактам</button>
      </div>
      <p>Функционал в разработке</p>
    </div>
  )
}
