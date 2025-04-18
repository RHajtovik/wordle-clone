import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './App.css';
import GameGrid from './components/gameGrid';
import WinScreen from './components/WinScreen';

function App() {
  // Game status
  const [gameStarted, setGameStarted] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Input/rows
  const [currentRow, setCurrentRow] = useState(0);
  const [guesses, setGuesses] = useState(Array(6).fill(''));
  const [tileStates, setTileStates] = useState(
    Array(6).fill().map(() => Array(5).fill({ letter: '', flip: false, color: '' }))
  );
  const [isFlipping, setIsFlipping] = useState(false);
  const disableInput = !gameStarted || hasWon || isFlipping;

  // Feedback
  const [shakeRow, setShakeRow] = useState(null);
  const [invalidText, setInvalidText] = useState('');

  const initializeGameState = () => {
    setGuesses(Array(6).fill(''));
    setTileStates(Array(6).fill().map(() => Array(5).fill({ letter: '', flip: false, color: '' })));
    setCurrentRow(0);
    setShakeRow(null);
    setInvalidText('');
    setHasWon(false);
    setIsFlipping(false);
    setGameStarted(true);
  };

  const startGame = async () => {
    try {
      const res = await fetch('http://localhost:4000/random-word');
      const data = await res.json();
      if (data.success) {
        initializeGameState();
      }
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  };

  const launchConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.4 },
      zIndex: 999
    });
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
      if (disableInput) return;

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

            setIsFlipping(true);

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
                // Delay win screen until flip finishes
                setTimeout(() => {
                  setHasWon(true);
                  launchConfetti();
                }, 250); // same as flip timing
              } else {
                if (currentRow < 5) {
                  setCurrentRow((prev) => prev + 1);
                }
              }

            setIsFlipping(false);
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
    <>
      <h1>Wordle Clone</h1>
      <div className={`invalid-text ${invalidText ? 'visible' : ''}`}>{invalidText}</div>
      <GameGrid tileStates={tileStates} guesses={guesses} shakeRow={shakeRow} />

      {/* Start game overlay */}
      {!gameStarted && (
        <div className="overlay-screen">
          <div className="overlay-box">
            <h2>Ready to play?</h2>
            <button className="play-button" onClick={startGame}>Play</button>
          </div>
        </div>
      )}

      {/* Win screen */}
      {hasWon && <WinScreen startGame={startGame} />}
    </>
  );
}

export default App;
