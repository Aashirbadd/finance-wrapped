import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import SidebarButton from "./components/SidebarButton";
import { useSidebar } from "./hooks/useSidebar";
import type { Ledger, Transaction, SummationMode } from "./types";
import { DUMMY_LEDGER } from "./components/Sidebar/dummyData";
import { MonthlyChart } from "./components/MonthlyChart";
import { parseCSV } from "./lib/csvProcessor";

function App() {
  const { 
    sidebarWidth, 
    setSidebarWidth, 
    isCollapsed, 
    isTransitioning, 
    toggleCollapse 
  } = useSidebar(20);

  // Load from localStorage or use dummy data
  const [ledger, setLedger] = useState<Ledger>(() => {
    const saved = localStorage.getItem('ledger');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Save to localStorage whenever ledger changes
  useEffect(() => {
    localStorage.setItem('ledger', JSON.stringify(ledger));
  }, [ledger]);

  // Selected date from chart interaction
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Summation mode for chart
  const [summationMode, setSummationMode] = useState<SummationMode>('total');

  // Calculate totals
  const totalExpenses = ledger
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = ledger
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  const handleAddTransaction = (transaction: Transaction) => {
    setLedger([...ledger, transaction]);
  };

  const handleRemoveTransaction = (id: string) => {
    setLedger(ledger.filter(t => t.id !== id));
  };

  const handleCsvSelect = (content: string) => {
    const transactions = parseCSV(content);
    setLedger([...ledger, ...transactions]);
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
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
              <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
            </div>

            {/* Total Income */}
            <div className="card-main">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Total Income</h3>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
            </div>

            {/* Net Income */}
            <div className="card-main">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Net Income</h3>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatCurrency(netIncome)}
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
  );
}

export default App;
