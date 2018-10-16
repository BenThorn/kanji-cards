"use strict";

// ----- Response Handlers -----

// Adds deck to the dropdown menu
var handleAddDeck = function handleAddDeck(xhr) {
  var obj = JSON.parse(xhr.response);

  // Alerts user if there's an error, like no name or already exists
  if (xhr.status === 400) {
    alert(obj.message);
  }

  requestGetDecks(true);
  requestGetDecks(false, true); // To reset messages
  document.querySelector("#deckName").value = "";
};

// Called with parse when we want to insert new decks int he dropdown, and not when
// we want to just update the count
var handleDeck = function handleDeck(xhr, parse) {
  var deckOptions = document.querySelector('#currentDeck');

  if (xhr.status === 200 && parse) {
    parseDeck(xhr, deckOptions);
  } else if (!parse) {
    var obj = JSON.parse(xhr.response);
    var selected = deckOptions.options[deckOptions.selectedIndex].value;
    var count = document.querySelector("#deckCount");

    // Updates the counter
    count.innerHTML = obj.decks[selected].cards.length + " cards in current deck";
  }
};

// Calls the function to parse the list of search results from the Jisho API
var handleSearch = function handleSearch(xhr) {
  var searchResults = document.querySelector("#searchResults");

  if (xhr.status === 200) {
    parseResults(xhr, searchResults);
  }
};

// Only parses out the response if there was a problem (card already exists)
var handleAddCard = function handleAddCard(xhr) {
  if (xhr.status === 400) {
    var obj = JSON.parse(xhr.response);
    document.querySelector("#cardMessage" + obj.identifier).innerHTML = obj.message;
  }
  requestGetDecks(false);
};

