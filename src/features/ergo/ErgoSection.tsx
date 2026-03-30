import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setErgoConfig } from '../../store/ergoSlice'

export const ErgoSection: React.FC = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.ergo)

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="ergo">
        <i className="fas fa-chalkboard-user"></i>
        <span>Эргономика ЭКП</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <button className="btn-primary" id="showErgoCalcBtn">Показать калькулятор</button>
      </div>
    </div>
  )
}
