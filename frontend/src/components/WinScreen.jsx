import React from 'react';

const WinScreen = ({ startGame }) => (
  <div className="overlay-screen">
    <div className="overlay-box">
      <h2>You Win! 🎉</h2>
      <button className="play-button" onClick={startGame}>Play Again</button>
    </div>
  </div>
);

export default WinScreen;
