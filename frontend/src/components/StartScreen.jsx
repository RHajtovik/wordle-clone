import React from 'react';

const StartScreen = ({ startGame }) => (
  <div className="overlay-screen">
    <div className="overlay-box">
      <h2>Ready to play?</h2>
      <button className="play-button" onClick={startGame}>Play</button>
    </div>
  </div>
);

export default StartScreen;