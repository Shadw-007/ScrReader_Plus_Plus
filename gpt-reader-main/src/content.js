"use strict";
// Hover to speech function
let isReading = false;
let currentElement;
let isActivated = false; // Track if user activation has occurred

// Check for speechSynthesis support
if (!("speechSynthesis" in window)) {
  alert("Speech Synthesis is not supported in this browser.");
}

// Activate speech synthesis after user interaction
document.addEventListener("click", () => {
  if (!isActivated) {
    const utterance = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(utterance); // Initial activation
    isActivated = true;
  }
});

// Event listener for mouseover events
document.addEventListener("mouseover", (event) => {
  if (!isReading && isActivated) {
    currentElement = event.target;

    // Ensure the element has readable text
    const text = currentElement.textContent?.trim();
    if (text) {
      highlightElement(currentElement);
      readElement(currentElement);
    }
  }
});

// Event listener for mouseout events
document.addEventListener("mouseout", () => {
  if (currentElement) {
    removeHighlight(currentElement);
    speechSynthesis.cancel();
    isReading = false;
    currentElement = null;
  }
});

// Event listener for keydown events (spacebar)
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (isReading) {
      speechSynthesis.cancel();
      isReading = false;
      removeHighlight(currentElement);
      currentElement = null;
    } else if (currentElement && isActivated) {
      const text = currentElement.textContent?.trim();
      if (text) {
        readElement(currentElement);
      }
    }
  }
});

// Function to visually highlight the hovered element
function highlightElement(element) {
  element.style.backgroundColor = "lightblue";
  element.style.borderRadius = "3px";
  element.style.padding = "7px";
}

// Function to remove the visual highlight
function removeHighlight(element) {
  element.style.backgroundColor = "";
  element.style.borderRadius = "";
  element.style.padding = "";
}

// Function to read the text content of the element
function readElement(element) {
  isReading = true;
  const text = element.textContent.trim();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onend = () => {
    isReading = false;
    removeHighlight(currentElement);
    currentElement = null;
  };

  speechSynthesis.speak(utterance);
}
