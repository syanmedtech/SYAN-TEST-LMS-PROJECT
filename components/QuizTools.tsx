
import React, { useState } from 'react';
import { X, Save, Eraser, Calculator as CalcIcon, FileText, StickyNote } from 'lucide-react';

/* --- NOTES MODAL --- */
export const NotesModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    note: string; 
    onSave: (note: string) => void; 
}> = ({ isOpen, onClose, note, onSave }) => {
    const [text, setText] = useState(note);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
                <div className="bg-amber-100 p-4 flex justify-between items-center border-b border-amber-200">
                    <h3 className="font-bold text-amber-800 flex items-center gap-2">
                        <StickyNote size={20} /> My Notes
                    </h3>
                    <button onClick={onClose} className="text-amber-800 hover:bg-amber-200 p-1 rounded-full"><X size={20}/></button>
                </div>
                <div className="p-4">
                    <textarea 
                        className="w-full h-48 p-4 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none text-slate-800 placeholder-slate-400"
                        placeholder="Type your observations or mnemonics here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                    <button onClick={() => setText('')} className="text-red-500 text-sm font-bold flex items-center gap-1 hover:text-red-700">
                        <Eraser size={16} /> Clear
                    </button>
                    <button 
                        onClick={() => { onSave(text); onClose(); }} 
                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center gap-2"
                    >
                        <Save size={16} /> Save Note
                    </button>
                </div>
            </div>
        </div>
    );
};

/* --- SIMPLE CALCULATOR --- */
export const Calculator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleNum = (num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOp = (op: string) => {
    setEquation(`${display} ${op} `);
    setIsNewNumber(true);
  };

  const calculate = () => {
    try {
      const fullEq = equation + display;
      // eslint-disable-next-line no-eval
      const result = eval(fullEq.replace('x', '*').replace('÷', '/'));
      setDisplay(String(result).slice(0, 10));
      setEquation('');
      setIsNewNumber(true);
    } catch (e) {
      setDisplay('Error');
      setIsNewNumber(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  };

  const btns = [
    { label: 'C', onClick: clear, span: 1, bg: 'bg-red-50 text-red-600 hover:bg-red-100' },
    { label: '÷', onClick: () => handleOp('/'), span: 1, bg: 'bg-slate-100 text-primary-600 hover:bg-slate-200' },
    { label: 'x', onClick: () => handleOp('*'), span: 1, bg: 'bg-slate-100 text-primary-600 hover:bg-slate-200' },
    { label: '-', onClick: () => handleOp('-'), span: 1, bg: 'bg-slate-100 text-primary-600 hover:bg-slate-200' },
    { label: '7', onClick: () => handleNum('7'), span: 1, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
    { label: '8', onClick: () => handleNum('8'), span: 1, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
    { label: '9', onClick: () => handleNum('9'), span: 1, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
    { label: '+', onClick: () => handleOp('+'), span: 1, bg: 'bg-slate-100 text-primary-600 hover:bg-slate-200' },
    { label: '4', onClick: () => handleNum('4'), span: 1, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
    { label: '5', onClick: () => handleNum('5'), span: 1, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
    { label: '6', onClick: () => handleNum('6'), span: 1, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
    { label: '=', onClick: calculate, span: 1, rowSpan: 2, bg: 'bg-primary-600 text-white hover:bg-primary-700' },
    { label: '1', onClick: () => handleNum('1'), span: 1, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
    { label: '2', onClick: () => handleNum('2'), span: 1, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
    { label: '3', onClick: () => handleNum('3'), span: 1, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
    { label: '0', onClick: () => handleNum('0'), span: 2, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
    { label: '.', onClick: () => handleNum('.'), span: 1, bg: 'bg-white hover:bg-slate-50 text-slate-700' },
  ];

  return (
    <div className="fixed bottom-20 right-4 md:right-20 md:bottom-auto md:top-24 z-[60] animate-fade-in shadow-2xl rounded-2xl overflow-hidden border border-slate-200 w-72 font-mono">
      <div className="bg-slate-800 p-3 flex justify-between items-center text-white cursor-move">
        <h3 className="font-bold flex items-center gap-2 text-sm"><CalcIcon size={16}/> Calculator</h3>
        <button onClick={onClose} className="hover:text-red-300"><X size={16}/></button>
      </div>
      <div className="p-4 bg-slate-100">
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-4 text-right shadow-inner h-16 flex flex-col justify-center">
            <span className="text-xs text-slate-400 h-4 block">{equation}</span>
            <span className="text-2xl text-slate-800 font-bold block truncate">{display}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
           {btns.map((btn, i) => (
             <button
               key={i}
               onClick={btn.onClick}
               className={`${btn.bg} rounded-lg p-3 font-bold text-sm shadow-sm active:scale-95 transition-all ${btn.span === 2 ? 'col-span-2' : ''} ${btn.rowSpan === 2 ? 'row-span-2 h-full' : ''}`}
             >
               {btn.label}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

/* --- LAB VALUES --- */
export const LabValues: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const categories = [
    { name: 'Blood', values: [
        { l: 'Hemoglobin (Male)', v: '13.5-17.5 g/dL' },
        { l: 'Hemoglobin (Female)', v: '12.0-15.5 g/dL' },
        { l: 'WBC', v: '4,500-11,000 /µL' },
        { l: 'Platelets', v: '150k-450k /µL' },
    ]},
    { name: 'Electrolytes', values: [
        { l: 'Sodium (Na)', v: '135-145 mEq/L' },
        { l: 'Potassium (K)', v: '3.5-5.0 mEq/L' },
        { l: 'Chloride (Cl)', v: '96-106 mEq/L' },
        { l: 'Bicarb (HCO3)', v: '22-29 mEq/L' },
        { l: 'Calcium', v: '8.5-10.2 mg/dL' },
    ]},
    { name: 'Kidney', values: [
        { l: 'BUN', v: '7-20 mg/dL' },
        { l: 'Creatinine', v: '0.6-1.2 mg/dL' },
    ]}
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-primary-600 to-primary-500 text-white">
           <h3 className="font-bold flex items-center gap-2"><FileText size={18}/> Normal Lab Values</h3>
           <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-slate-50">
            {categories.map(cat => (
                <div key={cat.name} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <h4 className="bg-slate-100 px-4 py-2 font-bold text-slate-700 text-sm border-b border-slate-200">{cat.name}</h4>
                    <div className="divide-y divide-slate-100">
                        {cat.values.map((item, idx) => (
                            <div key={idx} className="flex justify-between px-4 py-3 text-sm">
                                <span className="text-slate-600 font-medium">{item.l}</span>
                                <span className="font-mono text-slate-800 font-bold">{item.v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
