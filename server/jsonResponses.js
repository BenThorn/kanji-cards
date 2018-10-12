const deck = require('./deck.js');


const decks = {"Default": new deck.Deck("Default")};

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.end();
};

const getDecksMeta = (request, response) => respondJSONMeta(request, response, 200);

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

const getDecks = (request, response) => {
  const responseJSON = {
    decks,
  };

  return respondJSON(request, response, 200, responseJSON);
};

const getCards = (request, response, id) => {
  const responseJSON = {
     cards: decks[id].cards
  }

  respondJSON(request, response, 200, responseJSON);
}

const addDeck = (request, response, body) => {
  const responseJSON = {
    message: 'Error: Please add a name for your deck.'
  };

  if (!body.name) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if(decks[body.name]){
    responseJSON.message = 'Error: There is already a deck with this name.';
    responseJSON.id = 'alreadyExists';
    return respondJSON(request, response, 400, responseJSON);
  } else {
    decks[body.name] = {};
  }

  decks[body.name] = new deck.Deck(body.name);

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
 
  return respondJSON(request, response, responseCode);
};

const addCard = (request, response, params) => {
  const responseJSON = {
    message: 'Deck succesfully updated'
  };

  const card = {kanji: params.kanji, kana: params.kana, english: params.english};

  // Checking if card is already in the deck
  for(let i = 0; i < decks[params.id].cards.length; i++) {
    if (decks[params.id].cards[i].kanji !== '') {
      if(decks[params.id].cards[i].kanji === params.kanji){
        responseJSON.message = 'Your deck already has this card.';
        responseJSON.identifier = decks[params.id].cards[i].kanji;
        return respondJSON(request, response, 400, responseJSON);
     } // This is required since some entries have no kanji, only kana
    } else if (decks[params.id].cards[i].kana === params.kana){ 
      responseJSON.message = 'Your deck already has this card.';
      responseJSON.identifier = decks[params.id].cards[i].kana;
      return respondJSON(request, response, 400, responseJSON);
    }
  }

  decks[params.id].addCard(card);

  return respondJSON(request, response, 204, responseJSON);
};

const notFoundMeta = (request, response) => {
  respondJSONMeta(request, response, 404);
};

module.exports = {
  getDecks,
  getCards,
  addDeck,
  addCard,
  getDecksMeta,
  notFound,
  notFoundMeta,
};
