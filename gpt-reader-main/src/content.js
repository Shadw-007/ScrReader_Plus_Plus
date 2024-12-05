// content.js
console.log("Hover-to-speech content script loaded!");

document.body.style.border = "5px solid red"; // Visual confirmation of script execution

let msg = new SpeechSynthesisUtterance();
msg.voice = speechSynthesis.getVoices()[0];
console.log("SpeechSynthesis initialized:", speechSynthesis.getVoices());

document.querySelectorAll("p, a, h1, h2, h3").forEach((tag) => {
  console.log("Found element:", tag.tagName);
  tag.addEventListener("mouseenter", (e) => {
    console.log("Mouse entered:", e.target.innerText);
    msg.text = e.target.innerText;
    tag.style.backgroundColor = "yellow";
    speechSynthesis.cancel();
    speechSynthesis.speak(msg);
  });

  tag.addEventListener("mouseleave", () => {
    console.log("Mouse left:", e.target.innerText);
    tag.style.removeProperty("background-color");
    speechSynthesis.cancel();
  });
});
