import React, { useState, useEffect } from 'react';
import { CalculatorDef } from '../services/calculatorService';
import { evaluateSafeFormula } from '../../shared/utils/safeFormula';
import { Play, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  calculator: Partial<CalculatorDef>;
}

export const CalculatorTestPanel: React.FC<Props> = ({ calculator }) => {
  const [testValues, setTestValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value?: number; error?: string } | null>(null);

  useEffect(() => {
    const initial: Record<string, string> = {};
    calculator.inputs?.forEach(input => {
      initial[input.key] = '';
    });
    setTestValues(initial);
    setResult(null);
  }, [calculator.inputs]);

  const handleTest = () => {
    if (!calculator.formula) return;
    
    const numericValues: Record<string, number> = {};
    for (const key in testValues) {
      numericValues[key] = parseFloat(testValues[key]) || 0;
    }

    const res = evaluateSafeFormula(calculator.formula, numericValues);
    if (res.success) {
      setResult({ value: res.value });
    } else {
      setResult({ error: res.error });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Play size={14} className="text-primary-600" /> Live Test Panel
      </h4>

      <div className="space-y-4">
        {calculator.inputs?.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Add inputs to test the formula.</p>
        ) : (
          calculator.inputs?.map(input => (
            <div key={input.key} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">{input.label} ({input.unit || 'unit'})</label>
              <input 
                type="number"
                value={testValues[input.key] || ''}
                onChange={e => setTestValues(prev => ({ ...prev, [input.key]: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                placeholder={`Enter ${input.key}...`}
              />
            </div>
          ))
        )}

        <button 
          onClick={handleTest}
          disabled={!calculator.formula}
          className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest mt-4 shadow-lg disabled:opacity-30"
        >
          Compute Result
        </button>

        {result && (
          <div className="mt-6 p-4 rounded-2xl animate-fade-in border flex items-start gap-3 bg-white dark:bg-slate-900">
            {result.error ? (
              <>
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <div>
                  <p className="text-[10px] font-black text-red-500 uppercase">Calculation Error</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{result.error}</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                <div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase">Computed {calculator.result?.label || 'Value'}</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    {result.value?.toFixed(calculator.result?.precision ?? 2)} {calculator.result?.unit}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
