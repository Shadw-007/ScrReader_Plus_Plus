"use strict";

// Hover to speech function
let isReading = false;
let currentElement;
let isActivated = false; // Track if user activation has occurred
let hoverTimeout; // Timeout to debounce hover events
let activeUtterance = null; // Track the current active utterance

// Check for speechSynthesis support
if (!("speechSynthesis" in window)) {
  alert("Speech Synthesis is not supported in this browser.");
}

// Preload voices to ensure availability
speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  console.log("Voices loaded:", voices);
};

// Activate speech synthesis after user interaction
document.addEventListener("click", () => {
  if (!isActivated) {
    const utterance = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(utterance); // Initial activation
    isActivated = true;
    console.log("Speech synthesis activated.");
  }
});

// Event listener for mouseover events
document.addEventListener("mouseover", (event) => {
  if (isReading || !isActivated) return;

  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    const element = event.target;

    // Prevent re-reading the same element
    if (currentElement === element) return;

    currentElement = element;

    // Ensure the element has readable text
    const text = currentElement.textContent?.trim();
    if (text) {
      highlightElement(currentElement);
      readElement(currentElement);
    }
  }, 200); // Debounce delay
});

// Event listener for mouseout events
document.addEventListener("mouseout", () => {
  clearTimeout(hoverTimeout); // Cancel any pending hover actions
  if (isReading && activeUtterance) {
    speechSynthesis.cancel();
    isReading = false;
    safelyRemoveHighlight(currentElement);
    currentElement = null;
    activeUtterance = null;
  }
});

// Event listener for keydown events (spacebar)
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (isReading && activeUtterance) {
      speechSynthesis.cancel(); // Stop the current utterance
      isReading = false;
      safelyRemoveHighlight(currentElement);
      currentElement = null;
      activeUtterance = null;
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
  if (element) {
    element.style.backgroundColor = "lightblue";
    element.style.borderRadius = "3px";
    element.style.padding = "7px";
  }
}

// Function to remove the visual highlight
function safelyRemoveHighlight(element) {
  if (element) {
    element.style.backgroundColor = "";
    element.style.borderRadius = "";
    element.style.padding = "";
  }
}

// Function to read the text content of the element
function readElement(element) {
  isReading = true;
  const text = element.textContent.trim();

  if (!text) {
    console.error("No text to read.");
    isReading = false;
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;

  // Handle the end of speech
  utterance.onend = () => {
    console.log("Speech ended.");
    isReading = false;
    safelyRemoveHighlight(currentElement);
    currentElement = null;
    activeUtterance = null;
  };

  // Handle speech synthesis errors
  utterance.onerror = (error) => {
    console.error("Speech Synthesis Error:", error);
    isReading = false;
    safelyRemoveHighlight(currentElement);
    currentElement = null;
    activeUtterance = null;
  };

  // Speak the text
  speechSynthesis.speak(utterance);
}
