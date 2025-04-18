const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

let targetWord = '';
const wordList = ['REACT', 'GHOST', 'PLANT', 'FRAME', 'TRUCK'];

// Serve the target word (optional: obfuscate or hide from frontend)
app.get('/target', (req, res) => {
  res.json({ message: 'Target word is set.' }); // Don't expose word here in real game
});

app.get('/random-word', (req, res) => {
  const random = wordList[Math.floor(Math.random() * wordList.length)];
  targetWord = random.toUpperCase(); // update global
  res.json({ success: true });
});

// Check a user's guess
app.post('/guess', async (req, res) => {
  const { word } = req.body;
  const target = targetWord.toUpperCase();
  const guess = word.toUpperCase();

  try {
    const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`);
    const isValidWord = dictRes.ok;

    if (!isValidWord) {
      return res.json({ valid: false, correct: false, colors: [] });
    }

    const colors = Array(5).fill('gray');
    const letterCount = {};

    // Count letters in the target word
    for (let char of target) {
      letterCount[char] = (letterCount[char] || 0) + 1;
    }

    // First pass: green pass (correct letters, correct position)
    for (let i = 0; i < 5; i++) {
      if (guess[i] === target[i]) {
        colors[i] = 'green';
        letterCount[guess[i]]--;
      }
    }

    // Second pass: yellow pass (correct letters, wrong position)
    for (let i = 0; i < 5; i++) {
      if (colors[i] === 'gray' && letterCount[guess[i]] > 0) {
        colors[i] = 'yellow';
        letterCount[guess[i]]--;
      }
    }

    res.json({
      valid: true,
      correct: guess === target,
      colors,
    });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ valid: false, correct: false, colors: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
