class WordleGame {

  async pickRandomWord() {
    let word = '';
    let isValid = false;

    while (!isValid) {
      try {
        const res = await fetch('https://random-word-api.herokuapp.com/word?length=5');
        const [randomWord] = await res.json();
        word = randomWord.toUpperCase();

        const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        console.log('Dictionary API status:', dictRes.status);
        isValid = dictRes.ok;
      } catch (err) {
          console.error('Error fetching word:', err);
      }
    }

    return word;
  }

  async checkGuess(guess, targetWord) {
    const current = guess.toUpperCase();
    const target = targetWord.toUpperCase();;

    try {
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${current}`);
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
        if (current[i] === target[i]) {
          colors[i] = 'green';
          letterCount[current[i]]--;
        }
      }

      // Second pass: Yellow (correct letter, wrong position)
      for (let i = 0; i < 5; i++) {
        if (colors[i] === 'gray' && letterCount[current[i]] > 0) {
          const possibleIndices = [];
      
          // Find all remaining positions where the target has the same letter
          for (let j = 0; j < 5; j++) {
            if (target[j] === current[i] && colors[j] !== 'green') {
              possibleIndices.push(j);
            }
          }
      
          if (possibleIndices.length > 0) {
            // Choose the one with the smallest distance
            const distances = possibleIndices.map(j => Math.abs(j - i));
            const minDistance = Math.min(...distances);
      
            if (minDistance === 1) {
              colors[i] = 'yellow';
            } else if (minDistance === 2) {
              colors[i] = 'orange';
            } else {
              colors[i] = 'red';
            }
      
            letterCount[current[i]]--;
          }
        }
      }

      return {
        valid: true,
        correct: current === target,
        colors,
      };
        
    } catch (err) {
      console.error('Validation error:', err);
      return { valid: false, correct: false, colors: [] };
    }
  }
}

module.exports = WordleGame;