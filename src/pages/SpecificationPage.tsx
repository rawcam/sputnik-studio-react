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

export const SpecificationPage: React.FC = () => {
  console.log('SpecificationPage mounted'); // отладка

  const [rows, setRows] = useState<Row[]>([]);
  const [nextId, setNextId] = useState(100);
  const [usdRate, setUsdRate] = useState(90);
  const [eurRate, setEurRate] = useState(98);
  const [tableName, setTableName] = useState('Спецификация оборудования');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const sortableRef = useRef<Sortable | null>(null);
  const [creationDate] = useState(() => new Date().toLocaleString());

  // Загрузка из localStorage или сброс демо
  useEffect(() => {
    const saved = localStorage.getItem('specification_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setRows(data.rows);
        setNextId(data.nextId);
        setUsdRate(data.usdRate ?? 90);
        setEurRate(data.eurRate ?? 98);
        setTableName(data.tableName ?? 'Спецификация оборудования');
      } catch (e) {
        console.error(e);
        resetDemo();
      }
    } else {
      resetDemo();
    }
  }, []);

  // Сохранение в localStorage
  useEffect(() => {
    if (rows.length === 0) return;
    localStorage.setItem(
      'specification_data',
      JSON.stringify({ rows, nextId, usdRate, eurRate, tableName })
    );
  }, [rows, nextId, usdRate, eurRate, tableName]);

  // Пересчёт discountAmount и priceAfter при изменении цен/скидок
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
  }, [rows]);

  const getRate = (currency: string) => {
    if (currency === 'USD') return usdRate;
    if (currency === 'EUR') return eurRate;
    return 1;
  };

  const getTotalRub = (row: DataRow) => {
    return (row.priceAfter || 0) * (row.quantity || 0) * getRate(row.currency);
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

  const addDataRowAfterId = (afterId: number) => {
    const index = rows.findIndex(r => r.id === afterId);
    if (index === -1) return;
    const newId = nextId;
    setNextId(nextId + 1);
    const newRow: DataRow = {
      id: newId,
      type: 'data',
      vendor: '',
      sku: '',
      name: '',
      quantity: 0,
      unit: 'шт',
      currency: 'RUB',
      price: 0,
      discount: 0,
      discountAmount: 0,
      priceAfter: 0,
      supplier: '',
      status: 'Замена',
    };
    const newRows = [...rows];
    newRows.splice(index + 1, 0, newRow);
    setRows(newRows);
  };

  const addDataRowAtEnd = () => {
    const newId = nextId;
    setNextId(nextId + 1);
    setRows([
      ...rows,
      {
        id: newId,
        type: 'data',
        vendor: '',
        sku: '',
        name: '',
        quantity: 0,
        unit: 'шт',
        currency: 'RUB',
        price: 0,
        discount: 0,
        discountAmount: 0,
        priceAfter: 0,
        supplier: '',
        status: 'Замена',
      },
    ]);
  };

  const addSection = () => {
    const newId = nextId;
    setNextId(nextId + 1);
    setRows([
      ...rows,
      { id: newId, type: 'section', title: 'Новый раздел', collapsed: false },
    ]);
  };

  const duplicateRow = (id: number) => {
    const index = rows.findIndex(r => r.id === id);
    if (index === -1 || rows[index].type !== 'data') return;
    const original = rows[index] as DataRow;
    const newId = nextId;
    setNextId(nextId + 1);
    const clone: DataRow = {
      ...original,
      id: newId,
      name: original.name + ' (копия)',
    };
    const newRows = [...rows];
    newRows.splice(index + 1, 0, clone);
    setRows(newRows);
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const toggleSection = (id: number) => {
    setRows(prev =>
      prev.map(r =>
        r.type === 'section' && r.id === id ? { ...r, collapsed: !r.collapsed } : r
      )
    );
  };

  const updateSectionTitle = (id: number, title: string) => {
    setRows(prev =>
      prev.map(r => (r.type === 'section' && r.id === id ? { ...r, title } : r))
    );
  };

  const updateDataField = <K extends keyof DataRow>(
    id: number,
    field: K,
    value: DataRow[K]
  ) => {
    setRows(prev =>
      prev.map(r => {
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
      })
    );
  };

  const expandAll = () => {
    setRows(prev =>
      prev.map(r => (r.type === 'section' ? { ...r, collapsed: false } : r))
    );
  };

  const collapseAll = () => {
    setRows(prev =>
      prev.map(r => (r.type === 'section' ? { ...r, collapsed: true } : r))
    );
  };

  const resetDemo = () => {
    console.log('resetDemo called');
    const demoRows: Row[] = [
      { id: 100, type: 'data', vendor: 'Siemens', sku: 'ABC-123', name: 'Контактор 3RT2015', quantity: 10, unit: 'шт', currency: 'RUB', price: 2500, discount: 5, discountAmount: 125, priceAfter: 2375, supplier: 'ООО "Электроснаб"', status: 'Закуплено' },
      { id: 101, type: 'data', vendor: 'Schneider', sku: 'GV2ME07', name: 'Автоматический выключатель', quantity: 5, unit: 'шт', currency: 'USD', price: 45, discount: 10, discountAmount: 4.5, priceAfter: 40.5, supplier: 'Schneider Electric', status: 'Получено КП' },
      { id: 102, type: 'section', title: 'Освещение', collapsed: false },
      { id: 103, type: 'data', vendor: 'Philips', sku: 'LED-9W', name: 'Лампа светодиодная 9W 4000K', quantity: 100, unit: 'шт', currency: 'RUB', price: 120, discount: 0, discountAmount: 0, priceAfter: 120, supplier: 'ООО "Световые решения"', status: 'Замена' },
      { id: 104, type: 'data', vendor: 'Legrand', sku: 'Valena', name: 'Розетка двойная', quantity: 20, unit: 'шт', currency: 'EUR', price: 8.5, discount: 15, discountAmount: 1.275, priceAfter: 7.225, supplier: 'Legrand Rus', status: 'Закуплено' },
    ];
    setRows(demoRows);
    setNextId(105);
    setTableName('Спецификация оборудования');
    setUsdRate(90);
    setEurRate(98);
  };

  const exportToExcel = () => {
    const sheetData: any[][] = [['Вендор', 'Артикул', 'Наименование', 'Кол-во', 'Ед.', 'Валюта', 'Цена', 'Скидка %', 'Сумма скидки', 'Цена после', 'Итого руб', 'Поставщик', 'Статус']];
    for (const row of rows) {
      if (row.type === 'section') {
        sheetData.push([`=== ${row.title} ===`, '', '', '', '', '', '', '', '', '', '', '', '']);
      } else {
        const sym = currencySymbols[row.currency];
        const totalRub = getTotalRub(row);
        sheetData.push([row.vendor, row.sku, row.name, row.quantity, row.unit, row.currency, row.price, row.discount, `${sym} ${row.discountAmount.toFixed(2)}`, `${sym} ${row.priceAfter.toFixed(2)}`, `${totalRub.toFixed(2)} ₽`, row.supplier, row.status]);
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

  // Drag-and-drop
  useEffect(() => {
    if (tableBodyRef.current) {
      if (sortableRef.current) sortableRef.current.destroy();
      sortableRef.current = new Sortable(tableBodyRef.current, {
        handle: '.drag-handle',
        animation: 150,
        onEnd: () => {
          if (tableBodyRef.current) {
            const newRowsOrder: Row[] = [];
            const children = Array.from(tableBodyRef.current.children);
            for (const child of children) {
              const id = Number(child.getAttribute('data-id'));
              const found = rows.find(r => r.id === id);
              if (found) newRowsOrder.push(found);
            }
            if (newRowsOrder.length === rows.length) setRows(newRowsOrder);
          }
        },
      });
    }
    return () => {
      if (sortableRef.current) sortableRef.current.destroy();
    };
  }, [rows]);

  // Обработка чекбоксов
  useEffect(() => {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    const handleChange = () => {
      const checked = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => Number(cb.getAttribute('data-id')));
      setSelectedIds(checked);
    };
    checkboxes.forEach(cb => cb.addEventListener('change', handleChange));
    return () => {
      checkboxes.forEach(cb => cb.removeEventListener('change', handleChange));
    };
  }, [rows]);

  const totals = computeTotals();
  let dataCounter = 0;
  let sectionCollapsed = false;

  return (
    <div className="specification-module" style={{ padding: '20px' }}>
      <div className="spec-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', background: 'white', padding: '12px 20px', borderRadius: '16px' }}>
        <input type="text" className="table-title" value={tableName} onChange={e => setTableName(e.target.value)} style={{ fontSize: '1.5rem', fontWeight: 600 }} />
        <div className="currency-rates" style={{ display: 'flex', gap: '16px' }}>
          <label>USD → RUB <input type="number" value={usdRate} onChange={e => setUsdRate(parseFloat(e.target.value) || 0)} step="0.1" style={{ width: '70px' }} /></label>
          <label>EUR → RUB <input type="number" value={eurRate} onChange={e => setEurRate(parseFloat(e.target.value) || 0)} step="0.1" style={{ width: '70px' }} /></label>
        </div>
        <div className="date-info">{creationDate}</div>
        <div className="buttons-group">
          <button onClick={expandAll}><i className="fas fa-plus-square"></i> Развернуть всё</button>
          <button onClick={collapseAll}><i className="fas fa-minus-square"></i> Свернуть всё</button>
          <button onClick={addSection} className="primary" style={{ background: '#3b82f6', color: 'white' }}><i className="fas fa-layer-group"></i> Раздел</button>
          <button onClick={addDataRowAtEnd} className="primary" style={{ background: '#3b82f6', color: 'white' }}><i className="fas fa-plus-circle"></i> Строка</button>
          <button onClick={exportToExcel}><i className="fas fa-file-excel"></i> Excel</button>
          <button onClick={resetDemo} className="danger" style={{ background: '#fee2e2', color: '#b91c1c' }}><i className="fas fa-undo-alt"></i> Сброс</button>
        </div>
      </div>

      <div className={`mass-actions`} style={{ display: selectedIds.length > 0 ? 'flex' : 'none', background: '#eef2ff', padding: '8px 16px', marginBottom: '16px', gap: '16px' }}>
        <span>Выбрано: {selectedIds.length}</span>
        <button onClick={deleteSelected} className="danger" style={{ background: '#fee2e2', color: '#b91c1c' }}><i className="fas fa-trash-alt"></i> Удалить выбранные</button>
      </div>

      <div className="totals-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '16px' }}>
        <div className="totals-card" style={{ background: 'white', borderRadius: '16px', padding: '12px 24px', borderLeft: '4px solid #3b82f6' }}>
          <div className="label">Общая сумма (руб)</div>
          <div className="value">{totals.totalRub.toFixed(2)} ₽</div>
          <div className="sub">Количество: {totals.totalQty} шт.</div>
        </div>
        {Object.entries(totals.byCurrency).map(([curr, data]) => (
          <div key={curr} className="totals-card" style={{ background: 'white', borderRadius: '16px', padding: '12px 24px', borderLeft: '4px solid #3b82f6' }}>
            <div className="label">{curr}</div>
            <div className="value">{currencySymbols[curr]} {data.sum.toFixed(2)}</div>
            <div className="sub">Кол-во: {data.qty}</div>
          </div>
        ))}
      </div>

      <div className="table-wrapper" style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', maxHeight: '70vh', overflowY: 'auto' }}>
        <table id="specTable" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1550px' }}>
          <thead>
            <tr>
              <th style={{ width: 40 }}><i className="fas fa-grip-vertical"></i></th>
              <th style={{ width: 30 }}><input type="checkbox" id="selectAllCheckbox" /></th>
              <th style={{ width: 50 }}>#</th>
              <th style={{ width: 120 }}>Вендор</th>
              <th style={{ width: 120 }}>Артикул</th>
              <th style={{ width: 250 }}>Наименование</th>
              <th style={{ width: 90 }}>Кол-во</th>
              <th style={{ width: 80 }}>Ед.</th>
              <th style={{ width: 90 }}>Валюта</th>
              <th style={{ width: 110 }}>Цена за ед.</th>
              <th style={{ width: 100 }}>Скидка %</th>
              <th style={{ width: 130 }}>Сумма скидки</th>
              <th style={{ width: 130 }}>Цена после</th>
              <th style={{ width: 130 }}>Итого руб</th>
              <th style={{ width: 140 }}>Поставщик</th>
              <th style={{ width: 120 }}>Статус</th>
              <th style={{ width: 100 }}>Действия</th>
            </tr>
          </thead>
          <tbody ref={tableBodyRef}>
            {rows.map(row => {
              if (row.type === 'section') {
                sectionCollapsed = row.collapsed;
                return (
                  <tr key={row.id} className="section-row" data-id={row.id} style={{ background: '#f1f5f9', fontWeight: 600 }}>
                    <td className="drag-handle"><i className="fas fa-grip-vertical"></i></td>
                    <td className="checkbox-col"></td>
                    <td></td>
                    <td colSpan={14}>
                      <i className={`fas ${row.collapsed ? 'fa-plus-square' : 'fa-minus-square'} collapse-icon`} onClick={() => toggleSection(row.id)} style={{ marginRight: '6px', cursor: 'pointer' }}></i>
                      <span contentEditable suppressContentEditableWarning onBlur={e => updateSectionTitle(row.id, e.currentTarget.innerText)}>{row.title}</span>
                      <button onClick={() => addDataRowAfterId(row.id)} style={{ marginLeft: 12, background: '#2563eb', color: 'white', border: 'none', padding: '2px 8px', borderRadius: 20 }}><i className="fas fa-plus-circle"></i> Добавить строку</button>
                      <button onClick={() => deleteRow(row.id)} style={{ marginLeft: 8, background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '2px 8px', borderRadius: 20 }}><i className="fas fa-trash-alt"></i> Удалить раздел</button>
                    </td>
                  </tr>
                );
              } else if (row.type === 'data' && !sectionCollapsed) {
                dataCounter++;
                const totalRub = getTotalRub(row);
                const sym = currencySymbols[row.currency];
                return (
                  <tr key={row.id} className="data-row" data-id={row.id} style={{ cursor: 'grab' }}>
                    <td className="drag-handle"><i className="fas fa-grip-vertical"></i></td>
                    <td className="checkbox-col"><input type="checkbox" className="row-checkbox" data-id={row.id} /></td>
                    <td className="row-number">{dataCounter}</td>
                    <td><input type="text" value={row.vendor} onChange={e => updateDataField(row.id, 'vendor', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><input type="text" value={row.sku} onChange={e => updateDataField(row.id, 'sku', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><input type="text" value={row.name} onChange={e => updateDataField(row.id, 'name', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><input type="number" value={row.quantity} onChange={e => updateDataField(row.id, 'quantity', parseInt(e.target.value) || 0)} style={{ width: '100%' }} /></td>
                    <td><select value={row.unit} onChange={e => updateDataField(row.id, 'unit', e.target.value)} style={{ width: '100%' }}><option>шт</option><option>м</option><option>уп.</option></select></td>
                    <td><select value={row.currency} onChange={e => updateDataField(row.id, 'currency', e.target.value)} style={{ width: '100%' }}>{currencies.map(c => <option key={c}>{c}</option>)}</select></td>
                    <td><input type="number" step="any" value={row.price} onChange={e => updateDataField(row.id, 'price', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} /></td>
                    <td><input type="number" step="any" value={row.discount} onChange={e => updateDataField(row.id, 'discount', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} /></td>
                    <td className="readonly-cell text-right">{sym} {row.discountAmount.toFixed(2)}</td>
                    <td className="readonly-cell text-right">{sym} {row.priceAfter.toFixed(2)}</td>
                    <td className="readonly-cell text-right">{totalRub.toFixed(2)} ₽</td>
                    <td><input type="text" value={row.supplier} onChange={e => updateDataField(row.id, 'supplier', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><select value={row.status} onChange={e => updateDataField(row.id, 'status', e.target.value)} style={{ width: '100%' }}>{statuses.map(s => <option key={s}>{s}</option>)}</select></td>
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
