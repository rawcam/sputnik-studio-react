import React, { useState, useEffect, useRef } from 'react';
import Sortable from 'sortablejs';
import * as XLSX from 'xlsx';

// ============================================================================
// ТИПЫ
// ============================================================================

interface DataRow {
  id: number;
  type: 'data';
  vendor: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  currency: string;
  price: number;          // Цена за единицу (без скидки) в валюте
  discount: number;      // Скидка в процентах
  discountAmount: number; // Сумма скидки на единицу в валюте
  priceAfter: number;     // Цена за единицу после скидки в валюте
  supplier: string;
  status: string;
}

interface SectionRow {
  id: number;
  type: 'section';
  title: string;
  collapsed: boolean;
  showTotals: boolean;
}

type Row = DataRow | SectionRow;

// ============================================================================
// КОНСТАНТЫ
// ============================================================================

const statuses = ['Замена', 'Получено КП', 'Закуплено'];
const currencies = ['RUB', 'USD', 'EUR'];
const currencySymbols: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€' };
const currencyColors: Record<string, string> = { RUB: '#3b82f6', USD: '#10b981', EUR: '#f59e0b' };

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export const SpecificationPage: React.FC = () => {
  // Состояние данных
  const [rows, setRows] = useState<Row[]>([]);
  const [nextId, setNextId] = useState(105);
  const [usdRate, setUsdRate] = useState(90);
  const [eurRate, setEurRate] = useState(98);
  const [tableName, setTableName] = useState('Спецификация оборудования');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterVendor, setFilterVendor] = useState('');
  const [filterSku, setFilterSku] = useState('');

  // Refs для таблицы и Sortable
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const sortableRef = useRef<Sortable | null>(null);

  // Ширина столбцов (сохраняется в localStorage)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('spec_column_widths');
    return saved ? JSON.parse(saved) : {
      drag: 40, checkbox: 30, num: 50, vendor: 120, sku: 120, name: 250,
      qty: 90, unit: 80, currency: 90, price: 110, discount: 100,
      discountAmount: 130, priceAfter: 130, totalRub: 130,
      supplier: 140, status: 120, actions: 100,
    };
  });

  // ==========================================================================
  // ЗАГРУЗКА / СОХРАНЕНИЕ
  // ==========================================================================

  useEffect(() => {
    const saved = localStorage.getItem('specification_data_v12');
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

  useEffect(() => {
    if (rows.length === 0) return;
    localStorage.setItem('specification_data_v12', JSON.stringify({ rows, nextId, usdRate, eurRate, tableName }));
  }, [rows, nextId, usdRate, eurRate, tableName]);

  useEffect(() => {
    localStorage.setItem('spec_column_widths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // ==========================================================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (расчёты)
  // ==========================================================================

  const getRate = (currency: string) => {
    if (currency === 'USD') return usdRate;
    if (currency === 'EUR') return eurRate;
    return 1;
  };

  // Валовая сумма (без скидки) в рублях: price * quantity * курс
  const getGrossRub = (row: DataRow) => row.price * row.quantity * getRate(row.currency);

  // Общая сумма (после скидки) в рублях: priceAfter * quantity * курс
  const getTotalRub = (row: DataRow) => (row.priceAfter || 0) * row.quantity * getRate(row.currency);

  const formatNumber = (num: number): string => Math.round(num).toLocaleString('ru-RU');

  // Пересчёт скидок и цен после скидки для всех строк данных
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
  }, []);

  // Фильтрация строк по вендору и артикулу
  const isDataRowVisible = (row: DataRow) => {
    const vendorMatch = filterVendor === '' || row.vendor.toLowerCase().includes(filterVendor.toLowerCase());
    const skuMatch = filterSku === '' || row.sku.toLowerCase().includes(filterSku.toLowerCase());
    return vendorMatch && skuMatch;
  };

  // Вычисление общих итогов по всем видимым строкам
  const computeTotals = () => {
    let totalGrossRub = 0, totalRub = 0, totalQty = 0, totalDiscountRub = 0;
    const byCurrency: Record<string, { gross: number; net: number; qty: number }> = {};
    for (const row of rows) {
      if (row.type === 'data' && isDataRowVisible(row)) {
        const gross = getGrossRub(row);
        const net = getTotalRub(row);
        totalGrossRub += gross;
        totalRub += net;
        totalDiscountRub += gross - net;
        totalQty += row.quantity;
        const curr = row.currency;
        if (!byCurrency[curr]) byCurrency[curr] = { gross: 0, net: 0, qty: 0 };
        byCurrency[curr].gross += row.price * row.quantity;
        byCurrency[curr].net += row.priceAfter * row.quantity;
        byCurrency[curr].qty += row.quantity;
      }
    }
    const marginPercent = totalGrossRub === 0 ? 0 : ((totalGrossRub - totalRub) / totalGrossRub) * 100;
    return { totalGrossRub, totalRub, totalDiscountRub, totalQty, marginPercent, byCurrency };
  };

  // Вычисление итогов по конкретному разделу (только видимые строки)
  const getSectionTotals = (sectionId: number) => {
    let sectionGross = 0, sectionNet = 0, sectionQty = 0;
    let start = false;
    for (const row of rows) {
      if (row.type === 'section' && row.id === sectionId) {
        start = true;
        continue;
      }
      if (start && row.type === 'section') break;
      if (start && row.type === 'data' && isDataRowVisible(row)) {
        sectionGross += getGrossRub(row);
        sectionNet += getTotalRub(row);
        sectionQty += row.quantity;
      }
    }
    return { gross: sectionGross, net: sectionNet, qty: sectionQty };
  };

  // ==========================================================================
  // ОПЕРАЦИИ С ДАННЫМИ (CRUD)
  // ==========================================================================

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
    setTimeout(() => updateCalculations(), 0);
  };

  const addSection = () => {
    const newId = nextId;
    setNextId(nextId + 1);
    setRows([...rows, { id: newId, type: 'section', title: 'Новый раздел', collapsed: false, showTotals: true }]);
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
    setTimeout(() => updateCalculations(), 0);
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter(r => r.id !== id));
    setSelectedIds(prev => prev.filter(pid => pid !== id));
  };

  const toggleSection = (id: number) => {
    setRows(prev => prev.map(r => r.type === 'section' && r.id === id ? { ...r, collapsed: !r.collapsed } : r));
  };

  const toggleSectionTotals = (id: number) => {
    setRows(prev => prev.map(r => r.type === 'section' && r.id === id ? { ...r, showTotals: !r.showTotals } : r));
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

  const expandAll = () => setRows(prev => prev.map(r => r.type === 'section' ? { ...r, collapsed: false } : r));
  const collapseAll = () => setRows(prev => prev.map(r => r.type === 'section' ? { ...r, collapsed: true } : r));

  const resetDemo = () => {
    setRows([
      { id: 100, type: 'data', vendor: 'Siemens', sku: 'ABC-123', name: 'Контактор 3RT2015', quantity: 10, unit: 'шт', currency: 'RUB', price: 2500, discount: 5, discountAmount: 125, priceAfter: 2375, supplier: 'ООО "Электроснаб"', status: 'Закуплено' },
      { id: 101, type: 'data', vendor: 'Schneider', sku: 'GV2ME07', name: 'Автоматический выключатель', quantity: 5, unit: 'шт', currency: 'USD', price: 45, discount: 10, discountAmount: 4.5, priceAfter: 40.5, supplier: 'Schneider Electric', status: 'Получено КП' },
      { id: 102, type: 'section', title: 'Освещение', collapsed: false, showTotals: true },
      { id: 103, type: 'data', vendor: 'Philips', sku: 'LED-9W', name: 'Лампа светодиодная 9W 4000K', quantity: 100, unit: 'шт', currency: 'RUB', price: 120, discount: 0, discountAmount: 0, priceAfter: 120, supplier: 'ООО "Световые решения"', status: 'Замена' },
      { id: 104, type: 'data', vendor: 'Legrand', sku: 'Valena', name: 'Розетка двойная', quantity: 20, unit: 'шт', currency: 'EUR', price: 8.5, discount: 15, discountAmount: 1.275, priceAfter: 7.225, supplier: 'Legrand Rus', status: 'Закуплено' },
    ]);
    setNextId(105);
    setUsdRate(90);
    setEurRate(98);
    setTableName('Спецификация оборудования');
    setFilterVendor('');
    setFilterSku('');
  };

  const exportToExcel = () => {
    const sheetData: any[][] = [['Вендор', 'Артикул', 'Наименование', 'Кол-во', 'Ед.', 'Валюта', 'Цена за ед.', 'Скидка %', 'Сумма скидки', 'Цена после скидки', 'Общая сумма (руб)', 'Поставщик', 'Статус']];
    for (const row of rows) {
      if (row.type === 'section') {
        sheetData.push([`=== ${row.title} ===`, '', '', '', '', '', '', '', '', '', '', '', '']);
      } else {
        const totalRub = getTotalRub(row);
        const sym = currencySymbols[row.currency];
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

  // ==========================================================================
  // DRAG-AND-DROP (только для строк данных)
  // ==========================================================================

  useEffect(() => {
    if (!tableBodyRef.current) return;
    if (sortableRef.current) {
      try { sortableRef.current.destroy(); } catch (e) {}
      sortableRef.current = null;
    }
    sortableRef.current = new Sortable(tableBodyRef.current, {
      handle: '.data-row .drag-handle',
      animation: 150,
      onEnd: () => {
        if (!tableBodyRef.current) return;
        const domRows = Array.from(tableBodyRef.current.children);
        const newRowsOrder: Row[] = [];
        for (const dom of domRows) {
          const id = Number(dom.getAttribute('data-id'));
          const found = rows.find(r => r.id === id);
          if (found) newRowsOrder.push(found);
        }
        if (newRowsOrder.length === rows.length) setRows(newRowsOrder);
      },
    });
    return () => {
      if (sortableRef.current) {
        try { sortableRef.current.destroy(); } catch (e) {}
        sortableRef.current = null;
      }
    };
  }, [rows]);

  // ==========================================================================
  // ИЗМЕНЕНИЕ ШИРИНЫ СТОЛБЦОВ (resize)
  // ==========================================================================

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

  // ==========================================================================
  // ГЛОБАЛЬНЫЕ СТИЛИ (с поддержкой тёмной темы и вертикальными разделителями)
  // ==========================================================================

  useEffect(() => {
    const styleId = 'spec-global-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .spec-table {
          --bg-panel: var(--bg-panel, rgba(255,255,255,0.85));
          --bg-panel-solid: var(--bg-panel-solid, #ffffff);
          --text-primary: var(--text-primary, #1a2c3e);
          --text-secondary: var(--text-secondary, #4b6a8a);
          --border-light: var(--border-light, rgba(203,213,225,0.5));
          --card-bg: var(--card-bg, rgba(249,252,255,0.8));
        }
        body.dark .spec-table {
          --bg-panel: var(--bg-panel, rgba(30,41,59,0.85));
          --bg-panel-solid: var(--bg-panel-solid, #1e293b);
          --text-primary: var(--text-primary, #e2e8f0);
          --text-secondary: var(--text-secondary, #94a3b8);
          --border-light: var(--border-light, rgba(71,85,105,0.5));
          --card-bg: var(--card-bg, rgba(30,41,59,0.7));
        }
        .spec-table .drag-handle { cursor: grab; color: #cbd5e1; text-align: center; }
        .spec-table .data-row { transition: background-color 0.15s; cursor: grab; }
        .spec-table .data-row:hover { background-color: #e0f2fe !important; }
        body.dark .spec-table .data-row:hover { background-color: #1e293b !important; }
        .spec-table .section-row { background-color: var(--card-bg); font-weight: 600; border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); cursor: pointer; }
        .spec-table .section-row:hover { background-color: rgba(37,99,235,0.1); }
        .spec-table .action-buttons button { background: transparent; border: none; cursor: pointer; padding: 4px 6px; color: #cbd5e1; transition: color 0.2s; }
        .spec-table .action-buttons button:hover { color: #3b82f6; }
        .spec-table .section-row .collapse-icon { color: #cbd5e1; transition: color 0.2s; }
        .spec-table .section-row .collapse-icon:hover { color: #3b82f6; }
        /* Вертикальные разделители (тонкая светлая линия) */
        .spec-table td, .spec-table th { border-right: 1px solid var(--border-light) !important; }
        .spec-table td:last-child, .spec-table th:last-child { border-right: none !important; }
        /* Отступы для воздушности */
        .spec-table td, .spec-table th { padding: 10px 8px; background-color: var(--bg-panel-solid); color: var(--text-primary); }
        .spec-table th { background: var(--card-bg); color: var(--text-secondary); position: sticky; top: 0; z-index: 10; }
        .spec-table .text-right { text-align: right; padding-right: 12px; }
        .spec-table .text-center { text-align: center; }
        .spec-table .word-break { word-break: break-word; white-space: normal; }
        .resize-handle { position: absolute; right: 0; top: 0; width: 6px; height: 100%; cursor: col-resize; background-color: transparent; z-index: 15; }
        .resize-handle:hover { background-color: #94a3b8; }
        th { position: relative; }
        .section-totals-row { background-color: var(--card-bg); font-weight: 500; border-top: 1px solid var(--border-light); }
        .section-totals-row td { padding: 10px 8px; background-color: var(--card-bg); }
        .filtered-out { display: none; }
        input, select { background: var(--bg-panel-solid); color: var(--text-primary); border: 1px solid var(--border-light); border-radius: 8px; padding: 6px 8px; }
        .readonly-cell { background: var(--card-bg); }
        /* Итоговая строка (tfoot) – отделена двойной линией */
        .spec-table tfoot tr { background-color: var(--card-bg); border-top: 3px double var(--accent, #3b82f6); font-weight: 700; }
        .spec-table tfoot td { background-color: var(--card-bg); padding: 12px 8px; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ==========================================================================
  // РЕНДЕР
  // ==========================================================================

  const totals = computeTotals();
  let dataCounter = 0;

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Верхняя панель (тулбар) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', background: 'var(--bg-panel)', backdropFilter: 'blur(12px)', padding: '16px 20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <input type="text" value={tableName} onChange={e => setTableName(e.target.value)} style={{ fontSize: '1.5rem', fontWeight: 600, background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '8px', flex: 1, color: 'var(--text-primary)' }} />
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ background: 'var(--card-bg)', padding: '6px 12px', borderRadius: '24px', display: 'flex', gap: '12px' }}>
              <label style={{ color: 'var(--text-secondary)' }}>USD → RUB <input type="number" value={usdRate} onChange={e => setUsdRate(parseFloat(e.target.value) || 0)} step="0.1" style={{ width: '70px', marginLeft: '4px', background: 'var(--bg-panel-solid)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '4px' }} /></label>
              <label style={{ color: 'var(--text-secondary)' }}>EUR → RUB <input type="number" value={eurRate} onChange={e => setEurRate(parseFloat(e.target.value) || 0)} step="0.1" style={{ width: '70px', marginLeft: '4px', background: 'var(--bg-panel-solid)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '4px' }} /></label>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date().toLocaleString()}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Фильтр по вендору" value={filterVendor} onChange={e => setFilterVendor(e.target.value)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-light)', fontSize: '0.8rem', width: '140px', background: 'var(--bg-panel-solid)', color: 'var(--text-primary)' }} />
              <input type="text" placeholder="Фильтр по артикулу" value={filterSku} onChange={e => setFilterSku(e.target.value)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-light)', fontSize: '0.8rem', width: '140px', background: 'var(--bg-panel-solid)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={expandAll}><i className="fas fa-plus-square"></i> Развернуть всё</button>
            <button style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={collapseAll}><i className="fas fa-minus-square"></i> Свернуть всё</button>
            <button style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }} onClick={addSection}><i className="fas fa-layer-group"></i> Раздел</button>
            <button style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={exportToExcel}><i className="fas fa-file-excel"></i> Excel</button>
            <button style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }} onClick={resetDemo}><i className="fas fa-undo-alt"></i> Сброс</button>
          </div>
        </div>
      </div>

      {/* Панель массового выбора */}
      {selectedIds.length > 0 && (
        <div style={{ background: 'var(--accent-glow)', borderRadius: '12px', padding: '8px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--text-primary)' }}>Выбрано: {selectedIds.length}</span>
          <button style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer' }} onClick={deleteSelected}><i className="fas fa-trash-alt"></i> Удалить выбранные</button>
        </div>
      )}

      {/* Информеры (карточки с итогами) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '16px', width: '100%' }}>
        <div style={{ flex: '1 1 200px', background: 'var(--bg-panel-solid)', borderRadius: '16px', padding: '12px 24px', borderLeft: `4px solid #10b981`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} title="Сумма без скидок (цена × количество × курс)">
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Валовая сумма (руб)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(totals.totalGrossRub)} ₽</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Количество: {formatNumber(totals.totalQty)} шт.</div>
        </div>
        <div style={{ flex: '1 1 200px', background: 'var(--bg-panel-solid)', borderRadius: '16px', padding: '12px 24px', borderLeft: `4px solid #3b82f6`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} title="Сумма после скидок (цена со скидкой × количество × курс)">
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Общая сумма (руб)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(totals.totalRub)} ₽</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Скидка: {formatNumber(totals.totalDiscountRub)} ₽</div>
        </div>
        <div style={{ flex: '1 1 200px', background: 'var(--bg-panel-solid)', borderRadius: '16px', padding: '12px 24px', borderLeft: `4px solid #f59e0b`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} title="(Валовая сумма − Общая сумма) / Валовая сумма × 100%">
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Маржинальность</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totals.marginPercent.toFixed(1)}%</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>от валовой суммы</div>
        </div>
        {Object.entries(totals.byCurrency).map(([curr, data]) => (
          <div key={curr} style={{ flex: '1 1 200px', background: 'var(--bg-panel-solid)', borderRadius: '16px', padding: '12px 24px', borderLeft: `4px solid ${currencyColors[curr] || '#3b82f6'}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{curr}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currencySymbols[curr]} {formatNumber(data.net)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Валовая: {currencySymbols[curr]} {formatNumber(data.gross)}</div>
          </div>
        ))}
      </div>

      {/* Таблица */}
      <div style={{ overflowX: 'auto', background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-light)', maxHeight: '70vh', overflowY: 'auto' }}>
        <table className="spec-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1600px', fontSize: '0.8rem' }}>
          <thead>
            <tr>
              {['drag', 'checkbox', 'num', 'vendor', 'sku', 'name', 'qty', 'unit', 'currency', 'price', 'discount', 'discountAmount', 'priceAfter', 'totalRub', 'supplier', 'status', 'actions'].map(col => (
                <th key={col} style={{ width: columnWidths[col] }}>
                  {col === 'drag' && <i className="fas fa-grip-vertical" style={{ color: '#cbd5e1' }}></i>}
                  {col === 'checkbox' && <input type="checkbox" onChange={(e) => { const checked = e.target.checked; setSelectedIds(checked ? rows.filter(r => r.type === 'data').map(r => r.id) : []); }} />}
                  {col === 'num' && '#'}
                  {col === 'vendor' && 'Вендор'}
                  {col === 'sku' && 'Артикул'}
                  {col === 'name' && 'Наименование (описание)'}
                  {col === 'qty' && 'Количество'}
                  {col === 'unit' && 'Ед. изм.'}
                  {col === 'currency' && 'Валюта'}
                  {col === 'price' && 'Цена за ед.'}
                  {col === 'discount' && 'Скидка (%)'}
                  {col === 'discountAmount' && 'Сумма скидки'}
                  {col === 'priceAfter' && 'Цена за вычетом скидки'}
                  {col === 'totalRub' && 'Общая сумма (руб)'}
                  {col === 'supplier' && 'Поставщик'}
                  {col === 'status' && 'Статус'}
                  {col === 'actions' && 'Действия'}
                  <div className="resize-handle" onMouseDown={(e) => { e.preventDefault(); startResize(col, e.pageX, columnWidths[col]); }}></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={tableBodyRef}>
            {rows.map((row, idx, array) => {
              if (row.type === 'section') {
                const sectionTotals = getSectionTotals(row.id);
                return (
                  <React.Fragment key={row.id}>
                    <tr className="section-row" data-id={row.id}>
                      <td className="drag-handle"><i className="fas fa-grip-vertical"></i></td>
                      <td className="checkbox-col"></td>
                      <td colSpan={16} style={{ padding: '10px 8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <i className={`fas ${row.collapsed ? 'fa-plus-square' : 'fa-minus-square'} collapse-icon`} onClick={() => toggleSection(row.id)} style={{ cursor: 'pointer', marginRight: '8px', color: '#cbd5e1' }}></i>
                            <span contentEditable suppressContentEditableWarning onBlur={e => updateSectionTitle(row.id, e.currentTarget.innerText)} style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{row.title}</span>
                            <i className="fas fa-chart-line" onClick={() => toggleSectionTotals(row.id)} style={{ cursor: 'pointer', marginLeft: '12px', color: row.showTotals ? '#3b82f6' : '#cbd5e1' }} title="Показать/скрыть итоги по разделу"></i>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => addDataRowAfterId(row.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#cbd5e1' }} title="Добавить строку"><i className="fas fa-plus-circle"></i></button>
                            <button onClick={() => deleteRow(row.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#cbd5e1' }} title="Удалить раздел"><i className="fas fa-trash-alt"></i></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {!row.collapsed && row.showTotals && (
                      <tr className="section-totals-row">
                        <td colSpan={6} style={{ textAlign: 'right', fontWeight: 600, padding: '10px 8px', color: 'var(--text-primary)' }}>Итого по разделу:</td>
                        <td className="text-center" style={{ fontWeight: 600, padding: '10px 8px', color: 'var(--text-primary)' }}>{formatNumber(sectionTotals.qty)}</td>
                        <td colSpan={4} style={{ padding: '10px 8px' }}></td>
                        <td className="text-right" style={{ fontWeight: 600, padding: '10px 8px', color: 'var(--text-primary)' }}>{formatNumber(sectionTotals.gross - sectionTotals.net)} ₽</td>
                        <td className="text-right" style={{ fontWeight: 600, padding: '10px 8px', color: 'var(--text-primary)' }}>{formatNumber(sectionTotals.gross)} ₽</td>
                        <td className="text-right" style={{ fontWeight: 600, padding: '10px 8px', color: 'var(--text-primary)' }}>{formatNumber(sectionTotals.net)} ₽</td>
                        <td colSpan={3} style={{ padding: '10px 8px' }}></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              } else if (row.type === 'data') {
                const visible = isDataRowVisible(row);
                if (visible) dataCounter++;
                const totalRub = getTotalRub(row);
                const sym = currencySymbols[row.currency];
                // Определяем, свернут ли раздел, к которому принадлежит строка
                let sectionCollapsed = false;
                for (let i = idx - 1; i >= 0; i--) {
                  if (array[i].type === 'section') {
                    sectionCollapsed = (array[i] as SectionRow).collapsed;
                    break;
                  }
                }
                if (sectionCollapsed) return null;
                return (
                  <tr key={row.id} className={`data-row ${!visible ? 'filtered-out' : ''}`} data-id={row.id}>
                    <td className="drag-handle"><i className="fas fa-grip-vertical"></i></td>
                    <td className="checkbox-col"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, row.id] : prev.filter(id => id !== row.id))} /></td>
                    <td className="text-center">{visible ? dataCounter : ''}</td>
                    <td><input type="text" value={row.vendor} onChange={e => updateDataField(row.id, 'vendor', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }} /></td>
                    <td className="word-break"><input type="text" value={row.sku} onChange={e => updateDataField(row.id, 'sku', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }} /></td>
                    <td className="word-break"><input type="text" value={row.name} onChange={e => updateDataField(row.id, 'name', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }} /></td>
                    <td className="text-center"><input type="number" value={row.quantity} onChange={e => updateDataField(row.id, 'quantity', parseInt(e.target.value) || 0)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }} /></td>
                    <td className="text-center"><select value={row.unit} onChange={e => updateDataField(row.id, 'unit', e.target.value)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}><option>шт</option><option>м</option><option>уп.</option></select></td>
                    <td className="text-center"><select value={row.currency} onChange={e => updateDataField(row.id, 'currency', e.target.value)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}>{currencies.map(c => <option key={c}>{c}</option>)}</select></td>
                    <td className="text-right"><input type="number" step="any" value={row.price} onChange={e => updateDataField(row.id, 'price', parseFloat(e.target.value) || 0)} style={{ width: '100%', textAlign: 'right', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }} /></td>
                    <td className="text-center"><input type="number" step="any" value={row.discount} onChange={e => updateDataField(row.id, 'discount', parseFloat(e.target.value) || 0)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }} /></td>
                    <td className="text-right readonly-cell" style={{ background: 'var(--card-bg)', fontWeight: 500, color: 'var(--text-primary)' }}>{sym} {formatNumber(row.discountAmount)}</td>
                    <td className="text-right readonly-cell" style={{ background: 'var(--card-bg)', fontWeight: 500, color: 'var(--text-primary)' }}>{sym} {formatNumber(row.priceAfter)}</td>
                    <td className="text-right readonly-cell" style={{ background: 'var(--card-bg)', fontWeight: 500, color: 'var(--text-primary)' }}>{formatNumber(totalRub)} ₽</td>
                    <td style={{ textAlign: 'center' }}><input type="text" value={row.supplier} onChange={e => updateDataField(row.id, 'supplier', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', color: 'var(--text-primary)' }} /></td>
                    <td className="text-center"><select value={row.status} onChange={e => updateDataField(row.id, 'status', e.target.value)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}>{statuses.map(s => <option key={s}>{s}</option>)}</select></td>
                    <td className="action-buttons">
                      <button onClick={() => addDataRowAfterId(row.id)} title="Добавить строку ниже"><i className="fas fa-plus-circle"></i></button>
                      <button onClick={() => duplicateRow(row.id)} title="Дублировать строку"><i className="fas fa-copy"></i></button>
                      <button onClick={() => deleteRow(row.id)} title="Удалить строку"><i className="fas fa-trash-alt"></i></button>
                    </td>
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>Итого по всем разделам:</td>
              <td className="text-center" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(totals.totalQty)}</td>
              <td colSpan={4} style={{ padding: '12px 8px' }}></td>
              <td className="text-right" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(totals.totalDiscountRub)} ₽</td>
              <td className="text-right" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(totals.totalGrossRub)} ₽</td>
              <td className="text-right" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(totals.totalRub)} ₽</td>
              <td colSpan={3} style={{ padding: '12px 8px' }}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
