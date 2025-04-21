import { useState, useEffect} from 'react';
import confetti from 'canvas-confetti';
import './App.css';
import GameGrid from './components/GameGrid';
import WinScreen from './components/WinScreen';
import StartScreen from './components/StartScreen';
import LoseScreen from './components/LoseScreen';
import VirtualKeyboard from './components/VirtualKeyboard';

function App() {
  // Game status
  const [gameStarted, setGameStarted] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [targetWord, setTargetWord] = useState('');

  // Input/rows
  const [currentRow, setCurrentRow] = useState(0);
  const [guesses, setGuesses] = useState(Array(6).fill(''));
  const [tileStates, setTileStates] = useState(Array(6).fill().map(() => Array(5).fill({ letter: '', flip: false, color: '' })));

  // Feedback
  const [shakeRow, setShakeRow] = useState(null);
  const [invalidText, setInvalidText] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [keyColors, setKeyColors] = useState({});
  const disableInput = !gameStarted || hasWon || gameOver || isFlipping;

  // Backend URL
  const BASE_URL = 'https://wordle-clone-moer.onrender.com';

  const initializeGameState = () => {
    setGuesses(Array(6).fill(''));
    setTileStates(Array(6).fill().map(() => Array(5).fill({ letter: '', flip: false, color: '' })));
    setCurrentRow(0);
    setShakeRow(null);
    setInvalidText('');
    setHasWon(false);
    setIsFlipping(false);
    setKeyColors({});
    setGameStarted(true);
  };

  const startGame = async () => {
    try {
      const res = await fetch(`${BASE_URL}/random-word`, {
        credentials:'include'
      });
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
      const res = await fetch(`${BASE_URL}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
          setIsFlipping(true);

          checkGuessWithAPI(currentGuess).then((result) => {
            // Display error if result is not valid
            if (!result.valid) {
              console.log('Not a valid word:', currentGuess);

              setShakeRow(currentRow);
              setInvalidText('Invalid Word');

              setTimeout(() => {
                setShakeRow(null);
                setInvalidText('');
                setIsFlipping(false)
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

            // Update Keyboard
            result.colors.forEach((color, i) => {
              const letter = currentGuess[i];
              setKeyColors(prev => {
                const current = prev[letter];
                if (current === 'green') return prev; // don't downgrade
                if (current === 'yellow' && color === 'gray') return prev;
                return { ...prev, [letter]: color };
              });
            });

            // Move to next row after flips finish
            setTimeout(() => {
              if (result.correct) {
                // Show win screen after flips
                setTimeout(() => {
                  setHasWon(true);
                  launchConfetti();
                }, 250);
              } 
              else if (currentRow < 5) {
                // Proceed to next row
                setCurrentRow((prev) => prev + 1);
              } 
              else {
                // Game over - reveal word
                setTimeout(() => {
                  fetch(`${BASE_URL}/reveal`, { credentials: 'include' })
                    .then(res => res.json())
                    .then(data => {
                      setTargetWord(data.word);
                      setGameOver(true);
                    });
                }, 250);
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
    <>
      <div className='game-container'>
      <div className="title-wrapper">
        <h1 className="title">Wordle Clone</h1>
        <div className={`invalid-text ${invalidText ? 'visible' : ''}`}>{invalidText}</div>
      </div>

        {/* Game Grid */}
        <GameGrid tileStates={tileStates} guesses={guesses} shakeRow={shakeRow} />

        {/* Virtual Keyboard */}
        <VirtualKeyboard
          keyColors={keyColors}
          onKeyPress={(key) => window.dispatchEvent(new KeyboardEvent('keydown', { key }))}
          disabled={disableInput}
        />
        <p className='signiture'>Ryan Hajtovik - GoLinks 2025 Summer Intern</p>

        {/* Start game Overlay */}
        {!gameStarted && <StartScreen startGame={startGame} />}

        {/* Win screen Overlay */}
        {hasWon && <WinScreen startGame={startGame} />}

        {/* Lose screen Overlay */}
        {gameOver && <LoseScreen startGame={startGame} word={targetWord} />}
      </div>
    </>
  );
}

export default App;
