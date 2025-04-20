// server.js
const express = require('express');
const cors = require('cors');
const WordleGame = require('./wordleGame');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const game = new WordleGame();

app.get('/target', (req, res) => {
  res.json({ message: 'Target word is set.' });
});

app.get('/random-word', (req, res) => {
  game.pickRandomWord();
  res.json({ success: true });
});

app.post('/guess', async (req, res) => {
  const { word } = req.body;

  try {
    const result = await game.checkGuess(word);
    res.json(result);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ valid: false, correct: false, colors: [] });
  }
});

app.get('/reveal', (req, res) => {
  const word = game.getTargetWord();
  if (!word) {
    return res.status(400).json({ error: 'No word has been set yet.' });
  }
  res.json({ word });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
