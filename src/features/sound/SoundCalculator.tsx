import React from 'react'

interface SoundCalculatorProps {
  onBack: () => void
}

export const SoundCalculator: React.FC<SoundCalculatorProps> = ({ onBack }) => {
  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h3>Звуковой калькулятор</h3>
        <button className="btn-secondary" onClick={onBack}>Назад к трактам</button>
      </div>
      <p>Функционал в разработке</p>
    </div>
  )
}
