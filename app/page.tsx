'use client';

import { useState, useEffect } from 'react';
import { Entry, FieldErrors } from './lib/types';
import { validateName, validateNumericField, validateInputRanges } from './lib/validation';
import { calculateCommission as calculateCommissionAPI } from './lib/api';

export default function Home() {
  const [name, setName] = useState('');
  const [locks, setLocks] = useState('');
  const [stocks, setStocks] = useState('');
  const [barrels, setBarrels] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('commissionEntries');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [entryCount, setEntryCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('commissionEntryCount');
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    name: '',
    locks: '',
    stocks: '',
    barrels: ''
  });

  // Save entries to localStorage when they change
  useEffect(() => {
    localStorage.setItem('commissionEntries', JSON.stringify(entries));
    localStorage.setItem('commissionEntryCount', entryCount.toString());
  }, [entries, entryCount]);

  const handleCalculate = async () => {
    // Validate all fields using imported validation functions (client-side validation)
    const nameError = validateName(name);
    const locksError = validateNumericField(locks, 'Locks');
    const stocksError = validateNumericField(stocks, 'Stocks');
    const barrelsError = validateNumericField(barrels, 'Barrels');

    const newFieldErrors: FieldErrors = {
      name: nameError,
      locks: locksError,
      stocks: stocksError,
      barrels: barrelsError
    };
    setFieldErrors(newFieldErrors);
    
    const l = parseInt(locks) || 0;
    const s = parseInt(stocks) || 0;
    const b = parseInt(barrels) || 0;
    
    // Collect all errors for the entry
    const allErrors: string[] = [];
    if (nameError) allErrors.push(nameError);
    if (locksError) allErrors.push(locksError);
    if (stocksError) allErrors.push(stocksError);
    if (barrelsError) allErrors.push(barrelsError);
    
    // Also check range validation
    const rangeErrors = validateInputRanges(l, s, b);
    allErrors.push(...rangeErrors);
    
    const isClientValid = allErrors.length === 0;
    
    // If client-side validation fails, add entry with errors but don't call API
    if (!isClientValid) {
      const newEntry: Entry = {
        id: entryCount + 1,
        name: name || 'Employee',
        locks: l,
        stocks: s,
        barrels: b,
        sales: 0,
        commission: 0,
        isValid: false,
        errors: allErrors
      };
      
      setEntries([...entries, newEntry]);
      setEntryCount(entryCount + 1);
      return;
    }
    
    // Call API for calculation (backend handles its own validation as security layer)
    setIsLoading(true);
    try {
      const response = await calculateCommissionAPI({
        name: name.trim(),
        locks: l,
        stocks: s,
        barrels: b
      });
      
      if (response.success && response.data) {
        const newEntry: Entry = {
          id: entryCount + 1,
          name: response.data.name,
          locks: response.data.locks,
          stocks: response.data.stocks,
          barrels: response.data.barrels,
          sales: response.data.sales,
          commission: response.data.commission,
          isValid: true,
          errors: []
        };
        
        setEntries([...entries, newEntry]);
        setEntryCount(entryCount + 1);
      } else {
        // Backend validation failed
        const newEntry: Entry = {
          id: entryCount + 1,
          name: name || 'Employee',
          locks: l,
          stocks: s,
          barrels: b,
          sales: 0,
          commission: 0,
          isValid: false,
          errors: response.errors || ['Unknown error from server']
        };
        
        setEntries([...entries, newEntry]);
        setEntryCount(entryCount + 1);
      }
    } catch (error) {
      const newEntry: Entry = {
        id: entryCount + 1,
        name: name || 'Employee',
        locks: l,
        stocks: s,
        barrels: b,
        sales: 0,
        commission: 0,
        isValid: false,
        errors: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
      
      setEntries([...entries, newEntry]);
      setEntryCount(entryCount + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setLocks('');
    setStocks('');
    setBarrels('');
    setFieldErrors({ name: '', locks: '', stocks: '', barrels: '' });
  };

  const handleClearHistory = () => {
    setEntries([]);
    setEntryCount(0);
    localStorage.removeItem('commissionEntries');
    localStorage.removeItem('commissionEntryCount');
  };

  const handleDeleteEntry = (id: number) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  // Calculate totals from valid entries only
  const validEntries = entries.filter(e => e.isValid);

  return (
    <div className="calculator-container">
      <h1 className="calculator-title">โปรแกรมคำนวณค่าคอมมิชชั่น</h1>
      
      {/* Input Form */}
      <div className="form-group">
        <label className="form-label">ชื่อพนักงาน</label>
        <input
          type="text"
          className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
          placeholder="ตัวอย่างเช่น Ken หรือ ฐากูร"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
          }}
          disabled={isLoading}
        />
        {fieldErrors.name && <div className="field-error-message">{fieldErrors.name}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Locks</label>
        <input
          type="number"
          className={`form-input ${fieldErrors.locks ? 'input-error' : ''}`}
          placeholder="ใส่ได้สูงสุด 70 และ ไม่ต่ำกว่า 1 ต้องเป็นตัวเลขเท่านั้น"
          value={locks}
          onChange={(e) => {
            setLocks(e.target.value);
            if (fieldErrors.locks) setFieldErrors(prev => ({ ...prev, locks: '' }));
          }}
          min="1"
          max="70"
          disabled={isLoading}
        />
        {fieldErrors.locks && <div className="field-error-message">{fieldErrors.locks}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Stocks</label>
        <input
          type="number"
          className={`form-input ${fieldErrors.stocks ? 'input-error' : ''}`}
          placeholder="ใส่ได้สูงสุด 80 และ ไม่ต่ำกว่า 1 ต้องเป็นตัวเลขเท่านั้น"
          value={stocks}
          onChange={(e) => {
            setStocks(e.target.value);
            if (fieldErrors.stocks) setFieldErrors(prev => ({ ...prev, stocks: '' }));
          }}
          min="1"
          max="80"
          disabled={isLoading}
        />
        {fieldErrors.stocks && <div className="field-error-message">{fieldErrors.stocks}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Barrels</label>
        <input
          type="number"
          className={`form-input ${fieldErrors.barrels ? 'input-error' : ''}`}
          placeholder="ใส่ได้สูงสุด 90 และ ไม่ต่ำกว่า 1 ต้องเป็นตัวเลขเท่านั้น"
          value={barrels}
          onChange={(e) => {
            setBarrels(e.target.value);
            if (fieldErrors.barrels) setFieldErrors(prev => ({ ...prev, barrels: '' }));
          }}
          min="1"
          max="90"
          disabled={isLoading}
        />
        {fieldErrors.barrels && <div className="field-error-message">{fieldErrors.barrels}</div>}
      </div>
      
      {/* Buttons */}
      <div className="button-group">
        <button 
          className="btn btn-calculate" 
          onClick={handleCalculate}
          disabled={isLoading}
        >
          {isLoading ? 'กำลังคำนวณ...' : 'คำนวณ'}
        </button>
        <button 
          className="btn btn-reset" 
          onClick={handleReset}
          disabled={isLoading}
        >
          เคลียร์ข้อมูล
        </button>
      </div>
      
      {/* Results Section */}
      {entries.length > 0 ? (
        <>
          {/* Results Table */}
          <div className="table-scroll-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>รายการที่</th>
                  <th>ชื่อพนักงาน</th>
                  <th>ยอดขาย</th>
                  <th>ค่าคอมมิชชั่น</th>
                </tr>
              </thead>
              <tbody>
                {validEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>{entry.name}</td>
                    <td>{entry.sales} ฿</td>
                    <td>{entry.commission} ฿</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* History Section */}
          <div className="history-section">
            <div className="history-header">
              <span className="history-title">ประวัติการคำนวณ</span>
              <button 
                className="btn-clear-all" 
                onClick={handleClearHistory}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                เคลียร์ประวัติทั้งหมด
              </button>
            </div>
            
            <div className="history-list">
              {entries.map((entry) => (
                <div key={entry.id} className={`history-item ${!entry.isValid ? 'history-item-error' : ''}`}>
                  <div className="history-item-left">
                    <span className="history-item-number">รายการที่ {entry.id}</span>
                  </div>
                  <div className="history-item-center">
                    <div className="history-item-details">
                      <span>ชื่อพนักงาน : {entry.name}</span>
                      <span className="history-item-sales">ยอดขาย : {entry.sales} ฿</span>
                    </div>
                    <div className="history-item-inputs">
                      <span className={!entry.isValid && entry.errors.some(e => e.includes('Locks')) ? 'error-text' : ''}>
                        Locks : {entry.locks}
                      </span>
                      <span className={!entry.isValid && entry.errors.some(e => e.includes('Stocks')) ? 'error-text' : ''}>
                        Stocks : {entry.stocks}
                      </span>
                      <span className={!entry.isValid && entry.errors.some(e => e.includes('Barrels')) ? 'error-text' : ''}>
                        Barrels : {entry.barrels}
                      </span>
                      <span className="history-item-commission">ค่าคอมมิชชั่น : {entry.commission} ฿</span>
                    </div>
                    {!entry.isValid && (
                      <div className="history-item-error-msg">ข้อมูลไม่ถูกต้อง</div>
                    )}
                  </div>
                  <div className="history-item-right">
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDeleteEntry(entry.id)}
                      title="ลบรายการนี้"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Empty State - Show clock icon */
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <p className="empty-state-text">ประวัติการคำนวณจะโชว์หลังจากการคำนวณ</p>
        </div>
      )}
    </div>
  );
}
