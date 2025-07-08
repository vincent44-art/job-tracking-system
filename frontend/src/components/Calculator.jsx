
import React, { useState } from 'react';

const Calculator = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEqual = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-80">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calculator</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
          <div className="text-right text-2xl font-mono text-gray-900 dark:text-white overflow-hidden">
            {display}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={clear}
            className="col-span-2 bg-red-500 hover:bg-red-600 text-white p-3 rounded font-semibold"
          >
            Clear
          </button>
          <button
            onClick={() => performOperation('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold"
          >
            ÷
          </button>
          <button
            onClick={() => performOperation('*')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold"
          >
            ×
          </button>
          
          {[7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => inputNumber(num)}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white p-3 rounded font-semibold"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => performOperation('-')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold"
          >
            -
          </button>
          
          {[4, 5, 6].map(num => (
            <button
              key={num}
              onClick={() => inputNumber(num)}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white p-3 rounded font-semibold"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => performOperation('+')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold"
          >
            +
          </button>
          
          {[1, 2, 3].map(num => (
            <button
              key={num}
              onClick={() => inputNumber(num)}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white p-3 rounded font-semibold"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleEqual}
            className="row-span-2 bg-green-500 hover:bg-green-600 text-white p-3 rounded font-semibold"
          >
            =
          </button>
          
          <button
            onClick={() => inputNumber(0)}
            className="col-span-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white p-3 rounded font-semibold"
          >
            0
          </button>
          <button
            onClick={inputDecimal}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white p-3 rounded font-semibold"
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
