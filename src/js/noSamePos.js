// Function to check elements did not occurr in the same position in the previous two trials.

export const noSamePos = (newPos, oldPos1, oldPos2) =>{
  
  if (newPos === oldPos1 && newPos === oldPos2) {
      return false; // Found a match at the same index
  }

  return true; // No matches found
}