// Handles getting and displaying the cards into the flashcard view
var handleGetCards = function handleGetCards(xhr) {
  if (xhr.status === 200) {
    var obj = JSON.parse(xhr.response);
    var searchResults = document.querySelector("#searchResults");
    searchResults.innerHTML = "";
    var cards = obj.cards;

    var flashcard = document.createElement("div");
    flashcard.id = "flashcard";

    var front = document.createElement("p");
    front.id = "front";

    if (cards.length === 0) {
      var message = document.createElement("p");
      message.textContent = 'There are no cards in your deck!';
      searchResults.appendChild(message);
      return false;
    } else if (cards[0].kanji === "") {
      front.textContent = cards[0].kana;
    } else {
      front.textContent = cards[0].kanji;
    }

    flashcard.appendChild(front);

    var flip = function flip() {
      return flipCard(cards, front, flashcard);
    };
    flashcard.addEventListener('click', flip);

    var lastButton = document.createElement('button');
    lastButton.id = 'lastButton';
    lastButton.textContent = 'Last Card';

    var nextButton = document.createElement('button');
    nextButton.id = 'nextButton';
    nextButton.textContent = 'Next Card';

    var counter = document.createElement('div');
    counter.id = 'counter';
    counter.textContent = "1/" + cards.length;

    var next = function next() {
      return nextCard(cards, counter, front, true);
    };
    var last = function last() {
      return nextCard(cards, counter, front, false);
    };

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
var flipCard = function flipCard(cards, front, flashcard) {
  var engSpot = document.querySelector("#englishDef");
  var newContent = '';
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].kanji === front.textContent) {
      newContent = cards[i].kana;
      var engDef = document.createElement("p");
      engDef.textContent = cards[i].english;
      engDef.id = 'englishDef';

      if (!engSpot) {
        flashcard.appendChild(engDef);
      } else {
        engSpot.textContent = cards[i].english;
      }
    } else if (cards[i].kana === front.textContent) {
      // If no kanji, then english will be on other side
      if (cards[i].kanji === "") {
        newContent = cards[i].english;
      } else {
        if (engSpot) {
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
var nextCard = function nextCard(cards, counter, front, forward) {
  var currentIndex = 0;
  var displayIndex = void 0;
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].kanji === front.textContent || cards[i].kana === front.textContent) {
      currentIndex = i;
    }
  }

  // Goes forward or back, while also dodging outOfBounds exceptions
  if (forward) {
    if (currentIndex === cards.length - 1) {
      if (cards[0].kanji === "") {
        front.textContent = cards[0].kana;
      } else {
        front.textContent = cards[0].kanji;
      }

      displayIndex = 1;
    } else {
      if (cards[currentIndex + 1].kanji === "") {
        front.textContent = cards[currentIndex + 1].kana;
      } else {
        front.textContent = cards[currentIndex + 1].kanji;
      }

      displayIndex = currentIndex + 2;
    }
  } else {
    if (currentIndex === 0) {
      if (cards[cards.length - 1].kanji === "") {
        front.textContent = cards[cards.length - 1].kana;
      } else {
        front.textContent = cards[cards.length - 1].kanji;
      }

      displayIndex = cards.length;
    } else {
      if (cards[currentIndex - 1].kanji === "") {
        front.textContent = cards[currentIndex - 1].kana;
      } else {
        front.textContent = cards[currentIndex - 1].kanji;
      }

      displayIndex = currentIndex;
    }
  }

  // Get rid of english if you were on the kana side
  var engSpot = document.querySelector("#englishDef");
  if (engSpot) {
    engSpot.textContent = "";
  }
  // Update counter
  counter.textContent = displayIndex + "/" + cards.length;
};

// ---Response parser methods---

// Parses the response from the Jisho API into search result elements
var parseResults = function parseResults(xhr, searchResults) {
  var obj = JSON.parse(xhr.response);
  searchResults.innerHTML = "";

  if (obj) {
    var resultData = obj.data;
    if (resultData.length === 0) {
      var message = document.createElement('p');
      message.textContent = "No results found.";
      searchResults.appendChild(message);
    } else {
      var result = void 0;
      // Gets three values from Jisho's JSON response: Kanji, Kana, and English
      // Adds a search result to a max of 20

      var _loop = function _loop(i) {
        result = {
          kanji: resultData[i].japanese[0].word,
          kana: resultData[i].japanese[0].reading,
          english: resultData[i].senses[0].english_definitions
          // Adds divs for kanji and kana, taking the first index
          // Adds div with all of the english translations, since there can be 
          // multiple interpretations
        };var resultDiv = document.createElement('div');

        var kanji = document.createElement('div');
        kanji.id = "kanji";
        kanji.textContent = result.kanji;

        var kana = document.createElement('div');
        kana.id = "kana";
        kana.textContent = result.kana;

        var eng = document.createElement('div');
        eng.id = "english";
        var engDefs = "";
        if (result.english.length > 1) {
          for (var _i = 0; _i < result.english.length; _i++) {
            if (_i !== result.english.length - 1) {
              engDefs += result.english[_i] + ", ";
            } else {
              engDefs += result.english[_i];
            }
          }
        } else {
          engDefs = result.english[0];
        }

        eng.textContent = engDefs;

        var addDiv = document.createElement('div');
        var label = document.createElement('label');
        addDiv.id = "addToDeck";
        label.textContent = "Add to Deck";
        var button = document.createElement('button');
        button.textContent = "Add to Deck";

        var message = document.createElement('div');
        message.id = "cardMessage" + (result.kanji ? result.kanji : result.kana); // Indentifies by kana if there's no kanji
        message.className = "cardMessage";

        // Setting up the card data to be sent if the button is clicked
        var data = { kanji: kanji.textContent, kana: kana.textContent, english: eng.textContent };
        var deckOptions = document.querySelector("#currentDeck");
        var addCardRequest = function addCardRequest(e) {
          return requestAddCard(e, deckOptions.options[deckOptions.selectedIndex].value, data);
        };
        button.addEventListener('click', addCardRequest);
        addDiv.appendChild(button);
        addDiv.appendChild(message);

        resultDiv.appendChild(kanji);
        resultDiv.appendChild(kana);
        resultDiv.appendChild(eng);
        resultDiv.appendChild(addDiv);
        resultDiv.id = 'resultDiv';
        searchResults.appendChild(resultDiv);
      };

      for (var i = 0; i < resultData.length; i++) {
        _loop(i);
      }
    }
  }
};

// Parses the API deck array, and makes them selectable on the dropdown.
// Called at the beginning to insert pre-existing decks, and when a deck is created to add the new one.
var parseDeck = function parseDeck(xhr, deckOptions) {
  var obj = JSON.parse(xhr.response);
  var decks = obj.decks;
  deckOptions.innerHTML = "";

  if (obj) {
    for (var i = 0; i < Object.keys(decks).length; i++) {
      var deckName = Object.keys(decks)[i];
      var option = document.createElement("option");

      option.value = deckName;
      option.textContent = deckName;

      var deckNameId = convertDeckName(deckName);

      option.id = deckNameId + 'Option';

      deckOptions.appendChild(option);

      // Switch deck to newly created deck
      document.querySelector("#" + option.id).selected = true;
    }
  }
};

// Helper method to check if there are spaces in the deck name
// Adds underscores so it will work as an ID
var convertDeckName = function convertDeckName(deckName) {
  var deckNameArr = deckName.split(" ");

  var deckNameId = void 0;

  if (deckNameArr.length > 1) {
    for (var i = 0; i < deckNameArr.length; i++) {
      deckNameId += deckNameArr[i];

      if (i !== deckNameArr.length - 1) {
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
var requestGetDecks = function requestGetDecks(parse, changeDecks) {
  if (changeDecks) {
    // Resets the error messages
    var messages = document.getElementsByClassName("cardMessage");

    for (var i = 0; i < messages.length; i++) {
      messages[i].innerHTML = "";
    }
  }
  var xhr = new XMLHttpRequest();
  xhr.open('get', '/getDecks');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = function () {
    return handleDeck(xhr, parse);
  };
  xhr.send();
};

// Sends a POST request to add a deck to the decks object in the API
var requestAddDeck = function requestAddDeck(e, nameForm) {
  var url = '/addDeck';
  var method = 'post';
  var nameField = nameForm.querySelector("#deckName");
  var deckList = document.querySelector("#currentDeck").children;

  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    return handleAddDeck(xhr);
  };

  var formData = "name=" + nameField.value;

  if (/^[a-zA-Z0-9- ,_]*$/.test(nameField.value) === false) {
    alert("Please do not use special characters in your deck's name.");
  } else {
    xhr.send(formData);
  }

  e.preventDefault();

  return false;
};

// Post request to save a card to a specified deck
var requestAddCard = function requestAddCard(e, id, data) {
  var url = '/addCard';
  var method = 'post';

  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    return handleAddCard(xhr);
  };

  // JP chars will turn into ???'s when sent without encoding
  var encodedKanji = encodeURIComponent(data.kanji);
  var encodedKana = encodeURIComponent(data.kana);

  var params = "id=" + id + "&kanji=" + encodedKanji + "&kana=" + encodedKana + "&english=" + data.english;

  xhr.send(params);

  e.preventDefault();
  return false;
};

var requestSearch = function requestSearch(e, searchForm) {
  var term = document.querySelector("#searchField").value;
  var type = document.querySelector("#searchType").value;

  /*  The Jisho search engine can search for both 'actual' and 'literal' terms. If it's actual,
      then it will try to convert the search term to hiragana, if possible. For example, if one searches for
      'same', trying to find the japanese word for same, then it will convert it to 'さめ' (sah-meh) and search for that,
      which actually means 'shark'. In order to search for the literal english characters, you only have to put quotes around
      the term. Searching "same" will now have the first result be '同じ', the correct word meaning 'same, identical'.
  */
  if (type === "english") {
    term = "\"" + term + "\"";
  }
  var url = "/search?" + term;
  var method = 'get';

  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    return handleSearch(xhr);
  };

  xhr.send();

  e.preventDefault();
  return false;
};

var requestCards = function requestCards(e, deckOption) {
  // Encode in case there are spaces in the name
  var id = encodeURIComponent(deckOption);

  var url = "/getCards?" + id;
  var method = 'get';

  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    return handleGetCards(xhr);
  };

  xhr.send();

  e.preventDefault();
  return false;
};

// Mostly just event listener hookups
var init = function init() {
  var searchForm = document.querySelector("#searchForm");
  var viewButton = document.querySelector("#getDecks");
  var addDeckForm = document.querySelector("#addDeckForm");

  var deckOptions = document.querySelector("#currentDeck");

  var searchRequest = function searchRequest(e) {
    return requestSearch(e, searchForm);
  };
  var addDeckRequest = function addDeckRequest(e) {
    return requestAddDeck(e, addDeckForm);
  };
  var getDeckRequest = function getDeckRequest() {
    return requestGetDecks(false, true);
  };
  var getCardRequest = function getCardRequest(e) {
    return requestCards(e, deckOptions.value);
  };

  // Called twice to populate the dropdown and update the counter
  requestGetDecks(true);
  requestGetDecks(false);

  searchForm.addEventListener('submit', searchRequest);
  addDeckForm.addEventListener('submit', addDeckRequest);
  deckOptions.addEventListener('change', getDeckRequest);
  viewButton.addEventListener('click', getCardRequest);
};

window.onload = init;
