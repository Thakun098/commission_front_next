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

  // Calculate totals from valid entries only
  const validEntries = entries.filter(e => e.isValid);
  const totalSales = validEntries.reduce((sum, e) => sum + e.sales, 0);
  const totalCommission = validEntries.reduce((sum, e) => sum + e.commission, 0);

  return (
    <div className="calculator-container">
      <h1 className="calculator-title">Commission Calculator</h1>
      
      {/* Input Form */}
      <div className="form-group">
        <label className="form-label">Employee Name</label>
        <input
          type="text"
          className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
          placeholder="Enter name"
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
        <label className="form-label">Locks (1-70)</label>
        <input
          type="number"
          className={`form-input ${fieldErrors.locks ? 'input-error' : ''}`}
          placeholder="Enter locks sales"
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
        <label className="form-label">Stocks (1-80)</label>
        <input
          type="number"
          className={`form-input ${fieldErrors.stocks ? 'input-error' : ''}`}
          placeholder="Enter stocks sales"
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
        <label className="form-label">Barrels (1-90)</label>
        <input
          type="number"
          className={`form-input ${fieldErrors.barrels ? 'input-error' : ''}`}
          placeholder="Enter barrels sales"
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
          {isLoading ? 'Computing...' : 'Compute'}
        </button>
        <button 
          className="btn btn-reset" 
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset
        </button>
      </div>
      
      {entries.length > 0 && (
        <div className="button-group">
          <button 
            className="btn btn-clear-history" 
            onClick={handleClearHistory}
            disabled={isLoading}
          >
            Clear History
          </button>
        </div>
      )}
      
      {/* Results Table */}
      {entries.length > 0 && (
        <>
          <div className="table-scroll-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Sales</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {validEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>No.{entry.id}</td>
                    <td>{entry.sales}</td>
                    <td>{entry.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Summary Table */}
          <table className="summary-table">
            <thead>
              <tr>
                <th>Total Sales</th>
                <th>Total Commission</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{totalSales}</td>
                <td>{totalCommission}</td>
              </tr>
            </tbody>
          </table>
          
          {/* Detailed Info Box */}
          <div className="info-box">
            {entries.map((entry) => (
              <div key={entry.id} className="entry">
                <div className="entry-header">Number #{entry.id}</div>
                <div className="entry-name">Name: {entry.name}</div>
                <div className="entry-details">
                  <span className={!entry.isValid && entry.errors.some(e => e.includes('Locks')) ? 'error-text' : ''}>
                    Locks: {entry.locks}
                  </span>
                  <span className={!entry.isValid && entry.errors.some(e => e.includes('Stocks')) ? 'error-text' : ''}>
                    Stocks: {entry.stocks}
                  </span>
                  <span className={!entry.isValid && entry.errors.some(e => e.includes('Barrels')) ? 'error-text' : ''}>
                    Barrels: {entry.barrels}
                  </span>
                </div>
                {entry.isValid ? (
                  <>
                    <div className="entry-sales">Sales: ${entry.sales}</div>
                    <div className="entry-commission">Commission: ${entry.commission}</div>
                  </>
                ) : (
                  <div className="error-text">Invalid Input</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
