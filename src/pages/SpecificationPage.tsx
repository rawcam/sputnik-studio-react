import React, { useState, useEffect, useRef } from 'react';
import Sortable from 'sortablejs';
import * as XLSX from 'xlsx';

interface DataRow {
  id: number;
  type: 'data';
  vendor: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  currency: string;
  price: number;
  discount: number;
  discountAmount: number;
  priceAfter: number;
  supplier: string;
  status: string;
}

interface SectionRow {
  id: number;
  type: 'section';
  title: string;
  collapsed: boolean;
}

type Row = DataRow | SectionRow;

const statuses = ['Замена', 'Получено КП', 'Закуплено'];
const currencies = ['RUB', 'USD', 'EUR'];
const currencySymbols: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€' };

// Цвета для валют в итоговых карточках
const currencyColors: Record<string, string> = {
  RUB: '#3b82f6',
  USD: '#10b981',
  EUR: '#f59e0b',
};

export const SpecificationPage: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [nextId, setNextId] = useState(105);
  const [usdRate, setUsdRate] = useState(90);
  const [eurRate, setEurRate] = useState(98);
  const [tableName, setTableName] = useState('Спецификация оборудования');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const sortableRef = useRef<Sortable | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('spec_column_widths');
    return saved ? JSON.parse(saved) : {
      drag: 40, checkbox: 30, num: 50, vendor: 120, sku: 120, name: 250,
      qty: 90, unit: 80, currency: 90, price: 110, discount: 100,
      discountSum: 130, priceAfter: 130, totalRub: 130, supplier: 140,
      status: 120, actions: 100,
    };
  });

  // Загрузка данных из localStorage или инициализация демо
  useEffect(() => {
    const saved = localStorage.getItem('specification_data_v3');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.rows && data.rows.length) {
          setRows(data.rows);
          setNextId(data.nextId);
          setUsdRate(data.usdRate ?? 90);
          setEurRate(data.eurRate ?? 98);
          setTableName(data.tableName ?? 'Спецификация оборудования');
          return;
        }
      } catch (e) {}
    }
    resetDemo();
  }, []);

  // Сохранение данных
  useEffect(() => {
    if (rows.length === 0) return;
    localStorage.setItem('specification_data_v3', JSON.stringify({ rows, nextId, usdRate, eurRate, tableName }));
  }, [rows, nextId, usdRate, eurRate, tableName]);

  // Сохранение ширин столбцов
  useEffect(() => {
    localStorage.setItem('spec_column_widths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // Пересчёт скидок
  const updateCalculations = () => {
    setRows(prev =>
      prev.map(row => {
        if (row.type === 'data') {
          const discountAmount = (row.price * row.discount) / 100;
          const priceAfter = row.price - discountAmount;
          return { ...row, discountAmount, priceAfter };
        }
        return row;
      })
    );
  };
  useEffect(() => {
    updateCalculations();
  }, []); // только при монтировании, дальше через updateDataField

  const getRate = (currency: string) => {
    if (currency === 'USD') return usdRate;
    if (currency === 'EUR') return eurRate;
    return 1;
  };

  const getTotalRub = (row: DataRow) => {
    return (row.priceAfter || 0) * (row.quantity || 0) * getRate(row.currency);
  };

  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString('ru-RU');
  };

  const computeTotals = () => {
    let totalRub = 0;
    let totalQty = 0;
    const byCurrency: Record<string, { sum: number; qty: number }> = {};
    for (const row of rows) {
      if (row.type === 'data') {
        const rub = getTotalRub(row);
        totalRub += rub;
        totalQty += row.quantity;
        const curr = row.currency;
        if (!byCurrency[curr]) byCurrency[curr] = { sum: 0, qty: 0 };
        byCurrency[curr].sum += row.priceAfter * row.quantity;
        byCurrency[curr].qty += row.quantity;
      }
    }
    return { totalRub, totalQty, byCurrency };
  };

  // Операции с данными
  const addDataRowAfterId = (afterId: number) => {
    const index = rows.findIndex(r => r.id === afterId);
    if (index === -1) return;
    const newId = nextId;
    setNextId(nextId + 1);
    const newRow: DataRow = {
      id: newId, type: 'data', vendor: '', sku: '', name: '', quantity: 0, unit: 'шт', currency: 'RUB',
      price: 0, discount: 0, discountAmount: 0, priceAfter: 0, supplier: '', status: 'Замена'
    };
    const newRows = [...rows];
    newRows.splice(index + 1, 0, newRow);
    setRows(newRows);
  };

  const addDataRowAtEnd = () => {
    const newId = nextId;
    setNextId(nextId + 1);
    setRows([...rows, { id: newId, type: 'data', vendor: '', sku: '', name: '', quantity: 0, unit: 'шт', currency: 'RUB', price: 0, discount: 0, discountAmount: 0, priceAfter: 0, supplier: '', status: 'Замена' }]);
  };

  const addSection = () => {
    const newId = nextId;
    setNextId(nextId + 1);
    setRows([...rows, { id: newId, type: 'section', title: 'Новый раздел', collapsed: false }]);
  };

  const duplicateRow = (id: number) => {
    const index = rows.findIndex(r => r.id === id);
    if (index === -1 || rows[index].type !== 'data') return;
    const original = rows[index] as DataRow;
    const newId = nextId;
    setNextId(nextId + 1);
    const clone = { ...original, id: newId, name: original.name + ' (копия)' };
    const newRows = [...rows];
    newRows.splice(index + 1, 0, clone);
    setRows(newRows);
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter(r => r.id !== id));
    setSelectedIds(prev => prev.filter(pid => pid !== id));
  };

  const toggleSection = (id: number) => {
    setRows(prev => prev.map(r => r.type === 'section' && r.id === id ? { ...r, collapsed: !r.collapsed } : r));
  };

  const updateSectionTitle = (id: number, title: string) => {
    setRows(prev => prev.map(r => r.type === 'section' && r.id === id ? { ...r, title } : r));
  };

  const updateDataField = (id: number, field: keyof DataRow, value: any) => {
    setRows(prev => prev.map(r => {
      if (r.type === 'data' && r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === 'price' || field === 'discount') {
          const discountAmount = (updated.price * updated.discount) / 100;
          const priceAfter = updated.price - discountAmount;
          updated.discountAmount = discountAmount;
          updated.priceAfter = priceAfter;
        }
        return updated;
      }
      return r;
    }));
  };

  const expandAll = () => {
    setRows(prev => prev.map(r => r.type === 'section' ? { ...r, collapsed: false } : r));
  };

  const collapseAll = () => {
    setRows(prev => prev.map(r => r.type === 'section' ? { ...r, collapsed: true } : r));
  };

  const resetDemo = () => {
    const demoRows: Row[] = [
      { id: 100, type: 'data', vendor: 'Siemens', sku: 'ABC-123', name: 'Контактор 3RT2015', quantity: 10, unit: 'шт', currency: 'RUB', price: 2500, discount: 5, discountAmount: 125, priceAfter: 2375, supplier: 'ООО "Электроснаб"', status: 'Закуплено' },
      { id: 101, type: 'data', vendor: 'Schneider', sku: 'GV2ME07', name: 'Автоматический выключатель', quantity: 5, unit: 'шт', currency: 'USD', price: 45, discount: 10, discountAmount: 4.5, priceAfter: 40.5, supplier: 'Schneider Electric', status: 'Получено КП' },
      { id: 102, type: 'section', title: 'Освещение', collapsed: false },
      { id: 103, type: 'data', vendor: 'Philips', sku: 'LED-9W', name: 'Лампа светодиодная 9W 4000K', quantity: 100, unit: 'шт', currency: 'RUB', price: 120, discount: 0, discountAmount: 0, priceAfter: 120, supplier: 'ООО "Световые решения"', status: 'Замена' },
      { id: 104, type: 'data', vendor: 'Legrand', sku: 'Valena', name: 'Розетка двойная', quantity: 20, unit: 'шт', currency: 'EUR', price: 8.5, discount: 15, discountAmount: 1.275, priceAfter: 7.225, supplier: 'Legrand Rus', status: 'Закуплено' },
    ];
    setRows(demoRows);
    setNextId(105);
    setUsdRate(90);
    setEurRate(98);
    setTableName('Спецификация оборудования');
  };

  const exportToExcel = () => {
    const sheetData: any[][] = [['Вендор', 'Артикул', 'Наименование', 'Кол-во', 'Ед.', 'Валюта', 'Цена', 'Скидка %', 'Сумма скидки', 'Цена после', 'Итого руб', 'Поставщик', 'Статус']];
    for (const row of rows) {
      if (row.type === 'section') {
        sheetData.push([`=== ${row.title} ===`, '', '', '', '', '', '', '', '', '', '', '', '']);
      } else {
        const sym = currencySymbols[row.currency];
        const totalRub = getTotalRub(row);
        sheetData.push([row.vendor, row.sku, row.name, row.quantity, row.unit, row.currency, row.price, row.discount, `${sym} ${formatNumber(row.discountAmount)}`, `${sym} ${formatNumber(row.priceAfter)}`, `${formatNumber(totalRub)} ₽`, row.supplier, row.status]);
      }
    }
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Спецификация');
    XLSX.writeFile(wb, `specification_${Date.now()}.xlsx`);
  };

  const deleteSelected = () => {
    setRows(rows.filter(r => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

  // Drag-and-drop (SortableJS)
  useEffect(() => {
    if (!tableBodyRef.current) return;
    if (sortableRef.current) sortableRef.current.destroy();

    sortableRef.current = new Sortable(tableBodyRef.current, {
      handle: '.drag-handle',
      animation: 150,
      onEnd: () => {
        // Получаем новый порядок из DOM
        const domRows = Array.from(tableBodyRef.current!.children);
        const newRowsOrder: Row[] = [];
        for (const dom of domRows) {
          const id = Number(dom.getAttribute('data-id'));
          const found = rows.find(r => r.id === id);
          if (found) newRowsOrder.push(found);
        }
        if (newRowsOrder.length === rows.length) {
          setRows(newRowsOrder);
        }
      },
    });
    return () => {
      if (sortableRef.current) sortableRef.current.destroy();
    };
  }, [rows]);

  // Функция для изменения ширины колонок
  const startResize = (colKey: string, startX: number, startWidth: number) => {
    const onMouseMove = (moveEvent: MouseEvent) => {
      let newWidth = startWidth + (moveEvent.pageX - startX);
      if (newWidth < 30) newWidth = 30;
      setColumnWidths(prev => ({ ...prev, [colKey]: newWidth }));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Глобальные стили (добавляем один раз)
  useEffect(() => {
    const styleId = 'spec-global-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .spec-table .drag-handle { cursor: grab; color: #cbd5e1; text-align: center; }
        .spec-table .data-row { transition: background-color 0.15s; cursor: grab; }
        .spec-table .data-row:hover { background-color: #e0f2fe !important; }
        .spec-table .section-row { background-color: #f1f5f9; font-weight: 600; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; cursor: pointer; }
        .spec-table .section-row:hover { background-color: #e6edf5; }
        .spec-table .action-buttons button { background: transparent; border: none; cursor: pointer; padding: 4px 6px; color: #4b5563; transition: color 0.2s; }
        .spec-table .action-buttons button:hover { color: #3b82f6; }
        .spec-table td { vertical-align: middle; }
        .spec-table .text-right { text-align: right; }
        .spec-table .text-center { text-align: center; }
        .spec-table .word-break { word-break: break-word; white-space: normal; }
        .resize-handle {
          position: absolute;
          right: 0;
          top: 0;
          width: 6px;
          height: 100%;
          cursor: col-resize;
          background-color: transparent;
          z-index: 15;
        }
        .resize-handle:hover { background-color: #94a3b8; }
        th { position: relative; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const totals = computeTotals();
  let dataCounter = 0;
  let sectionCollapsed = false;

  const cols = ['drag', 'checkbox', 'num', 'vendor', 'sku', 'name', 'qty', 'unit', 'currency', 'price', 'discount', 'discountSum', 'priceAfter', 'totalRub', 'supplier', 'status', 'actions'];

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      {/* Тулбар */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px', background: 'white', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <input type="text" value={tableName} onChange={e => setTableName(e.target.value)} style={{ fontSize: '1.5rem', fontWeight: 600, background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '8px', flex: 1 }} />
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '24px', display: 'flex', gap: '12px' }}>
            <label>USD → RUB <input type="number" value={usdRate} onChange={e => setUsdRate(parseFloat(e.target.value) || 0)} step="0.1" style={{ width: '70px', marginLeft: '4px' }} /></label>
            <label>EUR → RUB <input type="number" value={eurRate} onChange={e => setEurRate(parseFloat(e.target.value) || 0)} step="0.1" style={{ width: '70px', marginLeft: '4px' }} /></label>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569' }}>{new Date().toLocaleString()}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }} onClick={expandAll}><i className="fas fa-plus-square"></i> Развернуть всё</button>
            <button style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }} onClick={collapseAll}><i className="fas fa-minus-square"></i> Свернуть всё</button>
            <button style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }} onClick={addSection}><i className="fas fa-layer-group"></i> Раздел</button>
            <button style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }} onClick={addDataRowAtEnd}><i className="fas fa-plus-circle"></i> Строка</button>
            <button style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }} onClick={exportToExcel}><i className="fas fa-file-excel"></i> Excel</button>
            <button style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }} onClick={resetDemo}><i className="fas fa-undo-alt"></i> Сброс</button>
          </div>
        </div>
      </div>

      {/* Панель массового выбора */}
      {selectedIds.length > 0 && (
        <div style={{ background: '#eef2ff', borderRadius: '12px', padding: '8px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Выбрано: {selectedIds.length}</span>
          <button style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer' }} onClick={deleteSelected}><i className="fas fa-trash-alt"></i> Удалить выбранные</button>
        </div>
      )}

      {/* Итоговые карточки (на всю ширину, с цветами валют) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '16px', width: '100%' }}>
        <div style={{ flex: '1 1 200px', background: 'white', borderRadius: '16px', padding: '12px 24px', borderLeft: `4px solid #3b82f6`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b' }}>Общая сумма (руб)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatNumber(totals.totalRub)} ₽</div>
          <div style={{ fontSize: '0.7rem', color: '#475569' }}>Количество: {formatNumber(totals.totalQty)} шт.</div>
        </div>
        {Object.entries(totals.byCurrency).map(([curr, data]) => (
          <div key={curr} style={{ flex: '1 1 200px', background: 'white', borderRadius: '16px', padding: '12px 24px', borderLeft: `4px solid ${currencyColors[curr] || '#3b82f6'}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b' }}>{curr}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{currencySymbols[curr]} {formatNumber(data.sum)}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>Кол-во: {formatNumber(data.qty)}</div>
          </div>
        ))}
      </div>

      {/* Таблица */}
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', maxHeight: '70vh', overflowY: 'auto' }}>
        <table className="spec-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1550px', fontSize: '0.8rem' }}>
          <thead>
            <tr>
              {['drag', 'checkbox', 'num', 'vendor', 'sku', 'name', 'qty', 'unit', 'currency', 'price', 'discount', 'discountSum', 'priceAfter', 'totalRub', 'supplier', 'status', 'actions'].map((col, idx) => (
                <th key={col} style={{ width: columnWidths[col], padding: '8px 6px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', fontWeight: 600, position: 'relative' }}>
                  {col === 'drag' && <i className="fas fa-grip-vertical" style={{ color: '#cbd5e1' }}></i>}
                  {col === 'checkbox' && <input type="checkbox" onChange={(e) => { const checked = e.target.checked; setSelectedIds(checked ? rows.filter(r => r.type === 'data').map(r => r.id) : []); }} />}
                  {col === 'num' && '#'}
                  {col === 'vendor' && 'Вендор'}
                  {col === 'sku' && 'Артикул'}
                  {col === 'name' && 'Наименование'}
                  {col === 'qty' && 'Кол-во'}
                  {col === 'unit' && 'Ед.'}
                  {col === 'currency' && 'Валюта'}
                  {col === 'price' && 'Цена за ед.'}
                  {col === 'discount' && 'Скидка %'}
                  {col === 'discountSum' && 'Сумма скидки'}
                  {col === 'priceAfter' && 'Цена после'}
                  {col === 'totalRub' && 'Итого руб'}
                  {col === 'supplier' && 'Поставщик'}
                  {col === 'status' && 'Статус'}
                  {col === 'actions' && 'Действия'}
                  <div className="resize-handle" onMouseDown={(e) => { e.preventDefault(); startResize(col, e.pageX, columnWidths[col]); }}></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={tableBodyRef}>
            {rows.map(row => {
              if (row.type === 'section') {
                sectionCollapsed = row.collapsed;
                return (
                  <tr key={row.id} className="section-row" data-id={row.id}>
                    <td className="drag-handle"><i className="fas fa-grip-vertical"></i></td>
                    <td className="checkbox-col"></td>
                    <td></td>
                    <td colSpan={14} style={{ padding: '8px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className={`fas ${row.collapsed ? 'fa-plus-square' : 'fa-minus-square'}`} onClick={() => toggleSection(row.id)} style={{ cursor: 'pointer' }}></i>
                        <span contentEditable suppressContentEditableWarning onBlur={e => updateSectionTitle(row.id, e.currentTarget.innerText)} style={{ fontWeight: 600 }}>{row.title}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => addDataRowAfterId(row.id)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '2px 8px', borderRadius: 20, cursor: 'pointer' }}><i className="fas fa-plus-circle"></i> Добавить строку</button>
                        <button onClick={() => deleteRow(row.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '2px 8px', borderRadius: 20, cursor: 'pointer' }}><i className="fas fa-trash-alt"></i> Удалить раздел</button>
                      </div>
                    </td>
                  </tr>
                );
              } else if (row.type === 'data' && !sectionCollapsed) {
                dataCounter++;
                const totalRub = getTotalRub(row);
                const sym = currencySymbols[row.currency];
                return (
                  <tr key={row.id} className="data-row" data-id={row.id}>
                    <td className="drag-handle"><i className="fas fa-grip-vertical"></i></td>
                    <td className="checkbox-col"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, row.id] : prev.filter(id => id !== row.id))} /></td>
                    <td className="text-center">{dataCounter}</td>
                    <td><input type="text" value={row.vendor} onChange={e => updateDataField(row.id, 'vendor', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none' }} /></td>
                    <td className="word-break"><input type="text" value={row.sku} onChange={e => updateDataField(row.id, 'sku', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none' }} /></td>
                    <td className="word-break"><input type="text" value={row.name} onChange={e => updateDataField(row.id, 'name', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none' }} /></td>
                    <td className="text-center"><input type="number" value={row.quantity} onChange={e => updateDataField(row.id, 'quantity', parseInt(e.target.value) || 0)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none' }} /></td>
                    <td className="text-center">
                      <select value={row.unit} onChange={e => updateDataField(row.id, 'unit', e.target.value)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none' }}>
                        <option>шт</option><option>м</option><option>уп.</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <select value={row.currency} onChange={e => updateDataField(row.id, 'currency', e.target.value)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none' }}>
                        {currencies.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="text-right"><input type="number" step="any" value={row.price} onChange={e => updateDataField(row.id, 'price', parseFloat(e.target.value) || 0)} style={{ width: '100%', textAlign: 'right', background: 'transparent', border: 'none', outline: 'none' }} /></td>
                    <td className="text-center"><input type="number" step="any" value={row.discount} onChange={e => updateDataField(row.id, 'discount', parseFloat(e.target.value) || 0)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none' }} /></td>
                    <td className="text-right readonly-cell" style={{ background: '#f9fafb', fontWeight: 500 }}>{sym} {formatNumber(row.discountAmount)}</td>
                    <td className="text-right readonly-cell" style={{ background: '#f9fafb', fontWeight: 500 }}>{sym} {formatNumber(row.priceAfter)}</td>
                    <td className="text-right readonly-cell" style={{ background: '#f9fafb', fontWeight: 500 }}>{formatNumber(totalRub)} ₽</td>
                    <td><input type="text" value={row.supplier} onChange={e => updateDataField(row.id, 'supplier', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none' }} /></td>
                    <td className="text-center">
                      <select value={row.status} onChange={e => updateDataField(row.id, 'status', e.target.value)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none' }}>
                        {statuses.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="action-buttons">
                      <button onClick={() => addDataRowAfterId(row.id)}><i className="fas fa-plus-circle"></i></button>
                      <button onClick={() => duplicateRow(row.id)}><i className="fas fa-copy"></i></button>
                      <button onClick={() => deleteRow(row.id)}><i className="fas fa-trash-alt"></i></button>
                    </td>
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
