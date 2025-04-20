import React from 'react';
import '../App.css';

const rows = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['ENTER','Z','X','C','V','B','N','M','BACKSPACE']
];

const VirtualKeyboard = ({ keyColors, onKeyPress, disabled }) => {
return (
    <div className="keyboard">
    {rows.map((row, rowIndex) => (
        <div className="keyboard-row" key={rowIndex}>
        {row.map((key) => (
            <button
            key={key}
            className={`key ${keyColors[key] || ''} ${key === 'ENTER' || key === 'BACKSPACE' ? 'key-wide' : ''}`}
            onClick={() => !disabled && onKeyPress(key)}
            disabled={disabled}
            >
            {key === 'BACKSPACE' ? '⌫' : key}
            </button>
        ))}
        </div>
    ))}
    </div>
);
};

export default VirtualKeyboard;