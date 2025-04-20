import React from 'react';

const GameGrid = ({ tileStates, guesses, shakeRow }) => (
  <div className="grid">
    {tileStates.map((row, rowIndex) => (
      <div className={`row ${shakeRow === rowIndex ? 'shake' : ''}`} key={rowIndex}>
        {row.map((tile, colIndex) => (
          <div className="tile-wrapper" key={colIndex}>
            <div className={`tile-inner ${tile.flip ? 'flip' : ''}`}>
              <div className="tile-front">{guesses[rowIndex][colIndex] || ''}</div>
              <div className={`tile-back ${tile.color}`}>{tile.letter}</div>
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default GameGrid;
