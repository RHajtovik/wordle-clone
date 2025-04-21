const express = require('express');
const session = require('express-session');
const cors = require('cors');
const WordleGame = require('./wordleGame');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'https://main.dld996lhzd3lh.amplifyapp.com',
  credentials: true 
}));
app.use(express.json());

app.set('trust proxy', 1);

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none',
    path: '/',
    httpOnly: true,
    domain: '.rakun.company'
  }
}));

const game = new WordleGame();

app.get('/target', (req, res) => {
  res.json({ message: 'Target word is set.' });
});

app.get('/random-word', async (req, res) => {
  try {
    const word = await game.pickRandomWord();
    req.session.targetWord = word;
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to pick random word:', err);
    res.status(500).json({ success: false });
  }
});

app.post('/guess', async (req, res) => {
  console.log('Incoming guess:', req.body.word);
  console.log('Session word:', req.session.targetWord);

  const guess = req.body.word;
  const target = req.session.targetWord;

  if (!target) {
    return res.status(400).json({ error: 'Game not initialized' });
  }

  try {
    const result = await game.checkGuess(guess, target);
    res.json(result);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ valid: false, correct: false, colors: [] });
  }
});

app.get('/reveal', (req, res) => {
  const word = req.session.targetWord;
  if (!word) {
    return res.status(400).json({ error: 'No word set for this session' });
  }
  res.json({ word });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});