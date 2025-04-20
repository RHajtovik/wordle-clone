

class WordleGame {
    constructor() {
        this.targetWord = '';
      }
    
      async pickRandomWord() {
        let word = '';
        let isValid = false;
    
        while (!isValid) {
          try {
            const res = await fetch('https://random-word-api.herokuapp.com/word?length=5');
            const [randomWord] = await res.json();
            word = randomWord.toUpperCase();
    
            const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            isValid = dictRes.ok;
          } catch (err) {
            console.error('Error fetching word:', err);
          }
        }
    
        this.targetWord = word;
      }

  getTargetWord() {
    return this.targetWord;
  }

  async checkGuess(word) {
    const guess = word.toUpperCase();
    const target = this.targetWord.toUpperCase();

    try {
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`);
      const isValidWord = dictRes.ok;

      if (!isValidWord) {
        return { valid: false, correct: false, colors: [] };
      }

      const colors = Array(5).fill('gray');
      const letterCount = {};

      // Count letters in target word
      for (let char of target) {
        letterCount[char] = (letterCount[char] || 0) + 1;
      }

      // First pass: Green (correct position)
      for (let i = 0; i < 5; i++) {
        if (guess[i] === target[i]) {
          colors[i] = 'green';
          letterCount[guess[i]]--;
        }
      }

      // Second pass: Yellow (correct letter, wrong position)
      for (let i = 0; i < 5; i++) {
        if (colors[i] === 'gray' && letterCount[guess[i]] > 0) {
          colors[i] = 'yellow';
          letterCount[guess[i]]--;
        }
      }

      return {
        valid: true,
        correct: guess === target,
        colors,
      };
    } catch (err) {
      console.error('Validation error:', err);
      return { valid: false, correct: false, colors: [] };
    }
  }
}

module.exports = WordleGame;
