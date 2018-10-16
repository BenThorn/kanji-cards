// ----- Response Handlers -----

// Adds deck to the dropdown menu
const handleAddDeck = (xhr) => {
  const obj = JSON.parse(xhr.response);

  // Alerts user if there's an error, like no name or already exists
  if(xhr.status === 400) {
    alert(obj.message);
  }

  requestGetDecks(true);
  requestGetDecks(false, true); // To reset messages
  document.querySelector("#deckName").value = "";
}

// Called with parse when we want to insert new decks int he dropdown, and not when
// we want to just update the count
const handleDeck = (xhr, parse) => {
  const deckOptions = document.querySelector('#currentDeck');

  if(xhr.status === 200 && parse) {
    parseDeck(xhr, deckOptions);
  } else if (!parse) {
    const obj = JSON.parse(xhr.response);
    const selected = deckOptions.options[deckOptions.selectedIndex].value;
    const count = document.querySelector("#deckCount");

    // Updates the counter
    count.innerHTML = `${obj.decks[selected].cards.length} cards in current deck`;
  }
};

// Calls the function to parse the list of search results from the Jisho API
const handleSearch = (xhr) => {
  const searchResults = document.querySelector("#searchResults");

  if (xhr.status === 200) {
    parseResults(xhr, searchResults);
  }
  
};

// Only parses out the response if there was a problem (card already exists)
const handleAddCard = (xhr) => {
  if(xhr.status === 400){
    const obj = JSON.parse(xhr.response);
    document.querySelector(`#cardMessage${obj.identifier}`).innerHTML = obj.message;
  }
  requestGetDecks(false);
};

// Handles getting and displaying the cards into the flashcard view
const handleGetCards = (xhr) => {
  if(xhr.status === 200) {
    const obj = JSON.parse(xhr.response);
    const searchResults = document.querySelector("#searchResults");
    searchResults.innerHTML = "";
    const cards = obj.cards;

    const flashcard = document.createElement("div");
    flashcard.id = "flashcard";

    const front = document.createElement("p");
    front.id = "front";

    if (cards.length === 0) {
      const message = document.createElement("p");
      message.textContent = 'There are no cards in your deck!';
      searchResults.appendChild(message);
      return false;
    } else if (cards[0].kanji === ""){
      front.textContent = cards[0].kana;
    } else {
      front.textContent = cards[0].kanji;
    }

    flashcard.appendChild(front);

    const flip = () => flipCard(cards, front, flashcard);
    flashcard.addEventListener('click', flip);

    const lastButton = document.createElement('button');
    lastButton.id = 'lastButton';
    lastButton.textContent = 'Last Card';

    const nextButton = document.createElement('button');
    nextButton.id = 'nextButton';
    nextButton.textContent = 'Next Card';

    const counter = document.createElement('div');
    counter.id = 'counter';
    counter.textContent = `1/${cards.length}`;

    const next = () => nextCard(cards, counter, front, true);
    const last = () => nextCard(cards, counter, front, false);

    nextButton.addEventListener('click', next);
    lastButton.addEventListener('click', last);

    searchResults.appendChild(flashcard);
    searchResults.appendChild(lastButton);
    searchResults.appendChild(counter);
    searchResults.appendChild(nextButton);
  }
};

// Helper methods for the flashcard functionality

// Figures out which card we're on, and switch values accordingly when clicked
const flipCard = (cards, front, flashcard) => {
  const engSpot = document.querySelector("#englishDef");
  let newContent = '';
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].kanji === front.textContent) {
      newContent = cards[i].kana;
      const engDef = document.createElement("p");
      engDef.textContent = cards[i].english;
      engDef.id = 'englishDef';

      if(!engSpot) {
        flashcard.appendChild(engDef);
      } else {
        engSpot.textContent = cards[i].english;
      }
      
    } else if (cards[i].kana === front.textContent) {
      // If no kanji, then english will be on other side
      if (cards[i].kanji === "") {
        newContent = cards[i].english;
      } else {
        if(engSpot) {
          engSpot.textContent = "";
        }
        newContent = cards[i].kanji;
      }
    } else if (cards[i].english === front.textContent) {
      // Will only happen when japanese is kana-only
      newContent = cards[i].kana;
    }
  }

  front.textContent = newContent;
};

