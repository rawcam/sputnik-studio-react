import React from 'react'
import { useFinance } from '../../hooks/useFinance'

export const CompanyFinanceWidget: React.FC = () => {
  const { totalIncome, totalMargin, totalProfitability, nextCompanyGap } = useFinance()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value)
  }

  return (
    <div className="widget-card finance-widget">
      <div className="widget-header">
        <i className="fas fa-chart-line"></i>
        <h3>Финансы компании</h3>
      </div>
      <div className="widget-content">
        <div className="widget-stat">
          <span className="widget-label">Выручка (факт)</span>
          <span className="widget-value">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="widget-stat">
          <span className="widget-label">Маржа (факт)</span>
          <span className="widget-value">{formatCurrency(totalMargin)}</span>
        </div>
        <div className="widget-stat">
          <span className="widget-label">Рентабельность</span>
          <span className="widget-value">{(totalProfitability * 100).toFixed(1)}%</span>
        </div>
        {nextCompanyGap && (
          <div className="widget-stat warning">
            <span className="widget-label">Кассовый разрыв</span>
            <span className="widget-value">{formatCurrency(nextCompanyGap.deficit)}</span>
            <span className="widget-date">до {nextCompanyGap.date}</span>
          </div>
        )}
      </div>
    </div>
  )
}
