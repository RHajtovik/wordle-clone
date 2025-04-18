import React from 'react';

const WinScreen = ({ startGame }) => (
  <div className="win-screen">
    <div className="win-box">
      <h2>You Win! 🎉</h2>
      <button onClick={startGame}>Play Again</button>
    </div>
  </div>
);

export default WinScreen;