// Jumps forward (or back) in the card array, displaying the kanji (or kana) of the next (or last) index
const nextCard = (cards, counter, front, forward) => {
  let currentIndex = 0;
  let displayIndex;
  for (let i = 0; i < cards.length; i++) {
    if(cards[i].kanji === front.textContent || cards[i].kana === front.textContent) {
      currentIndex = i;
    }
  }

  // Goes forward or back, while also dodging outOfBounds exceptions
  if(forward){
    if(currentIndex === cards.length-1) {
      if(cards[0].kanji === "") {
        front.textContent = cards[0].kana;
      } else {
        front.textContent = cards[0].kanji;
      }

      displayIndex = 1;
    } else {
      if(cards[currentIndex + 1].kanji === "") {
        front.textContent = cards[currentIndex + 1].kana;
      } else {
        front.textContent = cards[currentIndex + 1].kanji;
      }

      displayIndex = currentIndex + 2;
    }
  } else {
    if(currentIndex === 0) {
      if(cards[cards.length-1].kanji === "") {
        front.textContent = cards[cards.length-1].kana;
      } else {
        front.textContent = cards[cards.length-1].kanji;
      }

      displayIndex = cards.length;
    } else {
      if(cards[currentIndex - 1].kanji === "") {
        front.textContent = cards[currentIndex - 1].kana;
      } else {
        front.textContent = cards[currentIndex - 1].kanji;
      }

      displayIndex = currentIndex;
    }
  }

  // Get rid of english if you were on the kana side
  const engSpot = document.querySelector("#englishDef");
  if(engSpot) {
    engSpot.textContent = "";
  }
// Update counter
counter.textContent = `${displayIndex}/${cards.length}`;
  
};

// ---Response parser methods---

// Parses the response from the Jisho API into search result elements
const parseResults = (xhr, searchResults) => {
  const obj = JSON.parse(xhr.response);
  searchResults.innerHTML = "";

  if(obj) {
    const resultData = obj.data;
    if (resultData.length === 0){
      const message = document.createElement('p');
      message.textContent = "No results found.";
      searchResults.appendChild(message);
    } else {
      let result;
      // Gets three values from Jisho's JSON response: Kanji, Kana, and English
      // Adds a search result to a max of 20
      for(let i = 0; i < resultData.length; i++){
        result = {
          kanji: resultData[i].japanese[0].word,
          kana: resultData[i].japanese[0].reading,
          english: resultData[i].senses[0].english_definitions
        }
        // Adds divs for kanji and kana, taking the first index
        // Adds div with all of the english translations, since there can be 
        // multiple interpretations
        const resultDiv = document.createElement('div');

        const kanji = document.createElement('div');
        kanji.id = "kanji";
        kanji.textContent = result.kanji;

        const kana = document.createElement('div');
        kana.id = "kana";
        kana.textContent = result.kana;

        const eng = document.createElement('div');
        eng.id = "english";
        let engDefs = "";
        if(result.english.length > 1){
          for (let i = 0; i < result.english.length; i++) {
            if (i !== result.english.length - 1){
              engDefs += result.english[i] + ", ";
            } else {
              engDefs += result.english[i];
            }
          }
        } else {
          engDefs = result.english[0];
        }
        
        eng.textContent = engDefs;

        const addDiv = document.createElement('div');
        const label = document.createElement('label');
        addDiv.id = "addToDeck";
        label.textContent = "Add to Deck";
        const button = document.createElement('button');
        button.textContent = "Add to Deck";

        const message = document.createElement('div');
        message.id = "cardMessage" + (result.kanji ? result.kanji: result.kana); // Indentifies by kana if there's no kanji
        message.className = "cardMessage";

        // Setting up the card data to be sent if the button is clicked
        const data = {kanji: kanji.textContent, kana: kana.textContent, english: eng.textContent};
        const deckOptions = document.querySelector("#currentDeck");
        const addCardRequest = (e) => requestAddCard(e, deckOptions.options[deckOptions.selectedIndex].value, data);
        button.addEventListener('click', addCardRequest);
        addDiv.appendChild(button);
        addDiv.appendChild(message);

        resultDiv.appendChild(kanji);
        resultDiv.appendChild(kana);
        resultDiv.appendChild(eng);
        resultDiv.appendChild(addDiv);
        resultDiv.id = 'resultDiv';
        searchResults.appendChild(resultDiv);
      }
    }
  }
};

// Parses the API deck array, and makes them selectable on the dropdown.
// Called at the beginning to insert pre-existing decks, and when a deck is created to add the new one.
const parseDeck = (xhr, deckOptions) => {
  const obj = JSON.parse(xhr.response);
  const decks = obj.decks;
  deckOptions.innerHTML = "";

  if(obj) {
    for (let i = 0; i < Object.keys(decks).length; i++) {
      const deckName = Object.keys(decks)[i];
      const option = document.createElement("option");
          
      option.value = deckName;
      option.textContent = deckName;

      const deckNameId = convertDeckName(deckName);

      option.id = deckNameId + 'Option';

      deckOptions.appendChild(option);

      // Switch deck to newly created deck
      document.querySelector(`#${option.id}`).selected = true;
    }
    
  }
};

