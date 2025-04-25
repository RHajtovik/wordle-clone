const express = require('express');
const session = require('express-session');
const cors = require('cors');
const WordleGame = require('./wordleGame');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [
    'https://play-wordle.rakun.company',
    'https://main.dld996lhzd3lh.amplifyapp.com',
    'http://localhost:5173'
  ],
  credentials: true 
}));
app.use(express.json());

app.set('trust proxy', 1);

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    //domain: '.rakun.company'
  }
}));

const game = new WordleGame();

app.get('/showHint', (req, res) => {
  const word = req.session.targetWord;

  if (!word) {
    return res.status(400).json({ error: 'No target word in session' });
  }

  const vowels = 'aeiouAEIOU';
  let count = 0;

  for (let char of word) {
    if (vowels.includes(char)) {
      count++;
    }
  }

  res.json({ count })
});

app.get('/random-word', async (req, res) => {
  try {
    const word = await game.pickRandomWord();
    req.session.targetWord = word;
    res.json({ success: true });
  } 
  catch (err) {
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
  } 
  catch (err) {
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