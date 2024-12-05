'use strict';

import './popup.css';

(function() {
  function playGreeting() {
    var greeting = new Audio(chrome.runtime.getURL("greeting.mp3"));
    greeting.play();
  }


  // We want the greeting to play only once unless the user requests it
  chrome.storage.sync.get('firstRun', (data) => {
    if (data.firstRun === undefined || data.firstRun) {
      playGreeting();
      chrome.storage.sync.set({ firstRun: false });
    }
    else {
      chrome.storage.sync.get('playGreeting', (data) => {
        if (data.playGreeting) {
          playGreeting();
        } else {
          var hi = new Audio(chrome.runtime.getURL("hi.mp3"));
          hi.play();
        }
      }
      );
    }
  });

  function handlePlayGreetingClick() {
    playGreeting();
  }

  document.getElementById('play-greeting-button').addEventListener('click', handlePlayGreetingClick);

  console.log("popup.js");

  var please_wait =new Audio(chrome.runtime.getURL("wait.mp3"));// new Audio('/public/greeting.mp3');

  // Listen for messages from the background script
  // The audio response will be returned so we can play it
  chrome.runtime.onMessage.addListener(function(request) {
    if (request.msg === "audio") {
      console.log("Audio received");
      console.log(request.data.audioUrl);
      var audio = new Audio(request.data.audioUrl);
      audio.play();
    }
  });

  function checkApiKey() {
    // We want to validate the api key is set to something and if not, tell the user what to do
    // This could be extended to do error handling or validation that the key works
    let apiKey;
    chrome.storage.sync.get('apiKey', (data) => {
      console.log('API key:', data.apiKey);
      apiKey = data.apiKey;
      if (apiKey !== undefined && apiKey !== ''){
        handleClick();
      }else {
          console.log('No API key');
          var noKey = new Audio(chrome.runtime.getURL("no_key.mp3"));
          noKey.play();
        }
    });
    
  }
let askButton = document.getElementById('ask-button');
let chunks = [];
let mediaRecorder;

// Get audio stream from user's microphone
// Record audio and send it to the background script
// The background script will send it to the OpenAI API

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = function(e) {
      
      let blob = new Blob(chunks, { 'type' : 'audio/wav' });
      console.log("Recorded audio from a user question")
      console.log(blob);
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function() {
        const url = reader.result
        // Uncomment this if you want to test audio was recorded for debugging
        //const audio = new Audio(url);
        //audio.play();
        chrome.runtime.sendMessage(
          {
            type: 'SPEAK',
            payload: {
              audio: url,
            },
          },
          () => {
            console.log("Success");
          }
        );
      }
      
      //  

    };
  });

 askButton.onclick = function() {
   if (mediaRecorder.state === 'recording') {
     console.log("Stopping recording");
     mediaRecorder.stop();
     askButton.textContent = 'Speak a Question';
  } else {
    console.log("Starting recording");
    mediaRecorder.start();
    askButton.textContent = 'Stop Recording';
  }
};

  // Handle the button click for describe page
  function handleClick() {
    // Get the question from the input field
    var question = document.getElementById('question-input').value;
    if (question.trim() === '') {
      // If the question is empty, we will ask a generic question
      question = "I'm using a website and I can't see well, please help me by giving me a short, simple description of the content of the page" ;
    }
    console.log('Question:', question);
    please_wait.play();

    chrome.runtime.sendMessage(
      {
        type: 'READ',
        payload: {
          message: question,
        },
      },
      () => {
        console.log("Success");
      }
    );
  }

  document.getElementById('read-button').addEventListener('click', checkApiKey);
})();

// Question Search
// DOM elements that need access
const searchForm = document.querySelector("#search-form");
const searchFormInput = searchForm.querySelector("input");


//Adding speech recognition (evaluating whether browser supports speech recognition with or without a prefix)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if(SpeechRecognition){
  console.log("Your Browser supports speech Recognition");

  //button shows up in supported browsers and disappears in non supported browsers
  searchForm.insertAdjacentHTML(
    "beforeend",
    '<button type="button"><i class="bx bxs-microphone"></i></button>'
  );
  const micBtn = searchForm.querySelector("button");
  const micIcon = micBtn.querySelector("i");

  //creating a new speech recognition object
  const recognition = new SpeechRecognition();
  recognition.continuous = true; 


  micBtn.addEventListener("click", micBtnClick);
  function micBtnClick() {
    //check the state of the current button
    if (micIcon.classList.contains("bxs-microphone")) {
      //Start Speech Recognition
      recognition.start();
    } else {
      //Stop Speech Recognition
      recognition.stop();
    }
  }

  recognition.addEventListener("start", startSpeechRecognition); // alternative <=> recognition.onstart = function() {...}
  function startSpeechRecognition() {
    micIcon.classList.remove("bxs-microphone");
    micIcon.classList.add("bxs-microphone-off");
    searchFormInput.focus();
    console.log("Speech Recognition Active");
  }
  recognition.addEventListener("end", endSpeechRecognition); // alternative <=> recognition.onend = function() {...}
  function endSpeechRecognition() {
    micIcon.classList.remove("bxs-microphone-off");
    micIcon.classList.add("bxs-microphone");
    searchFormInput.focus();
    console.log("Speech Recognition Disconnected");
  }

  //filling in input box with spoken speech
  recognition.addEventListener("result", resultOfSpeechRecognition); // alternative <=> recognition.onresult = function() {...}
  function resultOfSpeechRecognition(event) {
    const currentResultIndex = event.resultIndex;
    const transcript = event.results[currentResultIndex][0].transcript;
    searchFormInput.value = transcript; // displays what user says. If they change, new speech is displayed

    

    // showing results as soon as search form is submitted
    setTimeout(() =>{
      searchForm.submit();
    }, 750);
  }
}
else{
  console.log("Your Browser does not support speech Recognition");
}