// Helper method to check if there are spaces in the deck name
// Adds underscores so it will work as an ID
const convertDeckName = (deckName) => {
  const deckNameArr = deckName.split(" ");

  let deckNameId;

  if (deckNameArr.length > 1) {
    for(let i = 0; i < deckNameArr.length; i++) {
      deckNameId += deckNameArr[i];

      if (i !== deckNameArr.length-1) {
        deckNameId += "_";
      }
    }
  } else {
    deckNameId = deckName;
  }

  return deckNameId;
};

// ---- API Requests ----

// Shoots a GET request for getting the list of decks from the API
const requestGetDecks = (parse, changeDecks) => {
  if (changeDecks) {
    // Resets the error messages
    const messages = document.getElementsByClassName("cardMessage");

    for(let i = 0; i < messages.length; i++){
      messages[i].innerHTML = "";
    }
  }
  const xhr = new XMLHttpRequest();
  xhr.open('get', '/getDecks');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = () => handleDeck(xhr, parse);
  xhr.send();
};

// Sends a POST request to add a deck to the decks object in the API
const requestAddDeck = (e, nameForm) => {
  const url = '/addDeck';
  const method = 'post';
  const nameField = nameForm.querySelector("#deckName");
  const deckList = document.querySelector("#currentDeck").children;

  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () => handleAddDeck(xhr);

  const formData = `name=${nameField.value}`;

  if (/^[a-zA-Z0-9- ,_]*$/.test(nameField.value) === false) {
    alert("Please do not use special characters in your deck's name.");
  } else {
    xhr.send(formData);
  }

  e.preventDefault();

  return false;
};

// Post request to save a card to a specified deck
const requestAddCard = (e, id, data) => {
  const url = '/addCard';
  const method = 'post';

  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () => handleAddCard(xhr);

  // JP chars will turn into ???'s when sent without encoding
  const encodedKanji = encodeURIComponent(data.kanji);
  const encodedKana = encodeURIComponent(data.kana);

  const params = `id=${id}&kanji=${encodedKanji}&kana=${encodedKana}&english=${data.english}`;

  xhr.send(params);

  e.preventDefault();
  return false;
};

const requestSearch = (e, searchForm) => {
  let term = document.querySelector("#searchField").value;
  const type = document.querySelector("#searchType").value;

  /*  The Jisho search engine can search for both 'actual' and 'literal' terms. If it's actual,
      then it will try to convert the search term to hiragana, if possible. For example, if one searches for
      'same', trying to find the japanese word for same, then it will convert it to 'さめ' (sah-meh) and search for that,
      which actually means 'shark'. In order to search for the literal english characters, you only have to put quotes around
      the term. Searching "same" will now have the first result be '同じ', the correct word meaning 'same, identical'.
  */
  if(type === "english") {
    term = `"${term}"`;
  }
  const url = `/search?${term}`;
  const method = 'get';

  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () => handleSearch(xhr);

  xhr.send();
  
  e.preventDefault();
  return false;
};

const requestCards = (e, deckOption) => {
  // Encode in case there are spaces in the name
  const id = encodeURIComponent(deckOption);

  const url = `/getCards?${id}`;
  const method = 'get';

  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () => handleGetCards(xhr);

  xhr.send();

  e.preventDefault();
  return false;
};

// Mostly just event listener hookups
const init = () => {
  const searchForm = document.querySelector("#searchForm");
  const viewButton = document.querySelector("#getDecks");
  const addDeckForm = document.querySelector("#addDeckForm");

  const deckOptions = document.querySelector("#currentDeck");

  const searchRequest = (e) => requestSearch(e, searchForm);
  const addDeckRequest = (e) => requestAddDeck(e, addDeckForm);
  const getDeckRequest = () => requestGetDecks(false, true);
  const getCardRequest = (e) => requestCards(e, deckOptions.value);

  // Called twice to populate the dropdown and update the counter
  requestGetDecks(true);
  requestGetDecks(false);

  searchForm.addEventListener('submit', searchRequest);
  addDeckForm.addEventListener('submit', addDeckRequest);
  deckOptions.addEventListener('change', getDeckRequest);
  viewButton.addEventListener('click', getCardRequest);
};

window.onload = init;