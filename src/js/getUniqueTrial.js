// Function to get filename

export const getUniqueTrial = (alreadyAppearedTrials, lastTwoLetters, counterN, counterA, counterV) => {
  const letters = ['N', 'A', 'V'];
  let selectedLetter;

  if (counterA >= 2) {
    letters.splice(letters.indexOf('A'), 1); // Remove 'A' if it has been used 6 times
  }
  if (counterN >= 2) {
    letters.splice(letters.indexOf('N'), 1); // Remove 'N' if it has been used 6 times
  }
  if (counterV >= 2) {
    letters.splice(letters.indexOf('V'), 1); // Remove 'V' if it has been used 6 times
  }

  if (letters.length == 0) {
    letters.push('N', 'A', 'V'); // Reset the letters array 
  }
  console.log(letters);

  // Step 1: Pick a letter not used in lastTwoLetters
  if (lastTwoLetters.length == 2 && lastTwoLetters[0] == lastTwoLetters[1]) {
    const lettersUpdated = letters.filter(letter => letter !== lastTwoLetters[0]);
    selectedLetter = lettersUpdated[Math.floor(Math.random() * lettersUpdated.length)];
  } else {
      selectedLetter = letters[Math.floor(Math.random() * letters.length)];
    }

  if (lastTwoLetters.length == 2) {
    lastTwoLetters.shift();
  }
  // Remove the first element if there are already two letters
  // Add the selected letter to the lastTwoLetters array
  lastTwoLetters.push(selectedLetter);

  // Step 2: Try finding a unique number combination
  let itemName;
  let itemNumbers = [1, 2, 3, 4, 5, 6]; // Array of numbers from 1 to 6
  let selectedItemNr
  do {
    selectedItemNr = itemNumbers[Math.floor(Math.random() * itemNumbers.length)]; // Randomly select a number from the array
    itemNumbers = itemNumbers.filter(num => num !== selectedItemNr); // Remove the selected number from the array to avoid repetition
    console.log('ItemNmbrs:', itemNumbers);
    itemName = `${selectedLetter}_${selectedItemNr}`; // Create the item name
  } while (alreadyAppearedTrials.includes(itemName) && itemNumbers.length != 0); // Check if the item name already exists in the array 

  // Step 3: Push and log
  alreadyAppearedTrials.push(itemName);
  // keep only last two
  //console.log(trial);

  return itemName;
}

