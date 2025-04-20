import React from 'react';

const LoseScreen = ({ startGame }) => (
  <div className="overlay-screen">
    <div className="overlay-box">
      <h2>You Lose! 😢</h2>
      <p>The word was: <strong>{word}</strong></p>
      <button className="play-button" onClick={startGame}>Try Again</button>
    </div>
  </div>
);

export default LoseScreen;
