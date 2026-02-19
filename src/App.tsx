import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import Sidebar from "./components/Sidebar";
import SidebarButton from "./components/SidebarButton";
import { useSidebar } from "./hooks/useSidebar";
import type { Ledger, Transaction, SummationMode, DataMode } from "./types";
import { MonthlyChart } from "./components/MonthlyChart";
import { parseCSV } from "./lib/csvProcessor";
import { DUMMY_LEDGER } from "./components/Sidebar/dummyData";
import { Toast, type ToastType } from "./components/Toast";
import { ConfirmationDialog } from "./components/ConfirmationDialog";

function App() {
  const { 
    sidebarWidth, 
    setSidebarWidth, 
    isCollapsed, 
    isTransitioning, 
    toggleCollapse 
  } = useSidebar(20);

  // Data mode: demo (shows dummy data), user (user's own data), clear (empty)
  const [dataMode, setDataMode] = useState<DataMode>(() => {
    const saved = localStorage.getItem('dataMode');
    if (saved && ['demo', 'user', 'clear'].includes(saved)) {
      return saved as DataMode;
    }
    return 'clear';
  });

  // User's ledger (stored in localStorage, or DUMMY_LEDGER if in demo mode)
  const [userLedger, setUserLedger] = useState<Ledger>(() => {
    const savedMode = localStorage.getItem('dataMode');
    if (savedMode === 'demo') {
      // If demo mode, load dummy data
      return [...DUMMY_LEDGER];
    }
    const saved = localStorage.getItem('ledger');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Save to localStorage whenever userLedger changes (only in non-demo mode)
  useEffect(() => {
    if (dataMode !== 'demo') {
      localStorage.setItem('ledger', JSON.stringify(userLedger));
    }
  }, [userLedger, dataMode]);

  // Single source of truth: effective ledger (always use userLedger, which gets populated differently based on mode)
  const ledger = userLedger;

  // Selected date from chart interaction
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Summation mode for chart
  const [summationMode, setSummationMode] = useState<SummationMode>('total');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Show toast helper
  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  // Show confirmation dialog helper
  const showConfirmDialog = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ message, onConfirm });
  };

  // Handle data mode changes
  const handleDataModeChange = (mode: DataMode) => {
    if (mode === 'clear') {
      showConfirmDialog('Are you sure you want to clear your data? This cannot be undone.', () => {
        // Clear data and switch to user mode (shows empty state)
        setUserLedger([]);
        localStorage.removeItem('ledger');
        setDataMode('user');
        localStorage.setItem('dataMode', 'user');
        showToast('Data cleared', 'success');
        setConfirmDialog(null);
      });
    } else if (mode === 'demo') {
      // Switch to demo mode - load fresh dummy data
      setDataMode('demo');
      localStorage.setItem('dataMode', 'demo');
      setUserLedger([...DUMMY_LEDGER]);
    } else {
      // User mode - load from localStorage
      setDataMode('user');
      localStorage.setItem('dataMode', 'user');
      const saved = localStorage.getItem('ledger');
      if (saved) {
        setUserLedger(JSON.parse(saved));
      } else {
        setUserLedger([]);
      }
    }
  };

  // Calculate totals
  const totalExpenses = ledger
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = ledger
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  // Calculate monthly and yearly averages by summing each month/year first, then averaging
  const { avgMonthlyExpenses, avgMonthlyIncome, avgMonthlyNet, avgYearlyExpenses, avgYearlyIncome, avgYearlyNet } = useMemo(() => {
    if (ledger.length === 0) {
      return {
        avgMonthlyExpenses: 0, avgMonthlyIncome: 0, avgMonthlyNet: 0,
        avgYearlyExpenses: 0, avgYearlyIncome: 0, avgYearlyNet: 0
      };
    }

    // Group by month (YYYY-MM)
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    // Group by year (YYYY)
    const yearlyData: Record<string, { income: number; expenses: number }> = {};

    ledger.forEach((transaction) => {
      const date = dayjs(transaction.date);
      const monthKey = date.format('YYYY-MM');
      const yearKey = date.format('YYYY');
      
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { income: 0, expenses: 0 };
      if (!yearlyData[yearKey]) yearlyData[yearKey] = { income: 0, expenses: 0 };
      
      if (transaction.amount > 0) {
        monthlyData[monthKey].income += transaction.amount;
        yearlyData[yearKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(transaction.amount);
        yearlyData[yearKey].expenses += Math.abs(transaction.amount);
      }
    });

    // Calculate average from monthly sums
    const monthCount = Object.keys(monthlyData).length;
    const monthSums = Object.values(monthlyData);
    const avgMonthlyExpenses = monthSums.reduce((sum, m) => sum + m.expenses, 0) / monthCount;
    const avgMonthlyIncome = monthSums.reduce((sum, m) => sum + m.income, 0) / monthCount;
    const avgMonthlyNet = avgMonthlyIncome - avgMonthlyExpenses;

    // Calculate average from yearly sums
    const yearCount = Object.keys(yearlyData).length;
    const yearSums = Object.values(yearlyData);
    const avgYearlyExpenses = yearSums.reduce((sum, y) => sum + y.expenses, 0) / yearCount;
    const avgYearlyIncome = yearSums.reduce((sum, y) => sum + y.income, 0) / yearCount;
    const avgYearlyNet = avgYearlyIncome - avgYearlyExpenses;

    return {
      avgMonthlyExpenses, avgMonthlyIncome, avgMonthlyNet,
      avgYearlyExpenses, avgYearlyIncome, avgYearlyNet
    };
  }, [ledger]);

  // Calculate display values based on summation mode
  const { displayExpenses, displayIncome, displayNet, labelPrefix } = useMemo(() => {
    let exp: number, inc: number, net: number, prefix: string;
    
    switch (summationMode) {
      case 'monthly':
        exp = avgMonthlyExpenses;
        inc = avgMonthlyIncome;
        net = avgMonthlyNet;
        prefix = 'Avg Monthly';
        break;
      case 'yearly':
        exp = avgYearlyExpenses;
        inc = avgYearlyIncome;
        net = avgYearlyNet;
        prefix = 'Avg Yearly';
        break;
      default:
        exp = totalExpenses;
        inc = totalIncome;
        net = netIncome;
        prefix = 'Total';
    }
    
    return { displayExpenses: exp, displayIncome: inc, displayNet: net, labelPrefix: prefix };
  }, [summationMode, avgMonthlyExpenses, avgMonthlyIncome, avgMonthlyNet, avgYearlyExpenses, avgYearlyIncome, avgYearlyNet, totalExpenses, totalIncome, netIncome]);

  const handleAddTransaction = (transaction: Transaction | Transaction[]) => {
    if (Array.isArray(transaction)) {
      setUserLedger([...userLedger, ...transaction]);
    } else {
      setUserLedger([...userLedger, transaction]);
    }
  };

  const handleRemoveTransaction = (id: string) => {
    // Find the transaction being deleted
    const transactionToDelete = userLedger.find(t => t.id === id);
    
    // If it has a recurringGroupId, delete all transactions with the same group ID
    if (transactionToDelete?.recurringGroupId) {
      setUserLedger(userLedger.filter(t => t.recurringGroupId !== transactionToDelete.recurringGroupId));
    } else {
      setUserLedger(userLedger.filter(t => t.id !== id));
    }
  };

  const handleCsvSelect = (contents: string[]) => {
    const allTransactions = contents.flatMap(content => parseCSV(content))
    setUserLedger([...userLedger, ...allTransactions])
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Confirmation dialog */}
      {confirmDialog && (
        <ConfirmationDialog 
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      <div className="flex w-screen min-h-screen">
    
      <div 
        className={`shrink-0 overflow-hidden h-screen ${isTransitioning ? 'transition-all duration-300' : ''}`}
        style={{ width: `${sidebarWidth}%`, minWidth: isCollapsed ? 0 : 498 }}
      >
        <Sidebar 
          currentWidth={sidebarWidth} 
          onResize={setSidebarWidth}
          ledger={ledger}
          onAdd={handleAddTransaction}
          onRemove={handleRemoveTransaction}
          onCsvSelect={handleCsvSelect}
          selectedDate={selectedDate}
          dataMode={dataMode}
          onDataModeChange={handleDataModeChange}
          showToast={showToast}
        />
      </div>

      <main className="flex-1 h-screen overflow-hidden flex flex-col">
        <div className="p-8 shrink-0">
          {/* Title and Toggle Sidebar Button on same line */}
          <div className="flex items-center gap-2 mb-4">
            <SidebarButton 
              isCollapsed={isCollapsed} 
              onClick={toggleCollapse} 
            />
            <h1 className="m-0 font-bold">Finance Wrapped</h1>
            <div className="ml-auto flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
              {(['yearly', 'monthly', 'total'] as SummationMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSummationMode(mode)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${
                    summationMode === mode
                      ? 'bg-blue-500/20 text-blue-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Total Expenses */}
            <div className="card-main">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">{labelPrefix} Expenses</h3>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(displayExpenses)}</p>
            </div>

            {/* Total Income */}
            <div className="card-main">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">{labelPrefix} Income</h3>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(displayIncome)}</p>
            </div>

            {/* Net Income */}
            <div className="card-main">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">{labelPrefix} Net Income</h3>
              <p className={`text-2xl font-bold ${displayNet >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatCurrency(displayNet)}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Chart - takes remaining space */}
        <div className="flex-1 px-8 pb-8 min-h-0">
          <MonthlyChart ledger={ledger} onDateSelect={setSelectedDate} summationMode={summationMode} />
        </div>
      </main>
    </div>
    </>
  );
}

export default App;
