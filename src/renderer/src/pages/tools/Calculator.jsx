import { useState } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const clearAll = () => {
    setDisplay('0'); setPrevValue(null); setOperator(null); setWaitingForOperand(false);
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display);
    if (prevValue == null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let newValue;
      switch (operator) {
        case '+': newValue = currentValue + inputValue; break;
        case '-': newValue = currentValue - inputValue; break;
        case '*': newValue = currentValue * inputValue; break;
        case '/': newValue = currentValue / inputValue; break;
        default: newValue = inputValue;
      }
      setPrevValue(newValue);
      setDisplay(String(newValue));
    }
    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = () => {
    performOperation(null);
  };

  const btnClass = 'bg-navy-lighter hover:bg-navy-border text-white font-heading font-bold text-lg rounded-lg transition-all active:scale-95';

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Calculator</h2>
      <div className="card max-w-sm mx-auto">
        <div className="bg-navy-lighter rounded-lg p-4 mb-4 text-right">
          <div className="text-3xl font-heading font-bold text-white">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button onClick={clearAll} className={`${btnClass} bg-red-500/20 text-red-400 col-span-2`}>AC</button>
          <button onClick={() => setDisplay(display.slice(0, -1) || '0')} className={btnClass}>C</button>
          <button onClick={() => performOperation('/')} className={`${btnClass} ${operator === '/' ? 'bg-accent text-navy' : ''}`}>÷</button>

          <button onClick={() => inputDigit(7)} className={btnClass}>7</button>
          <button onClick={() => inputDigit(8)} className={btnClass}>8</button>
          <button onClick={() => inputDigit(9)} className={btnClass}>9</button>
          <button onClick={() => performOperation('*')} className={`${btnClass} ${operator === '*' ? 'bg-accent text-navy' : ''}`}>×</button>

          <button onClick={() => inputDigit(4)} className={btnClass}>4</button>
          <button onClick={() => inputDigit(5)} className={btnClass}>5</button>
          <button onClick={() => inputDigit(6)} className={btnClass}>6</button>
          <button onClick={() => performOperation('-')} className={`${btnClass} ${operator === '-' ? 'bg-accent text-navy' : ''}`}>−</button>

          <button onClick={() => inputDigit(1)} className={btnClass}>1</button>
          <button onClick={() => inputDigit(2)} className={btnClass}>2</button>
          <button onClick={() => inputDigit(3)} className={btnClass}>3</button>
          <button onClick={() => performOperation('+')} className={`${btnClass} ${operator === '+' ? 'bg-accent text-navy' : ''}`}>+</button>

          <button onClick={() => inputDigit(0)} className={`${btnClass} col-span-2`}>0</button>
          <button onClick={inputDecimal} className={btnClass}>.</button>
          <button onClick={calculate} className={`${btnClass} bg-accent text-navy hover:bg-accent-hover`}>=</button>
        </div>
      </div>
    </div>
  );
}
