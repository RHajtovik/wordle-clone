import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentRow, setCurrentRow] = useState(0);
  const [guesses, setGuesses] = useState(Array(6).fill(''));
  const [tileStates, setTileStates] = useState(
    Array(6).fill().map(() => Array(5).fill({ letter: '', flip: false, color: '' }))
  );
  const [shakeRow, setShakeRow] = useState(null);
  const [invalidText, setInvalidText] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = async () => {
    try {
      const res = await fetch('http://localhost:4000/random-word');
      const data = await res.json();
      if (data.success) {
        setGameStarted(true);
      }
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  };

  const checkGuessWithAPI = async (word) => {
    try {
      const res = await fetch('http://localhost:4000/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
      return await res.json();
    } catch (err) {
      console.error('Error talking to backend:', err);
      return { valid: false, correct: false, colors: [] };
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(key) && key !== 'BACKSPACE' && key !== 'ENTER') return;

      const currentGuess = guesses[currentRow];

      if (key === 'ENTER') {
        if (currentGuess.length === 5) {
          checkGuessWithAPI(currentGuess).then((result) => {
            if (!result.valid) {
              console.log('Not a valid word:', currentGuess);

              setShakeRow(currentRow);
              setInvalidText('Invalid Word');

              setTimeout(() => {
                setShakeRow(null);
                setInvalidText('');
              }, 600);

              return;
            }

            // Update each tile with letter + flip + color (one-by-one)
            result.colors.forEach((color, i) => {
              setTimeout(() => {
                setTileStates((prev) => {
                  const updated = prev.map((row) => [...row]);
                  updated[currentRow][i] = {
                    letter: currentGuess[i],
                    flip: true,
                    color: color
                  };
                  return updated;
                });
              }, i * 500); // delay each flip
            });

            // Move to next row after flips finish
            setTimeout(() => {
              if (result.correct) {
                console.log('Correct guess!');
              } else {
                console.log('Wrong guess:', currentGuess);
              }

              if (currentRow < 5) {
                setCurrentRow((prev) => prev + 1);
              }
            }, 5 * 500);
          });
        }
        return;
      }

      if (key === 'BACKSPACE') {
        const updated = [...guesses];
        updated[currentRow] = currentGuess.slice(0, -1);
        setGuesses(updated);
        return;
      }

      if (currentGuess.length < 5) {
        const updated = [...guesses];
        updated[currentRow] = currentGuess + key;
        setGuesses(updated);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guesses, currentRow]);

  return (
    <div className="game-container">
      {!gameStarted ? (
        <div className="home-screen">
          <h1>Wordle Clone</h1>
          <button className="play-button" onClick={startGame}>Play</button>
        </div>
      ) : (
        <>
          <h1>Wordle Clone</h1>
          <div className={`invalid-text ${invalidText ? 'visible' : ''}`}>
            {invalidText}
          </div>
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
        </>
      )}
    </div>
  );
}

export default App;
